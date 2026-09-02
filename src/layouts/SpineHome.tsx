import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/**
 * 09 · 中轴折叠：中央脊柱线 + 左右交替卡片 + 巨号序号。
 * 用 grid 列定位实现错位（不用 translate），避免溢出主栏。
 */
export default function SpineHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div>
      <div className="flex items-start gap-4">
        <SiteAvatar size="md" className="hidden sm:block" />
        <div className="min-w-0">
          <p className="text-xs tracking-[0.3em] text-primary">
            VOL.{String(posts.length).padStart(2, '0')} — {config.site.bio}
          </p>
          <h1 className="font-heading mt-3 break-words text-4xl font-bold leading-tight md:text-5xl">
            {config.site.title}
          </h1>
          <p className="mt-3 max-w-md text-muted">{config.site.bio}</p>
        </div>
      </div>

      <div className="relative mt-10">
        {/* 脊柱线：小屏靠左，xl 居中 */}
        <div className="pointer-events-none absolute inset-y-0 left-4 w-px bg-border xl:left-1/2 xl:-translate-x-1/2" />
        <div className="grid gap-[var(--gap)] xl:grid-cols-2">
          {posts.map((p, i) => (
            <article
              key={p.id}
              className={`relative min-w-0 pl-12 ${
                i % 2 ? 'xl:col-start-2 xl:pl-10' : 'xl:col-start-1 xl:pl-0 xl:pr-10'
              }`}
            >
              <span className="block font-heading text-3xl font-bold text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mt-2">
                <ArticleCard post={p} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
