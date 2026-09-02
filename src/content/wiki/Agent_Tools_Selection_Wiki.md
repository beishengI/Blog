# LLM Wiki — Agent 工具生态与选型

> 面向 LLM Agent 的**Agent 工具生态与选型**系统性知识库:主流编码 Agent 与个人 Agent 平台的定位、能力、记忆机制、自动化水平对比,多工具协作分工模式,以及"什么场景选什么工具"的决策框架。
>
> 定位:本文档是"Agent 上下文知识体系"的**选型实践层**——[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) 讲 Agent 怎么构成,本文档讲该用哪个工具、如何配合。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:官方文档、GitHub 仓库(GitHub API 实时 star)、社区深度评测、微信文章实战经验

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [生态全景:两类 Agent](#2-生态全景两类-agent)
3. [工具清单与定位](#3-工具清单与定位)
4. [核心能力对比](#4-核心能力对比)
5. [多工具协作分工](#5-多工具协作分工)
6. [选型决策框架](#6-选型决策框架)
7. [安装与环境准备](#7-安装与环境准备)
8. [为 Agent 生成的可执行框架](#8-为-agent-生成的可执行框架)
9. [生态与资源](#9-生态与资源)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

市面上的"Agent"千差万别——有的是围绕代码仓库的执行型队友,有的是长期在线、跨平台的个人 AI 操作系统。选错工具,投入的时间和期望都会错位。本文档帮助读者在 10 个主流工具间做出正确取舍,并掌握多工具协作分工模式。

### 1.2 最重要的一个区分

```text
Claude Code / Codex / Cursor:以"项目"为中心,把具体工程活干漂亮
Hermes / OpenClaw:          以"人和渠道"为中心,把长期 Agent 体系养起来
```

它们不是替代关系,而是**两层架构**:执行层 + 常驻层。

### 1.3 数据说明

- star 数为 2026-08 GitHub API 实时值,标注"约"
- 工具能力随版本快速演进,选型前请核对官方文档
- 闭源工具(如 Cursor/TRAE)无 star 可考,以官方与评测为准

---

## 2. 生态全景:两类 Agent

| 类型 | 代表 | 核心定位 | 适合 |
|---|---|---|---|
| **编码执行型** | Claude Code、Codex CLI、Cursor、Windsurf、Gemini CLI、Kimi CLI、TRAE | 围绕代码仓库完成任务:读文件、改代码、跑测试、提 PR | 具体工程任务 |
| **个人常驻型** | Hermes、OpenClaw | 长期在线、跨平台、可自进化:消息入口、定时任务、技能沉淀 | 个人数字分身、自动化管家 |

> 一句话:前者解决"今天把一个仓库搞定",后者解决"你这个人长期被 AI 照料"。

---

## 3. 工具清单与定位

| 工具 | 开发者 | 定位 | GitHub star(约,2026-08) |
|---|---|---|---|
| **Claude Code** | Anthropic | 终端 agentic 编码工具,深度理解代码库 | 14.0 万 |
| **Codex CLI** | OpenAI | 本地开源终端编码 agent(另 IDE 插件与云端 Codex Web) | 10.3 万 |
| **Hermes** | Nous Research | "唯一内置学习循环"的自进化 agent,跨平台常驻 | 22.7 万 |
| **OpenClaw** | OpenClaw | 本地优先的多渠道个人 AI 助理 | 38.6 万 |
| **Cursor** | Cursor | AI 原生 IDE(闭源),Agent 为默认模式 | 闭源无 star |
| **LangGraph** | LangChain | 构建有状态 agent 的低层编排框架 | 3.9 万 |
| **Gemini CLI** | Google | 开源终端 agent,个人账号免费额度大 | 10.3 万 |
| **Windsurf** | Codeium | AI 原生 IDE(闭源),Cascade Flow | 闭源无 star |
| **Copilot CLI** | GitHub | Copilot 的终端编码 agent | 1.1 万 |
| **Kimi CLI** | MoonshotAI | 国产终端编码助手,轻量、毫秒级启动 | 约 0.6 万 |
| **TRAE** | 字节跳动 | 国产 AI 原生 IDE(闭源),免费、中文友好 | 闭源无 star |

---

## 4. 核心能力对比

### 4.1 六大维度对比

| 维度 | Claude Code | Codex CLI | Hermes | OpenClaw | Cursor | LangGraph |
|---|---|---|---|---|---|---|
| **定位** | 代码仓库执行 | 代码仓库执行 | 长期在线个人 Agent | 多渠道个人 Agent | IDE 集成 | 自有 agent 开发框架 |
| **记忆机制** | CLAUDE.md + Auto Memory | AGENTS.md + ~/.codex 配置 | 自主记忆 + FTS5 会话搜索 + Honcho 用户建模 | 会话/agent 独立上下文 | .cursorrules/rules | 显式 state + checkpoint |
| **Skill 支持** | 支持(Agent Skills) | 支持(MCP/自定义命令) | **核心卖点**:skill 从经验自生成、自进化 | Skills + Plugins(ClawHub) | 有限 | 代码级自定义 |
| **自动化能力** | Hooks(确定性事件触发) | 脚本化 headless 模式 | **cron 定时 + 子代理并行 + RPC 工具** | cron、多 agent 路由 | Background Agent(云端) | 最强(可编程编排) |
| **适用场景** | 主力编码/重构/调试 | 并行任务、GPT 生态、性价比 | 常驻自进化助手、研究型工作流 | IM 常驻、日常助手 | 交互式 IDE 开发 | 生产级 agent 产品 |
| **学习曲线** | 中 | 中 | 中高 | 中高 | 低 | 高 |

### 4.2 记忆机制详解(关键差异)

| 工具 | 记忆机制 | 一句话 |
|---|---|---|
| Claude Code | CLAUDE.md(指令文件,自动加载)+ Auto Memory(自动笔记,MEMORY.md 只加载前 200 行)+ 子目录按需加载 | **文件即记忆**,人机共读 |
| Codex | AGENTS.md 开放标准 + 共享记忆/上下文压缩 | 与生态互操作性强 |
| Hermes | agent 自主记忆 + 会话搜索 + Honcho 用户建模 | 学你的偏好 |
| OpenClaw | 会话/agent 独立上下文 | 渠道级隔离 |
| LangGraph | 显式 state + checkpoint(checkpoint-postgres 持久化) | 开发者可控 |

### 4.3 关于 "Codex Goals 持久目标机制" 的说明

- 微信文章《AI Agent 工具介绍与实践》描述了 Codex 的 **Goals 机制**:持久目标 + 预算内自主检查进度
- 但 2026-08 调研中,OpenAI 官方文档/权威资料**未直接确认该命名**(官方明确能力为 AGENTS.md、共享记忆/上下文压缩)
- 结论:该机制是否名为 "Goals" 待官方核实;"持久目标式任务"这一能力确实存在于多家常驻 agent(如 Hermes 的 /goal 命令)

---

## 5. 多工具协作分工

### 5.1 社区主流分工模式

| 环节 | 工具 | 理由 |
|---|---|---|
| **思考/架构** | Claude(或 Claude Code) | 审问想法、写文档、规划架构、产品决策 |
| **构建/实现** | Cursor / Claude Code | 按计划实施功能、生成组件、连接前后端 |
| **调试/完成** | Codex | 找 bug、审查代码、运行测试直到通过 |
| **精确复刻** | Kimi K2.5 | 截图/设计稿转代码,像素级匹配 |
| **常驻调度** | Hermes / OpenClaw | 消息入口接收任务、cron 定时执行、派生子代理 |

### 5.2 分层架构(推荐)

```text
常驻大脑层(Hermes/OpenClaw,云端或本机)
  ├─ 消息渠道(Telegram/Discord/微信/QQ)接收任务
  ├─ cron 定时任务
  └─ 派生子代理执行
        ↓
编码执行层(Claude Code / Codex / Cursor)
  └─ 具体仓库内干活:读写文件、跑测试、提 PR
```

> Hermes 已内置 acp_adapter 可直接调度 Codex 等外部编码 agent——"常驻大脑调度、编码 agent 执行"已成为主流架构。

### 5.3 关键认知

> **掌握工具不难,知道在什么时候用哪个工具才是核心竞争力。**

- 主力构建:社区普遍认为 Claude Code 的 agent 编码能力最强(评测总分 43/50 居首)
- 并行/替补:Codex 与 Claude Code "混用互补、一个不行换另一个"
- 不要贪多:工具链越短越好,先用熟一个主力,再按需补充

---

## 6. 选型决策框架

### 6.1 场景 → 工具

| 场景 | 首选 | 备选 |
|---|---|---|
| 单次深度编码(改代码库/重构/调试) | Claude Code | Codex CLI |
| 交互式 IDE 开发体验 | Cursor(国际)/ TRAE(国内) | Windsurf |
| 长期在线个人 Agent(消息入口 + 定时任务) | OpenClaw(渠道广) | Hermes(要自进化选它) |
| 研究/长周期自主学习 | Hermes(learning loop) | — |
| 预算敏感/免费 | Gemini CLI(免费额度大) | TRAE(永久免费)、Kimi CLI |
| 构建自有 agent 应用/生产编排 | LangGraph + LangSmith | — |
| 中国大陆网络环境 | TRAE、Kimi CLI、Codex | Claude Code 需代理/中转 |

### 6.2 决策树

```text
你要构建什么?
├─ 个人工具链(用现成产品)
│    ├─ 目标 = 搞定具体仓库 → Claude Code / Codex / Cursor
│    └─ 目标 = 长期照料你(消息/定时/技能) → Hermes / OpenClaw
├─ 产品/应用(开发自己的 agent)
│    └─ 需要状态编排与持久化 → LangGraph
└─ 团队工程化
     └─ 需要治理/审计 → Claude Code + hooks / 自建 harness
```

### 6.3 避坑提示

- **star 数不等于适合你**:OpenClaw/Hermes 的 star 体量异常大,建议结合 star-history 趋势交叉验证
- **营销命名 ≠ 官方能力**:如 "Goals" 机制,选型前以官方文档为准
- **国内网络**:Claude Code/OpenAI 系需代理;国产工具(TRAE/Kimi/GLM)可完全规避直连海外 API

---

## 7. 安装与环境准备

### 7.1 共同前提

1. 终端环境:Windows 建议 PowerShell + Git for Windows,或直接 WSL2(更稳)
2. 网络环境:国内拉包常见问题是 npm 源、GitHub、认证页不稳定
3. 建议提前:`npm config set registry https://registry.npmmirror.com`

### 7.2 安装命令速查

```powershell
# Claude Code(Windows PowerShell)
irm https://claude.ai/install.ps1 | iex

# Codex(Windows PowerShell)
npm install -g @openai/codex --force --no-os-check

# Hermes / OpenClaw
# 均原生支持 Windows(自动装 uv/Python/Node/ripgrep/ffmpeg,无需管理员)
```

### 7.3 常见坑

| 坑 | 解决 |
|---|---|
| 防病毒误报(Hermes 捆绑 uv.exe) | 按官方指引白名单目录(如 `%LOCALAPPDATA%\hermes\bin`) |
| GitHub Releases 下载慢 | 镜像/代理;Codex 可设 `CODEX_INSTALLER_USE_RELEASES_OPENAI_COM=false` 回退 GitHub |
| 认证链路不稳定 | 提前在同一台机器走完登录流程;现场演示前务必预演 |
| 模型接入 | Hermes/OpenClaw 支持自定义端点(OpenRouter/Kimi/GLM/DeepSeek),国内可完全规避海外 API |
| 安全 | OpenClaw 文档明确"入站消息视为不可信输入",多用户场景务必开 sandbox |

> **实战建议**:先跑 `doctor` / `--version` 确认工具健康,再开始折腾 skill、MCP、hooks。安装只是五分钟,环境稳定性决定你后面五十小时的体验。

---

## 8. 为 Agent 生成的可执行框架

### 8.1 工具选型自查清单

```markdown
## 工具选型自查
□ 我的目标是以"项目"为中心还是以"人和渠道"为中心?
□ 我是个人使用还是构建产品?(后者 → 选开发框架而非终端工具)
□ 是否需要长期记忆/自进化?(是 → 考虑 Hermes)
□ 是否需要多消息渠道入口?(是 → 考虑 OpenClaw)
□ 网络环境是否允许直连海外服务?(否 → 国产工具优先)
□ 是否需要可审计的确定性自动化?(是 → Claude Code hooks 或自建 harness)
```

### 8.2 多工具协作配置模板

```markdown
## 团队工具分工(写入团队规范)
- 需求审问与设计文档 → Claude(思考层)
- 前端/后端实现 → Claude Code(构建层)
- 长链路 debug 与验证 → Codex(调试层)
- 截图/设计稿转代码 → Kimi K2.5(复刻层)
- 常驻消息入口 + 定时任务 → Hermes/OpenClaw(常驻层)
- 各层之间用 Git 仓库作为唯一协作现场,worktree 隔离
```

### 8.3 供 Agent 生成选型方案(元规则)

1. **先分类型再选型**:先判定"编码执行型 vs 个人常驻型 vs 开发框架"
2. **以官方文档为真相来源**:营销命名、社区吹捧一律回到官方能力清单核实
3. **工具链最短原则**:一个主力工具 + 按需补充,不搞全家桶
4. **环境先行**:先验证网络、认证、安装,再谈能力
5. **留出协作接口**:多工具协作时,用 Git 仓库 / MCP / AGENTS.md 作为统一契约

---

## 9. 生态与资源

### 官方文档
- [Claude Code](https://code.claude.com/docs/en/overview)
- [Codex 开发者文档](https://developers.openai.com/codex)
- [Hermes Docs](https://hermes-agent.nousresearch.com/docs/)
- [OpenClaw Docs](https://docs.openclaw.ai/)
- [Gemini CLI Docs](https://geminicli.com/docs/)
- [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview)
- [Cursor Docs](https://docs.cursor.com/)
- [TRAE](https://www.trae.ai/)

### GitHub 仓库
- [anthropics/claude-code](https://github.com/anthropics/claude-code)
- [openai/codex](https://github.com/openai/codex)
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- [openclaw/openclaw](https://github.com/openclaw/openclaw)
- [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
- [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)

### 社区评测(2026)
- [2026 年 AI 编程工具深度横评](http://m.toutiao.com/group/7621034669505348130/)
- [端侧 Agent 四国杀:Claude Code、Codex、Hermes、OpenClaw](https://blog.csdn.net/Marvin_Wind/article/details/162203064)
- [Cursor「走向自动驾驶代码库」工程报告解读](http://m.toutiao.com/group/7638426607920628264/)

---

## 10. 参考来源

- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:安装教程、Hermes/OpenClaw 与 Claude Code/Codex 定位差异、多工具协作方案、五大核心认知
- GitHub 官方仓库(star 与版本为 2026-08 实时抓取,标"约")
- 各工具官方文档(见 §9)
- 社区深度评测与横评(见 §9)

---

*本文档由官方文档、GitHub API 实时数据与社区评测综合而成。star 数与工具能力随版本快速变化,引用时以官方与实时数据为准。注明:Codex "Goals" 机制命名未经官方文档确认,详见 §4.3。*
