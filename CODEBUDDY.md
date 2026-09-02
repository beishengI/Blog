# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 仓库定位（先读这里）

- `README.md`：描述当前 MVP 的功能与结构。
- `docs/SDD.md`：目标产品规范（v0.3 草案，**状态“待确认”，M0 未完成**）。当前代码**不是**按 SDD 技术栈实现的正式版，二者关系见下方「重要事实」。

当前仓库是一个**可运行的“配置驱动主题”前端 MVP**（MedAI 医学 × AI 个人博客），重点验证“不改核心代码即可换肤换布局”这一核心概念。页面、内容、主题全部在 `src/` 内，无后端、无数据库、无构建期内容管线。

## 常用命令

```bash
npm install        # 安装依赖（npm，不是 pnpm；package-lock.json 锁定）
npm run dev        # 启动 Vite dev server，http://localhost:5173（自动开浏览器，HMR）
npm run build      # 类型检查（tsc -b）+ 生产构建到 dist/
npm run preview    # 本地预览生产构建产物（build 后使用）
```

脚本只有以上三个。**当前没有 lint / test / CI 基础设施**（package.json 未配置 `lint`、`test`，未安装 ESLint/Prettier/Vitest）。类型检查已内置于 `build`。若需要单文件快速类型检查：`npx tsc --noEmit -p tsconfig.json`。不要臆造 SDD 中规划的 `pnpm new:post`、`pnpm lint:content` 等命令——它们在仓库中不存在。

## 架构概述

### 技术栈与运行模型

Vite 5 + React 18 + TypeScript(strict) + react-router 6 的**纯客户端 SPA**；样式为 Tailwind CSS v3（通过 `tailwind.config.js` 把语义 CSS 变量映射成工具类）。没有 SSR/SSG、没有数据请求层。路由集中在 `src/App.tsx`：`/`、`/posts`、`/posts/:id`、`/tags`、`/tags/:tag`、`/about`；`/posts/:id` 与 `/tags/:tag` 复用同一页面组件按参数分支。入口 `src/main.tsx` 的 Provider 顺序是 `ConfigProvider > BrowserRouter > ErrorBoundary`。

### 内容：TS 模块即“数据库”

文章是硬编码在 `src/data/posts.ts` 的 `Post[]`（含 `content` 为 Markdown 字符串），不是磁盘上的 `.md` 文件，也不是 SDD 设想的 `content/` Git 工作流。Markdown 在**运行时**经 `marked`（GFM）解析，再由 `DOMPurify` 消毒成 HTML（`src/utils/markdown.ts`）。目录数据由 `src/utils/toc.ts`（`parseHeadings`/`slugify`，支持重复标题去重与中文 slug）从正文提取。封面若无图则由 `src/utils/cover.ts` 生成跟随主题主/强调色的抽象渐变 SVG data-URI。新增“文章” = 往 `posts.ts` 加对象。

### 核心机制：配置驱动主题（不改组件源码）

这是整个代码库的设计主轴，改动任何外观应优先走这里：

1. `src/types.ts` 定义单一配置类型 `BlogConfig`（`site/theme/layout/nav/features`）与 `DeepPartial`。
2. `src/config/default.config.ts` 是默认配置（同时是预设合并的基准）。
3. `src/config/presets.ts` 定义 20 套预设（`Preset`：`direction` + 完整 `theme/layout/features` 子集）。**每套预设绑定一种独立首页布局方向（`direction`）**，切预设会连排版结构一起切换。
4. `src/context/ConfigContext.tsx` 是唯一状态源：初始从 `localStorage` 键 `medai-blog-config` 读取并 `deepMerge` 到默认配置；任何 `update()` 后把整棵配置**直接写进 `:root` 的内联 CSS 变量**（`--color-*`、`--radius`、`--font-*`、`--maxw`、`--gap`、`--sidebar-w`、`--col-min` 等），并设置 `<html data-mode=light|dark>`；随后自动持久化回 localStorage。组件只能通过 `useConfig()` 消费配置，禁止硬编码视觉值。
5. `src/styles/globals.css` 的 `:root`/`[data-mode='dark']` 提供令牌的兜底默认值（运行期会被 ConfigContext 覆盖）。Tailwind 工具类（`bg-bg`、`text-muted`、`text-primary`、`border-border`、`rounded-brand`、`font-heading`、`.shell` 等）都映射这些变量。
6. 设计令牌消费链：**配置对象 → CSS 变量 → Tailwind 工具类 → 组件**。

### 布局系统：direction 分发 + 注册表

`src/layouts/` 下每个 `*Home.tsx` 是一套完整的、自包含的首页视觉方向（grid/terminal/glass/bauhaus/…/blueprint 共 20 种），复用共享原子组件（`ArticleCard`、`FeatureCard`、`Icon`、`Reveal`、`BackgroundFX`）。`registry.ts` 是唯一数据源：`LAYOUTS: Record<LayoutDirection, LayoutComponent>` 用类型强制“新增 direction 必须注册”，并提供中文名 `DIRECTION_LABELS`、总数、以及 `LAYOUT_MIN_WIDTH`（对高信息密度布局给出画布宽度下限，避免用户把 maxWidth 调小后布局被压扁）。`src/pages/Home.tsx` 只是分发器：按 `config.layout.direction` 查表渲染。**新增一套首页风格 = 新建组件 + registry.ts 注册两处（组件映射、中文名），其余零改动。**

### 页面骨架与文章详情

`src/components/Layout.tsx` 是全局骨架：Header（吸顶，含搜索跳 `/posts?q=` 与「定制」入口）、Footer、可选 Sidebar（`left/right/none`，移动端可隐藏），两栏用 CSS Grid 且轨道跟随侧栏位置。`src/components/ThemePanel.tsx` 是“可视化配置”抽屉：切换预设时**以 `defaultConfig` 为基准重建**（不叠加残留），另有颜色/圆角/字体/布局/功能开关等单项微调与导出；游客配置自动落 localStorage。

文章详情 `src/pages/ArticleDetailPage.tsx` 有两条渲染路径：默认“正文居中 + 阅读进度条 + StickyTOC”（TOC 高亮依赖 `hooks/useActiveHeading.ts` 的 IntersectionObserver）；当 `direction === 'companion'` 时切换为“左原文 + 右 AI 伴读（当前为静态占位面板）”双栏，移动端折叠。`ArticleList` 承担列表/标签过滤/关键词搜索（客户端 filter），`TagArchive` 统计标签计数。

### 知识库栏目（Wiki）

`/wiki` 与 `/wiki/:slug` 是新增的独立栏目，复用同一套主题系统，不干扰博客文章流。

- 文档正文以 **Markdown 文件** 存放于 `src/content/wiki/*.md`（与仓库同源，可在 GitHub 直接阅读），由 `src/content/wiki/index.ts` 用 `import.meta.glob('./*.md', { query: '?raw', eager:false })` 懒加载为独立 chunk。
- 该 `index.ts` 还静态维护 `wikiDocs` 元信息（`slug` / `title` / `layer` / `description`）与四层分组 `WIKI_LAYERS`；`getWikiDoc()`、`loadWikiContent()` 供页面调用。`loadWikiContent` 会先把正文里指向其他 wiki 的 `.md` 链接重写为 `/wiki/<slug>`。
- `src/pages/Wiki.tsx` 按层分组列出；`src/pages/WikiDetail.tsx` 复用 `ArticleDetail` + `StickyTOC` + `ReadingProgress` 渲染，TOC 开关跟随 `config.features.toc`。
- **新增知识文档** = 放 `.md` 到 `src/content/wiki/` + 在 `wikiDocs` 登记；详见仓库根 `RULES.md`。

## 重要事实与坑

- **与 SDD 的技术栈分歧**：SDD 假设 A1 是 Next.js 15 + Tailwind v4 + pnpm、内容为 Git 管理的 `content/` Markdown；实际仓库是 Vite + React 18 + Tailwind v3 + npm、内容内嵌 TS。本 MVP 已作为“主题可自定义”概念的正式基础架构保留，知识库内容则以 `src/content/wiki/*.md` 形式落地（可视为对 SDD 内容管线思路的轻量实现）。若要按 SDD 正式推进，需先确认技术栈是否切换。
- **Git 仓库已初始化，但推送需先解决鉴权**：远程为 `git@github.com:beishengI/Blog.git`（SSH）。本机有两把密钥 `id_ed25519`（`SHA256:MwEk…`）与 `SegMamba.pem`（`SHA256:KQwk…`），经实测二者对 GitHub 均 `Permission denied (publickey)`——即 GitHub 上注册的 `SHA256:1vOG…` 密钥不在本机。推送前需用户把本机某公钥（见 `RULES.md` / 下方说明）添加到 GitHub SSH keys，或用 PAT 走 HTTPS。**禁止 `--force` 推送**；若远端已有无关历史，常规 push 会失败，需先与用户确认处理方式。推送通过 `GIT_SSH_COMMAND` 指定私钥，不改动 ssh/git 全局配置。
- **Fast Refresh 警告**：`ConfigContext.tsx` 同时导出 Provider 与普通函数 `useConfig`，Vite 会反复提示 “Could not Fast Refresh ('useConfig' export is incompatible)” 并整页 reload。无害但会打断 HMR；不要试图把 hook 移进 Provider 文件外而不考虑所有调用方。
- **dev.err / dev.log / dist/** 是构建与运行产物，改动后无需提交清理策略；`.vscode`、`.github`、`.cursor` 等目录均不存在。
- 站点身份信息（标题/作者/头像/GitHub 等）位于 `default.config.ts` 的 `site` 字段；示例头像在 `public/avatar.svg`。
- 正文排版类（`.article-content`）与各方向特效类样式集中定义在 `globals.css`，改动全局样式先搜索该文件是否已有对应类。
