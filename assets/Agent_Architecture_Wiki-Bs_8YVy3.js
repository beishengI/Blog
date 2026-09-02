const n=`# LLM Wiki — Agent 核心架构(从 Chat 到 Agent 的范式与引擎)

> 面向 LLM Agent 的**Agent 核心架构**系统性知识库:从 Chat→Agent 范式跃迁、ReAct 与 Agent Loop 两大引擎、Plan-and-Execute / Reflexion 衍生模式、Workflows vs Agents 分野,到 ETCLOVG 七层框架与记忆架构,最后沉淀为 Agent 可直接阅读、学习并用于生成 Agent 系统框架的一手资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**基础理论层**——[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) 讲怎么管上下文,本文档讲 Agent 由什么构成、如何运转。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、Anthropic/OpenAI 官方博客、GitHub 高星仓库、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [范式跃迁:从 Chat 到 Agent](#2-范式跃迁从-chat-到-agent)
3. [核心引擎一:ReAct(推理 + 行动)](#3-核心引擎一react推理--行动)
4. [核心引擎二:Agent Loop(智能体循环)](#4-核心引擎二agent-loop智能体循环)
5. [衍生模式:Plan-and-Execute 与 Reflexion](#5-衍生模式plan-and-execute-与-reflexion)
6. [架构分野:Workflows vs Agents](#6-架构分野workflows-vs-agents)
7. [工程全景:ETCLOVG 七层框架](#7-工程全景etclovg-七层框架)
8. [Agent 记忆架构](#8-agent-记忆架构)
9. [2025-2026 最新进展](#9-2025-2026-最新进展)
10. [为 Agent 生成的可执行框架](#10-为-agent-生成的可执行框架)
11. [生态与资源](#11-生态与资源)
12. [参考来源](#12-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

Agent 不是一个"更强的聊天框",而是一套**目标驱动的自主行动闭环**。要正确构建、调试、选型 Agent,必须先理解其底层引擎与架构模式。本文档从论文原文与官方文档出发,把分散的知识整合为一条完整认知链。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解"Agent 为什么能动起来"
   └─ §2 范式 → §3 ReAct → §4 Agent Loop → §5 衍生模式 → §6 何时用 Agent

目标:构建/选型 Agent 系统
   └─ §6 workflow vs agent 决策 → §7 ETCLOVG 自查 → §8 记忆架构 → §10 可执行框架
\`\`\`

### 1.3 一句话核心结论

> **Agent = LLM 基于环境反馈循环调用工具。** 能力上限 = 模型 × 工程外壳(Harness)。

---

## 2. 范式跃迁:从 Chat 到 Agent

### 2.1 本质差异

| 维度 | Chat | Agent |
|---|---|---|
| 模式 | 单轮对话 | 多轮循环(Loop) |
| 主动性 | 被动响应 | 主动规划与执行 |
| 工具使用 | 无 | 文件、Shell、API、浏览器等 |
| 记忆 | 上下文窗口 | 持久记忆 + 会话记忆 + Skill 沉淀 |
| 状态 | 无状态 | 有状态,跨会话持久化 |

### 2.2 定义

> "AI 智能体是使用 AI 来实现目标并代表用户完成任务的软件系统,其表现出推理、规划和记忆能力,并且具有一定的自主性,能够自主学习、适应和做出决定。" —— Google Cloud

> "LLMs 在一个循环中自主使用工具。" —— Anthropic 简化定义(2025)

**关键**:Agent 的核心不是"更聪明的模型",而是**闭环结构**——推理驱动行动,行动反馈修正推理,直到目标达成。

---

## 3. 核心引擎一:ReAct(推理 + 行动)

### 3.1 概念

**ReAct(Reasoning + Acting)**,Yao et al.(普林斯顿 + 谷歌),2022 年 10 月(ICLR 2023,arXiv:2210.03629)。

让 LLM **交错生成"推理轨迹 + 动作"**:
1. **推理(Reasoning)**:分析当前任务状态,决定下一步行动
2. **行动(Acting)**:执行具体操作——Function Call、MCP、Shell 命令、代码执行
3. **观察(Observation)**:观察行动结果,反馈用于下一轮思考;或判断目标达成则输出

### 3.2 为什么有效

- **缓解幻觉与错误传播**:纯思维链(Chain-of-Thought)在长链推理中会积累幻觉;ReAct 用外部环境反馈"锚定"推理
- **数据支撑**:HotpotQA/Fever 上通过 Wikipedia API 交互超越基线;ALFWorld/WebShop 决策任务较模仿学习、RL 绝对成功率分别高 34%/10%

### 3.3 与思维链的关系

| 维度 | CoT(思维链) | ReAct |
|---|---|---|
| 内容 | 纯推理轨迹 | 推理 + 行动交错 |
| 反馈 | 无(闭卷推理) | 有(环境观察) |
| 适用 | 单一推理任务 | 需要工具交互的任务 |

**结论**:ReAct 已成为后续 Agent 循环范式的事实标准;绝大多数现代 Agent(Claude Code、Codex 等)都是 ReAct 的工程化变体。

---

## 4. 核心引擎二:Agent Loop(智能体循环)

### 4.1 概念

Agent 的本质执行模式:**observe → think → act → observe 的迭代**。

工程上就是一段 \`while True\` 循环:

\`\`\`python
# Agent Loop 的最小实现(概念示意)
while not goal_reached:
    action = llm(system_prompt + env.state)   # 推理:基于环境状态决定动作
    env.state = tools.run(action)              # 行动:执行工具,更新状态
\`\`\`

### 4.2 设计要点(Anthropic 官方)

1. **每步获取 ground truth**:用工具结果、代码执行等环境反馈评估进度,而非模型自评
2. **检查点与人类反馈**:循环中可暂停,请求人类批准后继续
3. **停止条件**:必须设置最大迭代数等终止条件,维持控制
4. **参考实现**:Anthropic computer-use demo 的 sampling_loop

### 4.3 Loop 与上下文的关系

> 每次迭代都会产生新上下文(观察结果),而上下文是有限资源且会"腐烂"——这使 Loop 必然需要 [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) 的压缩/笔记/子代理技术,否则长任务会随着迭代次数增加而退化(详见 [Context_Rot_Wiki.md](Context_Rot_Wiki.md))。

---

## 5. 衍生模式:Plan-and-Execute 与 Reflexion

### 5.1 Plan-and-Execute(先规划后执行)

**机制**:先由 Planner 将任务拆成有序步骤清单,再由 Executor 逐步执行;与 ReAct 的"边想边做"相对。

- 相关学术工作:Plan-and-Solve Prompting(Wang et al., arXiv:2305.04091)
- 优点:规划与执行解耦,减少每步推理开销
- 适用:步骤可预见的任务;长任务下优于纯 ReAct
- 变体:ReWOO 进一步解耦规划与观察

### 5.2 Reflexion(语言强化学习)

**机制**:不更新权重,通过"语言反馈"强化 Agent——对失败进行**口头反思并存入情景记忆缓冲**,供后续试验改进(Shinn et al., 2023, NeurIPS 2023, arXiv:2303.11366)。

- HumanEval 达 **91% pass@1**,超越当时 GPT-4 的 80%
- 确立了"反思 + 记忆"成为 Agent 自我改进的标准组件

> ⚠️ 注意:Reflexion 的"反思"必须**锚定外部失败信号**。ICLR 2024《LLMs Cannot Self-Correct Reasoning Yet》证明:无外部反馈时,模型内在自我纠正不可靠,反思反而可能降分。详见 [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)。

### 5.3 三种模式选型

| 模式 | 机制 | 适合 | 不适合 |
|---|---|---|---|
| ReAct | 边想边做 | 步骤不可预测、需即时反馈 | 长任务(推理开销大) |
| Plan-and-Execute | 先规划后执行 | 步骤可预见、长任务 | 计划与事实偏差大时 |
| Reflexion | 失败反思 + 记忆 | 可反复试验的任务 | 无可靠外部反馈时 |

---

## 6. 架构分野:Workflows vs Agents

### 6.1 Anthropic 官方定义(2024-12 发布,2025 持续更新)

> - **Workflows**:LLM 与工具经**预定义代码路径**编排
> - **Agents**:LLM **动态自主**控制流程与工具使用

关键判断:你能预测步骤 → 用 Workflow;无法预写路径、需多轮自主决策 → 用 Agent。

### 6.2 Workflow 五模式(Anthropic 官方)

| 模式 | 机制 | 适用场景 | 示例 |
|---|---|---|---|
| **Prompt chaining** | 前一步输出作后一步输入,可加程序化 gate | 任务可固定拆解为子步骤 | 写大纲→校验→成文 |
| **Routing** | 分类输入并路由到专用处理 | 存在可准确分类的输入类别 | 客服分流、小/大模型分流 |
| **Parallelization** | 并行子任务(Sectioning)/多路投票(Voting) | 子任务独立或需多视角 | 并行安全审查、多 prompt 投票 |
| **Orchestrator-workers** | 中央 LLM 动态拆解、委派、汇总 | 子任务不可预测的复杂任务 | 多文件编码、多源搜索 |
| **Evaluator-optimizer** | 生成器 + 评估器循环迭代 | 有明确评估标准、迭代有价值 | 文学翻译、复杂搜索 |

### 6.3 Agent vs Workflow 取舍

| 维度 | Workflow | Agent |
|---|---|---|
| 驱动 | 代码路径 | 模型自主 |
| 可预测性 | 高 | 低 |
| 延迟/成本 | 低 | 高(以延迟和成本换性能) |
| 一致性 | 高 | 需沙盒测试与护栏 |
| 错误累积 | 可控 | 可能累积,需验证 |

> Anthropic 官方建议:**从最简方案起步**,框架会掩盖 prompt 与响应、增加调试难度。能 Workflow 就不上 Agent。

---

## 7. 工程全景:ETCLOVG 七层框架

### 7.1 来源

《Agent Harness Engineering: A Survey》(CMU/Yale/JHU/NEU/Tulane/UAB/OSU/Virginia Tech/Amazon 联合),2025。核心论断:**"Agent 能力 ≈ Model × Harness"**——长周期任务的可靠性主要取决于工程外壳而非模型本身。

> 注:该综述的 arXiv 编号存在网络误传(2504.11689 实为不相关论文),可靠一手来源见 §12 的 OpenReview 链接。

### 7.2 七层结构

\`\`\`text
Execution(执行环境)
  → Tooling(工具接口)
    → Context(上下文记忆)     ← 与 Context Engineering 对接
      → Lifecycle(生命周期编排)
        → Observability(可观测性)
          → Verification(验证评估)
            → Governance(治理安全)
\`\`\`

| 层 | 职责 | 对应实践 |
|---|---|---|
| Execution | 安全执行环境(沙盒、容器) | Docker、VM、WSL2 |
| Tooling | 工具接口设计 | MCP、Function Call、ACI |
| Context | 上下文与记忆管理 | 压缩、笔记、多智能体(见 Context Engineering) |
| Lifecycle | 循环编排与停止条件 | Agent Loop、checkpoint |
| Observability | 行为可观测 | 日志、trace、LLM 可观测平台 |
| Verification | 产出验证 | 测试、审查、HITL |
| Governance | 权限与安全治理 | RBAC、审批、审计 |

**关键洞察**(社区引用):有研究发现只改编辑工具格式与周边 harness、不改模型,编码 benchmark 最高带来 **10 倍提升**;固定模型重构 system prompt + 自验证 hooks,Terminal-Bench 2.0 从 52.8% 提升到 66.5%。

---

## 8. Agent 记忆架构

### 8.1 记忆分层(认知科学视角)

| 记忆类型 | 对应机制 | 实现 |
|---|---|---|
| **工作记忆** | 上下文窗口(有限、易腐烂) | 当前对话 tokens |
| **长期记忆** | 外部持久存储 | 数据库、文件系统、向量库 |
| **情景记忆** | 具体经验事件 | 会话历史、反思记录 |
| **程序性记忆** | 技能/规则/工作流 | Skill、CLAUDE.md、hooks |

> "记忆是 Harness 的持久仓库,上下文是其临时工作台。" —— 记忆综述(arXiv:2404.13501)

### 8.2 MemGPT / Letta:虚拟上下文管理

类比 OS 虚拟内存分页(Packer et al., 2023, arXiv:2310.08560):
- 主上下文(类似 RAM)+ 外部存储(类似磁盘)
- Agent 用函数调用做内存**换入/换出**,突破上下文窗口限制
- 实现:跨会话聊天、超窗口文档分析

### 8.3 记忆与 Skill 的关系

- **Skill = 程序性记忆**:把"做某事的方法"封装为可复用模块(详见 [LLM_Skills_Wiki.md](LLM_Skills_Wiki.md))
- **CLAUDE.md = 长期记忆的显式形态**(详见 [LLM_Wiki.md](LLM_Wiki.md))
- 三者组合构成 Agent 的完整记忆体系

---

## 9. 2025-2026 最新进展

| 进展 | 内容 | 意义 |
|---|---|---|
| **Harness Engineering 成为显学** | OpenAI 2026-02 发布《Harness Engineering: Leveraging Codex in an Agent-First World》:3 名工程师 5 个月零手写代码构建百万行级产品(1500+ PR) | 社区共识:"模型是天花板,Harness 是地板" |
| **Agent 评测批判** | "AI Agents That Matter"(arXiv:2407.01502):SOTA agent 无谓复杂昂贵、基准缺 holdout 集、评测不可复现 | 推动 cost-accuracy 联合优化,警惕基准过拟合 |
| **多智能体协作系统化** | 协作机制综述(arXiv:2501.06322):actors/types/structures/strategies/protocols 五维框架 | 多 Agent 编排(如 orchestrator-workers)成为标准 |
| **记忆工程产品化** | Mem0(arXiv:2504.19413)等生产级长期记忆框架 | 记忆成为 Agent 基础设施标配 |
| **工具编写方法论** | Anthropic《Writing effective tools for LLM agents》,强调 ACI(Agent-Computer Interface) | 工具接口设计成为独立学科 |
| **产业热度** | 2025 被称为"Agent 元年";Agent 论文年产量 2025-2026 接近 1800 篇 | 方法论快速演进,需持续关注 |

---

## 10. 为 Agent 生成的可执行框架

### 10.1 Agent 系统设计自查清单

\`\`\`markdown
## Agent 设计自查
□ 这个任务能用 Workflow 解决吗?(能 → 别用 Agent)
□ 循环是否有明确的停止条件?(目标判定 or 最大迭代数)
□ 每步是否有外部 ground truth 反馈?(非模型自评)
□ 上下文会随循环膨胀吗?(→ 需要压缩/笔记/子代理)
□ 执行与验证是否分离?(执行者 ≠ 评估者)
□ 是否设置了权限边界与治理?(Governance)
□ 失败路径是否有护栏?(沙盒、HITL 检查点)
\`\`\`

### 10.2 架构选型决策树

\`\`\`text
任务步骤可预测吗?
├─ 可预测 → Workflow
│    ├─ 单一路径 → Prompt chaining
│    ├─ 输入可分类 → Routing
│    ├─ 子任务独立 → Parallelization
│    └─ 有明确评估标准 → Evaluator-optimizer
└─ 不可预测 → Agent
     ├─ 子任务未知 → Orchestrator-workers
     └─ 单 Agent 自主 → ReAct Loop / Plan-and-Execute
\`\`\`

### 10.3 供 Agent 生成新框架的元规则

1. **闭环优先**:任何 Agent 必须有"推理 → 行动 → 观察"的完整闭环,缺一环即退化为 Chat
2. **外部锚定**:进度评估、反思、验证必须锚定环境反馈,禁止纯主观自评
3. **显式停止**:设计目标判定与最大迭代双保险
4. **上下文预算**:为循环预估上下文增长,提前布置压缩/外化方案
5. **护栏先行**:权限、沙盒、HITL 检查点必须在动手前定义

---

## 11. 生态与资源

### GitHub 仓库
- [anthropics/anthropic-quickstarts](https://github.com/anthropics/anthropic-quickstarts)(Agent Loop 参考实现)
- [Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness)(170+ 项目映射)
- [letta-ai/letta](https://github.com/letta-ai/letta)(原 MemGPT,虚拟上下文)
- [mem0ai/mem0](https://github.com/mem0ai/mem0)(记忆层)
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)(状态图编排)

### 论文(编号已核实)
- ReAct:[arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- Reflexion:[arXiv:2303.11366](https://arxiv.org/abs/2303.11366)
- MemGPT:[arXiv:2310.08560](https://arxiv.org/abs/2310.08560)
- Plan-and-Solve Prompting:[arXiv:2305.04091](https://arxiv.org/abs/2305.04091)
- AI Agents That Matter:[arXiv:2407.01502](https://arxiv.org/abs/2407.01502)
- Multi-Agent Collaboration Survey:[arXiv:2501.06322](https://arxiv.org/abs/2501.06322)
- Memory Mechanism Survey:[arXiv:2404.13501](https://arxiv.org/abs/2404.13501)

### 官方文档
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Agent Harness Engineering: A Survey(OpenReview PDF)](https://openreview.net/pdf/f358711a95aaaf61fdeffd4ef3fc60fba9b8da57.pdf)

---

## 12. 参考来源

- Yao et al. — *ReAct: Synergizing Reasoning and Acting in Language Models*(ICLR 2023): <https://arxiv.org/abs/2210.03629>
- Shinn et al. — *Reflexion: Language Agents with Verbal Reinforcement Learning*(NeurIPS 2023): <https://arxiv.org/abs/2303.11366>
- Packer et al. — *MemGPT: Towards LLMs as Operating Systems*: <https://arxiv.org/abs/2310.08560>
- Anthropic — *Building effective agents*: <https://www.anthropic.com/engineering/building-effective-agents>
- *Agent Harness Engineering: A Survey*(OpenReview): <https://openreview.net/pdf?id=eONq7FdiHa>
- Kapoor et al. — *AI Agents That Matter*: <https://arxiv.org/abs/2407.01502>
- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:三阶段迁移框架、ETCLOVG、ReAct 三步法、五大核心认知
- 社区解读:ETCLOVG 七层深度解读、多智能体协作综述(见 §11)

---

*本文档由 arXiv 一手论文(编号逐条核实)、Anthropic/OpenAI 官方博客与社区高浏览量文章综合而成。注明:Agent Harness Engineering 综述的 arXiv 编号在网络上存在误传,可靠链接以 OpenReview 为准。*
`;export{n as default};
