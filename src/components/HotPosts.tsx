import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { getAllViewCounts } from '../utils/stats';

/** 热门文章排行：按阅读量降序、同数按 date 降序，取前 limit 篇（默认 5）。 */
export default function HotPosts({ limit = 5 }: { limit?: number }) {
  const { allPosts } = usePosts();

  const ranked = useMemo(() => {
    const counts = getAllViewCounts();
    return allPosts
      .map((p) => ({ post: p, views: counts[p.id] ?? 0 }))
      .sort((a, b) =>
        b.views !== a.views
          ? b.views - a.views
          : a.post.date < b.post.date
            ? 1
            : a.post.date > b.post.date
              ? -1
              : 0
      )
      .slice(0, limit);
  }, [allPosts, limit]);

  // 无任何已发布文章时不渲染卡片
  if (allPosts.length === 0) return null;

  return (
    <div className="rounded-brand border border-border bg-surface p-5">
      <h4 className="font-heading text-sm font-semibold">热门文章</h4>
      <ol className="mt-3 space-y-2 text-sm">
        {ranked.map(({ post, views }, i) => (
          <li key={post.id} className="flex items-center gap-2">
            <span
              className={
                i < 3
                  ? 'w-5 shrink-0 text-center text-xs font-bold text-primary'
                  : 'w-5 shrink-0 text-center text-xs text-muted'
              }
            >
              {i + 1}
            </span>
            <Link
              to={`/posts/${post.id}`}
              className="min-w-0 flex-1 truncate text-muted hover:text-primary"
            >
              {post.title}
            </Link>
            <span className="shrink-0 text-xs text-muted">{views} 次</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
