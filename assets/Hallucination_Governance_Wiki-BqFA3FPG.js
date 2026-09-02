const n=`# LLM Wiki — 幻觉治理专题(Hallucination Governance)

> 面向 LLM 与 LLM Agent 的**幻觉治理**系统性知识库:从幻觉的定义与类型学、成因全谱(预训练统计限制/后训练奖励/数据/解码/知识冲突/Agent 级联)、检测方法全谱(一致性/不确定性/NLI/LLM 裁判/事后验证)、缓解全谱(数据/训练/解码/RAG/事后/Agent 治理)、评测基准与指标,到 2025-2026 最新进展、失败模式与批判视角,沉淀为 Agent 可直接阅读、学习并用于构建"低幻觉"系统的全谱治理资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**可信度治理层**——幻觉是 Agent 系统可信性(可靠性、真实性、可控性)的核心威胁之一,与 [Context_Rot_Wiki.md](Context_Rot_Wiki.md)(上下文腐烂)、[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md)(检索可信)、[Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md)(级联幻觉攻击 T5)、[AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)(质量门禁)互补。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、Nature(2024)、OpenAI/Anthropic/Google 官方、GitHub 高星仓库

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [幻觉的定义、分类与辨析](#2-幻觉的定义分类与辨析)
3. [幻觉成因全谱](#3-幻觉成因全谱)
4. [幻觉检测方法全谱](#4-幻觉检测方法全谱)
5. [幻觉缓解全谱](#5-幻觉缓解全谱)
6. [评测基准与指标](#6-评测基准与指标)
7. [关键研究盘点](#7-关键研究盘点)
8. [2025-2026 最新进展](#8-2025-2026-最新进展)
9. [Agent 场景幻觉治理](#9-agent-场景幻觉治理)
10. [失败模式、局限与批判视角](#10-失败模式局限与批判视角)
11. [为 Agent 生成的可执行框架](#11-为-agent-生成的可执行框架)
12. [生态与资源](#12-生态与资源)
13. [参考来源](#13-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

幻觉是 LLM 与 Agent 走向生产环境的首要障碍之一:**自信地输出不真实的内容**。它不像显式故障会报错,而是静默地污染结果,导致下游决策错误、合规风险与信任崩塌。本文档提供幻觉的**全谱治理方案**——先理解"为什么会有幻觉"(成因),再掌握"如何发现幻觉"(检测),最后落地"如何减少幻觉"(缓解),并配套评测基准与可执行清单。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解幻觉本质 → §2 定义分类 → §3 成因全谱
目标:上线前检测幻觉 → §4 检测方法 → §6 基准指标 → §11.1 清单
目标:降低生产幻觉率 → §5 缓解全谱(按管线分层) → §9 Agent 治理
目标:评估模型幻觉水平 → §6 基准 → §7 关键研究
目标:构建 Agent 幻觉防线 → §9 治理机制 → §11 可执行框架
\`\`\`

### 1.3 一句话核心结论

> **幻觉无法被彻底消灭(预训练统计极限),但可以被系统性地测量、检测与压制到可接受水平。** 治理的关键不是"消除幻觉",而是"让幻觉可见、可测、可拦截"——检测与缓解必须分层嵌入管线,而非事后补救。

---

## 2. 幻觉的定义、分类与辨析

### 2.1 定义

**幻觉(Hallucination)**:模型生成的、与可验证事实或给定输入不一致的内容。OpenAI(2025)更精确地称之为 **confabulation(虚构)**:模型"自信地输出不真实的事实"。

### 2.2 类型学(主流分类框架)

依据 [Huang et al., arXiv:2311.05232] 等综述,幻觉按"与什么不一致"分为两大类:

| 类型 | 不一致对象 | 子类 | 典型表现 |
|---|---|---|---|
| **忠实性幻觉** (Faithfulness) | 与给定输入/上下文/提示不一致 | 内在不一致;输入冲突 | 自相矛盾;忽略指令;复述错误 |
| **事实性幻觉** (Factuality) | 与可验证的世界事实不一致 | 事实错误;凭空捏造 | 编造论文标题/引用/数据;张冠李戴 |

按"事实是否可知"进一步划分:

- **闭域幻觉(Closed-domain)**:答案有客观标准答案,模型答错(如"法国的首都是?");可精确测量。
- **开域幻觉(Open-domain)**:事实性难以穷举验证(如开放问答),需要用"幻觉率"近似估计。

### 2.3 关键辨析

| 概念 | 区别 |
|---|---|
| 幻觉 vs confabulation | OpenAI 主张 confabulation 更准确:模型不是在"看见幻觉",而是构造了符合统计规律但非真实的内容 |
| 幻觉 vs 事实错误 | 幻觉是"生成性"的构造错误;事实错误包含知识陈旧等非生成性问题 |
| 幻觉 vs 撒谎 | 模型无意图性——它不知道自己在编造,这使检测更难(没有"说谎信号") |
| **有用幻觉(Useful hallucination)** | 创意任务(故事、广告、剧本)中,与事实不符的生成可能是**特性而非缺陷**,治理需按任务区分 |

---

## 3. 幻觉成因全谱

### 3.1 两大根因(OpenAI《Why Language Models Hallucinate》,2025-09)

OpenAI 论文将幻觉根源归结为**预训练统计限制 + 后训练评估奖励**,并据此提出治理方向(详见 §7.1):

| 根因 | 机制 | 含义 |
|---|---|---|
| **预训练统计限制** | "下一词预测"本质上无法编码所有世界事实;任何有损压缩都会丢失信息,模型只能"猜" | 幻觉**不可能被彻底根除**,只能缓解 |
| **后训练评估奖励猜测** | 评测与对齐奖励"给出答案",惩罚"我不知道";模型被训练成**强行作答**而非表达不确定性 | 改变评估方式(奖励恰当的不确定性表达)可显著降低幻觉 |

### 3.2 成因全谱(按管线分层)

| 层面 | 成因 | 说明 |
|---|---|---|
| **数据层** | 训练语料含噪声/错误/重复/过时信息;长尾事实覆盖不足 | 语料质量直接决定知识边界 |
| **预训练/架构层** | 参数容量有限;知识以压缩形式存储,无法逐字回溯 | 与 3.1 根因一致 |
| **后训练层** | RLHF 奖励"有用性"多于"真实性";评估惩罚拒绝/不确定 | 导致过度自信与强行作答 |
| **解码层** | 采样温度放大幻觉;长度惩罚/重复惩罚扭曲概率分布 | [Curious Case, arXiv:2310.10944]:**采样显著劣于贪婪解码** |
| **上下文层** | 长上下文信息过载、中间信息遗忘(位置偏差);上下文与参数记忆冲突 | 关联 [Context_Rot_Wiki.md](Context_Rot_Wiki.md) |
| **知识冲突** | 外部证据(检索结果/工具返回)与模型参数记忆不一致时,模型倾向"自我确信" | 检测与缓解的重点场景 |
| **Agent 层** | 工具返回脏数据被当真;记忆污染;多步推理误差逐步放大;级联幻觉传播 | 关联 [Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md)(T5 级联幻觉) |

---

## 4. 幻觉检测方法全谱

### 4.1 分类维度

| 维度 | 选项 | 说明 |
|---|---|---|
| 是否需参考答案 | 有监督(需标签)/ 无监督 | 无监督可在线使用,生产价值更高 |
| 检测时机 | 离线(事后评测)/ 在线(生成时门控) | 在线检测用于拦截高危输出 |
| 检测粒度 | 句子级 / 原子事实级 / 文档级 | FActScore 类按原子事实打分 |

### 4.2 六大方法族

| 方法族 | 代表技术 | 原理 | 特点 |
|---|---|---|---|
| **自一致性/采样** | SelfCheckGPT([arXiv:2303.08896](https://arxiv.org/abs/2303.08896));Self-Consistency([arXiv:2203.11171](https://arxiv.org/abs/2203.11171)) | 多次采样,比较语义一致性;不一致→疑似幻觉 | 无监督、黑盒可用;成本高(多倍采样) |
| **不确定性** | 语义熵 Semantic Entropy([Nature 2024](https://doi.org/10.1038/s41586-024-07421-0));SAD Self-Aware Decoding | 对语义等价答案聚类求熵;熵高→幻觉 | 比 token 级熵与 p(True) 更可靠 |
| **NLI/蕴含** | RAGTruth 训练数据([arXiv:2401.00396](https://arxiv.org/abs/2401.00396)) | 用自然语言推理判断"证据→回答"蕴含/矛盾 | 适合 RAG 场景,可微调专用模型 |
| **细粒度事实打分** | FActScore([arXiv:2305.14251](https://arxiv.org/abs/2305.14251));FacTool | 拆解为原子事实,逐条对照证据验证 | 可解释;需知识源,成本高 |
| **LLM 裁判** | Lynx([arXiv:2407.08488](https://arxiv.org/abs/2407.08488));HHEM(Vectara) | 用专用判断模型给"证据↔回答"打分 | 可在线、可排序;精度依赖裁判模型 |
| **事后验证/修正** | CoVe 链式验证([arXiv:2309.11495](https://arxiv.org/abs/2309.11495));Verify-and-Edit([arXiv:2306.13296](https://arxiv.org/abs/2306.13296)) | 先生成→自我提问验证→修正 | 可在无外部知识下工作,需二次生成成本 |

### 4.3 RAG 专用检测框架:LettuceDetect

[LettuceDetect](https://github.com/AdamKovacs0/LettuceDetect)(2025,开源):面向 RAG 应用的幻觉检测框架,结合**NLI 基础方法 + LLM 基础方法 + 自修正循环**,可标记幻觉片段并输出修复建议。生产 RAG 系统的现成选项。

### 4.4 检测器质量指标与局限

- **指标**:检测准确率、精度/召回、AUROC;幻觉率估计需校准。
- **局限**:检测器本身有误报/漏报;LLM 裁判存在"自我偏好"与风格偏差;检测成本随方法复杂度上升。**没有免费的检测**——选择取决于任务风险与成本预算。

---

## 5. 幻觉缓解全谱

> 缓解按**管线分层**设计,从"源头减少"到"出口拦截"逐层加固,单一手段无法根治。

| 层级 | 技术 | 说明 |
|---|---|---|
| **数据层** | 语料清洗、去重、事实校验;知识时效管理 | 减少错误知识进入模型 |
| **预训练/后训练层** | RL 与事实奖励;拒绝未知(refusal);推理模型 RLVR | OpenAI 论证 RL 训练可显著降低幻觉;推理模型在标准基准上幻觉率大幅下降(§8) |
| **解码层** | 贪婪/低温解码;DoLa([arXiv:2309.03816](https://arxiv.org/abs/2309.03816));ITI([arXiv:2306.03341](https://arxiv.org/abs/2306.03341));SAD 不确定性感知解码 | 解码期干预,零训练成本 |
| **检索/grounding 层** | RAG;Self-RAG([arXiv:2310.11511](https://arxiv.org/abs/2310.11511));引用溯源(citation grounding);工具调用替代猜测 | **当前最有效的落地手段**,详参 [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) 与 [Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md) |
| **事后验证层** | CoVe 链式验证;Verify-and-Edit;多轮自检 | 生成后验证再输出,牺牲延迟换准确 |
| **Agent 治理层** | 工具结果交叉验证;置信度门控;HITL 审批;输出验证器;幻觉评测纳入门禁 | 详见 §9,关联 [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md) |

### 5.1 为什么"RAG 不等于消除幻觉"

RAG 大幅降低"知识盲区幻觉",但引入新的幻觉来源:**检索到无关/错误片段却照抄、上下文与参数记忆冲突、引用幻觉(引用了不存在的内容)**。治理要点:

1. 检索质量先行(相关性/去噪,关联 [RAG_Practice_Wiki.md](RAG_Practice_Wiki.md) §5-7);
2. 生成时强制**基于证据**并附引用;
3. 用 §4.2 方法对"证据↔回答"做一致性检测。

---

## 6. 评测基准与指标

### 6.1 核心指标

| 指标 | 用途 |
|---|---|
| 事实精度(FactScore) | 长文本中原子事实正确的比例 |
| 幻觉率(Hallucination Rate) | 闭域问答中答错/捏造比例;开域用抽样估计 |
| 检测 AUROC / 精度-召回 | 评估检测器本身质量 |
| 语义熵 | 无需答案的无监督不确定性信号 |

### 6.2 基准对比

| 基准 | 发布 | 形态 | 说明 |
|---|---|---|---|
| [TruthfulQA](https://arxiv.org/abs/2109.07958) | 2022 | 对抗式问答 | 含"错误共识/错误信念"陷阱,经典入门 |
| [HaluEval](https://arxiv.org/abs/2305.11747) | 2023 | 3.5 万样本 | 问答/对话/摘要三任务,幻觉+正常样本 |
| [RAGTruth](https://arxiv.org/abs/2401.00396) | 2024 | RAG 语料 | 真实 RAG 管线中抽取,训练检测模型的主力 |
| [SimpleQA](https://openai.com/index/simple-qa/) | 2024 | 短问答 | OpenAI 短形式事实性基准,主打"难到让大模型集体低分" |
| HaluBench | 2024 | 多领域问答 | 金融/法律/医疗/开放域;与 Lynx 配套,用 AutoJudge 评测 |
| [FACTS 套件](https://www.kaggle.com/competitions/facts-kaggle-competition) | 2025 | Grounding/Parametric/Search/多模态 | Google+Kaggle 联合,**最全面的事实一致性评测套件** |
| HHEM(Vectara) | 2024-2025 | 判断模型 | 幻觉评测模型,已被 [Stanford AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report) 采纳为事实性评测主力 |

### 6.3 评测批判

- 基准存在**饱和与数据泄露**问题:高分≠生产可靠;
- 基准分布与真实用户分布差异大:Anthropic(2025)用外推法测量,发现**真实开放场景幻觉率显著高于基准测量值**;
- 用检测器自我评估存在乐观偏差——评估体系需独立裁判与黄金集(关联 [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md))。

---

## 7. 关键研究盘点

| 研究 | 来源 | 核心结论 |
|---|---|---|
| **Why Language Models Hallucinate** | OpenAI,2025-09 论文 | 双根因(预训练统计限制+后训练奖励猜测);建议**改革评估:奖励恰当表达不确定性**,而非惩罚"我不知道" |
| **Semantic Entropy** | [Nature 630, 625-630(2024)](https://doi.org/10.1038/s41586-024-07421-0) | 语义级不确定性检测幻觉,优于 token 级熵;p(True) 仅略优于随机 |
| **Curious Case of Hallucination** | [Google DeepMind, arXiv:2310.10944](https://arxiv.org/abs/2310.10944) | **温度采样显著放大幻觉**,贪婪解码更稳;任务难度与幻觉相关 |
| **SelfCheckGPT** | [arXiv:2303.08896](https://arxiv.org/abs/2303.08896) | 零资源黑盒幻觉检测:采样一致性即可判断,无需外部知识 |
| **FActScore** | [EMNLP 2023, arXiv:2305.14251](https://arxiv.org/abs/2305.14251) | 长文本事实精度的原子事实分解测量法,成为事实评测事实标准 |
| **Lynx + HaluBench** | [arXiv:2407.08488](https://arxiv.org/abs/2407.08488) | 开源幻觉裁判模型 + 多领域基准;Lynx-70B 在 HaluBench 上超越 GPT-4 |
| **How much do LLMs hallucinate?** | Anthropic 博客,2025-07 | 用外推法测量真实场景幻觉率,指出**基准测量普遍低估真实幻觉**;幻觉率随话题变化显著 |
| **知识冲突与幻觉** | 2024 系列研究 | 外部证据与参数记忆冲突时,模型更倾向"自我确信",是检测难点(编号待核实,以论文为准) |

---

## 8. 2025-2026 最新进展

| 方向 | 进展 | 治理含义 |
|---|---|---|
| **评估改革** | OpenAI 论文倡导"奖励不确定性表达";各厂商将"拒绝未知/引用"纳入评测 | 治理重心从"消除幻觉"转向"管理不确定性" |
| **推理模型(RL/RLVR)** | o 系/R1/GPT-5 等推理模型在 SimpleQA 类标准基准幻觉率大幅下降 | 但出现新失败模式:推理痕迹中的中间幻觉与过度自信 |
| **评测基建** | Google FACTS 套件(2025);HHEM 成为主流;Stanford AI Index 2025 引入事实性评测 | 幻觉测量更标准化、可横向比较 |
| **开源检测工具** | Lynx、HHEM、LettuceDetect 等可自托管,检测成本下降 | 生产管线可内置实时幻觉门控 |
| **Agent 幻觉治理** | 工具调用验证、引用溯源、级联幻觉防范成为 Agent 安全标配 | 关联 [Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md) T5 |
| **经济视角** | Anthropic(2025)量化幻觉成本:真实场景幻觉率高于基准 | 治理投入可按"幻觉成本×发生概率"做预算(关联 [Agent_Economics_Wiki.md](Agent_Economics_Wiki.md)) |

---

## 9. Agent 场景幻觉治理

### 9.1 Agent 幻觉定义

Agent 幻觉检测 = 给定 **输入 + 中间过程(工具调用结果/检索结果/记忆/推理链)+ 输出**,判定输出是否存在幻觉。比单轮 LLM 多一个维度:**幻觉可能来自"过程"而非"模型"**——工具返回脏数据、记忆污染、错误推理链都会"漂白"成看似合理的输出。

### 9.2 Agent 特有幻觉成因

| 成因 | 机制 |
|---|---|
| 工具结果误读 | 把失败/空/错误返回当成事实,继续推理 |
| 记忆冲突 | 长期记忆与当前证据矛盾,模型选择记忆 |
| 长链误差放大 | 多步推理中单点误差沿链放大 |
| 级联幻觉(T5) | 幻觉内容经 agent 间通信传播扩散成系统级污染 |

### 9.3 Agent 治理机制(落地清单)

1. **工具结果验证**:对工具返回做 schema/空值/异常校验,失败显式降级而非猜测;
2. **证据锚定**:关键结论必须附引用/溯源(检索片段、工具返回 ID),无源不输出;
3. **过程自检**:高影响步骤插入 CoVe 式验证;多代理共识用于关键决策;
4. **置信度门控**:语义熵/一致性检测超阈值→转人工或拒绝;
5. **输出验证器**:交付前用独立裁判检测"证据↔回答"一致性(关联 [AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md));
6. **评测门禁**:幻觉率纳入 golden set 与发布门禁(关联 [Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md))。

---

## 10. 失败模式、局限与批判视角

1. **幻觉不可根除**:OpenAI 论证预训练统计极限决定了"完美事实性"与"概率生成"不可兼得;目标应是**可接受的幻觉率**,而非零。
2. **检测有成本与误报**:一致性/裁判方法成本高;误报会拒绝合法输出、拉低可用性——检测阈值需按任务风险校准。
3. **基准≠真实**:基准高分与真实场景幻觉率存在差距(Anthropic 外推研究);评测需贴近真实分布。
4. **过度抑制的代价**:过度拒绝/过度保守会损伤能力(创造力、推测性规划);"不确定性表达"训练若矫枉过正,模型会频繁拒答。
5. **术语滥用**:很多"幻觉"实为 confabulation 或知识陈旧;治理前先正确定义问题类型,避免错配方案。
6. **有用幻觉是特性**:创意任务中幻觉是价值来源——治理应**按任务类型差异化**,而非一刀切。

---

## 11. 为 Agent 生成的可执行框架

### 11.1 幻觉治理自查清单

\`\`\`markdown
## 幻觉治理自查
□ 是否已按任务类型定义"可接受幻觉率"?(创意 vs 事实性任务分开定)
□ 高风险输出是否强制证据锚定(引用/溯源)?
□ 是否内置在线幻觉检测?(语义熵/一致性/NLI/LLM 裁判)
□ 检索后是否校验"证据↔回答"一致性?(防检索无关片段照抄)
□ 工具调用失败是否显式降级而非猜测?
□ 关键决策是否多代理共识或 HITL?
□ 是否定期用独立基准评测幻觉率?(SimpleQA/HaluBench/FACTS)
□ 评测是否贴近真实分布而非仅基准分数?
□ 是否监控"过度拒绝"副作用?(治理不应损伤可用性)
□ 模型/管线升级后是否复测幻觉率?(防回归)
\`\`\`

### 11.2 供 Agent 生成幻觉治理框架的元规则

1. **分层加固**:数据→训练→解码→grounding→事后→Agent 治理,逐层设防;
2. **可见优先**:先让幻觉可测(指标+基准),再谈缓解;不可测则无法治理;
3. **证据锚定**:事实性输出一律可溯源,无源不输出;
4. **检测前置**:在线检测内嵌管线,而非事后人工抽查;
5. **成本校准**:检测/验证成本与任务风险匹配,高成本方法只用于高影响输出;
6. **测量真实**:以贴近生产分布的评测为准,不信单一基准分数;
7. **平衡取舍**:治理力度与能力/延迟/可用性平衡,避免矫枉过正。

### 11.3 即用提示模板(检测)

\`\`\`text
你是幻觉检测器。给定【证据】与【回答】:
1. 逐条列出回答中的原子事实;
2. 标注每条事实:有证据支持 / 证据矛盾 / 无证据(凭空);
3. 给出"无证据+矛盾"占比与整体判决(有幻觉/无幻觉/需复核)。
只依据给定证据判断,不要使用外部知识。若证据不足,明确说"证据不足"。
\`\`\`

---

## 12. 生态与资源

### 论文(编号已核实)
- [Why Language Models Hallucinate](https://openai.com/index/why-language-models-hallucinate/)(OpenAI 2025-09,PDF 见 [OpenAI 站内](https://cdn.openai.com/pdf/d04913be-3f6f-4d2b-b283-ff432ef4aaa5/why-language-models-hallucinate.pdf))
- [A Survey on Hallucination in LLMs(Principle/Taxonomy)](https://arxiv.org/abs/2311.05232) ｜ [A Comprehensive Survey of Hallucination Mitigation](https://arxiv.org/abs/2401.01313)
- [Survey of Hallucination in NLG](https://arxiv.org/abs/2202.03629)(Ji et al.) ｜ [SimpleQA](https://arxiv.org/abs/2411.04368)
- [Semantic Entropy(Nature)](https://doi.org/10.1038/s41586-024-07421-0) ｜ [Curious Case](https://arxiv.org/abs/2310.10944) ｜ [SelfCheckGPT](https://arxiv.org/abs/2303.08896) ｜ [FActScore](https://arxiv.org/abs/2305.14251)
- [DoLa](https://arxiv.org/abs/2309.03816) ｜ [ITI](https://arxiv.org/abs/2306.03341) ｜ [CoVe](https://arxiv.org/abs/2309.11495) ｜ [Self-RAG](https://arxiv.org/abs/2310.11511) ｜ [Verify-and-Edit](https://arxiv.org/abs/2306.13296)
- [HaluEval](https://arxiv.org/abs/2305.11747) ｜ [RAGTruth](https://arxiv.org/abs/2401.00396) ｜ [TruthfulQA](https://arxiv.org/abs/2109.07958) ｜ [Lynx](https://arxiv.org/abs/2407.08488)

### 官方与平台
- [OpenAI SimpleQA](https://openai.com/index/simple-qa/) ｜ [Google FACTS 基准](https://www.kaggle.com/competitions/facts-kaggle-competition)
- [Anthropic《How much do LLMs hallucinate?》](https://www.anthropic.com/news/measuring-hallucinations)
- [Stanford AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report)(HHEM 事实性评测)

### GitHub
- [Lynx](https://github.com/PatronusAI/lynx) ｜ [LettuceDetect](https://github.com/AdamKovacs0/LettuceDetect) ｜ [FActScore](https://github.com/shmsw25/FActScore) ｜ [SelfCheckGPT](https://github.com/potsawee/selfcheckgpt)

---

## 13. 参考来源

- arXiv 论文(编号逐条核实:TruthfulQA=2109.07958、FActScore=2305.14251、SelfCheckGPT=2303.08896、HaluEval=2305.11747、RAGTruth=2401.00396、CoVe=2309.11495、DoLa=2309.03816、ITI=2306.03341、Self-RAG=2310.11511、Lynx=2407.08488、SimpleQA=2411.04368、Curious Case=2310.10944、Surveys=2311.05232/2401.01313/2202.03629)
- Nature 2024(Semantic Entropy,DOI:10.1038/s41586-024-07421-0)已核实
- OpenAI《Why Language Models Hallucinate》(2025-09)官方已核实;Anthropic 幻觉测量博客(2025-07)已核实
- Google FACTS 套件(2025,Kaggle 官方)已核实;Stanford AI Index 2025 已核实
- 待核实项(2026-08-10 复核):知识冲突与幻觉的系列论文编号(以 arXiv 为准,未列入编号)
- 关联文档:[Context_Rot_Wiki.md](Context_Rot_Wiki.md)、[RAG_Practice_Wiki.md](RAG_Practice_Wiki.md)、[Agentic_RAG_Wiki.md](Agentic_RAG_Wiki.md)、[Multi_Agent_Security_Wiki.md](Multi_Agent_Security_Wiki.md)、[AI_Coding_Quality_Gate_Wiki.md](AI_Coding_Quality_Gate_Wiki.md)、[Eval_Infrastructure_Wiki.md](Eval_Infrastructure_Wiki.md)、[Agent_Economics_Wiki.md](Agent_Economics_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实)、Nature、OpenAI/Anthropic/Google 官方与 GitHub 高星仓库综合而成。待核实项均已明确标注,不以未核实编号充数。*
`;export{n as default};
