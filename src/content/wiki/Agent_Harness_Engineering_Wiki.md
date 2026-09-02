# LLM Wiki — Agent Harness Engineering(驾驭工程)详解

> 面向 LLM Agent 的**Agent Harness Engineering(驾驭工程)** 系统性知识库:从"Agent 能力 = Model × Harness"的核心论断、ETCLOVG 七层框架逐层拆解,到 OpenAI 百万行代码实验、Anthropic 的 harness 实践、2025-2026 最新进展(自动 harness 合成、协同进化),沉淀为 Agent 可直接阅读、学习并用于设计生产级 harness 的一手资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**工程全景层**——[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §7 概要介绍七层框架,本文档逐层纵深展开。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:综述原文(OpenReview/TMLR 审稿中)、OpenAI/Anthropic/LangChain 官方博客、GitHub 高星仓库

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心论断:Model × Harness](#2-核心论断model--harness)
3. [约束瓶颈假说(Binding-Constraint Thesis)](#3-约束瓶颈假说binding-constraint-thesis)
4. [ETCLOVG 七层框架总览](#4-etclovg-七层框架总览)
5. [E 执行环境](#5-e-执行环境)
6. [T 工具接口](#6-t-工具接口)
7. [C 上下文与记忆](#7-c-上下文与记忆)
8. [L 生命周期编排](#8-l-生命周期编排)
9. [O 可观测性](#9-o-可观测性)
10. [V 验证评估](#10-v-验证评估)
11. [G 治理安全](#11-g-治理安全)
12. [OpenAI 百万行代码实验](#12-openai-百万行代码实验)
13. [Anthropic 的 Harness 实践](#13-anthropic-的-harness-实践)
14. [2025-2026 最新进展](#14-2025-2026-最新进展)
15. [Harness 自动合成](#15-harness-自动合成automatic-harness-synthesis)
16. [为 Agent 生成的可执行框架](#16-为-agent-生成的可执行框架)
17. [生态与资源](#17-生态与资源)
18. [参考来源](#18-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

"Agent 能干什么"由模型决定,但"Agent 在生产中可靠地干成什么"由工程外壳(Harness)决定。本文档回答:**如何设计一个让 Agent 安全、可靠、可观测、可治理的执行环境**。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:理解 harness 为什么重要 → §2-3 核心论断 → §12-13 实证
目标:设计生产级 harness → §4 总览 → §5-11 七层逐层 → §15 检查清单
目标:跟进前沿 → §14 最新进展(自动 harness 合成)
```

### 1.3 一句话核心结论

> **Agent 能力 = Model × Harness。** 模型是天花板,Harness 是地板——换模型的提升很快会被 harness 缺陷吃掉。

---

## 2. 核心论断:Model × Harness

### 2.1 来源

《Agent Harness Engineering: A Survey》(CMU/Yale/JHU/NEU/Tulane/UAB/OSU/Virginia Tech/Amazon 九机构联合,约 71 页 13 章,投稿 TMLR 审稿中)。

**核心论断**:`Agent 能力 = Model × Harness`——**倍乘而非相加**:
- 模型负责推理
- Harness 负责执行
- 任一层为 0,整体为 0

> ⚠️ **链接勘误**:网上流传的 arXiv:2504.11689 已核实为量子物理论文,与本主题无关。综述**不在 arXiv**,真实获取链接见 §17(OpenReview)。

### 2.2 支撑数据

| 证据 | 数据 | 含义 |
|---|---|---|
| 只改编辑工具格式(Bölük 2026) | 15 个模型编码基准最高 **10× 提升** | 模型不动,harness 提升巨大 |
| LangChain DeepAgents | 仅改 harness 层,Terminal-Bench 2.0 从 52.8% → **66.5%**(+13.7pp) | harness 层优化即可大幅提升 |
| Meta-Harness(Stanford/MIT/KRAFTON,2026-03) | 自动优化 harness 达 **76.4%**,超过人工手调 Terminus-KIRA 的 74.7% | 自动 harness 合成可行 |

---

## 3. 约束瓶颈假说(Binding-Constraint Thesis)

**核心主张**:长程任务的可靠性主要由 harness 而非模型决定——harness 是绑定模型能力的约束瓶颈。

**推论**:
- 换更强模型:提升很快被 harness 缺陷吃掉
- 优化 harness:即使模型不变也能显著提升(见 §2.2 数据)

**三阶段演进**(与 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §2 呼应):

```text
Prompt Engineering(2022-24)→ Context Engineering(2025)→ Harness Engineering(2026)
"怎么说话"                    "看什么"                     "怎么可靠干活"
```

---

## 4. ETCLOVG 七层框架总览

```text
E Execution(执行环境)   →  Agent 能否安全动起来
T Tooling(工具接口)     →  Agent 能调用什么
C Context(上下文记忆)   →  Agent 知道什么
L Lifecycle(生命周期)   →  Agent 如何被编排
O Observability(可观测) →  如何知道 Agent 在做什么
V Verification(验证)    →  如何证明 Agent 做对了
G Governance(治理安全)  →  如何约束 Agent 不乱来
```

**横切关系**:
- MCP 落 T 层
- Skills 跨 T/C 层
- Memory 跨 C/L 层

**项目映射情况**:E/T/L/V 四层覆盖密集;Observability 与 Governance 层较薄,多见于商业平台。配套仓库 [Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness)(338 条目、9 大分类)与交互页 [picrew.github.io/LLM-Harness](https://picrew.github.io/LLM-Harness/)。

---

## 5. E 执行环境

**职责**:Agent 能否安全动起来——沙盒、容器、远程执行、权限隔离。

### 5.1 关键技术

| 技术 | 说明 |
|---|---|
| **沙盒(Sandbox)** | 隔离 Agent 的文件系统与网络,防止破坏宿主 |
| **容器(Container)** | Docker 等,可复现、可销毁的执行环境 |
| **远程执行** | 云端 VM(如 Modal、Daytona、E2B),本地与远程分离 |
| **权限隔离** | 最小权限原则,禁止直连生产资源 |

### 5.2 代表项目

E2B、Daytona、Firecracker、gVisor、腾讯 OpenSandbox、阿里 CubeSandbox。

### 5.3 最佳实践

1. **默认隔离**:Agent 默认在隔离环境运行,不信任
2. **最小权限**:只给完成任务所需的最少权限
3. **禁止直连生产资源**:生产访问必须经审批网关

---

## 6. T 工具接口

**职责**:Agent 能调用什么——工具描述、发现、选择决策。

### 6.1 关键技术

| 技术 | 说明 |
|---|---|
| **MCP(Model Context Protocol)** | 标准化工具协议(详见 [LLM_Skills_Wiki.md](LLM_Skills_Wiki.md) 相关章节) |
| **Function Call** | LLM 输出 JSON,宿主执行 |
| **ACI(Agent-Computer Interface)** | Anthropic 提出的"为 agent 设计的接口",而非为人类 |
| **A2A(Agent-to-Agent)** | Google 提出的 agent 间通信协议 |

### 6.2 关键洞察:工具数量的悖论

- 工具多 → 选择决策难、上下文膨胀
- **工具贵精不贵多**:Vercel AI 团队"砍掉 80% 工具后准确率反升"
- 与 [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) §4.2 的"最小可行工具集"一致

### 6.3 最佳实践(Anthropic《Writing tools for AI agents》)

- 工具应自包含、对错误稳健、用途极清晰
- 参数描述性、无歧义
- 为 agent 而非人类设计(考虑 agent 如何理解工具描述)

---

## 7. C 上下文与记忆

**职责**:Agent 知道什么——短期上下文窗口、中期会话状态、长期记忆系统。

### 7.1 三层结构

| 层 | 时间尺度 | 技术 | 对应 wiki |
|---|---|---|---|
| 短期上下文 | 单次推理 | 上下文窗口管理、压缩 | [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) |
| 中期会话状态 | 会话内 | 会话状态、checkpoint | [Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7 |
| 长期记忆 | 跨会话 | 检索注入、记忆系统 | [Agent_Memory_Wiki.md](Agent_Memory_Wiki.md) |

### 7.2 代表项目

CLAUDE.md、Mem0、Letta/MemGPT、Zep、Trellis(Git 库记忆)。

### 7.3 最佳实践

- **渐进式披露**(Anthropic):只加载当前任务所需的最小上下文
- 与上下文工程、记忆系统三篇 wiki 深度呼应,此处不赘述

---

## 8. L 生命周期编排

**职责**:Agent 如何被编排——执行状态机、循环控制、checkpoint 断点续跑。

### 8.1 关键技术

| 技术 | 说明 |
|---|---|
| **执行状态机** | 显式状态转移(如 LangGraph 有向图) |
| **循环控制与停止条件** | 目标判定 + 最大迭代双保险(呼应 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §4) |
| **Checkpoint 断点续跑** | 持久化状态,错误可恢复 |
| **Durable Execution** | 如 Temporal:长时间运行任务不丢失 |

### 8.2 代表项目

LangGraph、Temporal、AutoGen、CrewAI、OpenAI Agents SDK(handoff)。

### 8.3 模式支持

- ReAct(边想边做)
- Plan-and-Execute(先规划后执行)
- Multi-agent 编排(详见 [Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md))

---

## 9. O 可观测性

**职责**:如何知道 Agent 在做什么——trace/日志/成本追踪/决策归因。**2026 新独立层**。

### 9.1 关键技术

| 技术 | 说明 |
|---|---|
| **Tracing** | 记录每次 LLM 调用、工具调用、决策路径 |
| **日志** | 事件日志、错误日志 |
| **成本追踪** | token 消耗、API 成本 |
| **决策归因** | 定位"为什么 Agent 这么做" |

### 9.2 代表项目

Langfuse、LangSmith、OpenTelemetry GenAI 语义约定、Arize Phoenix、Braintrust。

### 9.3 最佳实践

- **trace 贯穿全生命周期**:从输入到工具调用到输出到验证,全链路可追踪
- 可观测性是排查"上下文腐烂"、"错误传播"的基础设施

---

## 10. V 验证评估

**职责**:如何证明 Agent 做对了——任务→反馈五阶段闭环、HITL、基准。

### 10.1 任务→反馈闭环

```text
任务定义 → 执行 → 反馈收集 → 多级判分 → 失败归因 → 持续回归
```

### 10.2 关键机制

| 机制 | 说明 |
|---|---|
| **多级判分** | 检索质量/生成质量/工具效率分维度评估 |
| **失败归因** | 定位失败在 harness 哪一层(呼应 ETCLOVG) |
| **持续回归** | golden set 回归测试,防退化 |
| **HITL** | 人工介入检查点 |

### 10.3 代表基准

SWE-bench、Terminal-Bench 2.0、GAIA。代表实现:Meta-Harness、LangChain deepagents。

> 关联阅读:[AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)(质量防线)、[Context_Rot_Wiki.md](Context_Rot_Wiki.md) §6(测量方法论)。

---

## 11. G 治理安全

**职责**:如何约束 Agent 不乱来——权限模型、生命周期 hooks、组件加固、声明式宪章、审计管线。

### 11.1 关键技术

| 技术 | 说明 |
|---|---|
| **权限模型与身份管理** | RBAC、身份验证 |
| **生命周期 Hooks** | 在关键事件拦截(如 Claude Code PreToolUse/PostToolUse) |
| **组件加固** | 对 MCP server、工具、记忆库本身的安全加固 |
| **声明式宪章(Declarative Constitutions)** | 把安全策略写成可校验的声明(呼应 [Vibe_Coding_Methodology_Wiki.md](Vibe_Coding_Methodology_Wiki.md) 的文档优先) |
| **审计管线** | 全量行为审计与追溯 |

### 11.2 代表项目

OPA(Open Policy Agent)、Claude Code 权限模式、审批网关。

### 11.3 最佳实践

1. **执行前合规校验**:动作执行前检查是否符合策略
2. **失败恢复路径**:定义失败时如何回滚、如何上报
3. **治理与记忆安全联动**(呼应 [Memory_Security_Wiki.md](Memory_Security_Wiki.md))

---

## 12. OpenAI 百万行代码实验

### 12.1 核心事实

[OpenAI《Harness Engineering: Leveraging Codex in an Agent-First World》](https://openai.com/index/harness-engineering/)(2026-02-11):
- 2025-08 至 2026-01,**五个月**,小型工程师团队(约 3 人)以**零手写代码**交付约百万行内部产品(1500+ PR)
- 工程师只写**声明式提示词与反馈**,由 Codex 完成应用逻辑、测试、CI、文档、可观测性配置
- Codex 自主复现缺陷、验证修复

### 12.2 关键实践

| 实践 | 说明 |
|---|---|
| **文档目录作为唯一事实来源** | 架构图谱/执行计划/设计规范(呼应 [Vibe_Coding_Methodology_Wiki.md](Vibe_Coding_Methodology_Wiki.md) 六文档体系) |
| **依赖按序流转** | Types→Config→Repo→Service→Runtime→UI |
| **结构测试强制架构边界** | 机器可验证的架构约束 |
| **遥测监控 + 隔离复现** | 用数据发现问题,隔离环境复现缺陷 |

### 12.3 关键认知

> "模型是天花板,Harness 是地板"(中文社区对该文与综述论断的转述归纳,原文无此直译句)——换模型的提升很快被 harness 缺陷吃掉。

---

## 13. Anthropic 的 Harness 实践

### 13.1 Claude Code 即 Harness 实现

| 组件 | 对应层 |
|---|---|
| CLAUDE.md / Rules / Skills / Subagents / Hooks / Output styles | 上下文注入机制(C 层) |
| Hooks(PreToolUse/PostToolUse 等) | 生命周期事件拦截(G/V 层) |
| Agent Skills(指令 + 工具) | T/C 层快速通道 |
| Agent Teams(2.1.32 起) | 多实例直接通信、独立上下文、任务并行(L 层) |

### 13.2 官方博客矩阵

| 博客 | 核心原则 |
|---|---|
| Building Effective AI Agents | 简单可检查架构 |
| Writing tools for AI agents | 为 agent 而非人类设计工具 |
| Effective context engineering | 渐进式披露上下文 |
| Effective harnesses for long-running agents | 长任务需持久化与可恢复执行 |
| Harness design for long-running application development | 长期运行应用的 harness 设计 |
| Scaling Managed Agents | 大脑与手脚解耦(decoupling the brain from the hands) |
| Claude Code auto mode | 自动化模式 |

---

## 14. 2025-2026 最新进展

| 进展 | 内容 | 意义 |
|---|---|---|
| **自动 harness 合成** | Meta-Harness 与 DeepMind AutoHarness 代表两条路线(详见 §15) | "让 AI 自己设计 harness"成为新方向 |
| **事实基准确立** | Terminal-Bench 2.0 成为 harness 评测事实基准 | 优化可量化验证 |
| **工程重心迁移** | Prompt→Context→Harness→Loop;HumanLayer 实测:仅换 harness 方案排名从第 35 跃升至第 5 | harness 是当前最高杠杆 |
| **跨层综合** | 成本-质量-速度三难、能力-控制权衡、harness 耦合问题 | 完整工程视角 |
| **协同进化(Co-evolution)** | 强模型需要好 harness 承接释放;好 harness 可弥补模型短板 | 开放问题:"模型进步时 harness 如何保持有用" |
| **生产级平台化** | OpenAI Agents SDK 原生沙盒执行与 manifests;Anthropic managed agents;云 agent 的 VM 隔离与全状态快照 | harness 成为平台标配 |

---

## 15. Harness 自动合成(Automatic Harness Synthesis)

> **核心命题:"让 AI 自己设计自己的 harness。"** 2026 年两条代表路线——Meta-Harness(离线搜索)与 DeepMind AutoHarness(在线反馈)——让 harness 从"人工调优"走向"自动合成"。

### 15.1 Meta-Harness(Stanford/MIT/KRAFTON,arXiv:2603.28052)

**核心方法:outer-loop 搜索 harness 代码。**
- **Proposer 是编码 agent**(实测为 Claude Code + Opus 4.6),通过**文件系统**访问全部历史候选的源码、得分、执行轨迹(grep/cat 按需读取,而非压缩成反馈串)
- 单次评估可产生高达 **10M token** 诊断信息(对比 OPRO 仅 0.002 MTok/iter)
- Proposer 每轮中位读取 82 个文件、参考 20+ 历史候选——**非马尔可夫访问**
- 循环:读文件系统 → 提出候选 → held-out 评估 → 日志写回 → 重复

**实验结果**:
| 任务 | 结果 |
|---|---|
| 在线文本分类 | 比 SOTA 上下文管理系统 ACE 高 **7.7 分**且 token 少 4×;4 次评估即追平 OpenEvolve/TTT-Discover 60 次的结果 |
| 数学检索 | 单一 harness 在 200 道 IMO 级新题上、5 个未见模型平均 **+4.7 分**(跨模型泛化) |
| TerminalBench-2 | Opus 4.6 上 **76.4%**,超过人工手调 Terminus-KIRA 的 74.7%;Haiku 4.5 上 **37.6% 排第 1** |

**发现的典型设计**:任务前环境引导(注入沙箱快照,省 2-4 轮探索)、两步验证检索、四路路由检索。

**与 DSPy 的关系**:DSPy 作者 Omar Khattab 为共同作者——延续 DSPy"将 LM 程序声明化并自动编译优化"的范式,但把优化对象从 prompt 模块/流水线**扩展到完整可执行 harness 程序**。

### 15.2 DeepMind AutoHarness(arXiv:2603.03329)

**与 Meta-Harness 的路线对比(互补)**:

| 维度 | Meta-Harness | AutoHarness |
|---|---|---|
| 优化方式 | **离线** held-out eval + 文件系统 proposer | **在线环境反馈闭环** + 小模型直接合成约束代码 |
| 搜索空间 | 大(全栈优化 system prompt/工具/检查逻辑) | 聚焦约束代码 |
| 适用 | 追求极致性能 | 快速、低成本修复 |

**机制与结果**:
- Kaggle GameArena 棋赛中 78% 的 Gemini-2.5-Flash 失利源于非法动作
- 用 seed harness + 失败样例,由 Flash 迭代式代码精修(环境反馈),最终在 **145 个 TextArena 游戏**中消除全部非法动作
- 小模型 Flash + 合成 harness **胜过 Gemini-2.5-Pro**;code-policy(决策时零 LLM 调用)在 16 个 1-player 游戏平均 reward 超 Gemini-2.5-Pro 和 GPT-5.2-High
- 启示:**"学会约束"比"学会推理"更有效**,小模型+定制 harness 可碾压裸大模型

### 15.3 自动优化的理论基座

| 技术 | 论文 | 与 harness 合成的关系 |
|---|---|---|
| **DSPy** | [arXiv:2310.03714](https://arxiv.org/abs/2310.03714) | 声明式模块化 LM 程序 + 编译器自动优化——范式源头 |
| **OPRO** | [arXiv:2309.03409](https://arxiv.org/abs/2309.03409)(ICLR 2024) | LLM 当优化器,meta-prompt 携带历史(解, 分数)对迭代 |
| **APO** | [arXiv:2305.03495](https://arxiv.org/abs/2305.03495)(EMNLP 2023) | 自然语言"梯度"批评当前 prompt + beam search 反向编辑 |
| **PromptBreeder** | [arXiv:2309.16797](https://arxiv.org/abs/2309.16797) | 自指式进化:同时进化任务 prompt 与 mutation-prompt |
| **工具集优化** | — | 工具定义/选择属 harness 搜索空间(Meta-Harness 明确包含 tool definitions) |

> 上述方法的共同缺陷(Meta-Harness 指出):反馈被压缩至 100-30k token,**无法诊断长程 harness 失败**——这正是文件系统方案的价值。

### 15.4 相关研究与概念

| 概念 | 论文 | 内容 |
|---|---|---|
| **Self-Evolving AI Agents 综述** | [arXiv:2508.07407](https://arxiv.org/abs/2508.07407)(2025-08) | 统一框架:System Inputs / Agent System / Environment / **Optimisers** 四环反馈 |
| **Self-Improvements 综述** | [arXiv:2607.13104](https://arxiv.org/abs/2607.13104)(2026-07,97 页) | Agent = 基础模型 + operational scaffold(prompts/memory/tools/control logic);自改进 = self-induced update operator 更新参数或 scaffold |
| **Continual Harness** | [arXiv:2605.09998](https://arxiv.org/abs/2605.09998)(普林斯顿/ARISE/DeepMind) | 无重置在线自改进 harness;Gemini Plays Pokemon 首个无败通关 |
| **RHI(协同进化)** | [arXiv:2607.15524](https://arxiv.org/abs/2607.15524)(2026-07) | 首次形式化 harness-in-the-loop learning:harness 执行轨迹是未来模型训练数据;低推理预算 agent 反超高预算,推理成本降 60% |
| **Polar(harness×RL)** | [arXiv:2605.24220](https://arxiv.org/abs/2605.24220) | 把任意 harness 当黑盒代理做异步 agentic RL;纯 GRPO 令 Qwen3.5-4B 在 SWE-Bench Verified +22.6 |

### 15.5 产业实践(2025-2026)

| 实践 | 内容 |
|---|---|
| **LangChain DeepAgents** | 只改 harness(固定 gpt-5.2-codex),Terminal Bench 2.0 从 52.8%→66.5%;核心手段:Build-Self-Verify 循环、PreCompletionChecklistMiddleware(退出检查)、LocalContextMiddleware(环境上下文注入)、LoopDetectionMiddleware(死循环检测);配套 **Trace Analyzer Skill** 自动分析轨迹并提出 harness 改动 |
| **Claude Code hooks 自动生成** | hooks(PreToolUse/PostToolUse 等)即 harness 关键旋钮;社区出现"一键生成 AGENTS.md/hooks 配置"工具 |
| **平台动向** | 2026-08 DeepSeek 启动 Agent Harness 内测(769 开发者/712 仓库);Google I/O 2026 宣布 Antigravity 作为全线产品 harness |

### 15.6 供 Agent 合成 Harness 的元规则

1. **反馈不压缩**:长程 harness 失败需要完整诊断信息(文件系统 > 反馈串)
2. **离线评估护栏**:held-out eval 是合成质量的裁判
3. **先约束后推理**:小模型 + 定制 harness 常优于裸大模型
4. **协同进化**:harness 优化与模型升级互为正反馈
5. **产物留痕**:候选 harness、得分、执行轨迹全部落盘,供迭代参考

---

## 16. 为 Agent 生成的可执行框架

### 16.1 Harness 设计自查清单(七层)

```markdown
## Harness 设计自查
□ E 执行环境:Agent 是否默认隔离运行?是否最小权限?
□ T 工具接口:工具集是否最小可行?工具描述是否清晰无歧义?
□ C 上下文:是否渐进式披露?记忆是否分层?
□ L 生命周期:是否有停止条件与 checkpoint?状态是否持久化?
□ O 可观测性:trace 是否贯穿全生命周期?成本是否追踪?
□ V 验证:是否有 golden set 回归?失败是否可归因到层?
□ G 治理:是否执行前合规校验?是否有审计管线与失败恢复路径?
□ 横切:harness 缺陷是否会被模型升级掩盖?(协同进化视角)
```

### 16.2 生产级 Harness 落地顺序

```text
第 1 步:治理先行(权限/合规/审计)→ 定义能做什么不能做什么
第 2 步:执行隔离(沙盒/容器)→ 保证安全
第 3 步:工具收敛(最小可行工具集)→ 保证可控
第 4 步:验证闭环(golden set + 回归)→ 保证正确
第 5 步:可观测(trace 全链路)→ 保证可查
第 6 步:生命周期编排(checkpoint/持久化)→ 保证可恢复
第 7 步:上下文与记忆(渐进式披露)→ 保证高效
```

### 16.3 供 Agent 生成 Harness 框架的元规则

1. **倍乘思维**:模型与 harness 必须同时达标,别只换模型
2. **约束即设计**:把策略写成可校验的声明(宪章),而非口头规则
3. **默认不信任**:隔离、最小权限、执行前校验
4. **验证先行**:任何 harness 改动纳入 golden set 回归
5. **全链路可观测**:trace 贯穿,失败可归因到层
6. **协同进化**:模型升级时同步审视 harness 是否成为新瓶颈
7. **自动合成**:考虑用 Meta-Harness/AutoHarness 类方法自动优化 harness(§15)

---

## 17. 生态与资源

### 综述与仓库
- [Agent Harness Engineering: A Survey(OpenReview PDF)](https://openreview.net/pdf?id=eONq7FdiHa)(TMLR 审稿中,真实来源)
- [Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness)(338 条目、9 大分类)
- [交互式项目页](https://picrew.github.io/LLM-Harness/)
- [ai-boost/awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering)

### 官方博客
- [OpenAI — Harness Engineering](https://openai.com/index/harness-engineering/)
- [LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- Anthropic:effective-agents / writing-tools-for-agents / effective-context-engineering-for-ai-agents / effective-harnesses-for-long-running-agents / harness-design-long-running-apps / managed-agents

### 各层代表项目
- E:E2B、Daytona、Firecracker、gVisor、腾讯 OpenSandbox
- T:MCP、Vercel AI SDK、Google A2A
- C:CLAUDE.md、Mem0、Letta、Zep、Trellis
- L:LangGraph、Temporal、AutoGen、CrewAI、OpenAI Agents SDK
- O:Langfuse、LangSmith、OpenTelemetry GenAI、Arize Phoenix
- V:Meta-Harness、SWE-bench、Terminal-Bench 2.0、GAIA
- G:OPA、Claude Code 权限模式

---

## 18. 参考来源

- *Agent Harness Engineering: A Survey*(TMLR 审稿中,OpenReview): <https://openreview.net/pdf?id=eONq7FdiHa>
- OpenAI — *Harness Engineering: Leveraging Codex in an Agent-First World*(2026-02): <https://openai.com/index/harness-engineering/>
- LangChain — *Improving Deep Agents with Harness Engineering*: <https://blog.langchain.com/improving-deep-agents-with-harness-engineering/>
- Anthropic 工程博客矩阵(见 §13.2)
- Bölük(2026):仅改编辑工具格式,15 模型最高 10× 提升
- Meta-Harness(Stanford/MIT/KRAFTON,2026-03):自动优化 harness 76.4%
- [Meta-Harness 论文](https://arxiv.org/abs/2603.28052)(arXiv:2603.28052)
- [DeepMind AutoHarness 论文](https://arxiv.org/abs/2603.03329)(arXiv:2603.03329)
- [Self-Evolving AI Agents 综述](https://arxiv.org/abs/2508.07407) ｜ [Self-Improvements 综述](https://arxiv.org/abs/2607.13104)
- [Continual Harness](https://arxiv.org/abs/2605.09998) ｜ [RHI 协同进化](https://arxiv.org/abs/2607.15524) ｜ [Polar harness×RL](https://arxiv.org/abs/2605.24220)
- [Meta-Harness 项目页](https://yoonholee.com/meta-harness/) ｜ [代码](https://github.com/stanford-iris-lab/meta-harness-tbench2-artifact) ｜ [LangChain DeepAgents](https://github.com/langchain-ai/deepagents)
- ⚠️ 误传澄清:arXiv:2504.11689 为量子物理论文,与本主题无关
- 关联文档:[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §7、[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md)、[AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)

---

*本文档由综述原文(OpenReview/TMLR 审稿中)、OpenAI/Anthropic/LangChain 官方博客、arXiv 论文与 GitHub 仓库综合而成。数据点(10×、+13.7pp、76.4%、百万行/5 个月/1500+ PR、145 游戏、+22.6)均有一手或权威二手来源支撑。注明:综述无 arXiv 编号,引用以 OpenReview 为准;arXiv:2504.11689 系误传。*
