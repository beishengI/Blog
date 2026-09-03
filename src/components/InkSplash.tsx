import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const KEY = 'medai-blog-ink-splash';
const CHARS = ['行', '则', '将', '至'];

/**
 * 「行则将至」毛体进入揭幕(首页,每会话一次)。
 * 通过 portal 挂到 body:Layout 内容区的 relative z-10 包裹层会把整个子树压在
 * header(z-30)之下,portal 保证揭幕层脱离该上下文、真正全屏盖住一切。
 * 节奏:铺纸 → 四字逐字落笔(clip-path 模拟运笔,各 0.9s)→ 朱砂印章落款 → 沉浸后整层上收。
 * 点击任意处跳过;prefers-reduced-motion 直接不渲染;动画全程 CSS,零依赖。
 */
export default function InkSplash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
    if (reduce || seen) return;

    setShow(true);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    // 4.2s 自动进入收起;5.3s 卸载。后台标签页定时器会被节流,
    // 故再以动画结束事件与 visibilitychange 兜底,保证标签页切走再切回也能收尾。
    const t1 = setTimeout(() => setLeaving(true), 4200);
    const t2 = setTimeout(() => setShow(false), 5300);
    const onVis = () => { if (document.visibilityState === 'visible') setLeaving(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (!show) return null;

  const skip = () => setLeaving(true);

  return createPortal(
    <div
      className={`ink-splash ${leaving ? 'ink-splash--leave' : ''}`}
      onClick={skip}
      onAnimationEnd={(e) => { if (e.animationName === 'ink-lift') setShow(false); }}
      role="presentation"
      aria-hidden="true"
    >
      <div className="ink-splash__chars">
        {CHARS.map((c, i) => (
          <span key={c} className="ink-char" style={{ animationDelay: `${0.5 + i * 0.55}s` }}>
            {c}
          </span>
        ))}
        <span className="ink-seal" style={{ animationDelay: '3.2s' }}>
          北省
        </span>
      </div>
    </div>,
    document.body
  );
}
