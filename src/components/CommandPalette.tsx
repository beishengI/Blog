import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const PaletteDialog = lazy(() => import('./PaletteDialog'));

/**
 * 全局 ⌘K / Ctrl+K 入口。面板本体首次打开才加载；
 * 输入框内不劫持快捷键；关闭后焦点归还触发点。
 * 头部「命令」按钮通过 bs-open-palette 事件唤出，与快捷键同一路径。
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const rememberFocus = () => {
      previousFocus.current = document.activeElement as HTMLElement | null;
    };
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      setOpen(value => {
        if (!value) rememberFocus();
        return !value;
      });
    };
    const onOpen = () => {
      rememberFocus();
      setOpen(true);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('bs-open-palette', onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('bs-open-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) previousFocus.current?.focus?.();
  }, [open]);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <PaletteDialog onClose={() => setOpen(false)} />
    </Suspense>
  );
}
