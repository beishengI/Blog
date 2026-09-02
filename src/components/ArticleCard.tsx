import { Link } from 'react-router-dom';
import { Post } from '../data/posts';
import { useConfig } from '../context/ConfigContext';

const variantClass: Record<string, string> = {
  minimal: 'border-b border-border py-5',
  bordered: 'rounded-brand border border-border p-5 transition-colors hover:border-primary',
  elevated: 'rounded-brand bg-surface p-5 shadow-lg shadow-black/5 transition-shadow hover:shadow-xl',
  ghost: 'rounded-brand p-5 transition-colors hover:bg-surface',
};

export default function ArticleCard({ post }: { post: Post }) {
  const { config } = useConfig();
  const cls = variantClass[config.layout.cardStyle] ?? variantClass.bordered;
  return (
    <Link to={`/posts/${post.id}`} className={`group block ${cls}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-primary">{post.category}</span>
        <span className="whitespace-nowrap">{post.date}</span>
        {config.features.readingTime && <span className="whitespace-nowrap">· {post.readingTime} 分钟</span>}
      </div>
      <h3 className="font-heading mt-2 text-lg font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted">
        {post.tags.map(t => <span key={t} className="whitespace-nowrap">#{t}</span>)}
      </div>
    </Link>
  );
}
