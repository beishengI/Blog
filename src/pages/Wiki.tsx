import { Link } from 'react-router-dom';
import { wikiDocs, WIKI_LAYERS } from '../content/wiki';
import { useConfig } from '../context/ConfigContext';

export default function Wiki() {
  const { config } = useConfig();
  return (
    <div className="content-max mx-auto space-y-10">
      <header>
        <p className="kicker">LLM Agent 知识库</p>
        <h1 className="font-heading mt-2 text-3xl font-bold">LLM Wiki 知识库</h1>
        <p className="mt-3 text-muted">
          覆盖 Agent 构建的<span className="text-fg">理论、上下文、记忆、安全、可观测、工具选型、开发流程、质量保障、检索、协作编排、工程全景、评测、协同进化、国产工具链、经济性</span>等 16 大领域、30 篇文档。点击任一篇进入阅读，内部链接已自动串联为站内跳转。
        </p>
      </header>

      {WIKI_LAYERS.map((layer) => {
        const docs = wikiDocs.filter((d) => d.layer === layer);
        if (!docs.length) return null;
        return (
          <section key={layer}>
            <h2 className="font-heading mb-4 border-b border-border pb-2 text-xl font-semibold">
              {layer}
              <span className="ml-2 text-sm font-normal text-muted">{docs.length} 篇</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => (
                <Link
                  key={d.slug}
                  to={`/wiki/${d.slug}`}
                  className="group rounded-brand border border-border p-5 transition-colors hover:border-primary"
                >
                  <h3 className="font-heading font-semibold leading-snug group-hover:text-primary">{d.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{d.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
