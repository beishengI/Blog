import { useEffect, useRef } from 'react';

interface DodgeTitleProps {
  /** 语义断行：每项一行，字符会按指针距离躲避 */
  lines: string[];
  className?: string;
}

/**
 * ① 字符躲避：指针进入标题时，每个字符按与指针的距离反向位移（rAF 插值）。
 * 只在指针悬停期间运行动画；reduced-motion 直接不绑定，字符保持静止。
 * 拍立得的显影完全交给 CSS（:hover / :focus-within），因此无 JS 也可用。
 */
export default function DodgeTitle({ lines, className = '' }: DodgeTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const chars = Array.from(root.querySelectorAll<HTMLSpanElement>('[data-ch]'));
    if (chars.length === 0) return;

    let raf = 0;
    let live = false;
    const cur = chars.map(() => ({ x: 0, y: 0 }));
    const target = chars.map(() => ({ x: 0, y: 0 }));
    const centers = chars.map(() => ({ x: 0, y: 0 }));

    const cache = () => {
      chars.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        centers[index].x = rect.left + rect.width / 2;
        centers[index].y = rect.top + rect.height / 2;
      });
    };

    const step = () => {
      let moving = false;
      chars.forEach((el, index) => {
        const current = cur[index];
        const next = target[index];
        current.x += (next.x - current.x) * 0.22;
        current.y += (next.y - current.y) * 0.22;
        if (Math.abs(next.x - current.x) > 0.05 || Math.abs(next.y - current.y) > 0.05) moving = true;
        el.style.transform = 'translate3d(' + current.x.toFixed(2) + 'px,' + current.y.toFixed(2) + 'px,0)';
      });
      raf = moving || live ? window.requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!raf) raf = window.requestAnimationFrame(step);
    };

    const onEnter = () => {
      live = true;
      cache();
      start();
    };

    const onMove = (event: PointerEvent) => {
      chars.forEach((el, index) => {
        const dx = centers[index].x - event.clientX;
        const dy = centers[index].y - event.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const push = Math.max(0, 1 - distance / 190) * 9;
        target[index].x = (dx / distance) * push;
        target[index].y = (dy / distance) * push;
      });
      start();
    };

    const onLeave = () => {
      live = false;
      target.forEach(item => {
        item.x = 0;
        item.y = 0;
      });
      start();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      chars.forEach(el => {
        el.style.transform = '';
      });
    };
  }, []);

  return (
    <h2 ref={ref} className={'jp-dodge__title ' + className}>
      {lines.map((line, lineIndex) => (
        <span className="jp-dodge__line" key={lineIndex}>
          {Array.from(line).map((ch, charIndex) => (
            <span className="jp-dodge__ch" data-ch key={charIndex}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
