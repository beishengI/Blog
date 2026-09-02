import { BlogConfig } from '../types';

/**
 * 主题配置文件（默认配置）。
 * 修改此处即可在不改动核心代码的情况下调整全站外观，
 * 也可在运行期通过右上角「定制」面板可视化修改（自动存 localStorage）。
 */
export const defaultConfig: BlogConfig = {
  site: {
    title: 'MedAI Lab',
    author: '北省',
    bio: '湖北医药学院 · 智能医学工程 · 关注大模型应用开发（RAG / Agent）与医学影像 AI',
    avatar: '/avatar.jpeg',
    url: 'https://beishengi.github.io/Blog/', // GitHub Pages 根地址（SEO canonical / RSS 链接）
    email: '1611045292@qq.com',
    github: 'beishengI',
    intro: [
      '这里是湖北医药学院智能医学工程专业的一名大四学生（2027 届），关注大模型应用开发（RAG · Agent · 推理部署）与医学影像 AI。',
      '本博客用于记录学习笔记、项目实践与科研思考，沉淀从模型训练到 AI 应用落地的完整链路。',
    ],
    research: [
      '大模型应用开发：RAG 知识库、Agent 编排与工具调用（Dify / RAGFlow / LangChain）',
      '模型部署与推理服务化：Qwen3-VL 流式服务、量化加速（A800 / H800 / 昇腾 910B）',
      '医学影像分割：PyTorch / MONAI，轻量化分割模型训练与可视化（Lite-Mamba）',
      '全栈 Web 开发：FastAPI / Spring Boot · Vue3 / TypeScript',
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
    { label: '归档', href: '/archive' },
    { label: '关于', href: '/about' },
    { label: '简历', href: '/resume' },
    { label: '管理', href: '/admin' },
  ],
  features: { search: true, toc: true, readingTime: true, comments: true },
};
