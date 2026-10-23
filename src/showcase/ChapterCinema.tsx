import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { projectWorks, workLayerLabels, workStatusLabels, type Work } from '../data/works';
import { StatusStamp, TagRow } from '../components/report/primitives';
import { asset } from './parts';

function chapterWorks(slugs: string[]): Work[] {
  return slugs
    .map(slug => projectWorks.find(work => work.slug === slug))
    .filter((work): work is Work => Boolean(work));
}

/**
 * Scroll-driven horizontal cinema.
 * Desktop (>=1024px): the section sticks and vertical scroll drives a horizontal
 * film strip across all five chapters. Mobile / reduced motion: normal stacked flow.
 */
export default function ChapterCinema() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(min-width: 1024px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPinned(mq.matches && !reduced.matches);
    update();
    mq.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = pin.getBoundingClientRect();
        const total = pin.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const ratio = scrolled / total;
        const maxShift = track.scrollWidth - window.innerWidth;
        track.style.transform = `translate3d(${-ratio * Math.max(0, maxShift)}px, 0, 0)`;
        setProgress(ratio);
        const panels = track.querySelectorAll<HTMLElement>('[data-panel]');
        let index = 0;
        panels.forEach((panel, i) => {
          const center = panel.offsetLeft + panel.offsetWidth / 2;
          const viewCenter = ratio * Math.max(0, maxShift) + window.innerWidth / 2;
          if (center <= viewCenter) index = i;
        });
        setActiveIndex(index);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      track.style.transform = '';
    };
  }, [pinned]);

  const jumpTo = (index: number) => {
    if (!pinned) {
      document.getElementById(`cine-panel-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const pin = pinRef.current;
    if (!pin) return;
    const total = pin.offsetHeight - window.innerHeight;
    const panels = trackRef.current?.querySelectorAll<HTMLElement>('[data-panel]');
    if (!panels || panels.length === 0) return;
    const maxShift = (trackRef.current?.scrollWidth ?? 0) - window.innerWidth;
    const target = panels[index].offsetLeft;
    const ratio = maxShift > 0 ? target / maxShift : 0;
    const top = pin.offsetTop + total * Math.min(1, Math.max(0, ratio));
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section
      className={`cinema ${pinned ? 'is-pinned' : ''}`}
      id="studies-cinema"
      aria-labelledby="cinema-title"
      ref={pinRef}
      style={pinned ? { height: `${chapters.length * 92 + 40}vh` } : undefined}
    >
      <div className="cinema__stage">
        <div className="cinema__topbar shell">
          <div className="cinema__legend">
            <span className="mono-label">CHAIN / 五章</span>
            <h2 className="cinema__title" id="cinema-title">能力链路电影院</h2>
          </div>
          <nav className="cinema__nav" aria-label="章节跳转">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.no}
                type="button"
                className={activeIndex === index ? 'is-active' : ''}
                aria-current={activeIndex === index ? 'true' : undefined}
                onClick={() => jumpTo(index)}
              >
                <b>{chapter.no}</b>
                <span>{chapter.title}</span>
              </button>
            ))}
          </nav>
          <div className="cinema__counter" aria-hidden="true">
            <b>{chapters[activeIndex]?.no ?? '01'}</b>
            <span>/ {String(chapters.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="cinema__viewport">
          <div className="cinema__track" ref={trackRef}>
            {chapters.map((chapter, index) => {
              const works = chapterWorks(chapter.slugs);
              return (
                <article className="cine-panel" data-panel key={chapter.no} id={`cine-panel-${index}`}>
                  <div className="cine-panel__rail" aria-hidden="true">{chapter.no}</div>
                  <header className="cine-panel__head">
                    <span className="cine-panel__no">{chapter.no}</span>
                    <div>
                      <h3 className="cine-panel__title">{chapter.title}</h3>
                      <span className="cine-panel__en">{chapter.en}</span>
                    </div>
                  </header>
                  <p className="cine-panel__lede">{chapter.lede}</p>

                  <div className="cine-panel__works">
                    {works.map(work => {
                      const image = work.evidence.find(item => item.src && !item.src.endsWith('.svg'));
                      return (
                        <Link to={`/work/${work.slug}`} className="cine-card" key={work.slug}>
                          <div className="cine-card__frame">
                            {image?.src ? (
                              <img src={asset(image.src)} alt={image.caption ?? `${work.title} 证据图`} loading="lazy" decoding="async" />
                            ) : (
                              <div className="cine-card__empty" aria-hidden="true">
                                <span>{work.no}</span>
                                <b>{work.shortTitle ?? work.title}</b>
                              </div>
                            )}
                            <span className="cine-card__no">{work.no}</span>
                            <span className="cine-card__status">{workStatusLabels[work.status]}</span>
                          </div>
                          <div className="cine-card__body">
                            <h4>{work.title}</h4>
                            <p>{work.tagline}</p>
                            <div className="cine-card__metrics">
                              {work.metrics.slice(0, 2).map(metric => (
                                <span key={metric.label}>
                                  <b>{metric.value}</b>
                                  <small>{metric.label}</small>
                                </span>
                              ))}
                            </div>
                            <div className="cine-card__foot">
                              <TagRow items={work.stack.slice(0, 3)} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="cine-panel__foot">
                    <StatusStamp status={works[0]?.status ?? 'live'} />
                    <span className="mono-label">{workLayerLabels[works[0]?.layer ?? 'agent']}</span>
                    <span className="mono-label">{works.length} 项证据</span>
                  </div>
                </article>
              );
            })}

            <article className="cine-panel cine-panel--end" data-panel>
              <div className="cine-panel__rail" aria-hidden="true">完</div>
              <div className="cine-end">
                <span className="mono-label">END OF CHAIN</span>
                <p>
                  五章走完，
                  <br />
                  一条链路。
                </p>
                <div className="cine-end__actions">
                  <Link to="/work" className="btn btn--primary">查看全部项目 →</Link>
                  <Link to="/resume" className="btn btn--ghost">简历 →</Link>
                </div>
              </div>
            </article>
          </div>
        </div>

        {pinned && (
          <div className="cinema__progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </div>
    </section>
  );
}
