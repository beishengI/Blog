import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { BlogConfig } from '../types';

/** 10 · 深度分层舞台：mesh 渐变背景 + 前景玻璃芯片。 */
export default function DepthHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  const featured = posts[0];
  if (!featured) return null;

  return (
    <div className="depth-bg grain relative overflow-hidden rounded-brand flex min-h-[60vh] flex-col justify-center p-8">
      <div className="relative z-10">
        <p className="text-sm text-primary">{config.site.author} · 知识空间</p>
        <h1 className="font-heading mt-2 text-4xl font-bold leading-tight md:text-5xl">{config.site.title}</h1>
        <p className="mt-3 max-w-xl text-muted">{config.site.bio}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/posts" className="rounded-brand bg-primary px-4 py-2 text-sm text-white">浏览文章</Link>
          <Link
            to="/about"
            className="rounded-brand border border-border px-4 py-2 text-sm backdrop-blur-md"
          >
            关于我
          </Link>
        </div>
      </div>

      <div className="relative z-20 mt-10">
        <Link
          to={`/posts/${featured.id}`}
          className="block w-full rounded-brand p-5 shadow-2xl backdrop-blur-md md:w-96"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 65%, transparent)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span className="chip chip-primary">{featured.readingTime} min</span>
          <h3 className="font-heading mt-2 text-lg font-semibold leading-snug line-clamp-2">{featured.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{featured.excerpt}</p>
        </Link>
      </div>
    </div>
  );
}
