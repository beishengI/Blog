import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { BlogConfig } from '../types';

/** 07 · 沉浸阅读：单栏宽行距，去掉一切卡片与边框。 */
export default function ReadingHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div className="read-max mx-auto">
      <header className="py-6 text-center">
        <img
          src={config.site.avatar}
          alt={config.site.author}
          className="mx-auto shrink-0 rounded-full bg-bg object-cover"
          style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)' }}
        />
        <h1 className="font-heading mt-4 text-3xl font-bold">{config.site.title}</h1>
        <p className="mt-2 text-muted">{config.site.bio}</p>
      </header>

      <div className="space-y-10">
        {posts.map((p) => (
          <article key={p.id} className="border-b border-border pb-8 last:border-0">
            <div className="text-center text-xs tracking-widest text-muted">{p.date}</div>
            <h2 className="font-heading mt-2 text-center text-2xl font-bold leading-snug">
              <Link to={`/posts/${p.id}`} className="hover:text-primary">{p.title}</Link>
            </h2>
            <p className="mt-3 text-base leading-loose text-muted">{p.excerpt}</p>
            <div className="mt-4 text-center">
              <Link to={`/posts/${p.id}`} className="text-sm text-primary">继续阅读 →</Link>
            </div>
          </article>
        ))}
      </div>

      <div className="py-10 text-center text-muted">◆</div>
    </div>
  );
}
