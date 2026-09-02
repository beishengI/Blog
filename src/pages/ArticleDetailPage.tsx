import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Post } from '../data/posts';
import { usePosts } from '../context/PostsContext';
import ArticleDetail from '../components/ArticleDetail';
import ReadingProgress from '../components/ReadingProgress';
import StickyTOC from '../components/StickyTOC';
import { useConfig } from '../context/ConfigContext';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { parseHeadings } from '../utils/toc';

function NotFound() {
  return (
    <div className="py-20 text-center text-muted">
      文章不存在 · <Link to="/posts" className="text-primary">返回列表</Link>
    </div>
  );
}

function ArticleHeader({ post }: { post: Post }) {
  const { config } = useConfig();
  return (
    <>
      <Link to="/posts" className="text-sm text-muted hover:text-primary">← 返回文章</Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-primary">{post.category}</span>
        {post.draft === true && (
          <span className="rounded-full border border-border px-2 py-0.5 text-muted">草稿</span>
        )}
        <span>{post.date}</span>
        {config.features.readingTime && <span>· {post.readingTime} 分钟阅读</span>}
      </div>
      <h1 className="font-heading mt-2 text-3xl font-bold">{post.title}</h1>
    </>
  );
}

function NormalDetail({ post }: { post: Post }) {
  const { config } = useConfig();
  const headings = useMemo(() => parseHeadings(post.content), [post.content]);
  const activeId = useActiveHeading(headings.map((h) => h.id));
  const progress = useReadingProgress();

  return (
    <article className="content-max mx-auto">
      <ReadingProgress progress={progress} />
      <ArticleHeader post={post} />
      {config.features.toc && headings.length > 0 && (
        <StickyTOC headings={headings} activeId={activeId} progress={progress} />
      )}
      <ArticleDetail content={post.content} />
    </article>
  );
}

function CompanionDetail({ post }: { post: Post }) {
  const [showAI, setShowAI] = useState(false);
  const { config } = useConfig();
  const headings = useMemo(() => parseHeadings(post.content), [post.content]);
  const activeId = useActiveHeading(headings.map((h) => h.id));
  const progress = useReadingProgress();

  const original = (
    <article className="w-full">
      <ReadingProgress progress={progress} />
      <Link to="/posts" className="text-sm text-muted hover:text-primary">← 返回</Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-primary">{post.category}</span>
        {post.draft === true && (
          <span className="rounded-full border border-border px-2 py-0.5 text-muted">草稿</span>
        )}
        <span>{post.date}</span>
      </div>
      <h1 className="font-heading mt-2 text-3xl font-bold">{post.title}</h1>
      {config.features.toc && headings.length > 0 && (
        <StickyTOC headings={headings} activeId={activeId} progress={progress} />
      )}
      <ArticleDetail content={post.content} />
    </article>
  );

  const aiPanel = (
    <aside className="rounded-brand border-2 p-5"
      style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">◆ AI 伴读</p>
      <p className="mt-2 text-sm">{post.aiSummary}</p>
      <h4 className="mt-4 text-sm font-semibold">关键术语</h4>
      <ul className="mt-2 space-y-1 text-xs text-muted">
        {post.terms.map(t => <li key={t}>▸ {t}</li>)}
      </ul>
      <div className="mt-4 h-28 rounded-brand border border-border bg-surface flex items-center justify-center text-[10px] text-muted">
        可解释性热力图（占位）
      </div>
    </aside>
  );

  return (
    <div>
      <div className="hidden md:grid md:grid-cols-[1fr_320px] md:gap-8">
        {original}
        {aiPanel}
      </div>
      <div className="md:hidden">
        {original}
        <button onClick={() => setShowAI(v => !v)}
          className="mt-4 w-full rounded-brand border border-primary py-2 text-sm text-primary">
          ◆ AI 伴读 {showAI ? '收起' : '展开'}
        </button>
        {showAI && <div className="mt-3">{aiPanel}</div>}
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const { config } = useConfig();
  const { getPost } = usePosts();
  const post = id ? getPost(id) : undefined;
  if (!post) return <NotFound />;
  if (config.layout.direction === 'companion') return <CompanionDetail post={post} />;
  return <NormalDetail post={post} />;
}
