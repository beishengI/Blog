# 个人 Blog 系统 — SDD（规范驱动开发文档）

| 项 | 内容 |
| --- | --- |
| 文档版本 | v0.3（草案，待确认） |
| 创建日期 | 2026-09-02 |
| 更新日期 | 2026-09-02（v0.3：方向性调整——**降低个人运维 + Agent 仅作补充 + 核心回归技术文章分享**。部署改 Vercel、评论改 Giscus、v1 不引入数据库、Agent 收敛为单一可选能力） |
| 状态 | **待确认 · 确认前不进入编码阶段** |
| 目标读者 | 项目所有者（你）、后续协作开发者 / AI 助手 |
| 关联文档 | 确认后派生：`docs/ARCHITECTURE.md`、`docs/CONTENT-SCHEMA.md`、`docs/THEME-SPEC.md`、`docs/API.md`、`docs/adrs/`（关键决策记录） |

---

## 0. 阅读指南与当前状态

### 0.1 本文档的作用

本文档是**唯一的需求与实现契约**。M0 之后的所有开发任务，都必须能追溯到本文件中的某条 `FR-*`（功能需求）或 `NFR-*`（非功能需求）；任何超出本规范的改动，需要先回到本文档修订。

### 0.2 关键假设（如与你的预期不符，请在确认时指出）

| 编号 | 假设 | 若否，影响 |
| --- | --- | --- |
| A1 | 主技术栈采用 **Next.js 15（App Router）+ TypeScript + Tailwind CSS v4** | 可替换为 Astro 5，见 §6.1 备选方案 |
| A2 | 内容以**仓库内 Markdown/MDX 文件**（Git 版本管理）为唯一事实来源 | 核心创作方式即 Git 工作流，运维最低 |
| A3 | 评论与留言采用 **Giscus（GitHub Discussions）**，零后端、零数据库，UI 受 Giscus 约束但可主题适配 | 若要求完全自定义评论 UI，需回退自建（见 §13 Q3） |
| A4 | 部署目标为 **Vercel（Git 推送即部署，SSG/ISR）**，零个人运维 | 若须自托管，可改用 Docker（§6.1），但运维成本上升 |
| A5 | 单作者（你），无需多用户权限体系；管理台（如需）通过口令 + 环境变量保护 | 多作者见 §13 Q5 |
| A6 | 语言以 **简体中文为主**，i18n 仅做结构预留，v1 不实现多语言切换 | 见 §13 Q4 |
| A7 | Agent 能力（仅 FR-701）由**服务端调用可插拔 LLM** 实现，API Key 来自环境变量；**默认关闭**，未配置 Key 时入口不渲染、零外部请求 | 若拒绝任何外部 LLM 调用，FR-701 直接不实现 |

### 0.3 待确认的开放问题

见 §13。其中 **Q1（部署形态）、Q3（评论方案）、Q8（LLM 供应商）、Q10（Agent 默认开关）** 会显著影响架构，请优先答复。

### 0.4 v0.2 → v0.3 方向调整摘要

| 原问题 / 决策 | v0.3 处置 |
| --- | --- |
| 原 C3 Vercel 与自建 SQLite 冲突 | 改为 **Vercel + Giscus + 邮件 API，v1 无数据库**，冲突自然消失 |
| 原 C1 评论邮件通知 vs 仅存哈希 | Giscus 自带通知（GitHub 账号），不再自存邮箱，矛盾消除 |
| 原 C2 在线编辑器"落盘"语义 | v1 创作主路径为 Git 工作流；在线编辑器降为 P2 可选（本地可用 / 生产经 GitHub API 提交） |
| 原 R1 首屏 JS ≤180KB vs 常驻面板 | 主题面板/命令面板/AI 助手均 `dynamic import` 懒挂载（沿用 v0.2） |
| 原 Agent 五件套（FR-7xx） | 收敛为 **单一 FR-701（AI 助手问答，P2、默认关）**，其余移出 v1 |

---

## 1. 项目概述

### 1.1 目标与愿景

构建一个**低运维、可长期演进的个人技术知识平台**，核心承担：

1. **技术文章分享（核心）**：结构化沉淀技术笔记、读书摘要、思考记录，支持长期检索与回顾；
2. **作品展示**：以项目维度展示成果，形成对外可验证的能力凭证；
3. **交流沟通（轻量）**：通过低运维方案（Giscus / 邮件）提供反馈通道；
4. **智能增强（补充，可选）**：在 FR-701 中以 AI 助手问答降低长文阅读门槛，**仅作补充、默认关闭**（见 §15）。

区别于通用博客模板的核心诉求：**UI 高度可自定义**——主题、配色、字体、布局、页面区块结构均需在**不改动组件源码**的前提下可调整，且调整结果可持久化、可导出复用。同时坚持**零个人运维**优先：能用托管服务/静态生成解决的，不自建后端。

### 1.2 目标用户与场景

| 角色 | 场景 | 关键诉求 |
| --- | --- | --- |
| 作者（你） | 写笔记 / 归档资料 / 发布作品 / 回复评论 | 写作无摩擦、检索快、样式可折腾、**不用管服务器** |
| 读者 | 搜索某知识点 / 浏览作品 / 提问交流 | 加载快、可读性好、能评论、能问（可选） |
| 招聘方 / 合作方 | 快速了解你的能力与作品 | 作品页结构清晰、有可视化成果 |
| 未来的你 | 三年后回看某篇笔记 | 内容格式稳定、不依赖已死的服务 |

### 1.3 范围界定

**In Scope（本规范覆盖）**

- 文章系统（分类 / 标签 / 系列 / 搜索 / 代码高亮 / 目录 / 阅读进度）—— **核心**
- 作品集模块（网格 / 筛选 / 详情页 / 图集）
- 评论（Giscus）、留言板（Giscus，可选）、联系表单（邮件 API）
- 主题系统（多预设 + 运行时可视化编辑器 + 导入导出）
- 布局区块系统（页面区块顺序 / 显隐 / 参数可配置）
- 本地 Markdown 写作工作流（CLI + VS Code 配置）—— **核心创作路径**
- SEO / RSS / Sitemap / OG 图 / 性能 / 无障碍
- **Agent（可选补充）**：FR-701 AI 助手问答（P2，默认关）

**Out of Scope（明确不做，避免范围蔓延）**

- 自建评论后端 / 数据库（采用 Giscus）
- 多用户注册登录与权限分级（仅单作者 + 口令保护后台，可选）
- 付费 / 会员 / 订阅邮件推送（M8 后再评估）
- 移动原生 App、小程序
- 站内实时聊天 / IM
- 富媒体视频托管（仅支持外链嵌入）
- 服务端渲染的多语言全站翻译（v1 仅结构预留）
- v1 的自动摘要 / 智能推荐 / AI 辅助写作 / AI 辅助审核（留待后续评估）

### 1.4 成功指标（上线后 3 个月）

| 指标 | 目标 |
| --- | --- |
| Lighthouse（移动端）性能 / 无障碍 / SEO | ≥ 95 / ≥ 95 / 100 |
| 文章发布耗时（从想到发） | ≤ 10 分钟（本地写 + Git 推送） |
| **运维投入** | **0 台自建服务器；部署=Git 推送；评论/邮件均为托管服务** |
| 内容可迁移性 | 全站内容 100% 为纯 Markdown 文件，换框架不丢数据 |
| 主题定制耗时（换一整套配色 + 字体） | ≤ 3 分钟，无需改代码 |
| 数据可维护性 | 备份 = 复制 `content/` 目录 + 导出 GitHub Discussions（Giscus） |

---

## 2. 术语表

| 术语 | 定义 |
| --- | --- |
| **Design Token（设计令牌）** | 以 CSS 变量形式存在的样式原子（颜色、圆角、间距、字号等），组件只消费令牌不写死值 |
| **Preset Theme（预设主题）** | 一组完整令牌值的集合，如 `catppuccin-latte`、`nord` |
| **Layout Block（布局区块）** | 页面的可插拔组成单元（Hero、最新文章、精选作品…），由配置声明顺序与参数 |
| **Section Schema（区块模式）** | 定义区块类型、可用参数、默认值与校验规则的元数据，供可视化编辑器生成表单 |
| **Frontmatter** | Markdown 文件顶部的 YAML 元数据区 |
| **MDX** | 支持在 Markdown 中直接使用 React 组件的格式 |
| **SSR / SSG / ISR** | 服务端渲染 / 构建时静态生成 / 增量静态再生成 |
| **INP / LCP / CLS** | 交互到下次绘制 / 最大内容绘制 / 累计布局偏移（Core Web Vitals） |
| **Giscus** | 基于 GitHub Discussions 的开源评论系统，零后端、可嵌入、支持身份与通知 |
| **RAG（检索增强生成）** | 先检索相关文档片段，再将片段作为上下文交给 LLM 生成答案，降低幻觉、保证可溯源 |
| **Embedding（向量嵌入）** | 将文本映射为稠密向量的表示，用于语义相似度检索 |
| **TL;DR** | "Too Long; Didn't Read"，自动生成的内容要点摘要（v1 不做，仅术语预留） |

---

## 3. 用户故事（按模块）

**技术文章分享（核心）**
- 作为作者，我希望用 Markdown 写作并即时预览，以便专注内容而非排版。
- 作为作者，我希望给文章打多个标签并归入分类，以便日后按主题回顾。
- 作为读者，我希望输入关键词即刻找到文章，且在文中直接定位到匹配段落。
- 作为读者，我希望代码有语法高亮和一键复制，并支持明暗主题自适应。

**作品展示**
- 作为作者，我希望为每个作品配置封面、图集、技术栈、外链，以便立体呈现。
- 作为招聘方，我希望按技术栈筛选作品，并直接进入 Demo 或源码。

**交流沟通（轻量）**
- 作为读者，我希望用 GitHub 账号直接评论、被回复时收到通知（Giscus 原生支持）。
- 作为合作方，我希望通过联系表单直接发消息给你。

**UI 自定义**
- 作为作者，我希望拖动滑块就能改全站主色，实时看到效果，并一键保存为新主题。
- 作为作者，我希望把「精选作品」区块从首页移除或挪到最下面，只需改配置。
- 作为作者，我希望导出主题配置 JSON 并分享给他人。

**智能增强（可选补充）**
- 作为读者，我希望在文章页直接问 AI"这篇文章讲了什么 / 某段怎么理解"，并得到带出处的答案（可选、默认关）。

---

## 4. 功能规范（Functional Requirements）

> 优先级：**P0** = 首个可用版本必须有；**P1** = 上线前应有；**P2** = 后续增强 / 可选。
> 每条 FR 均附 **AC（验收标准）**，AC 是「完成」的唯一判定依据。

### 4.1 内容系统（FR-1xx）

#### FR-101 文章渲染（P0）
- 文章以 `.md` / `.mdx` 存于 `content/posts/**`，构建时解析 frontmatter 与正文。
- 支持 GFM（表格、任务列表、删除线、自动链接）、脚注、数学公式（KaTeX）、图表（Mermaid，懒加载）、提示块（Callout：note/tip/warning/danger）、图片懒加载与灯箱。
- **AC-101.1**：任意 `.md` 放入 `content/posts/` 后，`pnpm dev` 无需重启即可访问 `/posts/<slug>`。
- **AC-101.2**：上述 8 类扩展语法各有 1 篇示例文章，在本地全部正确渲染且无控制台报错。
- **AC-101.3**：正文中的图片默认 `loading="lazy"`，点击可放大查看。
- **AC-101.4（无 JS 降级）**：禁用 JS 时，文章正文、标题、代码块（静态高亮）完整可读；Mermaid 图降级为"查看源码/外链"占位（见 §8.4）。

#### FR-102 分类与标签（P0）
- 分类为**树形两级**（如 `frontend > react`），在 `content/categories.json` 中显式定义（id、名称、slug、父级 id、描述、图标、主题色、排序）。**父分类须作为独立条目存在**。
- 标签**自动聚合**自文章 frontmatter，可通过 `content/tags.json` 覆写别名与描述。
- 提供 `/categories`、`/tags` 总览页与 `/categories/[...slug]`、`/tags/[tag]` 列表页，支持分页。
- **AC-102.1**：文章引用了未定义的分类 id（或其父 id 不存在）时，构建失败并给出明确错误。
- **AC-102.2**：分类 / 标签页正确显示文章计数，且计数不含 `draft: true` 的文章。
- **AC-102.3**：列表页 ≥ 20 条时分页，每页 ≤ 12 条，URL 形如 `?page=2`。

#### FR-103 系列文章（P1）
- frontmatter 支持 `series: { name, order }`，同一系列在文章顶部展示导航（上一篇 / 下一篇 / 全部章节）。
- **AC-103.1**：系列内文章按 `order` 排序，缺失 order 的排在末尾并给出构建告警。

#### FR-104 全文搜索（P0）
- 构建时生成分片索引（标题、摘要、标签、分类、正文纯文本、锚点位置）。
- 客户端检索，支持中文（bigram 分词）、英文（空格分词）。
- 权重：标题 5 > 标签 3 > 摘要 2 > 正文 1；支持按分类/标签过滤、按相关度/时间排序。
- 提供 `/search` 页面与全局快捷键（`Ctrl/Cmd + K`）唤起的命令面板。**命令面板与索引均动态懒加载，不进入访客首屏 JS**。
- **AC-104.1**：输入 2 个及以上中文字符，首屏结果 ≤ 150ms 返回（本地 100 篇文章基准）。
- **AC-104.2**：搜索结果高亮命中词，点击可跳转到正文对应标题锚点。
- **AC-104.3**：索引分片懒加载，首屏不加载完整索引；索引总量 ≤ 1.5MB。
- **AC-104.4**：`draft` 文章不进入索引。
- **AC-104.5（无 JS 降级）**：无 JS 时搜索入口降级为指向 `/search` 的静态表单。

#### FR-105 代码高亮（P0）
- 构建期使用 **Shiki** 高亮（零运行时 JS），支持 100+ 语言与明暗双主题自动切换。
- 代码块具备：语言标签、行号（可开关）、一键复制、指定行高亮 `{1,3-5}`、显示文件名/标题、长代码折叠、差异语法 `diff`。
- **AC-105.1**：切换站点明暗主题时，代码配色同步切换且无闪烁。
- **AC-105.2**：代码块渲染不增加任何运行时 JS 体积（构建产物中无 Shiki 运行时）。
- **AC-105.3**：复制按钮在复制成功后显示 2 秒反馈态。

#### FR-106 文章元数据与阅读体验（P0/P1）
- 展示：发布日期、更新日期、阅读时长（中文按 350 字/分钟）、字数。
- 右侧/内联目录（TOC），滚动高亮当前章节，移动端折叠。
- 顶部阅读进度条（P1）。
- 上一篇 / 下一篇导航（P1）。
- 统计数字（如未来启用量化指标）采用 **NumberFlow 式平滑数位过渡**，并尊重 `prefers-reduced-motion`。
- **AC-106.1**：TOC 滚动高亮误差 ≤ 1 个标题。
- **AC-106.2**：阅读时长与字数对 3 篇不同长度文章的估算误差 ≤ 15%。

#### FR-107 草稿与定时发布（P1）
- `draft: true` 的文章：生产构建中不可访问，开发模式下可访问并显示「草稿」角标。
- `date` 为未来时间时视为「待发布」，生产环境不可访问。
- **AC-107.1**：生产构建产物中不存在任何 `draft: true` 或未来日期文章的 HTML。

### 4.2 作品集（FR-2xx）

#### FR-201 作品数据（P0）
- 作品以 `.md` / `.mdx` 存于 `content/projects/`，字段见 §5.1.2。
- **AC-201.1**：缺少必填字段（title / summary / cover / status / year）时构建失败并明确报错。

#### FR-202 作品列表（P0）
- `/projects` 提供**网格 / 列表 / 时间线**三种视图（视图偏好持久化到 localStorage）。
- 支持按技术栈（多选）、年份、状态筛选，支持关键词即时过滤。
- 卡片展示：封面图、标题、一句话简介、技术栈标签、年份、外链入口。
- **交互增强（设计参考 §16.3 radiant-shaders）**：网格视图卡片 hover 时封面由静态图过渡到轻量实时预览（如 GIF/Canvas/视频静音循环，资源懒加载）；普通作品 CTA 为「Explore →」，含深度拆解的作品 CTA 为「Deep dive →」；支持「收藏/保存」态（本地 localStorage）。
- **AC-202.1**：筛选条件的组合结果正确，且筛选状态同步到 URL query，可分享可回退。
- **AC-202.2**：封面图使用 `next/image` 优化，格式优先 AVIF/WebP，列表页首屏图片总大小 ≤ 500KB。
- **AC-202.3**：hover 预览不阻塞首屏渲染，资源在 hover 后按需加载；尊重 `prefers-reduced-motion` 时仅静态封面。

#### FR-203 作品详情（P0）
- `/projects/[slug]`：Hero 区 + 关键指标（highlights）+ MDX 长文 + 图集（灯箱，键盘左右切换）+ 技术栈 + 上下篇导航。
- **AC-203.1**：图集支持键盘 `←/→` 切换、`Esc` 关闭，焦点锁定在弹层内（`focus trap`）。
- **AC-203.2**：详情页包含 `Project` 结构的 JSON-LD，通过 Google 富媒体结果测试。

#### FR-204 精选作品嵌入（P1）
- 支持通过 MDX 组件 `<FeaturedProjects ids={[...]} />` 在任意页面嵌入作品卡片组。
- **AC-204.1**：引用不存在的作品 id 时给出构建告警而非崩溃。

### 4.3 交流沟通（FR-3xx，轻量、低运维）

> 本模块以**零后端、零数据库**为第一原则：评论/留言用 Giscus，联系用邮件 API。

#### FR-301 评论系统（P0，基于 Giscus）
- 文章底部嵌入 Giscus 评论区（GitHub Discussions 后端），读者用 GitHub 账号登录即可评论、回复、投票，被回复时由 GitHub 通知。
- 通过 `data-theme` 与 CSS 变量适配站点明暗主题；可在 `config/site.config.ts` 以 `features.comment` 总开关控制。
- **AC-301.1**：未配置 Giscus（仓库/分类/术语映射）时，评论区不渲染且不构成构建错误（仅空位）。
- **AC-301.2**：评论区随站点 `light/dark` 主题同步切换，无样式断裂。
- **AC-301.3**：页面中不加载任何非 Giscus 官方脚本之外的第三方脚本。

#### FR-302 留言板（P1，可选，基于 Giscus）
- `/guestbook` 页面复用 Giscus（独立 Discussion 映射），时间线形式展示留言。
- **AC-302.1**：`features.guestbook=false` 时，路由返回 404 且不出现在导航/sitemap。

#### FR-303 联系表单（P1，邮件 API）
- `/contact` 页面：姓名、邮箱、主题、正文；提交后由服务端 API Route 调用**事务邮件服务**（如 Resend / SMTP）发送邮件至作者邮箱，**不落库**。
- 提供替代通道：邮箱、GitHub、X、微信二维码等（站点配置中声明）。
- **AC-303.1**：提交成功后展示成功态并清空表单；失败展示可重试的错误提示。
- **AC-303.2**：表单字段具备实时校验与 `aria-invalid` 标注。
- **AC-303.3**：接口仅作邮件转发，不持久化任何提交内容；限流防止滥用（见 §10.2）。

### 4.4 UI 自定义（FR-4xx）— 核心差异化

#### FR-401 明暗主题与多预设（P0）
- 基于 `next-themes`（`class` 策略），支持 `light / dark / system` 三态，零刷新闪烁。
- 内置 ≥ 6 套预设主题：`default`、`catppuccin`（latte/mocha）、`nord`、`solarized`、`mono`、`academic`。
- **AC-401.1**：首屏加载无主题闪烁（FOUC），`system` 模式跟随系统切换即时生效。
- **AC-401.2**：切换主题不触发页面重新请求，纯 CSS 变量过渡（≤ 200ms）。
- **AC-401.3**：任一预设下，正文对比度均 ≥ WCAG AA（4.5:1）。

#### FR-402 设计令牌体系（P0）
- 所有颜色、圆角、间距、字号、阴影、字重、行高、边框宽度均以 CSS 变量定义（见 §7.2）。
- 颜色以 **HSL 通道裸值** 存储，便于运行时按 H/S/L 计算派生色。
- **AC-402.1**：全局代码扫描，组件源码中不存在硬编码颜色值（`transparent`、`currentColor`、`white/black` 及 gradients 例外）。
- **AC-402.2**：修改 `--radius` 一个变量，全站圆角同步变化，无需改动任何组件。

#### FR-403 运行时主题编辑器（P0）
- 悬浮面板（快捷键 `Ctrl/Cmd + Shift + T`），**组件 `dynamic import` 懒挂载**，首次唤起才加载，不进入访客首屏 JS。
- 支持实时调整：色相/饱和度/亮度、圆角、边框宽度、阴影强度、字体族、字号缩放、行高、内容宽度、区块间距。
- 操作：实时预览 → 另存为自定义主题 → 重命名 / 删除 / 导出 JSON / 导入 JSON。
- 持久化：写入 localStorage（游客）；作者登录态可服务端保存（P1，可选）。
- **AC-403.1**：任意调整在 100ms 内反映到页面，不触发 React 全树重渲染（直写 `documentElement` CSS 变量）。
- **AC-403.2**：导出的 JSON 可导入到另一浏览器还原完全一致的外观。
- **AC-403.3**：存在「恢复默认」按钮，一键回到预设。
- **AC-403.4**：调整结果在刷新页面、切换页面后保持。

#### FR-404 布局区块系统（P0）
- 页面由配置驱动的**区块列表**组成，配置位于 `config/layout.config.ts`：

  ```ts
  export const homeBlocks: Block[] = [
    { type: "hero", enabled: true, props: { variant: "split", showAvatar: true } },
    { type: "featuredPosts", enabled: true, props: { count: 6, columns: 3, filter: { featured: true } } },
    { type: "featuredProjects", enabled: true, props: { count: 3 } },
    { type: "recentPosts", enabled: true, props: { count: 5 } },
    { type: "tagCloud", enabled: false, props: { limit: 30 } },
    { type: "newsletter", enabled: false, props: {} },
  ];
  ```
- 可用区块类型（v1）：`hero`、`featuredPosts`、`recentPosts`、`categoryGrid`、`tagCloud`、`featuredProjects`、`timeline`、`guestbookTeaser`、`contactCta`、`customMdx`、`customHtml`、`aiAssistant`（FR-701 入口开关，默认关）。
- 每个区块类型在 `Section Schema` 中声明参数与默认值，用于生成可视化配置表单（P1 拖拽排序，P0 支持改配置）。
- 文章页 / 作品页同样区块化：可开关 TOC、相关文章、评论区、分享栏、上一篇/下一篇，并可调整顺序。
- **AC-404.1**：在配置文件中把某区块 `enabled: false`，该区块从页面消失且不留空白。
- **AC-404.2**：调整区块数组顺序，页面渲染顺序同步变化。
- **AC-404.3**：`props` 传非法值时，开发模式抛出带区块名的明确错误。
- **AC-404.4**：区块渲染失败时降级为该区块的骨架占位，不导致整页 500。

#### FR-405 字体与排版（P1）
- 使用 `next/font` 本地托管，零外部请求、无布局抖动。
- 预设字体组合 ≥ 3 套；支持在配置中替换。
- 提供字号缩放控件（S / M / L 三档），持久化。
- **AC-405.1**：字体加载不产生 CLS（CLS 贡献 ≤ 0.01）。
- **AC-405.2**：切换排版档位后，全站字号与行高同步变化。

#### FR-406 组件可替换（P1）
- 采用 shadcn/ui 模式：UI 组件源码位于仓库内 `components/ui/`，可直接修改。
- **AC-406.1**：修改 `components/ui/button.tsx` 的样式，全站按钮同步变化。

### 4.5 内容创作与管理（FR-5xx，低运维优先）

#### FR-501 本地写作工作流（P0，核心创作路径）
- 提供 VS Code 推荐配置：`.vscode/`（frontmatter 代码片段、Markdown lint 规则、格式化配置）。
- 提供 `pnpm new:post "标题"` CLI 脚手架，按模板生成带完整 frontmatter 的文件。
- **AC-501.1**：`pnpm new:post` 生成的文件无需任何修改即可通过内容校验并成功构建。
- **AC-501.2**：`pnpm lint:content` 可单独运行校验，不执行构建。

#### FR-502 内容校验（P0）
- 构建时执行 schema 校验（Zod）：必填字段、类型、slug 唯一性、分类存在性（含父级）、日期格式、图片路径存在性。
- **AC-502.1**：任何校验失败都会中断构建并输出「文件 + 字段 + 原因」。

#### FR-503 在线 Markdown 编辑器（P2，可选）
- 路径 `/admin`（口令保护），双栏实时预览、Frontmatter 表单化编辑、内容校验、slug 冲突检测。
- **落盘语义（低运维）**：本地开发可直接写 `content/`；生产环境若启用，则通过 **GitHub Contents API** 提交 PR/直接写入（需 `GITHUB_TOKEN`，可选），否则入口隐藏。v1 不承诺生产内写入。
- **AC-503.1**：未配置 `ADMIN_TOKEN` 时，`/admin` 返回 404 且构建期告警。
- **AC-503.2**：编辑器页面 bundle 独立懒加载，不进入访客首屏 JS。

#### FR-504 管理台（P2，可选）
- 仅当启用在线编辑器时需要；评论/留言审核由 Giscus/GitHub 侧完成，无需自建审核台。
- **AC-504.1**：未启用时相关路由与依赖不进入生产包。

### 4.6 平台能力（FR-6xx）

#### FR-601 SEO（P0）
- 每页独立的 `title` / `description` / canonical / OG / Twitter Card。
- 自动生成 `/sitemap.xml`、`/robots.txt`、`/feed.xml`（RSS 2.0 + Atom）、`/feed.json`（JSON Feed）。
- 结构化数据：`Article`、`BreadcrumbList`、`Person`、`Project`。
- 动态 OG 图（P1，通过 `next/og` 生成带标题的卡片图）。
- **AC-601.1**：所有页面 `<title>` 唯一且 ≤ 60 字符。
- **AC-601.2**：`sitemap.xml` 包含全部非草稿页面，且不含 `draft` 与 `/admin`。
- **AC-601.3**：RSS 可被主流阅读器正确解析（用 W3C Feed Validator 通过）。

#### FR-602 性能（P0）
- 见 §8.2 性能预算，构建时通过 CI 检查产物体积。
- **AC-602.1**：`pnpm build` 输出体积报告，超出预算时构建失败。

#### FR-603 无障碍（P0）
- 见 §8.3，构建后使用 axe-core 自动扫描，0 个严重（serious/critical）问题。

#### FR-604 统计分析（P2，可选，低运维）
- 可插拔：配置中填入 **Vercel Web Analytics / Plausible / Umami** 的注入标识，自动注入；不填则不加载任何第三方脚本。
- 公开浏览量/点赞（需量化展示时）可后续接入 serverless KV（Vercel KV / Upstash），v1 不做。
- **AC-604.1**：未配置时页面中不存在任何第三方分析请求。

---

## 5. 数据模型

### 5.1 内容实体（文件系统 = 唯一事实来源，v1 唯一持久层）

目录约定：

```
content/
├─ posts/2026/09-xxx/my-post.mdx
├─ projects/my-project.mdx
├─ pages/about.mdx
├─ categories.json
├─ tags.json
└─ uploads/                      # 图片资源（与 content 同仓，经 Git 管理）
```

> **v1 不引入任何数据库**。评论/留言存于 GitHub Discussions（Giscus），联系表单不落库，统计可选 KV。备份 = 复制 `content/` + 导出 Discussions。

#### 5.1.1 Article（文章）

```yaml
---
title: "文章标题"                 # string, 必填, 1-100
slug: "my-post"                   # string, 选填, 默认取文件名, 全局唯一, /^[a-z0-9-]+$/
description: "用于列表与 SEO 的一句话摘要"  # string, 必填, 10-200
date: 2026-09-02                  # date, 必填 (YYYY-MM-DD)
updated: 2026-09-10               # date, 选填
category: "frontend/react"        # string, 必填, 必须存在于 categories.json（含父级）
tags: ["React", "性能优化"]        # string[], 0-8 项
series:                           # object, 选填
  name: "深入 React 渲染"
  order: 2
cover: "/uploads/cover.webp"      # string, 选填
draft: false                      # boolean, 默认 false
featured: false                   # boolean, 默认 false
toc: true                         # boolean, 默认 true
comment: true                     # boolean, 默认 true（控制 Giscus 是否启用）
lang: "zh-CN"                     # "zh-CN" | "en", 默认 zh-CN（仅元数据，v1 无渲染分支）
---
```

派生字段（构建期计算，不写入文件）：`readingTime`、`wordCount`、`excerpt`、`headings[]`、`plainText`（搜索索引用）、`embedding`（仅 FR-701 启用时生成）。

#### 5.1.2 Project（作品）

```yaml
---
title: "项目名称"                 # 必填
slug: "my-project"                # 选填
summary: "一句话简介"              # 必填, 10-200
cover: "/uploads/cover.webp"      # 必填
preview: "/uploads/preview.webm"  # string, 选填（FR-202 hover 实时预览资源）
gallery:                          # string[], 选填
  - { src: "/uploads/1.webp", alt: "首页截图", caption: "着陆页" }
year: 2026                        # number, 必填
role: "全栈开发"                   # string, 选填
stack: ["Next.js", "TypeScript"]  # string[], 必填, ≥1
status: "done"                    # "done" | "wip" | "archived", 必填
deepDive: false                   # boolean, 选填（true 时 CTA 显示 "Deep dive →"）
links:                            # object, 选填, 所有值必须是合法 URL
  demo: "https://..."
  repo: "https://github.com/..."
  case: "/posts/xxx"
highlights:                       # object[], 选填, 至多 4 项
  - { label: "首屏加载", value: "0.8s" }
featured: true                    # boolean, 默认 false
order: 10                         # number, 默认 999, 升序
draft: false                      # boolean
tags: ["前端"]                     # string[]
---
```

#### 5.1.3 Category（分类，`categories.json`）

```json
{
  "categories": [
    { "id": "frontend", "name": "前端", "slug": "frontend", "parent": null,
      "description": "...", "icon": "layout", "color": "blue", "order": 10 },
    { "id": "frontend/react", "name": "React", "slug": "react", "parent": "frontend",
      "description": "...", "icon": "atom", "color": "blue", "order": 10 }
  ]
}
```
约束：`parent` 必须存在（或为 `null` 表示一级）；层级 ≤ 2；`id` 全局唯一。

#### 5.1.4 Tag（标签，`tags.json`，可选覆写）

```json
{ "aliases": { "JS": "JavaScript" }, "descriptions": { "性能优化": "与性能调优相关的文章" } }
```

### 5.2 外部持久层（非自建）

| 能力 | 托管方案 | 配置项 |
| --- | --- | --- |
| 评论 / 留言 | **Giscus（GitHub Discussions）** | `GISCUS_REPO`、`GISCUS_CATEGORY_ID`、`NEXT_PUBLIC_GISCUS_*` |
| 联系表单 | 事务邮件 API（Resend / SMTP） | `CONTACT_EMAIL`、`RESEND_API_KEY`（或 SMTP 环境变量） |
| 统计（可选 P2） | Vercel Web Analytics / Plausible / serverless KV | 注入标识或 KV 绑定 |

> 以上均为托管/无服务器方案，**作者无需维护任何数据库进程**。

### 5.3 配置实体

| 文件 | 职责 | 关键字段 |
| --- | --- | --- |
| `config/site.config.ts` | 站点身份与全局开关 | `title`、`description`、`url`、`author{name,bio,avatar,email}`、`socials[]`、`nav[]`、`footer`、`locale`、`timezone`、`features{search,comment,guestbook,contact,admin,aiAssistant}`、`giscus{repo,categoryId,term,mapping}`、`analytics` |
| `config/theme.config.ts` | 主题预设与默认排版 | `defaultTheme`、`presets[]`、`fonts{sans,serif,mono}`、`defaultScale`、`radius`、`density` |
| `config/layout.config.ts` | 页面区块编排 | `homeBlocks[]`、`postBlocks[]`、`projectBlocks[]`、`sidebar{}` |
| `config/search.config.ts` | 搜索权重与分词 | `weights`、`minQueryLength`、`cjk: true` |
| `config/ai.config.ts` | Agent 能力与供应商（仅 FR-701，默认关） | `provider`、`model`、`embeddingModel`、`baseURL`、`enabled:false` |

> 所有配置均为 **TypeScript 文件**（类型安全 + 可注释 + 支持 IDE 跳转），不使用 JSON/YAML。

### 5.4 实体关系

```
Category 1 ──< N Article
Tag      N ──< M Article              (通过 frontmatter 数组隐式关联)
Series   1 ──< N Article
Project  N ──< M Tag
Article  ──[Giscus]──> Discussion     (评论存于 GitHub Discussions)
Article  1 ──< 1 Embedding            (仅 FR-701 启用时，语义向量)
```

---

## 6. 架构与技术选型

### 6.1 技术栈

| 层 | 选型 | 版本 | 选型理由 |
| --- | --- | --- | --- |
| 语言 | TypeScript（strict） | 5.x | 数据模型与配置强类型，重构安全 |
| 框架 | **Next.js（App Router）** | 15.x | RSC/SSG/ISR 一体化；零运维部署到 Vercel |
| 运行时 | Node.js | ≥ 20 LTS（本机 24.16 ✅） | Next.js 15 要求 |
| 包管理 | pnpm | ≥ 9（本机 11.12 ✅） | 磁盘与安装速度优势 |
| 样式 | **Tailwind CSS v4** | 4.x | `@theme` 原生支持令牌映射到 CSS 变量 |
| 组件基础 | **shadcn/ui + Radix Primitives** | latest | 组件源码在仓库内，可任意改；Radix 保证无障碍 |
| 主题切换 | next-themes | latest | 解决 SSR 主题闪烁（FOUC）问题 |
| 内容解析 | gray-matter + unified/remark/rehype + Zod | latest | 完全自建解析管线 |
| MDX | `@next/mdx` + `@mdx-js/react` | latest | 与 App Router 集成良好 |
| 代码高亮 | **Shiki**（构建期） | latest | 零运行时 JS；双主题 |
| 扩展语法 | remark-gfm / remark-math + rehype-katex / rehype-slug / rehype-autolink-headings / rehype-pretty-code / rehype-sanitize | latest | 覆盖 FR-101 全部语法 |
| 图表 | Mermaid（动态 import，客户端） | latest | 懒加载，不进首屏 |
| 搜索 | 自建构建期索引 + FlexSearch（客户端） | latest | 中文可控（bigram） |
| 评论/留言 | **Giscus** | latest | 零后端、零数据库、GitHub 通知 |
| 联系 | **事务邮件 API（Resend / SMTP）** | latest | 不落库、零运维 |
| 图标 | lucide-react | latest | tree-shaking 良好 |
| 字体 | next/font（本地托管） | — | 无外部请求、无 CLS |
| **Agent（可选）** | **可插拔 LLM（OpenAI/DeepSeek/本地 Ollama）** | latest | 仅 FR-701，服务端调用，Key 来自环境变量；默认关闭 |
| 质量保障 | ESLint + Prettier + TypeScript + Vitest + axe-core + Lighthouse CI | latest | 见 §11 |
| 部署 | **Vercel（Git 推送即部署）** | — | 零个人运维；自托管 Docker 仅作备选 |

**备选方案对比（如需更换框架，见 Q0）**

| 方案 | 优势 | 劣势 | 适用 |
| --- | --- | --- | --- |
| **Next.js 15** ✅ 推荐 | 动态能力强、生态最大、Vercel 零运维部署 | 交互组件需 `"use client"`，JS 体积需管理 | 需要主题编辑器、可选 AI 后端 |
| Astro 5 | 默认零 JS、内容集合类型安全、性能极佳 | 动态能力依赖适配器/岛屿 | 纯静态内容站、不在意在线编辑器 |
| Hugo | 构建最快 | Go 模板生态、UI 自定义成本高 | 追求极致构建速度 |

> **运维说明**：A3/A4 已转向"托管服务 + 静态生成"，作者只需维护仓库与 GitHub Discussions，无需任何常驻进程。

### 6.2 目录结构

```
.
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx                       # 首页（区块化渲染）
│  │  ├─ posts/page.tsx                 # 文章列表（分页）
│  │  ├─ posts/[...slug]/page.tsx
│  │  ├─ categories/, tags/
│  │  ├─ projects/, projects/[slug]/
│  │  ├─ search/, guestbook/, contact/
│  │  └─ about/
│  ├─ admin/                            # 在线编辑器（P2，可选）
│  ├─ api/                              # contact / ai（可选）/ og
│  ├─ layout.tsx, error.tsx, not-found.tsx
│  ├─ sitemap.ts, robots.ts, feed.xml/route.ts
├─ components/
│  ├─ ui/                               # shadcn/ui 组件（源码可改）
│  ├─ blocks/                           # 布局区块（Hero、FeaturedPosts…、AiAssistant）
│  ├─ post/                             # TOC、CodeBlock、Callout、Mermaid、Share、NumberFlow
│  ├─ theme/                            # ThemeProvider、ThemePanel、PresetPicker
│  ├─ agent/                            # AiChat（FR-701，可选）
│  └─ layout/                           # Header、Footer、CommandMenu
├─ config/                              # site / theme / layout / search / ai
├─ content/                             # 全部内容（唯一事实来源）
├─ lib/
│  ├─ content/                          # 解析、校验、查询
│  ├─ search/                           # 索引生成、分词、检索
│  ├─ ai/                               # LLM 客户端、RAG 管线（仅 FR-701）
│  ├─ validation/, utils/
├─ styles/                              # globals.css（令牌）、prose.css
├─ types/
├─ scripts/                             # new-post CLI、索引生成
├─ public/                              # 静态资源
├─ docs/                                # 本文件及派生文档
```

### 6.3 渲染与数据流

| 页面 | 策略 | 说明 |
| --- | --- | --- |
| 首页 / 列表页 | **SSG + ISR**（`revalidate = 3600`） | 内容变动时通过 `revalidatePath` 主动失效 |
| 文章 / 作品详情 | **SSG**（`generateStaticParams`） | 构建期生成；Shiki 在构建期完成高亮 |
| 搜索页 | **CSR**（静态壳 + 懒加载索引） | 索引按分片在空闲时预取 |
| 评论区 | **Giscus（客户端嵌入）** | 走 GitHub Discussions，无自建 API |
| 联系表单 | **CSR + `/api/contact`** | 服务端调用邮件 API，不落库 |
| 管理台 / 编辑器 | CSR（`force-dynamic`，P2 可选） | 不入访客 bundle |
| AI 助手（可选） | **CSR 懒挂载 + `/api/ai/chat`** | 入口默认隐藏，唤起才加载；流式返回 |
| RSS / Sitemap | Route Handler | 构建期 + 运行时均可 |

**内容管线**

```
.md/.mdx → gray-matter(frontmatter) → Zod 校验 → remark/rehype 插件链
        → [构建期] Shiki 高亮、TOC 抽取、纯文本抽取、搜索索引生成、（FR-701 时）Embedding 生成
        → RSC 渲染 (HTML) + 结构化数据
```

### 6.4 主题系统分层（FR-401/402/403 实现骨架）

```
第 1 层  预设/自定义主题 JSON  ──►  HSL 令牌值
第 2 层  :root / .dark CSS 变量     （--background, --primary, --radius, --font-sans …）
第 3 层  Tailwind v4 @theme inline  （把 CSS 变量映射为 bg-primary / rounded-lg 等工具类）
第 4 层  组件                        （只使用工具类与语义化类名，零硬编码颜色）
第 5 层  运行时主题面板              （仅改写第 2 层变量，瞬发全站更新）
```

---

## 7. UI / UX 规范

### 7.1 设计原则

1. **内容优先**：正文可读性是第一指标。
2. **令牌驱动**：任何视觉差异都必须能通过令牌解释。
3. **克制的动效**：动效用于建立空间关系与反馈；**全站尊重 `prefers-reduced-motion`**。
4. **渐进增强**：无 JS 时文章正文仍完整可读（评论/搜索降级）。
5. **一致的密度**：同一视图内元素间距遵循 4px 基准网格。
6. **低运维优先**：能用静态生成/托管服务解决的不自建后端。

### 7.2 设计令牌（Design Tokens）

**颜色（语义化命名，值为 HSL 通道裸值）**

| 令牌 | 语义 | 亮色示例 | 暗色示例 |
| --- | --- | --- | --- |
| `--background` / `--foreground` | 页面底色 / 主文字 | `0 0% 100%` / `222 47% 11%` | `222 47% 7%` / `210 40% 96%` |
| `--card` / `--card-foreground` | 卡片容器 | `0 0% 100%` / 同上 | `222 45% 10%` / 同上 |
| `--muted` / `--muted-foreground` | 次级背景 / 次级文字 | `210 40% 96%` / `215 16% 47%` | `217 33% 17%` / `215 20% 65%` |
| `--primary` / `--primary-foreground` | 主强调 | `222 47% 11%` / `210 40% 98%` | `210 40% 98%` / `222 47% 11%` |
| `--accent` / `--accent-foreground` | 次强调 | `210 40% 96%` / `222 47% 11%` | `217 33% 17%` / `210 40% 98%` |
| `--border` / `--input` / `--ring` | 描边 / 输入 / 焦点环 | `214 32% 91%` 系 | `217 33% 20%` 系 |
| `--destructive` / `--success` / `--warning` / `--info` | 语义色 | — | — |
| `--overlay`, `--code-bg`, `--prose-*` | 弹层遮罩、代码底、正文排版 | — | — |

**其他令牌**

| 类别 | 令牌 | 取值范围 |
| --- | --- | --- |
| 圆角 | `--radius` | `0` / `0.3rem` / `0.5rem` / `0.75rem` / `1rem` |
| 间距密度 | `--density` | `compact(0.75)` / `cozy(1)` / `loose(1.25)` |
| 内容宽度 | `--content-width` | `65ch` / `72ch` / `80ch` |
| 字号缩放 | `--font-scale` | `0.94` / `1` / `1.06` |
| 字体 | `--font-sans` / `--font-serif` / `--font-mono` | 已注册字体族名 |
| 行高 | `--leading-normal` / `--leading-prose` | `1.5` / `1.75` |
| 阴影 | `--shadow-sm/md/lg` | 由 `--shadow-strength` 派生 |
| 动效 | `--duration-fast/base/slow` | `120ms` / `200ms` / `320ms` |
| Z 轴 | `--z-header/panel/modal/toast` | `40/50/60/70` |

> **派生规则**：主题编辑器只暴露「色相 / 饱和度 / 亮度」三滑块 + 少量几何参数，其余令牌由算法自动派生，保证对比度合法。

### 7.3 预设主题

| ID | 名称 | 特征 |
| --- | --- | --- |
| `default` | 中性蓝灰 | 高对比、克制，默认项 |
| `catppuccin-latte` / `-mocha` | Catppuccin | 柔和低饱和，长文友好 |
| `nord` | Nord | 冷色极地风，暗色为主 |
| `solarized` | Solarized | 经典科学配色，明暗成对 |
| `mono` | 极简黑白 | 无色相，突出内容排版 |
| `academic` | 学术衬线 | 衬线标题 + 宽行距，适合长文 |

### 7.4 布局与栅格

| 断点 | 宽度 | 布局 |
| --- | --- | --- |
| `sm` | ≥ 640px | 单列，卡片 1 列 |
| `md` | ≥ 768px | 列表 2 列，文章显示侧边 TOC |
| `lg` | ≥ 1024px | 作品网格 3 列，首页双栏 Hero |
| `xl` | ≥ 1280px | 容器最大宽度 1200px，TOC 与正文分栏 |
| `2xl` | ≥ 1536px | 容器最大宽度 1360px |

- 文章页结构（lg 及以上）：`[ 正文 65ch ] [ TOC 240px 粘性 ]`
- 正文排版：段间距 `1.25em`，标题层级使用 `--leading-prose`，中文启用 `text-wrap: pretty`。

### 7.5 组件清单（v1）

**基础层（shadcn/ui）**：Button、Input、Textarea、Select、Switch、Slider、Dialog、DropdownMenu、Tabs、Badge、Card、Separator、Skeleton、Tooltip、Toast、Sheet、Popover、Command、Avatar、Pagination、Breadcrumb。

**业务组件**：`PostCard`、`PostMeta`、`TOC`、`CodeBlock`、`Callout`、`Mermaid`、`ImageLightbox`、`TagPill`、`CategoryBadge`、`ProjectCard`、`ProjectGallery`、`ContactForm`、`ThemePanel`、`PresetPicker`、`FontPicker`、`DensityControl`、`ShareBar`、`ReadingProgress`、`CommandMenu`、`BlockRenderer`、`NumberFlow`、`GiscusComments`、`AiChat`（可选）。

### 7.6 无障碍规范（对齐 WCAG 2.2 AA）

- 全部交互元素可键盘到达，焦点环可见（`--ring`，对比度 ≥ 3:1）。
- 图标按钮必须有 `aria-label`；纯装饰图标 `aria-hidden`。
- 弹层（Dialog / 灯箱 / 命令面板 / AI 助手）实现焦点锁定与 `Esc` 关闭，关闭后焦点归还触发元素。
- 表单错误使用 `aria-describedby` 关联提示文本。
- 尊重 `prefers-reduced-motion`：所有过渡降级为 0ms（含 NumberFlow、列表入场、hover 预览）。
- 尊重 `prefers-contrast: more`：提升边框与文字对比。
- 跳转链接「跳到主内容」为页面首个可聚焦元素。
- 文本缩放至 200% 不丢失内容与功能。

### 7.7 动效规范

| 场景 | 时长 | 缓动 | 备注 |
| --- | --- | --- | --- |
| 颜色/主题切换 | 200ms | `ease-out` | 仅过渡 `background-color`、`color`、`border-color` |
| 悬停反馈 | 120ms | `ease-out` | 位移 ≤ 2px |
| 弹层进出 | 200ms / 160ms | `ease-out` / `ease-in` | 位移 8px + 透明度 |
| 列表/卡片入场 | 320ms | `ease-out` | 首屏 `IntersectionObserver` 触发，stagger 错峰 |
| 阅读进度条 | 实时 | `linear` | `transform: scaleX` |
| 统计数字 | 350ms | `ease-out` | NumberFlow 数位过渡，尊重 reduced-motion |
| 作品 hover 预览 | 200ms 淡入 | `ease-out` | 静态封面 → 实时预览，资源懒加载 |

---

## 8. 技术约束与非功能需求

### 8.1 运行环境

| 项 | 约束 |
| --- | --- |
| Node.js | ≥ 20 LTS（推荐 22/24，本机 24.16） |
| 包管理器 | pnpm ≥ 9（本机 11.12）；仓库含 `packageManager` 字段锁定 |
| 操作系统 | 开发 Windows 11 / macOS / Linux；部署 Linux（Vercel 托管） |
| 浏览器 | Chrome、Edge、Firefox、Safari 最近 2 个大版本；不支持 IE |
| 外部服务 | Giscus（GitHub）、邮件 API（Resend/SMTP）、可选 LLM；均通过环境变量配置 |
| 编码 | 全仓 UTF-8，换行符 LF，中文文件名禁止 |

### 8.2 性能预算（NFR）

| 指标 | 目标 | 测量方式 |
| --- | --- | --- |
| LCP（4G 模拟，移动端） | ≤ 2.0s | Lighthouse CI |
| INP | ≤ 200ms | 实验室 + 真实用户（P2） |
| CLS | ≤ 0.02 | Lighthouse CI |
| TBT | ≤ 200ms | Lighthouse CI |
| 首屏 JS（gzip，**不含懒挂载面板**） | ≤ 180KB | `next build` 产物分析 |
| 单页总传输（文章页，无图） | ≤ 350KB | WebPageTest |
| 单页总传输（作品列表，含图） | ≤ 1.2MB | WebPageTest |
| Lighthouse 性能 / 无障碍 / 最佳实践 / SEO | ≥ 95 / ≥ 95 / ≥ 95 / 100 | Lighthouse CI |
| 构建耗时（100 篇文章 + 20 作品） | ≤ 90s | CI 计时 |
| 搜索首查响应 | ≤ 150ms | 本地基准脚本 |

超预算 → CI 失败（阈值可配置在 `performance.budget.js`）。

### 8.3 质量约束

| 项 | 要求 |
| --- | --- |
| TypeScript | `strict: true`，禁止 `any`（除第三方类型缺失处并附 `// TODO`） |
| Lint | ESLint（next/core-web-vitals + tailwindcss 插件）零 error |
| 格式化 | Prettier 统一；保存即格式化 |
| 测试 | 核心纯函数（内容解析、分词检索、令牌派生）单测覆盖率 ≥ 70%；关键流程（本地写作→构建→部署）E2E ≥ 1 条 |
| 无障碍 | axe-core 自动扫描，serious/critical 问题数 = 0 |
| 提交规范 | Conventional Commits；`main` 分支保护，PR 需构建通过 |

### 8.4 兼容性约束（降级边界）

- 无 JS 环境：文章正文、列表、作品详情**必须可读**。
- **降级边界清单**：
  - ✅ 可读：正文、标题、目录文本、静态代码高亮、分类/标签/作品信息。
  - ⚠️ 降级：`Mermaid` → 源码/外链占位；`搜索` → 静态表单跳转 `/search`；`主题切换` → 仅 system 默认；`评论(Giscus)` → 提示 JS 必需；`AI 助手` → 入口不渲染；`NumberFlow` → 静态数字。
- 禁用第三方 CDN 运行时依赖（字体、图标、图表库全部本地化；LLM/邮件为**服务端出站请求**，不引入第三方前端运行时）。
- 所有外链 `rel="noopener noreferrer"`（用户内容区还需 `nofollow ugc`）。

---

## 9. 接口规范（API Routes）

> v1 仅保留必要服务端接口；评论/留言走 Giscus（无自建 API）。

| 方法 | 路径 | 说明 | 请求 | 响应 |
| --- | --- | --- | --- | --- |
| POST | `/api/contact` | 联系表单转发邮件 | `{ name, email, subject, body, hp?, ts }` | `201 { ok: true }` / `429` 限流 |
| POST | `/api/ai/chat` | **AI 助手问答（可选、流式）** | `{ messages, scope, targetKey? }` | SSE 流（仅 FR-701 启用时存在） |

**统一约定**

- 写接口：Zod 校验 → 速率限制 → 转发/调用；不落库。
- AI 接口：仅当 `config/ai.config.ts.enabled=true` 且配置了 Key 时可用；否则路由不存在，前端入口隐藏。检索层强制过滤 `draft/未来日期`。
- 状态码：`400` 参数错误、`404` 不存在、`429` 限流、`500` 异常。
- 错误响应：`{ error: { code, message } }`，`message` 面向用户可直接展示。
- 含个人数据的接口一律 `no-store`。

---

## 10. 安全与隐私

### 10.1 输入与输出安全
- 联系表单经 Zod 校验长度/格式后再转发；不持久化任何提交内容。
- 文章/作品内容中的用户生成内容（Giscus 侧）由 GitHub 平台负责审核与防护。

### 10.2 反滥用
- 联系接口：蜜罐字段（CSS 隐藏）+ 时间戳校验（< 2s 视为机器人）+ IP 速率限制（联系 2 次/300s）。
- Giscus 自身具备 GitHub 账号门槛与平台级反垃圾。

### 10.3 数据与隐私
- v1 **不存储任何访客个人数据**于自建系统；评论存于 GitHub（受 GitHub 隐私政策约束），联系表单仅转发至作者邮箱。
- **Agent 隐私（若启用 FR-701）**：RAG 仅索引**已发布**内容；草稿/待发布绝不入索引；AI 对话默认不持久化。
- 不加载任何未声明的第三方脚本；LLM/邮件为服务端出站请求，不入前端 bundle。
- 提供 `/privacy` 页面说明数据收集范围（P1）。
- `.env*` 均在 `.gitignore` 中。

### 10.4 管理台安全（仅当启用在线编辑器 P2）
- `/admin` 与 `/api/admin/*`（如启用）须持有效 token（`httpOnly` + `Secure` + `SameSite=Lax` Cookie），校验在 **middleware** 中完成。
- 未设置 `ADMIN_TOKEN` 时，管理路由返回 404 且不出现在 sitemap。
- 登录失败限流：5 次/15 分钟/IP。

### 10.5 其他
- 全站启用 CSP：`default-src 'self'`；`img-src 'self' data:`；`script-src 'self'`（开发模式允许 `'unsafe-eval'`）。
- 依赖管理：启用 Dependabot / Renovate；CI 执行 `pnpm audit --audit-level=high`。

---

## 11. 验收标准（Definition of Done）

### 11.1 单条任务的 DoD
- [ ] 对应 FR / NFR 的全部 AC 逐条通过（PR 描述中勾选）
- [ ] TypeScript 无 error、ESLint 无 error、Prettier 已格式化
- [ ] 新增/修改的纯函数有单元测试
- [ ] 在 light 与 dark 两种主题下人工验证无视觉破损
- [ ] 移动端（375px）与桌面（1440px）两种宽度人工验证
- [ ] 键盘可完整操作，axe-core 无 serious+/critical 问题
- [ ] `pnpm build` 通过且体积未超预算

### 11.2 里程碑验收（发布门槛）

**M2 内容系统完成**
- [ ] 5 篇示例文章（覆盖全部扩展语法）全部正确渲染
- [ ] 分类、标签、分页、TOC、代码高亮全部可用
- [ ] 内容校验可捕获 6 类典型错误并清晰报错

**M3 作品集完成**
- [ ] 3 个示例作品，三种视图切换与筛选正确
- [ ] 图集灯箱键盘可用，焦点锁定正确
- [ ] JSON-LD 通过富媒体测试

**M4 搜索完成**
- [ ] 中文 2 字查询命中正确，响应 ≤ 150ms
- [ ] `Ctrl+K` 命令面板在任意页面可唤起、键盘可完整操作

**M5 交流模块完成（轻量）**
- [ ] Giscus 评论接入，明暗主题同步、被回复可通知
- [ ] 联系表单提交成功并收到邮件，限流生效
- [ ] 留言板（如启用）可用

**M1/M6 主题与编辑器完成**
- [ ] 6 套预设主题切换无闪烁，全部满足 AA 对比度
- [ ] 主题编辑器调整 → 保存 → 刷新 → 保持；导出 → 导入 → 一致
- [ ] 布局配置文件中增删改区块，页面正确响应
- [ ] 本地写作工作流（`pnpm new:post`）可用、格式与手写一致

**M7 质量收尾**
- [ ] Lighthouse 四项达标（95/95/95/100）
- [ ] axe-core 严重问题为 0
- [ ] 无 JS 环境下正文可读（降级边界符合 §8.4）

**M9 Agent（可选补充）**
- [ ] （若启用）AI 助手问答附可点击来源，首字 ≤ 1.5s，默认隐藏、未配置 Key 不渲染
- [ ] AI 对话不泄露草稿内容

---

## 12. 里程碑与任务拆解

| 里程碑 | 目标 | 主要任务 | 对应 FR |
| --- | --- | --- | --- |
| **M0** | 规范确认 | 本文档评审与定稿；确认 §13 开放问题 | — |
| **M1 骨架与主题系统** | 可换肤的空壳 | 初始化 Next.js + TS + Tailwind v4 + pnpm；令牌体系；next-themes；6 套预设；主题编辑器（懒挂载）；布局区块框架；Header/Footer/命令面板 | FR-401/402/403/404/406 |
| **M2 内容系统** | 能读文章 | 内容解析管线 + Zod 校验；文章列表/详情；分类/标签；TOC；Shiki 高亮；扩展语法；RSS/Sitemap；本地写作工作流 | FR-101/102/103/105/106/107/501/502/601 |
| **M3 作品集** | 能展示作品 | 作品 schema、三视图列表、筛选、详情页、图集灯箱、JSON-LD、hover 预览 | FR-201~204 |
| **M4 搜索** | 能检索 | 索引生成脚本；中文分词；检索逻辑；搜索页；命令面板 | FR-104 |
| **M5 交流（轻量）** | 能互动（低运维） | Giscus 接入（评论/留言）；联系表单（邮件 API）+ 限流；隐私页 | FR-301/302/303 |
| **M6 质量收尾** | 达标上线 | 性能优化（预算校验）；axe 扫描修复；Lighthouse CI；E2E；移动端打磨 | FR-602/603 |
| **M7 管理台（可选 P2）** | 能在线写 | 口令保护 + middleware；Markdown 编辑器（本地/GitHub API 落盘） | FR-503/504 |
| **M9 Agent（可选）** | 补充能力 | embedding 生成管线（可选）；RAG 问答 API 与悬浮 UI（默认关） | FR-701 |
| **M8 部署与文档** | 可交付 | Vercel 部署；环境变量文档；内容迁移指南；Giscus 配置指南 | FR-604 |

> 建议顺序：M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7(初版) → M8 → M9(可选)。
> M1 先行，因为主题与区块系统是后续所有页面的地基。

---

## 13. 风险与开放问题

### 13.1 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 主题令牌设计不合理，后期改不动 | 高 | M1 阶段先用 3 个真实页面验证令牌覆盖面，再固化 |
| 中文搜索效果不达预期 | 中 | bigram + 标题加权；效果不佳时切换 Pagefind |
| Giscus 依赖 GitHub / 评论 UI 可定制性有限 | 中 | 接受其主题适配能力；若后续要求完全自定义，回退自建（§13 Q3） |
| 联系表单依赖外部邮件服务 | 低 | 选用稳定服务（Resend），失败有友好提示 |
| 过度自定义导致视觉不一致 | 低 | 主题编辑器仅暴露受控参数，派生色由算法保证对比度 |
| **Agent 幻觉/隐私泄露（若启用）** | 中 | RAG 强制附来源 + 检索层过滤草稿；对话不持久化；默认关闭 |

### 13.2 开放问题（请逐条确认或给出你的选择）

| # | 问题 | 选项 | 我的建议 |
| --- | --- | --- | --- |
| **Q0** | 前端框架是否采用 Next.js 15？ | A. Next.js 15（推荐） B. Astro 5 C. 其他 | **A**：Vercel 零运维部署，生态成熟 |
| **Q1** | 部署方式？ | A. Vercel（推荐，零运维） B. 自托管 Docker | **A**：最符合"降低个人运维" |
| **Q3** | 评论方案？ | A. 自建 SQLite B. **Giscus（推荐）** C. Waline | **B**：零后端零数据库，GitHub 通知原生 |
| **Q4** | 是否需要中英双语？ | A. 仅中文，预留结构（推荐） B. v1 就做双语 | **A** |
| **Q5** | 是否需要多作者 / 完整登录体系？ | A. 单作者 + 口令（推荐） B. 多用户 + 权限 | **A** |
| **Q6** | 是否需要访问统计 / 浏览量公开？ | A. 不要（推荐，v1） B. 仅自己可见 C. 公开显示 | **A**：v1 用 Vercel Analytics 即可，不公开量化 |
| **Q7** | 有无必须复用的现有域名、图床、评论数据需迁移？ | 如有请说明 | — |
| **Q8** | **Agent LLM 供应商？** | A. OpenAI 兼容（DeepSeek/GLM）B. 本地 Ollama C. 暂不接入 | **建议 A 或 C**：可插拔；默认关；若选 C 则 FR-701 不实现 |
| **Q9** | **在线编辑器是否纳入 v1？** | A. 纳入（P2，经 GitHub API 落盘）B. v1 不做，仅本地工作流（推荐） | **B**：进一步降低运维与复杂度，本地 Git 工作流已足够 |
| **Q10** | **AI 助手（FR-701）默认是否开放？** | A. 默认关闭，需手动开启（推荐）B. 默认开放 | **A**：仅是补充点，默认关、按需开 |
| **Q11** | 联系表单邮件服务？ | A. Resend（推荐）B. 自建 SMTP C. 第三方表单服务 | **A**：托管、稳定、零运维 |

---

## 14. 附：确认后我将立即执行的第一步

SDD 确认后，按 M1 依次产出：

1. `package.json` / `tsconfig` / `next.config.ts` / `tailwind` 配置与 `pnpm install`；
2. `styles/globals.css`：**完整设计令牌定义** + 6 套预设主题；
3. `components/ui/*`：shadcn 基础组件本地化；
4. `config/layout.config.ts` + `components/blocks/*`：区块渲染框架；
5. `components/theme/ThemePanel`：运行时主题编辑器（懒挂载）；
6. `lib/ai/*` 与 `config/ai.config.ts` 骨架（M9 前仅占位，不影响 M1–M6）。

在此之前不会写任何业务代码。

---

## 15. Agent 能力融合方案（仅 FR-701，可选补充、默认关闭）

> 设计目标：在"低运维、核心为文章分享"的约束下，仅以**单一可选能力**（AI 助手问答）作为阅读体验的补充。其余 Agent 能力（摘要/推荐/写作/审核）**不在 v1 范围**，避免增加运维与复杂度。

### 15.1 架构（可选、服务端无状态）

```
读者提问 ──► /api/ai/chat (SSE)
                │
                ├─ 1. 检索层：按 scope 过滤已发布内容 → 向量检索(embedding, 构建期生成) + 关键词召回 Top-K
                ├─ 2. 重排：相关度排序，截取片段
                ├─ 3. 生成层：LLM 基于片段生成答案，强制"只依据检索内容、附来源"
                └─ 4. 返回：流式 delta + 终帧 sources[{title, url, anchor}]
```

- **Embedding 生成（构建期，可选）**：`scripts/gen-embeddings.ts` 遍历已发布文章 → 调用 embedding 模型 → 写入 `data/embeddings.json`（gitignore）。检索在服务端内存完成，运行期零外部请求。
- **隐私闸门**：检索层强制 `draft=false` 且 `date<=now`；对话不持久化。
- **降级**：未配置 LLM/embedding → 入口不渲染、不请求。

### 15.2 功能规范

#### FR-701 AI 助手（RAG 问答，P2，默认关闭）
- 右下角悬浮入口（区块 `aiAssistant`，默认 `enabled:false`），唤起为对话框；支持**当前文章上下文**与**全站**两种 scope。
- 后端 RAG：混合检索 → 重排 → LLM 生成，答案**强制附可点击来源**（文章链接 + 锚点）。
- 流式输出（SSE），首字 ≤ 1.5s（轻量/本地模型）。
- **AC-701.1**：每个回答附 ≥1 条来源链接，点击跳转到对应文章/锚点。
- **AC-701.2**：未配置 LLM Key 或未启用时，入口隐藏且不发任何请求。
- **AC-701.3**：提问含草稿关键词时，答案不引用任何草稿/未发布内容。
- **AC-701.4**：对话不持久化；刷新后历史清空。

### 15.3 技术约束
- LLM / Embedding **可插拔**（OpenAI 兼容 / DeepSeek / GLM / 本地 Ollama），Key 来自环境变量，**绝不进前端 bundle**。
- 所有 AI 接口 `no-store`；检索层强制草稿过滤；对话不持久化。
- 性能：embedding 构建期离线；问答首字 ≤ 1.5s；未配置时零成本、零请求。
- **若 Q8 选 C（不接入 LLM），FR-701 整体不实现**，不影响其他模块。

---

## 16. 联网调研与竞品/设计参考分析

> 本节汇总联网调研结论，作为 UI 与功能设计的依据；对应灵感已映射到具体 FR。

### 16.1 设计动效参考：NumberFlow（https://number-flow.barvian.me/）
- **亮点**：数字变更时的平滑数位过渡（分层时序）、`tabular-nums` 防位移、`respectMotionPreference` 自动降级、`NumberFlowGroup` 多数字同步。
- **可借鉴**：统计数字用数位滚动替代生硬文本替换。
- → 映射：**组件 `NumberFlow`**（§7.5、§7.7）。

### 16.2 列表动效参考：ReactBits Animated List（https://reactbits.dev/components/animated-list）
- **亮点**：列表项 stagger 错峰入场、滚动触发、可定制缓动。
- **可借鉴**：最新文章、评论流、搜索结果、作品卡片的入场动画。
- → 映射：**§7.7 列表/卡片入场**。

### 16.3 作品集视觉参考：Radiant Shaders Gallery（https://radiant-shaders.com/gallery/all）
- **亮点**：暗调发光美学；卡片 **hover 实时预览**；**编号 + 技术标签 + 灵感来源**；`Explore →` 与 `Deep dive →` 分级 CTA；多维筛选；收藏态。
- **可借鉴**：作品网格 hover 预览、序号系列感、分级 CTA、多维筛选、轻量收藏。
- → 映射：**FR-202（hover 预览 / 分级 CTA / 多维筛选 / 收藏态）**。

### 16.4 极简微交互参考：amicro（https://amicro.vercel.app/，抓取超时，按风格归类）
- **亮点**：极简留白、微交互克制、内容优先。
- **可借鉴**：首页 Hero 与正文的留白节奏。
- → 映射：**§7.1 内容优先 / §7.4 栅格**。

### 16.5 2025 个人 Blog / 设计趋势（综合 web 调研）
- **共性高浏览量特征**：极速 LCP、移动优先、暗色友好、强排版、清晰导航、可分享/可订阅、评论互动。
- **2025 趋势**：AI 驱动 UX、3D/WebGL 视觉、极简主义、滚动驱动动画、粗体排版、语义化结构（利于 SEO 与 LLM 检索）。
- **对本案的启示**：性能预算对齐"极速 LCP"；暗色 + 高对比；结构化内容既利 SEO 也利 **RAG 检索（FR-701）**；Agent 仅作补充。

### 16.6 Agent / AI Blog 能力调研
- **RAG 博客助手已成范式**：基于站点内容向量的检索增强问答可让读者"就文章提问"，降低长文阅读门槛。
- **隐私与可控性**是个人站点的红线：本地/可插拔模型 + 草稿过滤 + 对话不持久化。
- **本案取舍**：Agent 仅保留 FR-701 单一能力、默认关闭，符合"降低运维 + 核心是文章分享 + Agent 仅补充"的定位。
- → 映射：**§15 FR-701**。

---

## 17. 附：确认后产出物清单（派生文档）

确认后按 M 节奏派生（不在 M0 前创建）：
- `docs/ARCHITECTURE.md` — 架构与目录约定细则
- `docs/CONTENT-SCHEMA.md` — frontmatter / categories / tags 完整 schema
- `docs/THEME-SPEC.md` — 令牌全集与派生算法
- `docs/API.md` — 接口字段级契约（仅 `/api/contact` 与可选 `/api/ai/chat`）
- `docs/CONTEXT.md` — 术语表（与 §2 同步）
- `docs/adrs/` — 关键决策记录（如 ADR-0001 低运维架构：Vercel+Giscus+邮件 API、ADR-0002 Agent 仅 FR-701 且默认关）
