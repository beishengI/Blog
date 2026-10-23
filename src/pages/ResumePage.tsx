import { Link } from 'react-router-dom';
import { PageHead, Seal, SectionMark, SliceMark, TagRow } from '../components/report/primitives';
import { asset } from '../showcase/parts';
import {
  resumeCertificates,
  resumeEducation,
  resumeFacts,
  resumeHero,
  resumeHonors,
  resumeInternship,
  resumeProjects,
  resumePublication,
  resumeSkills,
  resumeSummary,
} from '../data/resume';
import { useSEO } from '../hooks/useSEO';

export default function ResumePage() {
  useSEO({
    title: '简历',
    description:
      '张栋栋 · FDE / 软件开发工程师（医学影像 AI · 全栈交付）· 湖北医药学院智能医学工程 2027 届。7 项工程作品、2 套企业系统、30 篇知识文档、1 篇国际会议论文。',
    keywords: ['张栋栋', '简历', 'FDE', '全栈开发', 'AI 应用', '医学影像', 'MES', 'Agent'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: resumeHero.name,
      alternateName: resumeHero.handle,
      jobTitle: resumeHero.role,
      email: resumeHero.email,
      alumniOf: { '@type': 'CollegeOrUniversity', name: resumeEducation.school },
      sameAs: [`https://github.com/${resumeHero.github}`],
    },
  });

  return (
    <div>
      <PageHead
        eyebrow="CURRICULUM VITAE / 个人报告"
        title={resumeHero.name}
        lead={resumeHero.facts}
        aside={
          <div className="page-head__seal">
            <div className="resume-portrait">
              <img src={asset('/portrait-halftone.webp')} alt="张栋栋 · 半调肖像" width={800} height={1000} />
            </div>
            <Seal lines={['张栋栋', '北省']} label="张栋栋 · 北省印章" />
            <div className="mono-label" style={{ textAlign: 'center', marginTop: 8 }}>2027 届 · 可实习</div>
          </div>
        }
      />

      <div className="page-body">
        <div className="resume-contact">
          <div>
            <span className="mono-label">求职意向</span>
            <p>{resumeHero.targetRole}</p>
          </div>
          <div>
            <span className="mono-label">联系方式</span>
            <p>
              <a href={`mailto:${resumeHero.email}`}>{resumeHero.email}</a>
              {' · '}
              <a href={`https://github.com/${resumeHero.github}`} target="_blank" rel="noreferrer">github.com/{resumeHero.github}</a>
              {' · '}
              {resumeHero.phoneMasked}
            </p>
          </div>
          <div>
            <span className="mono-label">微信</span>
            <div className="resume-wechat">
              <img src={asset('/wechat-qr.png')} alt="张栋栋 · 微信二维码" width={92} height={92} />
              <p>扫码添加，备注来意与岗位。</p>
            </div>
          </div>
          <div className="resume-contact__actions">
            <a className="btn btn--primary" href={asset(resumeHero.resumePdf)} download>
              下载简历 PDF <span className="btn__arrow">↓</span>
            </a>
            <a className="btn btn--ghost" href={asset(resumeHero.resumePdfFull)} download>
              完整版 · 6 页
            </a>
            <Link to="/about" className="btn btn--ghost">关于我 →</Link>
            <p className="mono-label" style={{ flexBasis: '100%', marginTop: 4 }}>
              PDF · 2026-10 · 一页版 · 公开脱敏版
            </p>
          </div>
        </div>

        <section className="ed-cv" id="cv" aria-labelledby="ed-cv-title">
          <div className="ed-cv__head">
            <span className="ed-cv__no">CV</span>
            <h2 className="ed-cv__title" id="ed-cv-title">简历原件</h2>
            <span className="ed-cv__en">CURRICULUM VITAE / PDF</span>
            <span className="ed-cv__meta">FDE · 2026-10 · 1 页 · 公开脱敏版</span>
          </div>
          <div className="ed-cv__body">
            <a
              className="ed-cv__sheet"
              href={asset(resumeHero.resumePdf)}
              target="_blank"
              rel="noreferrer"
              aria-label="在新窗口查看张栋栋的简历 PDF"
            >
              <span className="ed-cv__tape" aria-hidden="true" />
              <img
                src={asset(resumeHero.resumePdfPreview)}
                alt="张栋栋 · FDE / 软件开发工程师简历 PDF 第一页预览"
                width={1100}
                height={1555}
                loading="lazy"
                decoding="async"
              />
            </a>
            <aside className="ed-cv__side">
              <p className="ed-cv__lead">
                FDE 版一页简历，公开脱敏：电话 {resumeHero.phoneMasked}；GPA、排名与证件照按站点隐私规则处理。
              </p>
              <div className="ed-cv__actions">
                <a className="btn btn--primary" href={asset(resumeHero.resumePdf)} download>
                  下载 PDF <span className="btn__arrow">↓</span>
                </a>
                <a className="btn btn--ghost" href={asset(resumeHero.resumePdf)} target="_blank" rel="noreferrer">
                  新窗口打开 ↗
                </a>
              </div>
              <p className="ed-cv__hint">点击左侧纸张也可直接打开 PDF；移动端可双指放大。</p>
              <details className="ed-cv__embed">
                <summary>在页面内打开 PDF 阅读器</summary>
                <iframe
                  title="张栋栋 · 简历 PDF"
                  src={asset(resumeHero.resumePdf) + '#view=FitH'}
                  loading="lazy"
                />
              </details>
            </aside>
          </div>
        </section>

        <div className="resume-facts" style={{ marginTop: 20 }}>
          {resumeFacts.map(fact => (
            <span key={fact.label} className="resume-fact">
              <b>{fact.value}</b>
              <small>{fact.label}</small>
            </span>
          ))}
        </div>

        <div className="resume-grid" style={{ marginTop: 30 }}>
          <aside className="resume-nav" aria-label="简历目录">
            <div className="mono-label">CONTENTS</div>
            <a href="#cv">原件</a>
            <a href="#summary">摘要</a>
            <a href="#skills">技能</a>
            <a href="#experience">实习</a>
            <a href="#projects">项目</a>
            <a href="#education">教育</a>
            <a href="#publication">学术</a>
            <a href="#honors">荣誉</a>
          </aside>

          <main className="resume-body">
            <section className="resume-block" id="summary">
              <SectionMark no="00" title="摘要" en="SUMMARY" />
              <p className="resume-summary">{resumeSummary}</p>
            </section>

            <section className="resume-block" id="skills">
              <SectionMark no="01" title="技能" en="SKILLS" />
              <div className="resume-skills">
                {resumeSkills.map(group => (
                  <div className="resume-skill" key={group.label}>
                    <span className="resume-skill__label">{group.label}</span>
                    <div className="resume-skill__items">
                      {group.items.map(item => <span key={item}>{item}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="resume-block" id="experience">
              <SectionMark no="02" title="实习" en="EXPERIENCE" />
              <div className="resume-item">
                <div className="resume-item__head">
                  <h3 className="resume-item__title">{resumeInternship.company} · {resumeInternship.role}</h3>
                  <span className="resume-item__meta">{resumeInternship.period}</span>
                </div>
                <ul className="resume-item__points">
                  {resumeInternship.points.map(point => <li key={point}>{point}</li>)}
                </ul>
              </div>
            </section>

            <section className="resume-block" id="projects">
              <SectionMark no="03" title="项目" en="PROJECTS" aside={`${resumeProjects.length} 项`} />
              {resumeProjects.map(project => (
                <div className="resume-item" key={project.name}>
                  <div className="resume-item__head">
                    <h3 className="resume-item__title">{project.name}</h3>
                    <span className="resume-item__meta">{project.period}</span>
                  </div>
                  <div className="resume-item__tag">{project.tag}</div>
                  <ul className="resume-item__points">
                    {project.points.map(point => <li key={point}>{point}</li>)}
                  </ul>
                  <div className="resume-item__foot">
                    <TagRow items={project.stack} />
                    {project.slug && <Link to={`/work/${project.slug}`} className="text-link">检查报告 →</Link>}
                    {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="text-link">GitHub ↗</a>}
                  </div>
                  {project.pending && <p className="resume-pending">待确认 · {project.pending}</p>}
                </div>
              ))}
            </section>

            <section className="resume-block" id="education">
              <SectionMark no="04" title="教育" en="EDUCATION" />
              <div className="resume-item">
                <div className="resume-item__head">
                  <h3 className="resume-item__title">{resumeEducation.school}</h3>
                  <span className="resume-item__meta">{resumeEducation.period}</span>
                </div>
                <div className="resume-item__tag">{resumeEducation.major}</div>
                <p className="resume-summary" style={{ marginTop: 8 }}>{resumeEducation.highlight}</p>
                <TagRow items={resumeEducation.courses} />
              </div>
            </section>

            <section className="resume-block" id="publication">
              <SectionMark no="05" title="学术成果" en="PUBLICATION" />
              <div className="resume-item">
                <div className="resume-item__head">
                  <h3 className="resume-item__title">{resumePublication.title}</h3>
                  <span className="resume-item__meta">{resumePublication.status}</span>
                </div>
                <div className="resume-item__tag">
                  {resumePublication.venue} · {resumePublication.publisher}
                </div>
                <p className="resume-summary" style={{ marginTop: 8 }}>{resumePublication.note}</p>
              </div>
            </section>

            <section className="resume-block" id="honors">
              <SectionMark no="06" title="荣誉 / 证书" en="HONORS" />
              <ul className="resume-honors">
                {resumeHonors.map(honor => <li key={honor}>{honor}</li>)}
              </ul>
              <p className="mono-label" style={{ marginTop: 10 }}>证书 · {resumeCertificates.join(' / ')}</p>
              <p className="resume-pending">
                证书扫描件公开前需遮证书编号/身份证号；默认只在面试材料中提供。
              </p>
            </section>

            <div className="page-foot">
              <SliceMark label="CV" size="sm" ghost />
              <span className="mono-label">简历 PDF / CURRICULUM VITAE</span>
              <Link to="/work" className="btn btn--ghost btn--sm">查看 7 项作品 →</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
