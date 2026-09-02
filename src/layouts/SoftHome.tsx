import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { BlogConfig } from '../types';

/** 03 · 新拟态软卡：无边框，靠双向阴影塑造凸起/凹陷。 */
export default function SoftHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div className="space-y-[var(--gap)]">
      <section className="neu-card p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-5">
          <img
            src={config.site.avatar}
            alt={config.site.author}
            className="neu-inset shrink-0 rounded-full bg-bg object-cover p-1"
            style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)' }}
          />
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold">{config.site.title}</h1>
            <p className="mt-1 text-muted">{config.site.bio}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-xl font-semibold">最新文章</h2>
        <div className="grid-auto">
          {posts.map((p) => (
            <Link key={p.id} to={`/posts/${p.id}`} className="neu-card group block p-6">
              <span className="neu-inset inline-block rounded-full px-3 py-1 text-xs text-primary">{p.category}</span>
              <h3 className="font-heading mt-3 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="whitespace-nowrap">{p.date}</span>
                <span className="whitespace-nowrap">· {p.readingTime} 分钟</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
