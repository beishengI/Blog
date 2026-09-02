import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 06 · 复古报纸：报头 + 头条首字下沉 + CSS 多栏正文。 */
export default function NewspaperHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  const lead = posts[0];
  const rest = posts.slice(1);
  if (!lead) return null;

  return (
    <div>
      <header className="border-b-4 border-double border-border pb-5 text-center">
        <SiteAvatar size="md" className="mx-auto mb-3 block border border-border" />
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{config.site.author} · 技术周刊</p>
        <h1 className="font-heading mt-2 text-5xl font-black leading-none md:text-6xl">{config.site.title}</h1>
        <p className="mt-3 text-sm text-muted">
          第 {String(posts.length).padStart(2, '0')} 期 · {config.site.title} · 持续更新
        </p>
      </header>

      <section className="mt-6 border-b border-border pb-6">
        <Link to={`/posts/${lead.id}`} className="group block">
          <h2 className="font-heading text-3xl font-bold leading-tight group-hover:text-primary md:text-4xl">
            {lead.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted">
            <span className="font-bold text-primary">{lead.category}</span>
            <span className="whitespace-nowrap">· {lead.date}</span>
            <span className="whitespace-nowrap">· {lead.readingTime} 分钟</span>
          </div>
          <p className="dropcap mt-3 text-lg leading-relaxed">{lead.excerpt}。{lead.aiSummary}</p>
        </Link>
      </section>

      <section className="mt-6">
        <div className="news-cols">
          {rest.map((p) => (
            <article key={p.id} className="news-item">
              <Link to={`/posts/${p.id}`} className="group block border-t border-border pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{p.category}</span>
                <h3 className="font-heading mt-1 text-lg font-bold leading-snug group-hover:text-primary">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="whitespace-nowrap">{p.date}</span>
                  <span className="whitespace-nowrap">· {p.readingTime} 分钟</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
