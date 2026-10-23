import { Link } from 'react-router-dom';
import { WIKI_LAYERS, wikiDocs } from '../content/wiki/index';
import { writingPaths } from '../data/showcase';
import { PageHead, SliceMark } from '../components/report/primitives';
import { useSEO } from '../hooks/useSEO';

export default function Wiki() {
  useSEO({
    title: '知识库',
    description: '30 篇 LLM Agent 知识文档，四层结构：理论、选型与工具、流程方法论、规范与能力封装。',
    keywords: ['Agent', 'RAG', 'LLM', '知识库', '上下文工程', '评测'],
  });

  return (
    <div>
      <PageHead
        eyebrow="LITERATURE / 知识库"
        title="30 篇 Agent 知识，四层结构"
        lead="不是链接收藏夹：每篇文档单一真相来源，概念之间用相对链接互链，构建期自动改写为站内路由。索引即导航。"
        aside={
          <div style={{ textAlign: 'right' }}>
            <div className="report-eyebrow" style={{ color: 'var(--muted)' }}>DOCUMENTS</div>
            <div className="serif" style={{ fontSize: 42, lineHeight: 1 }}>{wikiDocs.length}</div>
            <div className="mono-label">篇 / 4 层</div>
          </div>
        }
      />

      <div className="page-body">
        <div className="wiki-overview">
          {WIKI_LAYERS.map((layer, index) => {
            const count = wikiDocs.filter(doc => doc.layer === layer).length;
            return (
              <div className="wiki-overview__row" key={layer}>
                <span className="wiki-overview__no">{String(index + 1).padStart(2, '0')}</span>
                <span>{layer}</span>
                <span className="wiki-overview__bar" aria-hidden="true">
                  <i style={{ width: `${(count / Math.max(1, wikiDocs.length)) * 100}%` }} />
                </span>
                <b>{count}</b>
              </div>
            );
          })}
        </div>

        <div className="wiki-paths">
          <div className="mono-label">阅读路径 / 从这里开始</div>
          <div className="wiki-path-list">
            {writingPaths.map(path => (
              <Link key={path.title} to={`/wiki/${path.slugs[0].slug}`} className="wiki-path">
                <span className="mono-label">{path.en}</span>
                <b>{path.title}</b>
                <span>{path.description}</span>
              </Link>
            ))}
          </div>
        </div>

        {WIKI_LAYERS.map(layer => {
          const docs = wikiDocs.filter(doc => doc.layer === layer);
          if (!docs.length) return null;
          return (
            <section className="wiki-layer" key={layer} aria-labelledby={`layer-${layer}`}>
              <div className="wiki-layer__head">
                <SliceMark label={String(WIKI_LAYERS.indexOf(layer) + 1).padStart(2, '0')} size="sm" ghost />
                <h2 className="wiki-layer__title" id={`layer-${layer}`}>{layer}</h2>
                <span className="wiki-layer__count">{docs.length} 篇</span>
                <span className="section-mark__rule" aria-hidden="true" />
              </div>
              <div>
                {docs.map((doc, index) => (
                  <Link to={`/wiki/${doc.slug}`} className="wiki-row" key={doc.slug}>
                    <span className="wiki-row__no">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="wiki-row__title">{doc.title}</h3>
                      <p className="wiki-row__desc">{doc.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="page-foot">
          <p className="mono-label">30 篇原文位于 `src/content/wiki/`，与 GitHub 同源；站内互链自动改写。</p>
          <Link to="/posts" className="btn btn--ghost">去看文章 →</Link>
        </div>
      </div>
    </div>
  );
}
