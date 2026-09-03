import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const KEY = 'medai-blog-ink-splash';
const CHARS = ['行', '则', '将', '至'];

/**
 * 「行则将至」毛体进入揭幕(首页,每会话一次)。
 * portal 挂 body 保证全屏盖住一切;收束为古代卷轴形式:纸面被底轴自下而上卷起。
 * 期间锁定 body 滚动(右侧滚动条随之隐藏);点击跳过;reduced-motion 不渲染。
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
    const t1 = setTimeout(() => setLeaving(true), 4200);
    const t2 = setTimeout(() => setShow(false), 5400);
    const onVis = () => { if (document.visibilityState === 'visible') setLeaving(true); };
    document.addEventListener('visibilitychange', onVis);
    // 注意:这里刻意不在 cleanup 里清除 t1/t2——StrictMode(dev)会模拟一次
    // 卸载-重挂,重挂时因 flag 已置位提前返回,若清掉定时器将永远不会收束。
    // 页面卸载时定时器随之销毁,无泄漏;后台标签页的节流由 visibilitychange 兜底。
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // 锁滚动独立成 effect:只在揭幕显示期间生效,StrictMode 重挂亦能恢复
  useEffect(() => {
    if (!show) return;
    document.documentElement.classList.add('ink-locked');
    return () => document.documentElement.classList.remove('ink-locked');
  }, [show]);

  if (!show) return null;

  const skip = () => setLeaving(true);

  return createPortal(
    <div
      className={`ink-splash ${leaving ? 'ink-splash--leave' : ''}`}
      onClick={skip}
      onAnimationEnd={(e) => { if (e.animationName === 'scroll-close') setShow(false); }}
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
      {/* 卷轴收束:上轴恒在纸顶,底轴自下而上将纸面卷起 */}
      <div className="ink-roller ink-roller--top" />
      <div className="ink-roller ink-roller--bottom" />
    </div>,
    document.body
  );
}
