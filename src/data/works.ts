/**
 * 作品/项目数据：7 个工程项目 + 本站元案例。
 *
 * 文案原则：
 * - 只写简历 PDF、README、设计文档或代码里能查到的事实。
 * - 查不到的写 `pending: true` / 「待补充」，不编造。
 * - 客户项目在公开页使用「某制造企业 / 某出行运营企业 / 某能源国企」等代称；
 *   截图只使用已裁剪脱敏或示意图。
 */

export type WorkStatus = 'live' | 'iterating' | 'archived';
export type WorkLayer = 'agent' | 'model' | 'service' | 'system' | 'delivery' | 'meta';
export type WorkKind = 'project' | 'meta';

export type ReplayEvent =
  | { kind: 'user'; text: string }
  | { kind: 'tool'; name: string; args: string; ms: number }
  | { kind: 'result'; text: string }
  | { kind: 'answer'; text: string };

export interface WorkMetric {
  value: string;
  label: string;
  source?: string;
  pending?: boolean;
}

export interface WorkEvidence {
  kind: 'image' | 'diagram' | 'code' | 'replay' | 'metric' | 'link';
  src?: string;
  caption?: string;
  pending?: boolean;
  redacted?: boolean;
}

export interface WorkLink {
  label: string;
  url: string;
  internal?: boolean;
  private?: boolean;
}

export interface Work {
  slug: string;
  no: string;
  title: string;
  shortTitle?: string;
  tagline: string;
  kind: WorkKind;
  layer: WorkLayer;
  status: WorkStatus;
  period: string;
  /** 兼容旧页面 */
  date: string;
  role: string;
  why: string;
  solution: string;
  stack: string[];
  metrics: WorkMetric[];
  evidence: WorkEvidence[];
  replay?: { title: string; events: ReplayEvent[] };
  decisions: { title: string; body: string }[];
  tradeoffs: string;
  relatedWiki: string[];
  relatedPosts: string[];
  links: WorkLink[];
  privacy: 'public' | 'redacted' | 'diagram-only';
  sourceRefs: string[];
  repoNote?: string;
}

export const works: Work[] = [
  {
    slug: 'contract-agent',
    no: 'P-01',
    title: '合同预审智能体',
    shortTitle: '合同预审',
    tagline: '让大模型只负责看懂合同，判定交给纯规则引擎——确定性 100%。',
    kind: 'project',
    layer: 'agent',
    status: 'live',
    period: '2026.06 – 2026.07',
    date: '2026',
    role: '独立负责设计 → 开发 → 生产对接（7 周）',
    why:
      '某国企的合同「三单比对」长期靠人工逐条核对，量大、漏判风险高。合同判定是高风险场景：大模型可以负责抽取与语义对齐，但「判定」一步不能交给概率——否则审计问「为什么判 BLOCK」时，只能回答「模型觉得」。',
    solution:
      '三层架构：Dify 工作流负责字段抽取，语义层负责合同/招标/中标三方对齐，纯 Java 规则引擎产出四级判定（OK / WARN / BLOCK / MISSING）。判定与解释分离：OpenAI 流式对话只回答「为什么」，不改判定表。低置信度字段不进判定链，转人工复核；SSE 推送长任务进度，报告版本化保留审计链。',
    stack: ['Spring Boot 3', 'Vue3', 'TypeScript', 'Dify', 'MySQL / Redis', 'OpenAI API', 'SSE'],
    metrics: [
      { value: '100%', label: '判定确定性', source: '简历 PDF' },
      { value: '30–90s', label: '端到端三单预审', source: '简历 PDF' },
      { value: '<100ms', label: '单字段判定', source: '简历 PDF' },
      { value: '84.0%', label: '核心字段准确率（50 份真实合同）', source: '简历 PDF' },
      { value: '9.8%→0', label: '字段编造率', source: '简历 PDF' },
      { value: '354', label: '单测 / 45 个测试类', source: '简历 PDF' },
    ],
    evidence: [
      {
        kind: 'image',
        src: '/showcase/projects/contract-report.jpg',
        caption: '合同预审报告 · 设计稿（无客户数据）',
        redacted: false,
      },
      {
        kind: 'diagram',
        caption: 'Dify 抽取 → 语义对齐 → 纯 Java 规则引擎（5 种规则模式）',
      },
      {
        kind: 'code',
        caption: '规则 DSL：52+ 算子 / 20 模板 / 21 配置接口；新增合同类型零代码',
      },
    ],
    replay: {
      title: '一次「三单比对」的运行回放（预录示意）',
      events: [
        { kind: 'user', text: '上传《设备采购合同.docx》，指定比对基准：招标文件 + 中标通知书' },
        { kind: 'tool', name: 'extract_fields', args: 'Dify 抽取 · 匹配合同模板 → 结构化字段', ms: 4200 },
        { kind: 'result', text: '抽取 42 个字段；2 个置信度低于阈值，自动转人工复核' },
        { kind: 'tool', name: 'align_semantics', args: '语义对齐：合同字段 ↔ 招标条款 ↔ 中标条款', ms: 2600 },
        { kind: 'tool', name: 'rule_engine', args: '纯 Java 规则引擎 · 模式=金额与期限一致性', ms: 180 },
        { kind: 'result', text: 'BLOCK ×1（付款期限冲突） · WARN ×2 · OK ×39' },
        { kind: 'answer', text: '生成判定报告 v1，附 BLOCK 条款原文定位；可追问「为什么这条是 BLOCK」，解释走流式对话，判定不变。' },
      ],
    },
    decisions: [
      {
        title: '判定层为什么坚决不用大模型',
        body:
          '抽取和语义对齐用 Dify，OK/WARN/BLOCK 由纯 Java 规则引擎产出。审计问「为什么判 BLOCK」时，答案是一条规则加一个字段值，而不是「模型觉得」。确定性是这份报告能被采信的资格。',
      },
      {
        title: '低置信度字段的去向',
        body:
          '抽取置信度低于阈值的字段不进判定引擎，标记转人工复核。错误的「OK」比缺失更危险。',
      },
      {
        title: '判定与解释分离',
        body:
          'OpenAI 流式对话只回答「为什么」，不改动判定结果。对话被注入或被诱导，最多得到一段错误解释，判定表纹丝不动。',
      },
      {
        title: '报告版本化 + 多轮追问',
        body:
          '每轮预审生成新版本，旧版本不覆盖。法务的真实工作流是反复改合同再审，版本链就是审计线索，SSE 让长任务可等待。',
      },
    ],
    tradeoffs:
      '没做：自动改合同建议条款（判定归判定，代笔归法务）；没做多模型路由（单一抽取模型 + 阈值兜底已够，路由引入的不确定性大于收益）；没把规则引擎做成可视化拖拽（模板 6 类封顶，代码即配置更好审）。',
    relatedWiki: [
      'Agent_Architecture_Wiki',
      'AI_Coding_Quality_Gate_Wiki',
      'Agent_Observability_Security_Wiki',
      'Hallucination_Governance_Wiki',
      'Domain_Deployment_Wiki',
    ],
    relatedPosts: ['contract-preaudit-agent'],
    links: [],
    privacy: 'redacted',
    sourceRefs: ['简历 PDF', 'jzsy-ai/AGENTS.md', 'contract_pre_agent/CODE_WIKI.md', '合同预审报告 mockup'],
    repoNote: '客户项目，私有仓库；可面试时演示流程',
  },
  {
    slug: 'lite-mamba',
    no: 'P-02',
    title: 'Lite-Mamba 医学影像分割与可视化平台',
    shortTitle: 'Lite-Mamba',
    tagline: '自己上 HPC 训练分割模型，再把 16 组对照实验和在线推理做成一个平台。',
    kind: 'project',
    layer: 'model',
    status: 'live',
    period: '2026',
    date: '2026',
    role: '独立：模型训练、对照实验、可视化平台全栈',
    why:
      '医学影像分割的论文很多，但「模型小了 84%，精度掉了多少、快了多少」这类问题只能靠自己跑对照实验回答。做完模型后发现结果对比、切片浏览、报告导出散在脚本里，于是把整条链路包成可视化系统。',
    solution:
      '在 A800 80GB HPC 集群（Slurm + Apptainer）训练 Lite-Mamba w=0.75，记录 16 组对照实验的参数量、FLOPs、Dice、HD95。平台用 FastAPI + Vue3 + ECharts：E001–E016 指标对比、三视图逐切片浏览、GT 叠加、.nii.gz 在线推理、CSV / LaTeX / Markdown / PDF 四类报告导出，Docker Compose + Nginx 一键部署。',
    stack: ['PyTorch', 'MONAI', 'FastAPI', 'Vue3', 'TypeScript', 'ECharts', 'Docker / Nginx'],
    metrics: [
      { value: '−83.9%', label: '参数量（67.7M → 10.9M）', source: '简历 PDF' },
      { value: '−86.5%', label: '计算量', source: '简历 PDF' },
      { value: '0.879', label: 'Dice（仅降 0.97pt）', source: '简历 PDF' },
      { value: '4.73', label: 'HD95（基线 4.92）', source: '简历 PDF' },
      { value: '1251', label: '例 4 模态 MRI（BraTS2023）', source: '简历 PDF' },
      { value: '16', label: '组对照实验', source: '简历 PDF' },
    ],
    evidence: [
      {
        kind: 'image',
        src: '/showcase/projects/lite-mamba.webp',
        caption: 'BraTS2023：Image / Prediction / Ground Truth（公开数据集）',
        redacted: false,
      },
      { kind: 'diagram', caption: '训练 → 16 组对照 → 在线推理 → 四类报告导出' },
      { kind: 'link', caption: 'GitHub：Lite-Mamba-Visualization' },
    ],
    replay: {
      title: '一次在线推理的回放（预录示意）',
      events: [
        { kind: 'user', text: '上传 case_0412.nii.gz，选择 checkpoint：E009' },
        { kind: 'tool', name: 'preprocess', args: '4 模态配准检查 → 重采样 → 归一化', ms: 3100 },
        { kind: 'tool', name: 'infer', args: 'Lite-Mamba E009 · 3D 滑窗推理（GPU）', ms: 2400 },
        { kind: 'result', text: '分割完成：增强肿瘤 / 瘤周水肿 / 坏死；前背景占比已校验' },
        { kind: 'answer', text: '轴位 / 冠状 / 矢状三视图渲染完毕，可拖动切片；指标与可视化报告可四类格式一键导出。' },
      ],
    },
    decisions: [
      {
        title: '先在集群把账算清，再谈「轻量」',
        body:
          '16 组对照实验各自记录配置与指标。「轻量」的说法全部由参数量、FLOPs、Dice、HD95 四个数字背书；HD95 反优于基线这件事只有对照实验说得出。',
      },
      {
        title: '平台的第一用户是几周后的自己',
        body:
          'E001–E016 指标对比页不是给别人看的演示，是自己回看实验时真的要用。对比维度、切片联动、导出格式全按「重跑实验时希望有什么」设计。',
      },
      {
        title: '在线推理走 FastAPI 而不是 Jupyter',
        body:
          '上传即推理、结果即报告。可分享性来自部署形态：一台机器 Docker + Nginx 起来，合作者打开浏览器就能用。',
      },
    ],
    tradeoffs:
      '没做：分布式训练（单卡任务规模够，复杂度不值得）；没做用户体系与权限（校内协作场景，反而拖慢使用）；没追最新 SOTA（目标是「轻量且够用」，不是榜单名次）。',
    relatedWiki: ['Eval_Infrastructure_Wiki', 'Research_Agent_Workflow_Wiki'],
    relatedPosts: ['cnn-ct-segmentation', 'gradcam-interpretability'],
    links: [
      { label: 'GitHub · Lite-Mamba-Visualization', url: 'https://github.com/beishengI/Lite-Mamba-Visualization' },
    ],
    privacy: 'public',
    sourceRefs: ['简历 PDF', 'Lite_Mamba/可视化系统/README.md', 'results_v2.md', 'vis_png 三联图'],
  },
  {
    slug: 'qwen3-inference',
    no: 'P-03',
    title: 'Qwen3 在线推理服务',
    shortTitle: 'Qwen3 服务',
    tagline: '把一个 32B 模型供成稳定在线的 API，每个请求的首字时延都有据可查。',
    kind: 'project',
    layer: 'service',
    status: 'iterating',
    period: '2026',
    date: '2026',
    role: '独立：部署、接口封装、性能遥测、异构硬件适配',
    why:
      '模型跑通 notebook 和「别人能稳定调用」之间隔着整个工程：显存、流式、遥测、长稳。这个项目就是把 Qwen3-VL-32B 从「我能跑」推到「服务在跑」，并且把性能瓶颈定位做成基础设施而不是玄学。',
    solution:
      '单卡 A800 80GB 以 bfloat16 部署 Qwen3-VL-32B 与 BGE-M3，FastAPI 封装 OpenAI 兼容 API，TextIteratorStreamer 实现逐 token SSE。自研 PerformanceMonitor 逐请求记录时延 / token / GPU 利用率 / 显存并落盘 JSONL；tmux 会话 + SSH 反向隧道 + 自愈脚本保障长稳；在 H800 与昇腾 910B 上完成量化与加速适配。',
    stack: ['Qwen3-VL-32B', 'BGE-M3', 'PyTorch / Transformers', 'FastAPI', 'SSE', 'A800 / H800 / 昇腾 910B'],
    metrics: [
      { value: '412ms', label: 'TTFT（首字时延）', source: '项目记录（待复核）' },
      { value: '32B', label: 'Qwen3-VL-32B', source: '简历 PDF' },
      { value: '~70GB', label: 'bfloat16 双服务显存', source: '简历 PDF' },
      { value: '171', label: '条逐请求遥测', source: '简历 PDF' },
      { value: '2', label: '服务：LLM + Embedding', source: '简历 PDF' },
      { value: 'OpenAI', label: '兼容 API', source: 'llm_service.py' },
    ],
    evidence: [
      { kind: 'code', caption: 'FastAPI + SSE + TextIteratorStreamer（代码片段）' },
      { kind: 'diagram', caption: '请求 → 流式生成 → 遥测 JSONL → 自愈脚本' },
      { kind: 'metric', caption: 'TTFT / token / GPU / 显存逐请求记录', pending: true },
    ],
    replay: {
      title: '一次流式请求的回放（预录示意）',
      events: [
        { kind: 'user', text: 'POST /v1/chat/completions · stream=true · 「解读这张 CT 报告单」' },
        { kind: 'tool', name: 'route', args: 'OpenAI 兼容入口 → 32B 单卡实例（队列深度 0）', ms: 4 },
        { kind: 'tool', name: 'generate', args: 'TextIteratorStreamer · bfloat16', ms: 412 },
        { kind: 'result', text: 'TTFT 412ms；吞吐与显存曲线已由 PerformanceMonitor 落盘 JSONL' },
        { kind: 'answer', text: 'SSE 逐 token 推送中……首个 token 在 0.4s 内到达，长答案不空转等待。' },
      ],
    },
    decisions: [
      {
        title: '遥测先行：先有账本，再谈优化',
        body:
          '逐请求记录时延 / token 数 / GPU 利用率 / 显存，落盘 JSONL。首字时延和吞吐的瓶颈定位全部对着账本做，而不是改一版参数赌一把。',
      },
      {
        title: 'OpenAI 兼容接口是取舍',
        body:
          '自定义协议能少一层转换，但兼容意味着客户端零改造：测试脚本、SDK、下游应用直接可用。接口层让渡一点「最优」，换生态「即插即用」。',
      },
      {
        title: '长稳运行靠会话编排，不靠运气',
        body:
          'tmux + SSH 反向隧道 + 自愈脚本：进程死了自动拉起，隧道断了自动重连。租卡环境里，宿主机和网络的故障率高于代码故障率。',
      },
      {
        title: '异构硬件都跑一遍',
        body:
          '同一模型在 H800 与昇腾 910B 上分别做量化与加速适配。国产卡生态不平整，只有亲手跑过才知道量化方案在哪层掉精度。',
      },
    ],
    tradeoffs:
      '没做：多租户与计费（单模型服务，加租户只会掩盖性能数据）；没上 vLLM 重写（目标是吃透请求链路与瓶颈，FastAPI + Streaming 够诚实；吞吐真上量再换引擎不迟）；没做模型评测榜单（评测归评测，这是服务化项目）。',
    relatedWiki: ['Agent_Tools_Selection_Wiki', 'Domestic_Toolchain_Wiki', 'Agent_Economics_Wiki'],
    relatedPosts: ['deploy-fastapi', 'rag-clinical-qa'],
    links: [],
    privacy: 'public',
    sourceRefs: ['简历 PDF', '4C/llm_service.py', '4C/monitor_utils.py', 'qwen3-VL-32B.txt'],
    repoNote: '部署脚本与代码可面试演示；完整日志待复核后公开',
  },
  {
    slug: 'mes-system',
    no: 'P-04',
    title: 'MES 生产制造执行系统',
    shortTitle: 'MES 系统',
    tagline: '在低代码平台上把制造业务做进状态机：工单、工序、报工、检验、追溯。',
    kind: 'project',
    layer: 'system',
    status: 'iterating',
    period: '2026.07 – 至今',
    date: '2026',
    role: '实习期全栈开发：独立负责前后端与业务建模（简历口径）',
    why:
      '制造企业的 MES 不是「一堆表单」：工单、工序、载具、报工、检验之间有严格的状态与数量账。低代码平台能快，但元数据驱动的表单引擎有边界，必须先把状态机和追溯链设计清楚，再谈配置。',
    solution:
      '基于低代码平台做 9 Tab 表单配置 + JS / SCSS / SQL / Java 四类扩展 + 自定义控件；设计工单-工序-检验多状态机与一单一码规则，报工强制扫码绑定载具并校验装载组归属/状态/数量；以 SN 正反向追溯串起物料批 → 工单 → 投料 → 执行 → 检验 → 成品批 → 入库 → 发货共 14 类节点。',
    stack: ['Spring Boot 3.3', 'JDK 17', 'MyBatis Plus', 'MySQL 三库', 'Redis', 'Vue3', 'Element Plus', 'Avue', 'Flowable'],
    metrics: [
      { value: '9 Tab', label: '表单引擎配置', source: '简历 PDF' },
      { value: '4 类', label: '扩展：JS / SCSS / SQL / Java', source: '简历 PDF' },
      { value: '14 类', label: '追溯节点', source: '简历 PDF' },
      { value: '3 库', label: 'MySQL 三库', source: '简历 PDF' },
      { value: '一单一码', label: '原始记录不可覆盖', source: '简历 PDF' },
      { value: '多状态机', label: '工单-工序-检验', source: '简历 PDF' },
    ],
    evidence: [
      {
        kind: 'image',
        src: '/showcase/projects/mes-workbench.jpg',
        caption: '载具工作台 · 已裁剪品牌区与侧栏（界面示意）',
        redacted: true,
      },
      { kind: 'diagram', caption: '工单-工序-检验状态机 / 一单一码 / 14 类追溯节点' },
      { kind: 'code', caption: '元数据表单：9 Tab + 四类扩展 + 自定义控件' },
    ],
    replay: {
      title: '一次载具转移的回放（预录示意）',
      events: [
        { kind: 'user', text: '扫描原载具 → 扫描目标载具 → 提交转移' },
        { kind: 'tool', name: 'resolve_carrier', args: '解析载具码 / 装载组 / 当前状态', ms: 120 },
        { kind: 'tool', name: 'check_loading_group', args: '校验装载组归属、禁混装、数量守恒', ms: 60 },
        { kind: 'result', text: '转移提交：两侧数量同步更新，状态机推进，追溯链新增节点' },
        { kind: 'answer', text: '一单一码与原始记录不可覆盖：转移有据可查，后续检验/入库可沿 SN 反查。' },
      ],
    },
    decisions: [
      {
        title: '先定状态机，再配表单',
        body:
          '低代码最容易滑向「先堆页面」。工单-工序-检验的状态与数量账先画清楚，表单只是状态的投影；否则每加一个页面就多一套隐性规则。',
      },
      {
        title: '载具级禁混装',
        body:
          '报工强制扫码绑定载具，校验装载组归属、状态与数量。看起来是交互细节，实际是把「混料」这类质量事故挡在数据入口。',
      },
      {
        title: '追溯不是日志，是链',
        body:
          '按 SN 正反向串起 14 类节点，原始记录不可覆盖。追溯的价值在于出问题时能定位到批次/工位/载具，而不是事后翻日志。',
      },
    ],
    tradeoffs:
      '不展开：客户业务量化收益（效率/良率）没有公开出处，公开页不写；客户真实界面不直接发布，只给裁剪/示意图。',
    relatedWiki: ['AI_Coding_Quality_Gate_Wiki', 'Vibe_Coding_Methodology_Wiki', 'LLM_Wiki'],
    relatedPosts: [],
    links: [],
    privacy: 'redacted',
    sourceRefs: ['简历 PDF', 'dev-mes/CODEBUDDY.md', 'dev-mes/MES 设计文档 00–17', 'workbench-transfer.png（裁剪）'],
    repoNote: '客户项目，私有仓库；截图与业务数据需客户授权',
  },
  {
    slug: 'taxi-platform',
    no: 'P-05',
    title: '出租车运营管理平台重构',
    shortTitle: '出租车平台',
    tagline: '把 PHP + Vue2 双栈单体迁到 Spring Boot 3 + Vue3，92 张表零丢失。',
    kind: 'project',
    layer: 'delivery',
    status: 'live',
    period: '2026.06 – 2026.09',
    date: '2026',
    role: '独立负责需求对接 → 开发升级 → 灰度测试 → 上线部署（简历口径）',
    why:
      '老旧 PHP Webman + Vue2 单体要重构，数据库 92 张业务表、6.9 万条数据、5.1G 附件，且没有可靠备份（RPO≈60 天）。迁移不是「导数据」：脏数据、重复数据、附件、权限、报表口径都要在切换前算清楚。',
    solution:
      '迁到 Spring Boot 3 + Vue3 低代码平台；设计「水位增量 + 主键/时间戳兜底 + 幂等清洗 + 三重对账」迁移管道，治理脏数据 1,416 行与重复数据 62,804 行；交付 96 套业务表单、219 条 JS 增强、23 个自定义页面、150 个迁移脚本；准备 5 / 30 / 60 分钟三级回滚预案。',
    stack: ['Spring Boot 3.3', 'JDK 17', 'MyBatis Plus', 'Flowable 7', 'Vue3.4', 'Vite 5', 'TypeScript', 'Element Plus', 'Avue', 'MySQL 三库 / Redis'],
    metrics: [
      { value: '92', label: '张业务表', source: '简历 PDF' },
      { value: '88', label: '表对账 src_only=0', source: '简历 PDF' },
      { value: '0', label: '数据丢失', source: '简历 PDF' },
      { value: '3 个月', label: '生产切换', source: '简历 PDF' },
      { value: '1,416', label: '行脏数据治理', source: '简历 PDF' },
      { value: '62,804', label: '行重复数据', source: '简历 PDF' },
      { value: '975→150ms', label: '首页聚合（11 条 SQL → 2 条）', source: '简历 PDF' },
      { value: '349→11.2ms', label: '单车欠费统计', source: '简历 PDF' },
    ],
    evidence: [
      {
        kind: 'image',
        src: '/showcase/projects/taxi-architecture.svg',
        caption: '低代码分层架构 · 已替换企业名',
        redacted: true,
      },
      { kind: 'diagram', caption: '水位增量 + 主键/时间戳兜底 + 幂等清洗 + 三重对账' },
      { kind: 'metric', caption: '对账与性能治理数字（简历 PDF）' },
    ],
    replay: {
      title: '一次迁移对账的回放（预录示意）',
      events: [
        { kind: 'user', text: '启动迁移批次：92 张表 + 5.1G 附件 + 150 个脚本' },
        { kind: 'tool', name: 'watermark_extract', args: '水位增量 + 主键/时间戳兜底', ms: 1200 },
        { kind: 'tool', name: 'idempotent_clean', args: '幂等清洗：1,416 行脏数据 / 62,804 行重复', ms: 900 },
        { kind: 'tool', name: 'reconcile', args: '三重对账：行数 / 主键 / 业务口径', ms: 700 },
        { kind: 'result', text: '88 张表 src_only=0；附件校验通过；切换后性能指标达标' },
        { kind: 'answer', text: '三级回滚预案待命；生产切换完成，数据零丢失。' },
      ],
    },
    decisions: [
      {
        title: '对账先于切换',
        body:
          '迁移的验收不是「脚本跑完」，而是 88 张表 src_only=0、行数/主键/业务口径三重对账通过。对账不过，宁可延迟切换。',
      },
      {
        title: '脏数据在管道里治理，不靠事后补',
        body:
          '1,416 行脏数据与 62,804 行重复数据在同步通道内置清洗规则，防止复发；迁移不是一次性搬箱子。',
      },
      {
        title: '三级回滚预案',
        body:
          '5 / 30 / 60 分钟三档回滚，按故障影响面选择。能回滚，才敢在真实业务上切换。',
      },
    ],
    tradeoffs:
      '没做：微服务拆分（业务体量单体足够，拆分运维成本大于故障隔离收益）；没做自研报表引擎（平台原生 SQL 报表已覆盖场景）；客户真实业务截图不公开。',
    relatedWiki: ['Vibe_Coding_Methodology_Wiki', 'AI_Coding_Quality_Gate_Wiki', 'Domain_Deployment_Wiki'],
    relatedPosts: ['jiayu-lowcode-migration'],
    links: [],
    privacy: 'redacted',
    sourceRefs: ['简历 PDF', 'jiayu/README.md', 'jiayu/docs/images 架构 SVG', 'git log'],
    repoNote: '客户项目，私有仓库；截图与业务数据需客户授权',
  },
  {
    slug: 'unionplore',
    no: 'P-06',
    title: 'UnionPlore 在线教育平台',
    shortTitle: 'UnionPlore',
    tagline: '若依深度二开：课程/课件、弹幕、Gitea 集成，4C 国赛三等奖。',
    kind: 'project',
    layer: 'system',
    status: 'archived',
    period: '2026',
    date: '2026',
    role: '参赛作品 · 团队分工待确认',
    why:
      '在线教育平台不只需要课程表：课件树、Markdown 预览、实时弹幕、Gitea 仓库与权限，都是「教学」这件事的一部分。选择若依二开是为了把权限/代码生成这些底座留给框架，把精力放在业务差异上。',
    solution:
      '基于 RuoYi-Vue 3.9 深度二开：课程/课件/博客模块、Netty WebSocket 实时弹幕 + HTTP 持久化、Gitea 组织/仓库/用户/权限同步、跨表学生聚合视图；前端 Vue3 + Vite + Element Plus/EleAdminPlus，后端 Spring Boot + MyBatis Plus + Redis + Quartz + Undertow。',
    stack: ['Spring Boot 3.5', 'Java 17 / 21', 'MyBatis Plus', 'Redis', 'Netty WebSocket', 'Vue 3.5', 'Vite 6', 'Element Plus', 'Gitea API'],
    metrics: [
      { value: '国家三等奖', label: '2026 全国 4C Web 开发挑战赛', source: '简历 PDF' },
      { value: '8 篇', label: 'Code-Wiki 文档', source: '4C/Code-Wiki' },
      { value: 'Netty', label: 'WebSocket 弹幕（:8088）', source: 'Code-Wiki' },
      { value: 'Gitea', label: '组织/仓库/用户/权限集成', source: 'Code-Wiki' },
      { value: '3.9.0', label: '若依二开基线', source: 'pom.xml' },
      { value: '前后端分离', label: 'Spring Boot + Vue3', source: 'Code-Wiki' },
    ],
    evidence: [
      { kind: 'diagram', caption: '若依二开架构：课程/课件、弹幕、Gitea 集成、学生聚合' },
      { kind: 'code', caption: 'Netty WebSocket 弹幕 + HTTP 持久化' },
      { kind: 'metric', caption: '4C Web 开发挑战赛国家三等奖（证书待补）', pending: true },
    ],
    replay: {
      title: '一次「上课 + 弹幕」的回放（预录示意）',
      events: [
        { kind: 'user', text: '学生进入课件页，播放视频并发送一条弹幕' },
        { kind: 'tool', name: 'course_tree', args: '课程 → 课件树 → Markdown / 视频预览', ms: 80 },
        { kind: 'tool', name: 'websocket_push', args: 'Netty WebSocket :8088 广播弹幕', ms: 12 },
        { kind: 'result', text: '弹幕实时上屏；HTTP 接口持久化，刷新后仍在' },
        { kind: 'answer', text: 'Gitea 权限与课程/学生聚合在后台同步；课件与代码仓库共用同一套身份。' },
      ],
    },
    decisions: [
      {
        title: '底座交给若依，差异自己做',
        body:
          '权限、菜单、代码生成器用框架现成的；课程/课件、弹幕、Gitea 集成这些真正差异化的部分自己写。二开不是改框架，是在框架边界上长业务。',
      },
      {
        title: '弹幕用 Netty，不用轮询',
        body:
          '实时推送走独立 WebSocket（:8088），持久化走 HTTP REST。实时与存储解耦，刷新后弹幕仍在。',
      },
      {
        title: 'Gitea 不是外链，是身份的一部分',
        body:
          '把组织/仓库/用户/权限同步进平台，课程与代码仓库共用同一套身份，避免「教学平台一套账号、代码托管另一套」。',
      },
    ],
    tradeoffs:
      '不展开：用户量/并发/性能指标没有公开出处，公开页不写；团队分工与奖项年份待确认；Gitea token 等配置不公开。',
    relatedWiki: ['AI_Coding_Quality_Gate_Wiki', 'Vibe_Coding_Methodology_Wiki'],
    relatedPosts: [],
    links: [],
    privacy: 'public',
    sourceRefs: ['简历 PDF', '4C/Code-Wiki/*.md', '4C/uni-webtech-master/pom.xml', '4C/uni-webtech-ui-master/package.json'],
    repoNote: '参赛作品；团队分工与公开范围待确认',
  },
  {
    slug: 'scp-rpa',
    no: 'P-07',
    title: 'SCP 跨账号取数 MVP',
    shortTitle: 'SCP 取数',
    tagline: 'RPA 做执行，Dify 做总控，人只登录：把四个账号的重复取数压成一次触发。',
    kind: 'project',
    layer: 'agent',
    status: 'iterating',
    period: '2026.09',
    date: '2026',
    role: '方案设计与 Phase 1 原型（角色/汇报口径待确认）',
    why:
      '某能源国企的 SCP 系统是 Windows C/S 架构，需要 4 个权限互斥的账号分别取数再人工拼接。环境要求数据不出域、账号绑定不同真实 IP、登录行为受监控，合规尚未报批。GUI Agent 在桌面场景的成功率只有 12–20%，而企业要求 99%+——所以不能让大模型直接点 UI。',
    solution:
      'RPA 只做执行（Python + UIA/OCR 降级），Dify 只做总控（只决策、不碰 UI），人只做登录。4 账号绑定 4 台现役办公机串行执行；Collector 固定四方法（can_handle / total_rows / extract_chunk / verify）；冲突两边留、绝不静默合并；出数前过 oracle 硬判据（合计/行数/抽样 + 勾稽）；审计四要素 + SHA-256 哈希链；断点续采与 G-1/G-2 闸门。Phase 1 只用合成数据。',
    stack: ['Python 3.13', 'FastAPI', 'pydantic', 'pandas / openpyxl', 'pytest', 'UIA / OCR', 'Dify', 'SHA-256 审计链'],
    metrics: [
      { value: '66', label: '测试全绿', source: 'CODEBUDDY.md' },
      { value: '14', label: '条 ADR', source: 'MVP 方案 v2' },
      { value: '4 账号', label: '× 4 台现役办公机（串行）', source: 'MVP 方案' },
      { value: '3 周', label: 'MVP 可行性结论', source: 'MVP 汇报' },
      { value: '≈0', label: '许可费（开源 A 轨）', source: 'MVP 汇报' },
      { value: 'Phase 1', label: '合成数据全链路可运行', source: 'CODEBUDDY.md' },
    ],
    evidence: [
      {
        kind: 'image',
        src: '/showcase/projects/scp-architecture.svg',
        caption: 'RPA 执行 + Dify 总控 · 架构图（无客户数据）',
        redacted: true,
      },
      { kind: 'diagram', caption: '4 账号 × 5 切片串行；断点续采；oracle 硬判据' },
      { kind: 'code', caption: 'Collector 四方法 + 四要素审计 + SHA-256 哈希链' },
    ],
    replay: {
      title: '一次四账号取数的回放（预录示意）',
      events: [
        { kind: 'user', text: '触发一次四账号取数：今日供应链汇总' },
        { kind: 'tool', name: 'plan', args: 'Dify 总控：账号-机器映射 / 切片计划（只决策）', ms: 300 },
        { kind: 'tool', name: 'collect_chunk', args: 'RPA 串行采集：4 账号 × 5 切片（人工登录一次）', ms: 18000 },
        { kind: 'tool', name: 'merge', args: '冲突两边留 + 来源血缘列', ms: 120 },
        { kind: 'tool', name: 'oracle_check', args: '合计 / 行数 / 抽样 + 勾稽', ms: 200 },
        { kind: 'result', text: '汇总表生成；审计四要素与哈希链写入；失败切片可断点续采' },
        { kind: 'answer', text: 'Phase 1 只跑合成数据；真实数据接入需先过 G-1 授权闸门。' },
      ],
    },
    decisions: [
      {
        title: 'Dify 只做总控，不碰 UI',
        body:
          'GUI Agent 在桌面场景的成功率撑不起企业要求。让 RPA 负责执行、Dify 负责决策，是对「可靠性」的诚实分工。',
      },
      {
        title: '冲突两边留',
        body:
          '跨账号取数一定有口径冲突。静默合并会制造看不见的错误；两边留 + 来源血缘列，让人做最终判断。',
      },
      {
        title: '审计不可关停',
        body:
          '操作四要素 + SHA-256 哈希链，技术性防篡改。无审计的自动化取数在合规上不可辩护。',
      },
    ],
    tradeoffs:
      '没做：真实 Oracle 直连（需 G-1 授权）；同机并行多实例/VM 桥接（触发风控与 NAC 识别）；把 Dify 当 GUI Agent（可靠性不达标）。Phase 1 不做生产指标承诺。',
    relatedWiki: [
      'Agent_Architecture_Wiki',
      'Agent_Observability_Security_Wiki',
      'Multi_Agent_Security_Wiki',
      'Domain_Deployment_Wiki',
    ],
    relatedPosts: [],
    links: [],
    privacy: 'diagram-only',
    sourceRefs: ['RPA+Dify/CODEBUDDY.md', 'SCP取数_MVP可行性方案汇报.md', 'SCP 技术架构 SVG', 'requirements.txt'],
    repoNote: '客户场景；仅公开架构与方法，不公开数据与真实界面',
  },
  {
    slug: 'llm-wiki',
    no: 'P-08',
    title: 'LLM 知识库 · 本站',
    shortTitle: '本站 / 知识库',
    tagline: '30 篇 Agent 知识互相链接成图谱，而且它自己就是一件作品。',
    kind: 'meta',
    layer: 'meta',
    status: 'live',
    period: '2026',
    date: '2026',
    role: '独立：内容、设计系统、前端实现',
    why:
      '读完一篇 Agent 文章三周后基本会忘，但画过一张图、写过一篇把它和别的知识连起来的笔记就不会。这个知识库是我自己的记忆系统：每篇文档单一真相来源，互链优先，索引即导航。',
    solution:
      '30 篇 Markdown 按四层组织，构建期用 import.meta.glob 懒加载，文档间相对链接自动改写为站内路由；React + Vite + TypeScript 实现阅读、目录、搜索、标签、归档与本地管理；本次重做把 20 套主题收束为一套「读片报告」设计系统，视觉不再靠换肤。',
    stack: ['React 18', 'TypeScript', 'Vite', 'Tailwind', 'marked + DOMPurify'],
    metrics: [
      { value: '30', label: '篇知识文档', source: 'src/content/wiki' },
      { value: '4 层', label: '理论 / 选型 / 方法论 / 规范', source: 'wiki/index.ts' },
      { value: '7', label: '篇文章', source: 'posts.ts' },
      { value: '1 套', label: '统一设计系统（本次重做）', source: '本站' },
    ],
    evidence: [
      { kind: 'diagram', caption: '四层知识库 + 互链图谱 + 站内阅读路径' },
      { kind: 'code', caption: 'Markdown 互链改写 / 懒加载 / 目录与阅读进度' },
    ],
    decisions: [
      {
        title: '单一真相来源 + 互链',
        body:
          '一个概念只在一篇文档里定义，别处一律相对链接引用，构建期自动改写。把软件工程里的 DRY 搬进笔记。',
      },
      {
        title: '文档与代码同源',
        body:
          '30 篇 .md 就在仓库里，正文懒加载。在网页读，也在 GitHub 读，两者是同一份文件，不存在「导出版」漂移。',
      },
      {
        title: '设计系统代替换肤',
        body:
          '上一版用 20 套布局预设做主题演示，辨识度被稀释。这次收束为一套纸本报告系统：令牌、组件、页面共享同一套语义。',
      },
    ],
    tradeoffs:
      '没做：全文搜索引擎（30 篇规模下，一份好索引 > 一个搜索引擎）；没做评论式协作编辑（个人知识系统，共识在写作时完成）；没上 SSR/SSG（SPA + 客户端 SEO 注入对纯内容小站够用）。',
    relatedWiki: ['Agent_Memory_Wiki', 'Memory_Engineering_Wiki', 'Memory_Security_Wiki'],
    relatedPosts: [],
    links: [{ label: '站内知识库', url: '/wiki', internal: true }],
    privacy: 'public',
    sourceRefs: ['src/content/wiki/index.ts', 'src/data/posts.ts', '本站实现'],
  },
];

export const workStatusLabels: Record<WorkStatus, string> = {
  live: '在线',
  iterating: '迭代中',
  archived: '已归档',
};

export const workLayerLabels: Record<WorkLayer, string> = {
  agent: 'AI Agent / 规则',
  model: '模型 / 影像',
  service: '推理服务',
  system: '业务系统',
  delivery: '迁移 / 交付',
  meta: '本站',
};

export function findWork(slug: string): Work | undefined {
  return works.find(w => w.slug === slug);
}

export const projectWorks = works.filter(w => w.kind === 'project');
