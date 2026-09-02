# LLM Wiki — Agent 记忆系统工程化(Memory Engineering in Production)

> 面向 LLM Agent 的**记忆系统工程化(Memory Engineering)** 系统性知识库:从记忆生命周期生产级实践(提取/存储/检索/冲突/遗忘)、记忆编辑(外部库 vs 权重级)、记忆评估、记忆与上下文配合、生产框架选型,到记忆安全交互、2025-2026 最新进展与失败模式,沉淀为可直接落地的一手工程资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**记忆工程层**——[Agent_Memory_Wiki.md](Agent_Memory_Wiki.md) 讲记忆架构与框架,本文档讲生产级工程细节与坑。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、官方文档、GitHub 高星仓库

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [记忆生命周期工程化](#2-记忆生命周期工程化)
3. [记忆编辑](#3-记忆编辑)
4. [记忆评估](#4-记忆评估)
5. [记忆与上下文配合](#5-记忆与上下文配合)
6. [生产框架与平台](#6-生产框架与平台)
7. [记忆安全交互](#7-记忆安全交互)
8. [2025-2026 最新进展](#8-2025-2026-最新进展)
9. [失败模式与避坑](#9-失败模式与避坑)
10. [为 Agent 生成的可执行框架](#10-为-agent-生成的可执行框架)
11. [生态与资源](#11-生态与资源)
12. [参考来源](#12-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

[Agent_Memory_Wiki.md](Agent_Memory_Wiki.md) 回答了"记忆是什么、选什么框架",本文档回答**生产级问题**:记忆怎么提取不污染、冲突怎么解决、陈旧怎么发现、评估怎么证明价值、安全怎么守住。核心原则:记忆是外部一等公民存储,**权重不做事实级热更新**。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:设计记忆系统 → §2 生命周期 → §5 上下文配合 → §10 检查清单
目标:记忆编辑/冲突 → §2.4 冲突 → §3 编辑
目标:评估记忆价值 → §4 评估
目标:选框架 → §6 对比 → 呼应 Agent_Memory_Wiki §4
```

### 1.3 一句话核心结论

> **记忆的三大生产原则:分层存储、时间感知检索、追加不覆盖。** 以 ADD-only 日志替代原地更新,从根上规避合并冲突。

---

## 2. 记忆生命周期工程化

### 2.1 提取时机

| 方式 | 机制 | 代表 |
|---|---|---|
| **同步提取** | 对话中即时写入 | Mem0 默认 |
| **异步提取(sleep-time)** | 后台"睡眠 agent"离线消化对话、重写核心记忆;主 agent 不持有记忆编辑工具 | [Letta sleep-time compute](https://arxiv.org/abs/2504.13171)(同等准确率下测试时算力降约 5×,单查询成本降 2.5×) |
| **事件驱动** | agent 确认动作后写入 | 生产常态 |

### 2.2 存储架构(分层化共识)

| 层 | 实现 |
|---|---|
| 核心记忆(in-context) | MemGPT 的 OS 式虚拟上下文 |
| 对话回忆 | 会话历史 |
| 归档记忆 | 长期外部存储 |
| 关系图谱 | Mem0 向量+图双存储;Zep/Graphiti 时间感知知识图谱 |

### 2.3 检索策略(多信号融合)

```text
单一语义检索不够:
  语义向量 + BM25 关键词 + 实体匹配(并行打分融合)
  + 时间感知检索(区分当前状态/过去事件/未来计划)
```

> LongMemEval 验证:time-aware query expansion 与 fact-augmented key expansion 显著提升召回。

### 2.4 冲突解决(重要变化)

**经典做法**:update 阶段流水线(提取→过滤→协调→去重合并,按时间戳与置信度裁决)。

**2026 转向**:Mem0 新算法改为**单遍 ADD-only 提取**(一次 LLM 调用,不再 UPDATE/覆盖),记忆只累积不覆写——**"以追加日志替代原地更新",从根上规避合并冲突**。

### 2.5 遗忘与清理

| 手段 | 说明 |
|---|---|
| 重要性 + recency 加权调度 | Mem0 论文、Hindsight |
| 摘要压缩 | Anthropic compaction |
| 按时间线归档 | 分层归档 |
| 显式 forget 操作 | Cognee 提供 forget API |
| 会话级过期清理 | 生产标配 |

---

## 3. 记忆编辑

### 3.1 两条路线对比

| 维度 | 外部记忆库编辑 | 权重级编辑 |
|---|---|---|
| 机制 | 改外部存储记录 | 改模型参数 |
| 可版本化 | ✅ | ❌ |
| 可审计 | ✅ | ❌ |
| 可回滚 | ✅ | ❌ |
| 副作用 | 无 | **毒性累积、通用能力退化** |

### 3.2 权重级编辑的风险

- **ROME**([arXiv:2202.05262](https://arxiv.org/abs/2202.05262)):秩一更新定位事实关联
- **MEMIT**([arXiv:2210.07229](https://arxiv.org/abs/2210.07229)):批量编辑上千条关联
- **BadEdit**([arXiv:2403.13355](https://arxiv.org/abs/2403.13355),ICLR 2024):编辑技术可被用于**注入后门**——仅 15 个样本即达近 100% 成功率,且对后续微调免疫
- **KME 综述**([arXiv:2310.16218](https://arxiv.org/abs/2310.16218)):系统总结编辑的副作用与不可靠性

### 3.3 生产选择

> **外部记忆库编辑远更安全**(可版本化、可审计、可回滚、与权重隔离)。权重编辑仅适合不可检索的场景,且需严格评估副作用。**生产共识:权重不做事实级热更新。**

---

## 4. 记忆评估

### 4.1 质量维度(LongMemEval 五类核心能力)

| 能力 | 说明 |
|---|---|
| 信息提取 | 从记忆中检索事实 |
| 多会话推理 | 跨会话综合 |
| 时间推理 | 区分时间状态 |
| 知识更新 | 反映最新事实 |
| **弃权(abstention)** | 不确定时不答 |

> 商业助手在长程记忆上准确率约掉 **30%**。

### 4.2 归因评估

- **逐层消融**:LongMemEval 将记忆设计拆为索引/检索/读取三阶段逐层消融
- **系统对比**:Mem0 论文对 6 类基线系统对比,验证记忆组件的独立贡献

### 4.3 基准局限

| 局限 | 说明 |
|---|---|
| 学术合成场景 | LoCoMo/LongMemEval 规模小(<10 万 token)、偏问答 |
| 缺乏真实场景 | 无真实多租户/多 agent 场景与成本-质量权衡 |
| 分数≠生产收益 | 基准高分与生产收益非线性对应(需业务级 A/B) |

> 新进展:Mem0 BEAM(1M/10M token)开始逼近生产规模。

---

## 5. 记忆与上下文配合

### 5.1 注入策略(just-in-time)

- 记忆检索结果在查询时按需注入,**取最小高信号集**
- **渐进式披露**:先用轻量索引/元数据(路径、摘要、时间戳)进上下文,agent 按需展开细节
- 呼应 [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) §5

### 5.2 防污染

- **Context Rot 是硬约束**:避免把记忆库检索结果与工作上下文无差别混放(详见 [Context_Rot_Wiki.md](Context_Rot_Wiki.md))
- 用 compaction、结构化笔记、多 agent 架构隔离记忆读写

---

## 6. 生产框架与平台

### 6.1 框架对比

| 框架 | 特点 | 关键数据 |
|---|---|---|
| **Mem0** | 向量+图双存储;ADD-only 提取、多信号检索;库/自托管/云平台三档 | 2026 新算法 LoCoMo 92.5、LongMemEval 94.4(平台实测) |
| **Letta/MemGPT** | OS 式记忆分层 + sleep-time agents;记忆管理与对话解耦 | — |
| **Zep/Graphiti** | 时间知识图谱;实体带时间区间 | DMR 94.8% vs MemGPT 93.4%;LongMemEval 提升 18.5%、延迟降 90% |
| **Cognee** | 向量+图+本体;remember/recall/forget/improve 四操作;强调可追溯/租户隔离/审计 | [arXiv:2505.24478](https://arxiv.org/abs/2505.24478) |
| **Hindsight** | 四层逻辑网络(世界事实/经验/实体摘要/演化信念)+ retain/recall/reflect | [arXiv:2512.12818](https://arxiv.org/abs/2512.12818) |

### 6.2 架构分级

```text
向量库(基础)→ 图(关系)→ 分层时间线(Zep/Graphiti)→ 语义分层网络(Hindsight)
```

### 6.3 选型判断

- **自建**:深度定制与数据主权
- **平台**(Mem0 Cloud、Zep、腾讯云 Agent Memory 2.0——2026-08 Team Memory 上线,记忆从个人扩展到团队共享):快速上线
- 判断维度:时序能力、冲突处理、删除/审计、多租户隔离、成本

---

## 7. 记忆安全交互

### 7.1 投毒防御(生产实践)

| 措施 | 说明 |
|---|---|
| 写入校验 | 提取阶段过滤低可信/指令型内容(Mem0 filter 阶段) |
| 读写与租户隔离 | Cognee 强调 |
| 审计追踪 | 谁写入/何时/来源 |
| 不可信数据处理 | 所有外部进入上下文的文本先视为不可信(Anthropic 建议) |
| 删除 API 配套审计 | 合规要求 |

> 呼应 [Memory_Security_Wiki.md](Memory_Security_Wiki.md);OWASP Agentic AI Top 10 将记忆/上下文投毒列为头部威胁(具体排位以官方文档为准)。

### 7.2 GDPR 删除权

外部记忆库天然支持按 user_id/记忆 ID 精准删除(Mem0、Zep、Cognee 均提供 delete/forget API)——**这是比权重级编辑更大的合规优势**;需保留删除审计记录。

---

## 8. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **self-evolving 记忆** | A-MEM([arXiv:2502.12110](https://arxiv.org/abs/2502.12110),NeurIPS 2025)以 Zettelkasten 动态建链,新记忆触发旧记忆属性更新;Self-Evolving Agents 综述([arXiv:2507.21046](https://arxiv.org/abs/2507.21046)) |
| **ADD-only 取代 UPDATE** | Mem0 2026 新算法(见 §2.4) |
| **证据-推断分离** | Hindsight(2025-12)显式区分证据与推断 |
| **sleep-time 异步记忆** | Letta(2025-04) |
| **团队级记忆** | 腾讯云 Team Memory(2026-08):多 agent 共享记忆成为产品卖点 |
| **百万 token 级评测** | Mem0 BEAM(1M/10M token) |

---

## 9. 失败模式与避坑

| 失败模式 | 避坑 |
|---|---|
| **记忆漂移** | agent 自写自读导致信念固化/错误放大 → 冲突检测 + 置信度 + 人工审核环 |
| **陈旧记忆** | "信任旧记忆"风险 → 时间感知检索 + 过期策略(Zep 边时间区间) |
| **污染** | 无关/低质记忆挤占注意力预算引发 context rot → 控制注入量 + 渐进披露 |
| **膨胀** | 记忆无限增长拖慢检索 → 分层归档 + 压缩摘要 + 显式遗忘 |
| **毒性累积** | 权重级序贯编辑退化 → 避免在生产对权重做热编辑 |
| **基准幻觉** | LoCoMo/LongMemEval 高分 ≠ 生产收益 → 业务级 A/B + 成本评估 |

---

## 10. 为 Agent 生成的可执行框架

### 10.1 记忆系统生产自查清单

```markdown
## 记忆工程自查
□ 提取是否分层?(同步 + 异步 sleep-time 结合)
□ 是否 ADD-only 追加?(避免 UPDATE 冲突)
□ 检索是否多信号融合?(语义 + BM25 + 实体 + 时间感知)
□ 是否时间感知?(区分当前/过去/未来,防陈旧)
□ 是否有遗忘与归档策略?(防膨胀)
□ 编辑是否走外部库?(权重不做热更新)
□ 是否可审计、可删除?(GDPR 合规)
□ 是否有冲突检测与置信度?(防漂移)
□ 注入量是否最小化?(防 context rot)
□ 是否用业务级 A/B 验证价值?(防基准幻觉)
```

### 10.2 记忆写入决策树

```text
新信息要写入记忆?
├─ 来源可信?(用户显式告知/已验证)→ 是 → 继续
├─ 内容指令性?("你应该…")→ 拦截,不写入
├─ 是事实还是推断?
│    ├─ 推断 → 标记"推断",与证据分离(Hindsight 模式)
│    └─ 事实 → 正常写入,标注来源与时间戳
├─ 与既有记忆冲突?
│    ├─ 是 → ADD-only 追加 + 冲突标记,不覆盖
│    └─ 否 → 追加写入
└─ 是否敏感?(PII/密钥)→ 加密或最小化
```

### 10.3 供 Agent 生成记忆框架的元规则

1. **追加不覆盖**:ADD-only,冲突用时间戳+置信度标记而非覆盖
2. **时间感知**:所有记忆带时间戳,检索区分当前/过去/未来
3. **证据-推断分离**:事实与推断分开存储,推断可追溯
4. **外部一等公民**:记忆存外部库,权重不做热更新
5. **异步提取**:sleep-time agent 消化,不阻塞主循环
6. **最小注入**:渐进式披露,防 context rot
7. **可审计可删除**:合规内建,删除 API + 审计日志

---

## 11. 生态与资源

### 论文(编号已核实)
- [Mem0](https://arxiv.org/abs/2504.19413) ｜ [MemGPT](https://arxiv.org/abs/2310.08560) ｜ [Zep/Graphiti](https://arxiv.org/abs/2501.13956)
- [Hindsight](https://arxiv.org/abs/2512.12818) ｜ [Cognee](https://arxiv.org/abs/2505.24478) ｜ [Sleep-time Compute](https://arxiv.org/abs/2504.13171)
- [ROME](https://arxiv.org/abs/2202.05262) ｜ [MEMIT](https://arxiv.org/abs/2210.07229) ｜ [BadEdit](https://arxiv.org/abs/2403.13355) ｜ [KME Survey](https://arxiv.org/abs/2310.16218)
- [LongMemEval](https://arxiv.org/abs/2410.10813) ｜ [LoCoMo](https://arxiv.org/abs/2402.17753)
- [A-MEM](https://arxiv.org/abs/2502.12110) ｜ [Self-Evolving Agents Survey](https://arxiv.org/abs/2507.21046)

### 框架与平台
- [Mem0 GitHub](https://github.com/mem0ai/mem0)
- [Cognee GitHub](https://github.com/topoteretes/cognee)
- [Letta sleep-time 官方博客](https://www.letta.com/blog/sleep-time-compute)
- [OWASP GenAI 项目](https://genai.owasp.org/)

---

## 12. 参考来源

- arXiv 论文(编号逐条核实,见 §11)
- 官方文档与博客(Letta、Mem0、Anthropic 上下文工程)
- 待核实项(2026-08-10 联网复核):腾讯云 Team Memory **已确认 2026-08 官方发布**(Agent Memory 2.0.0);OWASP 记忆投毒具体排位已确认(**ASI06** Memory & Context Poisoning,非 T1/ASI01);Letta 文件系统基准数据(博客原文 404,维持待核实)
- 关联文档:[Agent_Memory_Wiki.md](Agent_Memory_Wiki.md)、[Memory_Security_Wiki.md](Memory_Security_Wiki.md)、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md)、[Context_Rot_Wiki.md](Context_Rot_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实)、官方文档与 GitHub 高星仓库综合而成。厂商自测分数需以第三方复测为准;待核实项均已明确标注。*
