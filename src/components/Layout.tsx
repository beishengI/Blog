import { ReactNode, type CSSProperties } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import BackgroundFX from './BackgroundFX';
import { useConfig } from '../context/ConfigContext';
import { useResponsive } from '../hooks/useResponsive';
import { LAYOUT_MIN_WIDTH } from '../layouts/registry';

export default function Layout({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const { isMobile } = useResponsive();
  const sidebar = config.layout.sidebar;
  const showSidebar = sidebar !== 'none' && (!isMobile || config.layout.showSidebarOnMobile);

  // 宽版布局的最小画布宽度：shell 取 max(maxWidth, min-width)
  const layoutMinWidth = LAYOUT_MIN_WIDTH[config.layout.direction] ?? 0;
  const shellStyle = layoutMinWidth
    ? ({ '--layout-min-w': `${layoutMinWidth}px` } as CSSProperties)
    : undefined;

  // 仅在侧栏真正渲染时才保留侧栏列，避免"占位但为空"的空白区
  const twoColumn = sidebar !== 'none' && showSidebar;

  const mainOrder = sidebar === 'left' ? 'md:order-2' : 'md:order-1';
  const sideOrder = sidebar === 'left' ? 'md:order-1' : 'md:order-2';

  // 关键：栅格轨道必须跟随侧栏位置。
  // 自动放置按 order 顺序进列，若模板固定为 [1fr, 侧栏宽]，
  // 「侧栏在左」时侧栏会落进 1fr 宽列、正文被塞进窄列（表现为正文细长条）。
  const gridCols = !twoColumn
    ? 'grid-cols-1'
    : sidebar === 'left'
      ? 'md:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]'
      : 'md:grid-cols-[minmax(0,1fr)_var(--sidebar-w)]';

  return (
    <div className="flex min-h-screen flex-col" style={shellStyle}>
      <BackgroundFX />
      <Header />
      {/* w-full:main 是 flex-col 的交叉轴子项,.shell 的 auto margin 会让 stretch 失效、
          收缩为内容宽度(窄内容页如 /resume 会被挤成细条),显式定宽后 shell 恒为 maxw 宽 */}
      <main className="shell w-full flex-1 py-8">
        <div className={`relative z-10 grid gap-[var(--gap)] ${gridCols}`}>
          <div className={mainOrder}>{children}</div>
          {showSidebar && (
            <div className={sideOrder}>
              <div className="md:sticky md:top-[calc(var(--header-h)+1rem)]">
                <Sidebar />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
