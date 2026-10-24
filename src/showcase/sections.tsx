import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { usePosts } from '../context/PostsContext';
import { WIKI_LAYERS, wikiDocs } from '../content/wiki/index';
import {
  awardItems,
  evidenceBand,
  pipeline,
  skillGroups,
  timeline,
  writingPaths,
} from '../data/showcase';
import { resumeEducation, resumeFacts } from '../data/resume';
import { projectWorks, workLayerLabels, workStatusLabels, type Work } from '../data/works';
import { publicPhone } from '../data/site';
import { Metric, Reveal, SectionMark, Seal, SliceMark, Stamp, StatusStamp, Tag, TagRow } from '../components/report/primitives';
import PipelineTrace from '../components/PipelineTrace';
import { asset } from './parts';

function ProjectThumb({ work }: { work: Work }) {
  const image = work.evidence.find(item => item.src && !item.src.endsWith('.svg'));
  if (image?.src) {
    return (
      <div className="project-row__thumb">
        <img src={asset(image.src)} alt={image.caption ?? `${work.title} 证据图`} loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className="project-row__thumb project-row__thumb--empty" aria-hidden="true">
      <span>{work.no}</span>
      <b>{work.shortTitle ?? work.title}</b>
      <small>{workLayerLabels[work.layer]}</small>
    </div>
  );
}

function ProjectRow({ work }: { work: Work }) {
  return (
    <article className="project-row">
      <ProjectThumb work={work} />
      <div className="project-row__body">
        <div className="project-row__top">
          <span className="project-row__no">{work.no}</span>
          <StatusStamp status={work.status} />
          <span className="mono-label">{workLayerLabels[work.layer]}</span>
          <span className="mono-label">{work.period}</span>
        </div>
        <h3 className="project-row__title">
          <Link to={`/work/${work.slug}`}>{work.title}</Link>
        </h3>
        <p className="project-row__tagline">{work.tagline}</p>
        <p className="project-row__role">我的角色：{work.role}</p>
        <div className="project-row__metrics">
          {work.metrics.slice(0, 2).map(metric => (
            <span className="project-row__metric" key={metric.label}>
              <b>{metric.value}</b>
              <span>{metric.label}</span>
            </span>
          ))}
        </div>
        <div className="project-row__foot">
          <TagRow items={work.stack.slice(0, 3)} />
          <Link to={`/work/${work.slug}`} className="project-row__link">
            调阅卷宗 →
          </Link>
        </div>
      </div>
    </article>
  );
}

const TICKER = [
  'P-01 合同预审 · 判定 100%',
  'P-02 Lite-Mamba · 参数 −83.9%',
  'P-03 Qwen3 · TTFT 412ms',
  'P-04 MES · 14 类追溯节点',
  'P-05 出租车 · 92 表零丢失',
  'P-06 UnionPlore · 4C 国三',
  'P-07 SCP · 66 测试全绿',
  '30 篇 Agent 知识 · 四层互链',
];

export function EvidenceTicker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="evidence-ticker" aria-hidden="true">
      <div className="evidence-ticker__track">
        {doubled.map((item, index) => (
          <span className="evidence-ticker__item" key={`${item}-${index}`}>
            <i>{String((index % TICKER.length) + 1).padStart(2, '0')}</i>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function EvidenceBand() {
  return (
    <section className="home-section" id="evidence" aria-labelledby="evidence-title">
      <SectionMark no="01" title="证据带" en="EVIDENCE" id="evidence-title" aside="每个数字都有出处" />
      <div className="evidence-band">
        {evidenceBand.map(item => (
          <Link key={item.label} to={item.href ?? '/resume'} className="evidence-band__item">
            <span className="evidence-band__value">
              {item.value}
              {item.unit && <small>{item.unit}</small>}
            </span>
            <span className="evidence-band__label">{item.label}</span>
            <span className="evidence-band__source">来源 · {item.source}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Horizontal contact sheet: all seven projects as film plates. */
function PlateStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollLeft / max) * 100)) : 100);
  };

  return (
    <div className="plate-strip">
      <div className="plate-strip__head">
        <span className="mono-label">PLATE INDEX / 接触印样</span>
        <span className="mono-label">横向拖动 · {projectWorks.length} 张底片</span>
      </div>
      <div className="plate-strip__viewport" ref={trackRef} onScroll={onScroll} tabIndex={0} aria-label="七项作品横向索引">
        {projectWorks.map(work => {
          const image = work.evidence.find(item => item.src && !item.src.endsWith('.svg'));
          return (
            <Link className="plate-card" to={`/work/${work.slug}`} key={work.slug}>
              <div className="plate-card__frame">
                {image?.src ? (
                  <img src={asset(image.src)} alt={image.caption ?? `${work.title} 证据图`} loading="lazy" decoding="async" />
                ) : (
                  <div className="plate-card__empty" aria-hidden="true">
                    <span>{work.no}</span>
                    <b>{work.shortTitle ?? work.title}</b>
                  </div>
                )}
                <span className="plate-card__no">{work.no}</span>
                <span className="plate-card__status">{workStatusLabels[work.status]}</span>
              </div>
              <div className="plate-card__body">
                <b>{work.shortTitle ?? work.title}</b>
                <span>{work.metrics[0]?.value} · {work.metrics[0]?.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="plate-strip__bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

export function SelectedWorks() {
  return (
    <section className="home-section" id="studies" aria-labelledby="studies-title">
      <SectionMark no="03" title="检查所见" en="STUDIES" id="studies-title" aside="7 项作品 · 5 个章节" />
      <p className="section-lede">
        按能力链路展开：<strong>感知 → 理解 → 决策 → 执行 → 交付</strong>。
      </p>
      <PlateStrip />
      <div className="section-foot">
        <Link to="/work" className="btn btn--ghost">查看全部项目（含本站） <span className="btn__arrow">→</span></Link>
      </div>
    </section>
  );
}

export function LightboxInterlude() {
  return (
    <section className="lightbox-interlude" aria-label="能力链路速览">
      <div className="shell">
        <div className="lightbox-interlude__meta">
          <span>CHAIN / 07 PROJECTS</span>
          <span>PERCEIVE → UNDERSTAND → DECIDE → EXECUTE → DELIVER</span>
        </div>
        <p className="lightbox-interlude__quote">
          算法 <i>→</i> 服务 <i>→</i> 交付
        </p>
        <div className="lightbox-interlude__ticker">
          {projectWorks.map(work => (
            <Link to={`/work/${work.slug}`} key={work.slug} className="lightbox-interlude__item">
              <span>{work.no}</span>
              {work.shortTitle ?? work.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Positioning() {
  return (
    <section className="home-section" id="diagnosis" aria-labelledby="diagnosis-title">
      <SectionMark no="02" title="诊断意见" en="DIAGNOSIS" id="diagnosis-title" aside="复合型交付" />
      <div className="positioning">
        <div className="positioning__statement">
          <p className="positioning__quote">
            “我不是只做模型，
            <br />
            也不是只写页面。”
          </p>
          <p>
            7 个项目分布在算法训练、推理服务、Agent / 规则、企业系统与旧系统迁移。
            我能把一段模型代码送进 API，也能把一套企业系统迁到新架构；
            更重要的是，我知道每一步该拿什么数字证明自己做对了。
          </p>
          <div className="positioning__tags">
            <Tag>算法 × 工程</Tag>
            <Tag>规则 × Agent</Tag>
            <Tag>模型 × 产线</Tag>
            <Tag>证据 × 取舍</Tag>
          </div>
          <div className="positioning__note">
            <span className="mono-label">判断原则</span>
            <p>先算账再优化 · 判定与解释分离 · 低置信度转人工 · 写下未做之事 · 交付可回滚</p>
          </div>
        </div>
        <PipelineTrace>
          <div className="pipeline" aria-label="从感知到交付的能力链路">
            {pipeline.map((node, index) => (
              <div className="pipeline__node" key={node.no} style={{ transitionDelay: `${index * 140}ms` }}>
                <span className="pipeline__no">{node.no}</span>
                <div>
                  <h3 className="pipeline__title">{node.title}</h3>
                  <div className="pipeline__sub">{node.subtitle}</div>
                  <div className="pipeline__points">
                    {node.points.map(point => <span key={point}>{point}</span>)}
                  </div>
                  <div className="pipeline__works">
                    {node.works.map(slug => {
                      const work = projectWorks.find(item => item.slug === slug);
                      return work ? <Link key={slug} to={`/work/${slug}`} className="tag">{work.shortTitle ?? work.title}</Link> : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PipelineTrace>
      </div>
    </section>
  );
}

export function CapabilityMap() {
  return (
    <section className="home-section" id="protocols" aria-labelledby="protocols-title">
      <SectionMark no="04" title="扫描协议" en="PROTOCOLS" id="protocols-title" aside="能力由项目事实支撑" />
      <p className="section-lede">
        每一项能力，都来自下面这些项目。
      </p>
      <div className="skills">
        {skillGroups.map(group => (
          <div className="skill-row" key={group.label}>
            <div className="skill-row__head">
              <h3 className="skill-row__title">{group.label}</h3>
              <span className="skill-row__en">{group.en}</span>
            </div>
            <div className="skill-row__items">
              {group.items.map(item => <span key={item}>{item}</span>)}
            </div>
            <div className="skill-row__evidence">
              {group.evidence.map(slug => {
                const work = projectWorks.find(item => item.slug === slug);
                return work ? (
                  <Link key={slug} to={`/work/${slug}`}>
                    {work.no} {work.shortTitle ?? work.title} →
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="home-section" id="history" aria-labelledby="history-title">
      <SectionMark no="05" title="经历附页" en="HISTORY" id="history-title" aside="实习 / 教育 / 荣誉" />
      <div className="experience-grid">
        <div>
          <div className="timeline">
            {timeline.map(item => (
              <div className="timeline__row" key={`${item.period}-${item.title}`}>
                <div className="timeline__when">{item.period}</div>
                <div>
                  <h3 className="timeline__title">{item.title}</h3>
                  <div className="timeline__org">{item.org}</div>
                  <p className="timeline__body">{item.body}</p>
                  {item.tags && <TagRow items={item.tags} />}
                </div>
              </div>
            ))}
          </div>
          <div className="resume-facts">
            {resumeFacts.map(fact => (
              <span key={fact.label} className="resume-fact">
                <b>{fact.value}</b>
                <small>{fact.label}</small>
              </span>
            ))}
          </div>
          <p className="mono-label" style={{ marginTop: 10 }}>{resumeEducation.school} · {resumeEducation.major} · {resumeEducation.period}</p>
          <Link to="/resume" className="btn btn--ghost" style={{ marginTop: 14 }}>
            完整简历 <span className="btn__arrow">→</span>
          </Link>
        </div>
        <div className="awards">
          <h3 className="awards__title">荣誉 / 竞赛</h3>
          {awardItems.map(award => (
            <div className="award-row" key={award.title}>
              <span className={`award-row__dot award-row__dot--${award.kind}`} aria-hidden="true" />
              <div>
                <b>{award.title}</b>
                <span>{award.note}</span>
              </div>
            </div>
          ))}
          <p className="mono-label" style={{ marginTop: 12 }}>
            来源 · 简历 PDF / 证书扫描件（公开前遮证书编号）
          </p>
        </div>
      </div>
    </section>
  );
}

export function WritingIndex() {
  const { allPosts } = usePosts();
  const latest = allPosts.slice(0, 4);
  const layerCounts = WIKI_LAYERS.map(layer => ({
    layer,
    count: wikiDocs.filter(doc => doc.layer === layer).length,
  }));

  return (
    <section className="home-section" id="literature" aria-labelledby="literature-title">
      <SectionMark no="06" title="文献索引" en="LITERATURE" id="literature-title" aside="文章 / 学习轨迹 / 知识库" />
      <p className="section-lede">
        每篇文章都从一个具体问题开始，最后落到项目里的做法。
      </p>

      <div className="writing-grid">
        <div>
          <div className="writing-subhead">
            <SliceMark label="WP" size="sm" ghost />
            <span>学习轨迹 / 阅读路径</span>
          </div>
          <div className="paths">
            {writingPaths.map(path => (
              <div className="path-card" key={path.title}>
                <div className="path-card__head">
                  <h3 className="path-card__title">{path.title}</h3>
                  <span className="path-card__en">{path.en}</span>
                </div>
                <p className="path-card__desc">{path.description}</p>
                <div className="path-card__steps">
                  {path.slugs.map((step, index) => (
                    <Link key={step.slug} to={`/wiki/${step.slug}`} className="path-card__step">
                      <span className="path-card__no">{String(index + 1).padStart(2, '0')}</span>
                      <b>{step.note}</b>
                      <span>{step.slug.replace(/_Wiki$/, '')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="writing-subhead">
            <SliceMark label="LOG" size="sm" ghost />
            <span>问题日志 / 最新文章</span>
          </div>
          <div className="article-list">
            {latest.map((post, index) => (
              <Link to={`/posts/${post.id}`} className="article-row" key={post.id}>
                <span className="article-row__no">A{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="article-row__title">{post.title}</h3>
                  <p className="article-row__excerpt">{post.excerpt}</p>
                  <div className="article-row__meta">
                    <span>{post.date}</span>
                    <span>{post.category}</span>
                    <span>{post.readingTime} 分钟</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="knowledge-map" aria-label="知识库四层结构">
            {layerCounts.map(layer => (
              <Link key={layer.layer} to="/wiki" className="knowledge-map__row">
                <span>{layer.layer}</span>
                <span className="knowledge-map__bar" aria-hidden="true">
                  <i style={{ width: `${(layer.count / Math.max(1, wikiDocs.length)) * 100}%` }} />
                </span>
                <b>{layer.count}</b>
              </Link>
            ))}
          </div>
          <div className="section-foot" style={{ justifyContent: 'flex-start' }}>
            <Link to="/posts" className="btn btn--ghost">全部文章</Link>
            <Link to="/wiki" className="btn btn--ghost">知识库 30 篇</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { config } = useConfig();
  const { site } = config;
  const shownPhone = site.contact.phonePublic && publicPhone ? publicPhone : site.contact.phoneMasked;
  const phoneHref = site.contact.phonePublic && publicPhone ? `tel:${publicPhone}` : undefined;
  const wechatQr = site.contact.wechatQr ? asset(site.contact.wechatQr) : '';

  return (
    <section className="home-section contact-section" id="contact" aria-labelledby="contact-title">
      <SectionMark no="07" title="报告签发" en="SIGN-OFF" id="contact-title" aside="可实习 · 2027 届" />
      <div className="contact-layout">
        <div>
          <p className="contact-quote">
            如果下一件事，
            <br />
            需要一个能把模型
            <br />
            送进真实系统的人——
            <br />
            <em>我们可以聊聊。</em>
          </p>
          <p className="contact-note">
            需要完整简历、项目演示或客户授权材料，请邮件联系。
          </p>
          <div className="contact-status">
            <Stamp tone="live" dot>可实习</Stamp>
            <Stamp>2027 届</Stamp>
            <Stamp>武汉 / 远程可谈</Stamp>
          </div>
        </div>

        <div className="contact-grid">
          <div className="contact-block">
            <h3>邮件 / EMAIL</h3>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            <p>最直接的方式；附岗位/JD 我会按证据回。</p>
          </div>
          <div className="contact-block">
            <h3>代码 / GITHUB</h3>
            <a href={`https://github.com/${site.contact.github}`} target="_blank" rel="noreferrer">
              github.com/{site.contact.github}
            </a>
            <p>公开仓库 + 私有项目可面试演示。</p>
          </div>
          <div className="contact-block">
            <h3>电话 / PHONE</h3>
            {phoneHref ? <a href={phoneHref}>{shownPhone}</a> : <span className="contact-phone">{shownPhone}</span>}
            <p>{site.contact.phonePublic ? '已按你的开关公开' : '完整号码请邮件索取'}</p>
          </div>
          <div className="contact-block">
            <h3>微信 / WECHAT</h3>
            {wechatQr ? (
              <img className="contact-qr" src={wechatQr} alt="微信二维码" width={110} height={110} />
            ) : (
              <div className="contact-wechat">
                <span>微信二维码</span>
                <span>待补充</span>
              </div>
            )}
            <p>{wechatQr ? '扫码添加；备注「岗位 + 姓名」更快通过。' : '二维码待补充；可先邮件联系。'}</p>
          </div>
          <div className="contact-block">
            <h3>简历 / PDF</h3>
            <a href={asset(site.resumePdf)} download>下载简历 PDF</a>
            <p>一页版可直接下载；带电话版本请邮件联系。</p>
          </div>
          <div className="contact-block contact-sign">
            <div>
              <div className="mono-label">报告签发</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>{site.name} · {site.handle}</div>
            </div>
            <Seal lines={['张栋栋', '北省']} size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
