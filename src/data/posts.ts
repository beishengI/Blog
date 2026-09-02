export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  readingTime: number;
  aiSummary: string;
  terms: string[];
  content: string;
  cover?: string; // 可内嵌封面图；为空则按主题色自动生成
  draft?: boolean; // true=草稿；undefined/false=已发布
  updatedAt?: string; // YYYY-MM-DD
  description?: string; // SEO 描述，缺省回退 excerpt
  keywords?: string[]; // SEO 关键词
}

export const posts: Post[] = [
  {
    id: 'contract-preaudit-agent',
    title: '合同预审智能体:Dify 抽取 + 纯规则判定的确定性设计',
    excerpt: '三单人工比对慢且易漏判?把判定权从 LLM 手里收回,用 52 个算子的规则引擎兜底,让结论确定、可复现、可审计。',
    category: '工程',
    tags: ['Agent', 'Dify', '规则引擎', 'Spring Boot', 'LLM'],
    date: '2026-09-02',
    readingTime: 11,
    aiSummary: '面向某国企的合同预审智能体:LLM 只做抽取与对齐,判定交给 52 算子纯 Java 规则引擎,配合三道防幻觉护栏与对抗测试,判定确定性 100%、核心字段准确率 84%。',
    terms: ['Dify', '规则引擎', '四级判定', '溯源锚定', 'SSE'],
    content: `## 痛点:三单人工比对

合同预审要核对**谈判记录、技术协议、合同草案**三份材料:金额、税率、付款周期、违约条款……人工逐条比对既慢又容易漏判。LLM 看起来天然适合,但让模型直接下判定有个致命问题:**同一份合同两次审查,结论可能不同**。预审要的不是"看起来聪明",而是确定与可复现。

## 三层架构:LLM 负责理解,规则负责判定

\`\`\`text
三单上传 → Dify Workflow#1 字段抽取 → Dify Workflow#2 语义对齐 → Java 规则引擎 → 四级判定报告
             (PDFBox / POI 落库)      (同义词归一)          (不调 LLM)
\`\`\`

核心设计决策:**规则层零 LLM 调用**。字段抽取和语义对齐交给 Dify 编排(对齐层把"Lexar↔雷克沙"这类异名归一),比对判定由纯 Java 执行——同输入必同输出,判定确定性 100%,每条结论都能回指原文位置。

数据落地为 7 张业务表:session / entity / field_match / diff / report / oplog / message;字段池与同义词不建表,进 system_dict_data 字典。

## 规则体系:配置 / 策略 / DSL 三级

- **L1 策略**:5 种比对策略构成 mode→策略注册表(Spring 启动时自动收集 CompareStrategy Bean)。金额差异率用 BigDecimal 严格大于语义——恰等于预警阈值判 OK、恰等于阻断阈值判 WARN,避免边界抖动;文本相似度(阈值 0.85)比对前先剥离合同模板附加句,防止套话触发误报。
- **L2 DSL**:52 个算子(49 业务 + and/or/not)+ 20 个 DSL 模板,支持中文大写金额解析、税费四元组勾稽、分项逐行比对;算子也是 Spring Bean,由 OperatorRegistry 自动注册。
- **L0 配置**:阈值全部存字典,规则配置三级回退(本类型 → generic → 内置默认),非法配置直接拒绝加载。

判定编码为四级:**OK / WARN / BLOCK / MISSING**。"无、未提及"这类伪空值要专门拦截,否则文本相似度会把两份"都没写"的字段判成 WARN。

## 防幻觉:三道护栏

1. **溯源锚定**:抽取值归一后必须在 doc_text 中锚定到原文,锚不住置 null 标 UNTRACED;中文大写金额必须找到中文形式
2. **置信度门**:对齐 confidence < 0.3 强制置 null
3. **结构保真**:PDF 表格行归一化,防止把表格读串行

Dify 侧同样加码:code 节点 \`_parse_partial\` 在整体 JSON 坏掉时按括号配对逐字段恢复,提示词写明四条防编造纪律。

## 工程化:状态机、SSE、追问

- 审查状态机 PENDING → EXTRACTING → ALIGNING → JUDGING → ASSEMBLING → DONE / FAILED,线程池异步执行 + SSE 推进度;**订阅建立时先补发 DB 快照**,修复"首事件早于订阅"丢进度的坑
- 报告版本化:session 持 current_report_id,历史报告不可变;多轮追问走 Dify Chatflow,Dify 断联时后端确定性答案兜底(LOCAL_FALLBACK)
- 宿主 AI 模块统一加 Redis 令牌桶限流(@AiRateLimit,SSE 5 QPS/用户)

## 用对抗测试换质量

272 个单测全绿只是底线。六批对抗测试(幻觉 / 溯源 / 规则 / 降级)跑 36 件语料 + 12 份金标准:核心字段判定准确率 **84%**,判定确定性 100%,幻觉率约 9.8%(均被护栏置 null 降级为 MISSING)。最值钱的产出是把"模型会编"变成可量化、可回归的工程指标。

> 经验:LLM 应用的可信度不来自更大的模型,而来自把"判定权"从模型手里收回来的那条架构边界。`,
  },
  {
    id: 'jiayu-lowcode-migration',
    title: '从 PHP 单体到低代码平台:出租车公司系统的迁移实战',
    excerpt: '3594 个文件的遗留系统迁到 JeeLowCode:三库架构、四种增强机制、219 秒冷启动,以及一套让 AI Agent 不写歪的硬约束。',
    category: '工程',
    tags: ['低代码', 'JeeLowCode', 'Spring Boot', 'Vue3', 'AI 治理'],
    date: '2026-09-02',
    readingTime: 10,
    aiSummary: '出租车公司系统从 PHP Webman + Vue2 迁移到 JeeLowCode 低代码:三库架构分离业务与配置,四种增强机制收敛差异,219 秒冷启动等真实代价,以及 AI Agent 交付治理与安全审计的完整实践。',
    terms: ['JeeLowCode', '低代码', 'dbform', '增强机制', '治理门禁'],
    content: `## 遗留系统:3594 个文件的单体

十堰某出租车公司的运营平台:车辆、驾驶员、安全、质量、财务(12 个子表单)、报表中心等 9 大模块,遗留栈是 PHP Webman + Vue 2(3594 个 PHP 文件)。老系统停迭代,整体迁移到 JeeLowCode 低代码平台(Spring Boot 3.3.1 + Vue 3 + Element Plus)。

## 三库架构:业务与平台配置分离

- **master**:92 张业务表 + 菜单字典
- **jeelowcode**:平台配置库(175 个 dbform 表单定义)
- **slave**(懒加载):日志库

低代码的核心抽象是"表即配置":dbform 定义字段、查询、按钮,运行时由框架统一渲染,不写 CRUD 代码。

## 四种增强机制:配置与代码的边界

平台总有配置不出来的地方,JeeLowCode 给了四种逃逸口,我们全部用满:

1. **Java 增强**(BeforeAdvicePlugin 切面,20 个类):典型如"雷锋车队列表只看本队"——前端 query_default_val 只影响 UI,后端必须在列表查询前注入 \`in_fleet=1\` 过滤,这就是"配置 vs 代码"的边界样本
2. **JS 增强**(219 个):页面级行为,坑最多的地方
3. SQL 增强 / 4. 接口增强

JS 增强的反直觉陷阱清单:必须返回 \`{ initOption(){} }\` 结构;js_json 不以换行开头会触发 **ASI 静默失败**(整段脚本不执行且无报错);禁 forEach 用 for...of;SQL 增强改完必须调 delete 接口清静态缓存——只把 active_status 改成 N 无效。

## 规模与代价

配置规模实测:dbform 175 / enhance_js 219 / summary 2403,自定义 Controller 12 个、前端自定义页 20 个。代价也要认:Spring Boot 全量初始化**冷启动 219.86 秒**(来自真实启动日志),systemd 的 TimeoutStartSec 被迫放宽到 600。

## 部署:无 Docker 的传统方案

生产是 Ubuntu 22.04(4C7G),Nginx 1.18 反代:SPA 走 try_files,\`/admin-api/\` 转 127.0.0.1:48080。服务器没有 java——JDK 17 直接离线打进 deploy/jdk/,install.sh 支持 prepare / deploy / start / cutover / rollback 五步。低代码平台 + 传统 systemd 部署,反而比容器化更适合内网生产环境。

## AI Agent 交付的治理

这个项目由 AI Agent 按治理流程开发交付:AGENTS.md 作为单一事实源、92 条硬约束、52 项运行时陷阱 SQL Checklist、四道交付门禁(9 Tab 与物理表 schema 一致性、文档同步、内容防腐、只读强约束)、双代理他评 + 自修复上限 3 轮,外加"自评不可靠"铁律。

治理的直接收益是安全审计:六维门禁扫出 \`/app-api/**\` 零 handler 却被 permitAll(一行 yaml 修复)、171/175 张表登录即可增删改查、省略 pageSize 即全量返回(实测一次拉走 2282 行)。**低代码默认值的便利,往往就是安全的漏点。**

> 经验:低代码迁移的本质不是"少写代码",而是把业务差异收敛到平台允许的逃逸口;AI 写码的生产力,靠治理流程而不是模型能力兜底。`,
  },
  {
    id: 'cnn-ct-segmentation',
    title: '用 U-Net 做肺部 CT 图像分割：从数据到部署',
    excerpt: '梳理医学影像分割的标注规范、数据增强策略，以及如何在有限算力下训练一个可用的 U-Net。',
    category: '医学影像',
    tags: ['深度学习', '分割', 'PyTorch', '医学影像'],
    date: '2026-08-21',
    readingTime: 9,
    aiSummary: '本文给出在 LIDC 子集上训练轻量 U-Net 的端到端流程，核心结论：小数据集下，规范标注 + 强数据增强 + 轻量结构优于堆参数。',
    terms: ['U-Net', 'Dice', '数据增强', 'HU 窗宽'],
    content: `## 背景

肺部 CT 分割是计算机辅助诊断的重要环节。本文记录一个**轻量 U-Net** 从标注到推理的完整流程。

## 数据准备

- 使用 LIDC-IDRI 子集，约 1200 张切片
- 标注遵循 ITK-SNAP 的半自动轮廓校正
- 像素值裁剪到 [-1000, 400] HU 区间

\`\`\`python
import torch
from monai.networks.nets import UNet

model = UNet(
    spatial_dims=2,
    in_channels=1,
    out_channels=2,
    channels=(16, 32, 64, 128),
    strides=(2, 2, 2),
).to("cuda")
\`\`\`

## 训练策略

> 医学数据少，数据增强比模型复杂度更重要。

采用随机旋转、弹性形变、亮度抖动，验证集 Dice 达到 **0.91**。

## 小结

小数据集下，规范标注 + 强增强 + 轻量结构，往往优于堆参数。`,
  },
  {
    id: 'gradcam-interpretability',
    title: '可解释性实战：用 Grad-CAM 让模型「说清」它在看哪',
    excerpt: '临床医生不信任黑盒。Grad-CAM 是建立信任的最低成本一步。',
    category: '可解释性',
    tags: ['深度学习', '可解释性', 'Grad-CAM', '可视化'],
    date: '2026-08-14',
    readingTime: 7,
    aiSummary: 'Grad-CAM 通过反向传播得到类别相关热力图，是建立临床信任的最低成本一步，但热力图≠因果，仅说明模型使用了哪片区域。',
    terms: ['Grad-CAM', '可解释性', '反向传播'],
    content: `## 为什么需要可解释性

医学场景里，**模型不仅要准，还要可信**。Grad-CAM 通过反向传播得到类别相关热力图。

## 实现要点

\`\`\`python
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

cam = GradCAM(model=model, target_layers=[model.layer4[-1]])
grayscale = cam(input_tensor, targets=[ClassifierOutputTarget(1)])
\`\`\`

## 注意

热力图≠因果。它只能说明「模型用了哪片区域」，不能证明「那是正确的依据」。`,
  },
  {
    id: 'rag-clinical-qa',
    title: '构建临床知识库问答：RAG 而非微调',
    excerpt: '为什么在医学问答上，检索增强比直接微调更稳妥、更易更新。',
    category: 'NLP',
    tags: ['RAG', 'LLM', '检索增强'],
    date: '2026-08-03',
    readingTime: 8,
    aiSummary: '对比微调与 RAG：医学问答中 RAG 更新成本低、幻觉可控、天然保留引用，更适合知识频繁更新场景。',
    terms: ['RAG', '检索增强', '向量库'],
    content: `## 微调 vs RAG

| 方式 | 更新成本 | 幻觉可控 | 适合场景 |
| --- | --- | --- | --- |
| 微调 | 高 | 低 | 风格定制 |
| RAG | 低 | 高 | 知识频繁更新 |

## 流程

1. 文档切分 + 向量化（BGE-M3）
2. 检索 Top-K
3. 拼接上下文送 LLM 生成

> 医学内容必须可溯源，RAG 天然保留引用片段。`,
  },
  {
    id: 'deploy-fastapi',
    title: '把模型做成 API：FastAPI + ONNX 推理服务',
    excerpt: '从 \`.pth\` 到可调用接口，记录一次生产化改造。',
    category: '工程',
    tags: ['深度学习', '部署', 'FastAPI', 'ONNX'],
    date: '2026-07-22',
    readingTime: 6,
    aiSummary: '将 PyTorch 模型转为 ONNX 后用 ONNX Runtime 提供服务，可减少依赖并提速；注意请求限制与模型常驻加载。',
    terms: ['ONNX', 'FastAPI', '推理服务'],
    content: `## 为什么转 ONNX

PyTorch 直接推理依赖运行时较重，转 ONNX 后可用 ONNX Runtime 提速并减少依赖。

\`\`\`python
@app.post("/predict")
async def predict(img: UploadFile):
    arr = preprocess(await img.read())
    out = session.run(None, {"input": arr})
    return {"mask": out[0].tolist()}
\`\`\`

## 部署注意

- 加请求大小限制与超时
- 模型加载放在启动时，避免每请求重载`,
  },
  {
    id: 'study-notes-ml',
    title: '大四实习笔记：医院影像科的 AI 落地观察',
    excerpt: '一线视角看 AI 工具如何真正进入 workflow，以及阻力来自哪里。',
    category: '随笔',
    tags: ['实习', '行业观察'],
    date: '2026-07-10',
    readingTime: 5,
    aiSummary: '一线观察：医生接受度取决于 AI 是否减少其工作而非增加；落地三前提是集成进 PACS、可一键复核、责任边界清晰。',
    terms: ['临床工作流', '落地', '责任边界'],
    content: `## 观察

医生对 AI 的接受度，取决于**它是否少干活而不是多干活**。

## 三个落地前提

1. 集成进 PACS，不增加额外点击
2. 结果可一键复核
3. 误诊责任边界清晰

技术只是门槛，工程与流程才是护城河。`,
  },
];
