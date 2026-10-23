/**
 * 站点身份、导航与联系方式的单一真相源。
 *
 * 隐私约定：
 * - 这里只出现脱敏手机号；完整号码不进入源码、构建产物或公开 PDF。
 * - 如确需公开完整号码，在本地 .env.local 设置 VITE_PUBLIC_PHONE /
 *   VITE_SHOW_PUBLIC_PHONE=true 后重新构建，并自行承担公开风险。
 */

export interface ContactConfig {
  email: string;
  github: string;
  location: string;
  phoneMasked: string;
  phonePublic: boolean;
  wechatQr?: string;
}

export interface SiteConfig {
  /** 页面标题 / SEO 用 */
  title: string;
  /** 主署名 */
  name: string;
  /** 兼容旧组件的 author 字段 */
  author: string;
  /** 笔名 / 视觉符号 */
  handle: string;
  role: string;
  tagline: string;
  kicker: string;
  bio: string;
  targetRole: string;
  graduation: string;
  availability: string;
  avatar: string;
  url?: string;
  resumePdf: string;
  intro: string[];
  research: string[];
  principles: { title: string; body: string }[];
  contact: ContactConfig;
  /** 兼容旧组件 */
  email: string;
  github: string;
  location: string;
}

export const site: SiteConfig = {
  title: '张栋栋 · 全栈开发 / AI 应用',
  name: '张栋栋',
  author: '张栋栋',
  handle: '北省',
  role: '全栈开发 · AI 应用',
  tagline: '让模型，在真实系统里跑起来。',
  kicker: '从一张切片，到一条产线。',
  bio:
    '智能医学工程 2027 届。做过医学影像分割、32B 模型服务化、合同预审智能体，也把 MES 与出租车平台从旧架构迁到新架构。算法、服务、交付，一条链路亲手跑完。',
  targetRole: '软件开发工程师（全栈开发 · 医学影像软件 · AI 应用）',
  graduation: '2027 届',
  availability: '可实习 · 2027 届',
  avatar: '/avatar-800.jpg',
  url: 'https://beishengi.github.io/Blog/',
  resumePdf: '/resume/zhangdongdong-resume-2026-10.pdf',
  intro: [
    '我是张栋栋，湖北医药学院智能医学工程 2027 届。专业训练让我习惯先看证据：一张影像、一组对照实验、一份能复现的报告。',
    '真正让我着迷的是把这些东西送进系统：把分割模型压到能部署的体积，把 32B 模型做成别人能稳定调用的 API，把合同判定从「模型觉得」改成「规则可查」，再把 MES 和低代码迁移做到零数据丢失。',
    '这个站点既是对外的作品集，也是我自己的知识系统：30 篇 Agent / RAG / 评测文档互相链接，7 篇文章记录做法与踩坑。',
  ],
  research: [
    '大模型应用开发：RAG 知识库、Agent 编排与工具调用（Dify / RAGFlow / LangChain）',
    '模型部署与推理服务化：Qwen3-VL 流式服务、量化加速（A800 / H800 / 昇腾 910B）',
    '医学影像分割：PyTorch / MONAI，轻量化分割模型训练与可视化（Lite-Mamba）',
    '企业系统全栈交付：Spring Boot / Vue3 / FastAPI，MES 与旧系统迁移',
  ],
  principles: [
    { title: '先算账，再优化', body: '训练看参数量、FLOPs、Dice、HD95；服务看首字时延、吞吐、显存。没有账本的优化只是换一版参数赌一把。' },
    { title: '判定与解释分离', body: '合同预审里，大模型只负责抽取与对齐，判定由纯规则引擎产出。解释可以对话，判定表不能被动摇。' },
    { title: '低置信度转人工', body: '错误的「OK」比缺失更危险。抽取置信度低于阈值的字段不进判定链，宁可让人多看两条。' },
    { title: '把未做之事写下来', body: '每件作品的取舍都记录「没做什么、为什么」。决策记录里最贵的一栏，往往是没做的那一行。' },
    { title: '交付要能回滚', body: '迁移有三重对账和三级回滚；长任务有断点续采和自愈脚本。能回滚，才敢上线。' },
  ],
  contact: {
    email: '1611045292@qq.com',
    github: 'beishengI',
    location: '湖北 · 武汉',
    phoneMasked: '153****3881',
    phonePublic: false,
    wechatQr: '/wechat-qr.png',
  },
  email: '1611045292@qq.com',
  github: 'beishengI',
  location: '湖北 · 武汉',
};

export const nav = [
  { label: '读片台', href: '/' },
  { label: '项目', href: '/work' },
  { label: '文章', href: '/posts' },
  { label: '知识库', href: '/wiki' },
  { label: '简历', href: '/resume' },
  { label: '关于', href: '/about' },
];

export const features = {
  search: true,
  toc: true,
  readingTime: true,
  comments: true,
};

/**
 * 构建时可选公开完整号码；默认不注入。
 * 用 try/?? 是因为这份数据也会被 scripts/gen-rss.mjs 用 esbuild 打包给 Node，
 * 那里没有 import.meta.env；浏览器构建时 Vite 会注入完整 env 对象。
 */
const env = (() => {
  try {
    return ((import.meta as unknown as { env?: Record<string, string | undefined> }).env) ?? {};
  } catch {
    return {};
  }
})();

export const publicPhone = (() => {
  const raw = env.VITE_PUBLIC_PHONE?.trim();
  return env.VITE_SHOW_PUBLIC_PHONE === 'true' && raw ? raw : '';
})();
