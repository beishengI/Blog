import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { PageHead } from '../components/report/primitives';
import { useSEO } from '../hooks/useSEO';

export default function TagArchive() {
  const { allPosts } = usePosts();
  useSEO({ title: '标签', description: '按标签索引文章与笔记。' });

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    allPosts.forEach(post => post.tags.forEach(tag => map.set(tag, (map.get(tag) || 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [allPosts]);

  return (
    <div>
      <PageHead
        eyebrow="TAGS / 索引"
        title="标签不是分类，是线索"
        lead="同一个标签把不同时间、不同项目里的问题连起来。"
        aside={<div className="mono-label">{tags.length} 个标签</div>}
      />
      <div className="page-body">
        <div className="tag-cloud">
          {tags.map(([tag, count]) => (
            <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`} className="tag-cloud__item">
              <span>{tag}</span>
              <b>{count}</b>
            </Link>
          ))}
        </div>
        <div className="page-foot">
          <Link to="/archive" className="btn btn--ghost">按时间归档 →</Link>
          <Link to="/posts" className="btn btn--ghost">全部文章 →</Link>
        </div>
      </div>
    </div>
  );
}
