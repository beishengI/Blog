import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CommandPalette from './CommandPalette';

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const flush = pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a className="skip-link" href="#main">跳到正文</a>
      <Header />
      <CommandPalette />
      <main id="main" className={flush ? 'home-main' : 'shell page-main'} style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
