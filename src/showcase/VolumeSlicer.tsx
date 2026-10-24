import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createVolumeScene, type VolumeScene, type VolumeTheme } from './volume-scene';
import { detectWebGL, hasFinePointer, prefersReducedMotion } from '../utils/webgl';
import { asset } from '../utils/asset';

type Status = 'on' | 'static' | 'off';

interface VolumeMeta {
  dataset: string;
  case: string;
  modality: string;
  labels: string;
  slices: number;
  grid: number;
  tumorSlices: number;
}

const ATLAS_URL = '/showcase/volume/brats-atlas.png';
const META_URL = '/showcase/volume/brats-atlas.json';

const STATUS_TEXT: Record<Status, string> = {
  on: '拖拽旋转 · 聚焦后滚轮 / 方向键切换层面',
  static: '静态帧 · 已尊重减动效偏好',
  off: 'WEBGL 不可用 · 图版模式',
};

function readTheme(): VolumeTheme {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    graphite: read('--graphite', '#12100d'),
    bone: read('--bone', '#ede4d3'),
    red: read('--red-2', '#d4633f'),
    jade: read('--jade', '#4f6f5e'),
    amber: read('--amber', '#b98431'),
  };
}

/**
 * Hero 签名主视觉：灯箱里的一块真实脑体积。
 * 数据 = BraTS2023 T1c 切片 + Lite-Mamba 预测掩码（图集由 scripts/prepare-volume.py 生成）。
 * 三级降级：on（完整交互）/ static（减动效静态帧）/ off（无 WebGL 的 CSS 图版）；
 * 图集缺失时自动退回程序化体数据，不出现错误态。
 */
export default function VolumeSlicer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<VolumeScene | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [status, setStatus] = useState<Status>(() => {
    if (!detectWebGL()) return 'off';
    return prefersReducedMotion() ? 'static' : 'on';
  });
  const [meta, setMeta] = useState<VolumeMeta | null>(null);
  const [metaReady, setMetaReady] = useState(false);
  const [manual, setManual] = useState<number | null>(null);
  const interactive = status === 'on' && hasFinePointer();
  const slices = meta?.slices ?? 48;

  const applyManual = (value: number | null) => {
    const next = value === null ? null : Math.min(1, Math.max(0, value));
    setManual(next);
    sceneRef.current?.setScan(next);
    if (status === 'static') sceneRef.current?.render(1);
  };

  // 真实数据元信息：失败重试一次（新部署时 CDN 可能还没就绪），仍失败才退回程序化体数据
  useEffect(() => {
    let cancelled = false;
    const load = async (attempt: number): Promise<VolumeMeta | null> => {
      try {
        const url = asset(attempt ? `${META_URL}?v=${Date.now()}` : META_URL);
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()) as VolumeMeta;
      } catch {
        if (attempt >= 1) return null;
        await new Promise(resolve => window.setTimeout(resolve, 1200));
        return load(attempt + 1);
      }
    };
    load(0).then(data => {
      if (cancelled) return;
      setMeta(data);
      setMetaReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 场景创建 / 销毁：渲染器构造失败时退化为 CSS 图版，而不是错误态
  useEffect(() => {
    if (status === 'off' || !metaReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: VolumeScene | null = null;
    try {
      scene = createVolumeScene(canvas, {
        slices: meta?.slices ?? 48,
        maxDpr: hasFinePointer() ? 2 : 1.5,
        atlas: meta ? { url: asset(ATLAS_URL), grid: meta.grid } : undefined,
      });
      sceneRef.current = scene;
      scene.resize();
      scene.setTheme(readTheme());
      if (status === 'static') scene.setScan(0.92);
      scene.render(1);
    } catch {
      scene?.dispose();
      sceneRef.current = null;
      setStatus('off');
    }
    return () => {
      sceneRef.current = null;
      scene?.dispose();
    };
  }, [status, metaReady, meta]);

  // 设计系统贯穿到 WebGL：明暗切换时同步 clear color / 色阶 uniform
  useEffect(() => {
    if (status === 'off') return;
    const observer = new MutationObserver(() => {
      sceneRef.current?.setTheme(readTheme());
      if (status === 'static') sceneRef.current?.render(1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, [status]);

  // 尺寸：ResizeObserver 合帧，静态模式下重绘一帧
  useEffect(() => {
    if (status === 'off') return;
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      sceneRef.current?.resize();
      if (status === 'static') sceneRef.current?.render(1);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [status]);

  // 动画循环：只在「可见 + 页面活跃 + 完整模式」下运行
  useEffect(() => {
    if (status !== 'on') return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    let running = false;
    let visible = false;

    const tick = (time: number) => {
      sceneRef.current?.render(time / 1000);
      if (running) raf = window.requestAnimationFrame(tick);
    };
    const sync = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        raf = window.requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        window.cancelAnimationFrame(raf);
      }
    };
    const onVisibility = () => sync();
    const io = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    });
    io.observe(root);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [status]);

  // 滚轮切层：仅在检视区已聚焦时接管，绝不劫持页面滚动
  useEffect(() => {
    if (status !== 'on') return;
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (!root.contains(document.activeElement)) return;
      event.preventDefault();
      applyManual((manual ?? 0.5) + (event.deltaY > 0 ? 0.05 : -0.05));
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [status, manual]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    rootRef.current?.focus();
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const last = dragRef.current;
    if (!last) return;
    sceneRef.current?.nudge(event.clientX - last.x, event.clientY - last.y);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };
  const endDrag = () => {
    dragRef.current = null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, number> = {
      ArrowUp: 0.05,
      ArrowRight: 0.05,
      ArrowDown: -0.05,
      ArrowLeft: -0.05,
    };
    const delta = deltas[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    applyManual((manual ?? 0.5) + delta);
  };

  const source = meta ? 'brats' : 'procedural';
  const note = meta
    ? `BraTS2023 · ${meta.modality} + 预测掩码 · 公开脱敏数据`
    : '程序化体数据 · 无真实患者数据';

  return (
    <div
      ref={rootRef}
      className={`volume volume--${status}`}
      data-webgl={status}
      data-source={source}
      role="group"
      aria-label={`体切片扫描器：${slices} 层${meta ? '真实 T1c 影像与 Lite-Mamba 预测掩码' : '程序化影像'}切片堆叠成体积，朱红扫描面逐层切换。${STATUS_TEXT[status]}`}
      tabIndex={status === 'on' ? 0 : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      {status !== 'off' && <canvas ref={canvasRef} className="volume__canvas" aria-hidden="true" />}
      {status === 'off' && (
        <div className="volume__fallback" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} style={{ transform: `translateY(${(index - 3) * 14}px)` }} />
          ))}
          <i />
        </div>
      )}

      <span className="lightbox__corner lightbox__corner--tl" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--tr" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--bl" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--br" aria-hidden="true" />

      <div className="lightbox__top">
        <span>W-00 · VOLUME STUDY</span>
        <span>{meta ? `${meta.slices} SLICES / T1c + SEG` : 'PROCEDURAL / GLSL'}</span>
      </div>

      <div className="volume__hud">
        <span className="volume__note">{note}</span>
        {meta && (
          <span className="volume__legend" aria-hidden="true">
            <i className="volume__swatch volume__swatch--net" /> NET
            <i className="volume__swatch volume__swatch--ed" /> ED
            <i className="volume__swatch volume__swatch--et" /> ET
          </span>
        )}
        {status !== 'off' && (
          <div className="volume__controls">
            <label className="volume__scan">
              <span>SCAN</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((manual ?? 0.5) * 100)}
                aria-label="扫描深度"
                onChange={event => applyManual(Number(event.target.value) / 100)}
              />
            </label>
            <button
              type="button"
              className="volume__auto"
              aria-pressed={manual === null}
              onClick={() => applyManual(null)}
            >
              {manual === null ? 'AUTO' : '复位'}
            </button>
          </div>
        )}
        <span className="volume__hint">{STATUS_TEXT[status]}</span>
      </div>
    </div>
  );
}
