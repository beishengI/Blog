import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReplayEvent } from '../data/works';

/**
 * 预录运行回放：事件序列来自 works.ts，逐条重演，不连后端。
 * 可暂停 / 续播 / 重播；reduced-motion 下直接铺满结果。
 */
export default function RunReplay({ title, events }: { title: string; events: ReplayEvent[] }) {
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;
  const [visible, setVisible] = useState(reduced ? events.length : 0);
  const [playing, setPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible]);

  useEffect(() => {
    if (!playing) return;
    if (visible >= events.length) {
      setPlaying(false);
      return;
    }
    const event = events[visible];
    const delay = event.kind === 'tool' ? Math.min(1600, Math.max(420, event.ms)) : 620;
    const timer = window.setTimeout(() => setVisible(value => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [playing, visible, events]);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setPlaying(true), 900);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  const finished = visible >= events.length;
  const progress = events.length ? Math.round((visible / events.length) * 100) : 100;
  const buttonLabel = playing ? '暂停' : finished ? '重播' : visible ? '继续' : '播放';

  const onToggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (finished) {
      setVisible(0);
      setPlaying(true);
      return;
    }
    setPlaying(true);
  };

  const shown = useMemo(() => events.slice(0, visible), [events, visible]);
  const current = playing && visible < events.length ? events[visible] : null;

  return (
    <section aria-label={`运行回放：${title}`} className="replay">
      <div className="terminal">
        <div className="terminal__bar">
          <span className="terminal__dot terminal__dot--red" />
          <span className="terminal__dot" />
          <span className="terminal__dot" />
          <span style={{ marginLeft: 6 }}>{title}</span>
          <span style={{ marginLeft: 'auto' }}>{progress}%</span>
          {!reduced && (
            <button type="button" className="terminal__btn" onClick={onToggle}>
              {buttonLabel}
            </button>
          )}
        </div>
        <div className="terminal__body replay__body" ref={scrollRef}>
          {shown.length === 0 && (
            <div className="terminal__line"><span className="terminal__muted">// 点击「播放」，看它跑一次。</span></div>
          )}
          {shown.map((event, index) => (
            <ReplayLine key={`${index}-${event.kind}`} event={event} done />
          ))}
          {current && <ReplayLine event={current} done={false} />}
        </div>
        <div className="replay__bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <p className="mono-label" style={{ marginTop: 8 }}>
        // 预录运行回放 · 事件序列为静态数据，逐条重演，可离线核查
      </p>
    </section>
  );
}

function ReplayLine({ event, done }: { event: ReplayEvent; done: boolean }) {
  if (event.kind === 'user') {
    return (
      <div className="terminal__line terminal__line--user">
        <span className="terminal__prompt">›</span>
        <span>{event.text}</span>
      </div>
    );
  }
  if (event.kind === 'tool') {
    return (
      <div className="terminal__line terminal__line--tool">
        <span className="terminal__prompt">⚙</span>
        <span>
          <b>{event.name}</b>
          <span className="terminal__muted"> ({event.args})</span>{' '}
          {done ? <span className="terminal__ok">✓ {event.ms}ms</span> : <span className="terminal__warn">··· {event.ms}ms</span>}
        </span>
      </div>
    );
  }
  if (event.kind === 'result') {
    return (
      <div className="terminal__line terminal__line--result">
        <span className="terminal__prompt">↳</span>
        <span className="terminal__muted">{event.text}</span>
      </div>
    );
  }
  return (
    <div className="terminal__line terminal__line--answer">
      <span className="terminal__prompt">◆</span>
      <span>{event.text}</span>
    </div>
  );
}
