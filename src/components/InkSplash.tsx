import { useEffect, useState } from 'react';

const KEY = 'medai-blog-ink-splash';
const CHARS = ['行', '则', '将', '至'];

/**
 * 「行则将至」毛体进入揭幕(首页,每会话一次)。
 * 节奏:铺纸 → 四字逐字落笔(clip-path 模拟运笔)→ 朱砂印章落款 → 整层向上收起。
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
    // 2.4s 自动进入收起;3.05s 卸载
    const t1 = setTimeout(() => setLeaving(true), 2400);
    const t2 = setTimeout(() => setShow(false), 3050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  const skip = () => setLeaving(true);

  return (
    <div
      className={`ink-splash ${leaving ? 'ink-splash--leave' : ''}`}
      onClick={skip}
      role="presentation"
      aria-hidden="true"
    >
      <div className="ink-splash__chars">
        {CHARS.map((c, i) => (
          <span key={c} className="ink-char" style={{ animationDelay: `${0.35 + i * 0.32}s` }}>
            {c}
          </span>
        ))}
        <span className="ink-seal" style={{ animationDelay: '1.9s' }}>
          北省
        </span>
      </div>
    </div>
  );
}
