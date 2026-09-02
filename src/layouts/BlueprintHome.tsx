import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { BlogConfig } from '../types';

/** 20 · 工程蓝图：网格纸底 + 图号标注 + 等宽注释，工程制图感。 */
export default function BlueprintHome({ config }: { config: BlogConfig }) {
  return (
    <div className="blueprint-grid overflow-hidden rounded-brand border border-border p-6 md:p-10">
      <p className="font-mono text-xs tracking-[0.25em] text-primary">FIG. 01 — SYSTEM OVERVIEW</p>
      <h1 className="font-heading mt-3 text-4xl font-bold uppercase leading-none md:text-5xl">
        {config.site.title}
      </h1>
      <p className="read-max mt-4 font-mono text-sm text-muted">{config.site.bio}</p>

      <div className="mt-8 grid-auto-lg">
        {posts.map((p, i) => (
          <Link
            key={p.id}
            to={`/posts/${p.id}`}
            className="group relative block min-w-0 border border-border bg-bg p-5"
          >
            <span className="font-mono text-[10px] tracking-widest text-primary">
              FIG. {String(i + 2).padStart(2, '0')}
            </span>
            <h3 className="font-heading mt-2 text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary">
              {p.title}
            </h3>
            <p className="mt-2 line-clamp-2 font-mono text-xs text-muted">{p.excerpt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted">
              <span className="whitespace-nowrap">{p.category}</span>
              <span className="whitespace-nowrap">· {p.readingTime}min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
