# LLM Wiki — Prompt Engineering(提示词工程)方法论

> 面向 LLM Agent 的**Prompt Engineering(提示词工程)** 系统性知识库:从提示词技术谱系(CoT/Self-Consistency/ToT/ReAct/Meta-Prompting)、Anthropic/OpenAI 官方系统提示设计方法、程序化提示优化(DSPy/OPRO),到 2025-2026 的范式迁移(提示词工程 → 上下文工程)与反模式清单。
>
> 定位:本文档是"Agent 上下文知识体系"的**基础交互层**——[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) 讲"模型该看见什么",本文档讲"怎么对模型说"。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、Anthropic/OpenAI 官方文档、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [提示词技术谱系](#2-提示词技术谱系)
3. [系统提示词设计方法(官方)](#3-系统提示词设计方法官方)
4. [Prompt 优化与程序化](#4-prompt-优化与程序化)
5. [2025-2026 范式迁移:提示词工程并未死亡](#5-2025-2026-范式迁移提示词工程并未死亡)
6. [反模式清单](#6-反模式清单)
7. [为 Agent 生成的可执行框架](#7-为-agent-生成的可执行框架)
8. [生态与资源](#8-生态与资源)
9. [参考来源](#9-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

提示词工程是"怎么跟模型说话"的学科。尽管 2025-2026 社区热议"提示词工程已死",准确说法是**重心迁移而非消亡**——手工调词的"玄学"退潮,提示的工程化(评估、自动优化、上下文管理)接棒。本文档沉淀从经典技术到官方方法论的完整知识,避免重新发明轮子。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:写好 system prompt → §3 官方设计方法 → §7.1 模板
目标:提升复杂任务推理 → §2 技术谱系(CoT/ToT/Meta-Prompting)
目标:系统化优化提示 → §4 程序化(DSPy/OPRO)→ §7.3 元规则
```

### 1.3 一句话核心结论

> **提示词工程 = 在提示中精确表达意图与结构。** 当模型更强、上下文工程兴起后,提示词从"全部"退居"一环",但仍是 harness 与循环控制的关键输入。

---

## 2. 提示词技术谱系

### 2.1 基础技术

| 技术 | 论文/出处 | 机制 | 适用 |
|---|---|---|---|
| **Zero-shot** | — | 直接提问,无示例 | 简单任务 |
| **Few-shot(In-Context Learning)** | — | 提示中给 K 个输入-输出示例供模型模仿 | 分类、格式迁移、风格统一 |
| **Chain-of-Thought(CoT)** | [Wei et al. 2022](https://arxiv.org/abs/2201.11903)(NeurIPS 2022) | 示例中展示中间推理步骤 | 算术/常识/符号推理(540B PaLM 仅 8 个 CoT 示例达 GSM8K SOTA) |

### 2.2 进阶推理技术

| 技术 | 论文 | 机制 | 关键数据 |
|---|---|---|---|
| **Zero-shot CoT** | [Kojima et al. 2022](https://arxiv.org/abs/2205.11916) | 仅加"Let's think step by step"触发推理 | text-davinci-002 GSM8K 10.4%→40.7% |
| **Self-Consistency** | [Wang et al. 2023](https://arxiv.org/abs/2203.11171)(ICLR 2023) | 多次采样 CoT 路径 + 多数投票 | 适合答案可投票的推理 |
| **Tree-of-Thoughts(ToT)** | [Yao et al. 2023](https://arxiv.org/abs/2305.10601)(NeurIPS 2023) | 推理组织成"思维树",多路径探索 + 自我评估 + 回溯 | Game of 24:GPT-4 由 CoT 4%→74% |
| **ReAct** | [Yao et al.](https://arxiv.org/abs/2210.03629) | 推理 + 行动交替,工具调用 | Agent 事实型任务主流(详见 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §3) |
| **Meta-Prompting** | [Suzgun & Kalai](https://arxiv.org/abs/2401.12954) | LLM 当"总指挥",拆任务给多个专家子例程,再整合验证 | 比标准提示平均高 17.1%;零样本、任务无关 |

### 2.3 技术选型建议

```text
任务需要多步推理?
├─ 否 → Zero-shot / Few-shot
├─ 是,且答案唯一可投票 → CoT + Self-Consistency
├─ 是,且需规划/前瞻/回溯 → ToT
├─ 需要工具交互 → ReAct
└─ 任务可拆给多个专家视角 → Meta-Prompting
```

---

## 3. 系统提示词设计方法(官方)

### 3.1 Anthropic 官方要点

| # | 要点 | 说明 |
|---|---|---|
| 1 | **清晰直接** | 把 Claude 视作"聪明但新来的员工",给足背景与细节 |
| 2 | **角色设定** | Give Claude a role,锚定视角与行为边界 |
| 3 | **XML 标签结构化** | `<context>`/`<task>`/`<instructions>`/`<example>` 减少歧义 |
| 4 | **精选 few-shot 示例** | 示例风格会被高度模仿,慎选(示例是"图胜千言") |
| 5 | **让模型先思考再作答** | CoT 触发 |
| 6 | **Prefill 预填回复开头** | 控制输出格式 |
| 7 | **链式提示** | 拆解复杂任务为多步 |
| 8 | **强调词** | IMPORTANT / YOU MUST 可提升遵循度 |

### 3.2 OpenAI 六大策略

1. **清晰指令**:具体化、写明期望
2. **提供参考文本**:引用材料,减少幻觉
3. **拆解复杂任务**为子任务
4. **给模型思考时间**:结论前先写步骤
5. **使用外部工具**:检索、代码解释器、函数调用
6. **系统化测试**:用 eval 集比较改动前后输出

### 3.3 Claude Code 中的实践(官方 best practices)

- 先探索 → 再计划 → 后编码
- 给模型**可验证的成功标准**(测试/截图)
- CLAUDE.md 保持精炼并按项目分层(过长反而被忽略)
- 主动管理上下文防"上下文腐烂"(详见 [Context_Rot_Wiki.md](Context_Rot_Wiki.md))

---

## 4. Prompt 优化与程序化

### 4.1 DSPy:编程而非手写提示

[Khattab et al.](https://arxiv.org/abs/2310.03714):
- 把 prompt 管线抽象为声明式"文本变换图",模块带可学习参数
- 编译器按指定 metric 自动生成并优化提示/示例
- 可自举出超过专家手写 few-shot 的管线(GPT-3.5/llama2-13b 比标准 few-shot 高 25%/65%)

### 4.2 OPRO:LLM 当优化器

[Yang et al.](https://arxiv.org/abs/2309.03409)(ICLR 2024):
- LLM 据历史解 + 得分迭代生成新指令
- GSM8K 上超人工 prompt 最高 8%,Big-Bench Hard 最高 50%

### 4.3 提示压缩

- [LLMLingua](https://arxiv.org/abs/2310.05736) 及 [LLMLingua-2](https://arxiv.org/abs/2403.12968):用小模型按困惑度删 token
- 可数倍至 20 倍压缩提示,降本降延迟

### 4.4 何时程序化

```text
一次性/交互场景 → 手工调优即可
长管线 / 需反复迭代 → 程序化(DSPy/OPRO)
```

---

## 5. 2025-2026 范式迁移:提示词工程并未死亡

### 5.1 事实:重心迁移而非消亡

- Anthropic 2025 正式提出 **Context Engineering**("Introducing Context Engineering" 与 "Effective context engineering for AI agents"):重点从"怎么写提示"转向"给模型构造什么上下文"(检索、排序、压缩、布局)
- 强推理模型(如 Claude 4.x)对措辞更鲁棒;社区观察"Claude Code 砍掉 80% 内置 prompt 性能不变"即为佐证

### 5.2 工程重心上移

```text
Prompt Engineering(怎么说话)→ Context Engineering(看什么)
  → Harness Engineering(怎么干活)→ Loop Engineering(怎么循环)
```

提示词成为 harness(工具/MCP/权限/钩子)与循环控制的一环:
- 结构化 XML 提示仍用于 system prompt 与 CLAUDE.md
- meta-prompting 与"LLM 原生交互"(让模型自组织子任务)成为新方向

### 5.3 结论

> 手工调词的"玄学"退潮,提示的**工程化**(eval、自动优化、上下文管理)接棒。提示词工程没有死亡,而是被纳入更大的上下文工程体系。

---

## 6. 反模式清单

| # | 反模式 | 后果 |
|---|---|---|
| 1 | 指令模糊("写得好一点"),无目标与成功标准 | 输出不可控 |
| 2 | 复杂任务不拆解、不给思考步骤 | 一步到位失败 |
| 3 | 提示/CLAUDE.md 冗长堆砌 | 关键规则被淹没,遵循率下降 |
| 4 | 示例与目标输出不一致或含噪音 | few-shot 污染输出格式 |
| 5 | 忽略上下文管理:一次塞满长文 | 上下文近满时性能骤降 |
| 6 | 角色与约束自相矛盾 | 模型随机选一条 |
| 7 | 无 eval,凭感觉调词 | 无法度量是否变好 |
| 8 | 不约束输出格式(无 Prefill/XML/JSON schema) | 输出不可解析 |

---

## 7. 为 Agent 生成的可执行框架

### 7.1 System Prompt 设计模板(XML 结构化)

```markdown
<role>
你是 [角色]:负责 [职责]
</role>

<background_information>
项目背景、技术栈、术语表
</background_information>

<task>
任务指令:做什么、按什么顺序
</task>

<instructions>
规则与边界:必须/禁止
IMPORTANT: 关键约束
</instructions>

<examples>
精选 2-3 个 canonical 示例(不是边界 case 堆砌)
</examples>

<output_format>
输出格式:JSON schema / 结构 / 长度
</output_format>
```

### 7.2 提示质量自查清单

```markdown
## 提示质量自查
□ 目标与成功标准是否明确可验证?
□ 是否拆解了复杂任务?
□ 示例是否精选且与目标一致?
□ 是否给了思考时间(CoT)?
□ 角色/约束是否自洽无矛盾?
□ 输出格式是否已约束(Prefill/XML/JSON)?
□ 是否纳入 eval 集进行系统化测试?
□ 上下文是否精简(未塞满)?
```

### 7.3 供 Agent 生成提示框架的元规则

1. **意图先行**:先明确可验证的成功标准,再写提示
2. **结构优先**:XML 分区(角色/背景/任务/指令/示例/格式),少歧义
3. **示例是画面**:精选 canonical 示例,不堆边界 case
4. **给模型思考时间**:复杂推理用 CoT/ToT,不要求一步到位
5. **工程化评估**:提示改动纳入 eval 集,凭数据不凭感觉
6. **与上下文工程配合**:提示只负责"怎么说",放什么进上下文由上下文工程决定

---

## 8. 生态与资源

### 论文(编号已核实)
- [CoT](https://arxiv.org/abs/2201.11903) ｜ [Zero-shot CoT](https://arxiv.org/abs/2205.11916) ｜ [Self-Consistency](https://arxiv.org/abs/2203.11171)
- [ToT](https://arxiv.org/abs/2305.10601) ｜ [ReAct](https://arxiv.org/abs/2210.03629) ｜ [Meta-Prompting](https://arxiv.org/abs/2401.12954)
- [DSPy](https://arxiv.org/abs/2310.03714) ｜ [OPRO](https://arxiv.org/abs/2309.03409)
- [LLMLingua](https://arxiv.org/abs/2310.05736) ｜ [LLMLingua-2](https://arxiv.org/abs/2403.12968)

### 官方文档
- [Anthropic — Introduction to prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Anthropic — Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Anthropic — Introducing Context Engineering](https://www.anthropic.com/engineering/introducing-context-engineering)
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OpenAI — Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

---

## 9. 参考来源

- arXiv 论文(编号逐条核实,见 §8)
- Anthropic/OpenAI 官方文档(见 §8)
- 社区转述:"提示词工程已死"讨论(以 Anthropic 官方两篇博文为锚点,社区中文转述仅作佐证)
- 关联文档:[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md)(上下文工程)、[Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md)(ReAct)

---

*本文档由 arXiv 一手论文(编号逐条核实)与 Anthropic/OpenAI 官方文档综合而成。性能数据均引自论文摘要原文。*
