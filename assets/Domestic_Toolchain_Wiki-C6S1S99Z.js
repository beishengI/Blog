const n=`# LLM Wiki — 国产 AI 编码/Agent 工具链专题

> 面向 LLM Agent 的**国产 AI 编码/Agent 工具链**系统性知识库:TRAE、Kimi Code、DeepSeek、通义灵码、Qwen Code、CodeGeeX、文心快码、CodeBuddy 等工具全景,国产模型生态(Qwen3/DeepSeek V4/Kimi K2/GLM-5)能力,国产工具链特点、与国外工具对比、选型建议(个人/企业/信创)、2025-2026 最新进展与避坑。
>
> 定位:本文档是"Agent 上下文知识体系"的**国内生态选型层**——[Agent_Tools_Selection_Wiki.md](Agent_Tools_Selection_Wiki.md) 聚焦国际工具,本文档补齐国产替代与信创视角。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实)、官方文档、GitHub 仓库、行业报道(已标注可信度)

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [国产工具全景](#2-国产工具全景)
3. [国产模型生态](#3-国产模型生态)
4. [国产工具链特点](#4-国产工具链特点)
5. [与国外工具对比](#5-与国外工具对比)
6. [选型建议](#6-选型建议)
7. [2025-2026 最新进展](#7-2025-2026-最新进展)
8. [常见坑与注意事项](#8-常见坑与注意事项)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

国内开发者常面临:国际工具需要代理、认证不稳定、价格高。国产工具链(中文优化、免代理、免费/低价)是现实选择。本文档帮助读者理解国产生态全貌、模型能力、选型与信创合规。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:选国产工具 → §2 全景 → §6 选型建议 → §9 决策树
目标:选国产模型 → §3 模型生态
目标:信创/私有化 → §6.3 → §8 避坑
\`\`\`

### 1.3 一句话核心结论

> **国产工具链的核心价值:中文语境、免代理、免费/低价、信创合规;差距在超大代码库工程能力、插件生态与社区成熟度。**

---

## 2. 国产工具全景

| 工具 | 出品方 | 定位 | 最新状态(2026-08) |
|---|---|---|---|
| **TRAE** | 字节跳动 | AI 原生 IDE,基础版免费,中文友好 | 2.0 新增 SOLO(自主 Coding Agent)与 Builder 模式;2026-03 兼容 MCP v1.1、内置 200+ 工具;企业版支持私有化 |
| **Kimi Code** | MoonshotAI | 开源终端编码助手(TUI 毫秒级启动) | v0.4.0 完成 Python→TypeScript 迁移;订阅约 ¥49/月起 |
| **DeepSeek** | DeepSeek | 官方重模型轻工具,暂无独立官方 CLI | API 兼容 Anthropic 端点,官方列 16 种 Agent 集成;**Harness** 2026-08 内测(769 开发者/712 仓库/120 万 star,即将开源) |
| **通义灵码** | 阿里 | 插件形态(AI IDE/VS Code/JetBrains) | 2025-07-26 起免费不限量接入 Qwen3-Coder;企业版支持私有化 |
| **Qwen Code** | 阿里 | 开源终端编码代理 | 免费 |
| **CodeGeeX** | 智谱 | 开源免费编程助手 | 第 4 代支持本地离线部署、100+ 语言 |
| **文心快码** | 百度 | Comate AI IDE(2025-06 发布) | 多模态 + 多智能体协同路线 |
| **CodeBuddy** | 腾讯 | 插件+IDE+CLI 全形态 | 含 Craft 模式、Skills、Figma 转代码 |
| **MarsCode** | 字节 | 豆包系编程助手 | 字节内部覆盖数万工程师 |

---

## 3. 国产模型生态

### 3.1 核心模型(编号已核实)

| 模型 | 参数 | 关键数据 | arXiv |
|---|---|---|---|
| **Qwen3** | 0.6–235B | 2025-04 开源,Apache 2.0,思考/非思考一体 | [2505.09388](https://arxiv.org/abs/2505.09388) |
| **Qwen3-Coder-480B-A35B** | 480B | 2025-07 开源,SWE-Bench 领先(**已联网核实:无独立 arXiv 技术报告**,官方载体为博客+模型卡) | — |
| **Qwen3-Embedding** | 0.6B/4B/8B | MTEB 文本与代码检索领先 | [2506.05176](https://arxiv.org/abs/2506.05176) |
| **Kimi K2** | 1T 总参/32B 激活 | SWE-Bench Verified 65.8、Tau2-Bench 66.1 | [2507.20534](https://arxiv.org/abs/2507.20534) |
| **Kimi K3** | 2.8T 总参 MoE | 100 万上下文、原生多模态(2026-07-16) | — |
| **DeepSeek V4** | V4-Pro 约 1.6T | 上下文 128K→1M;适配昇腾等国产芯片;V4-Flash 轻量高性价比 | — |
| **GLM-5** | — | 2026-02 开源(MIT),Coding/Agent 开源 SOTA、对标 Claude Opus 4 | [2602.15763](https://arxiv.org/abs/2602.15763) |

### 3.2 模型生态特点

- **开源激进**:Qwen3、DeepSeek V4、GLM-5、Kimi K2 均开源或开放权重
- **国产芯片适配**:GLM/DeepSeek 适配昇腾(信创关键)
- **价格战**:DeepSeek R1 首发低价冲击全球定价体系

---

## 4. 国产工具链特点

| 特点 | 说明 |
|---|---|
| **中文优化** | 中文语境理解与生成更佳 |
| **免代理** | 国内网络直连,无认证链路问题 |
| **免费/低价** | 基础版免费或低价入门(普遍 Credits/Token 限额) |
| **MCP 支持趋齐** | TRAE v1.1、GLM Coding Plan 20+ 工具、CodeBuddy |
| **Skill 机制** | TRAE/CodeBuddy 有 Skill 机制 |
| **Agentic 路线** | TRAE SOLO、Kimi Code、Qwen Code 均走 agentic coding |

---

## 5. 与国外工具对比

| 维度 | 国产工具优势 | 差距 |
|---|---|---|
| 语境/网络 | 中文语境、免代理、免费/低价 | — |
| 合规 | 信创与私有化、国产芯片适配 | — |
| 工程能力 | — | 复杂/超大代码库工程能力弱于 Claude Code 等 |
| 插件生态 | — | TRAE 走 Open VSX 而非 VSCode 官方市场;MCP 三方工具数量与质量、社区文档成熟度偏低 |
| 模型上限 | — | 整体仍处追赶(对标 Opus/GPT 级) |\r

---

## 6. 选型建议

### 6.1 场景 → 工具

| 场景 | 推荐 |
|---|---|
| **个人中文友好免费** | TRAE |
| **CLI 轻快** | Kimi Code / Qwen Code |
| **低成本强模型** | DeepSeek V4(API) |
| **重度 Agent** | Claude Code/Codex + DeepSeek V4(Anthropic 兼容端点)或 Kimi Code |
| **企业云生态** | 通义灵码企业版、文心快码、CodeBuddy |
| **信创/私有化** | CodeGeeX(开源离线)、GLM-5(国产芯片)、DeepSeek V4(昇腾)、TRAE 企业版 |

### 6.2 决策树

\`\`\`text
网络环境?
├─ 需直连国内、免代理 → 国产工具(TRAE/Kimi Code/Qwen Code)
├─ 需信创/私有化 → CodeGeeX / GLM-5 / DeepSeek V4(昇腾)
├─ 个人探索免费 → TRAE(IDE)/ Kimi Code(CLI)
└─ 重度工程 → Claude Code/Codex + DeepSeek V4 API
\`\`\`

---

## 7. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **DeepSeek Harness 内测** | 2026-03 崔添翼组建团队;8-01 内测(769 开发者/712 仓库/120 万 star/18 赛道,已联网核实);开源时间未定(待核实) |
| **DeepSeek 定价** | V4 Pro 5-23 API 降价至 1/4;2026-08-06 官方宣布计划整体上调 API 定价(媒体转述,已核实:公告属实) |
| **Kimi 更新** | K3(7-16 发布);K2 高速版(8-01);F 轮超募,媒体主流口径估值约 500 亿美元(已联网核实,投后另有 350 亿说法) |
| **TRAE 演进** | 2.0 SOLO → **TRAE Work(全员 AI 办公平台,Work+Code 双模式)**(已联网核实);注册用户 2026 Q2 破 600 万 |
| **智谱** | GLM Coding Plan 订阅回归(7-31,积分制约 ¥118/月起) |
| **平台化** | TRAE Work、文心快码多智能体 IDE、低代码+AI 平台规模化 |

---

## 8. 常见坑与注意事项

| 坑 | 注意 |
|---|---|
| **免费档隐藏限制** | 配额/积分限制,只看月费会误判 |
| **参数/定价口径不一** | 如 V4-Flash 激活参数、缓存价各来源矛盾 |
| **插件市场不互通** | TRAE 走 Open VSX,与 VSCode 官方市场不通用 |
| **MCP 三方质量参差** | 工具数量与质量偏低,需审计 |
| **成熟度不足** | 复杂重构不稳(部分工具) |
| **企业采购** | 须核对私有化/信创适配与数据合规 |
| **代码安全** | AI 生成代码需人工审查(安全漏洞风险) |

---

## 9. 为 Agent 生成的可执行框架

### 9.1 国产工具链选型检查清单

\`\`\`markdown
## 国产工具链自查
□ 网络环境是否需免代理?(是 → 国产优先)
□ 是否需要信创/私有化?(是 → CodeGeeX/GLM-5/DeepSeek V4)
□ 预算是否敏感?(免费档配额/积分是否够用?)
□ 是否需要超大代码库工程能力?(国产弱项 → 考虑混合:国产模型 + 国际 harness)
□ MCP/Skill 生态是否满足?(国产生态较小,需审计)
□ 数据合规是否满足?(私有化/不出内网)
□ AI 生成代码是否有人工审查环节?
\`\`\`

### 9.2 供 Agent 生成选型方案的元规则

1. **网络与合规优先**:免代理与信创适配是国产工具的第一价值
2. **混合架构可行**:国产模型(DeepSeek V4/GLM-5) + 国际 harness(Claude Code/Codex)是重工程场景的常见组合
3. **核实口径**:参数/定价/用户数据各来源矛盾,以官方为准
4. **免费≠无成本**:配额/积分限制需实测
5. **人工审查兜底**:AI 生成代码必须人工复核

---

## 10. 生态与资源

### 官方渠道(高可信)
- [DeepSeek 官网](https://www.deepseek.com/) ｜ [16 种 Agent 集成文档](https://api-docs.deepseek.com/quick_start/agent_integrations)
- [Kimi Code](https://github.com/moonshotai/kimi-code) ｜ [Qwen Code](https://github.com/QwenLM/qwen-code) ｜ [GLM-5](https://github.com/zai-org/GLM-5)
- [ModelScope 魔搭](https://modelscope.cn/)

### 论文(编号已核实)
- [Qwen3](https://arxiv.org/abs/2505.09388) ｜ [Qwen3-Embedding](https://arxiv.org/abs/2506.05176)
- [Kimi K2](https://arxiv.org/abs/2507.20534) ｜ [GLM-5](https://arxiv.org/abs/2602.15763)

---

## 11. 参考来源

- arXiv 论文(编号逐条核实,见 §10;Qwen3-Coder 技术报告编号待核实)
- 官方文档与 GitHub 仓库
- 行业/自媒体报道(中低可信,用于事实交叉):DeepSeek Harness 内测数据、TRAE 用户数、Kimi 估值、定价动态
- 待核实项:Harness 开源时间线、V4-Flash 精确参数、ModelScope 数据、TRAE Work 转型
- 关联文档:[Agent_Tools_Selection_Wiki.md](Agent_Tools_Selection_Wiki.md)、[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md)

---

*本文档由 arXiv 论文(编号逐条核实)、官方文档与行业报道综合而成。行业报道数据(用户数/估值/定价)可信度中等,引用时以官方为准;待核实项均已明确标注。*\r
`;export{n as default};
