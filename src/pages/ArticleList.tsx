import { useParams, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useSEO } from '../hooks/useSEO';

const PAGE_SIZE = 9;

const CHIP_CLS =
  'rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary';
const CHIP_ACTIVE_CLS = 'rounded-full bg-primary px-3 py-1 text-sm text-white';

type FilterKey = 'tag' | 'cat' | 'q';

export default function ArticleList() {
  const { tag } = useParams();
  const { allPosts } = usePosts();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const q = (params.get('q') ?? '').trim().toLowerCase();
  const decodedTag = tag ? decodeURIComponent(tag) : '';
  const queryTag = (() => {
    const raw = params.get('tag') ?? '';
    if (!raw) return '';
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  })();
  // 路径参数 /tags/:tag 优先于 ?tag=（两者同时存在时忽略 ?tag=）
  const activeTag = decodedTag || queryTag;
  const activeCat = (params.get('cat') ?? '').trim();

  // 总筛选链（AND）：tag → cat → q
  const list = useMemo(() => {
    let base = activeTag ? allPosts.filter(p => p.tags.includes(activeTag)) : allPosts;
    if (activeCat) {
      base = base.filter(p => p.category === activeCat);
    }
    if (q) {
      base = base.filter(p =>
        `${p.title} ${p.excerpt} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q)
      );
    }
    return base;
  }, [activeTag, activeCat, q, allPosts]);

  // SEO：q/tag/cat 组合 title，` / ` 连接；description 含结果数量
  const seoParts: string[] = [];
  if (q) seoParts.push(`搜索：${(params.get('q') ?? '').trim()}`);
  if (activeTag) seoParts.push(`标签：${activeTag}`);
  if (activeCat) seoParts.push(`分类：${activeCat}`);
  useSEO({
    title: seoParts.length > 0 ? seoParts.join(' / ') : '全部文章',
    description: `共 ${list.length} 篇文章${
      seoParts.length > 0 ? `（${seoParts.join('，')}）` : '，来自 MedAI Lab'
    }`,
  });

  // 分类集合：从已发布 allPosts 提取 distinct category，按文章计数降序
  const categories = useMemo(() => {
    const m = new Map<string, number>();
    allPosts.forEach(p => m.set(p.category, (m.get(p.category) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [allPosts]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const rawPage = Number(params.get('page'));
  // 非法/0/负/超界一律回落合理页，不强制改写 URL
  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.min(Math.floor(rawPage), totalPages) : 1;
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 基于当前 URL 参数合成目标路径：mutate 修改查询串，其余参数原样保留
  const buildTo = (basePath: string, mutate: (sp: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // 翻页链接：设置或删除 page（page=1 时删除该参数，保持 URL 干净）
  const makeHref = (target: number) =>
    buildTo(location.pathname, sp => {
      if (target <= 1) sp.delete('page');
      else sp.set('page', String(target));
    });

  // 移除单个筛选参数；tag 来自路径参数时整体回到 /posts
  const removeFilter = (key: FilterKey) => {
    const basePath = key === 'tag' && decodedTag ? '/posts' : location.pathname;
    navigate(buildTo(basePath, sp => sp.delete(key)));
  };

  const heading = q
    ? `搜索：${params.get('q')}`
    : activeTag
      ? `标签：${activeTag}`
      : '全部文章';

  const activeFilters: { key: FilterKey; label: string }[] = [];
  if (activeTag) activeFilters.push({ key: 'tag', label: `标签：${activeTag}` });
  if (activeCat) activeFilters.push({ key: 'cat', label: `分类：${activeCat}` });
  if (q) activeFilters.push({ key: 'q', label: `搜索：${(params.get('q') ?? '').trim()}` });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">{heading}</h1>
      <p className="text-sm text-muted">共 {list.length} 篇</p>

      {/* 分类筛选 chips：仅在无路径 tag 参数时显示，避免与标签语义冲突 */}
      {!decodedTag && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="分类筛选">
          <button
            type="button"
            aria-pressed={!activeCat}
            onClick={() => navigate(buildTo(location.pathname, sp => sp.delete('cat')))}
            className={activeCat ? CHIP_CLS : CHIP_ACTIVE_CLS}
          >
            全部
          </button>
          {categories.map(([c, count]) => (
            <button
              key={c}
              type="button"
              aria-pressed={activeCat === c}
              onClick={() => navigate(buildTo(location.pathname, sp => sp.set('cat', c)))}
              className={activeCat === c ? CHIP_ACTIVE_CLS : CHIP_CLS}
            >
              {c} <span className={activeCat === c ? 'opacity-70' : 'text-muted'}>({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* 激活筛选 chips：逐项可删 */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(f => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
            >
              {f.label}
              <button
                type="button"
                aria-label={`移除筛选 ${f.label}`}
                onClick={() => removeFilter(f.key)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </span>
          ))}
          <Link to="/posts" className="text-sm text-primary">
            ← 清除筛选
          </Link>
        </div>
      )}

      <div className="grid-auto">
        {paged.map(p => (
          <ArticleCard key={p.id} post={p} />
        ))}
      </div>

      {/* 分页条：无匹配结果时不渲染 */}
      {list.length > 0 && (
        <div className="flex justify-center pt-2">
          <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
        </div>
      )}

      {list.length === 0 && (
        <p className="text-sm text-muted">
          没有匹配的文章 · <Link to="/posts" className="text-primary">返回全部</Link>
        </p>
      )}
    </div>
  );
}
