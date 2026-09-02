import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { posts } from '../data/posts';
import ArticleCard from '../components/ArticleCard';

export default function ArticleList() {
  const { tag } = useParams();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const decodedTag = tag ? decodeURIComponent(tag) : '';

  const list = useMemo(() => {
    let base = decodedTag ? posts.filter(p => p.tags.includes(decodedTag)) : posts;
    if (q) {
      base = base.filter(p =>
        `${p.title} ${p.excerpt} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q)
      );
    }
    return base;
  }, [decodedTag, q]);

  const heading = q ? `搜索：${params.get('q')}` : decodedTag ? `标签：${decodedTag}` : '全部文章';

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">{heading}</h1>
      <p className="text-sm text-muted">共 {list.length} 篇</p>

      {(q || decodedTag) && (
        <Link to="/posts" className="inline-block text-sm text-primary">← 清除筛选</Link>
      )}

      <div className="grid-auto">
        {list.map(p => <ArticleCard key={p.id} post={p} />)}
      </div>

      {list.length === 0 && (
        <p className="text-sm text-muted">
          没有匹配的文章 · <Link to="/posts" className="text-primary">返回全部</Link>
        </p>
      )}
    </div>
  );
}
