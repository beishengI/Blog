import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'evidence', no: '01', label: '证据' },
  { id: 'diagnosis', no: '02', label: '诊断' },
  { id: 'studies', no: '03', label: '检查' },
  { id: 'protocols', no: '04', label: '协议' },
  { id: 'history', no: '05', label: '经历' },
  { id: 'literature', no: '06', label: '文献' },
  { id: 'contact', no: '07', label: '签发' },
];

/** Fixed report spine: section index + active state. Hidden below 1280px. */
export default function ReportRail() {
  const [active, setActive] = useState('evidence');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = SECTIONS
      .map(section => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.5] }
    );
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <nav className="report-rail" aria-label="报告章节">
      <span className="report-rail__line" aria-hidden="true" />
      {SECTIONS.map(section => (
        <button
          key={section.id}
          type="button"
          className={active === section.id ? 'is-active' : ''}
          aria-current={active === section.id ? 'true' : undefined}
          onClick={() => go(section.id)}
        >
          <span>{section.no}</span>
          <b>{section.label}</b>
        </button>
      ))}
    </nav>
  );
}
