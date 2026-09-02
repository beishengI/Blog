import { useMemo } from 'react';
import { Post } from '../data/posts';
import { usePosts } from '../context/PostsContext';
import ArticleCard from './ArticleCard';

/**
 * 相关文章推荐：共同标签 ×2 + 同分类 ×1 评分，取前 3（并列时保持 date 降序稳定排序）。
 * 无任何匹配时整个区块不渲染。
 */
export default function RelatedPosts({ current }: { current: Post }) {
  const { allPosts } = usePosts();

  const related = useMemo(() => {
    const tagSet = new Set(current.tags);
    return allPosts
      .filter((p) => p.id !== current.id)
      .map((p) => ({
        post: p,
        score:
          p.tags.reduce((n, t) => n + (tagSet.has(t) ? 2 : 0), 0) +
          (p.category === current.category ? 1 : 0),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.post);
  }, [allPosts, current]);

  if (related.length === 0) return null;
  return (
    <section aria-label="相关文章" className="mt-10 border-t border-border pt-8">
      <h2 className="font-heading text-xl font-bold">相关文章</h2>
      <div className="grid-auto mt-4">
        {related.map((p) => (
          <ArticleCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
