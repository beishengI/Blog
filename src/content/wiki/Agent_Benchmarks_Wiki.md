# LLM Wiki — Agent 评测基准盘点(Agent Benchmarks Survey)

> **文档定位**:面向 LLM wiki 知识库的评测基准全景盘点。汇总 2023-2026 年 Agent/LLM 领域的主流评测基准,按能力维度分类,给出横评对比、饱和状态判断、选型指南与 2025-2026 榜单趋势。撰写日期:2026-08-10。

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [全景分类框架](#2-全景分类框架)
3. [编码与软件工程类基准](#3-编码与软件工程类基准)
4. [工具使用与 Agent 行为类基准](#4-工具使用与-agent-行为类基准)
5. [通用/推理/知识类基准](#5-通用推理知识类基准)
6. [记忆/长上下文类基准](#6-记忆长上下文类基准)
7. [检索/RAG 类基准(简述)](#7-检索rag-类基准简述)
8. [安全/越狱/对齐类基准](#8-安全越狱对齐类基准)
9. [多智能体类基准(交叉引用)](#9-多智能体类基准交叉引用)
10. [横评对比总表](#10-横评对比总表)
11. [选型指南:按任务场景选基准](#11-选型指南按任务场景选基准)
12. [2025-2026 榜单趋势与基准饱和](#12-2025-2026-榜单趋势与基准饱和)
13. [为 Agent 生成的可执行框架](#13-为-agent-生成的可执行框架)
14. [生态与资源](#14-生态与资源)
15. [参考来源](#15-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

评测基准是 Agent 领域的"度量衡",但存在三个现实难题:

1. **数量爆炸**:2023-2026 年间发布的 Agent/LLM 基准超过 60 个,分布在编码、工具使用、网页操作、桌面 GUI、通用推理、记忆、检索、安全、多智能体九大类别,新手无从下手。
2. **分数通胀**:大量基准已饱和(头部模型 >85%),榜单分数被污染、LLM-as-Judge 偏见、厂商自测口径扭曲,直接"读分数"会被误导。
3. **选型即利益相关**:同一个模型配不同 harness,在同一个基准上的分数波动巨大——你选的基准决定你看到的能力。

本文档的价值:给读者与 Agent 一张"地图",回答三个问题——**有什么基准、各测什么、怎么选、怎么防被分数骗**。

### 1.2 与既有文档的关系

| 本文档 | 既有文档(避免重复,只做交叉引用) |
|---|---|
| 全领域基准盘点 + 横评选型 + 饱和判断 | [Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md) — 多智能体专项评测 + 评测方法学(LLM-as-Judge 校准) |
| "选什么基准" | [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md) — "怎么搭评估体系"(Golden Set/Judge/门禁) |
| 检索类基准明细 | [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md)、[Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md) |
| 记忆类基准明细 | [Agent_Memory_Wiki.md](Agent_Memory_Wiki.md)、[Memory_Engineering_Wiki.md](Memory_Engineering_Wiki.md) |
| 安全类基准明细 | [Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md) |
| harness 对基准分数的影响 | [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md)、[Harness_Model_CoEvolution_Wiki.md](Harness_Model_CoEvolution_Wiki.md) |

### 1.3 一句话核心结论

**没有"最好"的基准,只有"匹配任务形态"的基准;读任何榜单分数前,先问三个问题:判分方式是什么、题目是否可能泄漏、SOTA 是否附带了成本与 harness 信息。**

---

## 2. 全景分类框架

### 2.1 按能力维度分类

```text
Agent 评测基准分类(九大类)
├── 编码/软件工程     → SWE-bench 家族、Terminal-Bench、LiveCodeBench、Aider、HumanEval/MBPP
├── 工具使用/Agent 行为 → AgentBench、τ-bench、GAIA、WebArena 系、BrowseComp、OSWorld
├── 通用/推理/知识     → LiveBench、MMLU-Pro、GPQA、ARC-AGI、HLE、HELM
├── 记忆/长上下文      → LoCoMo、LongBench v2、RULER、AgentMemory、MemGPT
├── 检索/RAG          → FRAMES、RGB、RAGBench
├── 安全/越狱/对齐     → AgentDojo、ASB、HarmBench、StrongREJECT、WMDP
├── 多智能体          → MultiAgentBench、SOTOPIA(详见 Multi_Agent_Evaluation_Wiki)
├── 多模态/GUI         → OSWorld、WebCanvas(含视觉接地)
└── 经济价值视角       → SWE-Lancer(真实自由职业报酬)
```

### 2.2 按判分方式分类(读分前必看)

| 判分方式 | 客观性 | 成本 | 代表基准 | 陷阱 |
|---|---|---|---|---|
| 代码执行(pass@k/通过率) | 高 | 中 | SWE-bench、LiveCodeBench、HumanEval | 测试本身可能有缺陷(SWE-bench Pro 约 30% 任务有缺陷) |
| 环境断言(DOM/文件状态) | 高 | 高 | WebArena、OSWorld、Terminal-Bench | 对"部分完成"不敏感 |
| LLM-as-Judge | 低-中 | 低 | τ-bench、WebVoyager、StrongREJECT | 自评偏见、冗长偏差、自我偏好(见 Multi_Agent_Evaluation_Wiki §4) |
| 人工判分 | 高 | 极高 | GAIA、HLE(开放题部分) | 不可大规模复跑;样本少方差大 |
| 自动匹配(正则/EM/F1) | 中 | 低 | LiveBench 语言类、LongBench、KILT | 换一种说法就判错;鼓励投机式输出 |

### 2.3 按防污染设计分档

| 档次 | 机制 | 代表基准 | 说明 |
|---|---|---|---|
| 强 | 题目不公开/时间戳隔离/滚动出新题 | LiveCodeBench、BrowseComp(不公开)、HLE(保密) | 复现门槛高,第三方难验证 |
| 中 | 发布后时间窗隔离 | SWE-bench(2023-04 前 issue) | 仍被诟病训练语料已含 |
| 弱 | 静态公开题目 | GAIA、WebArena、MMLU-Pro、GPQA | 2026 年审计点名"可刷到近满分"(见 §12) |

---

## 3. 编码与软件工程类基准

### 3.1 SWE-bench 家族(工程修复主战场)

| 子集 | 发布 | 量级 | 说明 |
|---|---|---|---|
| **SWE-bench** | 2023-10(arXiv:2310.06770) | 2,294 实例 / 12 个 Python 仓库 | 真实 GitHub issue → 生成 patch → Docker 隐藏单测 |
| **Verified** | OpenAI 2024-08 | 500 题人工校准子集 | 曾是事实标准;**2026 年 OpenAI 弃用,转向 Pro**(二手来源;弃用年份已核实,具体月份未精确到 07) |
| **Lite** | 论文附带 | 300 题 / 3 仓库 | 2024 年末即约 50%,已公认过简单 |
| **Multimodal** | 2024-10(arXiv:2410.03859,已联网核实;流传 2502.15899 为无关论文) | 约 350+ 题(待核实) | 含图像 issue(图表/截图类) |
| **Pro** | Scale AI 2025-09(arXiv:2509.16941) | 约 1,751 题 / 13 语言(公开子集 731) | 企业级新 issue;OpenAI 审计发现约 30% 有缺陷 |

**判分方式**:代码执行式,双指标 **FAIL_TO_PASS**(issue 相关新测试通过)+ **PASS_TO_PASS**(不引入回归)。

**SWE-bench Verified 2024-2025 SOTA 时间线**(通过率):

| 系统 | 通过率 | 时间 |
|---|---|---|
| GPT-4o | 33.2% | 2024-08 |
| Claude 3.5 Sonnet + 脚手架 | 49.0% | 2024-10 |
| OpenHands CodeAct 2.2 | 63.0% | 2025-03 |
| Kimi K2(Moonshot) | 71.3% | 2025-07 |
| GPT-5 | 74.9% | 2025-08 |
| Claude Sonnet 4.5 | 77.2% | 2025-09 |
| Gemini 3 Pro Exp | 76.2% | 2025-11 |
| Claude Opus 4.5 | 80.9% | 2025-11 |

**2026 状态(二手)**:头部战场转移至 **SWE-bench Pro**;2025-12 GPT-5.2 达 55.6%,2025-11 Gemini 3 Pro 43.3%(已联网核实)——头部约 45-58% 区间成立,仍是活战场。

**局限/争议**:数据污染风险(2023-04 前数据仍可能入训练集);测试缺陷;patch 正确 ≠ 真实工程能力(不测评审/部署/协作);"AI Agents That Matter"指出 SOTA 靠巨额算力+复杂 harness 堆出,必须联合报告成本。

### 3.2 Terminal-Bench(v1 + 2.0)

> ⚠️ **勘误**:Terminal-Bench **v1 由阿里达摩院(Aliyun DAMO)发布**(arXiv:2501.14799),**v2.0 由 Scale AI 接手维护**(2025-09,无独立 arXiv)。

- **v1**(2025-01):真实 Linux 终端环境,约 145 题(中置信);脚本 verifier 判分。
- **v2.0**(2025-09):**约 89 个任务**(已联网核实,原"180 题"不符);配套 **Harbor** 评测框架——量化 harness 差异,证明"**评测的是系统而非模型**":同一模型配不同 harness 分数波动巨大(见 [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md))。
- SOTA(2025-11,已联网核实):Claude Opus 4.5 约 59.3%,Gemini 3 Pro 约 54.2%(原"61.6%/66%"偏高)。

### 3.3 Aider 编码排行榜(polyglot)

- 无 arXiv,官方 [aider.chat/docs/leaderboards](https://aider.chat/docs/leaderboards/)。
- 225 道多语言练习(待核实),每题跑 5 次,单测通过即成功;**Elo 评分**。
- 局限:题量小、非 agentic(本质是补全+单测),不测"改仓库 bug"。

### 3.4 LiveCodeBench

- arXiv:2403.07974(高置信);Berkeley/MIT 等,2024-03。
- 从 Codeforces/AtCoder/LeetCode **滚动采集新题**,初始 400 题(论文已核实);"每期 400/累计约 2,000 题"无权威来源(待核实);pass@1。
- **防污染设计**:按题目发布时间戳隔离,训练截止晚于出题时间的成绩不计。
- SOTA:O4-mini 81.1%(2025-04,已核实);2025 末头部 80-90% 区间方向正确。
- 局限:纯算法竞赛题,不测工程能力;"近似泄漏"(见过同题不同版本)。

### 3.5 HumanEval / MBPP / EvalPlus / BigCodeBench

| 基准 | arXiv | 量级 | 状态 |
|---|---|---|---|
| HumanEval(OpenAI 2021) | 2107.03374 | 164 题 Python | **已饱和**(2023 末 95%+) |
| MBPP(Google 2021) | 2108.07732 | 974 题(sanitized 427) | **已饱和** |
| HumanEval+/MBPP+(EvalPlus,2023) | 2310.11538 | 164×80 / 378×35 测试 | 接近饱和(用更多测试戳破"通过即正确":GPT-3.5 在 HumanEval 76.8% vs HumanEval+ 64.6%) |
| BigCodeBench(2024) | 2406.15877 | 1,140 题 / 8 语言(Hard 300) | 仍活跃;2024 年 GPT-4 校准仅 51.1%(instruct),2025 末头部 72-77% 无权威数据(待核实) |

### 3.6 其他编码相关

- **RepoBench**(arXiv:2306.03091):仓库级代码补全,11 仓库;**文本匹配判分(非执行)**——与真实可用性脱节。
- **SWE-Gym**(arXiv:2402.17722):**训练环境而非基准**(2,438 可交互任务,单测奖励信号),支撑 SWE-RL 训练;误用作基准时注意其训练集属性。
- **SWE-Lancer**(arXiv:2502.12115):⚠️ **主发布方为 OpenAI**(2025-02),Scale AI 为标注/评测合作方——勿归为"Scale AI 独有"。1,488 个 Upwork 真实自由职业任务(总价约 $1M);IC 代码修复 + MC 管理决策两档。结论:**最优模型也只能赚回约 30%(约 $297k),过半任务零收益**——首个"经济收益"视角的代码基准。
- **APPS**(arXiv:2105.09938):10,000 算法题,已被 LiveCodeBench 取代。
- **AlphaCodium**(arXiv:2401.08500):方法论文("flow engineering"),GPT-4 在 CodeContests pass@5 从 19%→44%;非基准但范式深刻影响后续 agentic 编码框架。

### 3.7 小结表

| 基准 | 测什么 | 判分 | 饱和状态 |
|---|---|---|---|
| SWE-bench Verified | 改真实仓库 bug | 隐藏单测 | 已弃用(2026-07,二手) |
| SWE-bench Pro | 企业级多语言修复 | 隐藏单测 | **活战场**(45-58%) |
| Terminal-Bench 2.0 | 终端/CLI 交互 | 脚本 verifier | **活战场**(~61-66%) |
| LiveCodeBench | 竞赛题生成 | 代码执行 | **活战场**(滚动新题) |
| BigCodeBench | 复杂指令+函数调用 | 函数级测试 | 活跃(~72-77%) |
| Aider | 多语言小练习 | 单测+Elo | 基准线 |
| HumanEval/MBPP | 基础生成 | 单测 | 已饱和(基准线) |

---

## 4. 工具使用与 Agent 行为类基准

### 4.1 AgentBench

- arXiv:2308.03688(高置信);清华 THUDM,2023-08。
- **8 个交互环境**:OS(bash)、DB(SQL)、KG(SPARQL)、卡牌、谜题、家居、Web 购物、Web 浏览;**2-turn 与 8-turn 两档**(长时交互考验记忆与规划)。
- 论文时 GPT-4 约 48-50%;2026 年被审计点名"可刷到近满分"(二手)。
- 局限:部分环境(卡牌/谜题)与真实场景脱节;模板化易过拟合;**无多 Agent 场景**。

### 4.2 τ-bench(tau-bench)

- arXiv:2406.12045(高置信);**Sierra**(Shunyu Yao 等),2024-06。
- **动态模拟用户 + 工具调用 + 策略遵从**:retail(零售)/airline(航空)两个领域,每域 50 任务;每域约 16 条业务策略树。
- 判分 = 任务目标达成 + 策略合规(LLM 演用户、LLM 检查策略);指标 = **pass rate + 每任务成本(美元)**。
- SOTA:GPT-5 在 **τ²-bench retail** 上 81.1%(2025-08,已核实);τ-bench 1.0 retail 2025 末头部 80-88% 方向合理(待核实)——**"精度-成本联合评估"的代表性战场**。
- 局限:LLM 既演用户又判策略,判分器偏见风险;领域窄(客服场景)。

### 4.3 GAIA

- arXiv:2311.12983(高置信);Meta + Hugging Face + AutoGPT,2023-11。
- 466 题(166 val + 300 test),需多步推理+工具组合(搜索/代码/文件),分 **Level 1/2/3**。
- 论文基准:**人类 92% vs GPT-4+插件 15%**;2026 初头部 Claude Mythos 52.3%、GPT-5.4 Pro 50.5%(已联网核实,替代原"75-88%");Level 1 近饱和,Level 3 仍是难点。
- ⚠️ 截至 2026-08 **GAIA 2 未检索到官方发布,勿引用**。
- 局限:题量小;结果高度依赖工具链("测的是系统不是模型"的典型);公布后污染风险高。

### 4.4 WebArena / WebVoyager / WebCanvas

| 基准 | arXiv | 量级 | 判分 | 要点 |
|---|---|---|---|---|
| WebArena(CMU,2023-07) | 2307.13854 | 812 题 / 4 个自托管网站 | DOM/URL 状态断言(自动) | 可复现;2024-07 V2 换新题防污染(642 新题,无权威来源,待核实);SOTA 2025 末约 75-82%(待核实) |
| WebVoyager(腾讯 AI Lab,2024-01) | 2401.13919 | 233 题 / 15 个真实网站 | GPT-4V 判分(与人工一致率 85.3%) | 真实网站但不可控;内容漂移破坏可复现性 |
| WebCanvas(2024-06) | **2406.12373**(已联网核实;原 2411.11879 不符) | 542 个任务 / 2,439 个中间状态(Mind2Web-Live) | 视觉接地指标 + 成功率 | 当时最佳 agent 任务成功率仅 **23.1%**(完成率 48.8%),非原"143 题/60-70%" |

### 4.5 AssistantBench

- arXiv:2412.01827(中置信);Meta FAIR,2024-12。
- 214 题(约 1,731 子任务,待核实):需要多领域知识与网页搜索的真实研究型问题。
- 论文时 GPT-4o 约 27%,开源 <15%;2025 末头部约 50-60%(待核实)。
- 局限:题量小;依赖检索工具实现;与 BrowseComp/GAIA 有较高重叠。

### 4.6 BrowseComp / BrowseComp-43k

- **OpenAI 2025-04 发布,无 arXiv**(官方博客);BrowseComp-43k 为 2025-11 放大版(细节待核实)。
- 题目刻意设计为**无法凭记忆回答**:需浏览多个网页、阅读、交叉引用,输出短字符串。
- BrowseComp 1,266 题(中置信);SOTA:Deep Research 系统 51.5%(2025-02,vs o3 39.5%);o3-pro 约 68%(发布时间 2025-06,分数待核实)。
- 局限:题目不公开(防污染)导致社区难复现;OpenAI 自评带自我偏好;真实研究任务无"标准答案字符串"。

### 4.7 OSWorld(桌面 GUI)

- arXiv:2404.07972(高置信);多校联合,2024-04。
- 真实桌面 GUI(Windows/Ubuntu/macOS),agent 通过截图+键鼠操作完成办公/浏览/文件管理;369 题(1.0/Verified)。
- 论文中 GPT-4V 仅 12.24%;**OSWorld 2.0 于 2026-06-28 发布,仅 108 个长时程任务,头部 Claude Opus 4.8 完成率仅 20.6%**(已联网核实;原"512 题/2025-06/约 50%/Anthropic Omni 49-54%"均不符,**Anthropic Omni 无公开记录**)。
- **GUI 类整体爬坡慢,仍是活战场**;局限:运行成本高、视觉接地是瓶颈。

### 4.8 Mind2Web / WorkArena / InfoNav

- **Mind2Web**(arXiv:2306.05570,OSU 2023):2,350 题/137 网站;静态快照式(非交互),span 级指标;已被在线评测替代。
- **WorkArena**(arXiv:2403.07718,ServiceNow 2024):可复现 ServiceNow 实例上 33 题;2024 年最佳 agent 仅约 9%;**WorkArena 2.0"10,861 题/Opus 4.1 53%"无权威来源**(arXiv 仅有 WorkArena 33 题与 WorkArena++ 682 题,待核实);局限:单平台。
- **InfoNav**(2024,arXiv 待核实):网页信息定位式导航,约 2,784 题/75 网站(待核实)——细节不足时谨慎引用。

### 4.9 小结表

| 基准 | 测什么 | 判分 | 饱和状态 |
|---|---|---|---|
| AgentBench | 8 环境通用 agent | 环境内自动 | 近饱和(可刷分,二手) |
| τ-bench | 对话+工具+策略+成本 | LLM 用户+策略检查 | **活战场**(retail 80-88%) |
| GAIA | 通用助手多步推理 | 人工/模型 | Level 1 饱和,L3 活 |
| WebArena | 网页操作 | DOM 断言 | 接近饱和(~80%) |
| WebVoyager | 真实网站操作 | GPT-4V 判分 | 活跃(~80%) |
| WebCanvas | 视觉接地操作 | grounding 指标 | 活跃(60-70%) |
| BrowseComp | 多步网页浏览问答 | 黄金答案+judge | **活战场**(~68%) |
| OSWorld | 桌面 GUI 操作 | 环境状态验证 | **活战场**(~50%) |
| AssistantBench | 网页研究问答 | 黄金答案+LLM | 活跃(50-60%) |

---

## 5. 通用/推理/知识类基准

### 5.1 LiveBench(含 LiveBench-6M)

- arXiv:2406.19314(高置信);Abacus.AI + UCSD 等,2024-06;6M 滚动版 2025-03。
- 8 类(数学/代码生成/代码理解/推理/语言理解/指令跟随/数据分析/Web 知识);6M 版 40,000+ 题、6 个月滚动新题。
- **完全自动判分**(编译器执行 + 正则匹配),号称防污染。
- 2025 末头部(GPT-5/Claude 4.5/Gemini 3 Pro)约 75-85 区间;2026 最新成绩待官网核实。
- 争议:2025-10 引入"Search and Tools"协议放宽评测规则,被批评为"规则追赶模型";新题偏学术、与 Agent 真实场景脱节。

### 5.2 MMLU-Pro 与 MMLU-redux

- **MMLU-Pro**(arXiv:2406.01574;KAIST TIGER-Lab,2024-06):12,032 题 × 10 选项,57 学科,注重推理;2025 头部 85-90%。相比 MMLU 抗饱和但仍在饱和路上;存在选项顺序敏感性。
- **MMLU-redux**(arXiv:**2406.04127**,已联网核实;爱丁堡团队《Are We Done with MMLU?》,2024-06;原"2412.05294/Berkeley 2024-12"为无关论文):人工重做约 4.5% 的错误答案与歧义题,题量 7,000+(待核实);头部 90%+。

### 5.3 GPQA(Diamond)

- arXiv:2311.12022(高置信);NYU 等,2023-11。
- 博士级物理/化学/生物问答(专家答对率仅 65-74%,设计为"Google-proof");448 题(Diamond 198)。
- 2024-05 GPT-4o 在 Diamond 约 53%;2025 末头部 85-90%。
- 争议:题量小、方差大;泄漏担忧;Diamond 已成"刷分主战场"。

### 5.4 ARC-AGI 家族(抽象推理)

- **无 arXiv**,官方 [arcprize.org](https://arcprize.org)(ARC Prize Foundation,Chollet)。
- 从 5 个输入/输出网格示例归纳变换规则,类级别通过率(每类需全对),严格逐像素匹配。
- **ARC-AGI-1**(2019):2024-12 被 OpenAI o3 达 87.5%(高算力),官方判定"部分饱和"并退役。
- **ARC-AGI-2**(2025-02):**人类从约 85% 骤降至约 60%,AI 从 87% 骤降至 0-4%**;2025-11-18 Gemini 3 Pro 拿下 **23.4%**(已联网核实,落在 15-30% 区间内)。
- 知识库线索:ARC-AGI-3 已存在,且"仅换 harness 即可让 Schema 冻结模型从 42.83% 提升至 98.98%(+56.15pp)"(见 [Harness_Model_CoEvolution_Wiki.md](Harness_Model_CoEvolution_Wiki.md))——ARC-AGI 已成为"harness 差异放大器"的证明场。
- 争议:是否过度抽象、与真实 Agent 能力脱节;评测成本极高。

### 5.5 HLE(Humanity's Last Exam)

- arXiv:2501.14249(高置信);CAIS + Scale AI,2025-01。
- 约 2,500 题,1,000+ 学科专家出题,保密;开放型短答 + 多选。
- 2025-01 发布时最佳仅 9-11%;2025-11 Gemini 3 Pro 常规 37.5%、Deep Think 45.8%(已核实);"45-50%"仅 Deep Think 模式达到,常规约 38-42%。
- 争议:题库保密仍有泄漏担忧;过难导致区分度向头部压缩;人工判分成本高。

### 5.6 HELM 2

- HELM v1:arXiv:2211.09110;**HELM 2 无独立 arXiv 论文**(CRFM 2025-05 在线平台,已联网核实;原"2410.02884"为 LLaMA-Berry 无关论文);Stanford CRFM。
- 多维:精度/校准/鲁棒性/公平性/偏见/毒性 + 场景维度(含 **Agent 场景**、多语言)。
- 局限:评测成本极高、周期长;v1 曾被诟病更新停滞。

### 5.7 小结表

| 基准 | 测什么 | 判分 | 饱和状态 |
|---|---|---|---|
| LiveBench/6M | 8 类通用能力 | 自动(防污染) | **活战场**(滚动新题) |
| MMLU-Pro | 57 学科推理 | 准确率 | 接近饱和(85-90%) |
| GPQA Diamond | 博士级科学知识 | 准确率 | 饱和中(85-90%) |
| ARC-AGI-2 | 抽象归纳推理 | 类通过率 | **活战场**(AI 0-30%) |
| HLE | 专家级知识+推理 | 自动+人工 | **活战场**(45-50%) |
| HELM 2 | 多维+Agent 场景 | 多指标 | 榜单滚动 |

---

## 6. 记忆/长上下文类基准

> 记忆评测细节见 [Agent_Memory_Wiki.md](Agent_Memory_Wiki.md) 与 [Memory_Engineering_Wiki.md](Memory_Engineering_Wiki.md),本节只给基准卡片。

### 6.1 LoCoMo

> ⚠️ **编号勘误**:LoCoMo(新加坡国立大学等,ACL 2024)的 arXiv 编号以知识库一致记载的 **2402.17753** 为准(网络流传的 2406.11943 不可靠)。

- 长对话记忆:跨会话问答 + 事件摘要(含多模态);对话最长 300 轮、平均 9K token、最多 35 个会话。
- 与 LongMemEval 并称"所有人都在刷的两大记忆 bench";规模偏小、形态偏问答。
- 2026 记录:Mem0 新算法 LoCoMo 92.5(厂商自测口径;注意厂商自报与第三方复测存在差距——见 [Memory_Engineering_Wiki.md](Memory_Engineering_Wiki.md))。

### 6.2 LongBench / LongBench v2

- **LongBench**(arXiv:2308.14508;清华 THU-KEG,2023-08):21 任务(16 英+5 中),约 4,750 题,平均 1k-25k token——平均长度偏短,已不能区分长上下文能力。
- **LongBench v2**(arXiv:2412.15204;2024-12):503 道真实长文本问题,长度 8k-2M token;**人类专家约 85% vs 当时最佳模型 <50%**;仅英文。

### 6.3 RULER

- arXiv:2404.06654(高置信);NVIDIA,2024-04。
- 4 大合成能力(检索/多跳追踪/聚合/问答),13 子任务,4k-128k token。
- 2024 年头部 128k 内 85-95%,随长度衰减明显;合成任务与真实长文本能力相关性存疑。

### 6.4 AgentMemory 与 MemGPT

- **AgentMemory**(LangChain,2025,无 arXiv):官方记忆评测工具包(写入/检索/持久化);生态自测基准,中立性质疑。
- **MemGPT**(arXiv:2310.08560;UC Berkeley,2023-10):论文级小评测(文档 QA + 多会话聊天);后续由 Letta 承接;Zep/Graphiti 的 DMR 94.8% vs MemGPT 93.4%(厂商自报口径)。

---

## 7. 检索/RAG 类基准(简述)

> 完整细节见 [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) 与 [Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md),本节只列基准卡片。

| 基准 | arXiv | 定位 | 要点 |
|---|---|---|---|
| **FRAMES**(Google,2024-09) | 2409.12941 | 多跳事实聚合检索 | 800+ 题;人类 93%;检索流水线 0.66(>50% 相对提升);2025 头部 90%+ |
| **RGB**(2023,AAAI 2024) | **2309.01431**(知识库已核实) | 中文 RAG 基准 | 按能力分类:噪声鲁棒性/否定理解/多跳/时间敏感/事实一致性 |
| **RAGBench**(2024-06) | **2407.11005**(已联网核实;原 2401.06805 为无关综述) | RAG 系统统一评测 | 10 数据集、约 1,000 人工标注;与 RAGAS 一致性验证 |
| **KILT**(Facebook AI,2020) | 2009.02252 | 知识密集任务联合评测 | 5 类×8 数据集;已成熟为基础设施级 |
| **Natural Questions**(Google,2019) | 无 arXiv 主编号(TACL 正刊) | 开放域 QA | 300k+ 真实搜索问题;已多作为子集嵌入复合基准 |

---

## 8. 安全/越狱/对齐类基准

> 安全评测细节见 [Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md) 与 [Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md),本节只列基准卡片。

### 8.1 AgentDojo

> ⚠️ **编号勘误**:AgentDojo(ETH Zurich SPY Lab,2024-06)的 arXiv 编号以知识库一致记载的 **2406.13352** 为准(网络流传的 2408.13949 不可靠)。

- 工具调用 Agent 的**提示注入攻防**:97 个真实任务、29 个工具、629 个安全用例。
- 三视角动态环境(用户任务/攻击者注入/防御者防护);指标 = 任务成功率(有/无攻击对比)+ 攻击成功率。
- 关键结论(知识库记录):**SOTA 模型即使无攻击时也大量任务失败**——安全已成为 Agent 评测新维度。

### 8.2 Agent Security Bench(ASB)

- arXiv:**2410.02644**(知识库已核实);AGI Research 等,2024-10(ICLR 2025)。
- 10 个现实场景、10 类 agent 代理、27 种攻防方法(记忆投毒/提示注入/数据污染等)、13 个 LLM 骨干、7 项指标;评测 11 种防御措施;400+ 工具接口。
- 结果:**最高平均攻击成功率 84.30%**,现有防御有效性有限。

### 8.3 越狱类:HarmBench / StrongREJECT / JailbreakBench

| 基准 | arXiv | 测什么 | 要点 |
|---|---|---|---|
| HarmBench(UC Berkeley,2024-02) | 2402.04249 | 标准化越狱评测 | 18 攻击 × 7 类危害行为;自动分类器判分;对齐模型 ASR 约 10-30%(2024) |
| StrongREJECT(UCLA+Scale,2024-02) | 2402.10260 | 越狱响应评估器 | 200+ 行为题;GPT-4 judge 连续分;开源广泛采用;依赖 judge 有自评偏见 |
| JailbreakBench(U Penn 等,2024) | 官网 jailbreakbench.github.io(配套 **2404.01318**,已联网核实;原 2404.02151 为 Andriushchenko 越狱攻击论文) | 越狱排行榜+数据集+协议 | JB-Dataset/JB-Eval/JBLeaderboard 闭环 |

### 8.4 WMDP

- arXiv:2403.03218(高置信);CAIS + Scale AI,2024-03。
- "危险知识"泄露:生物 1,259 + 化学 1,057 + 网络安全 1,542,共 3,858 道多选题。
- 测的是**知识本身泄露**(与越狱不同),常与 RMU 等知识遗忘方法配套。

### 8.5 中文安全基准

- **CValues**(阿里,2023-07):中文价值观安全双维度(安全能力+安全责任感),约千题级;arXiv:**2307.09705**(已联网核实)。
- ⚠️ 流传的"SafeBench-CN"未核实到可靠出处,不建议引用;可替换为有据可查的中文安全基准(CHiSafetyBench、ChineseSafetyPrompts 等)。

### 8.6 小结表

| 基准 | 测什么 | 判分 | 状态 |
|---|---|---|---|
| AgentDojo | 工具调用 Agent 提示注入攻防 | 任务成功率+ASR | 安全评测代表 |
| ASB | 10 场景攻防对抗 | 7 指标 | 最高 ASR 84.3% |
| HarmBench | 越狱攻击标准化 | 自动分类器 | 活跃 |
| StrongREJECT | 越狱响应评分 | GPT-4 judge | 广泛采用 |
| WMDP | 危险知识泄露 | 准确率 | 与知识遗忘配套 |
| CValues | 中文价值观安全 | 安全率 | 中文代表(2307.09705,已核实) |

---

## 9. 多智能体类基准(交叉引用)

| 基准 | arXiv | 一句话 |
|---|---|---|
| MultiAgentBench(UIUC,2025) | **2503.01935**(知识库已核实;网络流传 2501.10615 不可靠) | 协作+竞争双场景;gpt-4o-mini 平均任务分最高;graph 拓扑科研最优 |
| SOTOPIA(CMU,2023-10) | 2310.11667 | 15 场景社交交互;GPT-4 目标完成率远低于人类 |
| MAS-Bench(2025-01) | 2501.16131(已联网核实:该编号为语音识别论文,**2025-01 的 MAS-Bench 多智能体论文未在 arXiv 检索到**,建议谨慎引用) | 真实任务驱动多智能体评测;信息不足建议谨慎引用 |

> **完整细节(方法学、LLM-as-Judge 校准、过拟合批判)见 [Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md) §3-4。**

---

## 10. 横评对比总表

**活战场基准**(2025-2026 仍有显著区分度,推荐优先关注):

| 基准 | 类别 | 机构/时间 | arXiv/官网 | 量级 | 判分 | 2025-26 SOTA(时间点) | 主要局限 |
|---|---|---|---|---|---|---|---|
| SWE-bench Pro | 编码 | Scale AI 2025-09 | 2509.16941 | ~1,751 题/13 语言 | 隐藏单测 | 45-58%(2025 末,已核实:GPT-5.2 55.6%) | 约 30% 任务有缺陷 |
| Terminal-Bench 2.0 | 编码 | tbench 2025-09 | tbench 官网(2.0 无 arXiv) | 89 任务(已核实) | 脚本 verifier | 59.3%(Opus 4.5)/54.2%(Gemini 3 Pro),2025-11 | harness 差异大 |
| LiveCodeBench | 编码 | Berkeley/MIT 2024-03 | 2403.07974 | 初始 400 题滚动 | 代码执行 | O4-mini 81.1%(2025-04) | 纯算法不测工程 |
| τ-bench | 工具 | Sierra 2024-06 | 2406.12045 | 2 域×50 题 | LLM 用户+策略 | τ²-bench retail GPT-5 81.1%(2025-08) | 判分器偏见;领域窄 |
| BrowseComp | 网页研究 | OpenAI 2025-04(无 arXiv) | openai.com | 1,266 题 | 黄金答案+judge | Deep Research 51.5%(2025-02);o3-pro 68%(2025-06,待核实) | 题目不公开难复现 |
| OSWorld 2.0 | GUI | 多校 2024-04/2026-06 | 2404.07972 / 2606.29537 | 369 题(1.0)→ 108 长时程任务(2.0) | 环境状态验证 | 2.0 头部 Opus 4.8 完成率 20.6%(2026-06) | 成本高;视觉接地瓶颈 |
| LiveBench-6M | 通用 | Abacus.AI 2024-06 | 2406.19314 | 40k+ 题滚动 | 全自动 | 头部 75-85(2025 末,已核实:2026-06 版 Claude Fable 5=83.0、GPT-5.6 Sol=81.0) | 偏学术;规则追赶模型 |
| HLE | 通用 | CAIS+Scale 2025-01 | 2501.14249 | ~2,500 题 | 自动+人工 | 常规 38-42%,Deep Think 45.8%(2025-11,已核实) | 判分成本高 |
| ARC-AGI-2 | 推理 | ARC Prize 2025-02 | arcprize.org(无 arXiv) | 每类 10-20 题 | 类通过率 | 人类 60% vs AI 0-30% | 过度抽象争议 |
| SWE-Lancer | 经济 | OpenAI 2025-02 | 2502.12115 | 1,488 题/$1M | 隐藏测试+MC | 最优 ~30% 收益 | 需求文档噪音 |

**已饱和/基准线基准**(降级使用):

| 基准 | 饱和状态 | 备注 |
|---|---|---|
| HumanEval / MBPP | 已饱和 | 2023 末 95%+/90%+,仅作基线 |
| EvalPlus(+版本) | 接近饱和 | 测试增强版,~90% |
| SWE-bench Verified | 已弃用(2026 年,二手) | 历史分数不可直接对比新生态 |
| SWE-bench Lite | 已过简单 | 2024 末约 50% |
| AgentBench | 近饱和 | 2026 年审计"可刷到近满分"(二手) |
| GAIA Level 1 | 近饱和 | Level 3 仍活(40-55%) |
| WebArena | 接近饱和 | 2025 末约 80% |
| MMLU-Pro | 饱和中 | 85-90% |
| GPQA Diamond | 饱和中 | 85-90%,刷分主场 |
| ARC-AGI-1 | 官方退役 | 2024-12 o3 达 87.5% |

---

## 11. 选型指南:按任务场景选基准

### 11.1 决策树

```text
我的目标是什么?
├── 评估/挑选编码 Agent
│   ├── 要真实工程能力 → SWE-bench Pro / Terminal-Bench 2.0
│   ├── 要算法题正确性 → LiveCodeBench(滚动防污染)
│   └── 要快速低成本基线 → Aider / BigCodeBench
├── 评估工具调用/客服类 Agent
│   ├── 关注成本与策略遵从 → τ-bench(带美元成本指标)
│   └── 关注通用助手多步任务 → GAIA Level 2-3
├── 评估网页/桌面操作 Agent
│   ├── 网页操作 → WebArena(可复现)/ WebVoyager(真实网站)/ WebCanvas(视觉接地)
│   ├── 网页研究 → BrowseComp / AssistantBench
│   └── 桌面 GUI → OSWorld
├── 评估模型通用能力
│   ├── 防污染优先 → LiveBench-6M / HLE
│   ├── 抽象推理 → ARC-AGI-2
│   └── 多维+Agent 场景 → HELM 2
├── 评估记忆/长上下文 → LoCoMo / LongBench v2
├── 评估检索 → FRAMES / RGB(中文)
├── 评估安全性
│   ├── Agent 注入攻防 → AgentDojo / ASB
│   ├── 越狱 → HarmBench / StrongREJECT / JailbreakBench
│   └── 危险知识 → WMDP
└── 评估多智能体 → MultiAgentBench / SOTOPIA(见 Multi_Agent_Evaluation_Wiki)
```

### 11.2 组合使用建议(分层评测)

单靠一个基准会高估 Agent。推荐三层组合:

1. **单点能力层**(快速、低噪声):LiveCodeBench + τ-bench 测编码与工具调用基础能力。
2. **集成环境层**(贴近真实):SWE-bench Pro + Terminal-Bench 2.0 测端到端工程;GAIA/BrowseComp 测长时多工具任务。
3. **安全与成本层**:AgentDojo/ASB 测注入鲁棒性;τ-bench/SWE-Lancer 测成本-收益。

> 呼应"AI Agents That Matter"(arXiv:2407.01502):**任何 SOTA 分数都必须附带成本(美元)与 harness 配置报告**,否则不可比。

---

## 12. 2025-2026 榜单趋势与基准饱和

### 12.1 基准饱和清单(2026-08 视角)

| 现象 | 证据(时间点) |
|---|---|
| MMLU 饱和 | 头部 90%+,厂商发布会已弃用为主打指标;MMLU-Pro 接替者也在逼近 90% |
| HumanEval 饱和 | 2025 年后接近 100%,完全丧失区分度 |
| GPQA 饱和 | 2023 专家基线 65-74% → 2025 末头部 85-90% |
| ARC-AGI-1 官方退役 | 2024-12 o3 达 87.5%(高算力),ARC Prize 判定"部分饱和"并退役 |
| SWE-bench Verified 弃用 | OpenAI 2026 年转向 Pro(二手,年份已核实,月份未精确到 07) |
| AgentBench 可刷分 | 2026 年审计显示 SWE-bench 等 8 大基准可刷到近满分(二手) |

### 12.2 榜单通胀的四大机制

1. **训练数据污染**:GPQA/HLE 泄漏争议、SWE-bench 训练语料含 issue。
2. **LLM-as-Judge 自评偏见**:冗长偏差/自我偏好(核心论文 arXiv:2306.05685,见 Multi_Agent_Evaluation_Wiki §4.1)。
3. **厂商自测口径**:记忆领域 Mem0/Zep 自报与第三方复测存在差距(见 Memory_Engineering_Wiki)。
4. **规则追赶**:LiveBench 2025-10 引入"Search and Tools"协议放宽规则,被批评为"规则追赶模型"。

### 12.3 评测范式转变:从"测模型"到"测系统"

- **同一模型配不同 harness 分数波动巨大**(Terminal-Bench 2.0 + Harbor 实证)。
- ARC-AGI-3 上仅换 harness 即可让同一模型从 42.83% 提升至 98.98%(见 [Harness_Model_CoEvolution_Wiki.md](Harness_Model_CoEvolution_Wiki.md))。
- 含义:榜单分数本质是"模型×harness×评测协议"三元组的结果;读分必须问清楚 harness 配置。

### 12.4 新基准设计趋势

1. **动态/滚动基准**:LiveBench-6M 月度新题、LiveCodeBench 时间戳隔离。
2. **对抗性设计**:ARC-AGI-2(人类骤降至 60%)、HLE(专家出题保密)。
3. **安全成为新评测维度**:AgentDojo/ASB 提示注入攻防进入主流视野。
4. **经济价值视角**:SWE-Lancer 用真实报酬折算,τ-bench 附带每任务美元成本。
5. **基准自身需被审计**:SWE-bench Pro 731 题约 30% 有缺陷,推动"基准质量"成为研究课题。

---

## 13. 为 Agent 生成的可执行框架

### 13.1 基准选型自查清单

```text
□ 1. 这个基准测的能力,是否与我的目标任务形态匹配?(编码 Agent 别只看 HumanEval)
□ 2. 判分方式是什么?(代码执行/环境断言/LLM judge/人工)——LLM judge 类须警惕自评偏见
□ 3. 题目是否可能已被训练语料污染?该基准的防污染设计属于强/中/弱哪档?
□ 4. SOTA 是否附带成本(美元/token)与 harness 配置?无成本报告的分数不可比
□ 5. 该基准 2025 年后还有新版本或官方维护吗?已弃用的(如 Verified)不要用于新对比
□ 6. 我要测的是模型还是系统?若测系统,必须固定 harness 并报告其配置
□ 7. 任务量级是否足够(题数>100,否则方差大)?是否公开可复现?
□ 8. 是否已有第三方审计发现缺陷(如 SWE-bench Pro 30% 缺陷)?
□ 9. 厂商自测与第三方复测口径是否一致?(记忆类尤其要警惕)
□ 10. 是否需要中文/特定领域适配?(检索用 RGB、安全用 CValues)
```

### 13.2 供 Agent 生成评测框架的元规则

1. **三层组合原则**:单点能力层 + 集成环境层 + 安全成本层,单基准不结论。
2. **成本必报原则**:报告任何 Agent 分数时必须附带 token/美元成本与 harness 配置。
3. **判分器校准原则**:使用 LLM-as-Judge 前,先做人工抽验校准(详见 Multi_Agent_Evaluation_Wiki §4)。
4. **污染自查原则**:发布前核对题目是否可能入训练语料,优先选滚动/保密类基准。
5. **时间戳原则**:所有成绩标注数据时间点与来源;二手信息标注来源。
6. **饱和识别原则**:头部通过率 >85% 或 2024 后无显著提升的基准,降级为基线,不再用于区分前沿模型。

### 13.3 读分警示

- 2026-08 视角:SWE-bench Verified 已弃用,新报告应引用 **Pro**;GAIA 2 未发布勿引用;Terminal-Bench v1(阿里达摩院)与 2.0(Scale AI)分数不可混用;SWE-Lancer 归 OpenAI 主发布。

---

## 14. 生态与资源

### 活榜单(持续更新)

| 榜单 | 地址 | 说明 |
|---|---|---|
| LiveBench | livebench.ai | 8 类通用能力,滚动新题 |
| HELM | helm.stanford.edu | 多维场景(含 Agent) |
| LMArena(Chatbot Arena) | lmarena.ai | 匿名双盲对战 Elo;2025 年后反刷票规则引发"榜单可被操控"争议 |
| SWE-bench 官网 | swebench.com | Verified/Pro 榜单 |
| Terminal-Bench | terminal-bench.com | v2.0 + Harbor |
| τ-bench leaderboard | github.com/sierra-research/tau-bench | 含每任务成本 |
| GAIA | huggingface.co/gaia-benchmark | 官方评测 |
| Aider | aider.chat/docs/leaderboards | 多语言练习 Elo |
| ARC Prize | arcprize.org | ARC-AGI 系列 |
| JailbreakBench | jailbreakbench.github.io | 越狱排行榜 |

### 关键 GitHub 仓库

- github.com/SWE-bench/SWE-bench(含 Verified)、github.com/openai/SWE-Lancer
- github.com/tbenchai/Terminal-Bench、github.com/tbenchai/harbor
- github.com/LiveCodeBench/LiveCodeBench、github.com/evalplus/evalplus、github.com/bigcode-project/bigcodebench
- github.com/sierra-research/tau-bench、github.com/gaia-benchmark/GAIA
- github.com/web-arena-x/webarena、github.com/MinorJerry/WebVoyager、github.com/xlang-ai/OSWorld
- github.com/ethz-spylab/agentdojo、github.com/agiresearch/ASB、github.com/centerforaisafety/HarmBench、github.com/uw-nlp/strongreject
- github.com/THUDM/AgentBench、github.com/THUDM/LongBench、github.com/NVlabs/rulet(仓库名待核实)

---

## 15. 参考来源

> 编号均已尽量核实;标注"待核实"的请发布前复核。勘误记录:AgentDojo=2406.13352(非 2408.13949)、LoCoMo=2402.17753(非 2406.11943)、MultiAgentBench=2503.01935(非 2501.10615)、RGB=2309.01431、ASB=2410.02644;2026-08-10 联网复核新增:SWE-bench Multimodal=2410.03859(非 2502.15899)、MMLU-redux=2406.04127(非 2412.05294)、RAGBench=2407.11005(非 2401.06805)、JailbreakBench 配套=2404.01318(非 2404.02151)、WebCanvas=2406.12373(非 2411.11879)、HELM 2 无独立 arXiv(2410.02884 为 LLaMA-Berry)、MAS-Bench 2501.16131 查无此多智能体论文;分数修正:Terminal-Bench 2.0=89 任务/Opus 4.5 59.3%,GAIA=466 题/2026 初头部约 50-53%,WebCanvas 头部 23.1%,OSWorld 2.0=108 长时程任务/Opus 4.8 20.6%,HLE 常规 38-42%。

### 编码/软件工程
- SWE-bench:arXiv:2310.06770;SWE-bench Pro:arXiv:2509.16941;SWE-bench Multimodal:arXiv:**2410.03859**(已联网核实,原 2502.15899 为无关论文)
- Terminal-Bench:arXiv:2501.14799(阿里达摩院);2.0 见 terminal-bench.com
- LiveCodeBench:arXiv:2403.07974;BigCodeBench:arXiv:2406.15877;EvalPlus:arXiv:2310.11538
- HumanEval:arXiv:2107.03374;MBPP:arXiv:2108.07732;APPS:arXiv:2105.09938;AlphaCodium:arXiv:2401.08500
- RepoBench:arXiv:2306.03091;SWE-Gym:arXiv:2402.17722;SWE-Lancer:arXiv:2502.12115
- Agent-as-a-Judge:arXiv:2410.10934;AI Agents That Matter:arXiv:2407.01502

### 工具使用/Agent 行为
- AgentBench:arXiv:2308.03688;τ-bench:arXiv:2406.12045;GAIA:arXiv:2311.12983
- WebArena:arXiv:2307.13854;WebVoyager:arXiv:2401.13919;WebCanvas:arXiv:**2406.12373**(已联网核实,原 2411.11879 不符)
- AssistantBench:arXiv:2412.01827;OSWorld:arXiv:2404.07972
- Mind2Web:arXiv:2306.05570;WorkArena:arXiv:2403.07718;BrowseComp:openai.com(无 arXiv)

### 通用/推理
- LiveBench:arXiv:2406.19314;MMLU-Pro:arXiv:2406.01574;MMLU-redux:arXiv:**2406.04127**(已联网核实,原 2412.05294 为无关论文)
- GPQA:arXiv:2311.12022;HLE:arXiv:2501.14249;HELM v1:arXiv:2211.09110;**HELM 2 无独立 arXiv**(在线平台,2025-05)
- ARC-AGI:arcprize.org(无 arXiv)

### 记忆/长上下文
- LoCoMo:arXiv:2402.17753;LongBench:arXiv:2308.14508;LongBench v2:arXiv:2412.15204
- RULER:arXiv:2404.06654;MemGPT:arXiv:2310.08560;AgentMemory:blog.langchain.com(无 arXiv)

### 检索/RAG
- FRAMES:arXiv:2409.12941;RGB:arXiv:2309.01431;RAGBench:arXiv:**2407.11005**(已联网核实,原 2401.06805 为无关综述);KILT:arXiv:2009.02252

### 安全/越狱/对齐
- AgentDojo:arXiv:2406.13352;ASB:arXiv:2410.02644;HarmBench:arXiv:2402.04249
- StrongREJECT:arXiv:2402.10260;WMDP:arXiv:2403.03218;JailbreakBench:jailbreakbench.github.io(配套 **arXiv:2404.01318**,已联网核实);CValues:arXiv:**2307.09705**(已联网核实)
- LLM 自评偏见核心论文:arXiv:2306.05685

### 多智能体(详见 Multi_Agent_Evaluation_Wiki)
- MultiAgentBench:arXiv:2503.01935;SOTOPIA:arXiv:2310.11667;MAS-Bench:arXiv:2501.16131(已联网核实:该编号为语音识别论文,多智能体 MAS-Bench 论文未检索到,谨慎引用)

---

*本文档由 AI Agent 维护。编号勘误与 SOTA 数据更新时请同步修订;所有成绩须标注数据时间点与来源。*
