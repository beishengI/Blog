import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { postCover } from '../utils/cover';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 14 · 封面瀑布流：CSS 多栏实现，卡片高度自由、列数随容器自适应。 */
export default function MasonryHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div>
      <header className="mb-6 flex items-start gap-4">
        <SiteAvatar size="md" className="hidden sm:block" />
        <div className="min-w-0">
          <p className="kicker">GALLERY</p>
          <h1 className="font-heading mt-2 text-4xl font-bold leading-tight md:text-5xl">{config.site.title}</h1>
          <p className="read-max mt-3 text-muted">{config.site.bio}</p>
        </div>
      </header>

      <div className="masonry-cols min-w-0">
        {posts.map((p, i) => (
          <article key={p.id} className="news-item">
            <Link
              to={`/posts/${p.id}`}
              className="group block overflow-hidden rounded-brand border border-border bg-surface"
            >
              <div
                className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `url(${postCover(p, config)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: i % 2 === 0 ? '4 / 3' : '1 / 1',
                }}
              />
              <div className="p-4">
                <span className="chip chip-primary">{p.category}</span>
                <h3 className="font-heading mt-2 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="whitespace-nowrap">{p.date}</span>
                  <span className="whitespace-nowrap">· {p.readingTime} 分钟</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
