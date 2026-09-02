const n=`# LLM Wiki — Agent 经济性(Agent Economics / Cost Modeling)

> 面向 LLM Agent 的**Agent 经济性(Agent Economics)** 系统性知识库:从成本构成(token/延迟/基础设施/多 agent 膨胀)、成本-质量权衡(联合优化/分级路由/缓存/检索 vs 长上下文)、成本测算方法(预算/监控/单位经济)、成本优化策略(模型选型/上下文精简/并行/缓存),到 2025-2026 定价趋势与成本失控避坑,沉淀为可直接落地的一手成本管理资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**成本工程层**——与 [Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) §5(成本与风险)、[Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md)(评估)互补,聚焦"值不值"。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、Anthropic/DeepSeek 官方、GitHub 开源项目

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [成本构成](#2-成本构成)
3. [成本-质量权衡](#3-成本-质量权衡)
4. [成本测算方法](#4-成本测算方法)
5. [成本优化策略](#5-成本优化策略)
6. [2025-2026 定价趋势与商业模式](#6-2025-2026-定价趋势与商业模式)
7. [成本失控场景与避坑](#7-成本失控场景与避坑)
8. [为 Agent 生成的可执行框架](#8-为-agent-生成的可执行框架)
9. [生态与资源](#9-生态与资源)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

Agent 系统的成本随循环、多智能体数量放大(多 agent 约 15× token),无成本意识的设计会导致"精度好看、账单爆炸"。本文档建立成本构成认知、测算方法与优化策略。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解成本构成 → §2 → §3 权衡
目标:测算成本 → §4 测算方法 → §8 检查清单
目标:优化成本 → §5 优化策略
\`\`\`

### 1.3 一句话核心结论

> **评测必须"成本受控"——用精度-成本二维 Pareto 曲线评估,而非只看精度。** 简单任务先小模型,失败再升级(escalation)。

---

## 2. 成本构成

| 成本 | 说明 |
|---|---|
| **token 成本** | 输入远低于输出(多数 API 输出贵约 3–8 倍);缓存命中大幅打折(prompt caching:cache write 1.25×、cache hit 0.1×,即降 90%,延迟降 85%) |
| **延迟成本(时间价值)** | 长任务占用资源与用户等待;Anthropic"双层并行化"(3-5 子 agent + 子 agent 内并行工具)将复杂查询缩短约 90% |
| **基础设施成本** | 沙盒/存储/可观测/工具执行(例:SWE-Agent 单次运行封顶 $4) |
| **多 agent 膨胀** | Anthropic 内部数据:一次 Research 平均比普通聊天多约 **15× token**;BrowseComp 分析中 token 一项解释 80% 性能差异 |

> ⚠️ "单 agent 4×"无权威出处,**待核实**;15× 出自 Anthropic 官方博客(经翻译文章逐条核对)。

---

## 3. 成本-质量权衡

### 3.1 核心论文(编号已核实)

| 研究 | 核心主张 |
|---|---|
| **[AI Agents That Matter](https://arxiv.org/abs/2407.01502)** | 评测必须"成本受控",精度-成本二维 Pareto 曲线;实证:HumanEval 上精度相近的 agent 成本相差近两个数量级,LATS 比简单 warming 基线贵 50 倍;**escalation(先小模型、失败升级大模型)成本不到 LDB 一半且精度更高** |
| **[FrugalGPT](https://arxiv.org/abs/2305.05176)** | prompt 适配、LLM 近似、LLM cascade 三类策略,匹配 GPT-4 性能时最高省 **98%** 成本 |
| **[RouteLLM](https://arxiv.org/abs/2406.18665)** | 用偏好数据训练路由器在强弱模型间动态选择,部分场景成本降 2 倍以上且不损质量 |
| **[RAG or Long-Context(Self-Route)](https://arxiv.org/abs/2407.16833)** | 资源充足时长上下文性能更优,但 RAG 成本显著更低;Self-Route 保持 LC 级性能同时降本约 65% |

### 3.2 pass@k 陷阱

> AlphaCode 1000 次重试精度 15% → 百万次 30%+:精度增长**无成本上限**。用成本-精度 Pareto 评估而非只看精度。

---

## 4. 成本测算方法

### 4.1 Token 预算规划(Anthropic 经验法则)

\`\`\`text
简单事实查询   → 1 个 agent、≤10 次调用
比较类任务     → 2-4 个 agent、每个 10-15 次调用
复杂研究       → >10 个 agent
\`\`\`

按"每任务/每会话/每 agent"设上限。

### 4.2 监控与告警

| 工具 | 能力 |
|---|---|
| **Langfuse** | trace + 成本分析 + 预算告警 |
| **Helicone** | LLM 网关,按请求粒度成本追踪 |
| **LiteLLM** | 统一网关,内置 budget 控制 |

### 4.3 单位经济

- 以 **cost per task / cost per conversation** 为北极星指标
- SWE-Agent 以单次运行成本上限($4)作为预算基准,便于评估"值不值"

---

## 5. 成本优化策略

| 策略 | 说明 |
|---|---|
| **模型分级选型** | 按复杂度匹配档位(Opus/Sonnet/Haiku);escalation 动态升级;蒸馏出小模型 |
| **上下文精简** | 压缩/摘要(子 agent 只把关键结论压缩回主 agent)、检索而非全量塞入、精简工具输出 |
| **并行 vs 串行** | 并行不省 token(总消耗相近或更多)但显著降延迟;串行省上下文但慢——按延迟与成本双目标取舍 |
| **多 vs 单 agent** | 多 agent 用 ~15× token 换宽度优先任务约 90% 精度提升;单 agent 省 token、易调试 |
| **缓存策略** | prompt 缓存优先(稳定前缀前置、易变内容后置)+ 结果缓存(相同 query 直接返回) |

---

## 6. 2025-2026 定价趋势与商业模式

| 趋势 | 内容 |
|---|---|
| **DeepSeek 低价冲击** | R1 首发输入 ¥1/M(缓存命中)/¥4/M、输出 ¥16/M(约 $0.55/$2.19 每百万,转述);deepseek-chat 优惠期后 ¥2/¥8 |
| **涨价转向** | 2026-08-06 DeepSeek 官方宣布计划整体上调 API 定价(媒体转述,已联网核实:公告属实,具体方案以正式通知为准) |
| **推理模型定价** | 推理模型输出 token 消耗大、定价高于普通模型 |
| **小模型追赶** | 小模型性能快速逼近前代旗舰是持续趋势 |
| **商业模式** | 订阅制(Claude Pro/Max、Cursor 等)+ API 按 token 用量并存;行业开始探索按结果付费(outcome-based pricing,待核实) |

---

## 7. 成本失控场景与避坑

| 场景 | 避坑 |
|---|---|
| **无限循环/失控 agent** | 失败后同参数重试、循环推理不学习 → 设 max steps 与最大 token 预算硬上限 |
| **上下文膨胀** | 长对话全量重发、工具输出整段塞入,token O(n²) 增长 → 压缩/检索 |
| **多 agent 滥用** | 简单任务强行开多 agent(15× token)→ 先单 agent 跑通再升级 |
| **无监控无上限** | 月末账单爆炸 → 每任务/每会话设预算 + 接入 Langfuse 类工具 |
| **pass@k 幻觉** | 靠大量重试刷精度成本无上限 → 成本-精度 Pareto 评估 |

**避坑清单**:先小后大(escalation)、缓存优先、上下文精简、并行仅在降延迟必要时、预算硬上限 + 告警。

---

## 8. 为 Agent 生成的可执行框架

### 8.1 Agent 成本管理检查清单

\`\`\`markdown
## 成本管理自查
□ 是否用成本-精度 Pareto 评估?(而非只看精度)
□ 是否设 token 预算硬上限?(每任务/每会话/每 agent)
□ 是否接入成本监控与告警?(Langfuse/Helicone)
□ 是否启用 prompt 缓存?(稳定前缀前置)
□ 是否用 escalation?(先小模型,失败升级)
□ 简单任务是否避免多 agent?(15× token 警惕)
□ 是否压缩/检索而非全量塞上下文?
□ 是否以 cost per task 为北极星指标?
□ 并行是否只在降延迟必要时使用?
\`\`\`

### 8.2 成本优化决策树

\`\`\`text
任务?
├─ 简单事实查询 → 小模型单 agent + 缓存
├─ 中等复杂 → 分级路由(RouteLLM)/ escalation
├─ 需要检索 → RAG 优先(成本显著低于长上下文)
├─ 高价值强并行 → 多 agent(接受 15× token,设预算上限)
└─ 复杂研究 → 双层并行 + 子 agent 只回传关键结论
\`\`\`

### 8.3 供 Agent 生成成本框架的元规则

1. **成本受控**:一切评估带成本维度,Pareto 曲线
2. **escalation 优先**:先小模型,失败升级
3. **缓存第一**:prompt 缓存 + 结果缓存
4. **精简为王**:压缩、检索、精简输出,防 O(n²) 膨胀
5. **预算硬上限**:每任务/会话/agent 设限 + 告警
6. **单位经济**:以 cost per task 判断"值不值"

---

## 9. 生态与资源

### 论文(编号已核实)
- [AI Agents That Matter](https://arxiv.org/abs/2407.01502)
- [FrugalGPT](https://arxiv.org/abs/2305.05176)
- [RouteLLM](https://arxiv.org/abs/2406.18665)
- [RAG or Long-Context(Self-Route)](https://arxiv.org/abs/2407.16833)

### 官方与工具
- [Anthropic — Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)(15×/90%/80% 数据)
- [Anthropic — Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)(**1.25×/0.1×,已联网核实**:5 分钟缓存写入 1.25×、缓存读取 0.1×;1 小时缓存写入 2×)
- [DeepSeek 官方定价](https://api-docs.deepseek.com/)(转述,待核实)
- [Langfuse](https://github.com/langfuse/langfuse) ｜ [Helicone](https://github.com/Helicone/helicone)

---

## 10. 参考来源

- arXiv 论文(编号逐条核实,见 §9)
- Anthropic 官方博客(15× token、90% 延迟降幅、80% 方差解释)
- DeepSeek 官方定价与 2026-08 涨价计划(媒体转述,待核实)
- 待核实项:"单 agent 4×"、prompt caching 当前值、outcome-based pricing
- 关联文档:[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) §5、[Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实)、Anthropic/DeepSeek 官方与 GitHub 开源项目综合而成。标注:"单 agent 4×"无权威出处;定价数据以官方为准;待核实项均已明确标注。*
`;export{n as default};
