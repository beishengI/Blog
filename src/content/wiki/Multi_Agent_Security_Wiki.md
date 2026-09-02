# LLM Wiki — 多智能体安全与滥用(Multi-Agent Security & Abuse)

> 面向 LLM Agent 的**多智能体安全与滥用**系统性知识库:从威胁全景(注入传播/流氓代理/级联失败/信道攻击)、关键研究(OWASP 条目/Morris II 蠕虫/Prompt Infection/AgentPoison)、攻击向量与案例、防御体系(通信/隔离/审批/校验/监控)、安全评测,到 2025-2026 最新进展与最佳实践,沉淀为可直接落地的一手安全资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**协作安全层**——[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) 讲协作设计,本文档讲协作的对抗面;与 [Memory_Security_Wiki.md](Memory_Security_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md) 互补。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:arXiv 论文(编号已核实并勘误)、OWASP 官方、GitHub 高星仓库

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [威胁全景](#2-威胁全景)
3. [关键研究](#3-关键研究)
4. [攻击向量与案例](#4-攻击向量与案例)
5. [防御体系](#5-防御体系)
6. [安全评测](#6-安全评测)
7. [2025-2026 最新进展](#7-2025-2026-最新进展)
8. [失败模式与最佳实践](#8-失败模式与最佳实践)
9. [为 Agent 生成的可执行框架](#9-为-agent-生成的可执行框架)
10. [生态与资源](#10-生态与资源)
11. [参考来源](#11-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

多智能体的"协作面"也是"攻击面":注入可在 agent 间传播成蠕虫,单一 agent 出错可级联放大,通信信道可被中间人篡改。本文档建立多智能体安全威胁认知与防御体系。

### 1.2 Agent 阅读本文档的推荐路径

```text
目标:理解威胁 → §2 全景 → §3 研究 → §4 案例
目标:构建防御 → §5 防御体系 → §9 检查清单
目标:评测安全 → §6 评测
```

### 1.3 一句话核心结论

> **多智能体的安全铁律:不可信数据一律视为"数据"而非指令;关键决策多代理共识;通信加密认证;持续红队评测。**

---

## 2. 威胁全景

| 威胁 | 机制 | OWASP 条目 |
|---|---|---|
| **注入传播** | 恶意提示嵌于外部内容,agent 执行后借消息/工具复制给其他 agent,蠕虫式级联 | 相关 LLM01 |
| **流氓代理(Rogue Agent)** | 被劫持/受损 agent 在监控边界外运行,执行未授权操作或窃取数据 | **T13** |
| **级联失败** | 单 agent 错误/幻觉经数据流放大扩散至全系统 | T5 级联幻觉攻击 |
| **通信信道攻击** | 中间人篡改 agent 间消息,传播虚假信息、破坏工作流 | **T12** |

---

## 3. 关键研究

### 3.1 核心论文(编号已核实)

| 研究 | 内容 | arXiv |
|---|---|---|
| **Morris II(多 agent 蠕虫)** | 基于 RAG 的邮件助手生态中零点击间接注入级联传播与数据窃取;提出"Virtual Donkey"注入检测护栏(TPR 1.0、FPR 0.015) | [2403.02817](https://arxiv.org/abs/2403.02817) |
| **Prompt Infection** | 首个 LLM-to-LLM 多 agent 病毒式注入研究;即使不共享全部通信仍可传播;提出 LLM Tagging 防御 | [2410.07283](https://arxiv.org/abs/2410.07283) |
| **AgentPoison** | 后门攻击污染长期记忆/RAG 知识库,无需训练微调,触发词约束优化;攻击成功率 >80%、毒化率 <0.1%;共享知识库污染波及所有使用 agent | [2407.12784](https://arxiv.org/abs/2407.12784) |
| **MAST** | 1600+ 轨迹级联失败分类学:系统设计缺陷、agent 间错位、任务验证缺失 | [2503.13657](https://arxiv.org/abs/2503.13657) |
| **抗注入设计模式** | 结构化防御设计模式 | [2506.08837](https://arxiv.org/abs/2506.08837) |

> ⚠️ **编号勘误**:Morris II 正确编号为 **arXiv:2403.02817**(流传的 2406.02417 实为宇宙学论文)。

### 3.2 OWASP Agentic AI 相关条目(15 项)

- **T12 代理通信中毒**:缓解为加密消息认证、通信验证策略、监控异常、关键任务多代理共识验证
- **T13 流氓代理**:缓解为策略约束与持续行为监控
- 相关:T1 内存中毒、T5 级联幻觉攻击、T8 不可追溯、T11 意外 RCE

---

## 4. 攻击向量与案例

| 向量 | 机制 | 案例 |
|---|---|---|
| **共享记忆/工具库污染** | 向公共 RAG 库或共享长期记忆注入后门触发 | AgentPoison 攻击 EHRAgent、自动驾驶 agent |
| **中间人攻击 agent 通信** | 篡改/注入 agent 间传递的消息 | OWASP T12 |
| **任务分解链注入传播** | 恶意指令伪装成子任务输出,逐级劫持下游 agent | Morris II、Prompt Infection |

---

## 5. 防御体系

| 层 | 措施 |
|---|---|
| **通信层** | 消息签名与加密认证、来源校验、防篡改通道 |
| **隔离** | 独立上下文与内存隔离、最小权限、代码执行沙箱(gVisor/Docker+seccomp)、指令/数据通道分离 |
| **审批与 HITL** | 高风险动作人工确认或分级审批 |
| **输出校验** | 注入检测器(如 Virtual Donkey)、结构化工具调用参数校验 |
| **监控** | 行为异常检测(调用频率/模式突变)、全链路日志与加密审计(T8) |

---

## 6. 安全评测

| 基准 | 内容 |
|---|---|
| **AgentDojo**([arXiv:2406.13352](https://arxiv.org/abs/2406.13352),ETH Zurich) | 97 个真实任务、629 个安全用例,动态可扩展攻防评测框架 |
| **Agent Security Bench(ASB)**([arXiv:2410.02644](https://arxiv.org/abs/2410.02644),ICLR 2025) | 10 场景、10 agent、400+ 工具、27 种攻防方法、13 个 LLM 骨干;最高平均攻击成功率 84.30%,评测 11 种防御 |
| **红队** | AgentPoison 式后门红队、OWASP 红队与 CTF |

---

## 7. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **OWASP Top 10 for Agentic Applications 2026** | 已发布,含 **ASI06 记忆与上下文中毒**,并有 AIUC-1 交叉映射 |
| **治理白皮书** | OpenAI 等联合发布《Practices for Governing Agentic AI Systems》(已联网核实:官方页面标注 2023-12-14 发布,原"2025-12"有误) |
| **配套指南** | 《State of Agentic AI Security and Governance 2.0》(2026)与 MCP 服务器安全指南相继发布 |
| **多 agent 安全实践** | Anthropic 公开多 agent 研究系统的工程与安全实践([multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system),已联网核实) |

---

## 8. 失败模式与最佳实践

### 8.1 失败模式(MAST 分类学)

| 失败模式 | 说明 |
|---|---|
| 系统设计问题 | 规范缺陷、无监督 |
| agent 间错位 | 目标/信息传递不一致 |
| 任务验证缺失 | 无产出校验 |

### 8.2 最佳实践

1. 不可信数据一律视为"数据"而非指令
2. 关键决策多代理共识
3. 动态权限与最小授权
4. HITL 分级干预
5. 全链路可审计日志
6. 持续红队评测

---

## 9. 为 Agent 生成的可执行框架

### 9.1 多智能体安全自查清单

```markdown
## 多智能体安全自查
□ agent 间消息是否加密认证?(防中间人/T12)
□ 外部内容是否按不可信数据处理?(数据≠指令)
□ 各 agent 是否独立上下文与内存隔离?
□ 是否最小权限?(动态授权)
□ 高风险动作是否有审批/HITL?
□ 是否有注入检测器?(Virtual Donkey 类)
□ 是否有行为异常检测与全链路审计?
□ 关键决策是否多代理共识?
□ 共享记忆/知识库是否防污染?(AgentPoison 类)
□ 是否持续红队评测?(AgentDojo/ASB)
```

### 9.2 供 Agent 生成安全框架的元规则

1. **数据≠指令**:一切外部内容视为不可信数据
2. **隔离默认**:独立上下文、内存隔离、最小权限
3. **通信可信**:消息签名、加密认证、防篡改
4. **共识关键**:关键决策多代理共识验证
5. **审计闭环**:全链路日志 + 行为异常检测
6. **持续对抗**:红队评测随系统演进

---

## 10. 生态与资源

### 论文(编号已核实)
- [Morris II](https://arxiv.org/abs/2403.02817) ｜ [Prompt Infection](https://arxiv.org/abs/2410.07283) ｜ [AgentPoison](https://arxiv.org/abs/2407.12784)
- [MAST](https://arxiv.org/abs/2503.13657) ｜ [抗注入设计模式](https://arxiv.org/abs/2506.08837)
- [AgentDojo](https://arxiv.org/abs/2406.13352) ｜ [ASB](https://arxiv.org/abs/2410.02644)

### OWASP 官方
- [OWASP GenAI 官网](https://genai.owasp.org/)
- [OWASP Agentic Security Initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

### GitHub
- [AgentDojo](https://github.com/ethz-spylab/agentdojo)

---

## 11. 参考来源

- arXiv 论文(编号逐条核实并勘误:Morris II 为 2403.02817)
- OWASP 官方(Agentic AI 15 项威胁、Top 10 2026)
- 待核实项(2026-08-10 复核):OpenAI 治理白皮书 **已核实**(官方 URL openai.com/index/practices-for-governing-agentic-ai-systems,发布日 2023-12-14);Anthropic 多 agent 安全实践 **已核实**([multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system))
- 关联文档:[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md)、[Memory_Security_Wiki.md](Memory_Security_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md)

---

*本文档由 arXiv 一手论文(编号逐条核实并勘误)、OWASP 官方与 GitHub 高星仓库综合而成。标注:Morris II 正确编号为 arXiv:2403.02817;待核实项均已明确标注。*
