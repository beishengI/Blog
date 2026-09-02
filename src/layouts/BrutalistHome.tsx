import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { BlogConfig } from '../types';

const ECG_SVG = `<svg viewBox="0 0 600 40" preserveAspectRatio="none" class="w-full h-full">
  <polyline points="0,20 120,20 150,20 170,4 190,36 210,20 600,20"
    fill="none" stroke="var(--color-primary)" stroke-width="2"/></svg>`;

/** 13 · 粗野主义：硬边框 + 等宽字 + 心电母题。 */
export default function BrutalistHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div className="font-mono">
      <div className="border-2 border-border p-6">
        <p className="break-words text-xs">[ {config.site.author} / INTELLIGENT MEDICAL ENGINEERING ]</p>
        <h1 className="font-heading mt-2 break-words text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          {config.site.title}
        </h1>
        <div className="mt-4 h-10 w-full" dangerouslySetInnerHTML={{ __html: ECG_SVG }} />
      </div>

      <div className="mt-6 grid gap-0 xl:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} to={`/posts/${p.id}`} className="min-w-0 border-2 border-border p-5 hover:bg-surface">
            <div className="text-xs">[{p.date}]</div>
            <h3 className="font-heading mt-1 text-xl font-bold leading-snug">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
