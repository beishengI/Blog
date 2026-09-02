import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import { BlogConfig } from '../types';

/** 11 · 时间轴：中央 dateline + 左右交替笔记卡片（xl 才分列，窄屏自动单列）。 */
export default function TimelineHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-primary">{config.site.author}</p>
      <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">实验记录 · EXPERIMENT LOG</h1>

      <div className="relative mt-8 pl-8 xl:pl-0">
        {/* 时间轴：小屏靠左，xl 居中 */}
        <div className="pointer-events-none absolute inset-y-0 left-3 w-px bg-border xl:left-1/2 xl:-translate-x-1/2" />
        <div className="grid gap-8 xl:grid-cols-2 xl:gap-x-[var(--gap)]">
          {posts.map((p, i) => {
            const onRight = i % 2 === 1;
            return (
              <article
                key={p.id}
                className={`relative min-w-0 ${onRight ? 'xl:col-start-2 xl:pl-10' : 'xl:col-start-1 xl:pr-10'}`}
              >
                <span
                  className={`absolute top-3 h-3 w-3 rounded-full bg-primary -left-[26px] ${
                    onRight ? 'xl:-left-4 xl:right-auto' : 'xl:-right-4 xl:left-auto'
                  }`}
                />
                <ArticleCard post={p} />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
