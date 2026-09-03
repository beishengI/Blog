import { useRef, type ReactNode, type MouseEvent } from 'react';

/**
 * 磁吸微交互(参考 amicro magnetic):子元素随光标轻微偏移,离开回弹。
 * 仅精确指针(pointer: fine)且未开启减动效时生效;触摸设备原样渲染。
 */
export default function Magnetic({
  children,
  strength = 0.22,
  className = '',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;
    } catch { /* ignore */ }
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${
      (e.clientY - r.top - r.height / 2) * strength
    }px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}
