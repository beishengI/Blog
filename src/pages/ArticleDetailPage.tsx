import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useConfig } from '../context/ConfigContext';
import Comments from '../components/Comments';
import PrevNextNav from '../components/PrevNextNav';
import RelatedPosts from '../components/RelatedPosts';
import { useSEO } from '../hooks/useSEO';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { parseHeadings } from '../utils/toc';
import { renderMarkdown } from '../utils/markdown';
import { recordView, getViewCount } from '../utils/stats';
import {
  articleEditorial,
  editorialFor,
  writingStatus as writingStatusMap,
} from '../data/editorial';
import {
  findSectionIndex,
  splitArticleHtml,
  splitBeforeLastBlockquote,
  type ArticleSectionData,
} from '../utils/articleSections';
import ArticleHeader from '../components/editorial/article/ArticleHeader';
import InkRail from '../components/editorial/article/InkRail';
import ArticleMargin from '../components/editorial/article/ArticleMargin';
import PauseAnchor from '../components/editorial/article/PauseAnchor';
import GraphiteAnchor from '../components/editorial/article/GraphiteAnchor';
import ArticleEnd from '../components/editorial/article/ArticleEnd';

function ArticleNotFound() {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1 className="not-found__title">这篇文章不在卷内</h1>
      <p className="not-found__text">
        可能已移动或删除。
        <Link to="/posts" className="text-link">
          返回文章索引
        </Link>
      </p>
    </div>
  );
}

/**
 * 文章内页 · 编辑式滚动叙事（S01–S08）。
 *
 * 结构：文章头 → 三栏（墨线目录 / 正文 / 页边）→ 文末落款 → 上下篇 / 相关 / 评论。
 * 正文只渲染一次 renderMarkdown，再由 articleSections 拆成章节，
 * 情绪锚点仅插入、不替换任何原有节点。
 */
export default function ArticleDetailPage() {
  const { id } = useParams();
  const { config } = useConfig();
  const { getPost, allPosts } = usePosts();
  const post = id ? getPost(id) : undefined;

  const { prev, next } = useMemo(() => {
    if (!post) return { prev: undefined, next: undefined };
    const index = allPosts.findIndex(item => item.id === post.id);
    if (index < 0) return { prev: undefined, next: undefined };
    return { prev: allPosts[index + 1], next: index > 0 ? allPosts[index - 1] : undefined };
  }, [post, allPosts]);

  const content = post?.content ?? '';

  // 完整正文 HTML 只渲染一次；章节拆分在 memo 里完成，锚点插入不改写原文。
  const rendered = useMemo(() => splitArticleHtml(renderMarkdown(content)), [content]);
  const headings = useMemo(() => (post ? parseHeadings(content) : []), [post, content]);
  const h2Headings = useMemo(() => headings.filter(heading => heading.level === 2), [headings]);

  // 目录 id 与 parseHeadings 同源：优先用渲染后 H2 的 id，异常时回退到目录 id。
  const chapters = useMemo<ArticleSectionData[]>(
    () =>
      rendered.sections.map((section, index) => {
        const fallback = h2Headings[index];
        return {
          id: section.id || fallback?.id || 'ja-section-' + (index + 1),
          title: section.title || fallback?.text || '',
          shortTitle: section.shortTitle || fallback?.text.split(/[:：]/)[0] || '',
          html: section.html,
        };
      }),
    [rendered.sections, h2Headings]
  );

  const chapterIds = useMemo(() => chapters.map(chapter => chapter.id), [chapters]);
  const activeId = useActiveHeading(chapterIds);

  const editorial = post ? articleEditorial[post.id] : undefined;
  const postEditorial = editorialFor(post);

  const pauseAnchor = editorial?.anchors?.find(anchor => anchor.kind === 'pause');
  const graphiteAnchor = editorial?.anchors?.find(anchor => anchor.kind === 'graphite');

  const pauseIndex = useMemo(() => {
    if (!pauseAnchor?.beforeHeading) return -1;
    return findSectionIndex(chapters, pauseAnchor.beforeHeading);
  }, [chapters, pauseAnchor?.beforeHeading]);

  const lastChapter = chapters[chapters.length - 1];
  const tailSplit = useMemo(() => {
    if (!graphiteAnchor?.beforeTailQuote || !lastChapter) return null;
    return splitBeforeLastBlockquote(lastChapter.html);
  }, [graphiteAnchor?.beforeTailQuote, lastChapter]);

  const seoDescription = post ? (post.description ?? post.excerpt) : undefined;
  const seoKeywords = post ? (post.keywords ?? post.tags) : undefined;
  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        datePublished: post.date,
        dateModified: post.updatedAt ?? post.date,
        author: { '@type': 'Person', name: config.site.author },
        description: seoDescription,
        keywords: seoKeywords,
      }
    : null;

  useSEO({
    title: post ? post.title : '文章不存在',
    description: seoDescription,
    keywords: seoKeywords,
    image: post?.cover,
    type: 'article',
    jsonLd,
  });

  // 阅读数：先记录本次浏览，再把最新计数写回 state（首帧显示 0，挂载后更新为 1）。
  const [views, setViews] = useState(0);
  useEffect(() => {
    if (!post) return;
    recordView(post.id);
    setViews(getViewCount(post.id));
  }, [post]);

  /**
   * 情绪锚点真正全幅盖住左右两栏时，把 sticky 的墨线目录 / 页边一并隐藏，
   * 避免它们的边缘在锚点下方露出一条（IO 观察，不监听 scroll）。
   */
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const anchors = Array.from(root.querySelectorAll<HTMLElement>('.ja-pause, .ja-dark'));
    if (anchors.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const covering = new Set<Element>();
    const sync = () => {
      root.classList.toggle('is-anchor-covering', covering.size > 0);
    };
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.intersectionRatio >= 0.2) covering.add(entry.target);
          else covering.delete(entry.target);
        });
        sync();
      },
      { threshold: [0, 0.2, 0.5, 0.9] }
    );
    anchors.forEach(anchor => observer.observe(anchor));
    return () => {
      observer.disconnect();
      root.classList.remove('is-anchor-covering');
    };
  }, [post?.id]);

  if (!post) return <ArticleNotFound />;
  const status = editorial?.writingStatus ?? writingStatusMap[post.id];
  const marginalia = editorial?.marginalia ?? [];

  return (
    <article className="ja-page ed-page" aria-labelledby="ja-title" ref={pageRef}>
      <ArticleHeader
        post={post}
        views={views}
        kicker={editorial?.kicker}
        hand={postEditorial?.hand}
        sections={chapters}
        activeId={activeId}
        showReadingTime={config.features.readingTime}
      />

      <div className="ja-body">
        <InkRail sections={chapters} activeId={activeId} />

        <div className="ja-main">
          {rendered.introHtml && (
            <div className="ja-prose prose ja-prose--intro" dangerouslySetInnerHTML={{ __html: rendered.introHtml }} />
          )}

          {chapters.map((chapter, index) => {
            const isLast = index === chapters.length - 1;
            const tail = isLast ? tailSplit : null;
            const showGraphite = Boolean(tail && graphiteAnchor);
            const headHtml = showGraphite && tail ? tail.headHtml : chapter.html;

            return (
              <Fragment key={chapter.id}>
                {index === pauseIndex && pauseAnchor && <PauseAnchor anchor={pauseAnchor} />}

                <section className="ja-sec" aria-labelledby={chapter.id}>
                  <div className="ja-prose prose" dangerouslySetInnerHTML={{ __html: headHtml }} />
                  {showGraphite && graphiteAnchor && (
                    <>
                      <GraphiteAnchor anchor={graphiteAnchor} />
                      {tail && tail.tailHtml && (
                        <div
                          className="ja-prose prose ja-prose--tail"
                          dangerouslySetInnerHTML={{ __html: tail.tailHtml }}
                        />
                      )}
                    </>
                  )}
                </section>
              </Fragment>
            );
          })}

          <ArticleEnd
            post={post}
            endNote={editorial?.endNote}
            handle={config.site.handle}
            location={config.site.location}
          />
        </div>

        <ArticleMargin post={post} status={status} marginalia={marginalia} sections={chapters} />
      </div>

      <div className="ja-after">
        <PrevNextNav prev={prev} next={next} />
        <RelatedPosts current={post} />

        {config.features.comments !== false && (
          <section className="ja-comments" aria-label="批注与评论">
            <div className="section-mark">
              <span className="section-mark__no">NOTE</span>
              <h2 className="section-mark__title">批注</h2>
              <span className="section-mark__rule" aria-hidden="true" />
            </div>
            <Comments postId={post.id} />
          </section>
        )}
      </div>
    </article>
  );
}
