import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { PageHead, Seal, SectionMark, SliceMark } from '../components/report/primitives';
import { timeline } from '../data/showcase';
import { asset } from '../showcase/parts';
import { useSEO } from '../hooks/useSEO';

export default function About() {
  const { config } = useConfig();
  const { site } = config;
  useSEO({
    title: '关于',
    description: `${site.name} · ${site.role}。${site.bio}`,
    keywords: ['张栋栋', '北省', '关于', '全栈开发', 'AI 应用'],
  });

  return (
    <div>
      <PageHead
        eyebrow="STATEMENT / 自述"
        title="把证据做进系统的人"
        lead="我习惯先把问题拆成可验证的账，再用工程把它做成能上线的系统。"
        aside={<Seal lines={['张栋栋', '北省']} label="张栋栋 · 北省印章" />}
      />

      <div className="page-body">
        <section className="about-intro">
          <div className="about-portrait">
            <img src={asset('/portrait-halftone.webp')} alt={`${site.name} · 半调肖像`} width={800} height={1000} />
            <div className="plate__corner plate__corner--tl" aria-hidden="true" />
            <div className="plate__corner plate__corner--br" aria-hidden="true" />
            <div className="about-portrait__cap">
              <span>SUBJECT / {site.name} · {site.handle}</span>
              <span>{site.location} / 2027</span>
            </div>
          </div>
          <div className="about-copy">
            {site.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            <div className="about-tags">
              {site.research.map(item => <span key={item} className="tag">{item.split('：')[0]}</span>)}
            </div>
            <div className="about-actions">
              <a className="btn btn--primary" href={`mailto:${site.contact.email}`}>邮件联系</a>
              <Link className="btn btn--ghost" to="/resume">查看简历</Link>
              <Link className="btn btn--ghost" to="/work">7 项作品</Link>
            </div>
          </div>
        </section>

        <section className="home-section" style={{ paddingTop: 10 }}>
          <SectionMark no="01" title="工作原则" en="PRINCIPLES" aside="写在项目之后的判断" />
          <div className="principles">
            {site.principles.map((principle, index) => (
              <div className="principle" key={principle.title}>
                <span className="principle__no">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section">
          <SectionMark no="02" title="时间线" en="TIMELINE" aside="2023 – 2027" />
          <div className="timeline">
            {timeline.map(item => (
              <div className="timeline__row" key={`${item.period}-${item.title}`}>
                <div className="timeline__when">{item.period}</div>
                <div>
                  <h3 className="timeline__title">{item.title}</h3>
                  <div className="timeline__org">{item.org}</div>
                  <p className="timeline__body">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section">
          <SectionMark no="03" title="关于本站" en="COLOPHON" aside="React + Vite + HyperFrames" />
          <div className="about-colophon">
            <p>
              这个站点同时是作品集、知识系统与个人设计练习。视觉母题是「个人读片报告」：
              纸本报告的可靠感 + 医学影像灯箱的产品感。
            </p>
            <p>
              界面符号是一枚「切片框」：方框、红角、扫描线，出现在页头、章节、文章与页脚。
              声音是一段三音扫描动机，切换检查项时响一下。
            </p>
            <div className="about-tech">
              <SliceMark label="BS" />
              <span className="mono-label">React 18 · TypeScript · Vite · Tailwind · HyperFrames</span>
            </div>
          </div>
        </section>

        <div className="about-contact">
          <div>
            <div className="mono-label">联系 / CONTACT</div>
            <a href={`mailto:${site.contact.email}`} className="about-contact__mail">{site.contact.email}</a>
            <p>{site.contact.phoneMasked} · {site.contact.location}</p>
          </div>
          <Link to="/resume" className="btn btn--primary">下载简历 PDF →</Link>
        </div>
      </div>
    </div>
  );
}
