import { Link } from 'react-router-dom';
import { Post } from '../data/posts';

/**
 * 上一篇/下一篇导航：左=上一篇（发布更早），右=下一篇（发布更新）。
 * 单侧缺失只渲染另一侧；两侧都缺失时整个区块不渲染。
 */
export default function PrevNextNav({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="文章导航" className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/posts/${prev.id}`}
          className="group rounded-brand border border-border p-4 transition-colors hover:border-primary"
        >
          <span className="text-xs text-muted">← 上一篇</span>
          <span className="font-heading mt-1 block text-sm font-semibold leading-snug group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}
      {next && (
        <Link
          to={`/posts/${next.id}`}
          className="group rounded-brand border border-border p-4 text-right transition-colors hover:border-primary sm:col-start-2"
        >
          <span className="text-xs text-muted">下一篇 →</span>
          <span className="font-heading mt-1 block text-sm font-semibold leading-snug group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
