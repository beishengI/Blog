# LLM Wiki — Vibe Coding 防屎山方法论

> 面向 LLM Agent 的**Vibe Coding 工程化方法论**系统性知识库:Vibe Coding 失败模式分析、文档优先(Document-First)体系、审问系统、Vibe Design、五阶段开发流程,以及 2025-2026 的方法论演进(Spec-Driven Development、Harness Engineering、Agentic Engineering)。
>
> 定位:本文档是"Agent 上下文知识体系"的**开发流程层**——回答"如何避免 AI 写出屎山"这一工程问题。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:原文博客(Why You Suck at Vibe Coding)、Anthropic 官方、GitHub 高星仓库、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [Vibe Coding 失败模式分析](#2-vibe-coding-失败模式分析)
3. [文档优先系统(Document-First)](#3-文档优先系统document-first)
4. [审问系统(Interrogation)](#4-审问系统interrogation)
5. [约束先行:CLAUDE.md 层级体系](#5-约束先行claude-md-层级体系)
6. [Vibe Design 与 DESIGN.md](#6-vibe-design-与-designmd)
7. [五阶段高质量开发流程](#7-五阶段高质量开发流程)
8. [2025-2026 方法论演进](#8-2025-2026-方法论演进)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

Vibe Coding("跟着感觉写代码")能快速产出原型,但大量项目止步于"前几个文件后的崩溃"。失败不是模型不够聪明,而是**缺乏纪律和上下文保存**。本文档把经实战验证的"文档优先 + 审问 + 约束先行"方法论系统化,让 AI 从"猜"变为"按规范执行"。

### 1.2 Agent 阅读本文档的推荐路径

```text
项目启动前 → §4 审问系统 → §3 文档优先(六份规范) → §5 约束先行
  → §7 五阶段流程 → §8 了解最新范式(SDD 等)
```

### 1.3 一句话核心结论

> **AI 是翻译器,它把你的意图转换成代码。如果你的意图是屎,代码也会是屎。** 修复方法不是更好的提示词,而是更好的理解加上文档。

---

## 2. Vibe Coding 失败模式分析

### 2.1 核心文章

《Why You Suck at Vibe Coding(and the comprehensive guide to fix you)》,作者 klöss(@kloss_xyz),发布于 X。核心论点:

> **Vibe Coding 本身没问题,问题在人。** AI 是翻译器,意图是浆糊则代码是浆糊;失败不是编码能力不足,而是"纪律与上下文保持"缺失。

### 2.2 反模式清单(原文拆解)

| 反模式 | 表现 | 后果 |
|---|---|---|
| 跳过基础知识 | 不懂组件/状态/布局/响应式/路由就指挥 AI | 指挥失准,反复返工 |
| 无文档裸奔 | 无计划、无参考、无真相来源(source of truth) | 项目写几个文件就崩溃 |
| 意图模糊 | 一句话描述需求 → AI 幻觉 → 垃圾代码 | 产不出可用功能 |
| 会话失忆 | AI 无跨会话记忆,每次新会话从零开始 | 无法长周期推进 |
| 反馈不具体 | "看起来不对,修一下" | 修复方向全靠猜 |
| 直接 Accept All | 不审查 AI 改动 | 坏代码入库 |
| 不锁版本 | 依赖版本漂移 | 环境不一致,难以复现 |
| 缺发布前检查 | 不测移动端/空状态/错误态/慢网络/快速点击 | 上线即翻车 |

### 2.3 失败的本质

> AI 产生幻觉不是因为它坏了,而是因为你没给它任何可以依靠的东西。没有结构、没有清晰度、没有基础。
> 失败模式不是缺乏编码能力,而是缺乏纪律和上下文保存。

---

## 3. 文档优先系统(Document-First)

### 3.1 铁律

> **文档第一,代码第二。永远。** 在写任何一行代码之前,先写项目规范文档。

原因:AI 能力很强但确定性低,无护栏会**臆造需求、做出未经授权的架构决策**。

### 3.2 六份规范文档

| 文档 | 内容 | 作用 |
|---|---|---|
| **PRD.md** | 完整规格:什么在范围内、什么明确不在;用户故事、成功标准 | 你的合同——AI 读了就知道"完成"是什么样子 |
| **APP_FLOW.md** | 每个页面和用户导航路径;逐步序列与决策点、成功/错误状态 | 防止 AI 猜测用户如何移动 |
| **TECH_STACK.md** | 每个包和依赖锁定到**确切版本**(Next.js 14.1.0 而非"React") | 消除幻觉依赖 |
| **FRONTEND_GUIDELINES.md** | 完整设计系统:调色板(hex)、间距刻度、圆角、阴影、排版、响应式断点 | 每个视觉决策锁定 |
| **BACKEND_STRUCTURE.md** | 数据库模式(每表/每列/类型/关系)、认证逻辑、API 端点契约 | 后端不靠猜 |
| **IMPLEMENTATION_PLAN.md** | 逐步构建序列("步骤 1.1 初始化项目 → 1.2 装依赖 → …") | 步骤越多,AI 猜测越少 |

### 3.3 两份会话文件(持久层)

| 文件 | 定位 |
|---|---|
| **CLAUDE.md**(≤60 行,精简) | AI 每次会话**自动首先读取**:规则、约束、模式、设计令牌。是活文档——每次纠正 AI 时让它更新,错误率可测量地下降 |
| **progress.txt** | 会话桥梁:已完成/进行中/接下来/已知 Bug。新会话 AI 首先读这个,从断点继续 |

### 3.4 完整项目结构

```text
my-app/
├── CLAUDE.md              ← AI 操作手册(自动读取)
├── progress.txt           ← 会话桥梁
├── PRD.md                 ← 产品需求
├── APP_FLOW.md            ← 用户流程
├── TECH_STACK.md          ← 锁定依赖
├── FRONTEND_GUIDELINES.md ← 设计系统
├── BACKEND_STRUCTURE.md   ← 数据库和 API
├── IMPLEMENTATION_PLAN.md ← 构建顺序
├── lessons.md             ← 失败模式记录(可选但推荐)
└── src/                   ← 代码
```

> **一句话**:文档越多 AI 猜测越少,AI 猜测越少质量越高。用文档替代猜测,用流程替代碰运气。

---

## 4. 审问系统(Interrogation)

### 4.1 改变一切的提示词

> 在写任何代码之前,在 Planning 模式下**无尽地审问我的想法**。不要假设任何问题。问问题直到没有假设剩下。

### 4.2 原理

> **AI 在你的清晰度结束的地方开始幻觉。** 迫使它在你开始构建前找到思维中的 gaps。

### 4.3 审问维度

AI 应该审问你:给谁用?核心动作?完成后发生什么?需要保存什么数据?展示什么数据?错误时/成功时?需要登录?需要数据库?需要在手机上工作?……

**这些答案就是规范文档的原材料**:
- 用户描述 → PRD
- 数据结构 → BACKEND_STRUCTURE
- 流程 → APP_FLOW
- 手机需求 → FRONTEND_GUIDELINES

### 4.4 审问后的第二个提示词

> 基于我们的审问,生成规范文档:PRD.md、APP_FLOW.md、TECH_STACK.md、FRONTEND_GUIDELINES.md、BACKEND_STRUCTURE.md、IMPLEMENTATION_PLAN.md。**要具体且详尽,没有歧义。**

### 4.5 顺序铁律

```text
审问 → 文档 → 代码
```

永远不要跳过这些步骤。

---

## 5. 约束先行:CLAUDE.md 层级体系

### 5.1 约束先行的层级体系

```text
全局 CLAUDE.md(用户目录,最高原则)
    ↓
项目级 CLAUDE.md(项目宪法,目录结构/命名规范)
    ↓
各类规范文档(设计文档、架构说明)
    ↓
记忆文件(自动记忆、对话记录)
```

### 5.2 六层记忆体系(Claude Code 官方演进)

```text
组织策略 → 项目记忆(./CLAUDE.md) → 项目规则(.claude/rules/)
  → 用户记忆(~/.claude/) → 项目本地(CLAUDE.local.md)
    → Auto Memory(自动笔记,MEMORY.md 只加载前 200 行)
```

原则:**越具体优先级越高**。

### 5.3 四字核心哲学

> **约束先行**。在你让 Agent 干任何事情之前,先把规范定好。规矩从上往下穿透,一层管一层。没有规矩的地方,不动手。

---

## 6. Vibe Design 与 DESIGN.md

### 6.1 问题根源

CLAUDE.md 告诉 AI **代码怎么组织**,但没告诉它 **UI 应该长什么样**——这就是前端审美灾难的根源。

### 6.2 DESIGN.md 方案

把整个网站的视觉设计系统写进一个 markdown 文件:颜色、排版、按钮、卡片、间距、深色模式。AI 读它就按这套规范生成 UI。

- **与 AGENTS.md 对应**:AGENTS.md 定义"怎么构建",DESIGN.md 定义"长什么样"
- 放在项目根目录即可被编码 Agent 读取

### 6.3 Google Stitch 与 Vibe Design

- **Google Stitch**(2026-03,Google Labs 发布,内置 Gemini):"Vibe Design" = 用自然语言/图片/语音/草图描述氛围 → 生成高保真 UI → 导出 React+Tailwind
- Stitch 2.0 已免费开放
- 核心思路:告诉 AI 想要什么**感觉**,AI 生成高保真 UI 并导出 DESIGN.md

### 6.4 awesome-design-md 仓库

[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)(2026-04 创建,约 GitHub #150):
- 从 **58+ 真实网站**(Claude、Linear、Stripe、Apple、Nike、Spotify 等)提取 DESIGN.md
- 每份含 **9 大区块**:视觉主题、色板与角色、排版层级、组件样式、布局原则、深度与层级、Do's/Don'ts、响应式行为、Agent 提示指南
- 附带 preview.html / preview-dark.html

### 6.5 四种设计风格关键词

| 风格 | 特点 | 关键词 |
|---|---|---|
| **Glassmorphism** | 磨砂玻璃、半透明 | backdrop-filter: blur() |
| **Neobrutalism** | 粗野原始、厚黑边框、冲突配色 | 高对比度、粗体原色 |
| **Bento Grid** | 便当盒网格、不同大小卡片 | 视觉节奏、响应式本质 |
| **Dark Mode** | 深色背景 + 柔和强调色 | 从一开始规划亮暗双主题 |

**提示词范例**:不要说"让它好看",说 **"玻璃拟态卡片 + 便当网格布局 + 暗黑模式 + 微交互动效"**。

**秘密武器**:找到喜欢的 UI 截图直接喂给 Claude,说"匹配这个布局"。视觉参考比任何文字描述强 100 倍。

---

## 7. 五阶段高质量开发流程

> 注:此为对 klöss 原文工作流的阶段化归纳,非原文原生命名。

### 7.1 五阶段总览

```text
阶段一 审问     Planning 模式无限提问至无假设 → 澄清需求
阶段二 文档     生成 6+2 份文档(六规范 + CLAUDE.md + progress.txt) → 真相来源
阶段三 骨架     初始化项目、锁技术栈、建目录结构 → 确定性底座
阶段四 实施     按计划小块构建,引用文档给具体提示词,每功能 git 提交 + 更新 progress.txt
阶段五 质控     发布前检查移动端/空状态/错误态/慢网络/快速点击;端到端测主流程
```

### 7.2 阶段细节

| 阶段 | 关键动作 | 产出物 |
|---|---|---|
| **一、审问需求** | Plan Mode 下让 AI 无限审问;采访完**开新会话执行**(采访对话太长污染上下文) | 澄清后的需求 |
| **二、文档优先** | 生成 6 份规范文档,具体详尽无歧义 | 六份规范文档 |
| **三、配置骨架** | CLAUDE.md(≤60 行)+ progress.txt + lessons.md | 项目骨架 |
| **四、实施执行** | 单会话(中小项目):Explore→Plan→Implement→Commit;大项目:Subagents 并行 | 功能代码 |
| **五、质量控制** | /context 看用量→50% 手动 /compact;/review 自动审查;走偏 Esc Esc 回滚 | 可发布产品 |

### 7.3 实施阶段的扩展模式

- **单会话模式**(中小项目):Explore → Plan → Implement → Commit
- **Subagents 并行**(大项目):prompt 里说 "use subagents"——"一个按 FRONTEND_GUIDELINES 做前端,一个按 BACKEND_STRUCTURE 做后端,一个写测试"
- **Agent Teams**(复杂项目):队友间直接对话协作;注意 token 消耗是单会话 3-4 倍

---

## 8. 2025-2026 方法论演进

| 范式 | 提出/代表 | 核心内容 | 与本文档关系 |
|---|---|---|---|
| **Agentic Engineering** | Karpathy(2026-02 宣布"Vibe Coding 已死") | 从"写代码"到"驾驭 Agent 写代码" | 文档优先 + 审问是其基础 |
| **Spec-Driven Development(SDD)** | OpenSpec、GitHub Spec Kit、Superpowers | "先 Spec 后代码":proposal→specs→design→tasks,人在文档间审核 | 六份规范文档是 SDD 的项目内形态 |
| **Harness Engineering** | Mitchell Hashimoto(2026-02) | 人类从"写代码的人"变"驾驭 Agent 的人";OpenAI 百万行代码实验背书 | 与 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §7 呼应 |
| **Loop Engineering** | Claude Code 官方 | 定义 agent 工作循环 | 与 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §4 呼应 |
| **上下文工程成为独立学科** | Anthropic | 上下文管理成为核心技能 | 详见 [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) |

**反方声音**:Matt Pocock 演讲"Vibe Coding 正在加速腐烂你的代码库"——提示无纪律的 AI 开发存在长期风险。

**结论**:方法论在快速演进,但底层不变——**审问 → 文档 → 代码、约束先行、上下文干净** 是贯穿所有新范式的地基。

---

## 9. 为 Agent 生成的可执行框架

### 9.1 项目启动检查清单

```markdown
## 项目启动前(写入 CLAUDE.md)
□ 六份规范文档是否齐备?(PRD/APP_FLOW/TECH_STACK/FRONTEND_GUIDELINES/BACKEND_STRUCTURE/IMPLEMENTATION_PLAN)
□ 需求是否经过审问,无假设残留?
□ 依赖是否锁定精确版本?
□ CLAUDE.md ≤60 行,只含"没有它会做错"的规则?
□ progress.txt 已初始化?
□ 设计系统是否落盘(DESIGN.md)?
```

### 9.2 防屎山日常纪律

```markdown
□ 每个功能完成 → git commit + 更新 progress.txt
□ 每次 AI 被纠正 → 更新 CLAUDE.md / lessons.md
□ 上下文中 50% 前 → 手动 /compact
□ AI 改动 → 先 git diff 验收,不 Accept All
□ 发布前 → 检查移动端/空状态/错误态/慢网络/快速点击
```

### 9.3 供 Agent 生成开发框架的元规则

1. **审问先行**:需求理解无假设前不动手
2. **文档即契约**:六份规范文档是 AI 的"宪法",矛盾时以文档为准
3. **版本锁定**:一切依赖锁定精确版本,消除幻觉依赖
4. **小步留痕**:每功能提交 + 更新进度,保持随时可工作
5. **验证门禁**:发布前必须跑通主流程 + 边界状态检查

---

## 10. 生态与资源

### 仓库
- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)(58+ DESIGN.md)
- [obra/superpowers](https://github.com/obra/superpowers)(审问/文档/开发方法论)
- [OpenSpec](https://openspec.ai)(SDD 框架)
- GitHub Spec Kit(SDD 框架)

### 官方
- [Google Stitch](https://stitch.withgoogle.com/docs/design-md/overview/)(DESIGN.md 官方文档)
- Anthropic Claude Code 文档(CLAUDE.md 层级、记忆体系)

### 社区高浏览量文章
- 原文:《Why You Suck at Vibe Coding》(klöss, X)
- [掘金 — 六文档体系中文解读](https://juejin.cn/post/7608782906940457000)
- [掘金 — CLAUDE.md 六层记忆体系](https://juejin.cn/post/7613032876864110632)
- [CSDN — Karpathy:Vibe Coding 已死](https://blog.csdn.net/reaminjocye/article/details/162527555)
- [腾讯云 — Spec-Driven Development 解析](https://cloud.tencent.com.cn/developer/article/2631688)

---

## 11. 参考来源

- klöss — *Why You Suck at Vibe Coding(and the comprehensive guide to fix you)*:X 原文 + 完整中文译本
- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:Vibe Coding 屎山问题、约束先行层级、六份规范文档、审问系统、Vibe Design、五阶段方案
- Google Stitch 官方文档(DESIGN.md):<https://stitch.withgoogle.com/docs/design-md/overview/>
- VoltAgent/awesome-design-md 仓库
- Karpathy "Vibe Coding 已死"与 SDD/Harness Engineering 社区文章(见 §10)
- 注:"五阶段流程"为对 klöss 工作流的归纳命名,非原文原生命名

---

*本文档由原文博客、官方文档与社区高浏览量文章综合而成。方法论术语(五阶段、SDD 等)在不同来源命名不一,已在文中标注。*
