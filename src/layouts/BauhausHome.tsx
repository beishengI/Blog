import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { BlogConfig } from '../types';

/** 05 · 包豪斯几何：原色块 + 硬边 + 极简几何母题。 */
export default function BauhausHome({ config }: { config: BlogConfig }) {
  return (
    <div className="space-y-10">
      <section className="border-2 border-border p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Form Follows Function</p>
            <h1 className="font-heading mt-2 text-5xl font-black uppercase leading-none md:text-6xl">
              {config.site.title}
            </h1>
            <p className="mt-3 max-w-lg text-muted">{config.site.bio}</p>
          </div>
          <div className="flex shrink-0 items-end gap-3">
            <span className="h-20 w-20 rounded-full bg-primary md:h-24 md:w-24" />
            <span className="h-20 w-20 bg-accent md:h-24 md:w-24" />
            <span
              className="h-20 w-20 bg-fg md:h-24 md:w-24"
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-2xl font-black uppercase">最新文章</h2>
        <div className="grid-auto">
          {posts.map((p, i) => (
            <Link key={p.id} to={`/posts/${p.id}`} className="group block border-2 border-border">
              <span className={`block h-2 w-full ${i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-accent' : 'bg-fg'}`} />
              <div className="p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-muted">{p.category}</span>
                <h3 className="font-heading mt-2 text-xl font-bold leading-snug line-clamp-2 group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="whitespace-nowrap">{p.date}</span>
                  <span className="whitespace-nowrap">· {p.readingTime} 分钟</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
