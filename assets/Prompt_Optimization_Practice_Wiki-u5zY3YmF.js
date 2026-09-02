const n=`# LLM Wiki — Prompt 自动优化实战(Automatic Prompt Optimization)

> 面向 LLM Agent 的**Prompt 自动优化(Automatic Prompt Optimization)实战**系统性知识库:从核心概念与方法谱系、DSPy 实战(签名/模块/优化器/编译)、提示词优化方法详解(OPRO/APO/PromptBreeder/EvoPrompt/TextGrad/GEPA)、何时程序化 vs 手工、工程实践(metric/数据/成本/部署),到 2025-2026 最新进展与失败模式,沉淀为可直接落地的一手工程资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**提示工程智能化层**——[Prompt_Engineering_Wiki.md](Prompt_Engineering_Wiki.md) §4 概要介绍程序化优化,本文档纵深展开;与 [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15(自动合成)同源。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实并勘误)、DSPy 官方文档、GitHub API 实时 star

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心概念与方法谱系](#2-核心概念与方法谱系)
3. [DSPy 实战](#3-dspy-实战)
4. [提示词优化方法详解](#4-提示词优化方法详解)
5. [何时程序化 vs 手工](#5-何时程序化-vs-手工)
6. [工程实践](#6-工程实践)
7. [2025-2026 最新进展](#7-2025-2026-最新进展)
8. [失败模式与避坑](#8-失败模式与避坑)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

人工调优 prompt 是试错式工程:难以系统化、不可移植、依赖直觉;且多模块长管线(RAG/agent 循环)中每个模块的 prompt 需**联合优化**,人工无法扩展。自动提示优化把"调 prompt"变成**可评估、可复现的编译过程**。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解方法谱系 → §2 分类 → §4 方法详解
目标:用 DSPy 落地 → §3 DSPy 实战 → §6 工程实践 → §9 检查清单
目标:判断是否该程序化 → §5 决策标准
\`\`\`

### 1.3 一句话核心结论

> **提示词优化是 harness 的"参数层"**:把 prompt 视为可学习参数,用数据 + metric 驱动迭代搜索。2026 年优化对象已从 prompt 扩展到工具选择、上下文组装、程序结构。

---

## 2. 核心概念与方法谱系

### 2.1 为什么需要自动优化

| 人工调优的局限 | 自动优化的价值 |
|---|---|
| 试错式、靠直觉 | 数据 + metric 驱动,可复现 |
| 难系统化、不可移植 | 声明式、可移植(换 LM 不改代码) |
| 单模块可以,多模块联合无法扩展 | 编译器统一优化全管线 |

### 2.2 方法谱系四分类

| 类别 | 代表方法 | 机制 |
|---|---|---|
| **基于搜索** | APE、PromptAgent(MCTS)、DSPy 离散搜索 | 候选生成 + 评估迭代 |
| **基于梯度语义** | APO/ProTeGi、TextGrad | 文本"梯度"指导编辑/反向传播 |
| **基于进化** | PromptBreeder、EvoPrompt、GEPA | 进化算子(变异/交叉) |
| **基于编译** | DSPy | pipeline 声明为程序,编译器统一优化 prompt 与权重 |

> 综述参考:The Prompt Report([arXiv:2406.06608](https://arxiv.org/abs/2406.06608),58 种提示技巧分类);AWS APO 综述为 [arXiv:2502.16923](https://arxiv.org/abs/2502.16923)(EMNLP 2025,已联网核实);Intel APO 综述 arXiv 未检索到条目(待核实)。

---

## 3. DSPy 实战

### 3.1 核心概念(官方文档 dspy.ai)

| 概念 | 说明 |
|---|---|
| **Signature** | 声明输入/输出字段(如 \`question -> answer\`),替代硬编码 prompt 模板 |
| **Module** | \`Predict\`/\`ChainOfThought\`/\`ReAct\` 等封装 LM 调用逻辑 |
| **Optimizer**(原 Teleprompter) | BootstrapFewShot(自举示例)、BootstrapFewShotWithRandomSearch、**MIPROv2**(联合优化指令+示例)、COPRO、SIMBA、**GEPA**、BootstrapFinetune、BetterTogether |
| **Metric** | 打分函数,越高越好 |
| **Compile** | \`optimizer.compile(program, trainset=...)\` 产出优化程序 |

### 3.2 落地四步

\`\`\`text
声明 pipeline → 定义 metric → 编译 → 用 holdout 集评估
\`\`\`

### 3.3 官方参考数据

| 数据点 | 值 |
|---|---|
| 典型编译成本 | 约 **$2 / 10 分钟**(几美分至几十美元不等) |
| ReAct(HotPotQA) | 24% → **51%** |
| RAG | 53% → **61%** |
| GPT-4o-mini 分类(BootstrapFinetune) | 66% → **87%** |

### 3.4 优化器选型指南

| 数据量 | 推荐优化器 |
|---|---|
| 约 10 样本 | BootstrapFewShot |
| 50+ 样本 | BootstrapFewShotWithRandomSearch |
| 200+ 样本 | MIPROv2(防过拟合) |

### 3.5 版本状态(2026-08)

> **DSPy 已到 3.x**(最新 **3.3.0**,2026-08-03 发布,GitHub 约 36.6k★)。
> - 3.3 新增 **Flex**(可优化程序结构本身,而非仅 prompt)
> - ReActV2 原生工具调用(提示缓存下成本最高降 50%)
> - 类型化 provider 中立 LM 接口、LiteLLM 解耦

### 3.6 与 LangChain/LlamaIndex 的关系

社区通行组合(不冲突):

\`\`\`text
DSPy 生成优化模块 → LangChain 组装 agent → LlamaIndex 管知识
\`\`\`

---

## 4. 提示词优化方法详解

| 方法 | 论文 | 机制 | 关键结果 |
|---|---|---|---|
| **OPRO** | [arXiv:2309.03409](https://arxiv.org/abs/2309.03409)(ICLR 2024) | LLM 当黑盒优化器,meta-prompt 携带历史方案+评分迭代 | GSM8K 超人工 8%,Big-Bench Hard 超 50% |
| **APO/ProTeGi** | [arXiv:2305.03495](https://arxiv.org/abs/2305.03495)(EMNLP 2023) | 小批量数据上 LLM 产出自然语言"梯度",沿语义反方向编辑 | 初始 prompt 最高提升 31% |
| **PromptBreeder** | [arXiv:2309.16797](https://arxiv.org/abs/2309.16797)(DeepMind) | 任务提示与"变异提示"双重进化(自指式) | 超越 CoT、Plan-and-Solve |
| **EvoPrompt** | [arXiv:2309.08532](https://arxiv.org/abs/2309.08532)(ICLR 2024) | LLM 充当进化算子做变异/交叉 | 31 数据集上 BBH 最高提升 25% |
| **PromptAgent** | [arXiv:2310.16427](https://arxiv.org/abs/2310.16427) | MCTS + 错误反馈生成专家级提示 | 12 任务超 CoT 基线 |
| **TextGrad** | [arXiv:2406.07496](https://arxiv.org/abs/2406.07496) | 文本"反向传播"优化复合系统任意组件 | PyTorch 式语法 |
| **GEPA** | [arXiv:2507.19457](https://arxiv.org/abs/2507.19457)(ICLR 2026 Oral) | 反思式 Pareto 进化 | 平均超 GRPO 6%(最高 20%)、rollout 少 35 倍;已收编为 DSPy 官方优化器 |
| **MIPROv2** | [arXiv:2406.11695](https://arxiv.org/abs/2406.11695) | 联合优化指令 + 示例 | DSPy 主力优化器 |

> ⚠️ **编号勘误**:ProTeGi 流传编号 2309.15717 实为 Timbre-Trap 论文(正确为 **2305.03495**,即 APO 论文本身);DILP(不同提示互补)流传编号 **2310.07969 确认为 CleftGAN 医学图像论文**(已联网核实),"Diverse and Informative Learning Prompts"在 arXiv 未检索到匹配论文,建议谨慎引用。

---

## 5. 何时程序化 vs 手工

### 5.1 决策标准

| 场景 | 选择 |
|---|---|
| 任务复杂度高(多模块、需检索/工具)、迭代频繁、metric 可定义、有标注数据 | **程序化(DSPy)** |
| 单次对话、一次性任务、无评估信号 | **手工** |
| 模型或需求频繁更换的探索期 | **手工**(先稳定再优化) |

### 5.2 与 Harness 的关系

\`\`\`text
2026 优化对象演进:
  prompt → 工具选择 → 上下文组装 → 程序结构(DSPy 3.3 Flex、GEPA)
DSPy"程序即搜索空间" ↔ Meta-Harness"环境/反馈闭环"(互为表里)
\`\`\`

> 详见 [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15(自动合成)。

---

## 6. 工程实践

### 6.1 Metric 设计

\`\`\`text
能用精确指标(exact match / F1 / 答案正确性)就不用 LLM judge
用 LLM judge 时:校准、固定温度与模型版本
避免 metric 过拟合
\`\`\`

### 6.2 数据准备

- 必须 train / validation(甚至 test)三分
- MIPROv2 需 200+ 样本防过拟合
- 样例覆盖难例

### 6.3 成本控制

\`\`\`text
先小模型/小样本试跑(几美分)
用 auto="light" 等档位限制 trials
设置 token 预算与缓存
\`\`\`

### 6.4 部署与版本管理

- 编译产物即固化程序:\`program.save()\` 为 JSON(含优化后 prompt/示例)
- 与代码一起做版本管理
- **换 LM 需重新编译**

---

## 7. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **GEPA 成为 DSPy 官方优化器** | 反思式 Pareto 进化,超 MIPROv2 10%+(AIME-2025 +12%) |
| **DSPy 3.x Flex** | 把程序结构(控制流、模块组合)纳入搜索空间 |
| **优化对象扩展** | 从"提示词"扩展为"工具+上下文+结构";OpenAI 2026-02 提出 harness engineering 范式 |
| **Harness 自动合成衔接** | 提示词优化与 [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15 的 Meta-Harness/AutoHarness 构成完整链条 |

---

## 8. 失败模式与避坑

| 失败模式 | 避坑 |
|---|---|
| **edit 与任务错配**(arXiv:2605.26655) | "复杂度增加类"/"元指令类"编辑对数学/多跳推理负相关;"逐步/元认知类"才提升逻辑推理——编辑类型与任务特征必须匹配 |
| 数据不足过拟合 devset | 200+ 样本(MIPROv2)、train/validation 三分 |
| metric 与真实目标脱节 | 精确指标优先,judge 需校准 |
| 跨任务/跨 backbone 迁移差 | benchmark 领先换环境失效——用 holdout 集验证 |
| 编译成本失控 | 小模型试跑、trials 上限、token 预算 |
| 未固化产物 | \`program.save()\` + 版本管理 |

---

## 9. 为 Agent 生成的可执行框架

### 9.1 自动优化落地检查清单

\`\`\`markdown
## Prompt 优化自查
□ 是否适合程序化?(多模块/迭代频繁/metric 可定义/有数据)
□ pipeline 是否声明为 Signature?(避免硬编码模板)
□ metric 是否精确可计算?(LLM judge 需校准)
□ 数据是否三分?(train/validation/test)
□ 优化器是否按数据量选型?(10→BFS,50+→BFSWRS,200+→MIPROv2)
□ 编译成本是否可控?(小模型试跑 + trials 上限)
□ 产物是否固化?(program.save() + 版本管理)
□ 是否用 holdout 集验证迁移性?
□ 编辑类型是否与任务匹配?(渐进/元认知类适合逻辑推理)
\`\`\`

### 9.2 DSPy 最小落地模板

\`\`\`python
import dspy

# 1. 声明 Signature(替代硬编码 prompt 模板)
class QA(dspy.Signature):
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="简洁准确回答")

# 2. 定义 metric(精确指标优先)
def metric(gold, pred, trace=None):
    return gold.answer.strip() == pred.answer.strip()

# 3. 编译优化(按数据量选优化器)
optimizer = dspy.MIPROv2(metric=metric, auto="light")
compiled = optimizer.compile(dspy.Predict(QA), trainset=train)

# 4. 评估与固化
compiled.save("compiled_program.json")
\`\`\`

### 9.3 供 Agent 生成优化框架的元规则

1. **声明式优先**:用 Signature 声明,不硬编码 prompt 模板
2. **metric 先行**:没有可计算的 metric 就别自动优化
3. **按数据量选优化器**:防过拟合是第一原则
4. **成本分级**:小模型试跑 → 大模型精调
5. **产物固化**:编译结果版本管理,换 LM 重新编译
6. **迁移验证**:holdout 集检验,防"benchmark 赢家、环境输家"

---

## 10. 生态与资源

### 官方文档与仓库
- [DSPy 官方文档](https://dspy.ai/learn/)(编程三阶段)
- [DSPy 优化器指南](https://dspy.ai/learn/optimization/optimizers/)
- [stanfordnlp/dspy](https://github.com/stanfordnlp/dspy)(约 36.6k★,MIT)
- [DSPy 3.3.0 Release Notes](https://github.com/stanfordnlp/dspy/releases/tag/3.3.0)

### 论文(编号已核实)
- [DSPy](https://arxiv.org/abs/2310.03714) ｜ [OPRO](https://arxiv.org/abs/2309.03409) ｜ [APO/ProTeGi](https://arxiv.org/abs/2305.03495)
- [PromptBreeder](https://arxiv.org/abs/2309.16797) ｜ [EvoPrompt](https://arxiv.org/abs/2309.08532) ｜ [PromptAgent](https://arxiv.org/abs/2310.16427)
- [TextGrad](https://arxiv.org/abs/2406.07496) ｜ [GEPA](https://arxiv.org/abs/2507.19457) ｜ [MIPROv2](https://arxiv.org/abs/2406.11695)
- [The Prompt Report](https://arxiv.org/abs/2406.06608)
- [编辑级失败分析](https://arxiv.org/abs/2605.26655)

---

## 11. 参考来源

- arXiv 论文(编号逐条核实,见 §10)
- DSPy 官方文档与 3.3.0 Release Notes(GitHub API 核实 star)
- ⚠️ 勘误说明:ProTeGi 正确编号 2305.03495(流传的 2309.15717 为无关论文);DILP 编号待核实;AWS/Intel APO 综述编号待核实
- 关联文档:[Prompt_Engineering_Wiki.md](Prompt_Engineering_Wiki.md) §4、[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §15、[Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实并勘误)与 DSPy 官方文档综合而成。标注:DSPy 已至 3.x(3.3.0);ProTeGi/DILP 编号勘误;AWS/Intel 综述编号待核实。*
`;export{n as default};
