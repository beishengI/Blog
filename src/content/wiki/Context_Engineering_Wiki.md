# LLM Wiki — 上下文工程(Context Engineering)系统化框架

> 面向 LLM Agent 的**上下文工程(Context Engineering)** 方法论文档:从提示词工程到上下文工程的演进、上下文解剖、运行时检索、长时任务三大技术,到工程落地与评估治理。本文档是 [Context_Rot_Wiki.md](Context_Rot_Wiki.md)(问题诊断)的**解决方案框架层**。
>
> 定位:本 Wiki 与 [Context_Rot_Wiki.md](Context_Rot_Wiki.md)(上下文腐烂)、[LLM_Wiki.md](LLM_Wiki.md)(上下文文件)、[LLM_Skills_Wiki.md](LLM_Skills_Wiki.md)(Agent Skills)共同构成"Agent 上下文知识体系"。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 核心来源:Anthropic 工程博客(原文)、Agent Harness Engineering 综述、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [范式演进:从 Prompt Engineering 到 Context Engineering](#2-范式演进从-prompt-engineering-到-context-engineering)
3. [核心心智模型](#3-核心心智模型)
4. [有效上下文的解剖](#4-有效上下文的解剖)
5. [运行时上下文检索](#5-运行时上下文检索)
6. [长时任务的三大技术](#6-长时任务的三大技术)
7. [上下文工程与 Harness 的关系](#7-上下文工程与-harness-的关系)
8. [工程落地清单与模板](#8-工程落地清单与模板)
9. [评估与治理](#9-评估与治理)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

当构建 Agent 时,"上下文该放什么、何时放、何时清"是比"提示词怎么写"更核心的工程问题。本文档把 Anthropic 官方方法论 + 学术综述 + 一线实践沉淀为**可复用的上下文工程框架**,并给出可直接落地的模板。

### 1.2 与姊妹文档的分工

| 文档 | 定位 | 回答的问题 |
|---|---|---|
| **本文档(Context Engineering)** | 方法论框架层 | 怎么管好上下文? |
| [Context_Rot_Wiki.md](Context_Rot_Wiki.md) | 问题诊断层 | 上下文为什么烂?如何测量与对抗? |
| [LLM_Wiki.md](LLM_Wiki.md) | 文件规范层 | 上下文文件(CLAUDE.md/AGENTS.md)怎么写? |
| [LLM_Skills_Wiki.md](LLM_Skills_Wiki.md) | 能力封装层 | 怎么把方法固化为 Skill? |

### 1.3 一句话核心结论

> **上下文工程 = 在每次推理时,从不断演化的信息宇宙中,精选出进入有限上下文窗口的那组 token。**
> —— Anthropic《Effective context engineering for AI agents》

---

## 2. 范式演进:从 Prompt Engineering 到 Context Engineering

### 2.1 演进时间线

```text
Prompt Engineering(2022-2023)   →  Context Engineering(2024-2025)   →  Harness Engineering(2025-2026)
"怎么跟模型说话"                    "模型该看见什么"                     "怎么让模型在真实世界里可靠干活"
写 system prompt、few-shot        选什么进上下文、压缩什么、窗口满了怎么办   工具接口、执行环境、验证、治理、可观测性
```

来源:CMU/Yale/JHU/Amazon 联合综述《Agent Harness Engineering: A Survey》提出的三阶段框架。

### 2.2 两个概念的官方区分

| 维度 | Prompt Engineering | Context Engineering |
|---|---|---|
| 对象 | 如何写好/组织指令 | 如何精选并维护推理时的最优 token 集合 |
| 范围 | 主要是 system prompt | 系统指令 + 工具 + MCP + 外部数据 + 消息历史等全部 |
| 迭代性 | 离散的一次性任务 | **循环迭代**:每次决定给模型什么时都在做策展 |
| 时间尺度 | 单次调用 | 多轮推理、长时间地平线 |
| 心智 | 找对词 | **思考模型的整体状态与可能行为**("thinking in context") |

### 2.3 为什么现在它变得重要

- Agent 在循环中运行,持续产生"可能相关"的数据,必须**循环精炼**
- 上下文窗口是有限资源且边际回报递减(详见 [Context_Rot_Wiki.md §4](Context_Rot_Wiki.md))
- 工程实证:只改工具格式与 harness、不改模型,编码 benchmark 最高带来 **10 倍提升**(Terminal-Bench 2.0:52.8% → 66.5%)

---

## 3. 核心心智模型

### 3.1 注意力预算(Attention Budget)

> 与人类有限的工作记忆容量类似,LLM 有一个注意力预算。每个新 token 都消耗一部分预算。

**推论**:
- 上下文是有限资源,边际回报递减
- 目标:**找到最小的、能最大化目标输出概率的高信号 token 集合**

### 3.2 好的上下文 = 少而准(Small but High-Signal)

| ❌ 反模式 | ✅ 正确做法 |
|---|---|
| 把能装的都装进去 | 最小集合 + 按需加载 |
| 事无巨细的 if-else 硬编码提示词 | 合适的抽象高度(right altitude) |
| 空泛的高层指引("好好干") | 具体到可引导行为,但保留启发式灵活性 |
| 堆砌所有边界 case 示例 | 精选多样、规范的 canonical 示例(图胜千言) |

### 3.3 合适的抽象高度(Right Altitude)

两个失败极端之间的黄金区:

```text
硬编码 if-else(脆弱、难维护)─── 合适高度:足够具体引导 + 足够灵活启发 ─── 空泛(无信号、假设共享上下文)
```

---

## 4. 有效上下文的解剖

### 4.1 上下文的组成成分

| 成分 | 官方建议 |
|---|---|
| **System Prompt** | 分区组织(如 `<background_information>`、`<instructions>`、`## Tool guidance`、`## Output description`);追求最小集合 + 足够信息;用最好的模型从最小提示开始测,基于失败模式增量补充 |
| **Tools** | 自包含、对错误稳健、用途极清晰;参数描述性、无歧义;**最小可行工具集**——人类工程师都无法判断该用哪个工具时,Agent 更做不到 |
| **Examples(Few-shot)** | 强烈建议;精选多样、规范的示例,而非罗列所有边界 case |
| **Message History** | 按需保留,定期压缩/清理 |
| **外部数据(MCP 等)** | 保持"信息丰富但紧凑" |

### 4.2 最小可行工具集(Minimal Viable Tool Set)

- 臃肿工具集 = 模糊决策点 = 上下文浪费
- 好处:长期交互中更可靠的维护与裁剪
- 参考:Anthropic《Writing tools for AI agents》——工具应像良好设计的代码库一样:自包含、稳健、意图清晰

---

## 5. 运行时上下文检索

### 5.1 三种策略对比

| 策略 | 机制 | 优点 | 缺点 | 适用 |
|---|---|---|---|---|
| **预检索(Pre-inference)** | 基于 embedding,推理前检索 | 快 | 索引可能过期、成本高 | 静态内容(法律/金融) |
| **即时检索(Just-in-time)** | 只维护轻量标识(路径/查询/链接),运行时用工具动态加载 | 上下文高效、反映真实状态 | 运行时更慢 | 动态内容、大数据库 |
| **混合(Hybrid)** | 关键信息预载 + 自主探索 | 兼顾速度与新鲜度 | 需要设计边界 | Claude Code 模式 |

### 5.2 渐进式披露(Progressive Disclosure)

- Agent 自主导航、逐层发现相关上下文:文件大小 → 复杂度、命名 → 用途、时间戳 → 相关度
- 工作记忆只留必要信息,其余外化(笔记、文件系统、索引)
- **元数据即信号**:`test_utils.py` 在 `tests/` 与在 `src/core_logic/` 意义完全不同;目录层级、命名约定、时间戳都是上下文信号

### 5.3 Claude Code 的混合模式(实践范本)

- 前向预载:`CLAUDE.md` 等指令文件直接投入上下文
- 即时检索:`glob`/`grep` 等原语让 Agent 按需探索环境、获取文件
- 大数据库分析:写目标查询、存结果、用 `head`/`tail` 浏览,从不在上下文中加载完整数据对象

> "这镜像了人类认知:我们不背诵整个语料库,而是引入文件系统、收件箱、书签这类外部组织与索引系统,按需检索。" —— Anthropic

---

## 6. 长时任务的三大技术

> 当任务 token 总量超过窗口时(数十分钟到数小时,如大型代码库迁移、综合研究项目),Anthropic 官方三大技术:

### 6.1 压缩(Compaction)—— 第一杠杆

**机制**:对话接近窗口上限 → 总结内容 → 用摘要重新初始化新窗口。

**要点**:
- 核心目标:高保真蒸馏
- 压缩不是删除:决策、契约、未完成任务必须保留
- 主动压缩优于自动压缩(详见 [Context_Rot_Wiki.md §8](Context_Rot_Wiki.md))

**执行模板(压缩摘要须保留的结构)**:

```markdown
## 会话摘要
- 任务目标:(当前正在解决什么)
- 已完成的决策:(有约束力的决定,含理由)
- 当前状态:(文件/模块/接口位置)
- 未完成任务:(下一步要做什么)
- 契约与约束:(必须遵守的规则,防丢失)
- 踩坑记录:(gotchas,避免重蹈)
```

### 6.2 结构化笔记(Structured Note-taking)—— 外化工作记忆

**机制**:Agent 维护外部笔记/记录,把工作记忆外化,需要时按需读取。

**笔记体系**(与 [LLM_Wiki.md](LLM_Wiki.md) 同源):

| 文件 | 内容 | 更新时机 |
|---|---|---|
| `progress.txt` | 已完成/进行中/接下来/已知 Bug | 每个里程碑 |
| `gotchas.txt` | 坑与局部经验 | 每次犯错后 |
| `RESEARCH_PROPOSAL.md` | 项目方案宪法 | 方案确定时 |
| `PROJECT_INDEX.md` | 结构、脚本、数据流 | 每次结构调整 |

### 6.3 多智能体架构(Multi-agent Architectures)—— 拆分上下文

**机制**:任务拆给多个 Agent,各维护小上下文,避免单一上下文膨胀。

**模式**:
- 主 Agent 协调 + 子代理执行
- 执行与验证分离(子代理 A 共享上下文找逻辑错误,子代理 B 全新上下文找盲区)
- 代价:token 消耗 3–4 倍,适合大型复杂任务

---

## 7. 上下文工程与 Harness 的关系

### 7.1 ETCLOVG 七层框架(Agent Harness Engineering 综述)

```text
Execution(执行环境) → Tooling(工具接口) → Context(上下文记忆) → Lifecycle(生命周期编排)
→ Observability(可观测性) → Verification(验证评估) → Governance(治理安全)
```

**Context 层正是上下文工程的主战场**,它被 Execution 与 Tooling 制约,又为 Lifecycle 提供状态基础。

### 7.2 与 Skill / MCP / CLI 的分工

| 概念 | 职责 | 在上下文工程中的角色 |
|---|---|---|
| **Skill** | 程序性记忆("怎么做") | 渐进式披露的实现载体:元数据进上下文,正文按需加载 |
| **MCP** | 工具协议("怎么接") | 为 Agent 提供动态拉取上下文的入口(工具返回即上下文) |
| **CLI** | 执行现场("在哪干") | 让 Agent 在不加载全文的情况下探查数据(head/grep/glob) |

---

## 8. 工程落地清单与模板

### 8.1 上下文工程每日清单

```markdown
□ System Prompt 分区清晰、无废话,达到"合适高度"
□ 工具集最小可行,参数无歧义
□ 示例精选 canonical(图胜千言),不堆边界 case
□ 预载内容最少化,其余走即时检索
□ 上下文占用 50% 前主动压缩
□ progress.txt / gotchas.txt 最新
□ 关键约束在 CLAUDE.md(每次自动加载)
□ 长输出任务分段构建
```

### 8.2 System Prompt 分区模板

```markdown
<background_information>
项目背景、技术栈、术语表
</background_information>
<instructions>
任务指令:做什么、按什么顺序、什么不能做
</instructions>
## Tool guidance
每个工具何时使用、何时不用
## Output description
输出格式、验收标准
```

### 8.3 上下文策略选择器(决策树)

```text
任务是否超过单窗口?
├─ 否 → 最小上下文 + 合适高度提示词 + 即时检索
└─ 是 →
    ├─ 单 Agent 可完成?
    │   ├─ 是 → Compaction + 结构化笔记
    │   └─ 否 → Multi-agent(执行与验证分离)
    └─ 内容是否动态?
        ├─ 静态 → 预检索(embedding)为主
        └─ 动态 → 即时检索为主,混合策略
```

---

## 9. 评估与治理

### 9.1 评估上下文质量

| 维度 | 评估方式 |
|---|---|
| 信息检索准确率 | 黄金测试集 + 对抗性测试(干扰项/位置变化) |
| 决策保真度 | 压缩后能否复现压缩前的关键决策 |
| 成本效率 | 每有效输出消耗的 token 数 |
| 长程一致性 | 跨压缩、跨会话的约束保持率 |

### 9.2 治理原则

1. **单一真相来源**:CLAUDE.md 等指令文件是唯一权威,不复制不冲突
2. **约束先于行动**:任何工作开始前先定规则,规矩从上往下穿透
3. **留痕可审计**:状态变更落盘,AI 的行为可回滚、可对比、可追踪

---

## 10. 参考来源

### 官方一手来源
- Anthropic — *Effective context engineering for AI agents*(2025-09-29): <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- Anthropic — *Claude Code: Best practices for agentic coding*: <https://www.anthropic.com/engineering/claude-code-best-practices>
- Anthropic — *Writing tools for AI agents*: <https://www.anthropic.com/engineering/writing-tools-for-agents>
- Anthropic — *Building effective AI agents*: <https://www.anthropic.com/research/building-effective-agents>
- CMU/Yale/JHU/Amazon — *Agent Harness Engineering: A Survey*: ETCLOVG 七层框架
- Chroma — *Context Rot* 技术报告: <https://research.trychroma.com/context-rot>

### 社区高质量解读
- [CSDN — 超越提示词:Anthropic 揭示下一代AI智能体的关键——上下文工程](https://blog.csdn.net/2301_81888214/article/details/153184399)
- [掘金 — Anthropic官方解密:3招上下文优化,破解Agent性能暴跌](https://juejin.cn/post/7558082281224765486)
- [博客园 — AI Agent 为什么从提示词工程走向上下文工程](https://www.cnblogs.com/hibpm/p/22300438)
- [CSDN — 万字长文:深入解析"上下文工程"](https://blog.csdn.net/universsky2015/article/details/153872137)
- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:三阶段框架、ETCLOVG、五上下文管理策略

---

*本文档以 Anthropic 官方方法论为骨架,综合 Agent Harness Engineering 综述与社区实践。框架描述以一手来源为准,落地模板允许按项目裁剪。*
