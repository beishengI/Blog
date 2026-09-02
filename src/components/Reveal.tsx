import { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

/** 滚动揭示容器：进入视口后淡入上移，支持错峰延迟。 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
