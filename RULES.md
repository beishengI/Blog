# 项目规则（RULES）

本文件约定 MedAI Blog + LLM Wiki 知识库的**内容维护规则**与**工程约定**。新增文档、改主题、加页面前请先读此处。

## 一、知识库内容规则（继承 LLM_Wiki_INDEX 的维护约定）

1. **单一真相来源**：每篇知识以独立 `.md` 存放于 `src/content/wiki/`，不复制彼此内容，只通过站内链接交叉引用。冲突时以一手来源（官方文档 / 论文）为准。
2. **登记即生效**：新增文档必须两步同步完成，缺一不可：
   - 把 `xxx_Wiki.md` 放进 `src/content/wiki/`；
   - 在 `src/content/wiki/index.ts` 的 `wikiDocs` 中登记 `{ slug, title, layer, description }`（`slug` 必须等于文件名去掉 `.md`）。
3. **分组归属**：`layer` 取四选一——`理论层` / `选型与工具层` / `流程方法论层` / `规范与能力封装层`。新增领域前先确认归入哪一层。
4. **互链规范**：文档内引用其他知识一律用相对 `.md` 链接（如 `[上下文工程](Context_Engineering_Wiki.md)`），构建期会被自动改写为 `/wiki/<slug>`。不要写死绝对 URL 或 `#anchor`（锚点由渲染器按标题自动生成）。
5. **数据时效**：文档中出现的版本号、星标、性能数据等，请标注调研时间点（沿用原库的 `资料截至 2026-08` 约定）。
6. **索引同步**：`LLM_Wiki_INDEX.md` 是总索引；任何文档增删或归属变更，同步更新其「文档地图 / 主题图谱 / 里程碑」。

## 二、博客文章规则

- 文章以 `Post` 对象形式追加于 `src/data/posts.ts`，`content` 为 Markdown 字符串；封面为空时由主题色自动生成渐变封面。
- 不要为了样式在 `content` 里塞 HTML 裸标签；需富样式请走组件层。

## 三、工程与主题约定

1. **视觉不写死**：任何组件只允许使用语义工具类（`bg-bg` / `text-muted` / `text-primary` / `rounded-brand` / `font-heading` …），禁止硬编码颜色/圆角/字号。所有视觉令牌来自 `ConfigContext` → CSS 变量。
2. **新增首页布局**：在 `src/layouts/` 新建组件，并在 `src/layouts/registry.ts` 完成两处注册（组件映射、`DIRECTION_LABELS` 中文名 + `LAYOUT_MIN_WIDTH`）。`Home.tsx` 与 `App.tsx` 无需改动。
3. **新增路由/页面**：在 `src/pages/` 建组件，于 `src/App.tsx` 注册路由；如需常驻导航，在 `src/config/default.config.ts` 的 `nav` 追加（预设可能覆盖 `nav`，注意 `presets.ts` 的 `nav` 字段）。
4. **内容渲染链路**：Markdown → `src/utils/markdown.ts`（`marked` + `DOMPurify`）→ 带 `article-content` 类的容器。新增渲染能力改这里，不要各自实现。
5. **不破坏构建**：提交前跑 `npm run build` 确保 `tsc -b` 通过。
6. **不提交**：`node_modules/`、`dist/`、`dev.log`、`dev.err`、`.codebuddy/` 已在 `.gitignore` 忽略。

## 四、Git 提交约定

- 提交信息用中文或英文均可，但需说明「做了什么 + 为什么」。
- 知识库文档修订与代码改动可分开提交，便于 review。
- 推送到 `origin` 前确保本地 `build` 通过；禁止 `--force` 推送。
