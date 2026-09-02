import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { BlogConfig, DeepPartial } from '../types';
import { defaultConfig } from '../config/default.config';

const STORAGE_KEY = 'medai-blog-config';

interface Ctx {
  config: BlogConfig;
  update: (patch: DeepPartial<BlogConfig>) => void;
  setConfig: (c: BlogConfig) => void;
  reset: () => void;
  exportConfig: () => string;
}

/** 深合并补丁到基准配置，保证部分更新不会丢失其它字段。 */
function deepMerge<T>(base: T, patch: any): T {
  if (base === null || typeof base !== 'object' || Array.isArray(base)) return (patch ?? base) as T;
  const out: any = { ...base };
  for (const k of Object.keys(patch ?? {})) {
    const pv = patch[k];
    out[k] = pv && typeof pv === 'object' && !Array.isArray(pv) ? deepMerge((base as any)[k], pv) : pv;
  }
  return out;
}

/** 将配置写入 :root CSS 变量，实现零核心代码改动的换肤。 */
function applyVars(c: BlogConfig) {
  const r = document.documentElement.style;
  const t = c.theme, l = c.layout;
  r.setProperty('--color-bg', t.bg);
  r.setProperty('--color-surface', t.surface);
  r.setProperty('--color-surface-alt', t.surfaceAlt);
  r.setProperty('--color-text', t.text);
  r.setProperty('--color-text-muted', t.textMuted);
  r.setProperty('--color-border', t.border);
  r.setProperty('--color-primary', t.primary);
  r.setProperty('--color-accent', t.accent);
  r.setProperty('--radius', `${t.radius}px`);
  r.setProperty('--font-heading', t.fontHeading);
  r.setProperty('--font-body', t.fontBody);
  r.setProperty('--maxw', `${l.maxWidth}px`);
  const gapMap = { compact: 12, comfortable: 20, spacious: 32 } as const;
  r.setProperty('--gap', `${gapMap[l.density]}px`);

  // 内容列 / 阅读列最大宽度：取代各处硬编码的 max-w-3xl、max-w-2xl
  // 内容列下限 860px：开启侧栏的布局（editorial/bauhaus 等）主栏被压缩后仍保留可读宽度
  r.setProperty('--content-max', `${Math.max(l.maxWidth, 860)}px`);
  r.setProperty('--read-max', `min(${l.maxWidth}px, 46rem)`);
  // 侧栏宽度随内容宽度按比例收缩，避免主栏被挤压
  r.setProperty('--sidebar-w', `${Math.round(Math.min(320, Math.max(220, l.maxWidth * 0.26)))}px`);
  // 自适应栅格最小列宽随密度档位变化
  const colMap = { compact: 240, comfortable: 300, spacious: 360 } as const;
  const colSmMap = { compact: 180, comfortable: 220, spacious: 260 } as const;
  r.setProperty('--col-min', `${colMap[l.density]}px`);
  r.setProperty('--col-min-sm', `${colSmMap[l.density]}px`);
  const mode = t.mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : t.mode;
  document.documentElement.setAttribute('data-mode', mode);
}

const ConfigContext = createContext<Ctx | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<BlogConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return deepMerge(defaultConfig, JSON.parse(saved));
    } catch { /* ignore */ }
    return defaultConfig;
  });

  useEffect(() => {
    applyVars(config);
    // 隐私模式 / 沙箱 iframe 等场景 setItem 可能抛错；持久化失败不应影响运行期联动
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  const update = (patch: DeepPartial<BlogConfig>) => setConfigState(s => deepMerge(s, patch));
  const setConfig = (c: BlogConfig) => setConfigState(c);
  const reset = () => setConfigState(defaultConfig);
  const exportConfig = () => JSON.stringify(config, null, 2);

  const value = useMemo(() => ({ config, update, setConfig, reset, exportConfig }), [config]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig 必须在 ConfigProvider 内使用');
  return ctx;
}
