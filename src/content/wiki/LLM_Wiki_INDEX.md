# LLM Wiki 知识库 — 总索引与阅读指南

> 本目录下的 LLM 知识库集合,覆盖 Agent 构建与使用中的**理论、上下文、记忆、技能、安全、可观测、工具选型、开发流程、质量保障、检索、协作编排、工程全景、评测、协同进化、国产工具链、经济性**十六大核心领域。本索引用于:
> 1. **Agent 阅读导航**:让 Agent 按主题快速定位所需知识;
> 2. **知识共享**:给人(团队协作)与机器(Agent 学习)提供统一入口;
> 3. **框架生成**:作为 Agent 生成新框架时的知识地图;
> 4. **执行计划**:指引下一步知识扩展方向(§6)。
>
> 版本:v7.8 ｜ 资料截至 2026-08

---

## 1. 文档地图(共 30 篇)

### 理论层(理解 Agent 为什么这样运转)

| 文档 | 主题 | 核心问题 | 读者 |
|---|---|---|---|
| [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) | **Agent 核心架构** | Agent 由什么构成、如何运转?ReAct/Agent Loop/workflow/ETCLOVG | Agent / 开发者 |
| [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) | **Agent Harness 详解** | 怎么让 Agent 可靠干活?ETCLOVG 七层 + Harness 自动合成 | Agent / 开发者 |
| [Harness_Model_CoEvolution_Wiki.md](Harness_Model_CoEvolution_Wiki.md) | **Harness×模型协同进化** | harness 与模型如何互相塑造?"模型吃 harness"之争 | Agent / 研究者 |
| [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) | **上下文工程** 系统化框架 | 怎么系统性地管好上下文? | Agent / 开发者 |
| [Context_Rot_Wiki.md](Context_Rot_Wiki.md) | **上下文腐烂** 深入讲解 | 上下文为什么越用越烂?如何测量、防御? | Agent / 开发者 / RAG 工程师 |
| [Agent_Memory_Wiki.md](Agent_Memory_Wiki.md) | **Agent 记忆系统** 深度解析 | 记忆怎么分层、怎么选框架? | Agent / 开发者 |
| [Memory_Engineering_Wiki.md](Memory_Engineering_Wiki.md) | **记忆系统工程化** | 记忆生产级怎么做?冲突/编辑/评估/防坑 | Agent / 开发者 |
| [Memory_Security_Wiki.md](Memory_Security_Wiki.md) | **记忆安全与对抗** | 记忆投毒/提取攻击怎么防? | 安全工程师 / 开发者 |
| [Prompt_Engineering_Wiki.md](Prompt_Engineering_Wiki.md) | **Prompt Engineering** 方法论 | 怎么对模型说话?CoT/ToT/官方方法/程序化优化 | Agent / 开发者 |
| [Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md) | **可观测性与安全治理** | 怎么"看得见"与"管得住"Agent?三支柱 + OWASP 全谱 | 开发者 / 安全工程师 |

### 选型与工具层(用什么工具干活)

| 文档 | 主题 | 核心问题 | 读者 |
|---|---|---|---|
| [Agent_Tools_Selection_Wiki.md](Agent_Tools_Selection_Wiki.md) | **Agent 工具生态与选型** | Claude Code/Codex/Hermes/OpenClaw/Cursor 怎么选?怎么配合? | 所有人 |
| [Domestic_Toolchain_Wiki.md](Domestic_Toolchain_Wiki.md) | **国产工具链对比分析** | TRAE/Kimi Code/DeepSeek Harness/通义灵码 怎么选?与国外差距在哪? | 所有人 |

### 流程方法论层(怎么把活干好)

| 文档 | 主题 | 核心问题 | 读者 |
|---|---|---|---|
| [Vibe_Coding_Methodology_Wiki.md](Vibe_Coding_Methodology_Wiki.md) | **Vibe Coding 防屎山方法论** | 如何避免 AI 写出屎山?文档优先/审问/五阶段 | 开发者 |
| [Research_Agent_Workflow_Wiki.md](Research_Agent_Workflow_Wiki.md) | **科研 Agent 工作流** | 科研项目如何用 Agent 从 0 到 1? | 科研人员 |
| [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md) | **AI 编码质量防线** | 如何让 AI 用证据证明"做完了"? | 开发者 |
| [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) | **RAG 实战全链路** | RAG 系统怎么从数据到评估完整落地? | RAG 工程师 / 开发者 |
| [Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md) | **Agentic RAG 深入实战** | LLM 自主检索怎么做?模式/框架/护栏 | RAG 工程师 / 开发者 |
| [Graph_RAG_Deep_Dive_Wiki.md](Graph_RAG_Deep_Dive_Wiki.md) | **Graph RAG 深入实战** | 何时用 Graph RAG?怎么落地?成本如何? | RAG 工程师 / 开发者 |
| [Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) | **多智能体协作设计** | 多 agent 怎么协作?模式/框架/成本与风险 | Agent / 开发者 |
| [Multi_Agent_Protocol_Wiki.md](Multi_Agent_Protocol_Wiki.md) | **多智能体通信协议** | MCP/A2A/Handoffs 怎么选?怎么实现? | Agent / 开发者 |
| [Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md) | **多智能体安全与滥用** | 注入传播/流氓代理/级联失败怎么防? | 安全工程师 / Agent |
| [Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md) | **多智能体评测与基准** | 多 agent 系统怎么测?基准怎么选?方法学批判 | Agent / 开发者 |
| [Agent_Benchmarks_Wiki.md](Agent_Benchmarks_Wiki.md) | **评测基准盘点** | 有哪些评测基准、各测什么、怎么选、怎么防被分数骗? | Agent / 开发者 / 团队 |
| [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md) | **评估基础设施搭建** | 怎么建自己的评估体系?Golden Set/Judge/门禁 | 开发者 / 团队 |
| [Prompt_Optimization_Practice_Wiki.md](Prompt_Optimization_Practice_Wiki.md) | **Prompt 自动优化实战** | DSPy 怎么落地?何时程序化 vs 手工? | Agent / 开发者 |
| [Domain_Deployment_Wiki.md](Domain_Deployment_Wiki.md) | **领域落地实战** | 金融/法律/医疗怎么落地?合规/溯源/评测 | 行业开发者 |
| [Agent_Economics_Wiki.md](Agent_Economics_Wiki.md) | **Agent 经济性** | token 成本怎么算、怎么控?成本-精度怎么权衡? | 开发者 / 团队负责人 |
| [Hallucination_Governance_Wiki.md](Hallucination_Governance_Wiki.md) | **幻觉治理专题** | 幻觉成因/检测/缓解怎么全谱治理? | Agent / 开发者 / RAG 工程师 |

### 文件规范与能力封装层(把知识落盘)

| 文档 | 主题 | 核心问题 | 读者 |
|---|---|---|---|
| [LLM_Wiki.md](LLM_Wiki.md) | **上下文文件** 编写指南 | CLAUDE.md / AGENTS.md 怎么写? | 项目维护者 |
| [LLM_Skills_Wiki.md](LLM_Skills_Wiki.md) | **Agent Skills** 完全指南 | Skill 是什么、怎么写、怎么选? | Agent / 开发者 |

## 2. 知识主题图谱

```text
                             ┌─────────────────────────────────────┐
                             │      Agent 上下文知识体系            │
                             └─────────────────────────────────────┘
             ┌──────────────────────┬───────────────────┬──────────────────────┐
             │                      │                   │                      │
         理论层                 选型与工具层          流程方法论层          规范/能力封装层
 ┌────────────────┐      ┌──────────────┐     ┌───────────────┐       ┌──────────────┐
 │Agent_Architect  │      │ Agent_Tools_  │     │ Vibe_Coding_  │       │  LLM_Wiki    │
 │ure_Wiki(引擎)   │      │ Selection_Wiki│     │ Methodology_  │       │ (上下文文件)  │
 │Agent_Harness_  │      │ (怎么选)      │     │ Wiki(防屎山)   │       │  LLM_Skills_ │
 │Engin_Wiki(干)  │      │ Domestic_Tool-│     │ Research_     │       │  Wiki(Skill) │
 │Harness_Model_  │      │ chain_Wiki    │     │ Agent_Workflow│       │              │
 │CoEvol_Wiki(进) │      │ (国产选型)    │     │ _Wiki(科研)    │       │              │
 │Context_Engin-   │      │              │     │ AI_Coding_    │       │              │
 │eering_Wiki(管)  │      │              │     │ Quality_Gate_ │       │              │
 │Context_Rot_Wik  │      │              │     │ Wiki(质量)     │       │              │
 │i(诊断)          │      │              │     │ RAG_Practice_ │       │              │
 │Agent_Memory_    │      │              │     │ Wiki(检索)     │       │              │
 │Memory_Engin-    │      │              │     │ Agentic_RAG_  │       │              │
 │eering_Wiki(工)  │      │              │     │ Wiki(智能检索) │       │              │
 │Memory_Security_ │      │              │     │ Graph_RAG_    │       │              │
 │Wiki(安全)       │      │              │     │ Deep_Dive_Wiki│       │              │
 │Prompt_Engin-    │      │              │     │ Multi_Agent_  │       │              │
 │eering_Wiki(说)  │      │              │     │ Design_Wiki   │       │              │
 │Agent_Observab-  │      │              │     │ (协作)         │       │              │
 │ility_Wiki(察)   │      │              │     │ Multi_Agent_  │       │              │
 │                 │      │              │     │ Protocol_Wiki │       │              │
 │                 │      │              │     │ (通信)         │       │              │
 │                 │      │              │     │ Multi_Agent_  │       │              │
 │                 │      │              │     │ Security_Wiki │       │              │
 │                 │      │              │     │ (安全)         │       │              │
 │                 │      │              │     │ Multi_Agent_  │       │              │
 │                 │      │              │     │ Evaluation_   │       │              │
 │                 │      │              │     │ Wiki(评测)     │       │              │
 │                 │      │              │     │ Agent_Bench-  │       │              │
 │                 │      │              │     │ marks_Wiki    │       │              │
 │                 │      │              │     │ (盘点)         │       │              │
 │                 │      │              │     │ Eval_Infra-   │       │              │
 │                 │      │              │     │ structure_Wiki│       │              │
 │                 │      │              │     │ (评估基建)     │       │              │
 │                 │      │              │     │ Prompt_Opti-  │       │              │
 │                 │      │              │     │ mization_Wiki │       │              │
 │                 │      │              │     │ (提示优化)     │       │              │
 │                 │      │              │     │ Domain_Depl-  │       │              │
 │                 │      │              │     │ oyment_Wiki   │       │              │
 │                 │      │              │     │ (领域落地)     │       │              │
 │                 │      │              │     │ Agent_Econom- │       │              │
 │                 │      │              │     │ ics_Wiki(算账) │       │              │
 │                 │      │              │     │ Hallucination_│       │              │
 │                 │      │              │     │ Governance_    │       │              │
 │                 │      │              │     │ Wiki(幻觉治理)    │       │              │
 └────────────────┘      └──────────────┘     └───────────────┘       └──────────────┘
```

**主题关联矩阵**(交叉引用速查):

| 需要解决的问题 | 主文档 | 关联文档 |
|---|---|---|
| 理解 Agent 为什么能动起来 | Agent_Architecture_Wiki | Context_Engineering_Wiki |
| 设计生产级 Agent 执行环境 | Agent_Harness_Engineering_Wiki 全文 | Multi_Agent_Design_Wiki、AI_Coding_Quality_Gate_Wiki |
| 让 AI 自己设计 harness | Agent_Harness_Engineering_Wiki §15 | Prompt_Engineering_Wiki §4(DSPy/OPRO) |
| 模型与 harness 谁吃掉谁 | Harness_Model_CoEvolution_Wiki 全文 | Agent_Harness_Engineering_Wiki §15 |
| 会话变长,模型变蠢 | Context_Rot_Wiki §5、§8 | Context_Engineering_Wiki §6 |
| 想系统性管理上下文 | Context_Engineering_Wiki 全文 | Context_Rot_Wiki §7 |
| 设计记忆系统/选记忆框架 | Agent_Memory_Wiki 全文 | Agent_Architecture_Wiki §8 |
| 记忆生产级落地 | Memory_Engineering_Wiki 全文 | Agent_Memory_Wiki §5、Memory_Security_Wiki |
| 记忆投毒/提取防御 | Memory_Security_Wiki 全文 | Agent_Memory_Wiki §7 |
| 写 system prompt / 推理提示 | Prompt_Engineering_Wiki 全文 | Context_Engineering_Wiki §4 |
| DSPy 落地 / 何时程序化优化 | Prompt_Optimization_Practice_Wiki 全文 | Prompt_Engineering_Wiki §4、Harness §15 |
| 强监管行业落地 | Domain_Deployment_Wiki 全文 | RAG_Practice、Graph_RAG、Agentic_RAG |
| "看得见"Agent 行为 | Agent_Observability_Security_Wiki §2-4 | Agent_Harness_Engineering_Wiki §9(O) |
| "管得住"Agent 行为 | Agent_Observability_Security_Wiki §5-7 | Memory_Security_Wiki §5-6 |
| 选编码工具/常驻 Agent | Agent_Tools_Selection_Wiki 全文 | Agent_Architecture_Wiki §2 |
| 国产工具链选型/信创 | Domestic_Toolchain_Wiki 全文 | Agent_Tools_Selection_Wiki §6 |
| 避免 AI 写出屎山 | Vibe_Coding_Methodology_Wiki 全文 | AI_Coding_Quality_Gate_Wiki |
| 让 AI 证明"做完了" | AI_Coding_Quality_Gate_Wiki 全文 | Vibe_Coding_Methodology_Wiki §7 |
| 科研项目从 0 到 1 | Research_Agent_Workflow_Wiki 全文 | Context_Engineering_Wiki §6.2 |
| 搭建/优化 RAG 系统 | RAG_Practice_Wiki 全文 | Context_Rot_Wiki §7.4 |
| LLM 自主检索怎么做 | Agentic_RAG_Wiki 全文 | RAG_Practice_Wiki §8、Agent_Architecture_Wiki §3 |
| 全局性问题/连接点查询 | Graph_RAG_Deep_Dive_Wiki 全文 | RAG_Practice_Wiki §8 |
| 多 agent 协作设计 | Multi_Agent_Design_Wiki 全文 | Agent_Architecture_Wiki §6 |
| 多 agent 通信协议选型 | Multi_Agent_Protocol_Wiki 全文 | Multi_Agent_Design_Wiki §4 |
| 多 agent 安全防护 | Multi_Agent_Security_Wiki 全文 | Memory_Security_Wiki、Agent_Observability_Security_Wiki §5-7 |
| 多 agent 系统怎么测 | Multi_Agent_Evaluation_Wiki 全文 | Multi_Agent_Design_Wiki §3 |
| 盘点全领域评测基准/选基准 | Agent_Benchmarks_Wiki 全文 | Multi_Agent_Evaluation_Wiki §2、Eval_Infrastructure_Wiki |
| Agent 成本预算/成本优化 | Agent_Economics_Wiki 全文 | Multi_Agent_Design_Wiki §5、Eval_Infrastructure_Wiki |
| 写项目上下文文件 | LLM_Wiki 全文 | Context_Rot_Wiki §9.4 |
| 把工作流固化复用 | LLM_Skills_Wiki 全文 | Context_Engineering_Wiki §7.2 |
| RAG 检索噪声大 | RAG_Practice_Wiki §5-7 | Context_Rot_Wiki §7.4 |
| 长时任务 Agent 设计 | Context_Engineering_Wiki §6 | Agent_Architecture_Wiki §4 |
| 幻觉成因/检测/缓解全谱 | Hallucination_Governance_Wiki 全文 | Context_Rot_Wiki §7、RAG_Practice_Wiki §5-7、Eval_Infrastructure_Wiki |

## 3. 阅读顺序建议

### 3.1 面向 Agent 的推荐阅读路径

```text
第一次接触 → LLM_Wiki_INDEX(本文) → Agent_Architecture_Wiki §2-4(引擎)
          → Prompt_Engineering_Wiki §2-3(怎么说)→ Context_Engineering_Wiki §3(看什么)
          → Context_Rot_Wiki §2、§7(腐烂与防御)→ Agent_Memory_Wiki §2-4(记忆)
          → Memory_Security_Wiki §2-6(安全)
          → Agent_Harness_Engineering_Wiki §2-3、§15(工程全景与自动合成)
          → Agent_Observability_Security_Wiki §2-7(察与管)
          → Multi_Agent_Design_Wiki §2-4(协作)→ Multi_Agent_Security_Wiki §2-5(协作安全)
          → Agent_Economics_Wiki §2-5(算账)
          → Agent_Benchmarks_Wiki §3-11(评测基准盘点)
          → Harness_Model_CoEvolution_Wiki §2-4(前沿)
          → 按任务主题选读其余文档
```

### 3.2 面向不同任务场景

| 场景 | 推荐阅读 |
|---|---|
| 排查"上下文腐烂"故障 | Context_Rot_Wiki §5 + §9 |
| 设计长时任务 Agent | Context_Engineering_Wiki §6 + Context_Rot_Wiki §7 |
| 设计生产级 Agent 执行环境 | Agent_Harness_Engineering_Wiki §4-11(七层)+ §16(清单) |
| 自动优化 harness | Agent_Harness_Engineering_Wiki §15(Meta-Harness/AutoHarness) |
| 判断模型/harness 演进方向 | Harness_Model_CoEvolution_Wiki §6(争议)+ §7(时间线) |
| 搭建可观测体系 | Agent_Observability_Security_Wiki §3(平台)+ §4(OTel)+ §9(清单) |
| 安全治理落地 | Agent_Observability_Security_Wiki §5-7 + §9(清单) |
| 设计记忆系统 | Agent_Memory_Wiki §5(生命周期)+ §9(框架) |
| 记忆安全加固 | Memory_Security_Wiki §6(分层防御)+ §8(清单) |
| 写 system prompt | Prompt_Engineering_Wiki §3(官方方法)+ §7(模板) |
| 选工具(编码/常驻/框架) | Agent_Tools_Selection_Wiki §6(决策框架) |
| 国产工具选型/信创合规 | Domestic_Toolchain_Wiki §6(选型建议)+ §9(自查) |
| 搭建 RAG 系统 | RAG_Practice_Wiki §3-7(全链路)+ §9(评估) |
| LLM 自主检索(Agentic RAG) | Agentic_RAG_Wiki §3(模式)+ §4(框架)+ §8(清单) |
| 全局性问题/连接点查询 | Graph_RAG_Deep_Dive_Wiki §3(全流程)+ §9(选型) |
| 多 agent 协作设计 | Multi_Agent_Design_Wiki §2(模式)+ §6(最佳实践) |
| 多 agent 通信落地 | Multi_Agent_Protocol_Wiki §3-6(协议实现) |
| 多 agent 安全加固 | Multi_Agent_Security_Wiki §5(防御体系)+ §9(自查) |
| 多 agent 系统评测 | Multi_Agent_Evaluation_Wiki §3(专项基准)+ §6(实践指南) |
| 选评测基准/读榜单分数 | Agent_Benchmarks_Wiki §10(横评表)+ §11(选型)+ §13(自查) |
| 成本预算与优化 | Agent_Economics_Wiki §4(测算)+ §5(优化)+ §8(自查) |
| 新项目初始化上下文文件 | LLM_Wiki §10(模板)+ Vibe_Coding_Methodology_Wiki §3 |
| 开发自定义 Skill | LLM_Skills_Wiki §5(最佳实践) |
| 科研项目启动 | Research_Agent_Workflow_Wiki §8(从 0 到 1) |
| 交付前质量把关 | AI_Coding_Quality_Gate_Wiki §10(检查清单) |
| 评估模型/基准 | Agent_Benchmarks_Wiki 全文 + Multi_Agent_Evaluation_Wiki §4 |
| 治理幻觉/构建低幻觉系统 | Hallucination_Governance_Wiki §3-5 + §9 + §11 |

## 4. 使用约定

1. **单一真相来源**:各文档不复制彼此内容,只用链接交叉引用;冲突时以一手来源(官方文档/论文)为准。
2. **Agent 学习约定**:Agent 在开始涉及"Agent 构建/上下文/记忆/安全/可观测/提示/工具选型/开发流程/质量保障/幻觉治理/RAG/多智能体/harness/评测/协同进化/国产工具链/经济性"的任务前,应阅读本文档确定所需主题,再按 §2 图谱进入对应文档。
3. **维护约定**:新增核心知识文档时,同步更新本索引的文档地图与主题图谱;数据(星标、版本、性能)变化时标注调研时间点。
4. **知识共享**:任何文档被引用/分享时,附上本索引链接,保证读者能拿到完整的知识体系而不只是单篇。

## 5. 已完成主题(里程碑)

| 主题 | 完成版本 | 对应文档 |
|---|---|---|
| Context Rot 深入讲解 | v1.0(2026-08-10) | Context_Rot_Wiki |
| 上下文工程系统化框架 | v1.0(2026-08-10) | Context_Engineering_Wiki |
| Agent Skills 完全指南 | 既有 | LLM_Skills_Wiki |
| 上下文文件编写指南 | 既有 | LLM_Wiki |
| Agent 核心架构 | v1.0(2026-08-10) | Agent_Architecture_Wiki |
| Agent 工具生态选型 | v1.0(2026-08-10) | Agent_Tools_Selection_Wiki |
| 科研 Agent 工作流 | v1.0(2026-08-10) | Research_Agent_Workflow_Wiki |
| Vibe Coding 方法论 | v1.0(2026-08-10) | Vibe_Coding_Methodology_Wiki |
| AI 编码质量防线 | v1.0(2026-08-10) | AI_Coding_Quality_Gate_Wiki |
| Agent 记忆系统 | v1.0(2026-08-10) | Agent_Memory_Wiki |
| RAG 实战全链路 | v1.0(2026-08-10) | RAG_Practice_Wiki |
| Agentic RAG 深入实战 | v1.0(2026-08-10) | Agentic_RAG_Wiki |
| Prompt Engineering 方法论 | v1.0(2026-08-10) | Prompt_Engineering_Wiki |
| 多智能体协作设计 | v1.0(2026-08-10) | Multi_Agent_Design_Wiki |
| 记忆安全与对抗 | v1.0(2026-08-10) | Memory_Security_Wiki |
| Agent Harness 详解(含自动合成) | v1.0(2026-08-10) | Agent_Harness_Engineering_Wiki |
| Graph RAG 深入实战 | v1.0(2026-08-10) | Graph_RAG_Deep_Dive_Wiki |
| 多智能体评测与基准 | v1.0(2026-08-10) | Multi_Agent_Evaluation_Wiki |
| 多智能体通信协议 | v1.0(2026-08-10) | Multi_Agent_Protocol_Wiki |
| 评估基础设施搭建 | v1.0(2026-08-10) | Eval_Infrastructure_Wiki |
| Prompt 自动优化实战 | v1.0(2026-08-10) | Prompt_Optimization_Practice_Wiki |
| 可观测性与安全治理 | v1.0(2026-08-10) | Agent_Observability_Security_Wiki |
| Harness×模型协同进化 | v1.0(2026-08-10) | Harness_Model_CoEvolution_Wiki |
| 记忆系统工程化 | v1.0(2026-08-10) | Memory_Engineering_Wiki |
| 国产工具链对比分析 | v1.0(2026-08-10) | Domestic_Toolchain_Wiki |
| 多智能体安全与滥用 | v1.0(2026-08-10) | Multi_Agent_Security_Wiki |
| Agent 经济性 | v1.0(2026-08-10) | Agent_Economics_Wiki |
| 评测基准盘点 | v1.0(2026-08-10) | Agent_Benchmarks_Wiki |
| 领域落地实战 | v1.0(2026-08-10) | Domain_Deployment_Wiki |
| 幻觉治理专题 | v1.0(2026-08-10) | Hallucination_Governance_Wiki |

## 6. 执行计划

> 已完成 30 个方向。知识体系当前覆盖 16 大领域、30 篇文档。

**后续可选扩展方向**(按兴趣与需要触发):

| 方向 | 说明与价值 | 建议产出物 |
|---|---|---|
| Agent 数据飞轮 | 行为日志→数据→训练/微调的闭环工程 | `Agent_Data_Flywheel_Wiki.md` |
| 企业级 Agent 平台 | 从单 Agent 到组织级平台的治理/架构演进 | `Enterprise_Agent_Platform_Wiki.md` |
| 模型微调与 RL | 面向 Agent 任务的 SFT/RLHF/RLVR 实战 | `Agent_Fine_Tuning_Wiki.md` |

---

*本索引由 AI Agent 维护。每次新增/更新知识文档时,请同步更新本文档(文档地图、主题图谱、里程碑与执行计划表),确保知识体系始终可导航、可共享、可执行。*
