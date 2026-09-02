# LLM Wiki — Graph RAG 深入实战

> 面向 LLM Agent 的**Graph RAG 深入实战**系统性知识库:从核心原理(local/global 双查询)、全流程工程细节(实体抽取/图构建/社区检测/摘要/索引)、成本与性能数据、开源实现对比,到进阶变体(LazyGraphRAG/DRIFT/增量更新)与生产落地要点。
>
> 定位:本文档是"Agent 上下文知识体系"的**检索工程进阶层**——[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) §8 概要介绍 Graph RAG,本文档纵深展开到可落地级别。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、GitHub API 实时 star、微软官方博客/文档

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心原理:为什么需要 Graph RAG](#2-核心原理为什么需要-graph-rag)
3. [全流程工程细节](#3-全流程工程细节)
4. [成本与性能](#4-成本与性能)
5. [开源实现对比](#5-开源实现对比)
6. [进阶与变体](#6-进阶与变体)
7. [生产落地要点](#7-生产落地要点)
8. [2025-2026 最新进展](#8-2025-2026-最新进展)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

向量 RAG 擅长"局部事实查询"(这段里有什么),却无法回答"全局性问题"(这个语料的主题是什么、数据点之间的连接是什么)。Graph RAG 用知识图谱的结构化视野补上这个缺口,但索引成本高、工程复杂。本文档帮助读者判断**何时该用 Graph RAG**、以及如何正确落地。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:判断是否该用 → §2 原理 → §9.1 选型决策树
目标:完整落地 → §3 全流程 → §4 成本预算 → §7 生产要点
目标:选开源实现 → §5 对比表
目标:跟进前沿 → §6 变体 → §8 最新进展
```

### 1.3 一句话核心结论

> **Graph RAG 用图的天然模块化(Leiden 社区)获得跨文档的结构化全局视野**——解决向量 RAG 的"只见树木不见森林",但以高索引成本为代价。**杀鸡不用牛刀:局部事实查询用向量 RAG,全局/连接点查询用 Graph RAG。**

---

## 2. 核心原理:为什么需要 Graph RAG

### 2.1 微软 GraphRAG(arXiv:2404.16130)

**要解决的问题**:向量 RAG 无法回答全局性问题(如"这个数据集的主题是什么"——需要跨文档综合)。

**核心思路**:
1. **两阶段索引**:LLM 将文本构建为**实体知识图谱**(实体/关系抽取)→ **社区摘要预生成**
2. **查询时**:用社区摘要回答全局问题

**与向量 RAG 的本质区别**:

| 维度 | 向量 RAG | Graph RAG |
|---|---|---|
| 数据结构 | 平面文本块 | 实体知识图谱 |
| 检索方式 | 语义相似度 | 图结构(社区/邻居) |
| 擅长 | 局部事实查询 | 全局理解、连接点、多跳 |
| 论文验证 | — | 1M token 语料上 Comprehensiveness/Diversity 显著提升 |

### 2.2 何时该用(选型判断)

```text
问题类型?
├─ "X 的具体数值/事实是什么?" → 向量 RAG 足够
├─ "整个语料的主题/趋势是什么?" → Graph RAG(Global)
├─ "A 与 B 之间有什么关系?" → Graph RAG(Local/DRIFT)
└─ "多个文档如何关联?" → Graph RAG
```

---

## 3. 全流程工程细节

### 3.1 全流程总览

```text
数据准备 → 实体/关系抽取 → 图构建与去重 → 社区检测 → 社区摘要 → 索引 → 查询
```

### 3.2 各环节要点与坑

| 环节 | 技术要点 | 常见坑 |
|---|---|---|
| **数据准备** | 语料切片为 **TextUnit**(文本单元),同时作为查询时的细粒度引用来源 | chunk 越大抽取调用越少(省成本)但 recall 下降——需权衡 |
| **实体/关系抽取** | LLM 逐 TextUnit 抽取实体、关系与关键主张(claims/covariates,可选);官方强烈建议 **Prompt Tuning** 适配领域数据 | 抽取质量直接决定图质量;自反思技术影响抽取质量与成本 |
| **图构建与去重** | 抽取结果合并去重为实体图,实体带 description 属性 | 跨文档实体合并去重是质量关键(同名不同义/同义不同名) |
| **社区检测** | **分层 Leiden 算法**(arXiv:1810.08473)做层次化社区聚类 | 层级参数需按语料规模调整 |
| **社区摘要** | 自底向上对每层社区生成社区摘要——**全局查询的核心资产** | 摘要质量决定 Global Search 质量 |
| **索引** | 实体/社区 embedding 入库,保留 TextUnit↔实体/社区映射 | — |

### 3.3 查询四模式(官方文档)

| 模式 | 机制 | 适用 |
|---|---|---|
| **Local Search** | 实体向量相似 top-k → fan-out 邻居实体 + 相关社区 + 文本单元 | 局部实体查询 |
| **Global Search** | map-reduce:随机抽样社区摘要并行 map 生成部分回答,再 reduce 汇总 | 全局主题查询(成本高) |
| **DRIFT Search** | local 基础上叠加社区上下文,双向混合 | 质量与效率平衡 |
| **Basic Search** | 退化为向量 top-k | 与向量 RAG 等价 |

---

## 4. 成本与性能

### 4.1 LightRAG 实测对比(论文 arXiv:2410.05779 第 4.5 节,Legal 数据集)

| 阶段 | GraphRAG | LightRAG |
|---|---|---|
| 查询 | 生成 1,399 社区,610 个 level-2 社区被检索,每篇摘要约 1,000 tokens → **约 61 万 tokens + 数百次 API 调用** | **<100 tokens + 单次调用** |
| 增量更新 | 需重建社区报告(约 5,000 tokens/篇,双份重建 ≈ **1,400 万 tokens**) | 直接并入新实体/关系,无需重建 |
| 整体 | — | 索引与查询成本较 GraphRAG **低约一个数量级(10×)** |

### 4.2 LazyGraphRAG 官方数据

- 完整 GraphRAG 索引成本远高于向量 RAG
- LazyGraphRAG 索引成本与向量 RAG 持平、**仅为完整 GraphRAG 的 0.1%**
- 同成本配置下全局查询成本比 GraphRAG Global Search **低 700 倍以上**
- 仅用其 4% 的查询成本即可全面超越 C2 级别全局搜索

### 4.3 成本决策要点

> ⚠️ 官方 README 明确警告:**GraphRAG 索引很贵**。上线前必须评估:全局查询需求是否真实存在?能否用向量 RAG + 摘要文档替代?

---

## 5. 开源实现对比

> star 为 2026-08-10 GitHub API 实测。

| 项目 | Stars | 特点 | 适用场景 |
|---|---|---|---|
| [microsoft/graphrag](https://github.com/microsoft/graphrag) | 约 35.4k | 官方参考实现,模块化管道(Index/Query/Prompt Tuning),四类查询 + CLI/文档完善,当前 v3.1.1 | 研究基准、完整生产管道、全局问题 |
| [HKUDS/LightRAG](https://github.com/HKUDS/LightRAG) | 约 38.7k | EMNLP 2025 收录;双层检索(低层实体细节 + 高层主题)+ 图向量混合 + 增量更新;成本低约 10× | 快速落地、低成本、动态数据 |
| [gusye1234/nano-graphrag](https://github.com/gusye1234/nano-graphrag) | 约 4.0k | 约 1,100 行代码,异步、完全类型化、"易 hack"复刻版 | 学习原理、深度定制 |
| [neo4j/neo4j-graphrag-python](https://github.com/neo4j/neo4j-graphrag-python) | 约 1.2k | Neo4j 官方:Vector/Graph/Hybrid/Text2Cypher 检索器 + LLM 建图(LLMGraphTransformer) | 已有 Neo4j 基建、需可视化与图查询的企业 |

---

## 6. 进阶与变体

### 6.1 LazyGraphRAG(2024-11 微软)

**核心创新:把 LLM 调用全部推迟到查询时。**

- 索引阶段**不用 LLM**:NLP 名词短语抽取概念共现图
- 查询时:best-first(向量排块)与 breadth-first(社区排序)交替、迭代加深
- 单一参数 **relevance test budget** 控制成本-质量权衡
- 已整合进 Microsoft Discovery 与 Azure Local(2025-06)
- ⚠️ **无论文编号**(arXiv 检索 0 结果),引用以官方博客为准

### 6.2 DRIFT Search(双向混合)

- 在 Local Search 基础上叠加社区上下文,质量与效率平衡
- 官方博客:《Introducing DRIFT Search》

### 6.3 增量更新

- **LightRAG**:增量并入新数据,无需重建
- **GraphRAG 2.x**:全量重建社区结构代价高

### 6.4 混合模式

- 向量 RAG + 图谱检索结合(LightRAG 图+向量双层;DRIFT 社区+实体双向)
- GraphRAG 作为 Agent 的记忆/检索层与 LangGraph 类 agent 编排结合是 2026 主流方向

---

## 7. 生产落地要点

| 维度 | 要点 |
|---|---|
| **存储选型** | 官方默认本地 parquet/LanceDB;企业常用 **Neo4j 图数据库**(parquet→CSV→Cypher 导入,支持可视化与权限管控);也可纯内存(nano-graphrag) |
| **多源文档** | 统一 TextUnit 化;跨文档实体合并去重是质量关键 |
| **领域适配** | 金融反欺诈、生物医药等对可解释性与因果推理要求高的场景收益最大;中文领域需 **Prompt Tuning + 领域本体约束实体类型** |
| **评测指标** | 官方用 LLM 成对比较的 **Comprehensiveness / Diversity / Empowerment**;社区常补充事实性检查与成本/延迟指标(注意:faithfulness 非官方指标名) |
| **企业化** | 需补权限、审计、质量治理闭环 |

---

## 8. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **GraphRAG 版本线** | v2.0.0(2025-02)架构重构(模块化 Indexer/Query)→ v3.0.0(2026-01)→ v3.1.1(2026-07),走向"模块化图 RAG 系统" |
| **LightRAG 反超** | 获 EMNLP 2025 录用,stars 反超官方,"轻量替代"共识确立 |
| **LazyGraphRAG 进产品** | 整合进 Microsoft Discovery / Azure Local 预览 |
| **Agentic 融合** | GraphRAG 作为 Agent 记忆/检索层与 LangGraph 编排结合;GLM-RAG、GFM-RAG 等新变体(图语言模型替代 GNN 检索器)涌现 |

---

## 9. 为 Agent 生成的可执行框架

### 9.1 Graph RAG 选型决策树

```text
存在全局性问题/连接点需求?
├─ 否 → 向量 RAG(别上 Graph RAG,省 10× 成本)
└─ 是 →
    ├─ 预算敏感 / 动态数据 → LightRAG(成本低 10×)
    ├─ 需要完整管道与权威 → 官方 GraphRAG
    ├─ 已有 Neo4j 基建 → neo4j-graphrag
    ├─ 学习原理 / 深度定制 → nano-graphrag
    └─ 成本极致敏感 → LazyGraphRAG(索引成本为 GraphRAG 的 0.1%)
```

### 9.2 Graph RAG 落地检查清单

```markdown
## Graph RAG 自查
□ 全局性问题是否真实存在?(没有 → 别用)
□ 数据是否适合建图?(实体关系密集?跨文档关联?)
□ TextUnit 切片大小是否权衡了成本与 recall?
□ 实体抽取是否做了 Prompt Tuning 适配领域?
□ 跨文档实体去重是否到位?
□ 社区摘要质量是否抽检过?
□ 索引成本是否已预算?(官方警告:很贵)
□ 是否选择了合适的开源实现?(§5 对比)
□ 评测是否用官方指标(Comprehensiveness/Diversity/Empowerment)?
□ 是否有增量更新需求?(LightRAG 更合适)
```

### 9.3 供 Agent 生成 Graph RAG 框架的元规则

1. **需求先行**:先确认存在全局/连接点查询,再上 Graph RAG
2. **抽取即质量**:实体抽取与 Prompt Tuning 决定图质量上限
3. **成本意识**:索引成本高,先用小语料试点估成本
4. **摘要即资产**:社区摘要预生成是全局查询的核心,质量优先
5. **按场景选实现**:研究用官方,落地用 LightRAG,企业已有图库用 Neo4j

---

## 10. 生态与资源

### 论文(编号已核实)
- [GraphRAG](https://arxiv.org/abs/2404.16130)(微软,arXiv:2404.16130)
- [LightRAG](https://arxiv.org/abs/2410.05779)(EMNLP 2025)
- [Leiden 算法](https://arxiv.org/abs/1810.08473)(arXiv:1810.08473)

### GitHub 仓库
- [microsoft/graphrag](https://github.com/microsoft/graphrag)(约 35.4k)
- [HKUDS/LightRAG](https://github.com/HKUDS/LightRAG)(约 38.7k)
- [gusye1234/nano-graphrag](https://github.com/gusye1234/nano-graphrag)(约 4.0k)
- [neo4j/neo4j-graphrag-python](https://github.com/neo4j/neo4j-graphrag-python)(约 1.2k)

### 官方文档与博客
- [GraphRAG 官方文档](https://microsoft.github.io/graphrag/)
- [LazyGraphRAG 博客](https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/)
- [DRIFT Search 博客](https://www.microsoft.com/en-us/research/blog/introducing-drift-search-combining-global-and-local-search-methods-to-improve-quality-and-efficiency/)
- [GraphRAG 发布博客](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)

---

## 11. 参考来源

- arXiv 论文(编号逐条核实,见 §10;LazyGraphRAG 无论文编号,以官方博客为准)
- GitHub API 实时 star(2026-08-10)
- 微软官方博客与文档
- LightRAG 成本数据摘自论文第 4.5 节原文
- 关联文档:[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) §8、[Context_Rot_Wiki.md](Context_Rot_Wiki.md) §7.4

---

*本文档由 arXiv 一手论文(编号逐条核实)、GitHub API 实时数据与微软官方博客综合而成。标注:LazyGraphRAG 无论文编号(arXiv 检索 0 结果);官方评测指标为 Comprehensiveness/Diversity/Empowerment 而非 faithflness。*
