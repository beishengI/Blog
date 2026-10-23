import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useSEO } from '../hooks/useSEO';
import type { Post } from '../data/posts';
import { postEditorial } from '../data/editorial';
import Masthead from '../components/editorial/posts/Masthead';
import FilterBar from '../components/editorial/posts/FilterBar';
import BentoGrid from '../components/editorial/posts/BentoGrid';
import SearchResults from '../components/editorial/posts/SearchResults';
import NewEntries from '../components/editorial/posts/NewEntries';
import Colophon from '../components/editorial/posts/Colophon';
import { countCategories, EDITORIAL_ORDER } from '../components/editorial/posts/helpers';

/**
 * /posts · 《读片》VOL.07 本期目录（编辑式拼贴）
 * - 刊头（小版）→ 检索/筛选条 → 非对称 Bento（7 篇）→ 增补 → 卷末
 * - 有 q / cat / tag 时切换为紧凑「检索结果」，筛选状态全部进 URL，可分享可回退。
 * - allPosts 里未编入拼贴的文章在「增补 / NEW ENTRIES」列出，不丢内容。
 */
export default function ArticleList() {
  const { tag } = useParams();
  const { allPosts } = usePosts();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const rawQ = params.get('q') ?? '';
  const [keyword, setKeyword] = useState(rawQ);
  useEffect(() => {
    setKeyword(rawQ);
  }, [rawQ]);

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
  const activeTag = decodedTag || queryTag;
  const activeCat = (params.get('cat') ?? '').trim();
  const q = rawQ.trim().toLowerCase();

  const categories = useMemo(() => countCategories(allPosts), [allPosts]);

  const list = useMemo(() => {
    let base = allPosts;
    if (activeTag) base = base.filter(post => post.tags.includes(activeTag));
    if (activeCat) base = base.filter(post => post.category === activeCat);
    if (q) {
      base = base.filter(post => {
        const haystack =
          post.title + ' ' + post.excerpt + ' ' + post.category + ' ' + post.tags.join(' ') + ' ' + post.content;
        return haystack.toLowerCase().includes(q);
      });
    }
    return base;
  }, [activeTag, activeCat, q, allPosts]);

  const hasFilters = Boolean(activeTag || activeCat || q);

  const editorialPosts = useMemo(
    () =>
      EDITORIAL_ORDER.map(id => allPosts.find(post => post.id === id)).filter(
        (post): post is Post => Boolean(post)
      ),
    [allPosts]
  );

  const extraPosts = useMemo(() => allPosts.filter(post => !postEditorial[post.id]), [allPosts]);
  const totalMinutes = useMemo(
    () => editorialPosts.reduce((sum, post) => sum + post.readingTime, 0),
    [editorialPosts]
  );

  const seoTitle = q
    ? '搜索：' + rawQ.trim()
    : activeTag
      ? '标签：' + activeTag
      : activeCat
        ? '分类：' + activeCat
        : '文章聚合页 · 本期目录';

  useSEO({
    title: seoTitle,
    description:
      '《读片》VOL.07 文章聚合页：' +
      (hasFilters
        ? '当前筛选结果 ' + list.length + ' 篇。'
        : '七篇文章按故事重量排版，不按日期。') +
      '问题日志、项目复盘与技术笔记。',
    keywords: ['读片', '文章目录', '张栋栋', '北省'].concat(categories.map(item => item.name)),
    type: 'website',
  });

  const navigateWith = (mutate: (sp: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    next.delete('page');
    const qs = next.toString();
    navigate(qs ? location.pathname + '?' + qs : location.pathname);
  };

  const submitSearch = () => {
    navigateWith(sp => {
      const next = keyword.trim();
      if (next) sp.set('q', next);
      else sp.delete('q');
    });
  };

  const selectCat = (cat: string) => {
    navigateWith(sp => {
      if (cat) sp.set('cat', cat);
      else sp.delete('cat');
    });
  };

  const clearQ = () => navigateWith(sp => sp.delete('q'));
  const clearCat = () => navigateWith(sp => sp.delete('cat'));

  const clearTag = () => {
    const next = new URLSearchParams(params);
    next.delete('tag');
    next.delete('page');
    const qs = next.toString();
    const path = decodedTag ? '/posts' : location.pathname;
    navigate(qs ? path + '?' + qs : path);
  };

  const clearAll = () => navigate('/posts');

  return (
    <div className={'jp-page' + (hasFilters ? ' is-filtered' : '')}>
      <Masthead count={editorialPosts.length} totalMinutes={totalMinutes} />

      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSubmit={submitSearch}
        categories={categories}
        total={allPosts.length}
        active={{ q: rawQ.trim(), cat: activeCat, tag: activeTag }}
        resultCount={list.length}
        onSelectCat={selectCat}
        onClearQ={clearQ}
        onClearCat={clearCat}
        onClearTag={clearTag}
        onClearAll={clearAll}
      />

      {hasFilters ? (
        <SearchResults
          posts={list}
          filters={{ q: rawQ.trim(), cat: activeCat, tag: activeTag }}
          total={allPosts.length}
          onClearAll={clearAll}
        />
      ) : (
        <>
          <BentoGrid posts={allPosts} />
          {extraPosts.length > 0 ? (
            <NewEntries posts={extraPosts} startIndex={editorialPosts.length} />
          ) : null}
        </>
      )}

      <Colophon articleCount={editorialPosts.length} totalMinutes={totalMinutes} />
    </div>
  );
}
