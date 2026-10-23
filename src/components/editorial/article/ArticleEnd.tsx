import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';

/** 文末落款（S08）：手写签名 + 朱印 + 回到目录；不抢评论与相关文章的位置。 */
export default function ArticleEnd({
  post,
  endNote,
  handle,
  location,
}: {
  post: Post;
  endNote?: string;
  handle: string;
  location: string;
}) {
  return (
    <footer className="ja-end">
      <div className="ja-end__top">
        <span className="ja-end__mark">END / VOL.07 — 2026 秋 · 武汉</span>
        <span className="ja-end__seal ed-seal" aria-hidden="true">
          读片
          <br />
          07
        </span>
      </div>

      {endNote && <p className="ja-end__note">{endNote}</p>}

      <p className="ja-end__sign">
        <span className="ja-end__sign-hand">{handle}</span>
        <span className="ja-end__sign-meta">
          {post.date} · {location}
        </span>
      </p>

      <div className="ja-end__foot">
        <Link to="/posts" className="ja-end__back">
          ← 回到本期目录 / INDEX
        </Link>
        <span className="ja-end__meta">
          {post.category} · {post.readingTime} MIN · 下一期还在写
        </span>
      </div>
    </footer>
  );
}
