import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';
import { fmtDate, pad2 } from './helpers';

interface SearchResultsProps {
  posts: Post[];
  filters: { q: string; cat: string; tag: string };
  total: number;
  onClearAll: () => void;
}

/** 有筛选时替代 Bento 的紧凑结果视图：保持编辑式索引，而不是留下一片空洞 */
export default function SearchResults({ posts, filters, total, onClearAll }: SearchResultsProps) {
  const parts: string[] = [];
  if (filters.q) parts.push('「' + filters.q + '」');
  if (filters.tag) parts.push('标签 ' + filters.tag);
  if (filters.cat) parts.push('分类 ' + filters.cat);

  return (
    <section className="jp-results" aria-label="检索结果">
      <div className="jp-results__head">
        <span className="ed-label">检索结果 / SEARCH RESULTS</span>
        <span className="jp-results__query jp-mono">{parts.length > 0 ? parts.join(' · ') : '全部'}</span>
        <span className="jp-results__count jp-mono">{posts.length} / {total} 篇</span>
        <button type="button" className="jp-results__clear jp-mono" onClick={onClearAll}>回到拼贴目录 ×</button>
      </div>

      {posts.length === 0 ? (
        <div className="jp-results__empty">
          <p className="ed-hand">抽屉里没有匹配的卡片。</p>
          <p>换一个关键词，或者回到本期目录按故事重量读。</p>
          <button type="button" className="jp-results__button" onClick={onClearAll}>回到本期目录</button>
        </div>
      ) : (
        <ol className="jp-results__list">
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link to={'/posts/' + post.id} className="jp-result">
                <span className="jp-result__no jp-mono">{pad2(index + 1)}</span>
                <span className="jp-result__cat jp-mono">{post.category}</span>
                <span className="jp-result__main">
                  <span className="jp-result__title">{post.title}</span>
                  <span className="jp-result__excerpt">{post.excerpt}</span>
                </span>
                <span className="jp-result__meta jp-mono">{post.readingTime} MIN · {fmtDate(post.date)}</span>
                <span className="jp-result__arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
