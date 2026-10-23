import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import RunReplay from '../components/RunReplay';
import {
  SectionMark,
  Seal,
  SliceMark,
  Stamp,
  StatusStamp,
  TagRow,
} from '../components/report/primitives';
import { asset } from '../showcase/parts';
import { findWork, works, workLayerLabels } from '../data/works';
import { wikiDocs } from '../content/wiki/index';
import { usePosts } from '../context/PostsContext';
import { useSEO } from '../hooks/useSEO';
import NotFoundPage from './NotFoundPage';

const privacyLabel: Record<string, string> = {
  public: '公开素材',
  redacted: '示意素材',
  'diagram-only': '仅示意图',
};

export default function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const work = slug ? findWork(slug) : undefined;
  const { allPosts } = usePosts();
  const index = work ? works.findIndex(item => item.slug === work.slug) : -1;
  const prev = index > 0 ? works[index - 1] : undefined;
  const next = index >= 0 && index < works.length - 1 ? works[index + 1] : undefined;

  const relatedWiki = useMemo(
    () => (work ? work.relatedWiki.map(item => wikiDocs.find(doc => doc.slug === item)).filter((doc): doc is NonNullable<typeof doc> => Boolean(doc)) : []),
    [work]
  );
  const relatedPosts = useMemo(
    () => (work ? work.relatedPosts.map(id => allPosts.find(post => post.id === id)).filter((post): post is NonNullable<typeof post> => Boolean(post)) : []),
    [work, allPosts]
  );

  useSEO(
    work
      ? {
          title: `检查报告 · ${work.title}`,
          description: work.tagline,
          keywords: [work.title, ...work.stack.slice(0, 5), ...work.metrics.slice(0, 3).map(metric => metric.value)],
          image: work.evidence.find(item => item.src)?.src,
          type: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: work.title,
            description: work.tagline,
            dateCreated: work.period,
            author: { '@type': 'Person', name: '张栋栋' },
            keywords: work.stack.join(', '),
          },
        }
      : { title: '检查报告不存在', noindex: true }
  );

  if (!work || index < 0) return <NotFoundPage />;

  return (
    <article className="work-detail">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/">读片台</Link>
        <span>/</span>
        <Link to="/work">检查列表</Link>
        <span>/</span>
        <span>{work.no}</span>
      </nav>

      <header className="work-head">
        <div className="work-head__meta">
          <SliceMark label={work.no.replace('P-', '')} size="sm" />
          <span className="report-eyebrow" style={{ margin: 0 }}>STUDY REPORT / {work.no}</span>
          <StatusStamp status={work.status} />
          <Stamp>{privacyLabel[work.privacy]}</Stamp>
          <span className="mono-label">{work.period}</span>
        </div>
        <h1 className="work-head__title">{work.title}</h1>
        <p className="work-head__tagline">{work.tagline}</p>
        <div className="work-head__facts">
          <div>
            <span className="mono-label">我的角色 / ROLE</span>
            <p>{work.role}</p>
          </div>
          <div>
            <span className="mono-label">能力段 / LAYER</span>
            <p>{workLayerLabels[work.layer]}</p>
          </div>
          <div>
            <span className="mono-label">技术栈 / STACK</span>
            <p>{work.stack.join(' · ')}</p>
          </div>
        </div>
        <div className="work-head__actions">
          {work.links.map(link =>
            link.internal ? (
              <Link key={link.label} to={link.url} className="btn btn--ghost btn--sm">{link.label}</Link>
            ) : (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                {link.label} ↗
              </a>
            )
          )}
          {work.repoNote && <span className="mono-label">{work.repoNote}</span>}
        </div>
      </header>

      <div className="work-detail__grid">
        <main className="work-detail__main">
          <section className="work-section" id="evidence" aria-label="证据">
            <SectionMark no="01" title="证据" en="EVIDENCE" aside={`${work.evidence.length} 项`} />
            <div className="evidence-grid">
              {work.evidence.map((item, itemIndex) => (
                <figure className={`evidence-card ${item.src ? 'evidence-card--media' : ''}`} key={`${item.kind}-${itemIndex}`}>
                  {item.src ? (
                    <img src={asset(item.src)} alt={item.caption ?? `${work.title} 证据`} loading="lazy" decoding="async" />
                  ) : (
                    <div className="evidence-card__placeholder" aria-hidden="true">
                      <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                      <b>{item.kind === 'code' ? 'CODE' : item.kind === 'diagram' ? 'DIAGRAM' : 'EVIDENCE'}</b>
                    </div>
                  )}
                  <figcaption>
                    <span>{item.caption ?? '证据'}</span>
                    {item.redacted && <em>示意</em>}
                    {item.pending && <em>待补充</em>}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="metric-grid">
              {work.metrics.map(metric => (
                <div className={`metric ${metric.pending ? 'metric--pending' : ''}`} key={metric.label}>
                  <span className="metric__value metric__value--sm">{metric.value}</span>
                  <span className="metric__label">{metric.label}</span>
                  <span className="metric__source">
                    {metric.pending ? '待补充' : `来源 · ${metric.source ?? '项目记录'}`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="work-section" id="judgement" aria-label="问题与判断">
            <SectionMark no="02" title="问题与判断" en="JUDGEMENT" />
            <div className="work-prose">
              <p>{work.why}</p>
              <p>{work.solution}</p>
            </div>
          </section>

          {work.replay && (
            <section className="work-section" id="replay" aria-label="运行回放">
              <SectionMark no="03" title="运行回放" en="REPLAY" aside="预录 · 可暂停" />
              <RunReplay title={work.replay.title} events={work.replay.events} />
            </section>
          )}

          <section className="work-section" id="decisions" aria-label="决策与取舍">
            <SectionMark no="04" title="决策与取舍" en="DECISIONS" />
            <div className="decisions">
              {work.decisions.map((decision, decisionIndex) => (
                <div className="decision" key={decision.title}>
                  <span className="decision__no">{String(decisionIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{decision.title}</h3>
                    <p>{decision.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="marginal-note">
              <span className="marginal-note__label">未做之事 / TRADE-OFFS</span>
              {work.tradeoffs}
            </div>
          </section>

          <section className="work-section" id="sources" aria-label="证据与来源">
            <SectionMark no="05" title="证据与来源" en="SOURCES" />
            <div className="work-sources">
              <ul>
                {work.sourceRefs.map(source => <li key={source}>{source}</li>)}
              </ul>
              <div className="work-privacy">
                <span className="mono-label">隐私边界</span>
                <p>
                  {work.privacy === 'public'
                    ? '公开素材，不含客户隐私数据。'
                    : work.privacy === 'redacted'
                      ? '界面已裁剪 / 替换，不含客户原始数据。'
                      : '仅公开架构与方法示意。'}
                </p>
              </div>
            </div>
          </section>

          {(relatedWiki.length > 0 || relatedPosts.length > 0) && (
            <section className="work-section" id="related" aria-label="相关阅读">
              <SectionMark no="06" title="相关阅读" en="REFERENCES" />
              <div className="related-cols">
                {relatedWiki.length > 0 && (
                  <div>
                    <div className="mono-label">知识库 / WIKI</div>
                    <div className="article-list">
                      {relatedWiki.map(doc => (
                        <Link to={`/wiki/${doc.slug}`} className="index-row" key={doc.slug}>
                          <span className="index-row__no">WIKI</span>
                          <span className="index-row__title">{doc.title}</span>
                          <span className="index-row__meta">{doc.layer}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedPosts.length > 0 && (
                  <div>
                    <div className="mono-label">文章 / ARTICLES</div>
                    <div className="article-list">
                      {relatedPosts.map(post => (
                        <Link to={`/posts/${post.id}`} className="index-row" key={post.id}>
                          <span className="index-row__no">LOG</span>
                          <span className="index-row__title">{post.title}</span>
                          <span className="index-row__meta">{post.date}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <nav className="work-prevnext" aria-label="相邻项目">
            {prev ? (
              <Link to={`/work/${prev.slug}`} className="prevnext__item">
                <span className="mono-label">← {prev.no}</span>
                <span className="prevnext__title">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/work/${next.slug}`} className="prevnext__item prevnext__item--right">
                <span className="mono-label">{next.no} →</span>
                <span className="prevnext__title">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        </main>

        <aside className="work-aside">
          <div className="work-score">
            <div className="mono-label">核心指标 / SCORE</div>
            {work.metrics.slice(0, 4).map(metric => (
              <div className="work-score__row" key={metric.label}>
                <b>{metric.value}</b>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <div className="work-toc">
            <div className="mono-label">本卷目录 / CONTENTS</div>
            <a href="#evidence">01 证据</a>
            <a href="#judgement">02 问题与判断</a>
            {work.replay && <a href="#replay">03 运行回放</a>}
            <a href="#decisions">04 决策与取舍</a>
            <a href="#sources">05 证据与来源</a>
            {(relatedWiki.length > 0 || relatedPosts.length > 0) && <a href="#related">06 相关阅读</a>}
          </div>
          <div className="work-seal">
            <Seal lines={['张栋栋', '北省']} size="sm" />
            <span className="mono-label">检查报告 · {work.no}</span>
          </div>
        </aside>
      </div>
    </article>
  );
}
