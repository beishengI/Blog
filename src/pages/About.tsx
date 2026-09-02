import { useConfig } from '../context/ConfigContext';

export default function About() {
  const { config } = useConfig();
  const { site } = config;
  const intro = site.intro ?? [];
  const research = site.research ?? [];

  return (
    <div className="content-max mx-auto space-y-4">
      <h1 className="font-heading text-3xl font-bold">关于</h1>

      <div className="flex flex-wrap items-center gap-4">
        <img
          src={site.avatar}
          className="shrink-0 rounded-full"
          style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)' }}
          alt={site.author}
        />
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold">{site.author}</h2>
          <p className="text-sm text-muted">{site.bio}</p>
        </div>
      </div>

      <div className="article-content">
        {intro.map((p, i) => <p key={i}>{p}</p>)}

        {research.length > 0 && (
          <>
            <h2>研究方向</h2>
            <ul>
              {research.map(r => <li key={r}>{r}</li>)}
            </ul>
          </>
        )}

        <h2>联系方式</h2>
        <p className="break-words">
          邮箱：
          {site.email ? (
            <a href={`mailto:${site.email}`}>{site.email}</a>
          ) : (
            <span className="text-muted">未设置</span>
          )}
          {' · '}GitHub：
          {site.github ? (
            <a href={`https://github.com/${site.github}`} target="_blank" rel="noreferrer">
              @{site.github}
            </a>
          ) : (
            <span className="text-muted">未设置</span>
          )}
        </p>
      </div>
    </div>
  );
}
