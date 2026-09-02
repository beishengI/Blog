import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getWikiDoc, loadWikiContent } from '../content/wiki';
import ArticleDetail from '../components/ArticleDetail';
import { parseHeadings } from '../utils/toc';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { useReadingProgress } from '../hooks/useReadingProgress';
import StickyTOC from '../components/StickyTOC';
import ReadingProgress from '../components/ReadingProgress';
import { useConfig } from '../context/ConfigContext';

export default function WikiDetail() {
  const { slug } = useParams();
  const { config } = useConfig();
  const doc = slug ? getWikiDoc(slug) : undefined;
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!slug) {
      setStatus('missing');
      return;
    }
    let alive = true;
    setStatus('loading');
    setContent('');
    loadWikiContent(slug)
      .then((c) => {
        if (alive) {
          setContent(c);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (alive) setStatus('missing');
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const headings = useMemo(() => parseHeadings(content), [content]);
  const activeId = useActiveHeading(headings.map((h) => h.id));
  const progress = useReadingProgress();

  if (status === 'missing') {
    return (
      <div className="py-20 text-center text-muted">
        文档不存在 · <Link to="/wiki" className="text-primary">返回知识库</Link>
      </div>
    );
  }
  if (status === 'loading') {
    return <div className="py-20 text-center text-muted">加载中…</div>;
  }

  return (
    <article className="content-max mx-auto">
      <ReadingProgress progress={progress} />
      <Link to="/wiki" className="text-sm text-muted hover:text-primary">← 返回知识库</Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-primary">{doc?.layer}</span>
      </div>
      <h1 className="font-heading mt-2 text-3xl font-bold">{doc?.title}</h1>
      {config.features.toc && headings.length > 0 && (
        <StickyTOC headings={headings} activeId={activeId} progress={progress} />
      )}
      <ArticleDetail content={content} />
    </article>
  );
}
