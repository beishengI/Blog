import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { BlogConfig } from '../types';

/** 02 · 终端命令行：等宽字、提示符、ls 式清单。 */
export default function TerminalHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div className="font-mono">
      <div className="overflow-hidden rounded-brand border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-surface-alt px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.8 }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-accent)', opacity: 0.8 }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-text-muted)', opacity: 0.8 }} />
          <span className="ml-2 truncate text-xs text-muted">~/{config.site.title} — zsh</span>
        </div>

        <div className="p-5 text-sm leading-relaxed">
          <p className="break-words text-primary">$ whoami</p>
          <p className="mt-1 text-muted">{config.site.author}</p>

          <p className="mt-3 break-words text-primary">$ cat about.txt</p>
          <p className="mt-1 text-muted">{config.site.bio}</p>

          <p className="mt-4 break-words text-primary">$ ls -lt posts/</p>
          <ul className="mt-2 -mx-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/posts/${p.id}`}
                  className="term-row rounded px-2 py-1.5 transition-colors hover:bg-surface hover:text-primary"
                >
                  <span className="whitespace-nowrap text-muted">{p.date}</span>
                  <span className="whitespace-nowrap text-muted">{String(p.readingTime).padStart(2, '0')}m</span>
                  <span className="truncate">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 break-words text-primary">
            $ <span className="animate-pulse">▊</span>
          </p>
        </div>
      </div>
    </div>
  );
}
