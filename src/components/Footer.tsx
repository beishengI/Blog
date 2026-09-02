import { useConfig } from '../context/ConfigContext';

export default function Footer() {
  const { config } = useConfig();
  const y = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="shell flex flex-col gap-2 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>© {y} {config.site.author} · {config.site.title}</span>
        <span className="flex flex-wrap items-center gap-3">
          <span>React + TypeScript + Tailwind · 配置驱动主题</span>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            RSS 订阅
          </a>
        </span>
      </div>
    </footer>
  );
}
