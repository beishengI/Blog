import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 17 · 便签墙：轻微旋转的纸质便签拼贴（旋转幅度极小，不会与邻卡重叠）。 */
export default function NotesHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div>
      <header className="mb-6 flex items-start gap-4">
        <SiteAvatar size="md" className="hidden sm:block" />
        <div className="min-w-0">
          <p className="kicker">STICKY NOTES</p>
          <h1 className="font-heading mt-2 text-4xl font-bold leading-tight md:text-5xl">{config.site.title}</h1>
          <p className="read-max mt-3 text-muted">{config.site.bio}</p>
        </div>
      </header>

      <div className="grid-auto-notes">
        {posts.map((p, i) => (
          <Link
            key={p.id}
            to={`/posts/${p.id}`}
            className={`group block rounded-brand border border-border bg-surface p-5 shadow-sm transition-transform hover:rotate-0 hover:scale-[1.02] ${
              i % 3 === 0 ? 'rotate-[-1.2deg]' : i % 3 === 1 ? 'rotate-[1deg]' : 'rotate-[-0.5deg]'
            }`}
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{p.category}</span>
            <h3 className="font-heading mt-2 text-lg font-bold leading-snug line-clamp-2">{p.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="whitespace-nowrap">{p.date}</span>
              <span className="whitespace-nowrap">· {p.readingTime} 分钟</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
