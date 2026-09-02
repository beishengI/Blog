import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 16 · 数据仪表盘：指标磁贴 + 分类进度条 + 紧凑文章表。 */
export default function DashboardHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const catStats = categories.map((c) => ({ c, n: posts.filter((p) => p.category === c).length }));
  const max = Math.max(...catStats.map((s) => s.n), 1);
  const totalMinutes = posts.reduce((sum, p) => sum + p.readingTime, 0);

  const tiles = [
    { label: '文章总数', value: String(posts.length) },
    { label: '研究栏目', value: String(categories.length) },
    { label: '累计阅读', value: `${totalMinutes} 分` },
    { label: '最近更新', value: posts[0]?.date.slice(5) ?? '—' },
  ];

  return (
    <div className="space-y-[var(--gap)]">
      <header className="flex items-start gap-4">
        <SiteAvatar size="md" className="hidden sm:block" />
        <div className="min-w-0">
          <p className="kicker">DASHBOARD</p>
          <h1 className="font-heading mt-2 text-3xl font-bold md:text-4xl">{config.site.title}</h1>
          <p className="mt-2 text-muted">{config.site.bio}</p>
        </div>
      </header>

      <div className="grid-auto-sm">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-brand border border-border bg-surface p-5">
            <div className="font-heading text-3xl font-bold text-primary">{t.value}</div>
            <div className="mt-1 text-xs text-muted">{t.label}</div>
          </div>
        ))}
      </div>

      <section className="rounded-brand border border-border p-6">
        <h2 className="font-heading text-lg font-semibold">栏目分布</h2>
        <div className="mt-4 space-y-3">
          {catStats.map((s) => (
            <div key={s.c} className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="truncate">{s.c}</span>
                <span className="whitespace-nowrap text-muted">{s.n} 篇</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(s.n / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-brand border border-border">
        <h2 className="border-b border-border p-4 font-heading text-lg font-semibold">最近文章</h2>
        <ul>
          {posts.map((p) => (
            <li key={p.id} className="border-b border-border last:border-0">
              <Link
                to={`/posts/${p.id}`}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
              >
                <span className="chip chip-primary shrink-0">{p.category}</span>
                <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">{p.title}</span>
                <span className="whitespace-nowrap text-xs text-muted">{p.date}</span>
                <span className="whitespace-nowrap text-xs text-muted">{p.readingTime} 分钟</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
