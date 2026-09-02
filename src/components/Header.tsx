import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useConfig } from '../context/ConfigContext';
import { DIRECTION_LABELS } from '../layouts/registry';
import ThemePanel from './ThemePanel';
import Icon from './Icon';

export default function Header() {
  const { config } = useConfig();
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const { site, nav, features } = config;

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    navigate(keyword ? `/posts?q=${encodeURIComponent(keyword)}` : '/posts');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg">
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link to="/" className="font-heading shrink-0 text-lg font-bold tracking-tight">
          {site.title}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(n => (
            <Link key={n.href} to={n.href}
              className="rounded-brand px-3 py-2 text-sm text-muted hover:bg-surface hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span
            data-testid="current-layout"
            className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted lg:inline-flex"
            title="当前页面布局"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {DIRECTION_LABELS[config.layout.direction] ?? '默认'}
          </span>
          {features.search && (
            <form onSubmit={submitSearch} className="hidden sm:flex">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="搜索文章…"
                aria-label="搜索文章"
                className="w-28 rounded-brand border border-border bg-surface px-3 py-1.5 text-sm outline-none transition-[width] focus:w-44 focus:border-primary md:w-36 md:focus:w-52"
              />
            </form>
          )}
          <button onClick={() => setOpenPanel(true)}
            className="inline-flex items-center gap-1.5 rounded-brand border border-border px-3 py-1.5 text-sm hover:bg-surface hover:text-primary">
            <Icon name="palette" size={15} /> 定制
          </button>
          <button onClick={() => setMenu(v => !v)}
            className="rounded-brand border border-border px-3 py-1.5 text-sm md:hidden">菜单</button>
        </div>
      </div>
      {menu && (
        <nav className="border-t border-border md:hidden">
          <div className="shell flex flex-col py-2">
            {nav.map(n => (
              <Link key={n.href} to={n.href} onClick={() => setMenu(false)}
                className="py-2 text-sm text-muted">{n.label}</Link>
            ))}
            {features.search && (
              <form onSubmit={(e) => { submitSearch(e); setMenu(false); }} className="py-2">
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="搜索文章…"
                  aria-label="搜索文章"
                  className="w-full rounded-brand border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
              </form>
            )}
          </div>
        </nav>
      )}
      <ThemePanel open={openPanel} onClose={() => setOpenPanel(false)} />
    </header>
  );
}
