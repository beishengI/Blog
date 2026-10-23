import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWikiDoc, loadWikiContent } from '../content/wiki/index';
import ArticleDetail from '../components/ArticleDetail';
import StickyTOC from '../components/StickyTOC';
import ReadingProgress from '../components/ReadingProgress';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useConfig } from '../context/ConfigContext';
import { useSEO } from '../hooks/useSEO';
import { parseHeadings } from '../utils/toc';
import { SliceMark } from '../components/report/primitives';
import { works } from '../data/works';

export default function WikiDetail() {
  const { slug } = useParams();
  const { config } = useConfig();
  const doc = slug ? getWikiDoc(slug) : undefined;
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useSEO({
    title: doc ? doc.title : '文档不存在',
    description: doc?.description,
    type: 'article',
    jsonLd: doc
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: doc.title,
          description: doc.description,
          author: { '@type': 'Person', name: config.site.author },
        }
      : null,
  });

  useEffect(() => {
    if (!slug) {
      setStatus('missing');
      return;
    }
    let alive = true;
    setStatus('loading');
    setContent('');
    loadWikiContent(slug)
      .then(text => {
        if (alive) {
          setContent(text);
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
  /**
   * 文档正文的 Markdown 通常以 H1 重复页面标题（page head 已经有 H1），
   * 渲染时去掉开头这一个 H1，避免一页两个 H1 的层级混乱；其余正文原样保留。
   */
  const displayContent = useMemo(
    () => content.replace(/^\s*#\s+[^\n]+(?:\n+|$)/, ''),
    [content]
  );
  const activeId = useActiveHeading(headings.map(heading => heading.id));
  const progress = useReadingProgress();
  const relatedWorks = useMemo(
    () => (slug ? works.filter(work => work.relatedWiki.includes(slug)) : []),
    [slug]
  );

  if (status === 'missing') {
    return (
      <div className="not-found">
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">这篇文档不在索引内</h1>
        <p className="not-found__text"><Link to="/wiki" className="text-link">返回知识库</Link></p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="not-found" aria-busy="true">
        <div className="not-found__code" style={{ fontSize: 48 }}>···</div>
        <p className="not-found__text">正在加载文档…</p>
      </div>
    );
  }

  return (
    <article className="wiki-detail">
      <ReadingProgress progress={progress} />
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/wiki">知识库</Link>
        <span>/</span>
        <span>{doc?.layer}</span>
      </nav>

      <header className="wiki-head">
        <div className="article-head__eyebrow">
          <SliceMark label="WIKI" size="sm" />
          <span>{doc?.layer}</span>
          <span>30 篇 / 四层</span>
        </div>
        <h1 className="article-head__title">{doc?.title}</h1>
        <p className="article-head__lead">{doc?.description}</p>
      </header>

      <div className="article-layout">
        <div className="article-main">
          <ArticleDetail content={displayContent} />
          {relatedWorks.length > 0 && (
            <section className="article-related" aria-label="用这篇知识的项目">
              <div className="section-mark">
                <span className="section-mark__no">USE</span>
                <h2 className="section-mark__title">用在这件作品里</h2>
                <span className="section-mark__rule" aria-hidden="true" />
              </div>
              <div className="article-list">
                {relatedWorks.map(work => (
                  <Link key={work.slug} to={`/work/${work.slug}`} className="index-row">
                    <span className="index-row__no">{work.no}</span>
                    <span className="index-row__title">{work.title}</span>
                    <span className="index-row__meta">检查报告 →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <div className="page-foot">
            <Link to="/wiki" className="btn btn--ghost">← 返回知识库</Link>
            <Link to="/posts" className="btn btn--ghost">文章 / 问题日志 →</Link>
          </div>
        </div>
        <aside className="article-aside">
          {config.features.toc && headings.length > 0 && (
            <StickyTOC headings={headings} activeId={activeId} progress={progress} />
          )}
          <div className="article-note">
            <div className="mono-label">单一真相来源</div>
            <p>本文与 GitHub 仓库同源；概念互链在构建期改写为站内路由。</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
