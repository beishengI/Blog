const n=`# LLM Wiki — 多智能体通信协议(Multi-Agent Communication Protocols)

> 面向 LLM Agent 的**多智能体通信协议**系统性知识库:从协议全景与分层(Agent↔工具 vs Agent↔Agent)、MCP/A2A/Handoffs 三大协议详解、消息传递与共享状态、对比互操作,到工程落地、安全考量与 2025-2026 最新进展(协议版本与标准化),沉淀为 Agent 可直接阅读、学习并用于协议选型与实现的一手资料。
>
> 定位:本文档是"Agent 上下文知识体系"的**协作通信层**——[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) §2.2 概要介绍通信模式,本文档纵深展开协议规范与工程落地。
>
> 版本:v1.0 ｜ 资料截至 2026-08 ｜ 来源:官方规范文档(MCP/A2A/OpenAI Agents SDK)、arXiv 论文(编号已核实)、GitHub 官方仓库(star 实时核实)

---

## 目录

1. [文档定位与 Agent 阅读指南](#1-文档定位与-agent-阅读指南)
2. [协议全景与分层](#2-协议全景与分层)
3. [MCP:Agent ↔ 工具](#3-mcpagent--工具)
4. [A2A:Agent ↔ Agent](#4-a2aagent--agent)
5. [Handoffs:框架内交接](#5-handoffs框架内交接)
6. [消息传递与共享状态](#6-消息传递与共享状态)
7. [协议对比与互操作](#7-协议对比与互操作)
8. [工程落地](#8-工程落地)
9. [安全考量](#9-安全考量)
10. [2025-2026 最新进展](#10-2025-2026-最新进展)
11. [为 Agent 生成的可执行框架](#11-为-agent-生成的可执行框架)
12. [生态与资源](#12-生态与资源)
13. [参考来源](#13-参考来源)

---

## 1. 文档定位与 Agent 阅读指南

### 1.1 本文档解决什么问题

多智能体协作的"接线方式"——Agent 如何接入工具、Agent 之间如何发现彼此并交换任务——是工程化的核心难题。本文档理清 MCP / A2A / Handoffs 三大协议的定位、机制、选型与互操作,避免"选错协议、重复造轮子"。

### 1.2 Agent 阅读本文档的推荐路径

\`\`\`text
目标:理解协议全景 → §2 分层 → §3-5 三协议 → §7 对比
目标:选型 → §7.3 决策树 → §11 检查清单
目标:实现 → §8 工程落地 → §9 安全
\`\`\`

### 1.3 一句话核心结论

> **MCP 给 Agent 手(工具),A2A 给 Agent 同事(协作),Handoffs 是框架内机制。** 三者正交:单 Agent 接工具选 MCP,跨组织 Agent 协作选 A2A,单运行时内编排用 handoffs。

---

## 2. 协议全景与分层

### 2.1 两个正交层次

| 层次 | 解决什么 | 模式 | 代表 |
|---|---|---|---|
| **Agent ↔ 工具** | 模型如何接入外部工具/数据 | host–server | MCP |
| **Agent ↔ Agent** | 异构 Agent 如何发现彼此、交换任务与结果 | client–remote agent 对等 | A2A |

### 2.2 关键原则

- **A2A 不共享内部状态、内存或工具实现**(官方规范的 Opaque Execution 原则)
- 边界:**MCP 管能力接入,A2A 管协作编排,Handoffs 是库内机制而非跨厂商协议**

---

## 3. MCP:Agent ↔ 工具

### 3.1 规范现状

- Anthropic 2024-11-25 开源(创作者 David Soria Parra、Justin Spahr-Summers)
- 版本线:2025-03-26 → 2025-06-18("生产就绪":结构化工具输出、OAuth 授权)→ 2025-11-25 → **2026-07-28(现行版)**
- **2026-07-28 最大重构**:协议改为**无状态**(移除 initialize 握手与会话头,请求通过 \`_meta\` 携带版本/能力)、新增 \`server/discover\`、\`subscriptions/listen\`、MRTR 多轮请求模式,tasks 移入官方扩展

### 3.2 三原语

| 原语 | 机制 |
|---|---|
| **Tools** | \`tools/list\`、\`tools/call\`,模型可控调用 |
| **Resources** | 只读数据/上下文,可订阅变更 |
| **Prompts** | 可复用提示模板 |

### 3.3 传输与认证

- **传输**:stdio(本地可信)+ Streamable HTTP(单端点 POST + 请求级 SSE 响应流);旧 HTTP+SSE 已废弃
- **认证**:OAuth 2.1 框架(RFC 8707 Resource Indicators 防令牌串用、PKCE、RFC 9207 \`iss\` 校验)

### 3.4 生态

- 官方注册表 \`registry.modelcontextprotocol.io\`(2025-09 预览)
- GitHub 官方组织 42 仓库、10 种语言官方 SDK;\`servers\` 约 89k★、\`python-sdk\` 约 23.8k★(2026-07-29 数据)
- 2025-12 捐赠 Linux Foundation 旗下 Agentic AI Foundation(AAIF)

---

## 4. A2A:Agent ↔ Agent

### 4.1 发布与治理

- 2025-04-09 Google Cloud Next 发布,首发 50+ 伙伴(SAP、ServiceNow、LangChain、MongoDB 等)
- 2025-06-23 捐赠 Linux Foundation(与 MCP 同归 AAIF 治理)

### 4.2 核心机制

| 概念 | 说明 |
|---|---|
| **Agent Card** | JSON 能力/端点/认证声明(well-known URI 为 \`agent-card.json\`) |
| **Task** | 有状态任务单元(Send Message/Get/List/Cancel/订阅) |
| **Message/Part/Artifact** | 模态无关内容交换 |
| **Streaming 与 Webhook** | 推送通知 |

### 4.3 传输与认证

- 规范分三层:proto 规范数据模型 → 抽象操作 → 协议绑定
- 绑定:JSON-RPC 2.0 over HTTP、gRPC、HTTP/REST
- 认证:OAuth 2.0(1.0 起移除 implicit/password,采用 device code/PKCE)与 mTLS
- 强调幂等性、异步长任务、HITL(人工介入)

### 4.4 2026 状态

> **v1.0.0 于 2026-03-12 发布,v1.0.1 于 2026-05-26**(GitHub Releases 核实)。

### 4.5 与 MCP 互补(官方立场)

> **MCP 强化单 Agent 的工具能力,A2A 打通 Agent 间协作,二者可叠加使用。**

---

## 5. Handoffs:框架内交接

### 5.1 Swarm → Agents SDK

- **Swarm**(2024 实验框架):仅两个核心概念 Agents + Handoffs
- **OpenAI Agents SDK**(2025-03-11 发布):生产级继承者
  - 核心原语:Agents、**Handoffs / Agents-as-tools**(智能交接控制权)、Guardrails(输入/输出校验)
  - 另有 Sessions(跨轮持久内存)、Tracing、内置 MCP server 工具调用支持

### 5.2 与协议的本质区别

\`\`\`text
Handoffs = 进程内函数级机制(一个运行时内把控制权交给另一 agent)
  无 Agent Card 发现、无跨厂商认证、无网络传输绑定
  → 不是跨组织协议
\`\`\`

---

## 6. 消息传递与共享状态

| 模式 | 机制 | 代表 |
|---|---|---|
| **群聊/共享消息** | 多 Agent 共享消息流 + 发言人选择机制 | AutoGen GroupChat([arXiv:2308.08155](https://arxiv.org/abs/2308.08155)) |
| **黑板(blackboard)** | 共享工作区/任务板 | 框架内实现(协议未内置) |
| **拓扑** | 层级(manager/worker)vs 扁平(handoffs) | OpenAI 官方选型指南 |

> 上述均为**库内编排机制**,与 MCP/A2A 的跨边界标准正交。

---

## 7. 协议对比与互操作

### 7.1 对比表

| 维度 | MCP | A2A | Handoffs(Agents SDK) |
|---|---|---|---|
| 层次 | Agent↔工具/数据 | Agent↔Agent | 进程内 Agent↔Agent |
| 发起方 | Anthropic | Google(现 LF) | OpenAI |
| 核心抽象 | Tools/Resources/Prompts | Agent Card/Task/Message | Agent/Handoff/Guardrail |
| 传输 | stdio、Streamable HTTP | JSON-RPC/gRPC/REST over HTTP | 库内函数调用 |
| 认证 | OAuth 2.1 框架 | OAuth 2.0/mTLS | 不适用(同进程) |
| 发现机制 | 无(客户端直连) | Agent Card 能力发现 | 无 |
| 2026 状态 | 2026-07-28 规范 | v1.0.x | 活跃迭代 |

### 7.2 MCP + A2A 组合(2025-2026 主流实践)

\`\`\`text
A2A 负责 Agent 间任务协作(协作层)
  ↓
各 Agent 内部用 MCP 接入工具(能力层)
\`\`\`

> 形成"协作层 + 能力层"协议栈;**AAIF 实为 Agentic AI Foundation(智能体 AI 基金会,2025-12 由 Block/Anthropic/OpenAI 等发起、Linux 基金会托管),并非"MCP+A2A 融合草案"**(已联网核实,原描述有误)。

### 7.3 选型决策树

\`\`\`text
需求?
├─ 单 Agent 接工具 → MCP
├─ 多厂商/跨组织 Agent 协作 → A2A
├─ 单运行时内多 Agent 编排 → SDK 内 handoffs 即可
└─ 复杂系统 → A2A(协作层)+ MCP(能力层)组合
\`\`\`

---

## 8. 工程落地

### 8.1 连接模型

- **MCP**:client 发请求、server 回复(server 不主动发起 JSON-RPC 请求)
- **A2A**:双向对等(双方都是 client+server)

### 8.2 连接管理

- stdio:子进程生命周期管理(进程不是会话边界,2026 规范明确请求可交叉)
- HTTP:按请求独立;长活请求(订阅/流式)作用域为单请求

### 8.3 错误处理与重试

- **MCP**:JSON-RPC 错误码分区(-32020~-32099 规范保留)、MRTR 重试语义(新请求 ID)
- **A2A**:操作幂等、错误类型化(TaskNotFound、UnsupportedOperation 等)、流中断后重新发起

### 8.4 认证授权

- **MCP**:客户端必须实现 RFC 8707,每次请求带 Bearer;scope 遵循最小权限 + 增量授权(step-up)
- **A2A**:1.0 只保留现代 OAuth 流并支持 mTLS

---

## 9. 安全考量

### 9.1 提示注入

- **MCP 场景**:恶意/受损 server 可通过工具描述注入控制模型
- 论文 [arXiv:2503.23278](https://arxiv.org/abs/2503.23278)(编号已核实):MCP 全生命周期(创建/部署/运行/维护 4 阶段 16 项活动)、4 类攻击者、16 类威胁场景
- MCP 官方 2025-06-18 起提供 security_best_practices 指南

### 9.2 Agent 间指令注入

- A2A 消息内容是自由文本,接收方 Agent 需把消息视为**不可信输入**
- 官方规范要求安全协作(认证/授权 + 内容边界)

### 9.3 信任边界与隔离

| 原则 | 说明 |
|---|---|
| stdio 本地信任 vs HTTP 远程不信任 | 按传输区分信任级别 |
| 凭据按 issuer 绑定 | 不得跨授权服务器复用 |
| 工具注解视为不可信 | 不因"官方工具"放松检查 |
| 最小权限 scope + HITL | 人工确认环 |

> 呼应 [Memory_Security_Wiki.md](Memory_Security_Wiki.md) 与 [Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md):多 Agent 间共享上下文是注入放大面,需隔离(每 Agent 独立内存 + 显式句柄)。

---

## 10. 2025-2026 最新进展

| 进展 | 内容 |
|---|---|
| **A2A 进入 1.0** | v0.3.0(2025-07-30)加 mTLS 与 agent-card.json;v1.0.0(2026-03-12)规范化 OAuth 与任务 API;v1.0.1(2026-05-26)修正错误码 |
| **MCP 无状态化重构** | 2026-07-28:利于大规模部署与水平扩展;tasks 独立为官方扩展;引入 conformance 一致性测试与 feature lifecycle 治理 |
| **标准化统一** | MCP(2025-12)与 A2A(2025-06)先后归入 **Linux Foundation(AAIF)** 治理,OpenAI/Google/Microsoft/AWS/Anthropic 共同参与 |
| **生态数字** | 官方 SDK 月下载量约 **9700 万次**(2026 年中,行业转述,已联网核实);"1.1 亿"上限与"20 万+ skills"未检索到可靠来源(待核实) |
| **Deep Research 类产品** | OpenAI Deep Research 主要依赖厂商内置工具链(是否强制依赖 MCP 无官方说明,**待核实**);Anthropic 产品线是 MCP 官方主要采用者 |

---

## 11. 为 Agent 生成的可执行框架

### 11.1 协议选型检查清单

\`\`\`markdown
## 协议选型自查
□ 需求是接工具还是 Agent 间协作?
   (接工具 → MCP;跨组织协作 → A2A;同进程编排 → handoffs)
□ 是否需要跨厂商互操作?(是 → 标准协议;否 → 框架内机制)
□ 是否需要 Agent 发现机制?(是 → A2A Agent Card)
□ 消息内容是否来自不可信来源?(是 → 按不可信输入处理)
□ 是否处理了幂等与重试?(异步长任务必需)
□ 是否遵循最小权限认证?(RFC 8707 / OAuth 2.1 或 mTLS)
□ 是否知道当前协议版本?(MCP 2026-07-28 / A2A v1.0.x)
\`\`\`

### 11.2 供 Agent 生成通信框架的元规则

1. **先分层再选型**:分清"接工具"与"Agent 协作"两个层次
2. **标准优先**:跨边界一律用标准协议,别自造协议
3. **不可信输入**:Agent 间消息与工具返回都视为不可信,隔离处理
4. **幂等设计**:异步任务必须可重试、可取消、可查询状态
5. **版本敏感**:协议演进快(如 MCP 无状态化重构),实现前核对现行版本
6. **认证最小化**:最小权限 scope + 增量授权 + HITL

---

## 12. 生态与资源

### 官方规范(一手)
- [MCP 规范(2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/changelog) ｜ [基础协议](https://modelcontextprotocol.io/specification/2026-07-28/basic/index) ｜ [传输](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) ｜ [授权](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [A2A 规范 v1.0](https://a2a-protocol.org/latest/specification/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [MCP 发布公告](https://www.anthropic.com/news/model-context-protocol)
- [OpenAI 2025-03-11 公告(Agents SDK)](https://openai.com/index/new-tools-for-building-agents/)

### GitHub
- [MCP 官方组织](https://github.com/modelcontextprotocol)(42 仓库、10 语言 SDK)
- [A2A Releases](https://github.com/a2aproject/A2A/releases)

### 论文(编号已核实)
- [AutoGen](https://arxiv.org/abs/2308.08155)(arXiv:2308.08155)
- [MCP Landscape/Security](https://arxiv.org/abs/2503.23278)(arXiv:2503.23278;⚠️ 网上流传的 2506.08138 为无关论文)

---

## 13. 参考来源

- MCP 官方规范(2026-07-28 现行版)与 changelog(版本线逐一核实)
- A2A 官方规范 v1.0 与 GitHub Releases(v1.0.0=2026-03-12、v1.0.1=2026-05-26)
- OpenAI Agents SDK 官方文档与 2025-03-11 公告
- arXiv 论文(编号逐条核实;剔除 2506.08138、2501.03568 两个错误流传编号)
- 待核实项(2026-08-10 复核):SDK 下载量 **已核实**(约 9700 万/月,2026 年中转述);A2A 采用规模 **已核实**(Linux Foundation 2026-04:150+ 组织支持);ARD 规范 **已核实**(Agentic Resource Discovery,谷歌联合多厂商开放规范,非"Agentic Reasoning and Dialogue");AAIF **已核实**(Agentic AI Foundation 基金会,非"MCP+A2A 融合草案")
- 关联文档:[Multi_Agent_Design_Wiki.md](Multi_Agent_Design_Wiki.md) §2.2、[Memory_Security_Wiki.md](Memory_Security_Wiki.md)、[Agent_Observability_Security_Wiki.md](Agent_Observability_Security_Wiki.md)

---

*本文档由官方规范文档(MCP/A2A/OpenAI Agents SDK)、arXiv 论文(编号逐条核实)与 GitHub 官方仓库综合而成。标注:协议版本以官方页面为准(网络上大量旧版信息待核对);错误流传编号已剔除;生态数字与 AAIF 融合草案待核实。*
`;export{n as default};
