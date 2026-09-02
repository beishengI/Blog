import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import { BlogConfig } from '../types';

/** 15 · 左右分屏：左侧 sticky 个人名片，右侧文章流。 */
export default function SplitHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  return (
    <div className="grid gap-[var(--gap)] lg:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
      <aside className="self-start rounded-brand border border-border bg-surface p-6 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
        <img
          src={config.site.avatar}
          alt={config.site.author}
          className="shrink-0 rounded-full bg-bg object-cover"
          style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)' }}
        />
        <h1 className="font-heading mt-4 text-2xl font-bold">{config.site.author}</h1>
        <p className="mt-2 text-sm text-muted">{config.site.bio}</p>
        <nav className="mt-5 grid grid-cols-2 gap-2 text-sm">
          {config.nav.map((n) => (
            <Link key={n.href} to={n.href}
              className="rounded-brand border border-border px-3 py-2 text-center text-muted transition-colors hover:border-primary hover:text-primary">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="chip chip-accent whitespace-nowrap">#{t}</span>
          ))}
        </div>
      </aside>

      <div className="min-w-0 space-y-[var(--gap)]">
        <h2 className="font-heading text-xl font-semibold">最新文章</h2>
        {posts.map((p) => <ArticleCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
