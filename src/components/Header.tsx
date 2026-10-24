import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { isSoundEnabled, playScanTone, setSoundEnabled } from '../utils/sound';

/**
 * 全局发行信息条（Edition band）。
 * 设计：44px sticky 报头线，替代原来的大 logo 导航栏。
 * 保留原有能力：导航、搜索、声音开关、日夜切换、移动端菜单。
 */
export default function Header() {
  const { config, effectiveMode, toggleMode } = useConfig();
  const { site, nav, features } = config;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sound, setSound] = useState(isSoundEnabled);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const now = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }, []);

  const activeIndex = useMemo(() => {
    const exact = nav.findIndex(item => item.href === pathname);
    if (exact >= 0) return exact;
    const nested = nav.findIndex(item => item.href !== '/' && pathname.startsWith(item.href));
    return nested;
  }, [nav, pathname]);

  /** 移动端发行条只显示当前栏目；非主导航页面用「别册」里的名字，不冒充读片台。 */
  const currentLabel = useMemo(() => {
    if (activeIndex >= 0) return { no: String(activeIndex).padStart(2, '0'), label: nav[activeIndex].label };
    if (pathname.startsWith('/archive')) return { no: '', label: '归档' };
    if (pathname.startsWith('/tags')) return { no: '', label: '标签' };
    if (pathname.startsWith('/admin')) return { no: '', label: '管理' };
    return null;
  }, [activeIndex, nav, pathname]);

  useEffect(() => {
    setMenu(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const input = searchInputRef.current;
    input?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!menu) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const menuEl = menuRef.current;
    const focusables = () =>
      Array.from(
        menuEl?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []
      );
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [menu]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const keyword = q.trim();
    setSearchOpen(false);
    setMenu(false);
    navigate(keyword ? '/posts?q=' + encodeURIComponent(keyword) : '/posts');
  };

  const toggleSound = () => {
    const next = !sound;
    setSoundEnabled(next);
    setSound(next);
    if (next) playScanTone('open');
  };

  return (
    <>
      <header className="ed-band" role="banner">
        <div className="ed-band__inner">
          <Link to="/" className="ed-band__brand" aria-label={site.name + ' · 读片台首页'}>
            <span className="ed-band__mast">读片</span>
            <span className="ed-band__vol">VOL.07</span>
            <span className="ed-band__meta">READING REPORT · VOL.07 · 2026 秋 · 武汉</span>
          </Link>

          <nav className="ed-band__nav" aria-label="主导航">
            {nav.map((item, index) => {
              const current =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={current ? 'is-current' : undefined}
                >
                  <span className="ed-band__no">{String(index).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {currentLabel && (
            <span className="ed-band__current" aria-hidden="true">
              {currentLabel.no && <b>{currentLabel.no}</b>}
              {currentLabel.label}
            </span>
          )}

          <div className="ed-band__utils">
            <button
              type="button"
              className="ed-band__util ed-band__util--cmd"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => window.dispatchEvent(new Event('bs-open-palette'))}
            >
              命令 <em>⌘K</em>
            </button>
            {features.search && (
              <button
                type="button"
                className="ed-band__util"
                onClick={() => setSearchOpen(true)}
                aria-expanded={searchOpen}
                aria-controls="ed-search"
              >
                检索 <em>SEARCH</em>
              </button>
            )}
            <span className="ed-band__now">此刻 {now}</span>
            <button
              type="button"
              className="ed-band__util ed-band__util--sound"
              aria-pressed={sound}
              aria-label={sound ? '关闭界面声音' : '开启界面声音'}
              onClick={toggleSound}
            >
              声音 <em>{sound ? '开' : '关'}</em>
            </button>
            <button
              type="button"
              className="ed-band__util ed-band__util--theme"
              aria-label={effectiveMode === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
              onClick={toggleMode}
            >
              {effectiveMode === 'dark' ? '日间' : '夜间'}
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              className="ed-band__util ed-band__menu-btn"
              aria-label={menu ? '关闭菜单' : '打开菜单'}
              aria-expanded={menu}
              aria-controls="ed-menu"
              onClick={() => setMenu(value => !value)}
            >
              {menu ? '关闭' : '目录'}
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="ed-search" id="ed-search" role="dialog" aria-modal="false" aria-label="检索本站">
          <div className="ed-search__inner">
            <form className="ed-search__field" onSubmit={submitSearch} role="search">
              <label htmlFor="ed-search-input">检索 / INDEX SEARCH — 标题、摘要、正文、标签</label>
              <input
                ref={searchInputRef}
                id="ed-search-input"
                value={q}
                onChange={event => setQ(event.target.value)}
                placeholder="输入一个词，抽屉会自己打开…"
                autoComplete="off"
              />
            </form>
            <div className="ed-search__actions">
              <span className="ed-search__hint">ENTER 检索 / ESC 收回</span>
              <button type="button" className="ed-search__close" onClick={() => setSearchOpen(false)}>
                收回 ×
              </button>
            </div>
          </div>
          <div className="ed-search__quick">
            <span>另见 /</span>
            <Link to="/wiki" onClick={() => setSearchOpen(false)}>知识库 30 篇</Link>
            <Link to="/work" onClick={() => setSearchOpen(false)}>项目 7 项</Link>
            <Link to="/archive" onClick={() => setSearchOpen(false)}>归档</Link>
            <Link to="/tags" onClick={() => setSearchOpen(false)}>标签</Link>
          </div>
        </div>
      )}

      {menu && (
        <div className="ed-menu" id="ed-menu" ref={menuRef}>
          <div className="ed-menu__head">
            <span className="ed-label">CONTENTS / 目录</span>
            <span className="ed-label">NO.07 — 2026 秋</span>
          </div>
          <nav className="ed-menu__list" aria-label="移动端主导航">
            {nav.map((item, index) => {
              const current =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={current ? 'page' : undefined}
                  onClick={() => setMenu(false)}
                >
                  {item.label}
                  <span>{String(index).padStart(2, '0')}</span>
                </Link>
              );
            })}
          </nav>
          <form className="ed-search__field" onSubmit={submitSearch} role="search" style={{ marginTop: 18 }}>
            <label htmlFor="ed-menu-search">检索 / SEARCH</label>
            <input
              id="ed-menu-search"
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder="标题、摘要、正文…"
              autoComplete="off"
            />
          </form>
          <div className="ed-menu__utils">
            <button
              type="button"
              className="ed-menu__util"
              onClick={() => {
                setMenu(false);
                window.dispatchEvent(new Event('bs-open-palette'));
              }}
            >
              调阅面板 ⌘K
            </button>
            <button
              type="button"
              className="ed-menu__util"
              aria-pressed={sound}
              onClick={toggleSound}
            >
              声音 {sound ? '开' : '关'}
            </button>
            <button
              type="button"
              className="ed-menu__util"
              onClick={toggleMode}
            >
              {effectiveMode === 'dark' ? '日间模式' : '夜间模式'}
            </button>
          </div>
          <div className="ed-menu__foot">
            <div>{site.contact.email}</div>
            <div>github.com/{site.contact.github}</div>
            <div>{site.contact.phoneMasked}</div>
            <div style={{ marginTop: 8 }}>
              <Link to="/resume" onClick={() => setMenu(false)}>下载简历 / PDF</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
