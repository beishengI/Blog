import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { BlogConfig } from '../types';

/** 18 · 文档手册：左侧章节导航树 + 右侧编号条目，技术文档式阅读。 */
export default function DocsHome({ config }: { config: BlogConfig }) {
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="grid gap-[var(--gap)] xl:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
      <nav className="self-start rounded-brand border border-border bg-surface p-4 xl:sticky xl:top-[calc(var(--header-h)+1rem)]">
        <p className="px-2 text-xs font-bold uppercase tracking-widest text-muted">目录</p>
        <ul className="mt-3 space-y-1 text-sm">
          {categories.map((c, i) => (
            <li key={c}>
              <a href={`#chapter-${i}`} className="block rounded px-2 py-1.5 hover:bg-surface-alt hover:text-primary">
                <span className="font-mono text-xs text-muted">{i + 1}. </span>
                {c}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <header className="mb-6">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">{config.site.title}</h1>
          <p className="mt-2 text-muted">{config.site.bio}</p>
        </header>

        {categories.map((c, ci) => (
          <section key={c} id={`chapter-${ci}`} className="mb-10 scroll-mt-24">
            <h2 className="font-heading border-b border-border pb-2 text-2xl font-bold">
              <span className="font-mono text-base text-primary">{ci + 1}. </span>
              {c}
            </h2>
            <ul className="mt-3 space-y-1">
              {posts
                .filter((p) => p.category === c)
                .map((p, pi) => (
                  <li key={p.id}>
                    <Link
                      to={`/posts/${p.id}`}
                      className="group flex flex-wrap items-baseline gap-2 rounded px-2 py-2 transition-colors hover:bg-surface"
                    >
                      <span className="font-mono text-xs text-muted">
                        {ci + 1}.{pi + 1}
                      </span>
                      <span className="min-w-0 flex-1 font-medium group-hover:text-primary">{p.title}</span>
                      <span className="whitespace-nowrap text-xs text-muted">{p.readingTime} 分钟</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
