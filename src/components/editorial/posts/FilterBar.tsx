import type { FormEvent } from 'react';
import type { CategoryCount } from './helpers';

export interface ActiveFilters {
  q: string;
  cat: string;
  tag: string;
}

interface FilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSubmit: () => void;
  categories: CategoryCount[];
  total: number;
  active: ActiveFilters;
  resultCount: number;
  onSelectCat: (cat: string) => void;
  onClearQ: () => void;
  onClearCat: () => void;
  onClearTag: () => void;
  onClearAll: () => void;
}

/**
 * 检索 / 筛选条：输入、分类 chips、当前筛选可清除、结果数。
 * 所有状态都进 URL（q / cat / tag），因此可以分享与回退。
 */
export default function FilterBar({
  keyword,
  onKeywordChange,
  onSubmit,
  categories,
  total,
  active,
  resultCount,
  onSelectCat,
  onClearQ,
  onClearCat,
  onClearTag,
  onClearAll,
}: FilterBarProps) {
  const hasFilters = Boolean(active.q || active.cat || active.tag);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="jp-filter" aria-label="检索与筛选">
      <div className="jp-filter__head">
        <span className="ed-label">02 / 检索与筛选</span>
        <span className="ed-label">SEARCH &amp; FILTER</span>
      </div>

      <div className="jp-filter__row">
        <form className="jp-filter__form" role="search" onSubmit={submit}>
          <label className="jp-filter__label" htmlFor="jp-search-input">检索 / SEARCH</label>
          <div className="jp-filter__field">
            <span className="jp-filter__caret" aria-hidden="true">/</span>
            <input
              id="jp-search-input"
              type="search"
              value={keyword}
              onChange={event => onKeywordChange(event.target.value)}
              placeholder="标题、摘要、正文、标签…"
              autoComplete="off"
            />
            <button type="submit" className="jp-filter__submit">检索</button>
          </div>
        </form>

        <div className="jp-filter__cats" role="group" aria-label="按分类筛选">
          <button
            type="button"
            className="jp-chip"
            aria-pressed={!active.cat}
            onClick={() => onSelectCat('')}
          >
            全部 <b>{total}</b>
          </button>
          {categories.map(category => (
            <button
              key={category.name}
              type="button"
              className="jp-chip"
              aria-pressed={active.cat === category.name}
              onClick={() => onSelectCat(category.name)}
            >
              {category.name} <b>{category.count}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="jp-filter__status">
        <p className="jp-filter__result" aria-live="polite">
          {hasFilters ? '筛选结果 ' : '本期共 '}
          <b>{resultCount}</b> 篇
        </p>
        {hasFilters ? (
          <div className="jp-filter__tags">
            {active.tag ? (
              <span className="jp-filter__tag">
                标签：{active.tag}
                <button type="button" aria-label={'移除标签筛选 ' + active.tag} onClick={onClearTag}>×</button>
              </span>
            ) : null}
            {active.cat ? (
              <span className="jp-filter__tag">
                分类：{active.cat}
                <button type="button" aria-label={'移除分类筛选 ' + active.cat} onClick={onClearCat}>×</button>
              </span>
            ) : null}
            {active.q ? (
              <span className="jp-filter__tag">
                搜索：{active.q}
                <button type="button" aria-label={'移除搜索关键词 ' + active.q} onClick={onClearQ}>×</button>
              </span>
            ) : null}
            <button type="button" className="jp-filter__clear" onClick={onClearAll}>清除全部筛选</button>
          </div>
        ) : (
          <p className="jp-filter__hint ed-label">按故事重量排版，不按日期 · 点分类或检索会切换成结果视图</p>
        )}
      </div>
    </section>
  );
}
