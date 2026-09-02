import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { posts } from '../data/posts';

export default function Sidebar() {
  const { config } = useConfig();
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <aside className="flex flex-col gap-6">
      <div className="rounded-brand border border-border bg-surface p-5">
        <img
          src={config.site.avatar}
          alt={config.site.author}
          className="shrink-0 rounded-full"
          style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)' }}
        />
        <h3 className="font-heading mt-3 text-base font-semibold">{config.site.author}</h3>
        <p className="mt-1 text-sm text-muted">{config.site.bio}</p>
      </div>
      <div className="rounded-brand border border-border bg-surface p-5">
        <h4 className="font-heading text-sm font-semibold">标签</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map(([t, c]) => (
            <Link key={t} to={`/tags/${encodeURIComponent(t)}`}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-primary hover:text-primary">
              {t} <span className="opacity-60">{c}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-brand border border-border bg-surface p-5">
        <h4 className="font-heading text-sm font-semibold">最近更新</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {posts.slice(0, config.layout.recentCount).map(p => (
            <li key={p.id}>
              <Link to={`/posts/${p.id}`} className="text-muted hover:text-primary">{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
