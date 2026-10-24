import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../utils/webgl';

/**
 * 关键数字滚动：进入视口后从 0 以 easeOutCubic 到位并定格。
 * 保留 U+2212 负号与原始小数位；减动效或不支持 IO 时直接渲染终值。
 * 屏幕阅读器始终读到真实数值（aria-label），动画文本对其隐藏。
 */
export default function CountUp({ value, duration = 1100 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^([−-]?)(\d+)(?:\.(\d+))?$/);
    if (!match || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    const decimals = match[3]?.length ?? 0;
    const target = Number(match[2] + (match[3] ? `.${match[3]}` : ''));
    const format = (current: number) => `${match[1] ? '−' : ''}${current.toFixed(decimals)}`;

    const element = ref.current;
    if (!element) return;
    let raf = 0;
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(progress >= 1 ? value : format(target * eased));
          if (progress < 1) raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(element);
    return () => {
      io.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
