import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { usePosts } from '../context/PostsContext';
import { Post } from '../data/posts';
import { useSEO } from '../hooks/useSEO';

interface MonthGroup {
  /** 两位月份字符串，如 "09" */
  month: string;
  items: Post[];
}

interface YearGroup {
  /** 四位年份字符串，如 "2026" */
  year: string;
  months: MonthGroup[];
}

/** 锚点 chips 样式（与 ArticleList 筛选 chips 风格一致，语义令牌类） */
const CHIP_CLS =
  'rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary';

/**
 * 文章归档页：按「年 → 月」两级分组展示全部已发布文章。
 * 分组逻辑页面内 useMemo 完成，不建独立 util。
 */
export default function ArchivePage() {
  const { allPosts } = usePosts();
  useSEO({ title: '归档' });

  // 分组：年降序 → 月降序 → 月内 date 降序（同日按 title 保证稳定）
  const groups = useMemo<YearGroup[]>(() => {
    const byYear = new Map<string, Post[]>();
    allPosts.forEach((p) => {
      const year = p.date.slice(0, 4);
      const arr = byYear.get(year);
      if (arr) arr.push(p);
      else byYear.set(year, [p]);
    });
    return [...byYear.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
      .map(([year, yearPosts]) => {
        const byMonth = new Map<string, Post[]>();
        yearPosts.forEach((p) => {
          const month = p.date.slice(5, 7);
          const arr = byMonth.get(month);
          if (arr) arr.push(p);
          else byMonth.set(month, [p]);
        });
        const months = [...byMonth.entries()]
          .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
          .map(([month, items]) => ({
            month,
            items: items.sort((a, b) =>
              a.date < b.date ? 1 : a.date > b.date ? -1 : a.title < b.title ? 1 : a.title > b.title ? -1 : 0
            ),
          }));
        return { year, months };
      });
  }, [allPosts]);

  const scrollToYear = (year: string) => {
    document.getElementById(`y-${year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">归档</h1>
      <p className="text-sm text-muted">
        共 {allPosts.length} 篇文章 · 跨 {groups.length} 个年份
      </p>

      {allPosts.length === 0 && <p className="text-sm text-muted">暂无文章</p>}

      {/* 年份锚点 chips：仅 ≥2 个年份时显示 */}
      {groups.length >= 2 && (
        <div className="flex flex-wrap gap-2" role="navigation" aria-label="年份锚点">
          {groups.map((g) => (
            <button key={g.year} type="button" onClick={() => scrollToYear(g.year)} className={CHIP_CLS}>
              #{g.year}
            </button>
          ))}
        </div>
      )}

      {groups.map((g) => (
        <section key={g.year} id={`y-${g.year}`} className="scroll-mt-24 space-y-3">
          <h2 className="flex items-baseline gap-2 font-heading text-2xl font-bold">
            {g.year}
            <span className="text-sm font-normal text-muted">{g.months.reduce((n, m) => n + m.items.length, 0)} 篇</span>
          </h2>
          {g.months.map((m) => (
            <div key={m.month}>
              <h3 className="font-semibold text-sm text-muted">
                {parseInt(m.month, 10)}月
              </h3>
              <ul className="divide-y divide-border">
                {m.items.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2">
                    <span className="shrink-0 font-mono text-sm text-muted tabular-nums">
                      {p.date.slice(5)}
                    </span>
                    <Link
                      to={`/posts/${p.id}`}
                      className="text-sm hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <span className="text-xs text-muted">{p.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
