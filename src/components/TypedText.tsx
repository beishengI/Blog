import { useEffect, useRef, useState } from 'react';

/**
 * 打字机文本：按字符逐步显示，播完移除光标。
 * 遵循 prefers-reduced-motion：直接整段显示，不做逐字动画。
 */
export default function TypedText({
  text,
  step = 2,
  intervalMs = 26,
  className = '',
  paused = false,
  onDone,
}: {
  text: string;
  /** 每 tick 显示的字符数 */
  step?: number;
  intervalMs?: number;
  className?: string;
  /** 暂停逐字输出（状态保留，恢复后续播） */
  paused?: boolean;
  onDone?: () => void;
}) {
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;
  const [len, setLen] = useState(reduced ? text.length : 0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (reduced || text.length === 0) {
      // 无动画路径也必须收尾，否则调用方的 busy 状态永远无法解除
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    if (paused || len >= text.length) return;
    const t = window.setInterval(() => {
      setLen(n => {
        const next = Math.min(text.length, n + step);
        if (next >= text.length) {
          window.clearInterval(t);
          if (!doneRef.current) {
            doneRef.current = true;
            // 让最后一帧文本先落地再回调
            window.setTimeout(() => onDoneRef.current?.(), 120);
          }
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [text, step, intervalMs, reduced, paused, len]);

  const finished = len >= text.length;
  return (
    <span className={className}>
      {text.slice(0, len)}
      {!finished && <span className="animate-pulse">▊</span>}
    </span>
  );
}
