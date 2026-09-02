const n=`# LLM Wiki — Agentic RAG(智能体检索增强生成)深入实战

> 面向 LLM Agent 的**Agentic RAG 深入实战**系统性知识库:从核心概念(把决策权交给 LLM)、六大核心模式(路由/多步/反思/规划/记忆增强/研究型)、工程实现与框架、评测方法论,到 2025-2026 最新进展(Deep Research 产品化)、失败模式与护栏,沉淀为可直接落地的一手工程资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**检索工程智能化层**——[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) §8 概要介绍 Agentic RAG,本文档纵深展开到可落地级别。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实并勘误)、GitHub 高星仓库、OpenAI/Google 官方博客、框架官方文档

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心概念与演进](#2-核心概念与演进)
3. [核心模式详解](#3-核心模式详解)
4. [工程实现与框架](#4-工程实现与框架)
5. [评测](#5-评测)
6. [2025-2026 最新进展](#6-2025-2026-最新进展)
7. [失败模式与护栏](#7-失败模式与护栏)
8. [为 Agent 生成的可执行框架](#8-为-agent-生成的可执行框架)
9. [生态与资源](#9-生态与资源)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

传统 RAG 是"被动检索一次"的静态管线——检索是必经步骤,且无法应对复杂查询。Agentic RAG 把**决策权交给 LLM**:是否检索、何时检索、检什么、检索后如何修正,都由模型在循环中自主决定。本文档帮助读者理解模式、选择框架、控制成本并规避失败。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解 Agentic RAG 本质 → §2 概念 → §3 模式
目标:工程落地 → §4 框架与设计 → §7 护栏 → §8 检查清单
目标:评测 → §5 评测方法 → §8.2 决策树
\`\`\`

### 1.3 一句话核心结论

> **Agentic RAG = 把"检索→生成"升级为"推理→(是否)检索→评估→再检索/再生成"的闭环**,检索成为可选动作而非必经步骤。它是 ReAct 循环在检索场景的实例化。

---

## 2. 核心概念与演进

### 2.1 定义

> **Agentic RAG**:将自主智能体嵌入 RAG 流水线,通过反思(reflection)、规划(planning)、工具调用(tool use)、多智能体协作(multi-agent)四类设计模式,动态决定是否检索、何时检索、检索什么、检索后如何修正。
> —— [Agentic RAG 综述](https://arxiv.org/abs/2501.09136)(Singh et al.,v4 更新至 2026-04)

### 2.2 四代演进对比

| 代 | 范式 | 检索方式 | 决策权 |
|---|---|---|---|
| 第一代 | Naive RAG | 索引-检索-生成固定管线 | 无 |
| 第二代 | Advanced RAG | 预检索优化/后处理 | 无 |
| 第三代 | Modular RAG | 模块解耦可组合 | 少量(人工编排) |
| **第四代** | **Agentic RAG** | **LLM 自主决定**是否/何时/检什么 | **全在 LLM** |

### 2.3 与 ReAct / Agent Loop 的关系

\`\`\`text
Agentic RAG = ReAct(思考-行动-观察)循环在检索场景的实例化
  检索器被包装为工具(tool)
  LLM 在循环中决定调用哪个检索工具并消化观察结果
\`\`\`

- 底层运行时:工具调用框架(function calling)+ Agent Loop(记忆、停止条件、递归限制)
- 反思能力:源自 Reflexion(arXiv:2303.11366)的"语言式自反馈 + 情景记忆"
- 与 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §3-4(ReAct/Agent Loop)直接呼应

---

## 3. 核心模式详解

### 3.1 模式总览

| 模式 | 机制 | 代表工作 | 适用场景 |
|---|---|---|---|
| **Query Routing 路由** | 分类器/LLM 将查询路由到向量/图/网络/数据库/代码解释器等不同检索器 | [Adaptive-RAG](https://arxiv.org/abs/2403.14403)(按复杂度分级) | 查询类型多样 |
| **多步检索-推理** | 迭代检索-推理直至证据充分 | Deep Research 类 | 复杂多跳问答 |
| **反思与自我纠正** | 按需检索 + 自我批判 | [Self-RAG](https://arxiv.org/abs/2310.11511)、[CRAG](https://arxiv.org/abs/2401.15884) | 事实性要求高 |
| **规划-检索-执行** | 递归聚类摘要构建树,检索匹配不同抽象层级 | [RAPTOR](https://arxiv.org/abs/2401.18059) | 长文档/全局主题 |
| **记忆增强** | 情景记忆/长期记忆增强检索 | Reflexion episodic buffer | 多轮对话、跨会话一致 |
| **研究型(Deep Research)** | 计划→多步检索→回溯→综合的长循环 | OpenAI/Google Deep Research | 综合研究任务 |

### 3.2 关键模式详解

**Query Routing(路由)**:
- Adaptive-RAG:按问题复杂度分级(no/single/multi-step),路由到不同策略
- 工程实现:LlamaIndex Router Query Engine

**反思与自我纠正**:
- **Self-RAG**(arXiv:2310.11511):用 reflection tokens(\`<retrieve>\`/\`<critique>\` 等)让单模型按需检索并自我批判
- **CRAG**(arXiv:2401.15884):用检索评估器评分,分三路修正——正确→分解重组 / 模糊→重检索 / 错误→网络搜索兜底;**可作插件叠加任意 RAG**

---

## 4. 工程实现与框架

### 4.1 框架对比

| 框架 | Agentic RAG 能力 | 适用 |
|---|---|---|
| **LlamaIndex** | Router Query Engine(最简路由式);AgentRunner + FunctionCallingAgentWorker(多步推理);Workflows(事件驱动) | 文档为中心的 RAG 生态 |
| **LangGraph** | 状态机/图编排;\`create_retriever_tool\` 将检索器工具化;内置 \`recursion_limit\`(默认 25 步)护栏 | 精细流程控制 |
| **AutoGen** | 事件驱动、多智能体自由协作 | 多角色研究型 RAG |
| **OpenAI Agents SDK** | Swarm 生产级升级;Guardrails、Handoffs、tracing;检索器作 tool 接入 | 快速生产化 |
| **Dify** | 可视化工作流;知识库检索节点 + Agent 节点 | 低代码落地 |

### 4.2 检索工具设计

\`\`\`python
# retrieve 工具的设计要点(示意)
retrieve(query: str, top_k: int = 10, filters: dict = None)
    → 返回结构化结果:
      内容(content)、得分(score)、元数据/溯源(source, page)
\`\`\`

- **多路工具**:用"路由 + 多工具"组合(向量/图/网络各自一个 tool,描述清晰)
- **工具描述必须精确**:模糊描述 → 路由错误(呼应 [Prompt_Engineering_Wiki.md](Prompt_Engineering_Wiki.md) §3)

### 4.3 停止条件与成本控制

| 手段 | 说明 |
|---|---|
| **检索轮数上限** | 最大检索轮数,硬性护栏 |
| **recursion_limit** | LangGraph 默认 25 步,超限抛 GraphRecursionError |
| **自评停止 token** | Self-RAG 式自我评估停止 |
| **预算配额** | 如 OpenAI Deep Research Pro 250 次/月 |
| **降级轻量模型** | 简单查询用 o4-mini 等轻量模型 |

### 4.4 与 Graph RAG 融合

\`\`\`text
Agent 在向量/图谱/网络间路由:
  关系推理查询 → 图遍历(Neo4j)
  语义查询 → 向量(Milvus)
  实时信息 → 网络搜索
\`\`\`

> 融合案例:LangGraph + Neo4j + Milvus 多路检索;微软 GraphRAG 先建实体图谱+社区摘要处理全局问题(详见 [Graph_RAG_Deep_Dive_Wiki.md](Graph_RAG_Deep_Dive_Wiki.md))。

---

## 5. 评测

### 5.1 评测维度

| 维度 | 指标 |
|---|---|
| 任务完成 | 任务完成率 / 答案正确率 |
| 检索效率 | 检索次数、多跳分解质量 |
| 成本 | token / 延迟 / 配额 |

### 5.2 关键基准

| 基准 | 内容 | 关键数据 |
|---|---|---|
| **CRAG 基准**(Meta,[arXiv:2406.04744](https://arxiv.org/abs/2406.04744),NeurIPS 2024) | 4,409 问答对 + 模拟 Web/KG 搜索 API,5 领域 8 类问题 | 先进 LLM ≤34% 准确率,简单 RAG 仅 44%,工业级 RAG 63%;高动态/低热度问题显著更差 |
| **FRAMES**(Google,[arXiv:2409.12941](https://arxiv.org/abs/2409.12941),NAACL 2025) | 多跳事实聚合问题 | 无检索 0.40 准确率;多步检索流水线提升至 0.66(>50%) |

> ⚠️ **编号勘误**:CRAG 基准正确编号为 **2406.04744**(网上流传的 2408.07426 实为数学物理论文);FRAMES 正确编号为 **2409.12941**。

---

## 6. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **Deep Research 产品化** | OpenAI 2025-02 发布 Deep Research(o3 推理模型,端到端 RL 训练,规划多步轨迹、必要时回溯,5-30 分钟整合数百来源);2026-02 更新支持任意 MCP、限定受信任网站、中断续作。Google Gemini 2024-11 推出,2025-03 升级 2.5 Pro |
| **与长上下文的关系** | 长上下文无法替代检索的经济性与可控性,但被 Deep Research 用于整合多轮检索结果——趋势为"**检索定位 + 长上下文综合**" |
| **生产落地** | 金融(研报/合规问答)、法律(判例多跳检索)、科研(文献综述)优先采纳;趋势:多模态检索、知识图谱增强、端侧部署、MCP 工具生态 |

---

## 7. 失败模式与护栏

| 失败模式 | 护栏 |
|---|---|
| **无限检索循环/过度检索** | 检索轮数上限、recursion_limit、自评停止条件、总预算 |
| **路由错误**(工具描述不清/分类不准) | 精确工具 schema 与描述、路由分类器校准、多路兜底 |
| **检索文档污染/提示注入** | 输入输出 Guardrails、来源白名单、溯源校验 |
| **成本失控**(长链×多轮) | 预算配额、轻量模型降级、缓存 |
| **记忆陈旧/上下文冲突** | 记忆刷新与审计;"信任旧记忆比无记忆更危险" |
| **引用不忠实** | 遍历路径溯源、逐句引用校验 |

---

## 8. 为 Agent 生成的可执行框架

### 8.1 Agentic RAG 架构选型决策树

\`\`\`text
查询需求?
├─ 简单事实、查询类型单一 → 传统 RAG(别上 Agentic,省成本)
├─ 查询类型多样 → Query Routing(Adaptive-RAG / LlamaIndex Router)
├─ 多跳复杂问答 → 多步检索-推理(LangGraph / AgentRunner)
├─ 事实性要求极高 → Self-RAG / CRAG 插件叠加
├─ 长文档全局主题 → RAPTOR(树结构)
├─ 综合研究任务 → Deep Research 式长循环
└─ 多源异构(图/向量/网络)→ 多路路由融合 Graph RAG
\`\`\`

### 8.2 Agentic RAG 落地检查清单

\`\`\`markdown
## Agentic RAG 自查
□ 检索工具描述是否精确无歧义?(防路由错误)
□ 是否有检索轮数上限与总预算?(防无限循环与成本失控)
□ 是否设置停止条件?(自评 token / recursion_limit)
□ 检索结果是否带溯源?(引用可校验)
□ 是否有来源白名单与 Guardrails?(防提示注入)
□ 是否做了记忆刷新与陈旧检测?
□ 是否用 CRAG/FRAMES 类基准评测?(不是只看 demo)
□ 简单查询是否降级到轻量模型/传统 RAG?(省成本)
\`\`\`

### 8.3 供 Agent 生成 Agentic RAG 框架的元规则

1. **检索是可选动作**:能不问就不问,决策权在 LLM 但要有限制
2. **护栏先行**:轮数上限、预算、停止条件是设计的一部分,不是事后补救
3. **工具契约清晰**:每个检索工具的参数与返回结构写死,描述精确
4. **溯源内建**:每次检索必须可追溯到来源,支撑引用校验
5. **分层降级**:简单查询走轻量路径,复杂查询才走完整 Agentic 循环
6. **评测驱动**:用 CRAG/FRAMES 类基准验证,防"看起来聪明但事实错误"

---

## 9. 生态与资源

### 论文(编号已核实)
- [Agentic RAG Survey](https://arxiv.org/abs/2501.09136)(Singh et al.,v4 2026-04)
- [Self-RAG](https://arxiv.org/abs/2310.11511) ｜ [项目页](https://selfrag.github.io/)
- [CRAG](https://arxiv.org/abs/2401.15884)(Corrective RAG)
- [Adaptive-RAG](https://arxiv.org/abs/2403.14403)
- [RAPTOR](https://arxiv.org/abs/2401.18059)
- [Reflexion](https://arxiv.org/abs/2303.11366) ｜ [ReAct](https://arxiv.org/abs/2210.03629)
- [CRAG 基准(Meta)](https://arxiv.org/abs/2406.04744) ｜ [GitHub](https://github.com/facebookresearch/CRAG/)
- [FRAMES](https://arxiv.org/abs/2409.12941)

### 框架与工具
- [LlamaIndex Agentic RAG 文档](https://docs.llamaindex.ai/en/stable/examples/agent/agentic_rag/)
- [LangGraph Agentic RAG 教程](https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [Dify 文档](https://docs.dify.ai/zh-hans)

### 官方博客
- [OpenAI — Introducing Deep Research](https://openai.com/index/introducing-deep-research/)
- [微软 GraphRAG](https://github.com/microsoft/graphrag)

---

## 10. 参考来源

- arXiv 论文(编号逐条核实并勘误:CRAG 基准 2406.04744、FRAMES 2409.12941)
- OpenAI/Google 官方博客(Deep Research)
- LlamaIndex/LangGraph/OpenAI Agents SDK/Dify 官方文档
- 关联文档:[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) §8、[Graph_RAG_Deep_Dive_Wiki.md](Graph_RAG_Deep_Dive_Wiki.md)、[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §3(ReAct)

---

*本文档由 arXiv 一手论文(编号逐条核实并勘误)、框架官方文档与 OpenAI/Google 官方博客综合而成。标注:CRAG 基准正确编号为 arXiv:2406.04744,FRAMES 正确编号为 arXiv:2409.12941,网上流传编号系误传。*
`;export{n as default};
