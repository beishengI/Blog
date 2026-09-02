# MedAI Blog · 配置驱动主题 MVP + LLM Wiki 知识库

一个面向「医学 × AI」个人博客的前端站点，核心特性是**配置驱动主题**：在不改动组件源码的前提下，通过预设或运行时面板即可整体换肤、换字体、换布局。在保留该 MVP 作为正式基础架构之上，项目现已内置一套 **LLM Agent 知识库（LLM Wiki）**，收录 30 篇、覆盖 16 大领域的深度文档。

> 设计目标：把「内容」与「外观」彻底解耦。外观由 `BlogConfig` 驱动并落盘到 CSS 变量；内容（博客文章 + 知识库文档）以数据/Markdown 形式独立存在。

---

## 技术栈

- **Vite 5** + **React 18** + **TypeScript（strict）**
- **react-router-dom 6**（纯客户端 SPA，无 SSR/SSG）
- **Tailwind CSS 3**：语义化工具类映射到 CSS 变量
- 内容渲染：`marked`（GFM）→ `DOMPurify` 消毒
- 状态/主题：`ConfigContext` 单一状态源 + `localStorage` 持久化

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器 http://localhost:5173（HMR）
npm run build      # 类型检查（tsc -b）+ 生产构建到 dist/
npm run preview    # 预览生产构建产物
```

> 项目未内置 lint / test / CI。类型检查已内置于 `build`。

## 目录结构

```
src/
├─ config/            # 默认配置 + 20 套主题预设
│  ├─ default.config.ts
│  └─ presets.ts
├─ context/          # ConfigContext：配置状态源、CSS 变量注入、持久化
├─ layouts/          # 20 套首页「方向」(direction)，经 registry.ts 注册
├─ components/       # Header/Footer/Sidebar/ThemePanel/Article* 等
├─ pages/            # 路由页面（含 Wiki、WikiDetail）
├─ hooks/            # useResponsive / useReadingProgress / useActiveHeading ...
├─ utils/            # markdown.ts / toc.ts / cover.ts
├─ data/posts.ts     # 博客文章（Markdown 字符串，静态 TS 模块）
├─ content/wiki/     # LLM Wiki 知识库（30 篇 .md 原文 + index.ts 元信息/加载器）
├─ styles/globals.css# 令牌兜底默认值与设计系统样式
└─ types.ts          # BlogConfig / DeepPartial
```

## 配置驱动主题（核心机制）

1. `types.ts` 定义 `BlogConfig`（`site/theme/layout/nav/features`）。
2. `config/default.config.ts` 提供默认值；`config/presets.ts` 提供 20 套预设，每套绑定一种首页布局方向 `direction`。
3. `ConfigContext` 加载持久化配置（`localStorage` 键 `medai-blog-config`），`deepMerge` 到默认配置，并将整棵配置写入 `:root` CSS 变量，同时设置 `<html data-mode>`。
4. 组件只消费语义工具类（`bg-bg` / `text-muted` / `text-primary` / `rounded-brand` / `font-heading`），不写死视觉值。
5. 运行时点右上角「定制」即可切换预设、调色、调字体、调布局，变更自动落盘。

**新增一套首页风格** = 在 `src/layouts/` 新建组件 + 在 `registry.ts` 注册（组件映射、中文名）两处，其余零改动。

## LLM Wiki 知识库

- 入口：`/wiki`（按 4 大层分组列出 30 篇）、`/wiki/:slug`（详情）。
- 文档原文以 **Markdown 文件** 形式存放于 `src/content/wiki/*.md`，与仓库同源，可在 GitHub 直接阅读。
- 元信息（标题 / 所属层 / 简介）在 `src/content/wiki/index.ts` 静态维护；正文经 `import.meta.glob` 懒加载，沿用 `marked + DOMPurify` 渲染。
- 文档间 `.md` 互链已被自动重写为站内 `/wiki/<slug>` 路由。
- 领域分组（理论层 / 选型与工具层 / 流程方法论层 / 规范与能力封装层）与新增/修订规则见 [`RULES.md`](./RULES.md)。

## 内容贡献

- **博客文章**：在 `src/data/posts.ts` 追加 `Post` 对象。
- **知识库文档**：将 `.md` 放入 `src/content/wiki/`，并在 `src/content/wiki/index.ts` 的 `wikiDocs` 登记；文档内互链统一使用 `<文件名>.md` 形式（会被自动改写）。

## 许可

代码与文档默认归仓库所有者所有；知识库正文版权归原作者/整理者。
