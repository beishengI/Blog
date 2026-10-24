import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, type Location } from 'react-router-dom';
import { prefersReducedMotion } from '../utils/webgl';

/**
 * 原生 View Transitions 路由转场。
 * 只有「API 存在 + 非减动效 + pathname 变化」才进入转场分支；
 * 其余情况直接切换展示位置，行为与改造前完全一致。
 * 转场只命名 #main，报头与报告侧栏不参与快照。
 */
/** 结构化最小类型：避免不同类型包之间 ViewTransition 全局声明不一致 */
type ActiveTransition = { skipTransition: () => void; finished: Promise<void> };

export function useLocationTransition(): Location {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const activeRef = useRef<ActiveTransition | null>(null);

  useEffect(() => {
    if (location === displayLocation) return;
    if (location.pathname === displayLocation.pathname) {
      // 同页查询串 / hash 变化（检索、锚点）不做整页转场
      setDisplayLocation(location);
      return;
    }
    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      setDisplayLocation(location);
      return;
    }

    activeRef.current?.skipTransition();
    const transition = document.startViewTransition(() => {
      flushSync(() => setDisplayLocation(location));
    });
    activeRef.current = transition;
    // skipTransition 会让 finished reject；吞掉以避免未处理拒绝
    transition.finished.catch(() => undefined);

    return () => {
      if (activeRef.current === transition) activeRef.current = null;
    };
  }, [location, displayLocation]);

  return displayLocation;
}
