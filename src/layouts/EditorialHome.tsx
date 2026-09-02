import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import FeatureCard from '../components/FeatureCard';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { BlogConfig } from '../types';

/** 08 · 杂志编辑风：巨幕标题 + 非对称拼贴 + 色带。 */
export default function EditorialHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  // 滚动字幕内容：由文章标签派生，标签为空时回退到栏目名，保证随内容变化且不为空。
  const marquee: string[] = Array.from(
    new Set([
      ...posts.flatMap((p) => p.tags),
      ...posts.map((p) => p.category),
    ])
  ).slice(0, 12);
  const PICK_COUNT = 2;
  const featured = posts[0];
  const pick = posts.slice(1, 1 + PICK_COUNT);
  // 精选之后剩余的都进「最新文章」，文章数量变化时不会出现空白区块
  const latest = posts.slice(1 + PICK_COUNT);
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const catStats = categories.map((c) => ({ c, n: posts.filter((p) => p.category === c).length }));
  const tagCount = Array.from(new Set(posts.flatMap((p) => p.tags))).length;
  const lastYear = posts[0]?.date ? new Date(posts[0].date).getFullYear() : new Date().getFullYear();
  const marqueeLoop = [...marquee, ...marquee];
  if (!featured) return null;

  return (
    <div className="relative">
      {/* HERO · 非对称巨幕（仅在 xl 并排，避免侧栏压缩主栏时挤压） */}
      <section className="relative">
        <div className="grid items-start gap-[var(--gap)] xl:grid-cols-12">
          <Reveal className="min-w-0 xl:col-span-8" delay={0}>
            <span className="kicker">VOL.{String(posts.length).padStart(2, '0')} — {config.site.bio}</span>
            <h1 className="font-heading mt-4 leading-[0.9]">
              <span className="block text-5xl font-extrabold md:text-6xl xl:text-7xl">医学</span>
              <span className="block text-5xl font-extrabold md:text-6xl xl:text-7xl display-outline">× AI</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{config.site.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/posts"
                className="group inline-flex items-center gap-2 rounded-brand bg-primary px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                浏览文章 <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-brand border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                关于我
              </Link>
            </div>
          </Reveal>

          <Reveal className="min-w-0 xl:col-span-4" delay={120}>
            <Link
              to={`/posts/${featured.id}`}
              className="group relative block overflow-hidden rounded-brand p-6 text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 75%, var(--color-primary)))',
              }}
            >
              <span className="text-xs uppercase tracking-[0.25em] opacity-80">本期头条 · FEATURED</span>
              <h3 className="font-heading mt-3 text-xl font-bold leading-snug line-clamp-2 xl:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm opacity-90">{featured.excerpt}</p>
              <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                <span className="whitespace-nowrap">{featured.readingTime} 分钟阅读</span>
                <Icon name="arrow" size={16} className="ml-auto transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 滚动字幕 */}
      <div className="marquee my-12">
        <div className="marquee__track">
          {marqueeLoop.map((w, i) => (
            <span key={i} className="item">
              {w}<span className="dot">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* 本期精选 · 非对称拼贴 */}
      <section className="mb-14">
        <Reveal className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="kicker">EDITOR&apos;S PICK</span>
            <h2 className="font-heading mt-2 text-3xl font-bold md:text-4xl">本期精选</h2>
          </div>
          <Link to="/posts" className="text-sm text-primary">全部 →</Link>
        </Reveal>
        <div className="grid gap-[var(--gap)] xl:grid-cols-12">
          <Reveal className="min-w-0 xl:col-span-7" delay={0}>
            {pick[0] && <FeatureCard post={pick[0]} variant="tall" className="h-full min-h-[340px]" />}
          </Reveal>
          <div className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-5">
            {pick.map((p, i) => (
              <Reveal key={p.id} delay={120 + i * 100} className="min-w-0">
                <FeatureCard post={p} variant={i % 2 ? 'invert' : 'default'} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 栏目 · 错位拼贴（pb 抵消 translateY 位移，防止压到下一区块） */}
      <section className="mb-14">
        <Reveal className="mb-6">
          <span className="kicker">COLUMNS</span>
          <h2 className="font-heading mt-2 text-3xl font-bold md:text-4xl">研究栏目</h2>
        </Reveal>
        <div className="grid-auto pb-12">
          {catStats.map((s, i) => (
            <Reveal
              key={s.c}
              delay={i * 110}
              className={`min-w-0 ${i % 3 === 1 ? 'collage-offset-2' : i % 3 === 2 ? 'collage-offset-1' : ''}`}
            >
              <Link
                to="/posts"
                className="group block rounded-brand border border-border bg-surface p-6 transition-transform hover:-translate-y-1.5 hover:border-primary"
              >
                <span className="font-heading text-4xl font-black text-primary/30 transition-colors group-hover:text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading mt-3 text-xl font-bold">{s.c}</h3>
                <p className="mt-1 text-sm text-muted">{s.n} 篇文章 · 持续更新</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 统计色带 */}
      <Reveal className="mb-14">
        <div className="stat-band">
          <div className="stat-band__grid">
            <div><div className="num">{posts.length}</div><div className="lbl">篇技术文章</div></div>
            <div><div className="num">{categories.length}</div><div className="lbl">个研究栏目</div></div>
            <div><div className="num">{tagCount}</div><div className="lbl">个技术标签</div></div>
            <div><div className="num">{lastYear}</div><div className="lbl">更新至今</div></div>
          </div>
        </div>
      </Reveal>

      {/* 最新文章 */}
      <section>
        <Reveal className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-heading text-2xl font-bold">最新文章</h2>
          <Link to="/posts" className="text-sm text-primary">全部 →</Link>
        </Reveal>
        <div className="grid-auto">
          {latest.map((p, i) => (
            <Reveal key={p.id} delay={i * 80} className="min-w-0"><ArticleCard post={p} /></Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
