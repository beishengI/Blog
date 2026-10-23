import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useSEO } from '../hooks/useSEO';
import { Reveal } from '../components/report/primitives';
import Hero from './Hero';
import {
  CapabilityMap,
  Contact,
  EvidenceBand,
  EvidenceTicker,
  Experience,
  Positioning,
  SelectedWorks,
  WritingIndex,
} from './sections';
import ChapterCinema from './ChapterCinema';
import NumberBand from './NumberBand';
import ReportRail from './ReportRail';

export default function ShowcasePage() {
  const { config } = useConfig();
  const { site } = config;
  const [active, setActive] = useState('film');

  useSEO({
    description:
      '张栋栋 · 智能医学工程 2027 届，全栈开发 / AI 应用。7 项工程作品：医学影像分割、32B 推理服务、合同预审智能体、SCP 取数、MES、低代码迁移与在线教育平台。',
    keywords: [
      '张栋栋',
      '全栈开发',
      'AI 应用',
      '医学影像',
      'Agent',
      'RAG',
      '模型部署',
      'MES',
      '低代码',
      '作品集',
    ],
    image: `${site.url?.replace(/\/+$/, '') ?? ''}/showcase/og-cover.jpg`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.name,
      alternateName: site.handle,
      jobTitle: '全栈开发工程师 · AI 应用',
      description: site.bio,
      url: site.url,
      sameAs: [`https://github.com/${site.github}`],
      alumniOf: { '@type': 'CollegeOrUniversity', name: '湖北医药学院' },
      knowsAbout: [
        'AI Agent',
        'RAG',
        '模型推理服务',
        '医学影像分割',
        'MES',
        '低代码平台',
        'RPA',
        '数据迁移',
      ],
    },
  });

  return (
    <>
      <Hero active={active} onChange={setActive} />
      <EvidenceTicker />
      <ReportRail />
      <div className="home-sections shell">
        <Reveal><EvidenceBand /></Reveal>
        <Reveal><Positioning /></Reveal>
        <Reveal><NumberBand /></Reveal>
        <Reveal><SelectedWorks /></Reveal>
      </div>
      <ChapterCinema />
      <div className="home-sections shell">
        <Reveal><CapabilityMap /></Reveal>
        <Reveal><Experience /></Reveal>
        <Reveal><WritingIndex /></Reveal>
        <Reveal><Contact /></Reveal>
      </div>
    </>
  );
}
