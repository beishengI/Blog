import { Link } from 'react-router-dom';
import { Post } from '../data/posts';

/** 上一篇/下一篇：左=更早，右=更新。 */
export default function PrevNextNav({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="文章导航" className="prevnext">
      {prev ? (
        <Link to={`/posts/${prev.id}`} className="prevnext__item">
          <span className="mono-label">← 上一篇</span>
          <span className="prevnext__title">{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next && (
        <Link to={`/posts/${next.id}`} className="prevnext__item prevnext__item--right">
          <span className="mono-label">下一篇 →</span>
          <span className="prevnext__title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
