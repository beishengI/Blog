import { Link } from 'react-router-dom';
import type { Post } from '../data/posts';

export default function ArticleCard({ post }: { post: Post }) {
  return (
    <Link to={`/posts/${post.id}`} className="article-row">
      <span className="article-row__no">{post.category?.slice(0, 2) || 'N°'}</span>
      <div>
        <h3 className="article-row__title">{post.title}</h3>
        <p className="article-row__excerpt">{post.excerpt}</p>
        <div className="article-row__meta">
          <span>{post.date}</span>
          <span>{post.category}</span>
          <span>{post.readingTime} 分钟</span>
          {post.tags.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
        </div>
      </div>
    </Link>
  );
}
