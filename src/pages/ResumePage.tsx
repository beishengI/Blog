import SiteAvatar from '../components/SiteAvatar';
import Reveal from '../components/Reveal';
import { useSEO } from '../hooks/useSEO';
import {
  resumeHero,
  resumeSkills,
  resumeProjects,
  resumeEducation,
  resumeHonors,
  resumeCertificates,
  resumeSummary,
} from '../data/resume';

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-heading text-2xl font-bold">{children}</h2>;
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}

/**
 * 网页版简历(参考 egoist.dev/asu.html 的分区节奏与 didilili.github.io 的标签/卡片元素)。
 * A4 打印版独立在 public/resume-doc.html(静态文件不能叫 resume.html,
 * 否则 GitHub Pages 干净 URL 会遮蔽本路由);文案原则:只写可核查的事实。
 */
export default function ResumePage() {
  useSEO({ title: '简历', description: '北省 · AI 应用开发工程师 · 个人简历' });

  return (
    <div className="content-max mx-auto space-y-14">
      {/* Hero:进入页面即播分层入场 */}
      <header className="flex flex-wrap items-start gap-6">
        <div className="anim-pop" style={{ animationDelay: '0ms' }}>
          <SiteAvatar size="lg" className="border border-border" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading anim-rise text-4xl font-bold md:text-5xl" style={{ animationDelay: '80ms' }}>
            {resumeHero.name}
          </h1>
          <p className="anim-rise mt-3 max-w-2xl leading-relaxed" style={{ animationDelay: '160ms' }}>
            {resumeHero.facts}
          </p>
          <div className="anim-rise mt-4 flex flex-wrap gap-2" style={{ animationDelay: '240ms' }}>
            {resumeHero.tags.map(t => <Chip key={t}>{t}</Chip>)}
          </div>
          <p className="anim-rise mt-4 text-sm text-muted" style={{ animationDelay: '300ms' }}>
            邮箱 <a href={`mailto:${resumeHero.email}`} className="text-primary hover:underline">{resumeHero.email}</a>
            {' · '}GitHub{' '}
            <a
              href={`https://github.com/${resumeHero.github}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @{resumeHero.github}
            </a>
            {' · '}{resumeHero.location}
          </p>
        </div>
        <div className="anim-rise flex gap-2" style={{ animationDelay: '200ms' }}>
          <a
            href={`${import.meta.env.BASE_URL}resume-doc.html`}
            target="_blank"
            rel="noreferrer"
            className="rounded-brand border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary"
          >
            A4 打印版
          </a>
        </div>
      </header>

      {/* 项目经历 */}
      <Reveal className="space-y-5">
        <SectionTitle>项目经历</SectionTitle>
        <div className="grid gap-5 lg:grid-cols-2">
          {resumeProjects.map(p => (
            <article key={p.name} className="flex flex-col rounded-brand border border-border bg-surface p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-heading text-lg font-bold leading-snug">{p.name}</h3>
                <span className="shrink-0 text-xs text-muted">{p.period}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-primary">{p.tag}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted">
                {p.points.map(pt => <li key={pt} className="text-justify">{pt}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.stack.map(s => <Chip key={s}>{s}</Chip>)}
              </div>
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-primary hover:underline"
                >
                  {p.link.replace('https://', '')}
                </a>
              )}
            </article>
          ))}
        </div>
      </Reveal>

      {/* 技术栈 */}
      <Reveal className="space-y-4">
        <SectionTitle>技术栈</SectionTitle>
        <div className="space-y-3">
          {resumeSkills.map(g => (
            <div key={g.label} className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
              <span className="w-40 shrink-0 text-sm font-semibold">{g.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map(i => <Chip key={i}>{i}</Chip>)}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* 教育 */}
      <Reveal className="space-y-3">
        <SectionTitle>教育背景</SectionTitle>
        <div className="rounded-brand border border-border bg-surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">
              {resumeEducation.school} <span className="font-normal text-muted">— {resumeEducation.major}</span>
            </span>
            <span className="text-xs text-muted">{resumeEducation.period}</span>
          </div>
          <p className="mt-2 text-sm">{resumeEducation.highlight}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resumeEducation.courses.map(c => <Chip key={c}>{c}</Chip>)}
          </div>
        </div>
      </Reveal>

      {/* 荣誉与证书 */}
      <Reveal className="space-y-3">
        <SectionTitle>荣誉与证书</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {resumeHonors.map(h => <Chip key={h}>{h}</Chip>)}
        </div>
        <p className="text-sm text-muted">证书:{resumeCertificates.join(' · ')}</p>
      </Reveal>

      {/* 自我评价 */}
      <Reveal className="space-y-3">
        <SectionTitle>自我评价</SectionTitle>
        <blockquote className="border-l-2 border-primary pl-4 leading-relaxed text-muted">
          {resumeSummary}
        </blockquote>
      </Reveal>
    </div>
  );
}
