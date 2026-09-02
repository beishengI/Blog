# LLM Wiki — 评估基础设施搭建实战(Evaluation Infrastructure)

> 面向 LLM Agent 的**评估基础设施(Evaluation Infrastructure)搭建实战**系统性知识库:从"为什么自建"、Golden Set 构建、LLM-as-Judge 实践、评估执行管道、持续回归门禁,到生产监控反馈闭环与工具链选型,沉淀为团队可照搬的评估体系搭建指南。
>
> 定位:本文档是"Agent 上下文知识体系"的**评估工程层**——[Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md) 讲"用什么基准",本文档讲"怎么建自己的评估体系";与 [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)(质量防线)互补。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:Anthropic/OpenAI/微软官方指南、arXiv 论文(编号已核实)、GitHub API 实时 star

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [评估基础设施全景](#2-评估基础设施全景)
3. [Golden Set 构建](#3-golden-set-构建)
4. [LLM-as-Judge 实践](#4-llm-as-judge-实践)
5. [评估执行管道](#5-评估执行管道)
6. [持续回归与门禁](#6-持续回归与门禁)
7. [生产监控与反馈闭环](#7-生产监控与反馈闭环)
8. [工具链对比](#8-工具链对比)
9. [2025-2026 最新进展](#9-2025-2026-最新进展)
10. [为 Agent 生成的可执行框架](#10-为-agent-生成的可执行框架)
11. [生态与资源](#11-生态与资源)
12. [参考来源](#12-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

现成基准(SWE-bench、τ-bench 等)只测通用能力,**不覆盖自家业务的成功标准**。没有评估体系的团队必然陷入"反应式循环":生产出问题 → 手动复现 → 修 bug → 祈祷无回归。本文档提供从零搭建评估基础设施的完整方法论。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:从零搭建 → §2 全景 → §3 Golden Set → §4 Judge → §5 管道 → §6 门禁
目标:选工具 → §8 工具链对比 → §10 检查清单
目标:跟进前沿 → §9 最新进展
```

### 1.3 一句话核心结论

> **没有 evals 的团队必然陷入反应式循环;有 evals 才能区分真实回归与随机噪音、批量验证改动、并在换模型时几天内完成升级(无 evals 者要几周)。** —— Anthropic《Demystifying evals for AI agents》

---

## 2. 评估基础设施全景

### 2.1 为什么自建

| 现成基准 | 自建评估 |
|---|---|
| 测通用能力 | 测自家业务成功标准 |
| 公开固定 | 随业务演进持续维护 |
| 他人定义 | 自己定义"完成" |

### 2.2 组成要素

```text
Golden Set(task 集合)→ Grader(评分逻辑)→ 执行管道(evaluation harness)
  → 回归门禁 → 生产监控闭环
```

### 2.3 Anthropic 标准化概念

| 概念 | 含义 |
|---|---|
| **task** | 单个测试任务 |
| **trial** | 多次运行取一致结果 |
| **grader** | 评分逻辑(可含多个 assertion) |
| **transcript** | 完整轨迹(输出/工具调用/推理) |
| **outcome** | 环境最终状态 |
| **agent harness** | 被测对象 = 模型 + 脚手架 |
| **suite** | 任务集合 |

**三类 grader**:
- **代码式**:快、客观、可复现
- **模型式**:灵活、需人工校准
- **人工**:金标准,用于校准模型 grader

**两类评估**:
- **能力评估**:起步低通过率、爬坡
- **回归评估**:近 100% 通过率
- 上线后能力评估可"毕业"转为持续回归套件

---

## 3. Golden Set 构建

### 3.1 三种测试数据策略(微软 eval-guide)

| 策略 | 机制 | 适用 |
|---|---|---|
| **Echo** | 确定性快速回归 | 稳定核心场景 |
| **Historical replay** | 历史轨迹回放、模型对比 | 模型升级验证 |
| **Synthesized personas** | 合成人设覆盖复杂场景 | 覆盖不足的场景 |

> 微软建议:**多数场景混合使用**。

### 3.2 合成生成

- **RAGAS TestsetGenerator**:从文档/知识图谱抽取概念,用 generator LLM + critic LLM 生成问题-答案对,按 simple / reasoning / multi-context 等分布产出
- OpenAI 官方支持用自有数据构建 private evals
- EvalGen(arXiv:**2404.12272**,已联网核实;发表会议为 UIST 2024,非 ICSE 2025)自动生成评估

### 3.3 规模、覆盖与维护

| 维度 | 要点 |
|---|---|
| **规模** | 社区常见起步 50-100 个代表性问题(转述);能力评估应选难任务 |
| **覆盖** | 成功案例 + 边界 case(空输入/超长/极端输入) |
| **版本管理** | eval suite 本身版本化管理(Anthropic"毕业"机制) |
| **持续维护** | 新 bug/失败案例回灌进回归集 |

---

## 4. LLM-as-Judge 实践

### 4.1 关键事实

| 事实 | 来源 |
|---|---|
| GPT-4 级 judge 与人类一致性 >80%(与人人一致同水平) | [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)(MT-Bench) |
| GPT-4o 级 judge 在难样本上仅略优于随机 | [JudgeBench](https://arxiv.org/abs/2410.12784)(ICLR 2025) |

> **judge 本身也要被评估**——JudgeBench 证明高级 judge 在难样本上也不可靠。

### 4.2 偏差与缓解

| 偏差 | 缓解 |
|---|---|
| **位置偏差**(回答顺序影响评分) | 交换顺序取平均 |
| **冗长偏差**(长答案被偏好) | 长度归一化 |
| **自我偏好**(同源 judge 偏爱同模型) | 异构 judge |
| **推理能力有限** | rubric 评分替代 pairwise、多 judge 共识 |

### 4.3 一致性验证

- **Cohen's kappa** 等度量 judge 与人工一致
- 人工抽样验证是必须步骤(WebVoyager 证明 GPT-4V 自动评与人工 85.3% 一致,但必须报告一致性系数)

### 4.4 成本控制

```text
强 judge 粗筛 + 弱 judge 精评(分层)
结果缓存
批量评估
失败降级到规则/人工
```

---

## 5. 评估执行管道

| 要点 | 说明 |
|---|---|
| **并发批次执行** | 并行跑任务提高吞吐 |
| **环境隔离** | 编码 agent 需 Docker/稳定测试环境(Anthropic 强调) |
| **版本固定** | 依赖与随机种子固定保证可复现 |
| **轨迹保存** | transcript 完整保存(输出/工具调用/推理/中间结果)供归因与回放 |
| **指标** | pass@k(多 trial 通过率)、任务级(outcome 状态检查)+ 轨迹级(turns/tool calls/tokens/延迟)并用 |

---

## 6. 持续回归与门禁

### 6.1 CI 集成

- GitHub Actions push/PR 触发
- 受保护分支将质量门禁设为 **required check**
- Braintrust 提供 eval-action;lm-evaluation-harness 有 Actions 集成模式

### 6.2 触发条件

> **prompt / harness / 模型 / 工具配置任何改动前跑回归。**

### 6.3 门禁判定(微软 eval-guide)

```text
SHIP(放行)/ ITERATE(迭代)/ BLOCK(阻断)
```

Agent PR 建议增加检查层:
```markdown
- agent regression eval(回归)
- tool-use eval(工具使用)
- knowledge grounding(知识锚定)
- safety gate(安全门禁)
```

> 与 [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md) 同源:把 AI 产物质量门禁前置到 CI。

---

## 7. 生产监控与反馈闭环

### 7.1 评估飞轮

```text
生产 trace/反馈 → 过滤进数据集 → 离线评测 → 修复 → 回归 → 上线
```

- **Langfuse**:traces 沉淀为 datasets、user feedback(thumbs up/down)、LLM-as-judge 在线评估、人工标注队列
- **LangSmith**:online evaluators 对生产流量运行在线评估与告警(转述,待官方核实)

### 7.2 在线评估

| 方式 | 机制 |
|---|---|
| **Shadow eval(影子评估)** | 并行评估不阻塞用户 |
| **Canary(金丝雀)** | 小流量试点新模型/配置后对比指标 |

---

## 8. 工具链对比

> star 为 2026-08-10 GitHub API / shields.io 实时核实。

| 工具 | star | 定位 | 关键能力 | 定价 |
|---|---|---|---|---|
| **Langfuse** | 约 33k | 开源 LLM 工程平台 | tracing/datasets/LLM-as-judge/人工标注/反馈,可自托管 | Hobby 免费;Core $29/月;Pro $199/月;Enterprise $2499/月 |
| **openai/evals** | 约 19.1k | 评估框架+registry | YAML 定义、模型分级 grader、completion-fn 协议 | 开源免费(API 自费) |
| **RAGAS** | 约 15.2k | RAG/Agent 评估框架 | 合成测试集生成+指标 | 开源免费 |
| **Arize Phoenix** | 约 10.9k | AI 可观测+评估 | datasets/experiments/LLM judge | OSS 免费;云商业 |
| **AgentOps** | 约 5.8k | Agent 监控/评估平台 | tracing、成本、benchmarking(pass rate/cost per task/steps/hallucination) | 免费层+商业 |
| **Braintrust** | 商业(OSS:autoevals) | Eval 实验+Ship 监控 | CI 集成、自动评分 | 按用量 |
| **W&B Weave** | 约 1.1k | W&B 生态 LLM 工具包 | tracing/eval | OSS 免费;云付费 |
| **LangSmith** | SDK 约 1k(平台闭源) | LangChain 商业平台 | online eval、Align Evaluator | 免费层+按量(不可自托管) |

> 选型规律:开源自托管 → Langfuse/Phoenix;深度 LangChain → LangSmith;评估框架 → openai/evals/RAGAS;监控平台化 → AgentOps。

---

## 9. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **持续评估成为标准动作** | CI 回归 + 生产持续评估(微软 eval-guide 定位为 quality gate + continuous evaluation) |
| **评估即基础设施** | Anthropic:evals 是产品与研发团队最高带宽的沟通渠道,价值随时间复利增长 |
| **AgentOps 平台化** | 从概念走向平台(核心指标:pass rate / cost per task / steps / hallucination) |
| **方法论体系化** | 两大权威框架:微软《Practical Guidance on Agent Evaluation》10 步 playbook(eval-guide v1.0.0,2026-03)、Anthropic 2026-01 完整评估指南 |

---

## 10. 为 Agent 生成的可执行框架

### 10.1 评估基础设施搭建检查清单

```markdown
## 评估体系自查
□ 是否有 golden set?(50-100 起步,覆盖成功 + 边界 case)
□ golden set 是否版本化管理?(新 bug 回灌)
□ judge 是否经过校准?(位置/冗长/自我偏好 + 一致性验证)
□ judge 是否被评估过?(JudgeBench 式检查,别信"高级 judge"盲目信任)
□ 是否分离能力评估与回归评估?
□ 执行管道是否可复现?(Docker 隔离 + 版本固定 + 轨迹保存)
□ 是否接入 CI 门禁?(prompt/harness/模型改动前必跑)
□ 是否有生产反馈闭环?(trace 回流 → 数据集 → 评测 → 回归)
□ 是否报告 judge 与人工一致性系数?
```

### 10.2 搭建顺序

```text
第 1 步:定义"完成"标准(自家业务成功标准,非公开基准)
第 2 步:建 golden set(50-100 条起步)
第 3 步:选 grader(代码式优先,模型式校准)
第 4 步:搭执行管道(Docker + 版本固定 + 轨迹保存)
第 5 步:接入 CI 门禁(required check)
第 6 步:接生产反馈闭环(飞轮)
```

### 10.3 供 Agent 生成评估框架的元规则

1. **自家标准优先**:golden set 围绕自家业务,不用公开基准充数
2. **judge 需被评估**:高级 judge 也可能在难样本上失效
3. **可复现铁律**:隔离环境 + 版本固定 + 轨迹保存,缺一不可
4. **门禁前置**:任何 AI 相关改动先过回归,别等生产事故
5. **飞轮闭环**:生产反馈必须回流数据集,评估体系才持续进化
6. **成本分层**:强 judge 粗筛 + 弱 judge 精评,缓存与批量

---

## 11. 生态与资源

### 官方指南(一手)
- [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)(2026-01-09)
- [微软 — eval-guide(Practical Guidance on Agent Evaluation)](https://github.com/microsoft/eval-guide)(123★,MIT)

### 论文(编号已核实)
- [LLM-as-a-Judge](https://arxiv.org/abs/2306.05685)(MT-Bench/Chatbot Arena)
- [JudgeBench](https://arxiv.org/abs/2410.12784)(ICLR 2025)

### 工具与仓库
- [Langfuse](https://github.com/langfuse/langfuse)(约 33k) ｜ [定价](https://langfuse.com/pricing)
- [openai/evals](https://github.com/openai/evals)(约 19.1k)
- [RAGAS](https://github.com/vibrantlabsai/ragas)(约 15.2k)
- [Arize Phoenix](https://github.com/Arize-ai/phoenix)(约 10.9k)
- [AgentOps](https://github.com/AgentOps-AI/agentops)(约 5.8k)
- [W&B Weave](https://github.com/wandb/weave)(约 1.1k)
- [LangSmith SDK](https://github.com/langchain-ai/langsmith-sdk)

---

## 12. 参考来源

- Anthropic《Demystifying evals for AI agents》(2026-01,原文抓取)
- arXiv 论文(编号逐条核实):LLM-as-a-Judge 2306.05685、JudgeBench 2410.12784
- GitHub API / shields.io 实时 star(2026-08-10)
- 微软 eval-guide README(已读)
- RAGAS 合成数据实践(Zilliz 博客)
- 待核实项:EvalGen arXiv 编号、LangSmith/Braintrust 精确定价、shadow eval 官方文献、AgentOps(Cognition)官方博客
- 关联文档:[Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md)、[AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md)

---

*本文档由 Anthropic/OpenAI/微软官方指南、arXiv 论文(编号逐条核实)与 GitHub 实时数据综合而成。标注:EvalGen arXiv 编号、部分商业工具定价与 shadow eval 官方文献待核实;社区"50-100 条起步"规模为转述。*
