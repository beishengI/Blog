import { BlogConfig } from '../types';

export interface Preset {
  id: string;
  name: string;
  description: string;
  direction: BlogConfig['layout']['direction'];
  theme: Partial<BlogConfig['theme']>;
  layout: Partial<BlogConfig['layout']>;
  features?: Partial<BlogConfig['features']>;
  nav?: BlogConfig['nav'];
}

/** 默认导航，预设未指定时使用。 */
export const defaultNav: BlogConfig['nav'] = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '标签', href: '/tags' },
  { label: '关于', href: '/about' },
];

const SANS = "'Space Grotesk','Noto Sans SC',sans-serif";
const BODY = "'Inter','Noto Sans SC',sans-serif";
const SERIF = "'Newsreader','Noto Serif SC',serif";
const MONO = "'JetBrains Mono','Noto Sans SC',monospace";

/**
 * 20 套预设：每套都绑定一种独立的排版结构（direction），
 * 并完整定义配色 / 字体 / 圆角 / 模式 / 布局参数 / 功能开关，
 * 点击即全量联动；应用后仍可自由微调任意单项。
 */
export const presets: Preset[] = [
  {
    id: 'swiss', name: '瑞士学术网格', direction: 'grid',
    description: '卡片墙网格：简介面板 + 均质卡片阵列，秩序感强，最稳妥的日常选择。',
    theme: { mode: 'light', primary: '#2563eb', accent: '#0ea5e9', bg: '#ffffff', surface: '#f6f7f9', surfaceAlt: '#eef0f4', text: '#1a1d21', textMuted: '#6b7280', border: '#e5e7eb', radius: 6, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'right', cardStyle: 'bordered', maxWidth: 1180, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'editorial', name: '杂志编辑风', direction: 'editorial',
    description: '巨幕标题 + 非对称拼贴 + 统计色带，视觉冲击最强。',
    theme: { mode: 'light', primary: '#b91c1c', accent: '#f59e0b', bg: '#fbf7f0', surface: '#f3ece0', surfaceAlt: '#ece2d0', text: '#1c1917', textMuted: '#78716c', border: '#e7ddd0', radius: 2, fontHeading: SERIF, fontBody: SERIF },
    layout: { density: 'spacious', sidebar: 'left', cardStyle: 'ghost', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'darktech', name: '暗黑科技风', direction: 'terminal',
    description: '终端窗口 + $ 提示符 + ls 式清单，极客味，适合工程与 AI 主题。',
    theme: { mode: 'dark', primary: '#22d3ee', accent: '#a855f7', bg: '#0b0f17', surface: '#121826', surfaceAlt: '#19202f', text: '#e6e9ef', textMuted: '#97a1b3', border: '#243044', radius: 8, fontHeading: SANS, fontBody: MONO },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'minimal', maxWidth: 1100, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'neumorphism', name: '新拟态', direction: 'soft',
    description: '无边框软卡：双向阴影做出凸起卡片与凹陷头像，触感柔和。',
    theme: { mode: 'light', primary: '#5b7cfa', accent: '#8b9dff', bg: '#e0e5ec', surface: '#e0e5ec', surfaceAlt: '#d3d9e2', text: '#3a4256', textMuted: '#8b93a7', border: '#cdd4df', radius: 18, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'elevated', maxWidth: 1180, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'glassmorphism', name: '玻璃拟态', direction: 'glass',
    description: '渐变舞台 + 半透明毛玻璃面板层叠，前景卡片通透悬浮。',
    theme: { mode: 'dark', primary: '#a855f7', accent: '#22d3ee', bg: '#1e1b4b', surface: 'rgba(255,255,255,0.08)', surfaceAlt: 'rgba(255,255,255,0.12)', text: '#f5f3ff', textMuted: '#c4b5fd', border: 'rgba(255,255,255,0.18)', radius: 16, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'ghost', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'bauhaus', name: '包豪斯几何', direction: 'bauhaus',
    description: '方圆三角原色块 + 硬边卡片 + 顶部分色条，形式追随功能。',
    theme: { mode: 'light', primary: '#e63946', accent: '#ffd166', bg: '#ffffff', surface: '#f1f3f5', surfaceAlt: '#e9ecef', text: '#1d3557', textMuted: '#5c6b7a', border: '#1d3557', radius: 0, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'compact', sidebar: 'left', cardStyle: 'bordered', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'retro', name: '复古报纸', direction: 'newspaper',
    description: '报头 + 头条首字下沉 + CSS 真多栏正文，最有「刊物」感。',
    theme: { mode: 'light', primary: '#2f6f4f', accent: '#b45309', bg: '#f4ecd8', surface: '#efe6cf', surfaceAlt: '#e7dcc0', text: '#3b2f2f', textMuted: '#7a6a55', border: '#d8c9a8', radius: 0, fontHeading: SERIF, fontBody: SERIF },
    layout: { density: 'spacious', sidebar: 'none', cardStyle: 'minimal', maxWidth: 1280, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'warm', name: '温暖人文阅读', direction: 'reading',
    description: '单栏居中、超大行距、无卡片无边框，纯文字流，最适合长文。',
    theme: { mode: 'light', primary: '#2f6f4f', accent: '#e08e45', bg: '#fdf6ec', surface: '#f6edde', surfaceAlt: '#efe2cd', text: '#3a3226', textMuted: '#8a7a63', border: '#e4d6bf', radius: 10, fontHeading: SERIF, fontBody: SERIF },
    layout: { density: 'spacious', sidebar: 'none', cardStyle: 'minimal', maxWidth: 820, showSidebarOnMobile: false },
    features: { search: false, toc: false, readingTime: true },
  },
  {
    id: 'spine', name: '中轴折叠', direction: 'spine',
    description: '脊柱线 + 巨号序号左右交替，编辑张力强。',
    theme: { mode: 'light', primary: '#1f2937', accent: '#2563eb', bg: '#ffffff', surface: '#f6f7f9', surfaceAlt: '#eef0f4', text: '#111827', textMuted: '#6b7280', border: '#e5e7eb', radius: 4, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'minimal', maxWidth: 1100, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'depth', name: '深度分层舞台', direction: 'depth',
    description: 'mesh 渐变舞台 + 前景玻璃芯片，靠层次建立景深。',
    theme: { mode: 'dark', primary: '#22d3ee', accent: '#a855f7', bg: '#0b0f17', surface: '#121826', surfaceAlt: '#19202f', text: '#e6e9ef', textMuted: '#97a1b3', border: '#243044', radius: 14, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'elevated', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'timeline', name: '研究手账时间轴', direction: 'timeline',
    description: '中央 dateline + 左右交替笔记卡片，适合记录实验过程。',
    theme: { mode: 'light', primary: '#2f6f4f', accent: '#e08e45', bg: '#fcfcfb', surface: '#f1f5f2', surfaceAlt: '#e6efe9', text: '#1f2a24', textMuted: '#6b7c72', border: '#d8e3dc', radius: 10, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1100, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'companion', name: 'AI 伴读对照', direction: 'companion',
    description: '左侧原文 / 右侧 AI 摘要与关键术语，最贴合医学 × AI。',
    theme: { mode: 'light', primary: '#4f46e5', accent: '#06b6d4', bg: '#ffffff', surface: '#f5f6fb', surfaceAlt: '#eceef7', text: '#1a1d2b', textMuted: '#6b7280', border: '#e3e6f0', radius: 10, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1180, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'brutalist', name: '粗野主义', direction: 'brutalist',
    description: '硬边框 + 等宽字 + 心电母题，反设计但极具辨识度。',
    theme: { mode: 'light', primary: '#e11d48', accent: '#0ea5e9', bg: '#f5f5f0', surface: '#ecece6', surfaceAlt: '#e0e0d8', text: '#111111', textMuted: '#555555', border: '#111111', radius: 0, fontHeading: SANS, fontBody: MONO },
    layout: { density: 'compact', sidebar: 'none', cardStyle: 'minimal', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },

  // ===== 新增 7 套 =====
  {
    id: 'masonry', name: '封面画廊', direction: 'masonry',
    description: '瀑布流：自动生成的渐变封面图错落排布，视觉导向。',
    theme: { mode: 'light', primary: '#db2777', accent: '#8b5cf6', bg: '#ffffff', surface: '#faf5f9', surfaceAlt: '#f3e8f0', text: '#1f2937', textMuted: '#6b7280', border: '#f0dde8', radius: 14, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1400, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'split', name: '分屏名片', direction: 'split',
    description: '左侧固定个人名片 + 右侧文章流，个人品牌感最强。',
    theme: { mode: 'light', primary: '#0f766e', accent: '#f59e0b', bg: '#ffffff', surface: '#f2f7f6', surfaceAlt: '#e6efed', text: '#14261f', textMuted: '#5f6f69', border: '#dbe7e3', radius: 10, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'dashboard', name: '数据仪表盘', direction: 'dashboard',
    description: '指标磁贴 + 栏目分布进度条 + 紧凑文章表，信息密度最高。',
    theme: { mode: 'dark', primary: '#10b981', accent: '#38bdf8', bg: '#0b1220', surface: '#111c2e', surfaceAlt: '#182740', text: '#e6f0ef', textMuted: '#8fa3b8', border: '#22344f', radius: 8, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1280, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'notes', name: '便签墙', direction: 'notes',
    description: '轻微旋转的纸质便签拼贴，轻松随性，适合碎片化笔记。',
    theme: { mode: 'light', primary: '#ea580c', accent: '#facc15', bg: '#fdf6e3', surface: '#fffbeb', surfaceAlt: '#fdeecf', text: '#3f3218', textMuted: '#8a7a55', border: '#f0dfae', radius: 6, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'elevated', maxWidth: 1280, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'docs', name: '文档手册', direction: 'docs',
    description: '左侧章节树 + 右侧编号条目，像技术文档一样组织知识。',
    theme: { mode: 'light', primary: '#1d4ed8', accent: '#0891b2', bg: '#ffffff', surface: '#f4f7fb', surfaceAlt: '#e8eef7', text: '#16233b', textMuted: '#5b6a80', border: '#dde5f0', radius: 6, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'minimal', maxWidth: 1240, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'stream', name: '动态流', direction: 'stream',
    description: '头像 + 正文 + 标签的类社交信息流，适合短内容高频更新。',
    theme: { mode: 'light', primary: '#6366f1', accent: '#ec4899', bg: '#ffffff', surface: '#f6f6fb', surfaceAlt: '#ecebf7', text: '#1c1c2b', textMuted: '#6b6b80', border: '#e4e3f0', radius: 12, fontHeading: SANS, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'minimal', maxWidth: 820, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
  {
    id: 'blueprint', name: '工程蓝图', direction: 'blueprint',
    description: '网格纸底 + 图号标注 + 等宽注释，工程制图气质。',
    theme: { mode: 'dark', primary: '#38bdf8', accent: '#facc15', bg: '#0d1b2a', surface: '#12263a', surfaceAlt: '#183247', text: '#dbeafe', textMuted: '#8ba8c4', border: '#234a68', radius: 4, fontHeading: MONO, fontBody: BODY },
    layout: { density: 'comfortable', sidebar: 'none', cardStyle: 'bordered', maxWidth: 1280, showSidebarOnMobile: false },
    features: { search: true, toc: true, readingTime: true },
  },
];
