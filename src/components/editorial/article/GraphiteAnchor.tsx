import { useEffect, useRef } from 'react';
import type { ArticleAnchor } from '../../../data/editorial';

/**
 * 情绪锚点 B（S07）：石墨暗室 + 手电光斑（③）。
 *
 * 约束：
 * - pointermove 只更新 CSS 变量（--ja-sx / --ja-sy / --ja-torch），rAF 里按 0.14 插值，
 *   不逐帧读 scroll；
 * - 只在区块可见时才挂监听（IntersectionObserver）；
 * - prefers-reduced-motion 或 (pointer: coarse) 时完全不挂监听：
 *   涂鸦以静态低透明度显影，文字始终可读，不承载唯一信息。
 */
export default function GraphiteAnchor({ anchor }: { anchor: ArticleAnchor }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return;

    const state = { tx: 0, ty: 0, cx: 0, cy: 0, raf: 0, visible: false, bound: false };

    const apply = () => {
      section.style.setProperty('--ja-sx', state.cx.toFixed(1) + 'px');
      section.style.setProperty('--ja-sy', state.cy.toFixed(1) + 'px');
    };

    const tick = () => {
      const dx = state.tx - state.cx;
      const dy = state.ty - state.cy;
      if (Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35) {
        state.cx = state.tx;
        state.cy = state.ty;
        apply();
        state.raf = 0;
        return;
      }
      state.cx += dx * 0.14;
      state.cy += dy * 0.14;
      apply();
      state.raf = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (!state.visible) return;
      const rect = section.getBoundingClientRect();
      state.tx = event.clientX - rect.left;
      state.ty = event.clientY - rect.top;
      if (!section.classList.contains('is-live')) {
        // 光斑第一次出现时直接落到指针，之后的移动才有 0.14 的延迟跟随
        state.cx = state.tx;
        state.cy = state.ty;
        section.classList.add('is-live');
      }
      section.style.setProperty('--ja-torch', '1');
      if (!state.raf) state.raf = window.requestAnimationFrame(tick);
    };

    const onEnter = () => {
      if (state.visible) section.classList.add('is-live');
    };

    const onLeave = () => {
      section.style.setProperty('--ja-torch', '0');
      section.classList.remove('is-live');
    };

    const bind = () => {
      if (state.bound) return;
      state.bound = true;
      section.addEventListener('pointermove', onMove, { passive: true });
      section.addEventListener('pointerenter', onEnter);
      section.addEventListener('pointerleave', onLeave);
    };

    const unbind = () => {
      if (!state.bound) return;
      state.bound = false;
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerenter', onEnter);
      section.removeEventListener('pointerleave', onLeave);
      onLeave();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') {
      state.visible = true;
      bind();
    } else {
      io = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          state.visible = entry.isIntersecting;
          if (entry.isIntersecting) bind();
          else unbind();
        },
        { threshold: 0.2 }
      );
      io.observe(section);
    }

    return () => {
      io?.disconnect();
      unbind();
      if (state.raf) window.cancelAnimationFrame(state.raf);
    };
  }, []);

  return (
    <section className="ja-dark" ref={sectionRef} aria-label="情绪锚点：可信度边界">
      <div className="ja-dark__frame" aria-hidden="true" />

      <div className="ja-dark__doodles" aria-hidden="true">
        <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" focusable="false">
          <g className="ja-dark__fiber">
            <path d="M 40 690 C 180 676, 420 700, 660 686 S 1080 668, 1180 690" />
            <path d="M 30 96 C 260 82, 520 104, 760 92 S 1040 80, 1170 96" opacity=".5" />
            <path d="M 620 40 C 660 160, 610 300, 650 420 S 600 640, 636 740" opacity=".35" />
          </g>

          <g className="ja-dark__pencil" transform="translate(120 430)">
            <path d="M 92 4 C 146 2 192 48 190 100 C 188 152 146 196 92 194 C 38 192 -4 150 -2 98 C 0 46 38 6 92 4 Z" />
            <path d="M 50 46 C 74 24 118 24 140 50 C 158 72 156 112 130 132 C 104 152 64 146 46 120 C 30 96 34 64 50 46 Z" opacity=".55" />
            <path d="M 92 4 L 92 194 M -2 98 L 190 98" opacity=".22" />
            <path d="M 122 76 C 134 84 138 98 132 112" opacity=".7" />
            <path d="M 148 132 C 168 116, 196 124, 210 142" opacity=".5" />
          </g>

          <g className="ja-dark__pencil ja-dark__pencil--soft" transform="translate(880 150) scale(.78)">
            <path d="M 60 4 L 74 44 L 118 44 L 82 70 L 96 112 L 60 86 L 24 112 L 38 70 L 2 44 L 46 44 Z" />
            <path d="M 138 26 C 150 34, 152 48, 142 58" opacity=".5" />
            <path d="M 128 70 L 132 96" opacity=".4" />
          </g>

          <g className="ja-dark__pencil ja-dark__pencil--soft" transform="translate(880 470)">
            <path d="M 74 6 C 116 4 152 36 150 76 C 148 116 112 146 74 144 C 36 142 2 112 4 72 C 6 34 38 8 74 6 Z" opacity=".7" />
            <path d="M 60 22 C 92 16 124 34 126 62 C 128 88 104 112 76 110 C 50 108 32 86 34 60" />
            <path d="M 144 104 C 166 96, 186 106, 190 124" opacity=".5" />
          </g>

          <g className="ja-dark__scribble">
            <text x="150" y="392">凌晨三点，第四版。</text>
            <text x="760" y="300">最像读片的一篇。</text>
            <text x="820" y="650">这杯咖啡凉了两次。</text>
          </g>
        </svg>
      </div>

      <div className="ja-dark__torch" aria-hidden="true" />

      <div className="ja-dark__inner">
        <div className="ja-dark__meta">
          <span className="ja-dark__label">{anchor.label}</span>
          <span className="ja-dark__hand">石墨暗室 / DARKROOM</span>
        </div>
        <blockquote className="ja-dark__quote">
          <p>{anchor.quote}</p>
        </blockquote>
        <p className="ja-dark__note">{anchor.note}</p>
        <p className="ja-dark__hint">
          在暗处移动指针，照亮纸的背面。
          <span className="ja-dark__hint-static"> 触摸端与减弱动效下，铅笔痕以静态显影。</span>
        </p>
      </div>
    </section>
  );
}
