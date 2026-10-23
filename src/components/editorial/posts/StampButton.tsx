import { useCallback, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const STORAGE_PREFIX = 'jp-stamp:';

function readStored(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeStored(key: string, value: boolean): void {
  try {
    if (value) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* 隐私模式下写入失败不影响运行期状态 */
  }
}

/**
 * ② 手绘盖章：原生 button + aria-pressed，localStorage 只记「我自己盖过没有」，
 * 不显示、不伪造任何点赞数。reduced-motion 下不震动、动画退化为静态终态。
 */
export default function StampButton({ postId, label = '盖章' }: { postId: string; label?: string }) {
  const storageKey = STORAGE_PREFIX + postId;
  const [stamped, setStamped] = useState<boolean>(() => readStored(storageKey));
  const [pulse, setPulse] = useState(0);
  const reduce = usePrefersReducedMotion();

  const onClick = useCallback(() => {
    setStamped(previous => {
      const next = !previous;
      writeStored(storageKey, next);
      if (next) {
        setPulse(value => value + 1);
        if (!reduce) {
          try {
            if (typeof navigator.vibrate === 'function') navigator.vibrate(8);
          } catch {
            /* vibrate 在部分环境不可用，静默失败 */
          }
        }
      }
      return next;
    });
  }, [reduce, storageKey]);

  return (
    <button
      type="button"
      className={'jp-stamp' + (stamped ? ' is-stamped' : '')}
      aria-pressed={stamped}
      aria-label={stamped ? '已盖章：这篇有用（再点一次取消）' : '盖章：这篇有用'}
      onClick={onClick}
    >
      <span className="jp-stamp__ring" key={stamped ? 'ring-' + pulse : 'ring-idle'} aria-hidden="true" />
      <svg className="jp-stamp__heart" viewBox="0 0 24 22" fill="none" aria-hidden="true" focusable="false">
        <path
          pathLength={1}
          d="M12 19.6 C 7.2 15.6, 2.6 12.4, 2.6 8.2 C 2.6 5.2, 4.8 2.8, 7.6 2.8 C 9.6 2.8, 11 3.9, 12 5.8 C 13 3.9, 14.4 2.8, 16.4 2.8 C 19.2 2.8, 21.4 5.2, 21.4 8.2 C 21.4 12.4, 16.8 15.6, 12 19.6 Z"
        />
      </svg>
      <span className="jp-stamp__text">{stamped ? '已盖章' : label}</span>
    </button>
  );
}
