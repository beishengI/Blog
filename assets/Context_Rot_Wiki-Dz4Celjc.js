const n=`# LLM Wiki — Context Rot(上下文腐烂)深入讲解

> 面向 LLM Agent 的**上下文腐烂(Context Rot)** 系统性知识库:从现象定义、科学证据、底层机制到防御策略与工程落地,最终沉淀为 Agent 可直接阅读、学习并用于生成上下文管理框架的一手资料。
>
> 定位:本 Wiki 与 [LLM_Wiki.md](LLM_Wiki.md)(上下文文件编写)、[LLM_Skills_Wiki.md](LLM_Skills_Wiki.md)(Agent Skills)、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md)(上下文工程)互为姊妹篇,共同构成"Agent 上下文知识体系"。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:Chroma 技术报告(原文)、Anthropic 工程博客(原文)、arXiv 论文、GitHub 高星项目、社区高浏览量文章

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心概念:什么是上下文腐烂](#2-核心概念什么是上下文腐烂)
3. [科学证据链:为什么会发生](#3-科学证据链为什么会发生)
4. [底层机制:注意力预算与架构根源](#4-底层机制注意力预算与架构根源)
5. [加速因素与失败模式](#5-加速因素与失败模式)
6. [测量与评估上下文腐烂](#6-测量与评估上下文腐烂)
7. [防御与缓解策略:六层纵深体系](#7-防御与缓解策略六层纵深体系)
8. [Agent 工程实践:Claude Code 实战](#8-agent-工程实践claude-code-实战)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

构建 Agent 时,把"塞更多上下文"当作万能解药是最大的误区。**上下文腐烂**是客观存在的物理规律:输入越长,模型从上下文中准确回忆与推理的能力越弱,且这种衰退远在触达 token 上限之前就已发生。

本文档为以下角色提供同一份真相来源:

| 读者 | 本文档的用途 |
|---|---|
| **Agent(编码/通用)** | 第 9 节提供可直接执行的下文卫生检查清单、会话决策树与策略选择表;第 7、8 节提供工程级缓解手段 |
| **Agent 开发者** | 第 3、4 节建立科学认知,第 5 节识别失败模式,第 6 节提供测量方法论 |
| **RAG / 长上下文应用开发者** | 第 7 节第四、六层提供检索与记忆层优化方案 |
| **知识共享者** | 第 10、11 节给出权威一手来源,便于二次传播与考证 |

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:排查"上下文越长越蠢"的问题
   └─ 先读 §2 确认概念 → §3 对照证据 → §5 识别失败模式
      → §7 按层选取缓解手段 → §9 落地检查清单 → §10 查阅生态资源

目标:构建上下文管理框架(生成新框架)
   └─ 先读 §2、§4 建立心智模型 → §7 六层体系作为框架骨架
      → §9 的模板与决策树作为输出规范 → 参考 §10 的成熟实现(Letta 等)
\`\`\`

### 1.3 一句话核心结论

> **上下文是有限资源,边际回报递减。** 好的上下文工程 = 找到**最小**的高信号 token 集合,使目标输出概率最大化。
> —— Anthropic《Effective context engineering for AI agents》

---

## 2. 核心概念:什么是上下文腐烂

### 2.1 官方定义

> "Context Rot 是一种现象:大型语言模型(LLM)的性能(准确性和可靠性)会随着输入上下文(提示词)长度的增加而显著下降,即使对于简单的任务也是如此。这与'模型均匀处理所有语境'的假设相悖。"
> —— Chroma 技术报告《Context Rot: How Increasing Input Tokens Impacts LLM Performance》(2025-07-14)

**提出者**:Chroma 研究人员 **Kelly Hong、Anton Troynikov、Jeff Huber**。
**论文**:arXiv:2505.06120 ｜ 官方页面:[research.trychroma.com/context-rot](https://research.trychroma.com/context-rot) ｜ 复现代码:[chroma-core/context-rot](https://github.com/chroma-core/context-rot)

### 2.2 核心矛盾:宣传的窗口 vs 真实的可靠性

| 层面 | 营销叙事 | 实测真相 |
|---|---|---|
| 上下文窗口 | 百万 token,甚至 1000 万 token | 窗口大 ≠ 用得动;远未触顶就开始腐烂 |
| 基准测试 | Needle in a Haystack(NIAH)近乎满分 | NIAH 只测**字面检索**,不反映真实语义任务 |
| 性能曲线 | 假设"均匀处理所有 token" | 随输入长度非均匀衰退,方向与速度因模型而异 |
| 成本 | 越长越好,一次装完 | token 越多,单位边际价值越低(注意力预算耗尽) |

**最反直觉的事实**:真实复杂度远高于测试环境——语义相似但错误的"干扰项"、逻辑连贯的长文本、需要长输出的任务,都会让腐烂来得更早、更剧烈。

### 2.3 与相邻概念的关系

| 概念 | 关系 |
|---|---|
| **NIAH(大海捞针)** | 最常用的长上下文基准,只测字面检索,是"低估腐烂"的典型 |
| **Lost in the Middle(中间迷失)** | 腐烂的早期实证(2023):模型对上下文中间部分关注显著弱于首尾 |
| **注意力预算(Attention Budget)** | 腐烂的机制根源:每个 token 都消耗有限注意力,类似人类工作记忆容量 |
| **幻觉(Hallucination)** | 腐烂的一种失败表现:上下文过长时模型开始编造 token |
| **工作记忆(Working Memory)** | 人类学类比:LLM 的上下文窗口 ≈ 受限的工作记忆,而非无限的长期记忆 |
| **上下文压缩/Compaction** | 对抗腐烂的第一道防线:总结旧窗口,开启新窗口 |

---

## 3. 科学证据链:为什么会发生

> 本节省略数学推导,聚焦实验设计与可复现结论,便于 Agent 直接引用证据。

### 3.1 Chroma 实验总览(2025,18 个模型)

**被测模型**:包含最先进的 GPT-4.1、Claude Sonnet/Opus 4、Gemini 2.5 Pro/Flash、Qwen3 等 **18 个闭源与开源模型**。

**实验设计原则**:
- **任务复杂度保持恒定,只变化输入长度**——这是与大多数长上下文基准的关键区别(多数基准随输入变长任务也更难,无法隔离"输入长度"这一变量)
- 每个"针类型 × 草垛主题 × 草垛结构"组合下,每个模型测 **8 个输入长度 × 11 个针位置**
- 评估使用对齐的 GPT-4.1 judge,温度 0
- 总计约 **19.4 万次 LLM 调用**,仅 0.035%(69 次)出现模型拒绝尝试

**四大核心实验与结论**:

| # | 实验 | 结论 |
|---|---|---|
| 1 | **针-问题相似度**(Needle-Question Similarity) | 语义相似度越低,随输入长度增加性能衰退越快——真实场景中精确匹配极少,语义模糊会放大长输入难题 |
| 2 | **干扰项影响**(Impact of Distractors) | 干扰项对性能的影响非均匀;输入越长、干扰越多,准确率显著且不均匀下降;不同模型对干扰的敏感度不同 |
| 3 | **针-草垛相似度**(Needle-Haystack Similarity) | 草垛内容与针的相似度对性能无一致影响,需进一步研究 |
| 4 | **草垛结构**(Haystack Structure) | **逻辑连贯的文本反而比随机打乱的文本更容易导致检索失败**(叙事陷阱) |

### 3.2 实验一:针-问题相似度(语义匹配的代价)

**背景**:真实应用中用户很少给出精确关键词,模型必须**推断相关性**。

- 使用 5 种 embedding 模型(text-embedding-3-small/large、jina-embeddings-v3、voyage-3-large、all-MiniLM-L6-v2)对针-问题对计算余弦相似度,取平均
- 结论:**随着针-问题相似度下降,输入长度对性能的破坏性显著增强**。语义模糊 + 长输入 = 双重打击

**对 Agent 的含义**:当你让 Agent 在大语料中"找相关的部分"而非给出精确词,腐烂会加速。

### 3.3 实验二:干扰项如同毒药

**设计**:取高相似度的针-问题对,人工编写 4 个干扰项(与针主题相关、但含微小差异导致答案错误):
- 基线:只有针,无干扰
- 单干扰:针 + 1 个随机位置干扰
- 多干扰:针 + 全部 4 个干扰随机分布

**结论**:
- **长上下文 + 干扰项对所有 LLM 构成巨大挑战**,准确率显著且非均匀下降
- 这高度贴合**金融、法律文档分析**等场景:文档常含高度相似的模板化信息,仅年份、名称、条款版本不同——这些细微差异就是天然干扰项

**关键洞察:模型个性(失败行为分类)**。被干扰混淆时,不同模型表现出不同失败模式:

| 失败模式 | 表现 |
|---|---|
| **幻觉型** | 模型给出自信但错误的答案,混入/捏造信息 |
| **弃权型** | 模型承认无法确定,拒绝作答 |
| **回退型** | 模型退回训练分布中的"通用答案",忽略上下文证据 |

### 3.4 实验三:草垛结构适得其反(叙事陷阱)

**设计**:对比两种输入组织方式:
- **连贯上下文**:段落按逻辑/叙事顺序排列
- **随机上下文**:同样段落随机打乱顺序

**结果**:在需要精准信息检索的任务中(如从文档找出特定数字),**连贯文本的准确率反而明显低于随机文本**。

**两个解释假设**:
1. **叙事结构陷阱(Narrative Trap)**:模型过度追求理解整体叙事流,而非像搜索引擎一样精确定位片段
2. **语义距离挑战**:文本有序时,模型更依赖局部邻近性,错过位于远处位置的正确信息

**对 RAG 开发者**:**不要假设"文档结构越优化越好"**——按主题分块、精心排序的上下文,在检索任务上可能弱于看似"乱"的输入。

### 3.5 输出长度限制导致失败

**设计**:简单复制任务——要求模型重复/重写很长的文本序列,几乎不含推理,纯考验记忆与输出。

**结论**:
- 所有模型在输入约 **2,500–5,000 词(约 3,000–6,500 token)** 时,输出性能大幅下降
- 三大失败模式:

| 失败模式 | 表现 | 影响场景 |
|---|---|---|
| **截断(Truncation)** | 输出突然中断,只交付部分 | 长总结、长代码文件、大型 JSON |
| **拒绝(Refusal)** | 明确说"这太长了,无法完成" | 长格式转换 |
| **信息捏造(Token Invention)** | 生成不准确/重复/虚构 token | 数据填充、格式化 |

**对 Agent 的含义**:即使输入简单,要求长输出的任务同样触发"输出侧腐烂"。生成长文件时应分段构建、逐步验证,而非一次性要求完整产出。

### 3.6 早期与并行研究证据

| 研究 | 年份 | 核心发现 |
|---|---|---|
| **Lost in the Middle**([arXiv:2307.03172](https://arxiv.org/abs/2307.03172),Liu et al.,斯坦福) | 2023 | 首次系统证明:模型对上下文**开头和结尾**关注高,对**中间**严重忽略;信息越靠中间,越像不存在 |
| **NoLiMa** | 2023+ | 针-问题对为非字面匹配时性能显著下降;72.4% 的 needle-question 对需要外部世界知识 |
| **AbsenceBench** | 2024 | 测试"识别给定文本片段不存在"的能力,同样随输入长度衰退 |
| **MRCR(Multi-round Co-reference Resolution)** | 2024+ | 多轮对话中检索第 i 个相似提问的指代消解,涉及干扰项辨识 |
| **LongMemEval**([arXiv:2410.10813](https://arxiv.org/abs/2410.10813)) | 2024 | 对话式长上下文问答基准,Chroma 用作补充验证 |
| **Latent List / Graphwalks** | 2024+ | 揭示"无关内容的类型"影响不同:相互抵消的操作比 print 语句对模型干扰更大;图遍历任务难以隔离"复杂度增加"与"长度增加" |
| **Long-context LLMs Struggle with Long In-context Learning** | 2023+ | 超过 32K token 的长上下文内学习性能显著受限 |

**总体结论**:腐烂不是某一个模型的问题,而是**跨模型普遍存在**的架构级现象,只是衰减曲线缓急不同。

---

## 4. 底层机制:注意力预算与架构根源

> 理解"为什么",才能正确设计"怎么办"。

### 4.1 Transformer 的 n² 注意力瓶颈

LLM 基于 Transformer 架构,每个 token 可以与上下文中**所有其他 token 建立注意力关系**。对 n 个 token,就有 n² 个两两关系。

- 上下文越长,模型捕捉这些两两关系的能力被**拉伸得越薄**
- 自然形成"上下文大小 ↔ 注意力聚焦"之间的张力

### 4.2 注意力预算(Attention Budget)

> "与人类有限的**工作记忆容量**类似,LLM 有一个在解析大量上下文时调用的'注意力预算'。每引入一个新 token,就会消耗一部分预算。" —— Anthropic

- 上下文 = 有限资源,**边际回报递减**
- 每个新 token 都会耗尽一部分预算 → 需要精心挑选给模型的 token
- **核心工程原则:找到最小的高信号 token 集合,最大化目标输出概率**

### 4.3 训练分布偏差

模型从训练数据分布中习得注意力模式,而**短序列在训练数据中远比长序列常见**:
- 模型对"上下文范围内的长程依赖"经验不足
- 缺少针对全局依赖的专门参数
- 这是"长上下文能力天然弱于短上下文"的根源之一

### 4.4 位置编码插值(YaRN 等)

- [位置编码插值](https://arxiv.org/pdf/2306.15595)技术(如 YaRN)让模型把原本训练时较小的上下文适应到更长序列
- 代价:**token 位置理解的精度下降**
- Chroma 报告中 Qwen3 模型即通过 YaRN 从 32,768 扩展到 131,072 token

### 4.5 性能梯度而非悬崖

关键认知:**腐烂是渐进的性能梯度,不是硬性悬崖**:
- 模型在长上下文下仍然高能力,但在信息检索精确度、长程推理上相比短上下文下降
- 这意味着"够用就行"——大多数任务不需要、也不应该用满整个窗口

---

## 5. 加速因素与失败模式

### 5.1 加速腐烂的因素(优先级排序)

| 优先级 | 因素 | 机制 |
|---|---|---|
| ★★★ | **语义相似干扰项** | 与答案主题相关但错误的片段,压倒检索能力,是"最强的毒药" |
| ★★★ | **要求长输出** | 输出侧在 3K–6.5K token 处即崩溃,截断/拒绝/捏造 |
| ★★ | **针-问题语义距离大** | 无法字面匹配时,长输入放大推断难度 |
| ★★ | **逻辑连贯的叙事结构** | 叙事陷阱:模型追流程不追事实 |
| ★ | **输入绝对长度** | 均匀衰退,但方向与速度因模型而异 |
| ★ | **信息冗余/低信号 token** | 浪费注意力预算,稀释高信号 token |

### 5.2 工程中的典型腐烂场景

| 场景 | 腐烂表现 |
|---|---|
| 长会话单 Session 硬扛 | 记忆混淆、回答变简单、bug 乱修 |
| 自动压缩后才想起管理 | Auto-compact 时模型已注意力涣散 |
| RAG 塞入 top-K 全部片段 | 干扰项淹没答案;Token 冗余 |
| 让 Agent 一次性输出整个长文件 | 中途截断或捏造 |
| 文档/API 变化但上下文文件过期 | 决策建立在错误基础上 |
| 多任务挤一个对话 | 旧任务残留污染新任务判断 |

### 5.3 模型行为差异:识别"个性"

不同模型面对腐烂时的失败方式不同,选择模型时应结合任务场景:

- **Claude Opus 4**:偶发空输出/refusal(报告中 0.035% 拒绝率)
- **推理型模型(o3、Qwen thinking)**:与标准模式衰减曲线不同,评估时需单独处理

---

## 6. 测量与评估上下文腐烂

### 6.1 NIAH 的局限(为什么"测满分"不代表"能用")

| 局限 | 说明 |
|---|---|
| 只测字面检索 | 直接词法匹配,忽略语义推断 |
| 草垛内容无关 | 假设草垛内容不影响结果(已被实验三证伪) |
| 无干扰项 | 不测真实场景中最致命的信息竞争 |
| 单针单问 | 不测多轮、长输出等真实负载 |

### 6.2 新一代评估方法论

要正确测量腐烂,至少需要满足:
1. **任务复杂度恒定,只变输入长度**(Chroma 的核心设计)
2. **覆盖语义匹配**(非字面)而非仅词法匹配
3. **引入干扰项**并分层(单干扰/多干扰)
4. **变化草垛结构**(连贯 vs 打乱)
5. **覆盖长输出任务**(复制/总结/长生成)
6. **多模型横评**(闭源 + 开源,标准 + 推理模式)

### 6.3 可用评估工具与基准

| 工具/基准 | 用途 | 获取方式 |
|---|---|---|
| **Chroma context-rot 代码库** | 完整复现四大实验 | [github.com/chroma-core/context-rot](https://github.com/chroma-core/context-rot) |
| **NIAH(基线)** | 字面检索基线 | 社区多处实现 |
| **NoLiMa** | 非字面匹配 | arXiv 公开 |
| **AbsenceBench** | 缺失识别 | arXiv 公开 |
| **LongMemEval** | 对话式长上下文问答 | [arXiv:2410.10813](https://arxiv.org/abs/2410.10813) |
| **LoCoMo** | 对话记忆基准(与 LongMemEval 并称两大核心) | arXiv 公开 |
| **MRCR** | 多轮指代消解 | arXiv 公开 |

### 6.4 生产环境持续验证

> 上下文腐烂是**随机性、上下文依赖性强**的系统性故障,难以一次性测出,需要持续监控。

- **黄金测试集(Golden Dataset)**:标准问题-答案-上下文三元组,回归测试
- **对抗性测试**:故意加干扰项、改变信息位置、提出歧义问题
- **生产数据监控**:抽样人工评估输出准确性与相关性

---

## 7. 防御与缓解策略:六层纵深体系

> 本体系综合 Chroma 建议、Anthropic 官方三技术、RAG 最佳实践与社区经验,按"离模型最近 → 离模型最远"排列。**实践中应组合使用,而非单选一层。**

### 7.1 L1 窗口层:压缩(Compaction)

**定义**:对话接近上下文窗口上限时,总结其内容,用摘要重新初始化一个新的上下文窗口。

- 是长程一致性的**第一杠杆**
- 核心目标:以**高保真**方式蒸馏窗口内容
- 工程注意:
  - 主动压缩优于自动压缩——Auto-compact 时模型往往已涣散
  - 压缩前确认关键决策/未完成任务已被摘要保留
  - Claude Code 中:\`/compact\` 手动触发,\`/context\` 查看占用

### 7.2 L2 记录层:结构化笔记(Structured Note-taking)

**定义**:Agent 在运行过程中维护外部笔记/记录文件,把"工作记忆"外化到磁盘,而不是全部压在上下文里。

典型形态(与 [LLM_Wiki.md](LLM_Wiki.md) 的上下文文件体系同源):

| 笔记 | 用途 |
|---|---|
| \`progress.txt\` / \`Progress.md\` | 已完成 / 进行中 / 接下来 / 已知 Bug——跨会话续接 |
| \`gotchas.txt\` | 踩过的坑与局部经验(信噪比最高的内容) |
| \`Research Proposal.md\` | 在 AI 记得最清楚时固化最终方案("项目宪法") |
| \`Project_index.md\` | 文件夹结构、脚本用途、数据流向——人机共读 |

**为什么有效**:让 Agent 的"工作记忆"只保留当前焦点,其余信息按需从磁盘读取——正是 Anthropic 说的"渐进式披露"。

### 7.3 L3 架构层:多智能体架构(Multi-agent Architectures)

**定义**:将长任务拆给多个各司其职的 Agent,每个 Agent 只维护自己的小上下文,避免单一上下文无限膨胀。

- 典型模式:主 Agent 协调 + 子 Agent 执行(Subagents);执行与验证分离
- **双视角审查**(社区高流量实践):
  - 子代理 A(共享上下文):知道设计意图,发现逻辑/集成错误
  - 子代理 B(全新上下文):无预设,发现盲区、命名不一致、缺测试
- 代价:token 消耗约为单会话的 3–4 倍,适合大型复杂任务

### 7.4 L4 检索层:聚焦式检索(Focused Retrieval,RAG)

**目标**:传给模型的上下文信息量**最少、相关性最高**,直接对抗腐烂中的噪音与成本。

传统 Naive RAG vs 聚焦式检索:

| 维度 | Naive RAG | 聚焦式检索 |
|---|---|---|
| 检索次数 | 一次向量搜索 | 多阶段筛选 |
| 上下文 | top-K 片段全量送入 | 精简到核心事实 |
| 干扰项 | 可能淹没答案 | 显式清除 |
| Token 效率 | 低 | 高 |

**关键技术**:
1. **查询重写与扩展**:检索前用 LLM 重写/扩展用户问题
2. **重排序与过滤(Re-ranking)**:二次评估,只保留高匹配片段
3. **上下文压缩与总结**:送生成前用摘要模型精简
4. **智能分块 + 元数据**:语义分块保证完整语义单元,元数据(章节/作者/日期)用于精确过滤
5. **Agentic RAG**:LLM 自主决定何时检索、检索什么(混合搜索、Graph RAG 是进阶方向)

### 7.5 L5 会话层:会话管理与垂直化

**核心原则(Session 垂直化)**:一个 Session 只干一件事。

| 策略 | 适用场景 | 做法 |
|---|---|---|
| **Continue(继续)** | 上下文内容还有用 | 不动,避免重建代价 |
| **Compact(压缩)** | 用到约 50% 时 | 主动手动压缩,不等自动 |
| **Clear / New Session** | 上下文腐烂明显 | 果断重建;靠 progress.txt + 提案文档快速恢复 |
| **Subagents** | 独立子任务 | 分流,不让搜索结果污染主上下文 |
| **Rollback(回滚)** | 走偏了 | 不在同一上下文修,回到 checkpoint 重来 |

### 7.6 L6 记忆层:外部记忆系统

**方向一:虚拟上下文管理(MemGPT / Letta)**
- 把操作系统的**虚拟内存分页机制**引入 LLM 上下文管理
- 记忆分两层:主上下文(类似 RAM)+ 外部存储(类似磁盘)
- Agent 学会自己调用"读记忆/写记忆/清理记忆"工具
- [letta-ai/letta](https://github.com/letta-ai/letta)(原 MemGPT,arXiv:2310.08560)

**方向二:记忆即服务层(Mem0、Zep 等)**
- 提取、存储、检索对话中的长期记忆(用户偏好、事实、决策)
- Mem0 论文:[arXiv:2504.19413](https://arxiv.org/abs/2504.19413)(ECAI 2025)

**注意**:厂商自测分数与第三方复测差距可能很大,选型时看第三方独立评估。

---

## 8. Agent 工程实践:Claude Code 实战

> 本节综合 Anthropic 官方会话管理指南、Claude Code 最佳实践及两篇社区高流量实战文章。

### 8.1 上下文组成与监控

Claude Code 中,上下文 = system prompt + messages,由 8 部分拼接而成,包括:CLAUDE.md 等指令文件、技能元数据、工具定义、对话历史、工具输出等。

- \`/context\`:查看当前上下文占用构成
- \`/usage\`:Anthropic 新增命令,查看使用情况
- \`/compact\`:手动触发压缩

**关键纪律**:
- 用到 **50% 左右主动 /compact**,不要等自动压缩(那时已注意力涣散)
- 长会话(数小时)中途 auto-compact 后,规则可能"失活"——决定一条指令能否活过压缩,取决于它是否被摘要保真保留。**关键约束要写进 CLAUDE.md(每次自动加载),不要只存在于对话中**

### 8.2 会话管理决策框架(实战版)

1. **任务开始时**:新会话 + 读三份文档(Proposal / index / progress)
2. **任务进行中**:一个 Session 只干一件事;debug、数据处理、出图交给新 Session
3. **任务切换时**:更新 progress.txt → 开新会话
4. **走偏时**:Esc Esc 回滚,或直接 /clear 重来(修正超 2 次强制重启)
5. **并行时**:git worktree 开多个平行现场(实验/写作/debug 互不污染)

### 8.3 质量防线(对抗"做完了"谎言)

AI 编码最大的问题不是不够聪明,而是**太自信、会偷懒**。给"完成"下硬定义:

**可靠性排序**(社区共识):
\`\`\`text
机械化检查(lint / test / typecheck 退出码)
  > 规则化检查(checklist 逐项核对)
  > 主观反思("你做对了吗")
\`\`\`

**具体防线**:
1. **退出硬门槛**:\`npm run build\` 退出码 == 0 才算"编译完成";自修复上限 3 轮,超限强制停止
2. **规则化质量门禁**:完成任务后自动跑 \`npm test\` + \`eslint\` + 无 console.log 残留 + import 路径存在
3. **双代理审查**:执行与验证分离,子代理 A(共享上下文)+ 子代理 B(全新上下文)
4. **Gotchas 沉淀**:AI 犯错被纠正 ≥2 次 → 把规则写进 gotchas.txt / CLAUDE.md

### 8.4 跨会话上下文传承

- **上下文同步 Skill**:采用渐进式披露,只加载最小有用上下文(与 §7.2 记录层配合)
- **交接文档(handoff.md)**:对话 A 上下文未满时生成交接提示词与 handoff.md,对话 B 无缝续接,上下文损失最小

---

## 9. 为 Agent 生成的可执行框架

> 本节输出可直接落地为 Agent 规则/检查清单/模板的内容。Agent 可据此生成新的上下文管理框架。

### 9.1 上下文卫生检查清单(可写入 CLAUDE.md)

\`\`\`markdown
## 上下文卫生(每次任务必查)
□ 会话是否只承担一个主题?(多主题 → 拆新会话)
□ 当前上下文占用 < 50%?(≥50% → 手动 /compact)
□ progress.txt / gotchas.txt 是否为最新?(过时 → 先更新再工作)
□ 关键约束是否在 CLAUDE.md 而非仅对话中?(决定能否活过压缩)
□ 本轮需要的外部信息是否按需读取,而非全部预载?
□ 是否有干扰项/低信号内容混入上下文?(有 → 清除或移出)
□ 长输出任务是否拆段构建、逐步验证?
\`\`\`

### 9.2 会话生命周期决策树

\`\`\`text
开始任务
├─ 新主题? ─────────── 是 → 开新会话,先读 Proposal/index/progress
├─ 上下文 ≥50%? ─────── 是 → /compact(主动)
├─ 上下文腐烂明显(记忆混淆/回答变简单)?
│    ├─ 是 → 更新 progress.txt → /clear 开新会话
│    └─ 否 → 继续
├─ 走偏了? ─────────── 是 → Esc Esc 回滚 / 修正超2次 → /clear
├─ 独立子任务? ──────── 是 → Subagent 分流
└─ 结束 → 更新 progress.txt + gotchas.txt + 索引 → commit
\`\`\`

### 9.3 上下文管理策略选择表

| 场景 | 首选策略 | 备选 |
|---|---|---|
| 短任务、上下文干净 | Continue | — |
| 会话变长、仍有用 | Compact(手动) | — |
| 上下文已腐烂 | Clear / New Session | Rollback |
| 需要并行推进 | Subagents / worktree | Multi-agent |
| 跨会话长项目 | 结构化笔记 + 文档桥 | 外部记忆系统 |
| RAG 检索噪声大 | 聚焦式检索 | Agentic RAG / 图 RAG |

### 9.4 模板:progress.txt(会话桥梁)

\`\`\`markdown
# Progress

## 已完成
- [日期] 数据预处理脚本(preprocess.py)完成,输出 results/processed.parquet
- [日期] 模型训练代码(train.py)200 epoch 后 loss 降至 0.15

## 进行中
- 消融实验(ablation.py):卡在模块 B 替换后 loss 不收敛

## 接下来
- 完成消融实验剩余两组
- 画对比图

## 已知 Bug / Gotchas
- subscriptions 表 append-only,查最新 version 看 MAX(version) 而非 created_at
\`\`\`

### 9.5 模板:gotchas.txt(踩坑记录)

\`\`\`markdown
## Gotchas —— 别踩这些坑
- [模块] subscriptions 表是 append-only,找最新 version 不能只看 created_at
- [接口] 同一 request_id 在 API gateway 叫 @request_id,billing 服务叫 trace_id
- [环境] staging 返回 200 不代表 payment 成功,要去 payment_events 表确认
\`\`\`

### 9.6 供 Agent 生成新框架的元规则

当需要基于本文档生成新的上下文管理框架时,按以下约束输出:

1. **机制先行**:每个策略必须说明它对抗的是哪一层腐烂(§7 六层)
2. **可验证**:框架中的每个门禁都对应可执行命令/退出码,而非主观判断
3. **保真优先**:压缩/摘要策略必须明确"哪些信息不可丢"(决策、契约、约束)
4. **渐进披露**:大内容按需加载,永远不给满窗口
5. **留痕**:所有状态变更落盘(progress/gotchas/index),作为跨会话桥梁

---

## 10. 生态与资源

### 10.1 GitHub 仓库

| 仓库 | 说明 |
|---|---|
| [chroma-core/context-rot](https://github.com/chroma-core/context-rot) | Chroma 报告官方复现代码 |
| [letta-ai/letta](https://github.com/letta-ai/letta)(原 MemGPT) | 虚拟上下文管理,状态化 Agent 平台 |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | 长期记忆即服务层 |
| [anthropics/skills](https://github.com/anthropics/skills) | 官方 Skills(渐进式披露的实现范本) |
| [agentsmd/agents.md](https://github.com/agentsmd/agents.md) | 跨工具上下文文件开放格式 |

### 10.2 核心论文与报告

| 资料 | 定位 |
|---|---|
| [Chroma — Context Rot 技术报告](https://research.trychroma.com/context-rot)(arXiv:2505.06120) | **腐烂概念的原始出处** |
| [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)(2025-09-29) | 官方上下文工程方法论(压缩/笔记/多智能体) |
| [Lost in the Middle](https://arxiv.org/abs/2307.03172)(Liu et al. 2023) | 中间迷失的奠基论文 |
| [LongMemEval](https://arxiv.org/abs/2410.10813)(2024) | 对话式长上下文问答基准 |
| [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)(Wu et al. 2023) | 虚拟内存式上下文管理 |
| [Mem0](https://arxiv.org/abs/2504.19413)(ECAI 2025) | 记忆层工程化 |
| [Anthropic — Claude Code Best practices](https://www.anthropic.com/engineering/claude-code-best-practices) | 工程级最佳实践 |
| [Anthropic — Writing tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents) | 工具设计(上下文效率) |

### 10.3 高质量中文解读

- [澎湃新闻 — 上下文腐烂:当百万token成为AI模型的阿喀琉斯之踵](https://m.thepaper.cn/newsDetail_forward_31500760)
- [掘金 — Agent核心要素-知识之上下文腐烂(Context Rot)](https://juejin.cn/post/7574996958516740115)
- [掘金 — Anthropic官方解密:3招上下文优化,破解Agent性能暴跌](https://juejin.cn/post/7558082281224765486)
- [博客园 — AI Agent 为什么从提示词工程走向上下文工程](https://www.cnblogs.com/hibpm/p/22300438)
- [CSDN — Claude Code上下文压缩机制深度解析](https://blog.csdn.net/m0_55049655/article/details/161548256)

---

## 11. 参考来源

### 一手来源(英文原文)
- Chroma Technical Report — *Context Rot: How Increasing Input Tokens Impacts LLM Performance*: <https://research.trychroma.com/context-rot> ｜ arXiv: <https://arxiv.org/abs/2505.06120>
- Anthropic Engineering — *Effective context engineering for AI agents*: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- Anthropic Engineering — *Claude Code: Best practices for agentic coding*: <https://www.anthropic.com/engineering/claude-code-best-practices>
- Liu et al. — *Lost in the Middle: How Language Models Use Long Contexts*: <https://arxiv.org/abs/2307.03172>
- Wu et al. — *MemGPT: Towards LLMs as Operating Systems*: <https://arxiv.org/abs/2310.08560>
- LongMemEval: <https://arxiv.org/abs/2410.10813>

### 社区与工程实践来源
- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》(小石谈记):Context Rot 概念在 Agent 科研实践中的落地经验(Session 垂直化、三份核心文档、95% 信心审问法、五种上下文管理策略)
- 微信文章《给AI编码搭好质量防线》(小石谈记):编译硬门槛、双代理审查、Gotchas 沉淀、跨会话上下文传承
- 掘金/CSDN/博客园高浏览量文章(见 §10.3)

---

*本文档由联网调研与原文阅读整理而成。Chroma 报告数据(18 模型、19.4 万次调用、四大实验)与 Anthropic 方法论均引自一手来源;社区实践部分标注出处。模型性能数据随版本快速变化,引用时以原始论文/报告为准。*
`;export{n as default};
