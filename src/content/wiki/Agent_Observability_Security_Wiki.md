# LLM Wiki — Agent 可观测性与安全治理全谱系

> 面向 LLM Agent 的**可观测性(Observability)与安全治理(Security & Governance)** 系统性知识库:从可观测性三支柱变形(Logging/Tracing/Metrics)、决策归因、平台对比、OTel GenAI 标准,到 OWASP Agentic AI 全谱、治理机制(权限/审批/审计/声明式宪章)、合规与红队测试,沉淀为 Agent 可直接阅读、学习并用于设计可观测与治理体系的一手资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**运行保障层**——对应 [Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) 的 O(可观测性)与 G(治理安全)两层,纵深展开。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:OWASP 官方、arXiv 论文(编号已核实)、GitHub API 实时 star、Anthropic/微软官方文档、OTel 规范

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [可观测性核心概念](#2-可观测性核心概念)
3. [LLM 可观测性平台对比](#3-llm-可观测性平台对比)
4. [可观测性落地技术](#4-可观测性落地技术)
5. [安全治理全谱:OWASP 框架](#5-安全治理全谱owasp-框架)
6. [治理机制与工具链](#6-治理机制与工具链)
7. [合规与红队测试](#7-合规与红队测试)
8. [2025-2026 最新进展](#8-2025-2026-最新进展)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

Agent 系统呈现**黑盒性**(推理不可见)、**多步自主执行**(工具调用链)、**错误级联传播**(一步失误放大后续成本)、**成本失控**(token 随循环放大)四大特性。要让 Agent 在生产环境可信,必须同时具备"看得见"(可观测)与"管得住"(治理)两套能力。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:排查"Agent 为什么这么做" → §2 决策归因 → §4 落地技术
目标:搭建可观测 → §3 平台选型 → §4 OTel → §9.1 清单
目标:安全治理 → §5 OWASP → §6 治理机制 → §9.2 清单
目标:合规 → §7 合规与红队
```

### 1.3 一句话核心结论

> **可观测性让 Agent 行为可解释、可归因;治理让 Agent 行为可约束、可审计。** 二者合一是 Agent 从"demo 能跑"走向"生产可信"的必经之路。

---

## 2. 可观测性核心概念

### 2.1 为什么需要(四大特性)

| 特性 | 表现 | 可观测性的价值 |
|---|---|---|
| 黑盒性 | 推理过程不可见 | trace 让决策路径可见 |
| 多步自主执行 | 工具调用链 | span 串联完整调用链 |
| 错误级联传播 | 一步失误放大后续 | 快速定位失败源头 |
| 成本失控 | token 随循环放大 | 成本追踪与上限 |

### 2.2 三支柱在 Agent 场景的变形

| 支柱 | 传统 | Agent 场景 |
|---|---|---|
| **Logging** | 应用日志 | 每次 LLM 调用与工具调用的输入输出(prompt/response/异常) |
| **Tracing** | 服务调用链 | span/trace 串联"用户请求→推理→多轮工具调用→最终输出" |
| **Metrics** | 性能指标 | 延迟、token 用量、成本、工具成功率、循环次数 |

### 2.3 决策归因(Decision Attribution)

通过 trace 回放解释**"Agent 为什么这么做"**——定位行为源头是提示注入、工具返回脏数据还是模型误判。这是事故复盘与责任划分的依据。

---

## 3. LLM 可观测性平台对比

> star 为 2026-08 GitHub API 实测。

| 平台 | 形态/授权 | GitHub★ | 定位 | 定价 |
|---|---|---|---|---|
| **Langfuse** | 开源+云(MIT 核心,2026-01 并入 ClickHouse) | 约 33k | 通用 LLM 工程平台:trace/评测/数据集/prompt 管理,可自托管 | 云免费层+付费 |
| **LangSmith** | LangChain 商业 SaaS(闭源) | — | 与 LangChain 深度集成,trace→数据集→评测闭环 | 订阅制 |
| **Arize Phoenix** | 开源(Arize 主导)+商业 | 约 10.9k | AI 可观测与评估,原生支持 OTel GenAI、agent 工作流 | 开源免费 |
| **Braintrust** | 商业 SaaS+开源组件 | — | 评测与生产链路闭环("生产到评估"),RAG 评测口碑佳 | 订阅制 |
| **Helicone** | 开源 | — | LLM 网关/代理:统一 API、可观测、成本上限控制 | 开源+云 |
| **W&B Weave** | W&B 工具链 | — | 与实验跟踪整合的 LLM 可观测/评估 | 订阅制 |

### 3.1 选型规律

```text
注重自托管与开源 → Langfuse / Phoenix
深度绑定 LangChain 生态 → LangSmith
偏评测与网关治理 → Braintrust / Helicone
```

---

## 4. 可观测性落地技术

### 4.1 OTel GenAI 语义约定(SemConv)

核心是 **OpenTelemetry GenAI 语义约定**:`gen_ai.*` 命名空间统一定义:

- 模型调用与 token 用量(`gen_ai.usage.input_tokens` 等)
- embedding、agent span
- MCP 工具调用(`mcp.tool.call` / `mcp.resource.read`)

**价值**:使 Langfuse、Phoenix、Datadog 等后端自动识别,避免各家自造属性,实现跨平台互通。

### 4.2 反馈回路模式

```text
生产 trace → 用户反馈/自动标注 → 沉淀为数据集 → 评测 → 回归
```

> Langfuse 的 datasets + LLM-as-judge 即此闭环。可观测平台正成为**评测基础设施**——生产 trace 直接回流评测集。

---

## 5. 安全治理全谱:OWASP 框架

### 5.1 OWASP 框架体系三层

| 层 | 文档 | 覆盖 |
|---|---|---|
| **LLM 应用** | LLM Top 10 2025(2024-12)+ 2026 版 | LLM01 Prompt Injection、LLM02 敏感信息、LLM04 数据/模型投毒、LLM08 向量/嵌入弱点 |
| **Agentic AI** | 《Agentic AI – Threats and Mitigations》(2025-02-17,15 项威胁) | T1 记忆中毒起,覆盖提示注入、工具滥用、多 agent 相互影响 |
| **Agentic 应用** | 2026 年推出 Top 10 for Agentic Applications + AIUC-1 crosswalk | Agent 全谱系 |

### 5.2 15 项威胁的关键条目

- **T1 Memory Poisoning**(记忆投毒)——与 [Memory_Security_Wiki.md](Memory_Security_Wiki.md) 直接呼应
- T2 工具滥用、T5 级联幻觉、T12 代理通信中毒、T13 流氓代理

> 关联阅读:[Memory_Security_Wiki.md](Memory_Security_Wiki.md) §5(OWASP Agentic AI 详解)。

---

## 6. 治理机制与工具链

### 6.1 治理机制清单

| 机制 | 说明 |
|---|---|
| **权限模型** | RBAC/ABAC + 细粒度工具白名单 |
| **身份验证与委派** | "以用户名义执行"(on-behalf-of) |
| **审批网关** | 高风险动作人工放行 |
| **审计管线** | 不可篡改的行为审计 |
| **声明式宪章(Declarative Constitutions)** | Anthropic 2025 治理框架:宪章 + 权限 + 审计轨迹 + 任务登记,把策略写成可校验声明 |
| **沙盒策略** | 执行隔离(呼应 Harness E 层) |

### 6.2 工具链

| 工具 | 说明 |
|---|---|
| **OPA**(Open Policy Agent,约 10.5k★,CNCF) | 通用策略引擎,对工具调用做策略裁决 |
| **Claude Code 权限模式** | 6 种:default/plan/acceptEdits/auto/dontAsk/bypassPermissions |
| **微软 Agent Governance Toolkit**(2026-04 开源,MIT,约 3.6k★) | 声明覆盖 OWASP Agentic Top 10 |

---

## 7. 合规与红队测试

### 7.1 合规要点

| 法规/标准 | 要点 |
|---|---|
| **GDPR** | 数据最小化、可审计性、"删除权"——直接冲击 Agent 记忆系统:需提供记忆删除 API、trace 中 PII 脱敏(Langfuse 已做 email 脱敏) |
| **EU AI Act**(EU 2024/1689) | 2024-08 生效,GPAI 义务 2025-08 起适用,**2026-08 进入执法窗口** |
| **ISO/IEC 42001** | 组织级 AI 管理体系 |

### 7.2 红队与安全评测

| 工具 | 说明 |
|---|---|
| **AgentDojo**(arXiv:2406.13352,ETH SPY Lab) | 97 个任务、629 个测试用例,动态评测提示注入攻防 |
| **Agent Security Bench/ASB**(arXiv:2410.02644,ICLR 2025) | 10 场景、400+ 工具、27 种攻防方法、7 指标;最高平均攻击成功率 84.30%,现有防御有效性有限 |

> 安全监控应从**一次性评测**转向**持续监控**——在生产 trace 中检测注入与越权行为。

---

## 8. 2025-2026 最新进展

| 方向 | 进展 |
|---|---|
| **标准** | OTel GenAI SemConv 趋于稳定;AgentOps(可观测+评测+治理一体化)成为范式 |
| **监管** | EU AI Act 进入执行期;NIST AI RMF 推出 agentic 扩展;OWASP 从"LLM 应用"扩展到"Agentic 应用"全谱系(Agentic Top 10、AIUC-1 crosswalk、State of Agentic AI Security and Governance 2.01) |
| **平台化** | 可观测平台成为评测基础设施(生产 trace 回流评测集);治理平台(微软 AGT 等)向"两行代码接入"的运行时护栏演进 |

---

## 9. 为 Agent 生成的可执行框架

### 9.1 可观测性搭建检查清单

```markdown
## 可观测性自查
□ 是否接入 tracing(span/trace 串联完整调用链)?
□ 每次 LLM 调用与工具调用是否记录输入输出?
□ 是否追踪 token 用量与成本?(成本失控防线)
□ 是否实现决策归因?(能回答"Agent 为什么这么做")
□ 是否遵循 OTel GenAI 语义约定?(跨平台互通)
□ 是否建立反馈回路?(生产 trace → 数据集 → 评测 → 回归)
□ 关键指标是否告警?(延迟/token/工具成功率/循环次数)
```

### 9.2 安全治理搭建检查清单

```markdown
## 治理自查
□ 是否映射了 OWASP Agentic AI 威胁?(15 项逐一对照)
□ 是否有权限模型 + 工具白名单?(RBAC/ABAC)
□ 高风险动作是否有审批网关?
□ 是否有不可篡改审计管线?
□ 是否采用声明式宪章?(策略可校验、可追溯)
□ 记忆系统是否满足 GDPR 删除权?(记忆删除 API + PII 脱敏)
□ 是否做红队测试?(AgentDojo/ASB)
□ 是否有持续安全监控?(生产 trace 中检测注入与越权)
```

### 9.3 供 Agent 生成可观测/治理框架的元规则

1. **可观测与治理一体**:trace 既是排障工具也是审计证据,统一设计
2. **标准先行**:遵循 OTel GenAI、OWASP,避免自造属性
3. **反馈闭环**:生产 trace 必须回流评测集,否则可观测性只是记录
4. **治理即代码**:声明式宪章 + OPA 策略,而非口头规则
5. **合规内建**:删除权、PII 脱敏在设计期就考虑,不事后补救

---

## 10. 生态与资源

### 平台与仓库
- [Langfuse](https://github.com/langfuse/langfuse)(约 33k)
- [Arize Phoenix](https://github.com/Arize-ai/phoenix)(约 10.9k)
- [OPA](https://github.com/open-policy-agent/opa)(约 10.5k)
- [微软 Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit)(约 3.6k)
- [AgentDojo](https://github.com/ethz-spylab/agentdojo)
- [ASB](https://github.com/agiresearch/ASB)

### 官方文档与标准
- [OWASP GenAI 项目](https://genai.owasp.org/)(LLM Top 10 2026、Agentic App Top 10、State 2.01)
- [OWASP Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [Anthropic — Declarative Constitutions](https://www.anthropic.com/news/declarative-constitutions)
- [Claude Code 权限模式](https://docs.anthropic.com/en/docs/claude-code/settings#permission-modes)
- [OTel GenAI 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [Langfuse 文档](https://langfuse.com/docs/tracing) ｜ [LangSmith 文档](https://docs.smith.langchain.com/)
- [EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) ｜ [ISO/IEC 42001](https://www.iso.org/standard/81230.html)

### 论文(编号已核实)
- [AgentDojo](https://arxiv.org/abs/2406.13352) ｜ [Agent Security Bench](https://arxiv.org/abs/2410.02644)(ICLR 2025)

---

## 11. 参考来源

- OWASP 官方框架(LLM Top 10 2025/2026、Agentic AI 15 项威胁、Agentic Top 10)
- arXiv 论文(编号逐条核实):AgentDojo、Agent Security Bench
- GitHub API 实时 star(2026-08)
- Anthropic 声明式宪章、Claude Code 权限模式官方文档
- OTel GenAI 语义约定规范
- EU AI Act / ISO/IEC 42001 官方
- 关联文档:[Agent_Harness_Engineering_Wiki.md](Agent_Harness_Engineering_Wiki.md) §9(O)、§11(G)、[Memory_Security_Wiki.md](Memory_Security_Wiki.md)

---

*本文档由 OWASP 官方框架、arXiv 论文(编号逐条核实)、GitHub API 实时数据与官方文档综合而成。市场规模数据为二手估算,已标注;OTel SemConv 版本号各来源表述不一,按"趋于稳定"表述。*
