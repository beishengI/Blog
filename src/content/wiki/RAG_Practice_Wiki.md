# LLM Wiki — RAG 实战全链路

> 面向 LLM Agent 的**RAG(检索增强生成)实战**系统性知识库:从四代演进路线、全链路各环节技术选型(索引/向量化/检索/重排/生成)、进阶技术(Graph RAG/Agentic RAG/Self-RAG/HyDE),到评估体系与生产落地,沉淀为可直接落地的一手工程资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**检索工程层**——[Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7.4 已概要介绍聚焦式检索,本文档全链路展开,并与上下文工程(上下文精简)深度关联。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已逐条核实)、GitHub 高星仓库、官方文档、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [RAG 演进路线:四代范式](#2-rag-演进路线四代范式)
3. [全链路一:数据索引](#3-全链路一数据索引)
4. [全链路二:向量化与存储](#4-全链路二向量化与存储)
5. [全链路三:检索](#5-全链路三检索)
6. [全链路四:重排](#6-全链路四重排)
7. [全链路五:生成优化](#7-全链路五生成优化)
8. [进阶技术:Graph RAG 与 Agentic RAG](#8-进阶技术graph-rag-与-agentic-rag)
9. [评估体系](#9-评估体系)
10. [与上下文工程的关系](#10-与上下文工程的关系)
11. [2025-2026 最新进展与争议](#11-2025-2026-最新进展与争议)
12. [为 Agent 生成的可执行框架](#12-为-agent-生成的可执行框架)
13. [生态与资源](#13-生态与资源)
14. [参考来源](#14-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

RAG 是当前最主流的"让 LLM 使用外部知识"的方案,但 naive RAG 的检索噪声、上下文不连贯、幻觉未根治等问题,使其在真实场景中效果不稳定。本文档给出**从数据到评估的完整工程链路**与每一步的选型建议。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:搭建 RAG 系统 → §2 演进 → §3-7 全链路五环节 → §9 评估 → §12 检查清单
目标:优化现有 RAG → §8 进阶技术 → §10 上下文关系 → 对应环节精修
```

### 1.3 一句话核心结论

> **RAG 的本质是上下文工程的一种实现**——只喂最相关内容、精简 token、清除干扰项。检索质量决定回答质量的下限。

---

## 2. RAG 演进路线:四代范式

基准综述:Gao et al.《Retrieval-Augmented Generation for Large Language Models: A Survey》(arXiv:2312.10997,2024-03 修订)。

| 代 | 范式 | 机制 | 问题 |
|---|---|---|---|
| **第一代** | **Naive RAG** | 索引→检索→生成三段式"检索-阅读" | 召回噪声大、上下文不连贯、幻觉未根治 |
| **第二代** | **Advanced RAG** | 检索前后优化:query rewrite、混合检索、rerank、上下文压缩、元数据过滤 | **当前工程主流** |
| **第三代** | **Modular RAG** | 检索/记忆/路由拆成可插拔模块,与微调、提示工程、知识图谱自由组合 | 需要工程设计能力 |
| **第四代** | **Agentic RAG** | LLM 自主决定"是否检索、何时检索、检什么",支持多步推理与工具调用 | 成本高、需护栏 |

> Agentic RAG 综述:Singh et al.(arXiv:2501.09136,2025)。

---

## 3. 全链路一:数据索引

### 3.1 文档加载与清洗

- **加载**:unstructured / Docling / LangChain 解析 PDF、Office、网页等
- **清洗**:去重、去噪、格式统一、去除页眉页脚版权声明

### 3.2 分块(Chunking)——最影响检索质量的一步

| 分块方式 | 机制 | 适用 |
|---|---|---|
| **固定长度** | 按 token/字符数切 | 简单但易切断语义 |
| **递归分块** | 按分隔符层级切(LangChain 默认) | 通用默认 |
| **语义分块** | 按句向量相似度断点 | 高质量但成本高 |
| **结构分块** | 按标题/段落切 | 有结构文档(论文/报告) |

**关键实践**:
- chunk size 经验区间约 **200–1000 token**,需结合 embedding 与检索实测调参
- **父子分块(Parent-Child)**:用小子块精确检索、回传父块完整上下文——提升召回质量的常用手段
- **元数据**(来源/时间/章节):用于过滤与引用溯源

### 3.3 分块决策要点

```text
文档有清晰结构?(标题/段落)→ 结构分块
内容高度关联?(段落间互相依赖)→ 语义分块(或父-子分块)
纯文本无结构 → 递归分块
```

---

## 4. 全链路二:向量化与存储

### 4.1 Embedding 模型选型

- 依据 **MTEB 榜单**(huggingface.co/spaces/mteb/leaderboard)分任务看;**中文场景须看中文子榜**
- 主流:text-embedding-3(OpenAI)、BGE、E5、Cohere、Qwen3-Embedding

### 4.2 向量数据库选型

| 数据库 | 定位 | 适用 |
|---|---|---|
| **Chroma / FAISS** | 轻量、原型 | 原型与小规模 |
| **Qdrant / Weaviate** | 生产友好 | 中型生产 |
| **Milvus** | 大规模分布式 | 大规模 |
| **Pinecone** | 托管云 | 免运维 |
| **pgvector** | 并入现有 PostgreSQL | 已有 PG 基础设施 |

---

## 5. 全链路三:检索

### 5.1 三种检索方式

| 方式 | 机制 | 优点 | 缺点 |
|---|---|---|---|
| **稠密向量检索** | 语义相似度 | 理解语义、召回泛化 | 精确匹配弱、词汇鸿沟 |
| **BM25 稀疏检索** | 词法、精确匹配 | 精确术语、专名强 | 无语义 |
| **混合检索(Hybrid)** | 两者结合 | 互补 | 需融合策略 |

### 5.2 融合策略:RRF

**RRF(Reciprocal Rank Fusion)**:倒数秩融合,无需分数归一化,合并多路检索结果(源自 Cormack et al. 2009 SIGIR)。

```text
RRF 核心思想:某文档在多个结果列表中的排名越好,融合后分数越高
score(d) = Σ 1 / (k + rank_i(d)),k 常取 60
```

---

## 6. 全链路四:重排

| 重排器 | 机制 | 优点 | 成本 |
|---|---|---|---|
| **Cross-encoder reranker** | 双塔变交叉编码器对 query-doc 精排(bge-reranker、Cohere Rerank、Jina) | 精度高 | 高 |
| **LLM reranker** | LLM 打分排序 | 灵活 | 更高 |
| **RAG-Fusion** | LLM 生成多查询变体 + RRF + 融合生成(2024 博客,无 arXiv 编号) | 提升召回 | 多次调用 |

**实践建议**:检索先召回 top-20~50,再用 cross-encoder 精排到 top-3~5 送入生成。

---

## 7. 全链路五:生成优化

| 技术 | 机制 | 作用 |
|---|---|---|
| **上下文压缩** | 过滤/压缩不相关内容,只留核心事实 | 精简 token、降干扰 |
| **Query Rewrite** | 改写、扩展、多查询 | 提升检索命中 |
| **强制引用** | prompt 要求输出附来源 | 溯源、防幻觉 |

**Prompt 组装要点**:指令 + 检索块 + 强制引用格式。结合 [Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7.4 的聚焦式检索——只喂最少、最相关内容。

---

## 8. 进阶技术:Graph RAG 与 Agentic RAG

### 8.1 Graph RAG(微软,arXiv:2404.16130)

**机制**:LLM 抽取实体关系建知识图谱 → Leiden 社区检测 + 社区摘要 → local/global 双查询模式。

- **擅长**:全局性问题、多跳推理、跨文档关联
- **不擅长**:需要高精度单点事实的简单问答(杀鸡用牛刀)
- 综述:arXiv:2408.08921;开源:[microsoft/graphrag](https://github.com/microsoft/graphrag)

### 8.2 Agentic RAG(第四代)

**机制**:LLM 自主决定是否检索、何时检索、检什么;支持多步推理与工具调用(综述 arXiv:2501.09136)。

- 典型形态:query routing(路由到向量/图/网络/数据库)、多步检索-推理
- 需护栏:无限检索循环、错误检索路径累积

### 8.3 其他进阶技术

| 技术 | 论文 | 机制 | 适用 |
|---|---|---|---|
| **Self-RAG** | [arXiv:2310.11511](https://arxiv.org/abs/2310.11511) | 模型生成反思 token(Retrieve/ISREL/ISSUP/ISUSE),按需检索并自我批判 | 检索需求不明确的场景 |
| **CRAG(Corrective RAG)** | [arXiv:2401.15884](https://arxiv.org/abs/2401.15884) | 检索评估器打分:可信→精炼;模糊→重检索;错误→切换网络搜索等替代源 | 检索质量不稳的场景 |
| **HyDE** | [arXiv:2212.10496](https://arxiv.org/abs/2212.10496)(ACL 2023) | 先让 LLM 生成"假设文档",用其向量检索 | 缓解 query-document 词汇鸿沟 |

### 8.4 多路召回

混合检索 + 多查询 + 图/向量双路并用,配合 RRF 融合——**宽召回,精重排**。

---

## 9. 评估体系

### 9.1 RAGAS:检索与生成分离评估(arXiv:2309.15217)

| 环节 | 指标 | 含义 |
|---|---|---|
| **检索** | context_precision | 检索到的内容是否相关(精确率) |
| **检索** | context_recall | 相关内容是否被全部检索到(召回率) |
| **生成** | faithfulness | 回答是否忠实于检索上下文(防幻觉核心) |
| **生成** | answer_relevancy | 回答与问题的相关性 |

> 开源:explodinggradients/ragas。

### 9.2 评测集构建

- **人工 golden dataset**:高质量但成本高
- **合成测试数据**:RAGAS synthetic test data generation、LlamaIndex question generation
- **中文基准**:RGB(arXiv:2309.01431,AAAI 2024)——按噪声鲁棒性/否定/多跳/时间/事实等能力分类

### 9.3 生产监控

```text
上线前:离线跑 golden set 回归
上线后:链路 tracing + 用户反馈在线监控(检索质量、回答质量分开看)
```

---

## 10. 与上下文工程的关系

> Chroma 报告证实:LLM 准确性与可靠性随输入 token 数增加显著下降。**RAG 正是对抗上下文腐烂的工程手段**:
> - **聚焦式检索**:只喂最相关内容(对抗干扰项)
> - **Token 精简**:压缩/去噪(对抗注意力预算耗尽)
> - **干扰项清除**:检索噪声会拉低答案质量(对抗信息竞争)

Chroma 创始人 Jeff Huber 提出"**RAG 已死,上下文工程为王**"——实质是 RAG 被重新定位为上下文工程的一部分,而非淘汰。

> 关联阅读:[Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7.4(聚焦式检索)、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) §5(运行时检索)。

---

## 11. 2025-2026 最新进展与争议

| 进展 | 内容 | 意义 |
|---|---|---|
| **LightRAG** | [HKUDS/LightRAG](https://github.com/HKUDS/LightRAG)(arXiv:2410.05779):图 + 向量双索引、实体级/主题级双级检索、增量更新;论文报告索引与查询成本较 GraphRAG 低约一个数量级;2025-08 内置 reranker,2025-11 集成 RAGAS 与 Langfuse,2026-05 支持多模态与 4 种分块策略 | Graph RAG 的轻量替代 |
| **"RAG is dead?"之争** | 2024 学术界争论长上下文能否取代 RAG;2025 实践检验后主流共识是 **Hybrid Context**:RAG 做宽召回 + 长上下文做深推理 | "RAG 未死",而是与长上下文融合 |
| **生产落地** | 金融/法律/医疗对幻觉零容忍,强制引用溯源、权限控制、领域评测是刚需 | 企业落地难点在数据治理、检索质量、效果评估,而非模型调用 |

---

## 12. 为 Agent 生成的可执行框架

### 12.1 RAG 系统设计检查清单

```markdown
## RAG 系统自查
□ 数据层:分块方式是否与文档结构匹配?父子分块是否必要?
□ 元数据是否完备(来源/时间/章节)可用于过滤与溯源?
□ embedding 是否按 MTEB 分任务/分语言选型?
□ 检索:是否需要混合检索 + RRF?(精确匹配需求高 → 是)
□ 重排:是否用 cross-encoder 对 top-20~50 精排到 top-3~5?
□ 生成:上下文是否压缩?是否强制引用?
□ 是否分离评估检索质量(context_precision/recall)与生成质量(faithfulness)?
□ 上线后是否有 tracing + 用户反馈监控?
```

### 12.2 RAG 架构选型决策树

```text
问题类型?
├─ 全局性/多跳/跨文档 → Graph RAG
├─ 高精度单点事实 → 混合检索 + cross-encoder 重排(传统 RAG 足够)
├─ 检索需求不明确 → Self-RAG / Agentic RAG
├─ 检索质量不稳 → CRAG(带纠错)
└─ 查询与文档词汇鸿沟大 → HyDE
```

### 12.3 供 Agent 生成 RAG 框架的元规则

1. **数据先行**:分块与元数据决定检索质量上限,先优化这里
2. **宽召回,精重排**:混合检索召回 + cross-encoder 精排,别指望一次检索到位
3. **生成侧防御**:上下文压缩 + 强制引用,双管齐下防幻觉
4. **检索与生成分离评估**:故障定位才快
5. **按问题类型选架构**:杀鸡用牛刀(单点事实上 Graph RAG)是常见浪费

---

## 13. 生态与资源

### GitHub 仓库
- [microsoft/graphrag](https://github.com/microsoft/graphrag)(Graph RAG 开源实现)
- [HKUDS/LightRAG](https://github.com/HKUDS/LightRAG)(图 + 向量双索引,轻量)
- [explodinggradients/ragas](https://github.com/explodinggradients/ragas)(评估框架)

### 论文(编号已核实)
- [RAG Survey](https://arxiv.org/abs/2312.10997)(Gao et al.,Naive/Advanced/Modular)
- [Agentic RAG 综述](https://arxiv.org/abs/2501.09136)(Singh et al. 2025)
- [Graph RAG](https://arxiv.org/abs/2404.16130)(微软)
- [GraphRAG 综述](https://arxiv.org/abs/2408.08921)
- [Self-RAG](https://arxiv.org/abs/2310.11511)
- [CRAG](https://arxiv.org/abs/2401.15884)
- [HyDE](https://arxiv.org/abs/2212.10496)(ACL 2023)
- [LightRAG](https://arxiv.org/abs/2410.05779)
- [RAGAS](https://arxiv.org/abs/2309.15217)
- [RGB 基准](https://arxiv.org/abs/2309.01431)(AAAI 2024)

### 参考资源
- [MTEB 榜单](https://huggingface.co/spaces/mteb/leaderboard)
- [RAGAS 文档](https://docs.ragas.io/)
- [Chroma Context Rot 报告](https://research.trychroma.com/context-rot)

---

## 14. 参考来源

- arXiv 论文(编号逐条核实,见 §13)
- GitHub 高星仓库(GraphRAG、LightRAG、RAGAS)
- Chroma Context Rot 报告(聚焦式检索依据)
- 社区高浏览量文章:Agentic RAG、RAG vs 长上下文之争、生产落地实践
- 关联文档:[Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7.4、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) §5

---

*本文档由 arXiv 一手论文(编号逐条核实)、GitHub 高星仓库与社区实践综合而成。RAG 生态迭代快,选型与调参请以官方文档与实测为准。*
