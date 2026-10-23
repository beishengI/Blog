import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { BlogConfig, ThemeMode } from '../types';
import { defaultConfig } from '../config/default.config';

const STORAGE_KEY = 'bs-mode';

type EffectiveMode = 'light' | 'dark';

interface Ctx {
  config: BlogConfig;
  /** 用户选择：light / dark / system */
  mode: ThemeMode;
  /** 实际生效：light / dark */
  effectiveMode: EffectiveMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ConfigContext = createContext<Ctx | null>(null);

function systemMode(): EffectiveMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    /* ignore */
  }
  return 'system';
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [system, setSystem] = useState<EffectiveMode>(systemMode);

  const effectiveMode: EffectiveMode = mode === 'system' ? system : mode;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystem(event.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', effectiveMode);
    document.documentElement.style.colorScheme = effectiveMode;
  }, [effectiveMode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const toggleMode = () => setMode(effectiveMode === 'dark' ? 'light' : 'dark');

  const value = useMemo<Ctx>(
    () => ({ config: defaultConfig, mode, effectiveMode, setMode, toggleMode }),
    [mode, effectiveMode]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig 必须在 ConfigProvider 内使用');
  return ctx;
}
