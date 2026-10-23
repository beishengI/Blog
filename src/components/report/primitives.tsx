import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { workStatusLabels, type WorkStatus } from '../../data/works';

/* The personal symbol: a slice frame with a red corner and scan line. */
export function SliceMark({
  label = 'BS',
  size = 'md',
  ghost = false,
  className = '',
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  ghost?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`slice-mark ${size !== 'md' ? `slice-mark--${size}` : ''} ${ghost ? 'slice-mark--ghost' : ''} ${className}`}
      aria-hidden="true"
    >
      <span className="slice-mark__label">{label}</span>
    </span>
  );
}

export function Seal({
  lines = ['张栋栋', '之印'],
  size = 'md',
  label,
}: {
  lines?: string[];
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  return (
    <span className={`seal ${size !== 'md' ? `seal--${size}` : ''}`} aria-label={label ?? `${lines.join('')}印章`} role="img">
      {lines.map(line => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

export function Stamp({
  children,
  tone = 'default',
  dot = false,
}: {
  children: ReactNode;
  tone?: 'default' | 'live' | 'iterating' | 'archived' | 'red' | 'pending';
  dot?: boolean;
}) {
  return (
    <span className={`stamp ${tone !== 'default' ? `stamp--${tone}` : ''}`}>
      {dot && <span className="stamp__dot" />}
      {children}
    </span>
  );
}

export function statusTone(status: WorkStatus): 'live' | 'iterating' | 'archived' {
  return status;
}

export function StatusStamp({ status }: { status: WorkStatus }) {
  return <Stamp tone={statusTone(status)} dot>{workStatusLabels[status]}</Stamp>;
}

export function SectionMark({
  no,
  title,
  en,
  aside,
  id,
}: {
  no: string;
  title: string;
  en?: string;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className="section-mark" id={id}>
      <span className="section-mark__no">{no}</span>
      <h2 className="section-mark__title">{title}</h2>
      {en && <span className="section-mark__en">{en}</span>}
      <span className="section-mark__rule" aria-hidden="true" />
      {aside && <span className="section-mark__aside">{aside}</span>}
    </div>
  );
}

export function Metric({
  value,
  unit,
  label,
  source,
  href,
  small = false,
}: {
  value: string;
  unit?: string;
  label: string;
  source?: string;
  href?: string;
  small?: boolean;
}) {
  const body = (
    <>
      <span className={`metric__value ${small ? 'metric__value--sm' : ''}`}>
        {value}
        {unit && <span className="metric__unit">{unit}</span>}
      </span>
      <span className="metric__label">{label}</span>
      {source && <span className="metric__source">来源 · {source}</span>}
    </>
  );
  return href ? (
    <Link to={href} className="metric">
      {body}
    </Link>
  ) : (
    <span className="metric">{body}</span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function TagRow({ items }: { items: string[] }) {
  return (
    <span className="tag-row">
      {items.map(item => (
        <Tag key={item}>{item}</Tag>
      ))}
    </span>
  );
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function ReportHead({
  eyebrow,
  title,
  lead,
  meta,
  aside,
  titleClassName = '',
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  titleClassName?: string;
}) {
  return (
    <header className="report-head">
      <div className="report-head__row">
        <div>
          <div className="report-eyebrow">{eyebrow}</div>
          <h1 className={`report-title ${titleClassName}`}>{title}</h1>
          {lead && <p className="report-lead">{lead}</p>}
        </div>
        {aside && <div>{aside}</div>}
      </div>
      {meta && <div className="report-meta" style={{ marginTop: 18 }}>{meta}</div>}
    </header>
  );
}

export function PageHead({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="page-head__row">
        <div>
          <div className="report-eyebrow">{eyebrow}</div>
          <h1 className="page-head__title">{title}</h1>
          {lead && <p className="page-head__lead">{lead}</p>}
        </div>
        {aside}
      </div>
    </header>
  );
}
