import { useMemo } from 'react';
import { Post } from '../data/posts';
import { usePosts } from '../context/PostsContext';
import ArticleCard from './ArticleCard';

/** 相关文章推荐：共同标签 ×2 + 同分类 ×1 评分，取前 3。 */
export default function RelatedPosts({ current }: { current: Post }) {
  const { allPosts } = usePosts();

  const related = useMemo(() => {
    const tagSet = new Set(current.tags);
    return allPosts
      .filter(post => post.id !== current.id)
      .map(post => ({
        post,
        score:
          post.tags.reduce((sum, tag) => sum + (tagSet.has(tag) ? 2 : 0), 0) +
          (post.category === current.category ? 1 : 0),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.post);
  }, [allPosts, current]);

  if (related.length === 0) return null;

  return (
    <section aria-label="相关文章" className="article-related">
      <div className="section-mark">
        <span className="section-mark__no">REL</span>
        <h2 className="section-mark__title">相关文章</h2>
        <span className="section-mark__rule" aria-hidden="true" />
      </div>
      <div className="article-list">
        {related.map(post => <ArticleCard key={post.id} post={post} />)}
      </div>
    </section>
  );
}
