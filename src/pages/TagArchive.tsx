import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { usePosts } from '../context/PostsContext';
import { useSEO } from '../hooks/useSEO';

export default function TagArchive() {
  const { allPosts } = usePosts();
  useSEO({ title: '标签归档' });
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    allPosts.forEach(p => p.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [allPosts]);
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">标签归档</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map(([t, c]) => (
          <Link key={t} to={`/tags/${encodeURIComponent(t)}`}
            className="rounded-brand border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary">
            {t} <span className="text-muted">({c})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
