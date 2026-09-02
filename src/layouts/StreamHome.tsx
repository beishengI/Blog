import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { BlogConfig } from '../types';

/** 19 · 动态流：头像 + 正文 + 标签 + 操作条的类社交信息流。 */
export default function StreamHome({ config }: { config: BlogConfig }) {
  return (
    <div className="read-max mx-auto">
      <header className="mb-2 flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <img
          src={config.site.avatar}
          alt={config.site.author}
          className="shrink-0 rounded-full bg-bg object-cover"
          style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)' }}
        />
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold">{config.site.author}</h1>
          <p className="text-sm text-muted">{config.site.bio}</p>
        </div>
      </header>

      {posts.map((p) => (
        <article key={p.id} className="flex gap-4 border-b border-border py-6">
          <img
            src={config.site.avatar}
            alt=""
            className="shrink-0 rounded-full bg-bg object-cover"
            style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)' }}
          />
          <div className="min-w-0 flex-1">
            <header className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{config.site.author}</span>
              <span className="whitespace-nowrap text-xs text-muted">· {p.date}</span>
              <span className="chip chip-primary ml-auto">{p.category}</span>
            </header>

            <h2 className="font-heading mt-2 text-xl font-bold leading-snug">
              <Link to={`/posts/${p.id}`} className="hover:text-primary">{p.title}</Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.excerpt}</p>

            <footer className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {p.tags.map((t) => (
                <span key={t} className="whitespace-nowrap">#{t}</span>
              ))}
              <Link to={`/posts/${p.id}`} className="ml-auto whitespace-nowrap text-primary">阅读全文 →</Link>
            </footer>
          </div>
        </article>
      ))}
    </div>
  );
}
