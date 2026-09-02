import { useEffect, useState } from 'react';

/** 监听一组 heading id，返回当前在视口内的首个标题 id。 */
export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || ids.length === 0) {
      setActiveId(ids[0] ?? null);
      return;
    }

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = ids.find((id) => visible.get(id));
        if (first) setActiveId(first);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids.join(',')]);

  return activeId;
}
