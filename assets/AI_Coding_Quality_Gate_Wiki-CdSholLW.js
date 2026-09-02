const n=`# LLM Wiki — AI 编码质量防线

> 面向 LLM Agent 的**AI 编码质量保障**系统性知识库:从"AI 说做完了但实际没做完"这一核心痛点出发,建立"退出硬门槛 → 规则化门禁 → 双代理审查 → 知识库对齐 → 跨会话传承"五道防线,并附研究证据、工具配置与可执行框架。
>
> 定位:本文档是"Agent 上下文知识体系"的**质量保障层**——与 [Vibe_Coding_Methodology_Wiki.md](Vibe_Coding_Methodology_Wiki.md)(流程)互补,解决"如何用机器能验证的证据证明 AI 做对了"。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:Anthropic 官方文档、arXiv 论文、GitHub 高星技能、微信文章实战经验

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心痛点:AI 太自信、会偷懒](#2-核心痛点ai-太自信会偷懒)
3. [防线一:退出硬门槛(机械化验证)](#3-防线一退出硬门槛机械化验证)
4. [防线二:规则化质量门禁](#4-防线二规则化质量门禁)
5. [防线三:双代理并行审查](#5-防线三双代理并行审查)
6. [防线四:知识库与上下文对齐](#6-防线四知识库与上下文对齐)
7. [防线五:跨会话上下文传承](#7-防线五跨会话上下文传承)
8. [研究证据:为什么机器验证 > 主观反思](#8-研究证据为什么机器验证--主观反思)
9. [2025-2026 审查工具生态](#9-2025-2026-审查工具生态)
10. [为 Agent 生成的可执行框架](#10-为-agent-生成的可执行框架)
11. [生态与资源](#11-生态与资源)
12. [参考来源](#12-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

用 Agent 写代码的人大概率经历过:AI 改完一堆文件,笃定地说"全部完成,功能正常",一跑终端——满屏红字;修了第一轮没修对,第二轮又引入新问题,第三轮终于编译过了,但 UI 错位、逻辑漏了、边界没覆盖。

**本质**:AI 在编码上最大的问题不是不够聪明,而是**太自信、会偷懒**——它会告诉你"做完了",而事实上并非所有要求都完成。

### 1.2 一句话解决方案

> 给 AI 编码搭好质量防线,让 AI 不只用嘴说"我做完了",而是用**机器能验证的证据**,证明自己做对了。

### 1.3 可靠性排序(贯穿全文)

\`\`\`text
机械化检查(lint / test / typecheck 退出码)
  > 规则化检查(checklist 逐项核对)
  > 主观反思("你做对了吗")
\`\`\`

---

## 2. 核心痛点:AI 太自信、会偷懒

### 2.1 失败循环

\`\`\`text
AI 宣称完成 → 编译失败 → 修(没修对)→ 再修(引入新问题)→ 终于编译过
  → 但 UI 错位 / 逻辑漏了 / 边界没覆盖 → 人工手动验证和修复
\`\`\`

### 2.2 为什么不能靠 AI 自评

- AI 会**高估自己**——"反思自己做得对不对"的效果很差
- 主观自我评估无外部锚点,无法识别盲区
- 研究证据(见 §8):无外部反馈时,模型内在自我纠正甚至可能降分

---

## 3. 防线一:退出硬门槛(机械化验证)

### 3.1 核心思想

让"完成"这个词对 AI 不再是主观判断,而是一个**硬门槛——退出码 0**。

> 这是最低门槛,连这个都没过的代码,后面说的所有"功能正常""我已经验证过了"都不值得信。

### 3.2 三个关键细节

**1. 自修复要有上限,超过 3 轮强制停下**
- 能修好的,3 轮内就修好了;修不好的,再试就是浪费 token,还会越改越离谱
- 3 轮是实践收敛点

**2. 错误报告要带完整上下文**
- 输出完整文件路径、行号、错误代码行,而不是"编译失败"四个字
- 把可能耗 3-5 轮的定位过程压到 1 轮

**3. 配置文件/依赖类错误 → 停止并报告**
- 不是所有错误都该自动修:配置文件、依赖、非本分支文件的错误应停止上报

### 3.3 CLAUDE.md 配置模板

\`\`\`markdown
## 编译验证
每次代码修改后,必须执行:
1. npm run build(或项目对应的编译命令)
2. 如果编译失败:
   - 分析错误类型:语法/类型错误 → 自动修复(最多 3 轮)
   - 配置文件/依赖/非本分支文件的错误 → 停止并报告
3. 超过 3 轮编译仍失败 → 停止,报告无法自动修复的错误及原因
\`\`\`

### 3.4 Hooks:确定性门禁(Anthropic 官方)

官方强调:**hooks 是 deterministic 的,CLAUDE.md 只是 advisory**——要强制就用 hooks。

| Hook 事件 | 时机 | 用途 |
|---|---|---|
| **PreToolUse** | 工具调用前 | 拦截(deny)、审批、敏感路径禁写 |
| **PostToolUse** | 工具调用后 | 观测、自动格式化 |
| **Stop** | 每轮结束 | lint/test 强制、收尾验证 |

**退出码约定**:
- \`0\` = 放行
- \`2\` = 阻断且 stderr 反馈给 Claude
- 其他 = 非阻塞仅记日志

**stdout 可输出 JSON**(如 \`{"continue":false,"stopReason":...}\`)控制后续流程。

**官方建议**:直接让 Claude 代写 hook——"Write a hook that runs eslint after every file edit"。

---

## 4. 防线二:规则化质量门禁

### 4.1 把 Code Review 变成规则

编译过了,代码就能用吗?还差很多。Lint、类型检查、安全扫描、边界条件、代码风格——把每次手工检查编码成规则,让 AI 交活之前自己跑一遍。

**CLAUDE.md 基础版**:

\`\`\`markdown
完成任务后,自动执行:
1. npm test 全部通过
2. eslint 检查修改的文件
3. 没有 console.log 残留
4. import 路径均存在
5. 任何检查失败,修复后重新跑全部
\`\`\`

### 4.2 进阶:封装成 Skill(结构化检查)

以 Anthropic 内部 \`code-review-excellence\` Skill 为范本——检查维度**结构化**,不是"整体感觉怎么样":

\`\`\`markdown
对每个变更文件,逐项检查:
[Security] 输入是否经过校验?是否有注入风险?密钥/Token 是否硬编码?
[Correctness] 边界条件:空输入、null、超长字符串、并发写入
[Consistency] 命名是否与项目现有风格一致?错误处理模式是否统一?
[Completeness] 是否有遗漏的 import?类型定义是否完整?错误分支是否处理?
[Performance] 是否有不必要的重复计算?大对象是否按引用传递?
\`\`\`

> 关键:每个维度不是让 AI "想想有没有问题",而是对应到**具体的 grep 命令或 lint 规则**。

---

## 5. 防线三:双代理并行审查

### 5.1 为什么不能自己审自己

同一个对话里 AI 自己 review 自己写过的代码,效果会很差——**它会觉得自己都是对的**。

> 执行和验证必须是不同角色。不管人还是 AI,都很难客观评价自己刚写出来的东西。

### 5.2 双视角互补(社区高流量实践)

| 代理 | 上下文 | 能发现 | 盲区 |
|---|---|---|---|
| **子代理 A** | 共享主 Agent 上下文 | 逻辑错误、集成错误("你改了 A 的逻辑但 B 依赖旧行为") | 有预设,可能放过"自己以为对"的 |
| **子代理 B** | 全新上下文、无预设 | 盲区、命名不一致、缺测试、"这段代码读起来就很奇怪" | 缺背景,可能误判设计意图 |

两个视角合在一起,覆盖单一审查容易漏的盲点。

### 5.3 Review Workflow 配置模板

\`\`\`markdown
## Review Workflow
After each feature or meaningful fix:
1. Run \`npm run check\`.
2. Launch two review subagents:
   - Subagent A with shared context: review design intent, logic,
     consistency, and integration with existing docs.
   - Subagent B with fresh context: review with no assumptions,
     look for blind spots, missing tests, and unclear behavior.
3. Merge both review results.
4. Fix all valid issues.
5. Rerun \`npm run check\`.
6. Only then deliver.
7. If subagents are unavailable, perform the two reviews manually
   and say so in the final report.
\`\`\`

### 5.4 对抗式审查(Adversarial Review)

- Anthropic 内部还有 \`adversarial-review\` Skill:**用"恶意用户"的视角攻击代码**——找极端输入、并发冲突、权限绕过、资源耗尽
- 可做成 Hook 接入 CI,每次提 PR 前自动跑

---

## 6. 防线四:知识库与上下文对齐

### 6.1 问题

AI 对项目的理解必须是最新的。如果拿到的是过期知识(模块结构变了但文档没更新、API 签名改了但没同步),**后续所有质量保障都在错误的基础上跑**。

### 6.2 三个实践

**1. 定期核对 spec 与实现**
- 开新对话让 Agent 检查和对齐当前实现
- 定期清理多余的中间文档产物,防止前后决策冲突

**2. 配好 progress.txt 和 gotchas.txt**
- progress 记录最新进度;gotchas 记录犯的错;每次写代码前让 AI 过一下

**3. CLAUDE.md 当代码治理**(官方)
- 出错时审查它、定期修剪、测试改动是否影响行为
- 保留标准:*"Would removing this cause Claude to make mistakes?"* 否就删
- 频繁变化的信息(易漂移)不放 CLAUDE.md

### 6.3 gotchas.txt 示例

\`\`\`markdown
## Gotchas —— 别踩这些坑
- subscriptions 表是 append-only,找最新 version 不能只看 created_at,要看 MAX(version)
- 同一个 request_id 在 API gateway 字段叫 @request_id,到了 billing 服务字段名叫 trace_id
- staging 环境返回 200 不代表 payment 真的成功了,要去 payment_events 表里确认
\`\`\`

> Anthropic 强调:**Skill 里最有价值的不是通用步骤(模型本来就会),而是 Gotchas**——那些会把模型从默认思路里拽出来的细节。每条都来自真实踩过的坑,时间一长信噪比最高。

---

## 7. 防线五:跨会话上下文传承

### 7.1 上下文同步 Skill(渐进式披露)

每次新会话 AI 都是空白的。直接读所有 spec 文档会占用大量上下文,真正实现时反而不记得限制。解决方案:**同步上下文的 Skill**,采用渐进式披露,加载最小有用的上下文集。

**Skill 结构**(含两部分):
\`\`\`
context-sync-skill/
├── SKILL.md                  # 概述 + 首次阅读步骤
└── references/
    └── project-map.md        # 任务特定文档、代码所有权、契约测试
\`\`\`

**SKILL.md 摘录**:

\`\`\`markdown
# [项目名] 上下文
## 概述
将此作为 [项目名] 的项目入职和防漂移地图。加载最小上下文集以建立当前契约,然后在编辑前追踪真实调用路径。

## 首次阅读
1. 阅读 AGENTS.md 了解活跃仓库规则和必要检查
2. 执行 git status --short;保留无关的用户更改和未跟踪文件
3. 阅读 SPEC/SPEC.md 第 16 节,了解当前实现对齐情况
4. 阅读 SPEC/progress.txt 中的最新条目
5. 在调试或更改脆弱流程前,按模块和症状搜索 SPEC/gotchas.txt
6. 阅读 references/project-map.md 获取任务特定文档
\`\`\`

### 7.2 对话交接(handoff.md)

一个对话没干完,让另一个对话接着干:
- 在对话 A 上下文还没满时,就让它生成**交接提示词和 handoff.md**
- 对话 B 读 handoff.md 无缝续接
- 这样的上下文损失最小

### 7.3 与上下文工程的关系

> 跨会话传承的底层机制与 [Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) 的"结构化笔记 + 渐进式披露"同源——把工作记忆外化到磁盘,按需加载最小有用集。

---

## 8. 研究证据:为什么机器验证 > 主观反思

### 8.1 核心研究结论

| 研究 | 结论 |
|---|---|
| **《LLMs Cannot Self-Correct Reasoning Yet》**(ICLR 2024) | 模型**内在**自我纠正不可靠——无外部反馈时,反思反而可能降分 |
| **《Teaching LLMs to Self-Debug》**(arXiv:2304.05128) | 通过"执行代码 + 执行结果反馈"显著提升调试性能——**外部信号驱动**有效 |
| GPT-4 Code Interpreter 论文(arXiv:2308.07921) | 代码自我验证求解数学题:执行反馈是关键 |

### 8.2 对实践的启示

- **主观反思(Reflexion 类)必须锚定外部失败信号**才有效(呼应 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) §5.2 的警示)
- 可靠性排序的科学依据:**确定性机制(hooks/exit code)> 外部反馈(测试/执行结果)> 独立审查代理 > 主观反思**

### 8.3 官方最佳实践印证

> Anthropic 官方:"Give Claude a way to verify its work" 是**最高杠杆**实践——无验证标准时模型产出"看起来对但实际不工作"的代码,人成为唯一反馈回路。

官方模板式提示对照:
- ❌ "implement validateEmail"
- ✅ "implement validateEmail... **run the tests after implementing**"
- ✅ "fix it and **verify the build succeeds**, address the root cause, **don't suppress the error**"

---

## 9. 2025-2026 审查工具生态

| 工具 | 定位 | 特点 |
|---|---|---|
| **CodeRabbit** | PR 级自动审查(GitHub/GitLab) | 约 $24/月;审查维度显式列出(逻辑/可读性/异常处理/安全风险) |
| **OpenAI Codex Review** | 2025-09 正式发布 | 官方称审查绝大多数 PR;编码循环内闭环 |
| **GitHub Copilot code review** | 2026-03 报告累计 6000 万次审查 | 支持路径级指令定制 |
| **superpowers requesting-code-review** | 技能 | 独立上下文审查者 + 两阶段评审(规划/执行分离) |
| **AgentReview** | 社区 | LLM 模拟同行评审 |

**三类定位**:
\`\`\`text
PR 门禁(CodeRabbit/Copilot) vs 编码循环内闭环(Codex Review) vs 方法论技能(superpowers)
\`\`\`

---

## 10. 为 Agent 生成的可执行框架

### 10.1 质量防线总检查清单

\`\`\`markdown
## 交付前质量门禁(写入 CLAUDE.md)
□ 编译/测试退出码 == 0?(机械验证)
□ 自修复是否超过 3 轮?(超限 → 停止上报)
□ 错误报告是否含完整上下文?(路径 + 行号 + 错误行)
□ lint / typecheck / 安全扫描已跑?(规则化门禁)
□ 双代理审查(共享上下文 + 全新上下文)已完成?
□ 边界条件(空输入/null/超长/并发)已覆盖?
□ 知识库对齐:spec 与实现一致?过期文档已清理?
□ progress.txt / gotchas.txt 已更新?
□ 关键约束是否在 CLAUDE.md(而非仅对话)?
\`\`\`

### 10.2 审查 Skill 设计模板

\`\`\`markdown
name: code-review-<project>
description: 对项目代码变更做结构化审查,检查 Security/Correctness/Consistency/Completeness/Performance 五维。用在与代码审查、PR 合并前检查相关任务时。

## Instructions
对每个变更文件,逐项检查:
[Security] ...(对应 grep 命令)
[Correctness] ...
[Consistency] ...
[Completeness] ...
[Performance] ...

## Gotchas
- <项目特有坑 1>
- <项目特有坑 2>
\`\`\`

### 10.3 供 Agent 生成质量框架的元规则

1. **验证优先**:一切质量判断锚定可执行的外部信号(命令/退出码/测试)
2. **角色分离**:执行者 ≠ 评估者,自己审自己无效
3. **上限控制**:自修复设轮次上限,超限停止上报
4. **Gotchas 沉淀**:AI 犯错被纠正 ≥2 次 → 写入 gotchas.txt / CLAUDE.md
5. **防漂移**:知识库定期对齐,过期文档主动清理

---

## 11. 生态与资源

### 官方文档
- [Anthropic — Claude Code Best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Hooks 指南](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Permission modes](https://code.claude.com/docs/en/permission-modes)

### 论文
- [Teaching LLMs to Self-Debug](https://arxiv.org/abs/2304.05128)(Chen et al. 2023)
- [LLMs Cannot Self-Correct Reasoning Yet](https://openreview.net/forum?id=KmK3oyzZbwE)(ICLR 2024)
- [GPT-4 Code Interpreter 代码自我验证](https://arxiv.org/pdf/2308.07921)

### 工具与技能
- [obra/superpowers](https://github.com/obra/superpowers)(verification-before-completion / requesting-code-review)
- [CodeRabbit](https://www.coderabbit.com)
- AgentReview(社区,LLM 模拟同行评审)

### 社区文章
- [掘金 — AgentReview:LLM 模拟同行评审](https://juejin.cn/post/7436586419370328090)
- [AgentX / adversarial review gate 机制](https://www.cnblogs.com/mianmaner/p/22280973)
- [Copilot vs Codex 对比(2026)](https://blog.csdn.net/bsklhao/article/details/161421199)

---

## 12. 参考来源

- 微信文章《给AI编码搭好质量防线》(小石谈记):退出硬门槛、3 轮自修复上限、错误报告规范、规则化门禁、双代理审查、知识库对齐、跨会话传承、可靠性排序
- Anthropic 官方文档:Hooks、Best practices、验证提示模板
- ICLR 2024《LLMs Cannot Self-Correct Reasoning Yet》与 arXiv:2304.05128(研究证据)
- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:调试铁律、修正超 2 次重启、/context 50% 手动压缩

---

*本文档由微信文章实战经验、Anthropic 官方文档与 arXiv 研究综合而成。可靠性排序既有实践共识也有研究支撑(见 §8),落地时以官方文档的最新 hooks 语法为准。*
`;export{n as default};
