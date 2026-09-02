import { useEffect, useState } from 'react';

/**
 * 断点表必须与 Tailwind 默认值一致。
 * 否则 JS 判定与 CSS 断点会错位（例如 641–767px 出现"半桌面"态，
 * 导致侧栏在 grid-cols-1 下退化为全宽块）。
 */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

export function useResponsive() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return {
    width: w,
    // 与 CSS 的 md: 对齐：768 以下一律按移动端处理
    isMobile: w < BREAKPOINTS.md,
    isTablet: w >= BREAKPOINTS.md && w < BREAKPOINTS.lg,
    isDesktop: w >= BREAKPOINTS.lg,
  };
}
