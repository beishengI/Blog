const n=`# LLM Wiki — 多智能体评测与基准

> 面向 LLM Agent 的**多智能体评测与基准(Multi-Agent Evaluation & Benchmarks)** 系统性知识库:从单 Agent 基准全景(AgentBench/SWE-bench/GAIA/Terminal-Bench)、多智能体专项评测(MultiAgentBench/SOTOPIA/BattleAgentBench)、评测方法学(LLM-as-Judge/成本-精度/过拟合),到 2025-2026 最新进展与自主搭建评测的实践指南。
>
> 定位:本文档是"Agent 上下文知识体系"的**评估方法论层**——[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) §3 概要列出论文,本文档纵深展开评测体系。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、GitHub 高星仓库、Anthropic/OpenAI 官方文档

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [单 Agent 基准全景](#2-单-agent-基准全景)
3. [多智能体专项评测](#3-多智能体专项评测)
4. [评测方法学](#4-评测方法学)
5. [2025-2026 最新进展](#5-2025-2026-最新进展)
6. [评测实践指南](#6-评测实践指南)
7. [为 Agent 生成的可执行框架](#7-为-agent-生成的可执行框架)
8. [生态与资源](#8-生态与资源)
9. [参考来源](#9-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

"这个多智能体系统到底行不行?"——单看 benchmark 分数会严重误导(SOTA 系统可能只是又贵又复杂,静态基准可被刷到近满分)。本文档提供**评测体系全景 + 方法学批判 + 自主搭建指南**。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解评测体系 → §2 单 agent → §3 多 agent 专项 → §5 最新
目标:批判性看待分数 → §4 方法学(过拟合/LLM-as-Judge)
目标:搭建自己的评测 → §6 实践指南 → §7 检查清单
\`\`\`

### 1.3 一句话核心结论

> **Agent 评测正在从"测模型"转向"测系统"**——同一模型配不同 harness 分数波动巨大;且 benchmark 分数不直接适用于 Agent,必须结合任务级 + 轨迹级指标与人工审查。

---

## 2. 单 Agent 基准全景

> 多智能体评测建立在单 Agent 基准之上,先建立全景。

| 基准 | 出品 | 测什么 | arXiv | 适用 |
|---|---|---|---|---|
| **AgentBench** | 清华 THUDM | 8 个交互环境:OS(bash)、DB、知识图谱、数字卡牌、横向思维谜题、家居、网页购物、网页浏览 | [2308.03688](https://arxiv.org/abs/2308.03688)(ICLR 2024) | 通用 Agent 推理/决策基线 |
| **SWE-bench** | 普林斯顿+OpenAI | GitHub 真实 issue→代码补丁→单测验证 | [2310.06770](https://arxiv.org/abs/2310.06770) | **代码 Agent 事实标准** |
| **SWE-bench Verified** | OpenAI | 500 题人工校准(2024-08) | 同上 | ⚠️ 2026-07 已被 OpenAI 弃用,转向 Pro |
| **SWE-bench Pro** | Scale AI | 企业级新 issue | [2509.16941](https://arxiv.org/abs/2509.16941) | 新一代代码基准 |
| **GAIA** | Meta/HF/AutoGPT | 466 道需多步工具组合的真实问题(人类 92% vs GPT-4+插件 15%) | [2311.12983](https://arxiv.org/abs/2311.12983) | 通用助手综合能力 |
| **Terminal-Bench** | Scale AI | 真实 Linux 终端任务;2.0 配套 Harbor 框架量化 harness 差异 | 官网发布 | 终端/编码 Agent |
| **WebArena** | CMU | 4 个自托管可复现网站环境 | [2307.13854](https://arxiv.org/abs/2307.13854) | 网页操作 |
| **WebVoyager** | 腾讯 AI Lab | 15 个真实网站端到端任务;GPT-4V 自动评分与人工一致率 85.3% | [2401.13919](https://arxiv.org/abs/2401.13919)(ACL 2024) | 真实网页 Agent |

> ⚠️ **重要澄清**:AgentBench 本身是**单 Agent 基准**,无多 Agent 场景。多 Agent 能力需用 §3 的专项基准评估。

---

## 3. 多智能体专项评测

### 3.1 核心基准

| 基准 | 出品 | 机制 | 测什么 | arXiv |
|---|---|---|---|---|
| **MultiAgentBench** | UIUC | 首个同时覆盖协作与竞争的综合基准;基于里程碑的 KPI;对比 star/chain/tree/graph 四种拓扑 | 协作 + 竞争能力 | [2503.01935](https://arxiv.org/abs/2503.01935) |
| **SOTOPIA** | CMU | 开放式社交交互环境(协商/协作/竞争角色扮演);SOTOPIA-Eval 用多维 social score 评估 | 社交智能 | [2310.11667](https://arxiv.org/abs/2310.11667) |
| **BattleAgentBench** | 清华 | 7 个子阶段 × 3 档难度,细粒度区分单/双/多 agent 能力 | 协作 vs 竞争对比 | [2408.15971](https://arxiv.org/abs/2408.15971) |
| **MAD(Multi-Agent Debate)** | — | 多 agent 辩论框架 | 发散思维、答案质量提升 | [2305.19118](https://arxiv.org/abs/2305.19118) |
| **τ-bench** | Sierra | 动态模拟用户,测对话+工具混合场景的策略遵从 | 对话式工具 Agent | [2406.12045](https://arxiv.org/abs/2406.12045) |

### 3.2 MultiAgentBench 关键结论

- gpt-4o-mini 平均任务分最高(小模型 + 好协调 > 大模型裸跑)
- **graph 拓扑在科研场景最优**
- 认知规划里程碑达成率 +3%

### 3.3 SOTOPIA 关键结论

- social score 维度:目标完成、可信度、知识、安全、合法、信息丰富度、关系维护
- GPT-4 在 SOTOPIA-hard 上目标完成率**远低于人类**
- 评测采用 LLM judge + 人工抽验的混合方案

### 3.4 协作机制分析框架(综述 arXiv:2501.06322)

五维分析:参与者(actors)、类型(合作/竞争/竞合)、结构(对等/集中/分布式)、策略(strategies)、协调协议(protocols)。

---

## 4. 评测方法学

### 4.1 LLM-as-Judge 的可靠性

| 问题 | 说明 | 对策 |
|---|---|---|
| **位置偏差** | 回答顺序影响评分 | 交换顺序多次评测 |
| **自我偏好** | 偏向与自己同模型/同风格的输出 | 盲评、多样化 judge |
| **冗长偏差** | 更长回答得分更高 | 长度归一化 |

> 核心论文:[LLM-as-a-Judge](https://arxiv.org/abs/2306.05685)(MT-Bench/Chatbot Arena)。**相对成对比对优于绝对打分**;必须报告 judge 与人工的一致性系数。

### 4.2 成本-精度联合优化(AI Agents That Matter,arXiv:2407.01502)

- 只报精度 → SOTA 系统过度复杂昂贵
- 主张:精度-成本联合优化、区分模型开发者与下游开发者需求、**强制 holdout 集**、统一评测规范保可复现

### 4.3 过拟合/刷分问题

- 2026 年审计显示 **SWE-bench、WebArena、OSWorld、GAIA、Terminal-Bench 等 8 大基准可被刷到近满分**
- 静态基准的脆弱性暴露:benchmark 分数≠真实能力

### 4.4 环境动态性权衡

| 环境 | 优点 | 缺点 |
|---|---|---|
| 受控环境(AgentBench/WebArena) | 可复现 | 失真 |
| 真实环境(WebVoyager/Terminal-Bench) | 逼真 | 不可控 |

### 4.5 Anthropic 观点(2026-01《Demystifying evals for AI agents》)

> "LLM benchmark 分数不适用于 Agent 评测"。主张:**任务级 + 轨迹级双指标、人工审查、量化基础设施噪声**。

---

## 5. 2025-2026 最新进展

| 进展 | 内容 | 意义 |
|---|---|---|
| **AgentDojo**(ETH SPY Lab) | 97 任务/629 安全用例的 prompt 注入攻防动态环境;发现 SOTA 模型无攻击时也大量失败 | **安全成为 Agent 评测新维度** |
| **Terminal-Bench 2.0 + Harbor** | 同一模型配不同 harness 分数波动巨大 | 评测从"测模型"转向"测系统" |
| **SWE-bench 生态变动** | Verified 被弃、Pro 上位;OpenAI 审计发现 Pro 731 个公开任务约 30% 有缺陷 | **基准自身也需被审计** |
| **GAIA 2 传闻** | 截至 2026-08 **未检索到官方发布**,GAIA 仍为 v1 | 勿引用未发布基准 |

---

## 6. 评测实践指南

### 6.1 指标选择

| 维度 | 指标 |
|---|---|
| 任务完成 | pass@k、任务完成率 |
| 成本 | token 数、耗时、费用 |
| 轨迹质量 | 步骤数、工具调用正确率、里程碑达成率 |
| 可靠性 | judge 与人工一致性系数 |

### 6.2 基线设计

- **同模型单 agent 对照**:测协作增益(多 agent 是否真的更优?)
- 多模型横向对比
- 不同拓扑/协调协议消融(仿 MultiAgentBench)

### 6.3 复现保障

1. 固定依赖版本与随机种子
2. Docker 化环境
3. 保存完整轨迹(供归因分析)
4. 划分 **holdout 集**防过拟合
5. 对每个结论报告多次运行方差

### 6.4 流程参考

\`\`\`text
dev → eval 迭代循环(Anthropic 评估指南)
+ AI Agents That Matter 七条原则(成本-精度联合、holdout、可复现)
\`\`\`

---

## 7. 为 Agent 生成的可执行框架

### 7.1 多智能体评测自查清单

\`\`\`markdown
## 评测自查
□ 是否区分了单 agent 基准与多 agent 专项基准?(AgentBench 无多 agent 场景!)
□ 是否同时报告任务级与轨迹级指标?
□ 是否报告了成本( token/耗时/费用)?
□ LLM-as-Judge 是否做了位置/自我偏好偏差校准?
□ 是否报告了 judge 与人工一致性系数?
□ 是否设置了 holdout 集防过拟合?
□ 是否与单 agent 基线对比(证明协作增益)?
□ 是否固定版本与种子、保存轨迹(可复现)?
□ 是否关注了时效性?(SWE-bench Verified 已弃用 → Pro)
\`\`\`

### 7.2 基准选型决策树

\`\`\`text
测什么?
├─ 通用 Agent 推理决策 → AgentBench
├─ 代码能力 → SWE-bench Pro(2026 标准)
├─ 真实终端任务 → Terminal-Bench 2.0
├─ 多 agent 协作/竞争 → MultiAgentBench
├─ 社交智能 → SOTOPIA
├─ 协作 vs 竞争细粒度 → BattleAgentBench
├─ 安全性 → AgentDojo
└─ 网页操作 → WebArena / WebVoyager
\`\`\`

### 7.3 供 Agent 生成评测框架的元规则

1. **系统视角**:评测"系统"(模型+harness+编排),不只"模型"
2. **双指标**:任务级 + 轨迹级,缺一不可
3. **成本透明**:报告成本,警惕"又贵又复杂"的伪 SOTA
4. **防过拟合**:holdout 集 + 可复现环境 + 轨迹保存
5. **时效敏感**:基准生态变动快(如 SWE-bench Verified 弃用),引用前核实现状

---

## 8. 生态与资源

### GitHub 仓库
- [THUDM/AgentBench](https://github.com/THUDM/AgentBench)
- [MultiagentBench/MARBLE](https://github.com/MultiagentBench/MARBLE)
- [ethz-spylab/agentdojo](https://github.com/ethz-spylab/agentdojo)

### 基准官网
- [SWE-bench](https://www.swebench.com/)
- [Terminal-Bench](https://www.terminal-bench.com/)
- [GAIA(HuggingFace)](https://huggingface.co/gaia-benchmark)

### 论文(编号已核实)
- 见 §2、§3 表格全部链接
- [LLM-as-a-Judge](https://arxiv.org/abs/2306.05685)
- [AI Agents That Matter](https://arxiv.org/abs/2407.01502)
- [AgentDojo](https://arxiv.org/abs/2406.13352)
- [Multi-Agent Collaboration Survey](https://arxiv.org/abs/2501.06322)

### 官方文档
- [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

---

## 9. 参考来源

- arXiv 论文(编号逐条核实;SWE-bench Pro/τ-bench/LLM-as-Judge 系多来源交叉确认)
- GitHub 高星仓库与基准官网
- Anthropic 官方评估指南
- ⚠️ 勘误说明:AgentBench 为单 agent 基准(无多 agent 场景);"GAIA 2"未检索到官方发布,不应引用
- 关联文档:[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md)、[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §10(验证评估)

---

*本文档由 arXiv 一手论文(编号逐条核实)、GitHub 仓库与官方文档综合而成。SWE-bench 生态 2025-2026 变动剧烈(Verified 弃用、Pro 上位),引用时务必核对时效性。*
`;export{n as default};
