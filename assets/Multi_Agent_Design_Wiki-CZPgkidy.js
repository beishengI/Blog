const n=`# LLM Wiki — 多智能体(Multi-Agent)协作设计

> 面向 LLM Agent 的**多智能体协作设计**系统性知识库:从架构模式(Orchestrator-Workers/Debate/Ensemble/Specialist)、核心论文、工程框架对比,到成本与风险(15 倍 token 膨胀、错误传播、循环失控)、设计最佳实践与 2025-2026 最新进展。
>
> 定位:本文档是"Agent 上下文知识体系"的**协作编排层**——[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §6.2 的 Orchestrator-workers 模式在此纵深展开。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已逐条核实并勘误)、Anthropic/OpenAI 官方博客、GitHub 高星仓库

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [架构模式](#2-架构模式)
3. [核心论文](#3-核心论文)
4. [工程框架对比](#4-工程框架对比)
5. [成本与风险](#5-成本与风险)
6. [设计最佳实践](#6-设计最佳实践)
7. [2025-2026 最新进展](#7-2025-2026-最新进展)
8. [为 Agent 生成的可执行框架](#8-为-agent-生成的可执行框架)
9. [生态与资源](#9-生态与资源)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

多智能体能处理单 Agent 无法承载的任务(信息超窗、并行需求),但也带来成倍的 token 消耗、错误传播与失控风险。本文档提供**从模式选型到落地护栏**的完整方法论。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:选多智能体架构 → §2 模式对比 → §8.1 决策树
目标:评估成本/风险 → §5 成本与风险 → §6 最佳实践
目标:选工程框架 → §4 框架对比 → §8.2 选型清单
\`\`\`

### 1.3 一句话核心结论

> **能单 Agent 就不上多 Agent。** 多智能体仅用于高价值、强并行的任务——代价是约 15 倍的 token 消耗与失控风险。

---

## 2. 架构模式

### 2.1 模式总览

| 模式 | 机制 | 适用场景 | 优点 | 缺点 |
|---|---|---|---|---|
| **Orchestrator-Workers** | 编排者拆解任务、分派并汇总;Workers 并行执行(各自独立上下文) | 高价值、强并行、信息超单窗 | 可扩展 token 预算、关注点分离 | token 消耗大(约聊天 15 倍)、编排者单点瓶颈 |
| **Pipeline(顺序链)** | 前一 agent 输出喂给后一 agent | 步骤可预测的稳定流程 | 简单可控、可逐步调试 | 延迟累加、无法并行 |
| **Debate(辩论)** | 多实例就同一问题辩论多轮后收敛 | 事实性/推理任务 | 抑制幻觉、提升正确性 | token 成倍、可能不收敛 |
| **Ensemble(投票)** | 多实例独立推理后聚合投票 | 有客观答案的任务 | 提升稳定性 | 多样性不足时增益有限 |
| **Specialist 分工** | planner/executor/critic/verifier 各司其职 | 代码生成、写作等需多轮校验 | 职责清晰 | 角色间协作开销 |

### 2.2 通信模式

| 模式 | 特点 | 代表 |
|---|---|---|
| **共享消息/群聊** | 所有 agent 在同一对话空间 | AutoGen |
| **Handoffs(交接)** | 显式任务交接,控制流清晰 | Swarm/LangGraph |
| **层级(supervisor)** | 上级控制下级,可控性强 | Claude Agent Teams |
| **扁平(network)** | 自由通信,灵活但易失控 | 研究型系统 |

---

## 3. 核心论文

| 论文 | 核心贡献 | arXiv |
|---|---|---|
| **Multi-Agent Collaboration Survey** | LLM 多智能体协作机制综述 | [2501.06322](https://arxiv.org/abs/2501.06322) |
| **Generative Agents** | 斯坦福"小镇"模拟;记忆-反思-规划架构;涌现社交行为 | [2304.03442](https://arxiv.org/abs/2304.03442) |
| **CAMEL** | 角色扮演(user/assistant)启发式交互,开启多智能体模拟先河 | [2303.17760](https://arxiv.org/abs/2303.17760) |
| **AutoGen** | 微软对话式多智能体框架 | [2308.08155](https://arxiv.org/abs/2308.08155) |
| **Multi-Agent Debate** | 辩论提升事实性与推理(ICML 2024) | [2305.14325](https://arxiv.org/abs/2305.14325) |
| **SOTOPIA** | 开放社交场景模拟 + SOTOPIA-Eval 评测 | [2310.11667](https://arxiv.org/abs/2310.11667) |
| **Magentic-One** | 微软通用编排系统;GAIA/WebArena 达 SOTA 相当水平 | [2411.04468](https://arxiv.org/abs/2411.04468) |
| **AgentBench** | 清华 8 环境评测 LLM-as-Agent(ICLR 2024) | [2308.03688](https://arxiv.org/abs/2308.03688) |
| **MultiAgentBench** | UIUC 首个覆盖协作与竞争的多智能体基准 | [2503.01935](https://arxiv.org/abs/2503.01935) |

> ⚠️ 勘误说明:SOTOPIA 的 arXiv 编号为 **2310.11667**(网上流传的 2310.11634 实为 MAGNIFICo 论文)。

---

## 4. 工程框架对比

| 框架 | 出品 | 特点 | star(约,2025-26) |
|---|---|---|---|
| **AutoGen** | 微软 | 对话/群聊驱动;**2026 初转维护模式**,并入 Microsoft Agent Framework | 约 5.4 万 |
| **LangGraph** | LangChain | 有向图状态机,层级/网络拓扑;2025.10 GA 1.0,生产级(Klarna/Uber 等) | 约 2-3.4 万 |
| **CrewAI** | 社区 | 角色/团队抽象,上手快 | 约 3.8-4 万 |
| **Mastra** | 社区 | TypeScript 原生;agents+workflows+MCP | 万级 |
| **OpenHands** | All-Hands-AI | 前身 OpenDevin;AI 软件工程师平台(CodeAct) | 约 7.2-7.6 万 |
| **OpenAI Swarm→Agents SDK** | OpenAI | Swarm 为实验(handoffs);Agents SDK(2025.3)生产级,guardrails/tracing | 约 1.5 万+ |
| **Claude Code Agent Teams** | Anthropic | Team Lead + Teammates;独立上下文 + 直接通信 + 共享看板 + checkpoint | 官方功能 |

---

## 5. 成本与风险

### 5.1 Token 膨胀(Anthropic 官方量化)

| 形态 | 消耗量级 |
|---|---|
| 普通聊天 | 1× |
| 单 agent | 约 4× |
| **多 agent 系统** | **约 15×** |

> BrowseComp 分析中,token 消耗量单独解释 80% 的性能差异(三因素合计 95%)——**多智能体的性能提升与 token 成本强相关**。

### 5.2 风险清单

| 风险 | 表现 | 对策 |
|---|---|---|
| **错误传播** | agent 是有状态系统,错误会累积,轻微故障可能灾难性放大 | 持久化状态 + 断点恢复 |
| **循环失控** | 实测早期 agent 为简单问题生成 50 个子智能体、无休止搜索不存在资源、互发过多无关消息 | 停止条件 + 消息上限 |
| **上下文污染** | 共享上下文时并行收益消失 | 各 agent 独立上下文 |
| **同步瓶颈** | 同步执行拖慢整体 | 并行工具调用(Anthropic 引入后研究时间缩短 90%) |
| **成本失控** | 2026.2 Carlini 实验:16 个 Claude 并行约 2000 sessions 从零写 10 万行 C 编译器,成本约 2 万美元 | 预算硬上限 |

> 行业观察:约 40% 多 agent 试点上线半年内失败(社区数据,谨慎引用)。

---

## 6. 设计最佳实践

### 6.1 任务拆分(Anthropic 经验)

- 给每个 worker 明确:**目标、输出格式、工具指引、任务边界**
- 模糊指令(如"研究芯片短缺")导致 60% 重复产出

### 6.2 分级投入

\`\`\`text
简单事实查询     → 1 agent × 3-10 次工具
对比类任务       → 2-4 个 worker × 10-15 次
复杂研究         → 10+ worker
\`\`\`

### 6.3 并行化

- 3-5 个 worker 同时创建
- 每 worker 并行 3+ 工具调用

### 6.4 验证环节

- 小样本(约 20 例)起步
- LLM-as-judge 单次调用评分(事实准确性/引用/完整性/源质量/工具效率)
- 人工评估补充边缘案例

### 6.5 HITL 检查点

- checkpoint 恢复、彩虹部署
- 工具描述自改进(测试后重写描述缩短 40% 任务时间)

### 6.6 第一性原则(Anthropic 官方)

> 先从最简方案开始,能单 agent 就不上多 agent;多 agent 仅用于高价值并行任务。

---

## 7. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **Anthropic 多智能体研究系统**(2025.6) | 比单 Claude Opus 4 强 90.2%,确立 token 预算与性能的量化关系 |
| **Claude Code Agent Teams** | Leader/Teammates 协作、checkpoint 断点恢复;官方《harness design for long-running application development》(2026.3) |
| **Cursor 3.0** | Agents Window:并行 8 agents + git worktrees;《scaling long-running agents》报告(2026.3) |
| **OpenAI** | Agents SDK 开源;Codex Multi-Agent 角色化工作流 |
| **微软** | 2025 末 AutoGen 与 Semantic Kernel 合并为 **Microsoft Agent Framework(MAF 1.0)** 生产可用 |

> ⚠️ 注:"OpenAI 百万行代码实验"未能核实到权威来源,本文以 Anthropic C 编译器案例(16 Claude 并行、10 万行、约 2 万美元)等已核实案例为准。

---

## 8. 为 Agent 生成的可执行框架

### 8.1 架构选型决策树

\`\`\`text
任务价值高且可并行?
├─ 否 → 单 Agent(别上多智能体)
└─ 是 →
    ├─ 步骤可预测 → Pipeline
    ├─ 需对抗幻觉/有客观答案 → Debate / Ensemble
    ├─ 需多角色校验 → Specialist(planner/executor/critic/verifier)
    └─ 信息超单窗、强并行 → Orchestrator-Workers
\`\`\`

### 8.2 多智能体系统自查清单

\`\`\`markdown
## 多智能体系统自查
□ 是否真的需要多智能体?(能单 agent 就别上)
□ 每个 worker 是否有明确目标/输出格式/任务边界?
□ 是否有停止条件与消息上限?(防循环失控)
□ token 预算是否设硬上限?
□ 状态是否持久化?(错误可恢复)
□ 各 agent 是否独立上下文?(防上下文污染)
□ 是否有验证环节(LLM-as-judge + 人工补充)?
□ 是否有 HITL checkpoint?
\`\`\`

### 8.3 供 Agent 生成多智能体框架的元规则

1. **最简优先**:单 agent 解决不了再升级,别为架构而架构
2. **明确契约**:每个 agent 的输入/输出/边界写死
3. **预算封顶**:token 与轮次硬上限,防失控
4. **独立上下文**:agent 间不共享上下文,通信走结构化消息
5. **验证分离**:执行与验证角色分离,judge 不参与执行
6. **可恢复**:checkpoint + 持久化状态,错误可回滚

---

## 9. 生态与资源

### GitHub 仓库
- [microsoft/autogen](https://github.com/microsoft/autogen)(约 5.4 万)
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)(约 3.8-4 万)
- [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands)(约 7.2-7.6 万)
- [openai/swarm](https://github.com/openai/swarm)(约 1.5 万+)
- [THUDM/AgentBench](https://github.com/THUDM/AgentBench)

### 官方文档与博客
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic — Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Anthropic — C compiler with a team of parallel Claudes](https://www.anthropic.com/news/building-a-c-compiler-with-a-team-of-parallel-claudes)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)

### 论文(编号已核实并勘误)
- 见 §3 表格全部链接

---

## 10. 参考来源

- arXiv 论文(编号逐条核实;SOTOPIA 勘误为 2310.11667)
- Anthropic/OpenAI 官方博客与文档
- GitHub 仓库 star(2025-26 近似区间,标"约")
- 关联文档:[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §6(Workflows)、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) §6.3(多智能体上下文技术)

---

*本文档由 arXiv 一手论文(编号逐条核实并勘误)、Anthropic/OpenAI 官方博客与 GitHub 数据综合而成。token 消耗数据(4×/15×)引自 Anthropic 官方;行业失败率属社区数据,谨慎引用。*
`;export{n as default};
