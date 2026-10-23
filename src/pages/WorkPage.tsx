import { Link } from 'react-router-dom';
import { PageHead, Seal, StatusStamp, TagRow, SliceMark } from '../components/report/primitives';
import { asset } from '../showcase/parts';
import { works, workLayerLabels, type Work, type WorkLayer } from '../data/works';
import { useSEO } from '../hooks/useSEO';

const GROUP_ORDER: WorkLayer[] = ['agent', 'model', 'service', 'system', 'delivery', 'meta'];

const GROUP_NOTES: Record<WorkLayer, string> = {
  agent: '让模型在开放环境里可靠地做抽取、编排与判定。',
  model: '把影像变成可计算的指标，再把指标变成可复用的平台。',
  service: '把模型从 notebook 推到能稳定调用的在线服务。',
  system: '把业务规则、状态机与权限做进真实的企业系统。',
  delivery: '迁移、对账、性能治理与回滚：最后一公里最见工程功底。',
  meta: '本站也是一件作品：内容、设计与前端实现同源。',
};

function WorkRow({ work }: { work: Work }) {
  const image = work.evidence.find(item => item.src && !item.src.endsWith('.svg'));
  return (
    <article className="work-row">
      <div className="work-row__no">{work.no}</div>
      <div className="work-row__main">
        <div className="work-row__top">
          <StatusStamp status={work.status} />
          <span className="mono-label">{workLayerLabels[work.layer]}</span>
          <span className="mono-label">{work.period}</span>
          {work.privacy !== 'public' && <span className="stamp stamp--pending">示意</span>}
        </div>
        <h3 className="work-row__title">
          <Link to={`/work/${work.slug}`}>{work.title}</Link>
        </h3>
        <p className="work-row__tagline">{work.tagline}</p>
        <div className="work-row__meta">
          <span>角色 · {work.role}</span>
          <span>证据 · {work.evidence.length} 项 / 指标 {work.metrics.length} 项</span>
        </div>
        <div className="work-row__metrics">
          {work.metrics.slice(0, 3).map(metric => (
            <span key={metric.label}>
              <b>{metric.value}</b> <span>{metric.label}</span>
            </span>
          ))}
        </div>
        <div className="project-row__foot">
          <TagRow items={work.stack.slice(0, 4)} />
          <Link to={`/work/${work.slug}`} className="project-row__link">调阅卷宗 →</Link>
        </div>
      </div>
      {image?.src ? (
        <Link to={`/work/${work.slug}`} className="work-row__thumb" aria-label={`${work.title} 证据图`}>
          <img src={asset(image.src)} alt={image.caption ?? `${work.title} 证据图`} loading="lazy" decoding="async" />
        </Link>
      ) : (
        <div className="work-row__thumb work-row__thumb--empty" aria-hidden="true">
          <span>{work.no}</span>
          <b>{work.shortTitle ?? work.title}</b>
          <small>{workLayerLabels[work.layer]}</small>
        </div>
      )}
    </article>
  );
}

export default function WorkPage() {
  useSEO({
    title: '项目 / 检查列表',
    description: '7 项工程项目 + 本站元案例：AI Agent、医学影像、推理服务、MES、低代码迁移、在线教育平台、RPA 取数。每项附角色、指标、证据与取舍。',
    keywords: ['作品集', 'AI Agent', '医学影像', '推理服务', 'MES', '低代码迁移', 'RPA'],
  });

  return (
    <div>
      <PageHead
        eyebrow="WORKLIST / 检查列表"
        title="七项工程，一条能力链路"
        lead="七个项目，一条能力链：感知 → 理解 → 决策 → 执行 → 交付。"
        aside={
          <div className="page-head__seal">
            <Seal lines={['张栋栋', '北省']} label="张栋栋 · 北省印章" />
            <div className="mono-label" style={{ textAlign: 'center', marginTop: 8 }}>{works.length} 项 / 2023–2027</div>
          </div>
        }
      />

      <div className="page-body">
        <div className="chain-strip" aria-label="能力链路">
          {GROUP_ORDER.slice(0, 5).map((layer, index) => (
            <span key={layer} className="chain-strip__item">
              <b>{String(index + 1).padStart(2, '0')}</b>
              {workLayerLabels[layer]}
            </span>
          ))}
          <Link to="/" className="chain-strip__back">回到读片台 →</Link>
        </div>

        {GROUP_ORDER.map(layer => {
          const items = works.filter(work => work.layer === layer);
          if (items.length === 0) return null;
          return (
            <section className="work-group" key={layer} aria-labelledby={`group-${layer}`}>
              <div className="work-group__head">
                <SliceMark label={String(GROUP_ORDER.indexOf(layer) + 1).padStart(2, '0')} size="sm" />
                <h2 className="work-group__title" id={`group-${layer}`}>{workLayerLabels[layer]}</h2>
                <span className="work-group__note">{GROUP_NOTES[layer]}</span>
                <span className="work-group__count">{String(items.length).padStart(2, '0')} 项</span>
              </div>
              <div className="work-list">
                {items.map(work => <WorkRow key={work.slug} work={work} />)}
              </div>
            </section>
          );
        })}

        <div className="page-foot">
          <p className="mono-label">客户项目已做脱敏；私有仓库可面试演示。</p>
          <Link to="/resume" className="btn btn--ghost">查看完整简历 →</Link>
        </div>
      </div>
    </div>
  );
}
