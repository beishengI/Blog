# LLM Skills Wiki — Agent Skills 完全指南

> 面向 LLM 的 **Agent Skills（智能体技能）** 概念、编写方法论、能力边界、优秀标准与生态推荐百科。
> 资料截至 2026-08，主要来源于 Anthropic 官方文档 / 开放标准 agentskills.io / GitHub 高星项目 / 社区高浏览量、高引用率文章。

---

## 目录

1. [什么是 Skill？](#1-什么是-skill)
2. [Skill 的发展历程与开放标准](#2-skill-的发展历程与开放标准)
3. [Skill 的工作原理：渐进式披露](#3-skill-的工作原理渐进式披露)
4. [Skill 与 Tool / MCP / Prompt / Project 的区别](#4-skill-与-tool--mcp--prompt--project-的区别)
5. [如何高质量编写 Skill（官方最佳实践）](#5-如何高质量编写-skill官方最佳实践)
6. [Skill 的能力边界与限制](#6-skill-的能力边界与限制)
7. [优秀 Skill 的标准与评估清单](#7-优秀-skill-的标准与评估清单)
8. [优秀 Skill 示例拆解](#8-优秀-skill-示例拆解)
9. [应用开发相关高下载量 Skill 推荐](#9-应用开发相关高下载量-skill-推荐)
10. [参考资料来源](#10-参考资料来源)

---

## 1. 什么是 Skill？

### 1.1 官方定义

> "Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks."
> —— 摘自 [anthropics/skills 官方仓库](https://github.com/anthropics/skills)

> "Agent Skills are modular capabilities that extend Claude's functionality. Each Skill packages instructions, metadata, and optional resources (scripts, templates) that Claude uses automatically when relevant."
> —— 摘自 [Claude 官方文档](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

**一句话总结**：Skill 是一个**文件夹**，里面装着一份 `SKILL.md` 指令文件（必含 YAML frontmatter + Markdown 正文），可以附带脚本、参考资料、模板等资源。它把"如何完成某类任务的专业知识"打包成 AI 可复用、可加载、可跨平台的能力包。

```
my-skill/
├── SKILL.md          # 必需：元数据（name/description）+ 指令正文
├── scripts/          # 可选：可执行代码（Python/Bash/JS 等）
├── references/       # 可选：参考资料文档
├── assets/           # 可选：模板、静态资源
└── ...               # 其他任意文件
```

### 1.2 为什么需要 Skill（核心价值）

| 价值 | 说明 |
|---|---|
| **让通用 Agent 变领域专家** | 模型是通用的，Skill 注入领域专属专业知识与工作流，把"什么都知道一点"变成"特定领域有深度专业能力" |
| **消除重复指导** | 一次性编写、按需自动加载，无需在每轮对话重复交代流程与规范 |
| **能力可组合** | 多个 Skill 可以组合，构建复杂工作流 |
| **组织知识沉淀** | 把公司的品牌规范、代码规范、业务 SOP 打包，团队复用 |
| **跨平台可移植** | Skill 是开放标准，同一份 Skill 可在 Claude Code、Codex、Cursor、Gemini CLI、TRAE 等 40+ 客户端使用 |

### 1.3 Skill 的类型（按来源划分）

| 类型 | 说明 |
|---|---|
| **官方预置 Skill（Anthropic skills）** | 官方创建维护，如 Excel/Word/PPT/PDF 文档处理能力，全平台自动可用 |
| **自定义 Skill（Custom skills）** | 用户或组织为特定工作流创建，如品牌样式应用、公司邮件模板、JIRA/Asana 建任务规范 |
| **组织统一配置 Skill** | Team/Enterprise 版管理员可为全员下发，开箱即用 |
| **合作伙伴 Skill（Partner skills）** | Skills Directory 中由 Notion、Figma、Atlassian 等伙伴专业制作，常与对应 MCP 连接器搭配 |

---

## 2. Skill 的发展历程与开放标准

| 时间 | 事件 |
|---|---|
| **2025-10-16** | Anthropic 正式发布 **Claude Skills** 功能，覆盖 Claude App / Claude Code / API / Agent SDK |
| **2025-12-18** | 发布 **Agent Skills 开放标准**（[agentskills.io](https://agentskills.io/)），Skill 不再锁定于 Claude |
| **2026 至今** | OpenAI Codex、Cursor、Gemini CLI、OpenCode、Roo Code、VS Code、JetBrains Junie、TRAE 等 40+ 客户端陆续接入该标准；生态技能数量已超 **20 万个** |

**关键结论**：Agent Skills 目前是事实上的开放标准。你创建的 Skill 可以在任何支持该标准的平台上运行，不会绑定单一厂商。

**Client Showcase（部分已接入平台）**：[agentskills.io/clients](https://agentskills.io/clients) 列出的客户端包括 Claude Code、Claude.ai、OpenAI Codex、Cursor、Gemini CLI、VS Code、Roo Code、OpenHands、TRAE、Snowflake Cortex Code、Databricks、Block Goose 等。

---

## 3. Skill 的工作原理：渐进式披露

Skill 架构建立在"文件系统 + 代码执行环境"之上，通过 **Progressive Disclosure（渐进式披露）** 分三级加载内容，避免上下文窗口被占满：

| 级别 | 内容 | 加载时机 | Token 成本 |
|---|---|---|---|
| **L1 元数据** | `name` + `description`（YAML frontmatter） | 会话启动时全部加载进系统提示词 | 每个 Skill 约 100 tokens |
| **L2 指令** | `SKILL.md` 正文（工作流、最佳实践、指南） | 任务匹配 description 时，Agent 用 bash 读取 | 建议 < 5000 tokens |
| **L3+ 资源与代码** | `references/`、`scripts/`、`assets/` 中的文件 | 按需读取；脚本只执行、代码不进上下文 | 无实际限制 |

**典型加载流程**（以 PDF 处理 Skill 为例）：

1. **启动**：系统提示词中只有一行元数据 "PDF Processing - Extract text and tables from PDF files, fill forms, merge documents"
2. **触发**：用户说"把这个 PDF 的文字提取并总结" → Agent 通过 `bash: read pdf-skill/SKILL.md` 将指令载入上下文
3. **按需深入**：判断不需要填表功能，则不读取 `FORMS.md`
4. **执行**：按 SKILL.md 指引完成提取任务

**这个架构带来的三个好处**：
- **按需文件访问**：Skill 可包含几十个参考文件，但只加载当前任务需要的那个，其余 0 token
- **脚本高效执行**：`validate.py` 等脚本代码从不进上下文，只有输出（"Validation passed"）消耗 token
- **打包内容无上限**：API 文档、大数据集、海量示例都可以打包，不产生未使用的上下文开销

> 参考：[Claude 官方文档 — How Skills work](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)、[agentskills.io — Progressive disclosure](https://agentskills.io/specification#progressive-disclosure)

---

## 4. Skill 与 Tool / MCP / Prompt / Project 的区别

这是社区最高频的混淆点，官方有明确区分：

| 概念 | 定义 | 类比 |
|---|---|---|
| **Tool（工具）** | Agent 可调用的单个函数（读文件、执行命令、调用 API） | 一把具体的螺丝刀 |
| **MCP** | 统一连接外部系统/数据源的协议（认证、传输、工具发现） | 工具箱与电源接口 |
| **Skill** | 教 Agent"怎么做"的工作流与专业知识（做什么、按什么顺序、有什么护栏） | 装配工艺手册 |
| **Prompt / 自定义指令** | 对话级的一次性指令，全局生效 | 口头嘱咐 |
| **Project（项目）** | 静态背景知识，聊天开始时**总是**加载 | 放桌上的参考书 |
| **Custom Instructions** | 适用于所有对话的宽泛个性化 | 员工守则 |

**核心区分**：
- **Skill vs Prompt**：Prompt 是一次性、会话级的指令；Skill 是按需加载、可复用、跨会话的模块。
- **Skill vs MCP**：MCP 给 Agent **连接**（access），Skill 教 Agent **方法**（procedure）。两者协同使用——MCP 提供工具，Skill 教 Agent 如何用好这些工具。
- **Skill vs Tool**：Tool 是 Agent 调用的单个功能；Skill 定义的是工作流本身，可内部引用 Tool。
- **Skill vs Project**：Project 静态、总是加载（吃上下文）；Skill 动态、按需加载。

> 生产环境中三层同时运转：**MCP 负责访问、Tools 负责行动、Skills 负责行为规范**。
> 参考：[Claude 支持文章 — Skills compared to other Claude capabilities](https://support.claude.com/en/articles/12512176-what-are-skills)、[ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)

---

## 5. 如何高质量编写 Skill（官方最佳实践）

> 本部分综合 [Claude 官方 Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) 与 [agentskills.io 创建者指南](https://agentskills.io/skill-creation/best-practices)。

### 5.1 核心原则

1. **简洁至上（Concise is key）**
   - 上下文窗口是公共资源，你的 Skill 与系统提示词、对话历史、其他 Skill 元数据共享窗口
   - 默认假设"Claude 已经很聪明"：只补充 Claude **不知道**的信息（项目约定、领域流程、非显而易见边界情况、该用的具体工具/API）
   - 对每一段内容自问："没有这句指令，Agent 会做错吗？" 不会就删掉
   - 反例（150 tokens 废话）：解释"PDF 是什么格式、需要装库、推荐 pdfplumber 因为它易用……"
   - 正例（50 tokens）：直接给出 `Use pdfplumber for text extraction` + 代码

2. **设置恰当的自由度（Degrees of freedom）**
   - **高自由**（文本型指令）：多种方法都有效、依赖上下文判断 → 只给方向，如代码审查要点清单
   - **中自由**（带参数脚本/伪代码）：有推荐模式但允许变化 → 给模板让 Agent 自定义
   - **低自由**（精确脚本）：操作脆弱、一致性关键、顺序必须严格 → 给死命令，如 `python scripts/migrate.py --verify --backup`，明令"不要改命令、不要加参数"
   - 类比：窄桥两边是悬崖 → 给护栏和精确指令；开阔平原 → 给方向让 Agent 自己走

3. **用真实执行迭代（Refine with real execution）**
   - 不要用 LLM 凭通用知识空想 Skill（产出的是"妥善处理错误""遵循认证最佳实践"这类空话）
   - 正确起点：① 与 Agent 真实完成一次任务，提取"成功的步骤 + 你纠正过的地方 + 输入输出格式 + 你补充的上下文"；② 或从团队真实产物（runbook、API 规范、代码评审记录、故障复盘）综合提炼
   - 然后**跑起来**：用真实任务测试，把执行痕迹（不只最终输出）喂回创作流程，一轮"执行-修订"即可显著提升质量
   - 发现 Agent 每次都在"重新发明同一个轮子"（反复写同样的图表/解析/校验代码）→ 把这段逻辑固化成 `scripts/` 里的脚本

4. **跨模型测试**
   - Skill 是模型的增量，效果取决于底层模型。测试时按模型分级提问：Haiku（快而省）够不够细？Sonnet（均衡）是否清晰？Opus（强推理）是否过度解释？
   - 想跨模型通用，就瞄准"对所有模型都有效"的指令密度

### 5.2 SKILL.md 结构与格式规范

```
---
name: my-skill-name
description: 做什么 + 何时用，一句话说清
license: Apache-2.0          # 可选
compatibility: ...           # 可选，环境要求
metadata:                    # 可选
  author: xxx
  version: "1.0"
---
# Skill 标题
## Instructions
[清晰的分步指导]
## Examples
[具体示例]
## Guidelines
[规则与约束]
```

**frontmatter 字段要求（官方规范）**：

| 字段 | 必填 | 约束 |
|---|---|---|
| `name` | ✅ | ≤64 字符；仅小写字母/数字/连字符；首尾不能是连字符；不能含连续连字符；不能含 XML 标签；不能含保留词 "anthropic"、"claude"；**必须与父目录同名** |
| `description` | ✅ | 1-1024 字符；非空；不能含 XML 标签；写清"做什么 + 何时用" |
| `license` | ❌ | 许可证名或引用附带许可证文件 |
| `compatibility` | ❌ | ≤500 字符；环境要求（目标产品、系统包、网络需求） |
| `metadata` | ❌ | 任意键值对 |
| `allowed-tools` | ❌ | 空格分隔的预授权工具列表（实验性） |

**命名规范（推荐动名词形式）**：
- 好：`processing-pdfs`、`analyzing-spreadsheets`、`testing-code`、`writing-documentation`
- 可接受：`pdf-processing`（名词短语）、`process-pdfs`（动作导向）
- 避免：`helper`、`utils`、`tools`（太模糊）、`documents`、`data`（太泛）、`claude-tools`（保留词）

### 5.3 写出能触发正确选择的 description

description 是 Skill 的"门面"，Agent 靠它在 100+ 个 Skill 中选择。**必须第三人称**（系统提示词注入，人称不一致会破坏发现机制）：

- ❌ "I can help you process Excel files" / "You can use this to process Excel files"
- ✅ "Processes Excel files and generates reports"

**要具体、含触发关键词**，写清"做什么 + 何时用 + 触发场景"：

- ✅ `Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.`
- ❌ `Helps with documents` / `Processes data`

### 5.4 渐进式披露模式（组织长 Skill）

**硬性建议**：`SKILL.md` 正文控制在 **500 行 / 5000 tokens 以内**，接近上限就拆分文件。

**Pattern 1：总览 + 引用（高屋建瓴式）**

```
# PDF Processing
## Quick start
Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
## Advanced features
**Form filling**: See [FORMS.md](FORMS.md)
**API reference**: See [REFERENCE.md](REFERENCE.md)
**Examples**: See [EXAMPLES.md](EXAMPLES.md)
```

**Pattern 2：按领域组织**（用户问销售指标时，只加载 sales.md，不碰 finance/marketing）

```
bigquery-skill/
├── SKILL.md (导航总览)
└── reference/
    ├── finance.md
    ├── sales.md
    ├── product.md
    └── marketing.md
```

**Pattern 3：条件式细节**（基础内容在正文，进阶内容链接出去，如"要做修订追踪再看 REDLINING.md"）

**引用层级规则**：
- 参考文件引用保持 **一级深度**（都从 SKILL.md 直接链出）；嵌套引用会导致 Agent 用 `head -100` 预览、读不完整
- 超过 100 行的参考文件，**顶部加目录（TOC）**，让 Agent 预览时也能看到全貌

### 5.5 工作流与反馈循环

- **复杂任务拆成清单（Checklist）**：让 Agent 把清单复制进回复逐项勾选，防止跳步：

```
Progress:
- [ ] Step 1: Analyze the form (run `scripts/analyze_form.py`)
- [ ] Step 2: Create field mapping (edit `fields.json`)
- [ ] Step 3: Validate mapping (run `scripts/validate_fields.py`)
- [ ] Step 4: Fill the form (run `scripts/fill_form.py`)
- [ ] Step 5: Verify output (run `scripts/verify_output.py`)
```

- **验证循环（Validation loop）**："执行 → 运行校验器 → 修错 → 再校验 → 通过才继续"，可大幅提升输出质量
- **计划-校验-执行（Plan-Validate-Execute）**：对批量/破坏性操作，先产出结构化计划（如 `field_values.json`），用校验脚本对照真值表（`form_fields.json`）检查，**通过后才执行**。校验脚本给出的具体错误信息（"字段 signature_date 不存在，可用字段有：customer_name, order_total, ..."）让 Agent 能自我纠正

### 5.6 指令模式技巧（agentskills.io 补充）

| 模式 | 用途 |
|---|---|
| **Gotchas 章节** | 最高价值内容——环境特有、违背常理的坑："users 表是软删除，查询必须带 `WHERE deleted_at IS NULL`"。Agent 犯错被你纠正后，就把它加进 Gotchas |
| **输出格式模板** | 需要特定格式时直接给模板（Agent 对具体结构模式匹配更强），长模板放 `assets/` 按需加载 |
| **给默认值，不要给菜单** | "用 pdfplumber，扫描件 OCR 用 pdf2image+pytesseract" 优于 "可以用 pypdf、pdfplumber、PyMuPDF……" |
| **教方法而非给答案** | "读 schema 找到相关表 → 按 `_id` 外键约定 join → 把用户请求转成 WHERE 子句"（可复用方法）优于"join orders 和 customers，region 过滤 'EMEA'，sum amount"（一次性答案） |

### 5.7 校验工具

- 官方参考库 [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref)：`skills-ref validate ./my-skill` 可校验 frontmatter 合法性与命名规范
- 官方模板：[anthropics/skills/template](https://github.com/anthropics/skills/tree/main/template)

---

## 6. Skill 的能力边界与限制

### 6.1 Skill 能做什么 / 不能做什么

| ✅ 能 | ❌ 不能 |
|---|---|
| 打包指令、工作流、参考知识、模板 | 提供模型本身没有的推理能力（Skill 不增强模型智力） |
| 附带并执行脚本（Python/Bash/JS），实现确定性操作 | 单独提供工具/API 连接能力（那是 MCP 的职责） |
| 携带大量参考资料按需加载，无上下文代价 | 跨平台自动同步（见下） |
| 组合多个 Skill 构建复杂流程 | 绕过底层模型的上下文窗口限制 |
| 教会 Agent 用好特定软件/工具 | 替代模型的安全护栏（恶意 Skill 是风险源） |

### 6.2 平台级限制（官方文档原文要点）

**跨平台不自动同步**：上传到 Claude.ai 的 Skill 不会自动出现在 API/Claude Code；三端需分别管理。共享范围也不同——Claude.ai 仅个人、API 为工作区级、Claude Code 为个人/项目级（也可通过 Plugin 分享）。

**运行时环境约束**：

| 平台 | 网络 | 依赖 |
|---|---|---|
| **Claude.ai** | 视用户/管理员设置，可全量/部分/无网络 | 按产品环境 |
| **Claude API** | **无网络**，不能发起外部 API 调用 | 只有预装包，运行中不能安装新包 |
| **Claude Code** | 全量网络（与用户电脑同等权限） | 鼓励本地安装，避免污染全局 |

**API 使用前置要求**（仅 API 场景）：需要 `code-execution-2025-08-25`、`skills-2025-10-02`、`files-api-2025-04-14` 三个 beta header；`name` 字段不能含保留词 "anthropic"/"claude"。

### 6.3 安全注意事项（务必阅读）

> 官方明确警告：**只使用可信来源的 Skill（自己写的或 Anthropic 官方）**。Skill 通过指令和代码赋予 Agent 新能力，恶意 Skill 可以引导 Agent 调用工具或执行不符合其声明用途的代码。

- **彻底审计**：检查 Skill 内所有文件（SKILL.md、脚本、图片），警惕异常网络调用、异常文件访问、与声明用途不符的操作
- **外部来源有风险**：从外部 URL 抓数据的 Skill 风险高，抓回的内容可能夹带恶意指令；可信 Skill 的外部依赖变化也可能使其被攻陷
- **工具滥用**：恶意 Skill 可诱导文件操作、bash 命令、代码执行等造成危害
- **数据暴露**：能访问敏感数据的 Skill 可能被设计成向外泄露
- **对待原则**：像安装软件一样谨慎，接入生产环境（含敏感数据/关键操作）时尤其小心

> 参考：[Claude 官方文档 — Security considerations](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

---

## 7. 优秀 Skill 的标准与评估清单

### 7.1 优秀 Skill 的六大维度

1. **发现性（Discoverability）**：description 第三人称、具体、含触发关键词，让 Agent 能在 100+ Skill 中精准选中
2. **上下文经济（Context economy）**：SKILL.md < 500 行；正文只写"Agent 不知道的"；参考文件一级引用、长文件带 TOC
3. **指令校准（Calibration）**：自由度与任务脆弱性匹配——脆弱操作给死命令，灵活任务给方向
4. **工作流控制（Workflow control）**：多步骤任务给清单、验证循环、计划-校验-执行
5. **可执行性（Executable code）**：重复逻辑固化为 `scripts/` 脚本，代码不进上下文，输出进上下文
6. **真实落地（Grounded）**：内容来自真实执行/项目产物（含 Gotchas），而非 LLM 空想

### 7.2 评估自查清单（对照打分）

```
□ name 合法：小写/数字/连字符，≤64 字符，与目录同名，无保留词
□ description 第三人称、非空、≤1024 字符，写清"做什么+何时用+触发词"
□ SKILL.md 正文 ≤ 500 行 / 5000 tokens
□ 每段内容通过"没有它会做错吗"测试（默认 Agent 已很聪明）
□ 自由度与任务脆弱性匹配
□ 复杂流程有清单/校验循环/计划-校验-执行
□ 反复出现的逻辑已抽成 scripts/ 脚本
□ 参考文件一级引用、>100 行带 TOC
□ Gotchas 记录了真实踩过的坑
□ 已在计划使用的全部模型上实测
□ 用 skills-ref validate 通过规范校验
```

### 7.3 社区公认的"烂 Skill"特征（避雷）

- description 空泛："Helps with documents" "Processes data"
- 名字模糊："helper" "utils" "tools"
- 正文科普废话：解释 PDF 是什么、HTTP 是什么（浪费上下文）
- 给菜单不给默认值："你可以用 A、B、C、D 库……"
- 给一次性答案不给可复用方法
- 引用链过深（SKILL.md → advanced.md → details.md）
- 从未在真实任务上跑过

---

## 8. 优秀 Skill 示例拆解

### 8.1 官方示例库 [anthropics/skills](https://github.com/anthropics/skills)（135K+ stars，Apache 2.0 为主）

仓库按四类组织 17 个官方示例，是学习"各种模式与套路"的最佳教材：

| 类别 | Skills | 学习价值 |
|---|---|---|
| **文档类（生产级）** | `docx`、`pdf`、`pptx`、`xlsx` | 官方生产环境真实使用的复杂 Skill，展示脚本化、校验循环、OOXML 细节拆分 |
| **创意与设计** | `algorithmic-art`、`canvas-design`、`theme-factory`、`slack-gif-creator` | 程序化生成、设计系统化 |
| **开发与技术** | `web-artifacts-builder`、`webapp-testing`、`mcp-builder`、`claude-api`、`skill-creator` | 应用开发相关，见第 9 节详述 |
| **企业与沟通** | `brand-guidelines`、`doc-coauthoring`、`internal-comms` | 组织知识打包、品牌规范应用 |

> 注意官方免责声明：这些 Skill 仅作演示与教学，接入生产前务必自行充分测试。

### 8.2 最佳实践原文示例（PDF 处理 Skill 的标准骨架）

```markdown
---
name: pdf-processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
# PDF Processing
## Quick start
Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

该骨架同时示范了：精准的 description（做什么+何时用+触发词）、简洁指令（默认模型已知 PDF）、渐进式披露（三个按需加载的参考文件）。

### 8.3 官方 skill-creator（元技能）

Anthropic 官方提供了一个"用来创建 Skill 的 Skill"：**skill-creator**（位于官方仓库 `skills/skill-creator`，另有独立实现）。它把提示词工程升级为"技能工程"，覆盖 Skill 开发全生命周期：草稿编写 → 修改 → 改进 → 评估。社区称之为"开模工具"——把个人经验和重复性工作流封装成可复用 Skill。

---

## 9. 应用开发相关高下载量 Skill 推荐

> 以下数据综合 Claude Code 插件市场安装量排行（2026-03 掘金高浏览文章）与 GitHub 星标数（2026-07）。安装量会随时间变化，此处为调研时点的参考值。

### 9.1 Top 榜单（全生态高安装量）

| 排名 | Skill | 安装量（约） | 出品方 | 定位 |
|---|---|---|---|---|
| 1 | `find-skills` | 251.5K | Anthropic | 生态导航：从 20 万 Skill 中精准筛选，第一个该装的 |
| 2 | `vercel-react-best-practices` | 141.5K | Vercel | 编程类第一：React/Next.js 性能最佳实践（45+ 规则分级） |
| 3 | `web-design-guidelines` | 107.0K | Vercel | 设计类第一：100+/247 条网页界面规范（可访问性、性能、UX） |
| 4 | `remotion-best-practices` | 96.2K | Remotion | 用代码做视频的最佳实践 |
| 5 | `frontend-design` | 76.4K | Anthropic | 前端界面设计：审美、层次、代码与设计融合 |
| 6 | `agent-browser` | 41.9K | Anthropic | AI 操作浏览器：自动化交互、数据采集、表单填写 |
| 7 | `skill-creator` | 37.4K | Anthropic | 创建/改进/评估自定义 Skill 的元技能 |
| 8 | `brainstorming` | 22.1K | Anthropic | 创意发散：灵感生成、头脑风暴 |
| 9 | `audit-website` | 21.8K | 社区 | 网站体检：230+ 规则 SEO/UX/转化诊断 |
| 10 | `pdf` | 16.2K | Anthropic | 文档处理刚需：提取、转换、合并、拆分 |

> 数据来源：[掘金 — Claude Code Skills 推荐：2026年最值得安装的10个AI工具扩展](https://juejin.cn/post/7615449883811364879)（浏览 3.9K+，筛选标准：安装量 ≥10K、实用性、稳定性、互补性）

### 9.2 面向"应用开发"的专项推荐（结合你的技术栈：Vue3/Vite/TS 前端 + Spring Boot 后端）

**A. 前端 / Web 应用开发（强烈推荐）**

| Skill | 出品方 | 安装量/星标 | 适用场景 |
|---|---|---|---|
| `vercel-react-best-practices` | Vercel | 141.5K | React 项目性能优化（瀑布流、bundle、渲染）——虽是 React 体系，优化方法论通用 |
| `web-design-guidelines` | Vercel | 107.0K | 审查 UI 代码是否符合 Web 界面最佳实践（无障碍/表单/动效/暗色模式/i18n） |
| `frontend-design` | Anthropic | 76.4K | 前端界面设计美化，让页面有审美有层次（官方仓库 `skills/frontend-design`） |
| `composition-patterns` | Vercel | 高 | React 组件组合模式：避免布尔 props 爆炸、复合组件设计 |
| `react-view-transitions` | Vercel | 高 | 页面过渡动画 / View Transition API 实现 |
| `react-native-guidelines` | Vercel | 高 | React Native / Expo 移动端最佳实践 |

**B. 全栈 / 后端 / 工程化**

| Skill | 出品方 | 说明 |
|---|---|---|
| `webapp-testing` | Anthropic | 用 Playwright 测试本地 Web 应用、调试 UI、截图（官方 `skills/webapp-testing`） |
| `mcp-builder` | Anthropic | 指导创建高质量 MCP Server（Python FastMCP / TS），对接外部 API |
| `claude-api` | Anthropic | 内置 8 种语言的 Claude API 参考与最佳实践，写 API 集成必备 |
| `skill-creator` | Anthropic | 把个人开发流程（如"我的 CRUD 开发套路"）封装成 Skill |
| `find-skills` | Anthropic | 按需在 20 万 Skill 生态中检索你需要的特定框架技能（如 Vue、Spring） |

**C. 方法论 / 工作流类（高星社区项目）**

| 项目 | 星标（约） | 说明 |
|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) | 160K | Claude Code 最强技能库：TDD、subagent 驱动开发、git worktree、planning 等全套工程方法论 |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 16.5K | 1000+ 精选生产级 Skill 目录，含 `webapp-testing`、`mcp-builder`、`skill-creator`、`changelog-generator` 等 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 高 | Vercel 官方技能集（MIT）：部署、React 优化、设计规范、写作规范，安装 `npx skills add vercel-labs/agent-skills` |
| [anthropics/skills](https://github.com/anthropics/skills) | 135K+ | 官方示例与模板，学习编写 Skill 的第一手教材 |

**D. 技能市场/分发渠道**

| 渠道 | 说明 |
|---|---|
| [SkillsMP](https://skillsmp.com) | 50,000+ 技能规模的市场，智能搜索，支持中文 |
| Claude.ai 内置 Skills Directory | Claude 应用内 "Customize → Skills → Browse skills" |
| Claude Code Plugin Marketplace | `/plugin marketplace add anthropics/skills` 后一键安装 |
| `npx skills add <owner>/<repo>` | skills.sh 生态的命令行安装方式 |

### 9.3 针对初学者的安装建议顺序

1. **先装 `find-skills`**（导航入口，第一个）
2. **再装 `skill-creator`**（把学习过程沉淀成自己的技能）
3. **然后按领域装**：前端开发 → `frontend-design` + `web-design-guidelines` + `webapp-testing`；后端/工程 → `mcp-builder` + `superpowers`（TDD 方法论）
4. **最后按需补充**：`pdf`/`docx`/`xlsx`（文档处理）、`audit-website`（上线前体检）

> ⚠️ 安装原则：不要一次装太多；装一个就用熟一个；定期更新保持时效性。只从可信来源安装（自己编写或官方出品），安装后先审计再使用。

---

## 10. 参考资料来源

### 官方（Anthropic / Agent Skills 开放标准）

- [Claude 官方文档 — Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Claude 官方文档 — Skill Authoring Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [Claude 支持文章 — What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Claude 支持文章 — How to create custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Anthropic 工程博客 — Equipping agents for the real world with Agent Skills](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Skills 开放标准 — agentskills.io](https://agentskills.io/)
- [Agent Skills 规范 — agentskills.io/specification](https://agentskills.io/specification)
- [Agent Skills 创建者最佳实践 — agentskills.io/skill-creation/best-practices](https://agentskills.io/skill-creation/best-practices)
- [Agent Skills 客户端清单 — agentskills.io/clients](https://agentskills.io/clients)

### GitHub 高星项目

- [anthropics/skills](https://github.com/anthropics/skills)（官方示例库，135K+ stars）
- [obra/superpowers](https://github.com/obra/superpowers)（160K stars，工程方法论技能库）
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)（16.5K stars，1000+ 精选技能）
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)（Vercel 官方技能集）
- [agentskills/agentskills](https://github.com/agentskills/agentskills)（官方参考库与 skills-ref 校验工具）

### 社区高浏览量 / 高引用文章

- [掘金 — Claude Code Skills 推荐：2026年最值得安装的10个AI工具扩展](https://juejin.cn/post/7615449883811364879)（安装量数据来源）
- [掘金 — Anthropic 官方指南：构建 Skills 的秘密都在这里](https://juejin.cn/post/7613008254469750838)
- [CSDN — Agent Skills 到底是什么？与 Tool 和 MCP 的关系深度解析](https://blog.csdn.net/CSDN_430422/article/details/157695802)
- [CSDN — Claude Skills 深度解析：从 What、Why、How 构建领域专用技能](https://blog.csdn.net/roamingcode/article/details/155937594)
- [CSDN — GitHub 7大爆款Skills开源项目：Anthropic官方Skill生态](https://blog.csdn.net/weixin_61514920/article/details/157699029)
- [51CTO — Skills 全攻略：从概念到实操的完整手册](https://www.51cto.com/aigc/10104.html)

---

*本文档由网络调研整理而成，资料主要来自 Anthropic 官方文档、Agent Skills 开放标准官网、GitHub 高星项目及社区高浏览量文章。数据点（安装量、星标数）随生态快速变化，引用时请以来源链接的实时数据为准。*
