import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 12 · AI 伴读：左侧原文摘要 / 右侧 AI 摘要与术语，下方更多文章。 */
export default function CompanionHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  const featured = posts[0];
  if (!featured) return null;

  return (
    <div className="space-y-10">
      <div className="grid-auto">
        <div className="rounded-brand border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <SiteAvatar size="sm" />
            <p className="text-xs uppercase tracking-widest text-muted">原文 · {config.site.author}</p>
          </div>
          <h2 className="font-heading mt-2 text-2xl font-bold leading-snug">{featured.title}</h2>
          <p className="mt-2 text-sm text-muted">{featured.excerpt}</p>
          <Link to={`/posts/${featured.id}`} className="mt-3 inline-block text-sm text-primary">阅读全文 →</Link>
        </div>

        <div className="rounded-brand border border-border p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">AI 伴读</p>
          <p className="mt-2 text-sm">{featured.aiSummary}</p>
          <h4 className="mt-4 text-sm font-semibold">关键术语</h4>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {featured.terms.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </div>

      <section>
        <h2 className="font-heading mb-3 text-xl font-semibold">更多文章</h2>
        <div className="grid-auto">
          {posts.slice(1).map((p) => <ArticleCard key={p.id} post={p} />)}
        </div>
      </section>
    </div>
  );
}
