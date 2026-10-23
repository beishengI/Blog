import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';
import { fmtDate, pad2 } from './helpers';

/** allPosts 里未编入本期拼贴的文章：不允许从目录页消失 */
export default function NewEntries({ posts, startIndex }: { posts: Post[]; startIndex: number }) {
  return (
    <section className="jp-new" aria-label="增补文章">
      <div className="jp-new__head">
        <span className="ed-label">增补 / NEW ENTRIES</span>
        <span className="jp-new__meta jp-mono">{posts.length} 篇 · 未编入本期拼贴</span>
      </div>
      <ul className="jp-new__list">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link to={'/posts/' + post.id} className="jp-new__item">
              <span className="jp-new__no jp-mono">{pad2(startIndex + index + 1)}</span>
              <span className="jp-new__title">{post.title}</span>
              <span className="jp-new__meta jp-mono">{post.category} · {post.readingTime} MIN · {fmtDate(post.date)}</span>
              <span className="jp-new__arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
