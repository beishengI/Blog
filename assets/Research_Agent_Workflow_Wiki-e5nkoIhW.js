const n=`# LLM Wiki — 科研 Agent 工作流

> 面向 LLM Agent 的**科研/学术工作流**系统性知识库:从需求审问(95% 信心审问法)、Session 垂直化、科研技能生态、论文写作流水线,到 Git/worktree 工程化、学术复现与质量防线,沉淀为可直接用于科研项目的一手方法论文档。
>
> 定位:本文档是"Agent 上下文知识体系"的**场景应用层**——把 [Agent_Architecture_Wiki.md](Agent_Architecture_Wiki.md) 的引擎、[Context_Engineering_Wiki.md](Context_Engineering_Wiki.md) 的上下文管理落地到科研场景。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:GitHub 高星技能仓库、arXiv 论文、微信文章实战经验、官方文档

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [核心心法:用 Markdown 管理上下文](#2-核心心法用-markdown-管理上下文)
3. [需求审问:95% 信心审问法](#3-需求审问95-信心审问法)
4. [科研 Agent 技能生态](#4-科研-agent-技能生态)
5. [论文写作流水线](#5-论文写作流水线)
6. [Git 与 worktree:Agent 时代的外部记忆](#6-git-与-worktreeagent-时代的外部记忆)
7. [调试铁律与润色审稿](#7-调试铁律与润色审稿)
8. [科研项目从 0 到 1](#8-科研项目从-0-到-1)
9. [学术复现与引用审计](#9-学术复现与引用审计)
10. [为 Agent 生成的可执行框架](#10-为-agent-生成的可执行框架)
11. [生态与资源](#11-生态与资源)
12. [参考来源](#12-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

科研项目周期长、环节多(选题→综述→实验→写作→投稿),且每一步都依赖"之前记住了什么"。Agent 没有跨会话记忆,科研工作流的核心矛盾是:**如何在大量会话之间保持知识不丢、上下文不烂**。本文档提供一套经过实战验证的完整方法论。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
科研项目启动 → §2 上下文心法 + §3 审问需求 → §4 技能生态选型
  → §8 从 0 到 1 全流程 → §5/§6/§7 各环节细节 → §9 复现与审计
\`\`\`

### 1.3 一句话核心结论

> **让 Agent 干好科研活,本质是管理好大模型的上下文。** 文档是跨会话的桥梁,上下文干净,AI 才能发挥最强智力。

---

## 2. 核心心法:用 Markdown 管理上下文

### 2.1 Session 垂直化

一个 Session 就干一件事情。主 Session 负责推进核心进度,debug、数据处理、出图调整全部交给新 Session。

> AI 和人一样——不同的 Session 是组织里不同角色,不要让二把手去修 bug。

### 2.2 三份核心文档(跨会话桥梁)

在 AI 记得最清楚时,把关键信息固化到磁盘:

| 文档 | 用途 | 更新时机 |
|---|---|---|
| **Research Proposal.md** | 在 AI 记得最清楚时,把最终研究方案固定下来("项目宪法")。无论切多少会话,AI 读这个就懂全貌 | 方案确定时 |
| **Project_index.md** | 项目索引:文件夹结构、每个脚本作用、数据流向、处理链路——给人看也给 AI 看 | 每次结构调整 |
| **Progress.md / progress.txt** | 项目进度:每次重要进展更新 | 每个里程碑 |

### 2.3 Progress.md 示例

\`\`\`markdown
# Progress

## 已完成
- 数据预处理脚本(preprocess.py)完成
- 模型训练代码(train.py):200 个 epoch 后 loss 降至 0.15
- 基础实验结果表格(results/baseline.csv)

## 进行中
- 消融实验(ablation.py):卡在模块 B 替换后 loss 不收敛

## 接下来
- 完成消融实验剩余两组
- 画对比图
\`\`\`

---

## 3. 需求审问:95% 信心审问法

### 3.1 方法来源

该方法源于 Superpowers 的 **brainstorming** skill:Agent 接到需求后**不立即动手**,而是进行苏格拉底式一问一答——每个问题基于上一答案动态生成,**直到自评 95% 信心理解需求**;同时探索替代方案、将设计分块展示供确认,最后落盘设计文档。社区有广泛转述,是"先想清楚再动手"的黄金实践。

### 3.2 提示词模板

> 调用 brainstorming skill 跟我讨论【研究路线】。【你的问题/需求】请你在回答前,先问我问题。要求:**一次只问一个问题**。根据我的回答,继续追问。直到你有 **95% 的信心**理解我的真实需求和目标。然后才给出方案。

### 3.3 为什么有效

- **AI 在你的清晰度结束的地方开始幻觉**:审问是在构建前找出思维漏洞
- **逐轮收敛而非一次问完**:每个问题基于上一答案动态生成,质量更高
- **未批准不动手**:硬性门禁,防止 AI 臆想需求

### 3.4 学术场景应用

- ARS(学术研究技能)的 \`/ars-plan\`:通过 Socratic dialogue 逐章敲定论文结构
- Codex \`/goal\` 模式:先写清 Outcome/Verification/Constraints/Iteration policy/Error handling 五要素——本质是"审问后的固化"

---

## 4. 科研 Agent 技能生态

> 注:"claude-scientific-writer"、"research-proposal/strategist/composer" 等单列技能未检索到独立高星仓库,对应能力已集成在以下综合技能包中,引用时以此为准。

### 4.1 技能包清单

| 技能包 | 出品方 | 覆盖能力 | 获取方式 |
|---|---|---|---|
| **Superpowers**(约 26 万星) | Jesse Vincent, MIT | 完整 Agent 开发方法论:brainstorming→git-worktrees→writing-plans→子代理开发→TDD→评审→收尾 | \`/plugin install superpowers@claude-plugins-official\` |
| **Scientific Agent Skills**(135 技能) | K-Dense AI, MIT | 生物/化学/医学/ML 等领域:literature review、scientific writing、peer review、publication-quality figures、grant writing | \`npx skills add K-Dense-AI/scientific-agent-skills\` |
| **Academic Research Skills(ARS)**(约 2 万星) | Imbad0202, CC BY-NC 4.0 | research→write→review→revise→finalize 全流程;13-agent 深度研究(PRISMA、Semantic Scholar 验证)、12-agent 写作、引用逐条审计 | \`/plugin marketplace add Imbad0202/academic-research-skills\` |
| **anthropics/skills** | Anthropic 官方 | Agent Skills 开放标准实现(17 个示例) | github.com/anthropics/skills |
| **Claude Science** | Anthropic | 2026-06-30 beta:科学家 AI 工作台(文献、代码、实验、图表、报告、审查一体化) | anthropic.com 官方 |
| **Open Science** | 社区 | Claude Science 的开源离线替代 | 社区仓库 |

### 4.2 五个 Skill 串一篇论文(微信文章实战方案)

| 环节 | 推荐 Skill | 作用 |
|---|---|---|
| 立项/开题 | research-proposal 类 | Nature Reviews 风格模板,40+ 参考文献 |
| 架构规划 | strategist 类 | 拆出 7 个评审节点,提示证据缺口 |
| 正文写作 | composer + scientific-writer 类 | composer 出骨架,scientific-writer 润色 |
| 数据/统计 | statistical-analysis 类 | pandas + statsmodels 工作流 |
| 排版交付 | docx/pptx/pdf skills + latex | 全格式覆盖 |

---

## 5. 论文写作流水线

### 5.1 阶段 → 工具 → 产出物

| 阶段 | 工具/技能 | 产出物 |
|---|---|---|
| 选题/审问 | ARS \`/ars-plan\`、brainstorming | 需求文档 |
| 文献综述 | ARS deep-research(13-agent)、PRISMA、Semantic Scholar API 验证 | 综述 + 引用库 |
| 写作 | ARS 12-agent academic-paper、Style Calibration(学习个人文风) | 章节初稿 |
| 图表 | publication-quality figures、VLM figure verification | 出版级图 |
| 审校 | academic-paper-reviewer、引用逐条审计、LaTeX hardening | 终稿 |
| 定稿/投稿 | finalize、submission-package verifier | 投稿包 |

### 5.2 Overleaf + Claude Code + GitHub 协作流

**基础版流程**:
\`\`\`text
Overleaf 建模板 → 同步 GitHub → 本地 clone + 配 LaTeX
  → Claude Code/Codex 日常写作 → git push → Overleaf 从 GitHub 拉取编译
\`\`\`

**核心优势**:
- 真正打通多人协作 + AI 协作(导师、合作者、AI 围绕同一仓库)
- GitHub 版本管理清晰,防止 Overleaf 翻车丢论文
- 进阶:反复 polish、串联 Auto Research 全流程、用实验记录/周报/读论文笔记喂 AI

### 5.3 分层润色策略(去 AI 味)

1. **骨架层**:composer 出结构
2. **内容层**:scientific-writer 统一术语
3. **风格层**:人工审查 + AI 辅助,调整引言和讨论语气

---

## 6. Git 与 worktree:Agent 时代的外部记忆

### 6.1 为什么 Git 如此重要

> 如果说 Markdown 文档是 Agent 的长期上下文,那 Git 就是 Agent 时代的外部记忆系统。

- **可回滚**:Agent 改坏了,快速回到上一个稳定点
- **可对比**:清楚看到 AI 到底改了什么
- **可并行**:不同分支、worktree 同时推进不同任务
- **可审计**:论文代码、实验脚本、结果表格的变化链路可追踪

### 6.2 最小 Git 工作流

\`\`\`bash
git init                              # 首次初始化
git add . && git commit -m "init"     # 第一次版本
# 日常工作
git status                            # 查看状态
git add . && git commit -m "finish data preprocessing"
git diff                              # 看 AI 改了什么(验收!)
git log --oneline --graph             # 查看历史
\`\`\`

### 6.3 分支纪律

\`\`\`bash
git checkout -b exp/ablation-v2       # 实验分支
git checkout -b fix/train-loss-bug    # 修复分支
git checkout -b writing/intro-polish  # 写作分支
\`\`\`

### 6.4 worktree:同一个仓库的平行宇宙

\`\`\`bash
git worktree add ../paper-rebuttal -b rebuttal   # 新工作树
git worktree list                                 # 查看
git worktree remove ../paper-rebuttal             # 清理
\`\`\`

**最佳实践**:
- main worktree:稳定可运行版本
- experiment worktree:跑新实验、高风险尝试
- writing worktree:论文、汇报、文档
- agent-debug worktree:让 Agent 单独折腾,避免污染主现场

> Superpowers 将 worktree 定为设计批准后的固定环节:\`git worktree add\` 建隔离工作区 → 跑初始化并**验证干净测试基线** → 并行开发 → 收尾重跑测试,由用户选 merge/PR/keep/discard。

---

## 7. 调试铁律与润色审稿

### 7.1 调试铁律(84 条 Claude Code 最佳实践核心经验)

**贴 bug 说 fix,别玩微操**:
> 直接贴错误信息(说完整复现流程) + 说一个字 "fix"。不要指导怎么修、不要猜原因、不要规定方案。成功率 80%+。

**两条硬纪律**:
- 修两次没搞定 → \`/clear\` 重来(Anthropic 官方建议纠正超 2 次重启)
- 走偏了 → Esc Esc 回滚(别在错误上下文中修偏差)

### 7.2 用 Goals/持久目标做深度调试

对复杂性能瓶颈:设置持久目标,让 Agent 自己跑 benchmark、检查热路径、做修改、重跑、迭代直到满足条件——不用每轮重复目的。

### 7.3 论文润色与审稿提示词模板

\`\`\`
## 你的任务:根据当前项目为我撰写论文:....

开始工作前:
1、查看 research proposal.md 了解项目
2、查看 progress.md 了解进度
3、通过 project_index.md 找到需要的文件

## 要求:
1、用 latex 编辑和排版
2、禁止幻觉,数据与分析必须来自项目结果
3、先理解各小节重要性,决定分配精力,逐节彻底重新撰写

## 禁止:
1、禁止频繁分点论述(能用段落尽量段落)
2、禁止高级名词堆砌
3、禁用常见 AI 句型(首先/其次等)
4、禁止介绍段与结论段相互镜像
5、禁止每段同模式起句/收句
\`\`\`

---

## 8. 科研项目从 0 到 1

整合多篇文章的完整流程:

\`\`\`text
Step 1: 审问需求     brainstorming + "95% 信心审问法"理清研究方法和路线
Step 2: 固化文档     让 AI 写出 Research Proposal.md 固化为项目宪法
Step 3: 基建初始化   建文件夹和配置 → /init 生成 CLAUDE.md
Step 4: 开始实验     主 Session 推进核心进度,debug/数据处理交给新 Session
Step 5: 持续沉淀     每次重要进展更新 Progress.md,任务后更新 Project_index.md
\`\`\`

**核心原则**:文档是跨会话的桥梁。上下文干净,AI 才能发挥最强智力。

---

## 9. 学术复现与引用审计

### 9.1 AI Scientist 的启示与警示

- **The AI Scientist**(Sakana AI,Lu 等,Nature 2026;651:914-919):首个全自主通过 ICLR 2025 workshop 盲审的 AI 论文(6.33/10 vs 均分 4.87)
- **但 Limitations 列出**:实现 bug、幻觉结果、捷径依赖、引用幻觉等失败模式
- **结论**:ARS 等严肃技能包坚持 human-in-the-loop——AI 辅助,人类把关

### 9.2 引用幻觉是真实风险

- Zhao 等(arXiv:2605.07723)审计 2.5M 论文 1.11 亿引用,估计 2025 年约 **14.7 万条幻觉引用**
- 防御:ARS 的 \`ARS_CLAIM_AUDIT\` 按定位锚点逐条核对"引用是否支持论断"

### 9.3 /Goal 复现实践

Codex Goals 复现论文时,对每个结论逐一审计——区分机制复现 vs 近似训练 vs 精确重现,每个结论标注证据来源、状态、剩余不确定性。这种审计级别的方式正是验证可复现性的利器。

---

## 10. 为 Agent 生成的可执行框架

### 10.1 科研会话卫生检查清单

\`\`\`markdown
## 科研会话卫生
□ 新会话是否先读三份文档(Proposal / index / progress)?
□ 是否一个 Session 只干一件事?
□ Progress.md 是否最新?(过时 → 先更新再工作)
□ debug 是否切了新 Session?(避免污染主上下文)
□ 关键实验结论是否已写入 Progress.md?
□ 引用是否经过审计(ARS_CLAIM_AUDIT)?
\`\`\`

### 10.2 论文交付检查清单

\`\`\`markdown
□ 数据与分析全部来自项目结果(禁止幻觉)
□ 引用逐条核对(是否支持论断)
□ 图表达到出版级(publication-quality figures)
□ 去 AI 味:无分点堆砌、无高级名词堆砌、无镜像段落
□ LaTeX 编译通过,投稿包验证
□ 代码与数据已提交 Git,可复现
\`\`\`

### 10.3 供 Agent 生成科研框架的元规则

1. **文档先行**:任何科研任务先建三份核心文档(Proposal/index/progress)
2. **会话垂直**:一个 Session 一件事,跨环节靠文档桥接
3. **审问再动手**:需求理解不足 95% 前不写方案
4. **证据锚定**:所有断言(引用、数据、结论)必须可追溯
5. **Git 即记忆**:每完成一个可验证阶段就 commit

---

## 11. 生态与资源

### 技能仓库
- [obra/superpowers](https://github.com/obra/superpowers)(约 26 万星,MIT)
- [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills)(135 技能)
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)(约 2 万星)
- [Imbad0202/academic-research-skills-codex](https://github.com/Imbad0202/academic-research-skills-codex)(Codex 发行版)
- [anthropics/skills](https://github.com/anthropics/skills)(官方)
- [xuhe2/sharelatex-ce](https://github.com/xuhe2/sharelatex-ce)(Overleaf 私有部署)

### 论文
- The AI Scientist(Nature 2026;651:914-919,Sakana AI)
- [From Automation to Autonomy](https://arxiv.org/abs/2505.13259)(EMNLP 2025,Tool→Analyst→Scientist 三级)
- [Zhao 等:1.11 亿引用审计](https://arxiv.org/abs/2605.07723)
- [PaperOrchestra(Google)](https://arxiv.org/abs/2604.05018)

### 平台
- [Overleaf](https://cn.overleaf.com/)
- [Claude Science(Anthropic 官方)](https://anthropic.com)

---

## 12. 参考来源

- 微信文章《AI Agent 工具介绍与实践 —— 分享会讲义》:Session 垂直化、三份核心文档、95% 信心审问法、五 Skill 串论文、Overleaf+CC+GitHub、Git/worktree、调试铁律、润色审稿、从 0 到 1 流程
- Superpowers 仓库与文档:brainstorming、using-git-worktrees、writing-plans(benefit 的 GitHub 仓库即为一手来源)
- ARS / K-Dense 技能仓库 README(一手)
- The AI Scientist(Nature 2026)与引用审计论文(arXiv:2605.07723)
- 注:"95% 信心审问法"为 Superpowers brainstorming 的公开表述,社区广泛转述,原始细节以仓库为准

---

*本文档由高星技能仓库、arXiv 论文与微信文章实战经验综合而成。科研工具生态更新快,引用时以仓库与官方文档为准。*
`;export{n as default};
