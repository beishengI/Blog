import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { Seal, SliceMark } from './report/primitives';

export default function Footer() {
  const { config } = useConfig();
  const { site } = config;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Seal lines={['张栋栋', '北省']} size="sm" label="张栋栋 · 北省印章" />
            <div>
              <div className="site-footer__title">让模型，在真实系统里<br />跑起来。</div>
              <p className="site-footer__note">
                个人读片报告：7 项工程项目、2 套企业系统、30 篇 Agent 知识文档。
                每个数字都标注来源；没做完的事写「待补充」，不编造。
              </p>
            </div>
          </div>

          <div className="site-footer__cols">
            <div className="site-footer__col">
              <h3>索引</h3>
              <Link to="/">读片台</Link>
              <Link to="/work">项目</Link>
              <Link to="/posts">文章</Link>
              <Link to="/wiki">知识库</Link>
            </div>
            <div className="site-footer__col">
              <h3>更多</h3>
              <Link to="/resume">简历</Link>
              <Link to="/about">关于</Link>
              <Link to="/archive">归档</Link>
              <Link to="/tags">标签</Link>
              <Link to="/admin">管理</Link>
            </div>
            <div className="site-footer__col">
              <h3>联系</h3>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a href={`https://github.com/${site.contact.github}`} target="_blank" rel="noreferrer">
                github.com/{site.contact.github}
              </a>
              <span className="site-footer__phone">{site.contact.phoneMasked}</span>
              <a href={`${import.meta.env.BASE_URL}rss.xml`} target="_blank" rel="noreferrer">RSS 订阅</a>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {year} {site.name} · {site.handle} · 湖北 · 武汉</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SliceMark label="BS" size="sm" ghost />
            React + Vite · HyperFrames · 无第三方字体 / CDN
          </span>
        </div>
      </div>
    </footer>
  );
}
