import { useEffect, useRef, useState } from 'react';

/**
 * 进入视口时揭示元素（IntersectionObserver）。
 * 尊重 prefers-reduced-motion：在 CSS 中关闭过渡。
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (opts?.once !== false) io.disconnect();
          } else if (opts?.once === false) {
            setShown(false);
          }
        });
      },
      { threshold: opts?.threshold ?? 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [opts?.threshold, opts?.once]);

  return { ref, shown };
}
