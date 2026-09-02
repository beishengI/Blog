import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { BlogConfig } from '../types';

/** 04 · 玻璃层叠：渐变舞台上叠半透明毛玻璃面板。 */
export default function GlassHome({ config }: { config: BlogConfig }) {
  return (
    <div className="space-y-[var(--gap)]">
      <section className="glass-stage">
        <div className="glass-panel read-max relative z-10 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">{config.site.author}</p>
          <h1 className="font-heading mt-2 text-4xl font-bold leading-tight md:text-5xl">{config.site.title}</h1>
          <p className="mt-3 text-muted">{config.site.bio}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/posts" className="rounded-brand bg-primary px-4 py-2 text-sm text-white">浏览文章</Link>
            <Link to="/about" className="rounded-brand border border-border px-4 py-2 text-sm">关于我</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-xl font-semibold">最新文章</h2>
        <div className="grid-auto">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/posts/${p.id}`}
              className="glass-panel group block p-5 transition-transform hover:-translate-y-1"
            >
              <span className="chip chip-primary">{p.category}</span>
              <h3 className="font-heading mt-3 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
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
