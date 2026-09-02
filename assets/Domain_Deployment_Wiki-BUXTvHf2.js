const n=`# LLM Wiki — 领域落地实战(金融/法律/医疗强监管行业)

> 面向 LLM Agent 的**领域落地实战(Domain Deployment in Regulated Industries)** 系统性知识库:从金融/法律/医疗三大强监管行业的场景、挑战、实践与基准,到跨行业共性(引用溯源/领域评测/权限审计/架构演进)、生产落地流程、2025-2026 最新进展与失败模式,沉淀为可直接落地的一手工程资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**行业应用层**——综合运用 [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md)、[Graph_RAG_Deep_Dive_Wiki.md](Graph_RAG_Deep_Dive_Wiki.md)、[Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md) 与 [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md) 于强监管场景。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、GitHub 高星仓库、官方文档、权威报道

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [金融行业落地](#2-金融行业落地)
3. [法律行业落地](#3-法律行业落地)
4. [医疗行业落地](#4-医疗行业落地)
5. [跨行业共性](#5-跨行业共性)
6. [生产落地流程](#6-生产落地流程)
7. [2025-2026 最新进展](#7-2025-2026-最新进展)
8. [失败模式与避坑](#8-失败模式与避坑)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

金融/法律/医疗是幻觉零容忍的强监管行业。通用 Agent 方案直接套用必然失败(金融基准实测 81% 答错或拒答)。本文档给出三个行业的场景、挑战、基准与架构演进,以及跨行业的生产落地流程。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:行业落地 → §2-4 对应行业 → §5 共性 → §6 流程 → §9 检查清单
目标:跨行业方法论 → §5 共性 → §6 流程
\`\`\`

### 1.3 一句话核心结论

> **强监管行业的铁律:引用溯源 + 领域 golden set + 人工签核 + 全链路审计。** 无溯源输出一律拦截,"仅依据检索证据作答 + 证据编号引用"。

---

## 2. 金融行业落地

### 2.1 场景与架构

- **场景**:研报/财报分析、合规问答、交易决策、投顾助手
- **代表架构**:
  - **FinMem**(分层记忆 + 角色设计,决策可解释,ICLR 2024 LLM Agents)
  - **TradingAgents**(多角色协作:基本面/情绪/技术分析师 + 牛熊辩论 + 风险管理团队)

### 2.2 挑战与实证

| 挑战 | 实证 |
|---|---|
| 数据时效性 | 财报/行情随时间失效 |
| 监管合规 | 输出须人工签核 |
| 可解释性 | 决策依据可追溯 |
| 幻觉零容忍 | FinanceBench 实测:GPT-4-Turbo+向量检索 150 道题中 **81% 答错或拒答**,全部模型均有幻觉 |

### 2.3 基准

| 基准 | 内容 |
|---|---|
| **FinBen** | 36 数据集/24 任务,首创含 Agent 与 RAG 评估(IJCAI-2024 FinNLP shared task,12 支队伍) |
| **FinanceBench** | 10,231 题 + 证据串,公开 150 题样例;作者明确结论"不适合企业直接使用" |

---

## 3. 法律行业落地

### 3.1 场景与挑战

- **场景**:判例检索、合同审查、法律问答
- **核心难点**:**引用准确性**(判例必须真实可查)、版本/法域差异、多跳推理(跨法条-判例-事实关联)

### 3.2 实践与基准

| 基准 | 内容 |
|---|---|
| **LegalBench** | 162 任务/6 类法律推理,法律专家手工构建,实测 20 模型差距显著 |
| **LawBench** | 20 任务/3 认知层级(记忆-理解-应用),51 模型评测;GPT-4 领先但"离可用可靠仍远" |
| **LegalBench-RAG** | 法律检索专项,6,858 个专家标注 QA 对(待核实) |

- 多跳检索可用 **HippoRAG 类图检索方案**(见 §5.3)
- 行业落地:Harvey AI(OpenAI 系法律 Agent;**2026-08 洽谈融资至少 5 亿美元,估值 155 亿美元,年化收入超 3.5 亿美元**,已联网核实)

---

## 4. 医疗行业落地

### 4.1 场景与挑战

- **场景**:临床决策支持(CDSS)、医学问答、患者沟通
- **挑战**:HIPAA 合规、**医疗错误不可接受**、事实性要求极高

### 4.2 实践与基准

| 基准 | 内容 |
|---|---|
| **MedQA** | 12,723 英文医学考试题(三语共 61,097 题);检索式 IR 基线准确率仅 36.7% |
| **MIRAGE/MedRAG** | 7,663 题/5 数据集,41 种语料×检索器×LLM 组合、1.8 万亿 prompt token 实验;MedRAG 最多提升准确率 **18%**;发现 **log-linear 缩放规律与"lost-in-the-middle"效应**(关键证据位于上下文中部时最易被忽略) |

- 监管:FDA 对 AI 医疗设备推行 PCCP(预设变更控制计划)动态监管(**已联网核实**:2024-12 定稿指南、2025-09 发布系列监管更新)

---

## 5. 跨行业共性

### 5.1 引用溯源(三大行业的一等公民)

- FinanceBench 的 evidence strings、LegalBench 的手工引用、MedQA 的教科书证据检索
- 实践:**"仅依据检索证据作答 + 证据编号引用"**,无溯源输出一律拦截
- 工具:RAGAS 提供无标注的忠实度/相关性自动评测

### 5.2 领域评测(golden set)

- 全部采用**专家人工标注的小样本集**做"最低性能门槛"(FinanceBench 150 题、LegalBench-RAG 6,858 题),而非依赖通用公共基准
- 呼应 [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md):golden set 围绕自家业务

### 5.3 架构演进

\`\`\`text
RAG(基础检索)→ GraphRAG(实体知识图谱,全局问题)
  → HippoRAG(KG+PageRank 模拟海马索引,多跳 QA 超 SOTA 20%、成本降 10-30 倍)
  → Agentic RAG(FinMem/TradingAgents/AMIE 的检索+工具+多轮决策)
\`\`\`

### 5.4 权限与审计

- 金融(内部信息分级 + 人工复核)、医疗(HIPAA/PHI)、法律(保密义务)共同要求**追溯审计**
- Anthropic 金融 Agent 仓库明确:"不构成投资建议、输出须人工签核、不得绑定风险/记账"

---

## 6. 生产落地流程

### 6.1 数据治理

- 多源文档(10-K/10-Q/招股书/判例/指南/教科书)结构化解析 + 敏感信息脱敏
- ⚠️ FinanceBench 揭示:长上下文"喂全文档"在企业场景因延迟不可行

### 6.2 模型选型(关键结论)

> **MIRAGE 证明"通用模型 + 好检索"可追平更大模型**(GPT-3.5/Mixtral 达 GPT-4 水平);领域微调收益有限(FinBen、LawBench 均发现指令微调对复杂任务提升甚微)。**优先做检索与 RAG 组合优化,而非盲目微调。**

### 6.3 评估与上线

\`\`\`text
Shadow eval(影子评估)→ 红队 → 专家人工复核(三轮)
上线后:RAGAS(参考无关快速回归)+ RAGChecker(检索/生成分层细粒度诊断,与人工判断相关性高)双轨监控
\`\`\`

### 6.4 持续监控

- 追踪:检索召回率、忠实度、拒答率、证据命中率
- **数据时效性触发重建索引**:金融财报季、法规修订、指南更新

---

## 7. 2025-2026 最新进展

| 行业 | 进展 |
|---|---|
| **金融** | Anthropic 发布 **financial-services** 开源 Agent 套件(Apache 2.0:投行/股权研究/PE/财富管理 10+ 工作流 Agent,MCP 直连 FactSet/S&P/彭博/LSEG 等 12 家数据源,内置 access policies 与人工签核)——"Agent 即工作流模板 + 数据连接器"成为新范式 |
| **法律** | Harvey 类专用 Agent 融资估值暴涨(数字冲突待核实);LegalBench-RAG 类检索专项评测出现,标志评估从"推理能力"转向"检索落地" |
| **医疗** | AMIE 多轮就诊研究、FDA PCCP 动态监管推进(均待核实);MIRAGE 组合优化方法成为医疗 RAG 工程标配 |

---

## 8. 失败模式与避坑

| 失败模式 | 避坑 |
|---|---|
| **幻觉** | 金融 81% 错误率、法律"编造判例"丑闻(2023 纽约律师案)→ 无溯源输出一律拦截,强约束"仅依据检索证据作答 + 证据编号引用" |
| **合规风险** | 输出不可审计 = 违规 → 日志留存 prompt/检索证据/输出全链路(Anthropic 方案含 access_policies) |
| **数据孤岛与时效** | 知识库分散且变化快 → 统一数据治理 + 版本管理,按事件触发重建索引 |
| **架构误判** | 全局性问题硬套向量 RAG 必失败(GraphRAG 论文结论);多跳问题单跳检索不足(HippoRAG);长上下文"塞全量"不可行(FinanceBench) |
| **评测陷阱** | 只用公共基准刷分、无领域 golden set 与专家复核,上线即崩(FinBen/LawBench 均指出公共任务与真实差距) |

---

## 9. 为 Agent 生成的可执行框架

### 9.1 强监管行业落地检查清单

\`\`\`markdown
## 领域落地自查
□ 是否有领域 golden set(专家标注)作为最低性能门槛?
□ 是否强制引用溯源?(仅依据检索证据作答 + 证据编号引用)
□ 无溯源输出是否被拦截?
□ 是否有专家人工复核环节?(sign-off 内建)
□ 是否全链路审计?(prompt/检索证据/输出日志留存)
□ 数据治理是否到位?(多源结构化 + 敏感脱敏 + 版本管理)
□ 是否优先检索/RAG 优化而非盲目微调?(MIRAGE 结论)
□ 是否用 shadow eval + 红队 + 专家复核三轮验证?
□ 是否监控证据命中率与拒答率?(不只是答案准确率)
□ 是否按事件触发重建索引?(财报季/法规/指南更新)
\`\`\`

### 9.2 行业选型决策树

\`\`\`text
行业?
├─ 金融 → 研报/合规:Financial-services 套件 + 人工签核
├─ 法律 → 判例检索:LegalBench 类 golden set + 多跳检索(HippoRAG)
├─ 医疗 → CDSS:MedRAG 组合优化 + HIPAA 合规 + 安全护栏
└─ 跨行业 → 引用溯源 + 领域 golden set + 审计(§5 共性)
\`\`\`

### 9.3 供 Agent 生成领域落地框架的元规则

1. **溯源铁律**:无溯源输出一律拦截,证据编号引用
2. **领域评测先行**:专家标注 golden set 是上线前提,不用公共基准充数
3. **检索优先于微调**:通用模型 + 好检索常优于领域微调
4. **合规内建**:人工签核、全链路审计、敏感脱敏是架构的一部分
5. **时效驱动重建**:按行业事件触发索引重建
6. **双轨监控**:RAGAS 快速回归 + RAGChecker 分层诊断

---

## 10. 生态与资源

### 论文(编号已核实)
- 金融:[FinanceBench](https://arxiv.org/abs/2311.11944) ｜ [FinBen](https://arxiv.org/abs/2402.12659) ｜ [FinMem](https://arxiv.org/abs/2311.13743) ｜ [TradingAgents](https://arxiv.org/abs/2412.20138)
- 法律:[LegalBench](https://arxiv.org/abs/2308.11462) ｜ [LawBench](https://arxiv.org/abs/2309.16289)
- 医疗:[MedQA](https://arxiv.org/abs/2009.13081) ｜ [MIRAGE/MedRAG](https://arxiv.org/abs/2402.13178)
- 通用:[GraphRAG](https://arxiv.org/abs/2404.16130) ｜ [HippoRAG](https://arxiv.org/abs/2405.14831) ｜ [RAGAS](https://arxiv.org/abs/2309.15217) ｜ [RAGChecker](https://arxiv.org/abs/2408.08067)

### GitHub 仓库
- [anthropics/financial-services](https://github.com/anthropics/financial-services)(Apache 2.0)
- [FinanceBench](https://github.com/patronus-ai/financebench) ｜ [FinBen/PIXIU](https://github.com/The-FinAI/PIXIU)
- [FinMem](https://github.com/pipiku915/FinMem-LLM-StockTrading) ｜ [TradingAgents](https://github.com/TauricResearch/TradingAgents)
- [MedQA](https://github.com/jind11/MedQA) ｜ [HippoRAG](https://github.com/OSU-NLP-Group/HippoRAG) ｜ [RAGChecker](https://github.com/amazon-science/RAGChecker)

---

## 11. 参考来源

- arXiv 论文(编号逐条核实,见 §10;正文数据均出自论文摘要/README 原文)
- GitHub 高星仓库与官方文档
- 待核实项(2026-08-10 复核):Harvey AI 融资数据 **已核实**(2026-08 估值 155 亿)、FDA PCCP 更新 **已核实**(2024-12 定稿+2025-09 系列更新)、LegalBench-RAG 数据集 **已核实**(6,858 QA,arXiv:2408.10343);AMIE 研究结论、Look-Ahead-Bench 维持待核实
- 关联文档:[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md)、[Graph_RAG_Deep_Dive_Wiki.md](Graph_RAG_Deep_Dive_Wiki.md)、[Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md)、[Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实)、GitHub 高星仓库与官方文档综合而成。行业实证数据(81%、18%、10-30 倍等)均可回溯到对应论文摘要;待核实项均已明确标注。*
`;export{n as default};
