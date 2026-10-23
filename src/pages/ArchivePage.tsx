import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import type { Post } from '../data/posts';
import { PageHead, SliceMark } from '../components/report/primitives';
import { useSEO } from '../hooks/useSEO';

interface MonthGroup { month: string; items: Post[] }
interface YearGroup { year: string; months: MonthGroup[] }

export default function ArchivePage() {
  const { allPosts } = usePosts();
  useSEO({ title: '归档', description: '文章归档：按年 / 月索引。' });

  const groups = useMemo<YearGroup[]>(() => {
    const byYear = new Map<string, Post[]>();
    allPosts.forEach(post => {
      const year = post.date.slice(0, 4);
      const arr = byYear.get(year);
      if (arr) arr.push(post);
      else byYear.set(year, [post]);
    });
    return [...byYear.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
      .map(([year, yearPosts]) => {
        const byMonth = new Map<string, Post[]>();
        yearPosts.forEach(post => {
          const month = post.date.slice(5, 7);
          const arr = byMonth.get(month);
          if (arr) arr.push(post);
          else byMonth.set(month, [post]);
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

  return (
    <div>
      <PageHead
        eyebrow="ARCHIVE / 归档"
        title="按时间翻卷"
        lead="文章不是按主题堆叠的目录，是一条按时间展开的问题日志。"
        aside={
          <div style={{ textAlign: 'right' }}>
            <div className="serif" style={{ fontSize: 42, lineHeight: 1 }}>{allPosts.length}</div>
            <div className="mono-label">篇 · {groups.length} 个年份</div>
          </div>
        }
      />
      <div className="page-body">
        {allPosts.length === 0 && <p className="empty-note">暂无文章。</p>}
        <div className="archive">
          {groups.map(group => (
            <section key={group.year} id={`y-${group.year}`} className="archive__year">
              <div className="archive__year-head">
                <SliceMark label={group.year.slice(2)} size="sm" ghost />
                <h2>{group.year}</h2>
                <span className="mono-label">{group.months.reduce((n, m) => n + m.items.length, 0)} 篇</span>
                <span className="section-mark__rule" aria-hidden="true" />
              </div>
              {group.months.map(month => (
                <div className="archive__month" key={month.month}>
                  <div className="mono-label">{parseInt(month.month, 10)} 月</div>
                  <div>
                    {month.items.map(post => (
                      <Link key={post.id} to={`/posts/${post.id}`} className="index-row">
                        <span className="index-row__no">{post.date.slice(5)}</span>
                        <span className="index-row__title">{post.title}</span>
                        <span className="index-row__meta">{post.category}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
        <div className="page-foot">
          <Link to="/tags" className="btn btn--ghost">按标签看 →</Link>
          <Link to="/posts" className="btn btn--ghost">全部文章 →</Link>
        </div>
      </div>
    </div>
  );
}
