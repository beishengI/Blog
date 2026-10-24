import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { Seal } from '../components/report/primitives';
import { film } from '../data/showcase';
import { asset, HeroViewer } from './parts';
import { playScanTone } from '../utils/sound';

export default function Hero({
  active,
  onChange,
}: {
  active: string;
  onChange: (next: string) => void;
}) {
  const { config } = useConfig();
  const { site } = config;

  const playFilm = () => {
    onChange('film');
    playScanTone('open');
    const anchor = document.getElementById('hero-viewer-anchor');
    if (anchor) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      anchor.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }
    // Let the film tab mount before asking the player to start.
    window.setTimeout(() => window.dispatchEvent(new Event('bs-play-film')), 80);
  };

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="shell">
        <div className="hero__meta">
          <div>
            <div className="report-eyebrow">PERSONAL READING REPORT / BS-2026-10</div>
            <div className="report-meta" style={{ marginTop: 8 }}>
              <span>受检者 <b>{site.name}</b></span>
              <span>方向 <b>{site.role}</b></span>
              <span>地点 <b>{site.location}</b></span>
              <span>状态 <b>{site.availability}</b></span>
            </div>
          </div>
          <div className="hero__subject">
            <Link to="/about" className="subject-plate" aria-label="关于张栋栋">
              <img src={asset('/portrait-halftone.webp')} alt="张栋栋 · 半调肖像" width={800} height={1000} />
              <span className="subject-plate__corner subject-plate__corner--tl" aria-hidden="true" />
              <span className="subject-plate__corner subject-plate__corner--br" aria-hidden="true" />
              <span className="subject-plate__cap">SUBJECT / 张栋栋</span>
            </Link>
            <Seal lines={['张栋栋', '北省']} label="张栋栋 · 北省印章" />
          </div>
        </div>

        <div className="hero">
          <div className="hero__grid">
            <div className="hero__copy">
              <div className="hero__kicker">从一张切片，到一条产线。</div>
              <h1 className="hero__title" id="hero-title">
                <span className="hero-line"><span>让模型，</span></span>
                <span className="hero-line"><span>在<em>真实系统</em>里</span></span>
                <span className="hero-line"><span>跑起来。</span></span>
              </h1>
              <p className="hero__lead">
                我是张栋栋，智能医学工程 2027 届。做过医学影像分割、32B 模型服务化、合同预审智能体，
                也把 MES 与出租车平台从旧架构迁到新架构。算法、服务、交付，一条链路亲手跑完。
              </p>

              <div className="hero__actions">
                <button type="button" className="btn btn--primary" onClick={playFilm}>
                  <span aria-hidden="true">▶</span> 播放介绍片 {film.duration}
                </button>
                <a className="btn btn--ghost" href={asset(site.resumePdf)} download>
                  下载简历 PDF <span className="btn__arrow">↓</span>
                </a>
                <a
                  className="btn btn--ghost"
                  href={`https://github.com/${site.github}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub <span className="btn__arrow">↗</span>
                </a>
              </div>

              <button type="button" className="hero__mobile-plate" onClick={playFilm} aria-label="播放介绍片">
                <img src={asset('/showcase/poster.jpg')} alt={`介绍片海报：${film.title}`} width={1600} height={900} />
                <span className="hero__mobile-plate__overlay">
                  <span className="hero__mobile-plate__play">▶</span>
                  <span>播放介绍片 {film.duration}</span>
                  <small>{film.title} / {film.duration}</small>
                </span>
              </button>

              <div className="hero__facts" aria-label="关键证据">
                <div className="hero__fact"><b>7</b><span>项工程项目</span></div>
                <div className="hero__fact"><b>2</b><span>套企业系统</span></div>
                <div className="hero__fact"><b>30</b><span>篇知识文档</span></div>
                <div className="hero__fact"><b>5</b><span>段能力链路</span></div>
              </div>

              <div className="hero__cap">
                <div className="hero__cap-label">复合交付能力 · 从感知到交付</div>
                <div className="hero__cap-list" aria-label="能力链路">
                  <span>感知</span>
                  <span>理解</span>
                  <span>决策</span>
                  <span>执行</span>
                  <span>交付</span>
                </div>
              </div>

              <p className="mono-label" style={{ marginTop: 20 }}>
                5 秒判断：医学影像 AI × 推理服务 × Agent / 规则 × 企业系统全栈
              </p>
              <div className="hero__printmarks" aria-hidden="true">
                <span /> <span /> <span /> <span />
                <b>BS-2026-10 / PLATE 01</b>
              </div>
            </div>

            <div id="hero-viewer-anchor">
              <HeroViewer active={active} onChange={onChange} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
