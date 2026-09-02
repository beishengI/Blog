import { Link } from 'react-router-dom';
import { Post } from '../data/posts';
import { useConfig } from '../context/ConfigContext';
import { postCover } from '../utils/cover';
import Icon from './Icon';

type Variant = 'default' | 'invert' | 'tall' | 'wide';

/** 杂志式特稿大卡：顶部封面图 + hover 放大 + 下方文字信息。 */
export default function FeatureCard({
  post,
  variant = 'default',
  className = '',
}: {
  post: Post;
  variant?: Variant;
  className?: string;
}) {
  const { config } = useConfig();
  const cover = post.cover || postCover(post, config);

  return (
    <Link to={`/posts/${post.id}`} className={`feature-card group ${variant} ${className}`}>
      <div className="feature-card__frame">
        <div
          className="feature-card__media"
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden="true"
        />
      </div>
      <div className="feature-card__body">
        <span className={`chip ${variant === 'invert' ? 'chip-accent' : 'chip-primary'}`}>
          {post.category}
        </span>
        <h3 className="feature-card__title font-heading line-clamp-2">{post.title}</h3>
        <p className="feature-card__excerpt text-muted line-clamp-2">{post.excerpt}</p>
        <div className="feature-card__meta text-muted">
          <span className="whitespace-nowrap">{post.date}</span>
          <span className="whitespace-nowrap">· {post.readingTime} 分钟</span>
          <span className="feature-card__arrow">
            <Icon name="arrow" size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
