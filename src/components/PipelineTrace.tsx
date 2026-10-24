import type { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

/**
 * 能力链路描画：进入视口后脊线以 dashoffset 描画，节点错峰点亮。
 * 桌面为顶部水平脊线，移动端为左侧垂直脊线；减动效下完全不出现。
 */
export default function PipelineTrace({ children }: { children: ReactNode }) {
  const { ref, shown } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className={`pipeline-trace ${shown ? 'is-traced' : ''}`}>
      <svg
        className="pipeline-trace__spine pipeline-trace__spine--h"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <line x1="0" y1="1" x2="100" y2="1" pathLength={100} />
      </svg>
      <svg
        className="pipeline-trace__spine pipeline-trace__spine--v"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <line x1="1" y1="0" x2="1" y2="100" pathLength={100} />
      </svg>
      {children}
    </div>
  );
}
