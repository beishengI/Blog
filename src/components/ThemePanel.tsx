import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { presets, defaultNav } from '../config/presets';
import { defaultConfig } from '../config/default.config';
import { LAYOUTS, DIRECTION_LABELS, LAYOUT_COUNT, LayoutDirection } from '../layouts/registry';
import { Density, SidebarPosition, CardStyle, ThemeMode, BlogConfig } from '../types';

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent" />
        <input value={value} onChange={e => onChange(e.target.value)}
          className="w-20 rounded border border-border bg-surface px-2 py-1 text-xs" />
      </span>
    </label>
  );
}

const FEATURE_LABELS: Record<keyof BlogConfig['features'], string> = {
  search: '搜索框',
  toc: '文章目录吸顶',
  readingTime: '阅读时长',
  comments: '评论',
};

const fonts = [
  { label: 'Space Grotesk / Inter', v: "'Space Grotesk','Noto Sans SC',sans-serif" },
  { label: 'Newsreader 衬线', v: "'Newsreader','Noto Serif SC',serif" },
  { label: 'JetBrains Mono', v: "'JetBrains Mono',monospace" },
  { label: 'Noto Serif SC', v: "'Noto Serif SC',serif" },
  { label: 'Inter', v: "'Inter','Noto Sans SC',sans-serif" },
];

export default function ThemePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, update, setConfig, reset, exportConfig } = useConfig();
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const t = config.theme;

  /**
   * 应用预设：以默认配置为基准合并，而非在当前配置上叠加，
   * 这样切风格时不会残留上一套的设置（字体/布局/模式一次性联动）。
   * 应用后所有单项仍可自由微调。
   */
  const applyPreset = (p: (typeof presets)[number]) => {
    setConfig({
      ...defaultConfig,
      site: config.site,                                        // 保留站点信息
      theme: { ...defaultConfig.theme, ...p.theme },
      layout: {
        ...defaultConfig.layout,
        ...p.layout,
        // direction 是预设的顶层字段（见 presets.ts），p.layout 里并不包含它，
        // 必须单独写入，否则 direction 永远回落到默认的 'grid'。
        direction: p.direction,
      },
      features: { ...defaultConfig.features, ...p.features },
      nav: p.nav ?? defaultNav,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-[340px] max-w-[90vw] overflow-y-auto border-l border-border bg-bg p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">可视化配置</h2>
          <button onClick={onClose} className="rounded-brand min-h-9 border border-border px-3 text-sm">关闭</button>
        </div>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-sm font-semibold text-muted">预设风格</h3>
            <span className="shrink-0 text-xs font-medium text-primary">
              当前：{DIRECTION_LABELS[config.layout.direction] ?? '默认'}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {presets.map((p, i) => (
              <button key={p.id} onClick={() => applyPreset(p)} data-preset={p.id}
                className="rounded-brand min-h-9 border border-border p-2 text-left text-xs transition-colors hover:border-primary">
                <span className="flex gap-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.theme.primary }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.theme.accent }} />
                  <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ background: p.theme.bg }} />
                  <span className="ml-auto text-[10px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <div className="mt-1.5 font-medium">{p.name}</div>
                <div className="mt-0.5 line-clamp-2 text-muted">{p.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-3">
          <h3 className="font-heading text-sm font-semibold text-muted">主题色</h3>
          <ColorField label="主色 Primary" value={t.primary} onChange={v => update({ theme: { primary: v } })} />
          <ColorField label="强调色 Accent" value={t.accent} onChange={v => update({ theme: { accent: v } })} />
          <ColorField label="背景 Background" value={t.bg} onChange={v => update({ theme: { bg: v } })} />
          <ColorField label="卡片 Surface" value={t.surface} onChange={v => update({ theme: { surface: v } })} />
          <ColorField label="文字 Text" value={t.text} onChange={v => update({ theme: { text: v } })} />
          <ColorField label="次要 Muted" value={t.textMuted} onChange={v => update({ theme: { textMuted: v } })} />
          <ColorField label="边框 Border" value={t.border} onChange={v => update({ theme: { border: v } })} />
        </section>

        <section className="mt-5 space-y-3">
          <h3 className="font-heading text-sm font-semibold text-muted">模式与形状</h3>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
              <button key={m} onClick={() => update({ theme: { mode: m } })}
                className={`rounded-brand min-h-9 border px-3 py-1 text-sm ${t.mode === m ? 'border-primary text-primary' : 'border-border text-muted'}`}>{m}</button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-2 text-sm text-muted">
            圆角 Radius
            <input type="range" min={0} max={24} value={t.radius} onChange={e => update({ theme: { radius: Number(e.target.value) } })} />
            <span className="w-10 text-right">{t.radius}px</span>
          </label>
        </section>

        <section className="mt-5 space-y-3">
          <h3 className="font-heading text-sm font-semibold text-muted">字体</h3>
          <label className="flex flex-col gap-1 text-sm text-muted">
            标题字体
            <select value={t.fontHeading} onChange={e => update({ theme: { fontHeading: e.target.value } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              {fonts.map(f => <option key={f.label} value={f.v}>{f.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            正文字体
            <select value={t.fontBody} onChange={e => update({ theme: { fontBody: e.target.value } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              {fonts.map(f => <option key={f.label} value={f.v}>{f.label}</option>)}
            </select>
          </label>
        </section>

        <section className="mt-5 space-y-3">
          <h3 className="font-heading text-sm font-semibold text-muted">布局</h3>
          <label className="flex flex-col gap-1 text-sm text-muted">
            页面布局 Layout（{LAYOUT_COUNT} 选 1）
            <select value={config.layout.direction}
              onChange={e => update({ layout: { direction: e.target.value as LayoutDirection } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              {(Object.keys(LAYOUTS) as LayoutDirection[]).map(v => (
                <option key={v} value={v}>{DIRECTION_LABELS[v]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            密度 Density
            <select value={config.layout.density} onChange={e => update({ layout: { density: e.target.value as Density } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              <option value="compact">紧凑 Compact</option>
              <option value="comfortable">舒适 Comfortable</option>
              <option value="spacious">宽松 Spacious</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            侧边栏 Sidebar
            <select value={config.layout.sidebar} onChange={e => update({ layout: { sidebar: e.target.value as SidebarPosition } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              <option value="left">左侧</option>
              <option value="right">右侧</option>
              <option value="none">隐藏</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            卡片样式 Card
            <select value={config.layout.cardStyle} onChange={e => update({ layout: { cardStyle: e.target.value as CardStyle } })}
              className="rounded border border-border bg-surface px-2 py-1 text-fg">
              <option value="minimal">极简</option>
              <option value="bordered">描边</option>
              <option value="elevated">悬浮</option>
              <option value="ghost">幽灵</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2 text-sm text-muted">
            最大宽度
            <input type="range" min={900} max={1400} step={20} value={config.layout.maxWidth}
              onChange={e => update({ layout: { maxWidth: Number(e.target.value) } })} />
            <span className="w-14 text-right">{config.layout.maxWidth}px</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={config.layout.showSidebarOnMobile}
              onChange={e => update({ layout: { showSidebarOnMobile: e.target.checked } })} />
            移动端显示侧边栏
          </label>
          <label className="flex items-center justify-between gap-2 text-sm text-muted">
            侧栏条数
            <input type="range" min={3} max={10} step={1} value={config.layout.recentCount}
              onChange={e => update({ layout: { recentCount: Number(e.target.value) } })} />
            <span className="w-14 text-right">{config.layout.recentCount} 条</span>
          </label>
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-heading text-sm font-semibold text-muted">功能开关</h3>
          {(['search', 'toc', 'readingTime', 'comments'] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={config.features[k]}
                onChange={e => update({ features: { [k]: e.target.checked } })} />
              {FEATURE_LABELS[k]}
            </label>
          ))}
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-heading text-sm font-semibold text-muted">站点信息</h3>
          <input value={config.site.author} placeholder="作者"
            onChange={e => update({ site: { author: e.target.value } })}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-fg" />
          <textarea value={config.site.bio} placeholder="简介" rows={2}
            onChange={e => update({ site: { bio: e.target.value } })}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-fg" />
          <input value={config.site.email ?? ''} placeholder="邮箱"
            onChange={e => update({ site: { email: e.target.value } })}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-fg" />
          <input value={config.site.github ?? ''} placeholder="GitHub 用户名"
            onChange={e => update({ site: { github: e.target.value } })}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-fg" />
          <input value={config.site.avatar} placeholder="头像 URL"
            onChange={e => update({ site: { avatar: e.target.value } })}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-fg" />
        </section>

        <section className="mt-6 flex gap-2">
          <button onClick={reset} className="flex-1 rounded-brand border border-border py-2 text-sm hover:bg-surface">重置</button>
          <button onClick={async () => {
            await navigator.clipboard.writeText(exportConfig());
            setCopied(true); setTimeout(() => setCopied(false), 1500);
          }} className="flex-1 rounded-brand bg-primary py-2 text-sm text-white">
            {copied ? '已复制' : '导出配置'}
          </button>
        </section>
        <p className="mt-3 text-xs text-muted">
          配置自动保存至 localStorage；也可在 <code>src/config/default.config.ts</code> 修改默认值。
        </p>
      </div>
    </div>
  );
}
