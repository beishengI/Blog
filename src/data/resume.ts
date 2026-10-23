/**
 * 网页简历结构化数据。
 *
 * 事实来源：用户提供的 FDE / 软件开发（STAR 版）一页简历 PDF（2026-10）。
 * 只写 PDF 中出现的数字、名词与结果；未出现的信息不补写。
 * 隐私约定：完整手机号不进入源码，只保留脱敏形式；GPA / 排名 / 平均分按站点规则不展示。
 */

export const resumeHero = {
  name: '张栋栋',
  handle: '北省',
  role: 'FDE / 软件开发工程师 · 医学影像 AI / 全栈交付',
  targetRole: 'FDE / 软件开发工程师（医学影像 AI · 全栈交付）',
  facts:
    '智能医学工程 2027 届。在武汉做企业系统交付：出租车平台重构迁移、MES 工单全生命周期、合同预审智能体与医学影像 AI 平台。需求 → 方案 → 开发 → 迁移 → 上线 → 运维，一条链路亲手跑过。',
  tags: ['FDE / 客户交付', 'AI 应用 / Agent', '医学影像 AI', '企业系统全栈'],
  email: '1611045292@qq.com',
  github: 'beishengI',
  location: '湖北 · 武汉',
  phoneMasked: '153****3881',
  resumePdf: '/resume/zhangdongdong-resume-2026-10.pdf',
  resumePdfPreview: '/resume/zhangdongdong-resume-2026-10-preview.jpg',
  /** 网页 /resume 打印的完整版（当前 6 页）；在简历页作为「完整版」入口保留 */
  resumePdfFull: '/resume/zhangdongdong-resume.pdf',
};

export const resumeFacts = [
  { value: '7', label: '项工程作品' },
  { value: '2', label: '套企业系统' },
  { value: '30', label: '篇知识文档' },
  { value: '1', label: '篇国际会议论文' },
];

export interface ResumeProject {
  name: string;
  tag: string;
  period: string;
  points: string[];
  stack: string[];
  link?: string;
  slug?: string;
  pending?: string;
}

export const resumeInternship = {
  company: '武汉引力云科技有限公司',
  role: '全栈开发工程师 · 企业系统交付',
  period: '2026.06 – 至今',
  points: [
    '工作概述：独立负责出租车运营管理平台重构迁移；作为 MES 项目组核心开发，负责工单全生命周期模块；直接对接客户业务与生产部门，覆盖需求 → 方案 → 开发 → 迁移 → 上线 → 运维。',
    '出租车运营管理平台重构迁移（独立负责，2026.06–2026.09）：老旧 PHP + Java 双栈单体，92 张业务表 / 6.9 万条数据 / 5.1G 附件、无备份（RPO≈60 天）。主导重构至 Spring Boot 3 + Vue3，设计「水位增量 + 主键∨时间戳兜底 + 幂等清洗 + 三重对账」迁移管道，治理 1,416 行脏数据与 62,804 行重复数据；3 个月完成生产切换、数据零丢失（88 张表对账 src_only=0）；月欠费统计 60s+ 超时 → 毫秒级、单车欠费 349ms → 11.2ms；交付 96 套表单 / 219 条 JS 增强 / 150 个迁移脚本。',
    'MES 工单全生命周期（项目组核心开发，2026.07–至今）：负责工单创建 → 排程 → 下发 → 报工 → 状态流转 → 载具绑定 → 追溯；设计工单-工序-检验多状态机、一单一码、载具防混装，支撑 SN 14 类节点正反向追溯；参与元数据驱动表单引擎二次开发，基于现场 7 条痛点 / 14 条问题完成需求澄清。',
  ],
};

export const resumeProjects: ResumeProject[] = [
  {
    name: 'AI 医学影像分析与可视化平台',
    tag: '模型训练 · 推理服务化 · 全栈',
    period: '2026 · 已开源',
    slug: 'lite-mamba',
    points: [
      '在 A800 80GB HPC 集群完成 16 组对照实验（基线 + 宽度搜索 + 模块消融 + 5 个主流模型对比），训练 Lite-Mamba（w=0.75）：参数 67.7M → 10.9M（↓83.9%）、算力 ↓86.5%，Dice 0.879（仅降 0.97pt），HD95 4.73 优于基线 4.92。',
      '以 FastAPI + Vue3 + TypeScript + ECharts 开发可视化平台：.nii.gz 在线推理、三视图逐切片、GT 标签叠加、16 组指标对比、CSV / LaTeX / Markdown / PDF 四类报告导出；Docker Compose + Nginx 一键部署。',
      '自建 Qwen3-VL-32B + BGE-M3 推理服务（OpenAI 兼容 API + SSE 流式），逐请求遥测 171 条（时延 / token / GPU / 显存）；在 H800 与昇腾 910B 完成量化与加速适配，数据不出内网。',
    ],
    stack: ['PyTorch', 'MONAI', 'FastAPI', 'Vue3', 'TypeScript', 'ECharts', 'Qwen3-VL-32B', 'BGE-M3', 'A800 / H800 / 昇腾 910B'],
    link: 'https://github.com/beishengI/Lite-Mamba-Visualization',
  },
  {
    name: '企业合同预审辅助智能体',
    tag: 'Agent 编排 · 规则引擎',
    period: '2026.06 – 2026.07',
    slug: 'contract-agent',
    points: [
      '设计「大模型感知 + 代码判定」三层架构：Dify 抽取字段并完成三单语义对齐，判定下沉自研 Java 规则引擎（金额比率 / 精确值 / 日期 / 文本相似度 / DSL 共 5 种模式）；判定确定性 100%、单字段 <100ms（原 LLM 方案 10–30 秒），三单预审 30–90 秒。',
      '构建五道防幻觉与白盒溯源护栏：数值回原文锚定（±120 字符）、页码校验、逐侧验证、低置信拦截、比例守卫；字段编造率 9.8% → 0，对抗测试通过率 80% → 95.7%，核心字段准确率 84.0%（50 份真实合同金标准）。',
      '交付规则 DSL 引擎与无代码配置中心（52+ 算子 / 20 模板 / 21 配置接口），新增合同类型零代码；SSE 实时进度与 6 态审查状态机、操作日志审计；354 个单测，7 周独立完成设计 → 开发 → 生产对接。',
    ],
    stack: ['Spring Boot 3', 'Vue3', 'Dify', 'MySQL / Redis', 'OpenAI API', 'SSE'],
    pending: '客户授权材料与部分判定口径待确认。',
  },
];

export const resumePublication = {
  title: '多模态大模型生成健康科普短视频的自动评价模型',
  venue: 'DMI 2026 国际会议 · 第三作者',
  publisher: 'FAIA / IOS Press',
  status: '已录用',
  note: '录用证明可在面试时提供。',
};

export const resumeSkills: { label: string; items: string[] }[] = [
  {
    label: '编程与后端',
    items: ['Python（FastAPI）', 'Java（Spring Boot 3 / MyBatis Plus）', 'TypeScript / JavaScript', 'SQL', 'RESTful API'],
  },
  {
    label: '大模型开发',
    items: ['LangChain / LangGraph（Agent / ReAct）', 'MCP / Function Calling', 'RAG（多路召回 / BGE-Rerank）', '微调（LoRA / QLoRA / PEFT）', 'Llama-Factory / DeepSpeed'],
  },
  {
    label: 'AI 交付',
    items: ['vLLM', 'Ollama / Xinference', 'PyTorch', 'MONAI', 'BraTS', 'Qwen3-VL', 'A800 / H800 / 昇腾 910B'],
  },
  {
    label: '前端与工程',
    items: ['Vue3', 'React 18', 'Vite', 'Element Plus', 'Pinia', 'ECharts', 'Linux', 'Docker', 'Nginx', 'MySQL / Redis', 'Git'],
  },
  {
    label: '证书',
    items: ['CET-4', 'Python 计算机二级', '工业互联网平台开发工程师（初级）', 'Prompt 工程认证'],
  },
];

export const resumeEducation = {
  school: '湖北医药学院',
  major: '智能医学工程 · 本科（2027 届）',
  period: '2023.09 – 2027.06',
  highlight: '主修课程：Python 程序设计、Web 开发技术及应用、机器学习及应用、数据挖掘、大数据关键技术、数据库系统原理；连续获得奖学金与优秀大学生标兵。',
  courses: [
    'Python 程序设计',
    'Web 开发技术及应用',
    '机器学习及应用',
    '数据挖掘',
    '大数据关键技术',
    '数据库系统原理',
  ],
};

export const resumeHonors = [
  '国家奖学金（全国本专科生前 0.2%）',
  '国家励志奖学金 ×2',
  '校特等奖学金（前 0.5%）',
  '优秀大学生标兵',
  '2026 全国 4C Web 开发挑战赛 · 国家三等奖',
  '全国大学生软件测试大赛 · 国赛三等奖',
  '全国大学生数学建模竞赛 · 省赛二等奖',
  '蓝桥杯（Python 赛道）· 省赛三等奖',
];

export const resumeCertificates = ['CET-4', 'Python 计算机二级', '工业互联网平台开发工程师（初级）', 'Prompt 工程认证'];

export const resumeSummary =
  '智能医学工程 2027 届，DMI 2026 国际会议论文录用（第三作者）。跑通过「医学影像训练 → 大模型推理服务化 → 企业系统全栈交付」完整链路：在 A800 集群做轻量化分割与 16 组对照实验，把 Qwen3-VL-32B 做成 OpenAI 兼容的流式服务，也独立完成 92 张表 / 6.9 万条数据的企业系统迁移。能直接对接客户业务与生产部门，独立完成需求 → 方案 → 开发 → 迁移 → 上线 → 运维。';
