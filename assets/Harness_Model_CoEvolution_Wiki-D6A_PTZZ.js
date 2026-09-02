const n=`# LLM Wiki — Harness × 模型协同进化(Co-evolution)深度解析

> 面向 LLM Agent 的**Harness × 模型协同进化(Model-Harness Co-evolution)** 系统性知识库:从 harness-in-the-loop learning 核心概念、RHI/Continual Harness/Self-Improvements/Polar 四大论文详解、训练数据循环等关键机制,到产业实践(Anthropic 脑手分离/OpenAI 百万行/DeepSeek Harness)、"模型吃 harness"争议与开放问题。
>
> 定位:本文档是"Agent 上下文知识体系"的**前沿理论层**——[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15 介绍了自动合成基础,本文档聚焦"harness 与模型如何互相塑造"这一更深层问题。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、Anthropic 官方博客、权威产业报道

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心概念:harness-in-the-loop learning](#2-核心概念harness-in-the-loop-learning)
3. [关键论文详解](#3-关键论文详解)
4. [关键机制](#4-关键机制)
5. [产业实践](#5-产业实践)
6. [争议与开放问题](#6-争议与开放问题)
7. [2025-2026 时间线](#7-2025-2026-时间线)
8. [为 Agent 生成的可执行框架](#8-为-agent-生成的可执行框架)
9. [生态与资源](#9-生态与资源)
10. [参考来源](#10-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) 确立了"Agent 能力 = Model × Harness"。但二者不是静态乘法——**harness 的执行轨迹会反哺模型训练,更强的模型又要求更好的 harness**。本文档解析这一动态闭环:它们如何互相塑造,以及"模型会不会吃掉 harness"这一 2026 年的核心争论。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解协同进化本质 → §2 概念 → §3 论文 → §4 机制
目标:关注产业动向 → §5 产业实践 → §7 时间线
目标:批判性判断 → §6 争议(模型吃 harness?)
目标:落地 → §8 可执行框架
\`\`\`

### 1.3 一句话核心结论

> **harness 不只是推理期脚手架,而是数据生成组件**——它的执行轨迹塑造未来基础模型。协同进化的完整闭环:harness 轨迹 → 数据 → 训练 → 更强模型 → 更优 harness。

---

## 2. 核心概念:harness-in-the-loop learning

### 2.1 定义(RHI 论文,arXiv:2607.15524)

> **harness-in-the-loop learning**:harness 不只是推理期脚手架,而是**数据生成组件**——其执行轨迹会塑造未来基础模型;因此应同时优化 harness 的即时 agent 性能与轨迹质量。

### 2.2 Agent 的构成

\`\`\`text
Agent = 基础模型(θ)+ 脚手架 Σ(operational scaffold)
Σ = prompt + 记忆 + 工具 + 控制逻辑
\`\`\`

### 2.3 协同进化闭环

\`\`\`text
harness 执行轨迹 → 训练数据 → 更强模型 → 要求更优 harness → 更优轨迹 → …
\`\`\`

### 2.4 关键行业观点(2026)

| 观点 | 出处 | 内容 |
|---|---|---|
| "模型将吃掉 harness" | Logan Kilpatrick(Google AI Studio/Gemini API 负责人,红杉访谈) | 编码接近"窄域超级智能",Agent Harness 将在 **12 个月内被模型内化吃掉**,价值向上游转移 |
| "Codex 只是原始工具" | Thibault Sottiaux(OpenAI 产品兼平台总经理) | "Codex 这样的 Harness,再过 2-3 个月就是原始工具" |
| "Harness 是胜负手" | 腾讯汤道生等 | Harness Engineering 是 2026 AI 落地的胜负手 |

---

## 3. 关键论文详解

### 3.1 RHI(arXiv:2607.15524,2026-07-17,含 Spark 之父 Matei Zaharia)

**方法**:
- 把 harness 表示成 **prompt 级 agent 循环规范**
- 用自身修订历史的**成对反馈**迭代优化(只跟上一版比,**O(1) 成本**)

**结果**:
- 30 个合成 ML 研究任务(量化金融/机器人/药学)上,少量迭代让**低推理 effort agent 反超最高推理配置,推理成本最高降 60%**
- 增益来自**上下文管理(agent 间信息流)**而非更长推理轨迹
- 作者注明:解决"协同进化环的前半段"

### 3.2 Continual Harness(arXiv:2605.09998,2026-05-11,普林斯顿)

**两大贡献**:
1. **Gemini Plays Pokemon(GPP)**:首个无败仗通关 Pokemon Blue/Yellow Legacy hard/Crystal
2. **无重置在线自改进**:agent 交替执行与自我精炼(prompt/sub-agent/skill/记忆),闭环为 process-reward co-learning(开源 agent rollout 由 frontier 教师重标注后更新模型)

### 3.3 Self-Improvements in Modern Agentic Systems(arXiv:2607.13104,2026-07-14,97 页,含 Schmidhuber)

- Agent = 基础模型 + operational scaffold
- **自改进 = self-induced update operator**(按更新目标与驱动信号组织文献)

### 3.4 Polar:harness × RL(arXiv:2605.24220,2026-05-22,含 NVIDIA Jan Kautz)

**方法**:
- 把 harness 当**黑盒**,在 LLM API 边界代理、记录 token 级日志重建轨迹做**异步 RL**
- 注册为 NeMo Gym 环境

**结果**:
- Qwen3.5-4B + GRPO 在 Codex 等 harness 上 SWE-Bench Verified 分别 **+22.6/+4.8/+0.6/+6.2 分**

### 3.5 支撑基础

| 论文 | 作用 |
|---|---|
| [Self-Evolving AI Agents 综述](https://arxiv.org/abs/2508.07407)(2025-08) | 统一框架:System Inputs / Agent System / Environment / Optimisers |
| [Meta-Harness](https://arxiv.org/abs/2603.28052)(斯坦福 IRIS) | agent 搜索 harness 代码;IMO 数学题 5 个未见模型平均 +4.7 点 |
| [AutoHarness](https://arxiv.org/abs/2603.03329) | 自动合成 code harness |
| [GSME](https://arxiv.org/abs/2607.13683) | 确定性代码门控 + 配对 2σ 显著性保证自反馈可信 |
| [MemoHarness](https://arxiv.org/abs/2607.14159) | — |

---

## 4. 关键机制

### 4.1 训练数据循环

\`\`\`text
harness 执行轨迹 → 数据 → 训练 → 更强模型 → 更优 harness
\`\`\`

- RHI 定义该闭环
- Polar 构建数据管道
- Continual Harness 实现闭环

### 4.2 蒸馏/自我提升:小模型 + 好 harness 碾压裸大模型

| 证据 | 数据 |
|---|---|
| RHI | 低推理反超高推理,成本降 60% |
| Polar | 4B 模型在 Codex harness 上 3.8% → **26.4%** |
| Schema 冻结模型 | 仅换 harness,ARC-AGI-3 上 **42.83% → 98.98%**(+56.15pp) |

### 4.3 反馈回路的可靠性(关键警示)

- GRPO 等 RL 经 harness 捕获的 token 级信号训练(Polar)
- **GSME 警示**:确定性代码门控 + 配对 2σ 显著性保证自反馈可信;消融显示朴素"均值提升"规则会**误记约 60% 中性机制**

---

## 5. 产业实践

| 实践 | 内容 |
|---|---|
| **Anthropic 脑手分离** | 《Scaling Managed Agents: Decoupling the brain from the hands》(2026-04-08):Brain/Hands/Session 三元组;2 月演示 16 个 Claude 在 2000 个云端 session 并行写出 C 编译器(Carlini:"大部分精力花在环境、测试闭环与反馈基础设施上") |
| **OpenAI 百万行实验** | 3 人工程师 + Codex 5 个月产出超 100 万行代码、约 1500 个 PR、零行人工手写;Codex 转向云端异步沙箱,"本地轻指挥、云端重执行" |
| **DeepSeek Harness** | 2026-03 崔添翼组建 Harness 团队;7-31 V4 Flash 正式版 Harness 首次亮相;8-01 内测(769 开发者、712 仓库),即将开源 |
| **Google Antigravity** | 作为 Agent Harness 主线驱动全线产品(2026 I/O 宣布) |

---

## 6. 争议与开放问题

### 6.1 "模型吃 harness" vs "harness 长期价值"

- **唱衰派**:Kilpatrick("12 个月吃掉")、Sottiaux("Codex 再火俩月")
- **看多派**:腾讯等认为 Harness Engineering 是 2026 落地胜负手
- **中立视角**:即使 harness 被"内化",其**设计方法论**(上下文管理、验证、治理)会沉淀为模型能力——问题变成"harness 以什么形态存在",而非"是否存在"

### 6.2 评估盲区与基准污染(反方证据)

《Rethinking the Evaluation of Harness Evolution for Agents》(Terminal-Bench 2.1):
- Harness 自进化 pass@1 仅 **67.4,未超过简单并行采样 72.3**
- 迁移到未见任务仅 **+0.6 分**
- **收益可能来自"多试几次"而非 harness 变好**
- 任务重合存在**数据飞轮污染风险**

### 6.3 收敛性

- harness 收益受底层模型推理上限约束
- 协同进化是否永远追赶模型升级尚无定论
- 自反馈噪声(GSME)是持续优化难点

---

## 7. 2025-2026 时间线

| 时间 | 事件 |
|---|---|
| 2025-08 | Self-Evolving AI Agents 综述(2508.07407) |
| 2026-02 | Harness Engineering 概念爆发(Hashimoto 等);Anthropic 16-Claude 编译 C 编译器 |
| 2026-03 | Meta-Harness、AutoHarness;崔添翼加入 DeepSeek 组建 Harness 团队 |
| 2026-04-08 | Anthropic"脑手分离"工程博客 |
| 2026-05 | Continual Harness(5-11)、Polar(5-22);I/O 发布 Antigravity |
| 2026-07 | GSME、MemoHarness、Self-Improvements 综述(7-14)、RHI(7-17)密集发布 |
| 2026-07-31 至 08-09 | DeepSeek V4 Flash + Harness 亮相并内测;Sottiaux 称 Codex"再火俩月" |

---

## 8. 为 Agent 生成的可执行框架

### 8.1 协同进化设计自查清单

\`\`\`markdown
## 协同进化自查
□ 是否把 harness 轨迹当作数据资产?(轨迹质量 = 未来模型质量)
□ harness 改动是否纳入评估?(防"多试几次"错觉——对照并行采样基线)
□ 自反馈是否可信?(确定性门控 + 显著性检验,防误记)
□ 是否避免任务重合导致的基准污染?
□ 是否考虑蒸馏路径?(小模型 + harness 能否替代裸大模型?)
□ 是否监测"模型升级后 harness 是否成为新瓶颈"?
\`\`\`

### 8.2 供 Agent 生成协同进化框架的元规则

1. **轨迹即数据**:harness 设计时就要考虑轨迹的可复用性(结构化、可标注)
2. **成对反馈**:自我优化只跟上一版比(O(1) 成本),避免 O(n²) 评估
3. **对照基线**:任何 harness "改进"都要与简单并行采样对照,排除"多试几次"的错觉
4. **反馈可信**:确定性门控 + 统计显著性,防止自反馈污染
5. **拥抱内化**:即使 harness 被模型"吃掉",把设计方法论沉淀进技能与规则(Skill/CLAUDE.md)

---

## 9. 生态与资源

### 论文(编号已核实)
- [RHI](https://arxiv.org/abs/2607.15524)(arXiv:2607.15524)
- [Continual Harness](https://arxiv.org/abs/2605.09998)
- [Self-Improvements 综述](https://arxiv.org/abs/2607.13104)(97 页)
- [Polar](https://arxiv.org/abs/2605.24220)
- [Self-Evolving AI Agents](https://arxiv.org/abs/2508.07407)
- [Meta-Harness](https://arxiv.org/abs/2603.28052) ｜ [AutoHarness](https://arxiv.org/abs/2603.03329)
- [GSME](https://arxiv.org/abs/2607.13683) ｜ [MemoHarness](https://arxiv.org/abs/2607.14159)

### 官方博客与报道
- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic — Claude Managed Agents](https://claude.com/blog/claude-managed-agents)
- [Kilpatrick 红杉访谈(12 个月吃掉 harness)](http://m.toutiao.com/group/7658280491048501803/)
- [Sottiaux:Codex 再火俩月](https://m.sohu.com/a/1060723016_129720/)
- [五篇 Harness 论文全景](http://m.toutiao.com/group/7671836368124805682/)
- [Rethinking Harness 自进化评估](https://cloud.tencent.com/developer/article/2721283)

---

## 10. 参考来源

- arXiv 论文(编号逐条核实,见 §9)
- Anthropic 官方博客(脑手分离、Managed Agents)
- 2026 年权威产业报道(Kilpatrick/Sottiaux/DeepSeek/Google)
- 反方证据:腾讯云《Rethinking the Evaluation of Harness Evolution for Agents》
- 关联文档:[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15、[Multi_Agent_Evaluation_Wiki.md](Multi_Agent_Evaluation_Wiki.md) §4(评测方法学)

---

*本文档由 arXiv 一手论文(编号逐条核实)、Anthropic 官方博客与 2026 年权威报道综合而成。所有性能数据(60% 成本降幅、+22.6 分、+56.15pp、67.4 vs 72.3)均有一手或权威来源支撑。"
`;export{n as default};
