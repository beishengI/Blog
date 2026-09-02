const n=`# LLM_Wiki — AI 上下文文件（Context Files）编写指南

> 定位：本 Wiki 汇总"如何为 AI 编码 Agent 编写高质量项目上下文文件（\`AGENTS.md\` / \`CLAUDE.md\` / \`CLAUDE.local.md\`）"的**官方规范、大厂实践与高流量技术文章**，并沉淀为本项目（contract_pre_agent）的落地约定。
>
> 版本：v1.0 ｜ 最后更新：2026-08-03 ｜ 维护者：AI Agent（每次任务结束时同步更新 CODE_WIKI.md）

---

## 目录

1. [核心概念：Context Files 是什么](#1-核心概念)
2. [三类文件的定位与差异](#2-三类文件的定位与差异)
3. [官方规范与权威来源](#3-官方规范与权威来源)
4. [编写范式：六大核心领域](#4-编写范式六大核心领域)
5. [写作原则（官方与大厂提炼）](#5-写作原则)
6. [边界（Boundaries）三级分类](#6-边界三级分类)
7. [各家工具支持对照表](#7-各家工具支持对照表)
8. [大厂实践案例](#8-大厂实践案例)
9. [反模式与常见误区](#9-反模式与常见误区)
10. [推荐模板](#10-推荐模板)
11. [本项目落地约定](#11-本项目落地约定)
12. [参考来源](#12-参考来源)
13. [维护日志](#13-维护日志)

---

## 1. 核心概念

**Context Files（上下文文件 / 记忆文件）**：放在项目根目录（或子目录）的 Markdown 文件，作为 Coding Agent 的"README"——为 AI 编码工具提供仓库概览、工具链指令、编码规范、设计模式与约束边界。

核心事实（摘自官方）：

- **AI 有"失忆症"**：每次新对话，模型从零开始，不知道你的语言/框架/命名规范/测试命令。
- **一次定义、永久复用**：把项目知识"外化"成 AI 可读格式，写一次，每次会话自动生效。
- **它是"岗位培训手册"，不是 README**：README 写给人类看（项目是什么），上下文文件写给 AI 看（怎么构建、怎么测试、什么能做什么不能做）。
- **机制性质**：这些文件是加载进上下文的"指导性文本"，**不是强制配置**——写法影响遵循度，具体、简洁、结构化的指令遵循率最高（Anthropic 官方明确说明）。

---

## 2. 三类文件的定位与差异

| 维度 | \`AGENTS.md\` | \`CLAUDE.md\` | \`CLAUDE.local.md\` |
|---|---|---|---|
| **本质** | 跨工具开放标准格式（"README for agents"） | Claude Code 项目指令文件 | Claude Code 个人本地指令文件 |
| **读者** | 所有支持该标准的 Coding Agent | Claude Code | 仅你自己 |
| **范围** | 项目级（可多级） | 项目级（可多级，含用户级/企业级） | 项目级，仅当前机器/工作区 |
| **是否提交 Git** | 是（团队共享） | 是（团队共享） | **否，加入 \`.gitignore\`** |
| **典型用途** | 构建/测试命令、代码规范、边界 | 项目架构、编码标准、常见工作流 | 个人 sandbox URL、个人测试数据、本地偏好 |
| **加载机制** | 由各工具实现（Codex/Copilot/Gemini 等） | 启动时自动加载，子目录按需加载 | 与 CLAUDE.md 同时加载，且排在其后 |
| **Claude Code 兼容性** | Claude Code 不直接读 AGENTS.md，需在 CLAUDE.md 中 \`@AGENTS.md\` 导入或软链 | 原生支持 | 原生支持 |

> 注：Google Gemini CLI 的对应文件叫 \`GEMINI.md\`；GitHub Copilot 还支持 \`.github/agents/<name>.md\`（带 frontmatter 的"agent 角色"文件）。它们理念一致、命名各异，详见[第 7 节](#7-各家工具支持对照表)。

---

## 3. 官方规范与权威来源

### 3.1 AGENTS.md 开放格式（agents.md）

- **仓库**：[github.com/agentsmd/agents.md](https://github.com/agentsmd/agents.md) ｜ 官网：[agents.md](https://agents.md/)
- **定位**：a simple, open format for guiding coding agents。由 OpenAI、Google、Cognition 等社区协作推动，已被 **Devin、GitHub Copilot、Gemini CLI、Cursor、Codex、Augment Code CLI** 等采用。
- **最小示例**（官方仓库原文）：

\`\`\`markdown
# Sample AGENTS.md file

## Dev environment tips
- Use \`pnpm dlx turbo run where <project_name>\` to jump to a package instead of scanning with \`ls\`.
- Run \`pnpm install --filter <project_name>\` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run \`pnpm turbo run test --filter <project_name>\` to run every check defined for that package.
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run \`pnpm lint\` and \`pnpm test\` before committing.
\`\`\`

要点：**命令先行、精确可执行、含 flags**，几乎全是"怎么做"，没有空话。

### 3.2 Claude Code 官方 Memory 文档（code.claude.com/docs/en/memory）

这是 CLAUDE.md / CLAUDE.local.md 的**权威规范**，核心结论：

**文件层级（按加载顺序，从宽到窄）**：

| 层级 | 位置 | 用途 | 共享对象 |
|---|---|---|---|
| Managed policy | macOS: \`/Library/Application Support/ClaudeCode/CLAUDE.md\`；Linux/WSL: \`/etc/claude-code/CLAUDE.md\`；Windows: \`C:\\Program Files\\ClaudeCode\\CLAUDE.md\` | 组织级指令（IT 管理） | 全员 |
| 用户指令 | \`~/.claude/CLAUDE.md\` | 个人跨项目偏好 | 仅自己 |
| 项目指令 | \`./CLAUDE.md\` 或 \`./.claude/CLAUDE.md\` | 团队共享项目指令 | 团队（进 Git） |
| 本地指令 | \`./CLAUDE.local.md\` | 个人项目偏好 | 仅自己（进 \`.gitignore\`） |

**加载机制**：
- 从工作目录**向上**逐级收集 \`CLAUDE.md\` 与 \`CLAUDE.local.md\`，全部拼接（不覆盖）；顺序为"文件系统根 → 工作目录"，越靠近启动目录的越靠后（越新）；同目录内 \`CLAUDE.local.md\` 排在 \`CLAUDE.md\` 之后。
- 工作目录**向下**的子目录 \`CLAUDE.md\` 不启动加载，**按需加载**（当 Claude 读取该目录文件时）。
- 支持 \`@path/to/import\` 导入其他文件（相对/绝对路径均可，递归最多 4 层；反引号包裹则不被导入）。
- Block 级 HTML 注释（\`<!-- -->\`）注入前会被剥离，可用于给人类维护者留备注而不消耗 token。

**编写建议（原文要点）**：
- 大小：**每个 CLAUDE.md 目标 <200 行**；过长会消耗上下文并降低遵循度。
- 结构：用 Markdown 标题和列表分组，扫描式阅读友好。
- 具体性：可验证的指令（"Use 2-space indentation" 而非 "Format code properly"；"Run \`npm test\` before committing" 而非 "Test your changes"）。
- 一致性：两条矛盾规则会被模型任意选择，需定期清理。
- 什么时候该写：Claude 第二次犯同样的错、Code Review 抓到本应知道的事、你重复输入过同样的纠正——这些都应沉淀进文件。

**AGENTS.md 兼容**：Claude Code 只读 \`CLAUDE.md\` 不读 \`AGENTS.md\`；若仓库已有 AGENTS.md，用以下任一方式避免双份维护：

\`\`\`markdown
<!-- CLAUDE.md 内容 -->
@AGENTS.md

## Claude Code
Use plan mode for changes under \`src/billing/\`.
\`\`\`

或软链（Windows 需管理员/开发者模式，建议用 \`@AGENTS.md\` 导入代替）。

### 3.3 Anthropic 工程博客：Claude Code Best Practices（2025）

- 原文：[anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)（翻译镜像：[腾讯云开发者社区](https://cloud.tencent.com/developer/article/2545665)）
- CLAUDE.md 适合记录：常用 shell 命令、核心文件与工具函数、代码风格指南、测试说明、仓库规范（分支命名、merge vs rebase）、开发环境设置、项目特有警告。
- **CLAUDE.md 是提示词的一部分，要像优化高频提示词一样持续调优**（原文："tune your CLAUDE.md like any high-traffic prompt"）；Anthropic 内部偶尔用提示词优化器，并经常用 "IMPORTANT" / "YOU MUST" 强调关键指令。
- 推荐工作流：探索→规划→编码→提交；TDD（写测试→验证失败→提交测试→编码→提交）；截图比对迭代。
- 指令要具体：官方给出"欠佳指令 vs 具体指令"对照表（如"为 foo.py 添加测试" vs "为 foo.py 编写一个新测试，专门覆盖用户未登录的边缘场景。请勿使用 mock"）。
- 用 \`#\` 快捷键让 Claude 把临时指令自动并入 CLAUDE.md；提交时连同 CLAUDE.md 改动一起，供团队共享。

### 3.4 OpenAI Codex 官方 AGENTS.md 指南

- 文档：[developers.openai.com/codex/guides/agents-md](https://developers.openai.com/codex/guides/agents-md)
- 核心主张：AGENTS.md 最有价值的部分不是"态度"而是**"操作"**——把**构建、测试、代码约定、验证方式和 PR 预期**这类信息写进去。
- 文件路径层级：用户级 \`~/.codex/AGENTS.md\`、\`~/.codex/AGENTS.override.md\`（临时全局覆盖，优先级更高）、项目级 \`<git-root>/AGENTS.md\`、\`<git-root>/AGENTS.override.md\`、子目录级 \`<subdir>/AGENTS.md\`（越靠近当前目录优先级越高）。
- 相关配置：\`project_doc_max_bytes = 32768\`（最大读取字节数）、\`project_doc_fallback_filenames = ["TEAM_GUIDE.md"]\`（备选文件名）。

### 3.5 GitHub Blog：How to write a great agents.md（2500+ 仓库分析）

- 原文：[github.blog/.../how-to-write-a-great-agents-md-lessons-from-over-2500-repositories](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- 作者 Matt Nigh（GitHub Program Manager Director），2025-11 发布。
- 结论：**大多数 agents.md 失败是因为太笼统**。"You are a helpful coding assistant" 没用；"You are a test engineer who writes tests for React components, follows these examples, and never modifies source code" 有用。
- 五大要点：命令放前面（含 flags 和选项）；代码示例优于三段文字描述；设定清晰边界（"Never commit secrets" 是最常见的有效约束）；技术栈要具体（"React 18 with TypeScript, Vite, Tailwind CSS" 而非 "React project"）；覆盖六大核心领域。

### 3.6 Google Gemini CLI

- 对应规则文件 \`GEMINI.md\`：用户级 \`~/.gemini/GEMINI.md\`、项目级 \`<project-root>/GEMINI.md\`、祖先目录逐层搜索、子目录级 \`<subdir>/GEMINI.md\`。
- 支持 \`@file.md\` 导入语法；文件名可通过 \`context.fileName\` 配置项自定义；\`/memory add <text>\` 快速追加全局指令。
- 也支持 Agent Skills 开放标准（实验性，需在 \`.gemini/settings.json\` 开启）。

### 3.7 Agent Skills 开放标准（agentskills.io）

- 规范：[agentskills.io/specification](https://agentskills.io/specification)，由 Anthropic 发起，Claude Code / Codex CLI / Gemini CLI / Cursor / VS Code / Copilot 均已支持。
- 目录结构：\`skill-name/SKILL.md\`（必需）+ \`scripts/\`、\`references/\`、\`assets/\`（可选）。
- **渐进式披露（Progressive Disclosure）**：元数据（约 100 tokens，仅 name+description）→ 指令（建议 <5000 tokens，激活时加载）→ 资源（按需）。这与"上下文文件别写太长"是同一思想——让上下文按需加载。

---

## 4. 编写范式：六大核心领域

GitHub 分析 2500+ 仓库后提炼的**优秀 agents.md 六大核心领域**（覆盖这六项即进入第一梯队）：

### 1. Commands（命令）
告诉 AI 如何构建、测试、运行。**反引号包裹、可直接复制执行、带 flags**：

\`\`\`markdown
## 开发命令
- 安装依赖：\`pnpm install\`
- 开发模式：\`pnpm dev\`
- 构建项目：\`pnpm build\`（TypeScript 编译，输出到 dist/）
- 运行测试：\`pnpm test\`（Jest，提交前必须通过）
- 代码检查：\`pnpm lint --fix\`（自动修复 ESLint 错误）
\`\`\`

### 2. Testing（测试）
测试策略与验收标准：新功能必须配测试、覆盖率目标、单测运行方式、提交前门槛。

### 3. Project Structure（项目结构）
代码该放哪：各目录职责一句话说明，让 AI 定位文件不靠猜。

### 4. Code Style（代码风格）
命名规范 + **好/坏示例对比**（一条真实代码片段胜过三段描述）：

\`\`\`typescript
// ✅ 好：描述性命名、正确处理错误
async function fetchUserById(id: string): Promise<User> { ... }
// ❌ 差：命名模糊、无错误处理
async function get(x) { return await api.get('/users/' + x).data; }
\`\`\`

### 5. Git Workflow（Git 工作流）
分支命名（\`feature/\`、\`fix/\`）、提交信息格式（Conventional Commits）、提交前检查项。

### 6. Boundaries（边界）
**最容易被忽略、也最重要**。见下节。

---

## 5. 写作原则

汇总官方文档 + 大厂实践 + 高流量文章的共识：

| # | 原则 | 说明 / 出处 |
|---|---|---|
| 1 | **命令先行、精确可执行** | 命令放最前面，反引号包裹，含 flags；"Install deps" 不如 \`\` \`pnpm install\` \`\`（GitHub Blog / agents.md 官方示例） |
| 2 | **示例优于抽象描述** | 一个好/坏代码对比 > 三段规范文字（GitHub Blog） |
| 3 | **具体到可验证** | "Use 2-space indentation"、"API handlers live in \`src/api/handlers/\`"（Anthropic Memory 文档） |
| 4 | **保持精简** | 单个 CLAUDE.md <200 行；社区实践"删到 20~30 行反而更听话"（Anthropic 文档 / Boris Cherny） |
| 5 | **单一信息源（Single Source of Truth）** | 不复制 README 内容，用链接引用：\`详细的 API 文档见 docs/api.md\`（GitHub Blog） |
| 6 | **规则一致性** | 矛盾规则会被模型任意选择（Anthropic 文档） |
| 7 | **持续迭代，不一步到位** | 从简单开始，AI 犯错时把对应规则补进去；最好的 agents.md 是"长"出来的（GitHub Blog） |
| 8 | **适度强调** | 对关键指令用 "IMPORTANT" / "YOU MUST"（Anthropic 官方实践） |
| 9 | **按需加载设计** | 大内容拆到 \`.claude/rules/\`（path-scoped）、skills（渐进式披露）或子目录 CLAUDE.md（Anthropic） |
| 10 | **权限边界先行** | "Never commit secrets" 是最常见且最有效的约束（GitHub Blog） |

---

## 6. 边界三级分类

用 Always / Ask first / Never 三级分类，让 AI 知道何时自主、何时停下问你：

\`\`\`markdown
## 边界
- ✅ **Always**：在 \`src/\` 下创建/修改代码；遵循命名规范；提交前运行测试
- ⚠️ **Ask first**：修改配置文件、更改数据库 schema、新增依赖、改动 CI/CD
- 🚫 **Never**：提交密钥或 API Key、修改 .env、编辑 node_modules/vendor 目录、直接推送 main
\`\`\`

出处：GitHub Blog（"Tell AI what it should never touch… Never commit secrets was the most common helpful constraint"）。

---

## 7. 各家工具支持对照表

### 7.1 规则（Rules / 上下文）文件对照

| 智能体 | 文件名 | 用户级路径 | 项目级路径 | 覆盖机制 |
|---|---|---|---|---|
| Claude Code | \`CLAUDE.md\` / \`CLAUDE.local.md\` | \`~/.claude/CLAUDE.md\` | \`<project>/CLAUDE.md\`（或 \`.claude/CLAUDE.md\`） | 全局→项目→子目录逐层拼接；local 排最后 |
| Codex CLI | \`AGENTS.md\` / \`AGENTS.override.md\` | \`~/.codex/AGENTS.md\` | \`<git-root>/AGENTS.md\` | override 优先级更高；子目录越近越优先 |
| Gemini CLI | \`GEMINI.md\` | \`~/.gemini/GEMINI.md\` | \`<project>/GEMINI.md\` | 全局→祖先目录→子目录 |
| GitHub Copilot | \`agents.md\` + \`.github/agents/<name>.md\` | — | 仓库级 | frontmatter 定义 agent 角色（name/description） |

### 7.2 技能（Skills）文件对照

| 智能体 | 路径 | 状态 |
|---|---|---|
| Claude Code | \`~/.claude/skills/<name>/SKILL.md\`、\`.claude/skills/<name>/SKILL.md\`、插件级 | 正式支持 |
| Codex CLI | \`~/.codex/skills/<name>/\`、\`.codex/skills/<name>/\`、\`$REPO_ROOT/.codex/skills/\` | 正式支持（2025-12） |
| Gemini CLI | \`~/.gemini/skills/<name>/\`、\`.gemini/skills/<name>/\` | 实验性 |

> 三者均遵循 Agent Skills 开放标准，技能可跨平台复用：只用标准字段（\`name\`、\`description\`）确保最大兼容。

---

## 8. 大厂实践案例

1. **GitHub（2500+ 仓库实证）**：最好的 agents.md 都具备"具体角色 + 详细操作手册"——可执行命令、具体代码风格示例、明确边界、精确技术栈版本。见 [第 3.5 节](#35-github-blog)。
2. **OpenAI 自用**：主代码库内**包含 88 个 AGENTS.md 文件**（复杂项目的多级/多模块治理）；Codex 官方将其定位为机构级任务定义体系。
3. **Anthropic 内部**：Claude Code 团队在自己的代码库运行 **20~30 个日常维护任务**（找死代码生成清理 PR、删过期实验开关、补测试覆盖）；CLAUDE.md 当作高频提示词持续调优（Boris Cherny 文章转述）。
4. **"删掉 80%" 的反思**：社区高流量文章（Boris Cherny《Deleting 80% of your CLAUDE.md》等）与 Anthropic 官方"<200 行"建议一致——**上下文文件重在"少而准"**，每行都必须有持久价值；30 行以内往往比 80 行更有效。
5. **GitHub Copilot 六个 Agent 角色**：docs-agent / test-agent / lint-agent / api-agent / dev-deploy-agent，每个角色 = 清晰 persona + 命令 + 边界（如 test-agent "永不删除失败的测试"、api-agent "改 schema 前必须询问"）。

---

## 9. 反模式与常见误区

| 反模式 | 后果 | 正确做法 |
|---|---|---|
| 复制 README 内容 | 上下文浪费、信息重复难同步 | 用链接引用 README/docs |
| 写得过长（>200 行 / 数 KB） | 消耗 token、降低遵循度 | 精简；拆到 rules/skills/子目录按需加载 |
| 只写空话（"Be helpful"） | 毫无约束力 | 写可执行命令、可验证规则、具体示例 |
| 只给工具名不给命令 | AI 只能猜 | \`npm test -- -t "名称"\` 这样完整可执行 |
| 两条矛盾规则 | 模型随机选一条 | 定期审查清理 |
| 缺少边界 | 触碰不该改的文件 | 必写 Always / Ask first / Never |
| 一次性写完从不迭代 | 与项目脱节 | 犯错即补规则，持续生长 |
| 个人偏好写进共享文件 | 污染团队上下文 | 个人内容放 \`CLAUDE.local.md\` 并 gitignore |
| 把密钥/路径写进上下文文件 | 泄密风险 | 敏感信息用变量/引用；检查 gitignore |
| 在 Windows 上硬建 AGENTS.md→CLAUDE.md 软链 | 需要管理员权限 | 用 \`@AGENTS.md\` 导入替代 |

---

## 10. 推荐模板

### 10.1 AGENTS.md 通用模板（基于 agents.md 官方 + GitHub 六大领域）

\`\`\`markdown
# AGENTS.md

## 技术栈
- 具体技术 + 版本，如：Vue 3.4 + TypeScript + Vite 5 + Element Plus

## 开发命令
- 安装依赖：\`pnpm install\`
- 启动开发：\`pnpm dev\`
- 构建：\`pnpm build\`（输出到 dist/）
- 类型检查：\`pnpm vue-tsc\`（提交前必须通过）
- 代码检查：\`pnpm lint\`

## 项目结构
- \`src/api/\` — 后端接口封装
- \`src/views/\` — 页面组件
- ...

## 代码风格
- 组件命名：PascalCase；函数：camelCase
- 样式：UnoCSS + SCSS 变量，禁用内联样式
- ✅/❌ 好/坏示例（关键处附代码片段）

## 测试要求
- 新功能必须有对应单测
- 提交前必须 \`pnpm test && pnpm lint\`

## Git 工作流
- 分支：\`feature/xxx\`、\`fix/xxx\`
- 提交信息：Conventional Commits（feat/fix/docs/...）

## 边界
- ✅ Always：在 \`src/\` 下开发、遵循命名规范、提交前跑检查
- ⚠️ Ask first：修改数据库 schema、新增依赖、改 CI/CD
- 🚫 Never：提交密钥、修改 .env、直接推送 main
\`\`\`

### 10.2 CLAUDE.md 模板（Claude Code 专用，含 @import 兼容 AGENTS.md）

\`\`\`markdown
# CLAUDE.md

> 本文件自动加载；子目录/模块级指令请放入对应子目录或 .claude/rules/。

@AGENTS.md

## Claude Code 特定指令
- 涉及 \`src/\` 的改动默认使用 plan mode 先给方案
- 修改数据库表结构前必须询问并列出 SQL 影响面
- 完成改动后运行 \`pnpm vue-tsc\` 验证类型

## 常用命令速查
- 启动后端：\`mvn spring-boot:run\`（profile=local，端口 48080）
- 启动前端：\`pnpm dev\`（端口 3000）
\`\`\`

### 10.3 CLAUDE.local.md 模板（个人本地，进 .gitignore）

\`\`\`markdown
# CLAUDE.local.md（个人本地偏好，勿提交 Git）

## 个人环境
- 本地后端地址：http://127.0.0.1:48080
- 本地前端地址：http://localhost:3000
- 常用测试数据/账号（仅本机使用）
\`\`\`

---

## 11. 本项目落地约定

> 适用范围：\`D:\\contract_pre_agent\` 下的所有后续 AI 辅助开发任务。

### 11.1 文档分工

| 文件 | 定位 | 更新频率 |
|---|---|---|
| \`CODE_WIKI.md\` | 项目事实 Wiki（架构、模块、流程、约定、任务记录） | **每次任务必须更新**（任务记录 + 相关章节） |
| \`LLM_Wiki.md\` | AI 上下文文件编写方法论（本文档） | 有新的权威资料/实践时更新 |
| 项目记忆（TRAE memory project_memory.md） | 跨会话硬约束与约定 | 每次任务结束时同步 |

### 11.2 强制约定（对每一次任务）

1. **任务结束必须更新 \`D:\\contract_pre_agent\\CODE_WIKI.md\`**：
   - 在"WIKI 维护约定与日志"章节追加一条任务记录（日期、任务、改动文件、关键结论）；
   - 若任务涉及架构/模块/接口变化，同步更新对应章节。
2. **编写/修改 AGENTS.md、CLAUDE.md、CLAUDE.local.md 前，先阅读本 Wiki（LLM_Wiki.md）**，遵循六大核心领域、边界三级分类与"<200 行/少而准"原则。
3. **充分利用已有技能与 MCP**：
   - 技能（Skills）：superpowers 系列（brainstorming / writing-plans / TDD / subagent 等）、frontend-design、webapp-testing、kill-ai-slop 等按任务场景调用；
   - MCP：Context7（查官方文档版本化资料）、Chrome DevTools（浏览器调试）等；
   - 需要联网获取最新规范时，优先 WebSearch/WebFetch 官方与权威来源并记录到本文档。
4. **敏感信息**（密钥、API Key、本地账号）只允许进 \`CLAUDE.local.md\` 或环境文件，禁止进共享的 \`AGENTS.md\`/\`CLAUDE.md\`。

### 11.3 后续任务建议动作

- 新仓库/新模块开工：先按第 4 节六大领域生成 \`AGENTS.md\`（或 \`CLAUDE.md\`），并同步 CODE_WIKI.md。
- AI 犯错被纠正 ≥2 次：把该规则补进上下文文件（Anthropic "when to add" 准则）。

---

## 12. 参考来源

### 官方文档（一级来源）
- Anthropic — Claude Code Memory 文档（CLAUDE.md / CLAUDE.local.md / rules / imports / AGENTS.md 兼容）：<https://code.claude.com/docs/en/memory>
- Anthropic — Claude Code Common workflows：<https://code.claude.com/docs/en/common-workflows>
- Anthropic 工程博客 — Claude Code Best Practices：<https://www.anthropic.com/engineering/claude-code-best-practices>
- Anthropic 博客 — How Claude Code works in large codebases：<https://claude.com/blog/how-claude-code-works-in-large-codebases>
- AGENTS.md 开放格式规范仓库：<https://github.com/agentsmd/agents.md> ｜ 官网：<https://agents.md/>
- OpenAI Codex — AGENTS.md 指南：<https://developers.openai.com/codex/guides/agents-md>
- GitHub Blog — How to write a great agents.md: Lessons from over 2,500 repositories：<https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/>
- Agent Skills 开放标准：<https://agentskills.io/> ｜ 规范：<https://agentskills.io/specification>

### 高质量社区文章/解读（二级来源）
- CSDN — 三大编程智能体的 RULES 和 SKILLS 规范（Claude Code / Codex / Gemini 对照）：<https://blog.csdn.net/jarvisuni/article/details/157400641>
- CSDN — GitHub 分析 2500+ 仓库解读：<https://blog.csdn.net/roamingcode/article/details/157208747>
- 腾讯云开发者社区 — Claude Code: Best practices（官方文翻译）：<https://cloud.tencent.com/developer/article/2545665>
- 今日头条 — OpenAI 工程师 10 倍差距 / 机构级 AGENTS.md 体系：<http://m.toutiao.com/group/7645125561244795426/>
- 今日头条 — CLAUDE.md 我删到只剩 20 行：<http://m.toutiao.com/group/7660006639965880884/>
- 今日头条 — Boris Cherny：删掉 80% 的 CLAUDE.md，模型反而更强了：<http://m.toutiao.com/group/7668393741379584564/>
- 今日头条 — OpenAI 谷歌联手推出 AGENTS.md：<http://m.toutiao.com/group/7540717835988582947/>
- CSDN — AGENTS.md 真的对 AI Coding 有用吗（是否用对）：<https://blog.csdn.net/ZuoYueLiang/article/details/158291773>

---

## 13. 维护日志

| 日期 | 版本 | 内容 |
|---|---|---|
| 2026-08-03 | v1.0 | 创建。汇总 Anthropic / OpenAI / GitHub / agents.md / Agent Skills 官方规范与高流量文章，形成六大核心领域、写作原则、边界三级分类、模板与项目落地约定 |
`;export{n as default};
