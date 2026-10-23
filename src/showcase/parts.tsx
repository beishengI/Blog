import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { film, type FilmMeta } from '../data/showcase';
import { projectWorks, type Work } from '../data/works';
import { playScanTone } from '../utils/sound';
import Icon from '../components/Icon';
import { StatusStamp, Tag } from '../components/report/primitives';

export function asset(path: string): string {
  if (!path) return '';
  if (/^(https?:|data:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

type CursorPos = { x: number; y: number } | null;

function useCursor() {
  const [pos, setPos] = useState<CursorPos>(null);
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    });
  };
  return { pos, onPointerMove, onPointerLeave: () => setPos(null) };
}

function Crosshair({ pos }: { pos: CursorPos }) {
  if (!pos) return null;
  return (
    <>
      <span className="media-cross media-cross--x" style={{ left: `${pos.x}%` }} aria-hidden="true" />
      <span className="media-cross media-cross--y" style={{ top: `${pos.y}%` }} aria-hidden="true" />
      <span className="media-cross__coord" aria-hidden="true">
        X {String(Math.round(pos.x)).padStart(2, '0')} / Y {String(Math.round(pos.y)).padStart(2, '0')}
      </span>
    </>
  );
}

export function FilmPlayer({ meta = film }: { meta?: FilmMeta }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleId = useId();
  const cursor = useCursor();

  useEffect(() => {
    if (!playing) return;
    const video = videoRef.current;
    if (!video) return;
    const attempt = video.play();
    if (attempt) attempt.catch(() => { /* 用户点击已授权；失败时保留 controls */ });
  }, [playing]);

  // Hero / mobile poster can request playback from outside the player.
  useEffect(() => {
    const handler = () => {
      if (!meta.available) return;
      setFailed(false);
      setPlaying(true);
    };
    window.addEventListener('bs-play-film', handler);
    return () => window.removeEventListener('bs-play-film', handler);
  }, [meta.available]);

  const start = () => {
    if (!meta.available) return;
    setPlaying(true);
    playScanTone('open');
  };

  return (
    <div
      className="lightbox"
      id="hero-viewer"
      aria-labelledby={titleId}
      onPointerMove={cursor.onPointerMove}
      onPointerLeave={cursor.onPointerLeave}
    >
      {!playing || failed ? (
        <img className="lightbox__poster" src={asset(meta.poster)} alt={`${meta.title} · 影片海报`} width={1600} height={900} />
      ) : (
        <video
          ref={videoRef}
          className="lightbox__video"
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={asset(meta.poster)}
          aria-label={`${meta.title}，${meta.duration}`}
          onError={() => setFailed(true)}
        >
          <source src={asset(meta.src)} type="video/mp4" />
          你的浏览器不支持 HTML5 视频。
        </video>
      )}

      <div className="lightbox__veil" aria-hidden="true" />
      <div className="lightbox__scan" aria-hidden="true" />
      {!playing && <Crosshair pos={cursor.pos} />}
      <span className="lightbox__corner lightbox__corner--tl" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--tr" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--bl" aria-hidden="true" />
      <span className="lightbox__corner lightbox__corner--br" aria-hidden="true" />

      <div className="lightbox__top">
        <span id={titleId}>P-00 · INTRO FILM</span>
        <span>{meta.subtitle}</span>
      </div>

      {!playing && (
        <button
          type="button"
          className="lightbox__play"
          onClick={start}
          disabled={!meta.available}
          aria-label={meta.available ? `播放介绍片，${meta.duration}` : '介绍片正在渲染'}
        >
          <span className="lightbox__play-icon">
            <Icon name={meta.available ? 'play' : 'film'} size={22} />
          </span>
          <span className="lightbox__play-label">
            {meta.available ? `播放介绍片 ${meta.duration}` : '影片渲染中'}
          </span>
          <span className="lightbox__play-sub">
            {meta.available ? '音效设计 · 可暂停 / 全屏' : '稍后再来'}
          </span>
        </button>
      )}

      <div className="lightbox__meta">
        <span><b>张栋栋</b> / ZHANG DONGDONG</span>
        <span>STUDY P-00</span>
        <span>{meta.available ? 'SOUND ON · CLICK TO PLAY' : 'POSTER ONLY · VIDEO PENDING'}</span>
      </div>
    </div>
  );
}

export function StudyPlate({ work }: { work: Work }) {
  const image = work.evidence.find(
    item => (item.kind === 'image' || item.kind === 'diagram') && item.src && !item.src.endsWith('.svg')
  );
  const firstMetric = work.metrics[0];
  const secondMetric = work.metrics[1];
  const cursor = useCursor();

  if (image?.src) {
    return (
      <div
        className="plate plate--paper"
        style={{ aspectRatio: '16 / 9' }}
        onPointerMove={cursor.onPointerMove}
        onPointerLeave={cursor.onPointerLeave}
      >
        <Crosshair pos={cursor.pos} />
        <img
          src={asset(image.src)}
          alt={image.caption ?? `${work.title} 证据图`}
          loading="eager"
          decoding="async"
          width={1600}
          height={900}
        />
        <span className="plate__corner plate__corner--tl" aria-hidden="true" />
        <span className="plate__corner plate__corner--tr" aria-hidden="true" />
        <span className="plate__corner plate__corner--bl" aria-hidden="true" />
        <span className="plate__corner plate__corner--br" aria-hidden="true" />
        <span className="plate__badge">{image.redacted ? '示意 / REDACTED' : '证据 / EVIDENCE'}</span>
      </div>
    );
  }

  return (
    <div
      className="study-plate"
      style={{ aspectRatio: '16 / 9' }}
      onPointerMove={cursor.onPointerMove}
      onPointerLeave={cursor.onPointerLeave}
    >
      <Crosshair pos={cursor.pos} />
      <div className="study-plate__grid" aria-hidden="true" />
      <div className="study-plate__top">
        <span>{work.no} · {work.layer.toUpperCase()}</span>
        <span>{work.period}</span>
      </div>
      <div className="study-plate__body">
        <span className="study-plate__no">{work.no}</span>
        <h3>{work.shortTitle ?? work.title}</h3>
        <p>{work.role}</p>
        <div className="study-plate__metrics">
          {firstMetric && (
            <span>
              <b>{firstMetric.value}</b>
              <small>{firstMetric.label}</small>
            </span>
          )}
          {secondMetric && (
            <span>
              <b>{secondMetric.value}</b>
              <small>{secondMetric.label}</small>
            </span>
          )}
        </div>
      </div>
      <span className="study-plate__seal">证据<br />待展开</span>
    </div>
  );
}

type ActiveStudy = 'film' | string;

export function HeroViewer({
  active,
  onChange,
}: {
  active: ActiveStudy;
  onChange: (next: ActiveStudy) => void;
}) {
  const baseId = useId();
  const tabs = [{ id: 'film', label: 'P-00 介绍片' }, ...projectWorks.map(work => ({ id: work.slug, label: `${work.no} ${work.shortTitle ?? work.title}` }))];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === active));
  const work = projectWorks.find(item => item.slug === active);

  const select = (index: number) => {
    const next = tabs[index];
    if (!next) return;
    onChange(next.id);
    playScanTone('tick');
    tabRefs.current[index]?.focus();
  };

  return (
    <div className="hero__viewer">
      <div
        className="study-tabs"
        role="tablist"
        aria-label="检查列表：个人介绍片与 7 个项目"
        onKeyDown={event => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            select((activeIndex + 1) % tabs.length);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            select((activeIndex - 1 + tabs.length) % tabs.length);
          } else if (event.key === 'Home') {
            event.preventDefault();
            select(0);
          } else if (event.key === 'End') {
            event.preventDefault();
            select(tabs.length - 1);
          }
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={node => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={tab.id === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={tab.id === active ? 0 : -1}
            className="study-tab"
            onClick={() => select(index)}
          >
            <span className="study-tab__no">{String(index).padStart(2, '0')}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        className="hero__panel"
      >
        {active === 'film' ? <FilmPlayer /> : work ? <StudyPlate work={work} /> : <FilmPlayer />}
      </div>

      {active === 'film' ? (
        <div className="hero-findings">
          <div className="hero-findings__top">
            <h3 className="hero-findings__title">{film.title}</h3>
            <span className="stamp stamp--red">{film.duration} · 介绍片</span>
          </div>
          <p className="hero-findings__text">{film.summary}</p>
          <ol className="film-chapters" aria-label="影片章节">
            {film.chapters.map(chapter => (
              <li key={chapter.time}>
                <span>{chapter.time}</span>
                {chapter.label}
              </li>
            ))}
          </ol>
          {film.audio && (
            <details className="audio-note">
              <summary>只听音频版 / 打开文字稿</summary>
              <p className="mono-label">音频 · {film.duration}</p>
              <audio controls preload="none" src={asset(film.audio)}>
                你的浏览器不支持音频播放。可打开文字稿。
              </audio>
              {film.transcript && (
                <a href={asset(film.transcript)} className="text-link" target="_blank" rel="noreferrer">
                  完整文字稿 →
                </a>
              )}
            </details>
          )}
          <div className="hero-findings__foot">
            <div className="tag-row">
              <Tag>音效设计</Tag>
              <Tag>无配音</Tag>
              <Tag>可暂停</Tag>
            </div>
            {film.transcript && (
              <a href={asset(film.transcript)} className="text-link" target="_blank" rel="noreferrer">
                打开文字稿 →
              </a>
            )}
          </div>
        </div>
      ) : work ? (
        <div className="hero-findings">
          <div className="hero-findings__top">
            <h3 className="hero-findings__title">{work.title}</h3>
            <StatusStamp status={work.status} />
          </div>
          <p className="hero-findings__text">{work.tagline}</p>
          <div className="hero-findings__metrics">
            {work.metrics.slice(0, 3).map(metric => (
              <span key={metric.label} className="metric">
                <span className="metric__value metric__value--sm">{metric.value}</span>
                <span className="metric__label">{metric.label}</span>
              </span>
            ))}
          </div>
          <div className="hero-findings__foot">
            <span className="mono-label">{work.role}</span>
            <Link to={`/work/${work.slug}`} className="btn btn--sm">
              调阅卷宗 <span className="btn__arrow">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
