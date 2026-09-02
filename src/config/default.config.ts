import { BlogConfig } from '../types';

/**
 * 主题配置文件（默认配置）。
 * 修改此处即可在不改动核心代码的情况下调整全站外观，
 * 也可在运行期通过右上角「定制」面板可视化修改（自动存 localStorage）。
 */
export const defaultConfig: BlogConfig = {
  site: {
    title: 'MedAI Lab',
    author: '林知远',
    bio: '湖北医药学院 · 智能医学工程 · 关注医学影像 AI 与可解释性',
    avatar: '/avatar.svg',
    email: 'example@email.com',
    github: 'example',
    intro: [
      '这里是湖北医药学院智能医学工程专业的一名大四学生，研究方向聚焦医学影像人工智能与可解释性。',
      '本博客用于记录学习笔记、项目实践与科研思考。',
    ],
    research: [
      '医学影像分割与分类（CNN / Transformer）',
      '模型可解释性（Grad-CAM、SHAP）',
      '临床决策支持系统设计',
    ],
  },
  theme: {
    mode: 'light',
    primary: '#2563eb',
    accent: '#0ea5e9',
    bg: '#ffffff',
    surface: '#f6f7f9',
    surfaceAlt: '#eef0f4',
    text: '#1a1d21',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    radius: 12,
    fontHeading: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontBody: "'Inter', 'Noto Sans SC', sans-serif",
  },
  layout: {
    density: 'comfortable',
    sidebar: 'none',
    maxWidth: 1180,
    cardStyle: 'bordered',
    showSidebarOnMobile: false,
    recentCount: 5,
    direction: 'grid',
  },
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/posts' },
    { label: '知识库', href: '/wiki' },
    { label: '标签', href: '/tags' },
    { label: '关于', href: '/about' },
    { label: '管理', href: '/admin' },
  ],
  features: { search: true, toc: true, readingTime: true, comments: true },
};
