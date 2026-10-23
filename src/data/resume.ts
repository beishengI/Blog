/**
 * 网页简历结构化数据。
 *
 * 事实来源：用户提供的简历 PDF（2026-10）。只写可核查的数字、名词、后果；
 * 未在 PDF/README 中出现的信息不补写。手机号只保留脱敏形式。
 */

export const resumeHero = {
  name: '张栋栋',
  handle: '北省',
  role: '软件开发工程师 · 全栈开发 / 医学影像软件 / AI 应用',
  targetRole: '软件开发工程师（全栈开发 · 医学影像软件 · AI 应用）',
  facts:
    '智能医学工程 2027 届。在武汉做全栈开发实习：MES、出租车平台重构、合同预审智能体与医学影像 AI。算法、服务、交付，一条链路亲手跑过。',
  tags: ['AI 应用 / Agent', '模型部署与推理', '医学影像 AI', '企业系统全栈'],
  email: '1611045292@qq.com',
  github: 'beishengI',
  location: '湖北 · 武汉',
  phoneMasked: '153****3881',
  resumePdf: '/resume/zhangdongdong-resume-2026-10.pdf',
  resumePdfPreview: '/resume/zhangdongdong-resume-2026-10-preview.jpg',
  /** 旧的 5 页完整版；当前在简历页作为「完整版」入口保留 */
  resumePdfFull: '/resume/zhangdongdong-resume.pdf',
};

export const resumeFacts = [
  { value: '7', label: '项工程作品' },
  { value: '2', label: '套企业系统' },
  { value: '30', label: '篇知识文档' },
  { value: '5', label: '段能力链路' },
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
  role: '全栈开发工程师',
  period: '2026.06 – 至今',
  points: [
    '独立负责两套企业级系统（MES 生产制造执行系统、出租车运营管理平台）的需求分析、架构设计、全栈开发、数据迁移、测试与部署运维。',
    'MES：Spring Boot 3 / JDK 17 + MyBatis Plus + MySQL 三库 + Redis，Vue3.4 / TypeScript / Element Plus；基于元数据驱动的表单引擎二次开发，覆盖工艺建模、工序/工位-设备绑定、报工、检验全链路。',
    '出租车平台：主导 PHP + Java 双栈单体整体重构（92 张业务表、6.9 万条数据、5.1G 附件、无备份 RPO≈60 天）至 Spring Boot 3 + Vue3 架构，3 个月完成生产切换，数据零丢失。',
  ],
};

export const resumeProjects: ResumeProject[] = [
  {
    name: '企业合同预审辅助智能体',
    tag: 'Agent 编排 · 规则引擎',
    period: '2026.06 – 2026.07',
    slug: 'contract-agent',
    points: [
      '独立设计「大模型感知 + 代码判定」三层架构：Agent 编排负责字段抽取与语义对齐，比对判定下沉自研 Java 规则引擎（金额比率 / 精确值 / 日期 / 文本相似度 / DSL 共 5 种模式），判定确定性 100%、单字段判定 <100ms（原 LLM 方案 10–30 秒），端到端三单预审 30–90 秒。',
      '构建 LLM 防幻觉与白盒溯源体系：数值回原文锚定（±120 字符）、页码校验、逐侧验证、低置信拦截、比例守卫五道护栏，字段编造率 9.8%→修复后清零，对抗测试通过率 80%→95.7%，核心字段准确率 84.0%（50 份真实合同金标准），每条判定可回溯原文证据。',
      '开发规则 DSL 引擎与无代码配置中心（52+ 算子 / 20 模板 / 21 配置接口），新增合同类型零代码；SSE 实时进度与 6 态审查状态机、操作日志审计；后端 45 个测试类 354 个单测，7 周一人完成设计→开发→生产对接。',
    ],
    stack: ['Spring Boot 3', 'Vue3', 'Dify', 'MySQL / Redis', 'OpenAI API', 'SSE'],
    pending: '本地推理模型型号在不同材料中写作 Qwen3.8-27B / Qwen3-32B，公开页暂不写具体型号。',
  },
  {
    name: 'MES 生产制造执行系统',
    tag: '全栈 · 表单引擎二次开发',
    period: '2026.07 – 至今',
    slug: 'mes-system',
    points: [
      '独立负责全前后端开发：Spring Boot 3 / JDK 17 + MyBatis Plus + MySQL 8 三库 + Redis，Vue3.4 / TypeScript / Element Plus；基于元数据驱动的表单引擎二次开发（9 Tab 表单配置 + JS / SCSS / SQL / Java 四类扩展 + 自定义表单控件），覆盖工艺建模、工序/工位-设备绑定、报工、检验全链路。',
      '设计工单-工序-检验多状态机与一单一码规则，原始记录不可覆盖；报工强制扫码绑定载具（校验装载组归属、状态与数量，载具级禁混装），支撑 SN 正反向全链路追溯（物料批→工单→投料→执行→检验→成品批→入库→发货共 14 类节点）。',
      '客户业务收益的量化数据未在简历中提供，公开页标注「待补充」，不以推测数字填充。',
    ],
    stack: ['Spring Boot 3.3', 'JDK 17', 'MyBatis Plus', 'MySQL 三库', 'Redis', 'Vue3', 'Element Plus', 'Avue'],
    pending: '客户授权与业务量化收益待确认。',
  },
  {
    name: '出租车运营管理平台重构迁移',
    tag: '低代码全栈 · 数据迁移',
    period: '2026.06 – 2026.09',
    slug: 'taxi-platform',
    points: [
      '主导老旧 PHP + Java 双栈单体整体重构（92 张业务表、6.9 万条数据、5.1G 附件、无备份 RPO≈60 天）至 Spring Boot 3 + Vue3 表单引擎架构，3 个月完成生产切换，数据零丢失（88 张表对账 src_only=0）。',
      '设计「水位增量 + 主键∨时间戳兜底 + 幂等清洗 + 三重对账」数据迁移管道，治理脏数据 1,416 行与 62,804 行重复数据，并在同步通道内置清洗规则防复发。',
      '性能治理：月欠费统计 60s+ 超时→毫秒级、单车欠费 349ms→11.2ms、首页聚合 11 条 SQL→2 条（975ms→150ms）；交付 96 套业务表单、219 条 JS 增强、23 个自定义页面与 150 个迁移脚本，回滚三级预案 ≤5/30/60 分钟。',
    ],
    stack: ['Spring Boot 3.3', 'JeeLowCode', 'Vue3', 'TypeScript', 'MySQL / Redis'],
    pending: '客户名称、真实界面与业务数据需授权后公开。',
  },
  {
    name: 'AI 医学影像分析与可视化平台',
    tag: '模型训练 · 推理服务化 · 全栈',
    period: '2026',
    slug: 'lite-mamba',
    points: [
      '轻量化医学影像分割模型研究与训练：在 A800 HPC 集群基于 BraTS2023（1251 例）完成 16 组对照实验，Lite-Mamba（w=0.75）参数 67.7M→10.9M（↓83.9%）、算力 ↓86.5%，Dice 0.879 仅降 0.97pt，HD95 4.73 反超基线 4.92。',
      '全栈开发可视化分析平台（FastAPI + Vue3 + TypeScript + ECharts）：.nii.gz 上传在线推理、三视图逐切片浏览、GT 标签叠加、16 组实验指标对比，一键导出 CSV / LaTeX / Markdown / PDF 四类报告，Docker Compose + Nginx 一键部署。',
      '自建大模型在线推理服务：在学校 HPC 以单卡 A800 80GB 部署 Qwen3-VL-32B（bfloat16）与 BGE-M3 双服务，原生 Transformers + OpenAI 兼容 API + SSE 流式；自研遥测逐请求记录时延 / token / GPU / 显存，并在 H800 与昇腾 910B 完成量化与加速适配。',
    ],
    stack: ['PyTorch', 'MONAI', 'FastAPI', 'Vue3', 'ECharts', 'Docker / Nginx', 'Qwen3-VL-32B'],
    link: 'https://github.com/beishengI/Lite-Mamba-Visualization',
  },
  {
    name: 'UnionPlore 在线教育平台（4C 国赛）',
    tag: '若依二开 · WebSocket · Gitea',
    period: '2026',
    slug: 'unionplore',
    points: [
      '基于若依（RuoYi-Vue 3.9）深度二次开发的在线教育平台：课程/课件、Markdown 预览、Netty WebSocket 实时弹幕、Gitea 组织/仓库/用户/权限集成、跨表学生聚合视图。',
      '获 2026 全国 4C Web 开发挑战赛国家三等奖；团队分工与可公开截图待确认。',
    ],
    stack: ['Spring Boot 3.5', 'Java 17/21', 'Vue3.5', 'Vite 6', 'Element Plus', 'Netty', 'Gitea'],
    pending: '团队分工、奖项年份/证书公开授权待确认。',
  },
  {
    name: 'SCP 跨账号取数 MVP',
    tag: 'RPA · Dify 总控 · 合规审计',
    period: '2026.09',
    slug: 'scp-rpa',
    points: [
      '某能源国企 SCP 系统跨账号取数：RPA 做执行、Dify 做总控（只决策不碰 UI）、人做登录；4 账号绑定 4 台现役办公机串行，Phase 1 合成数据全链路可运行，66 个测试全绿。',
      '设计「水位增量 / 断点续采 / oracle 硬判据 / 四要素审计 + SHA-256 哈希链」；14 条 ADR，真实数据接入需先过 G-1 授权闸门。',
    ],
    stack: ['Python 3.13', 'FastAPI', 'pydantic', 'pandas', 'pytest', 'Dify', 'UIA / OCR'],
    pending: '角色/汇报口径、客户授权与生产指标待确认。',
  },
];

export const resumeSkills: { label: string; items: string[] }[] = [
  {
    label: '大模型推理与部署',
    items: ['Qwen3-VL 服务化', 'OpenAI 兼容 API', 'SSE 流式', '模型量化加速', '首字时延 / 吞吐调优', 'A800 / H800 / 昇腾 910B'],
  },
  {
    label: 'AI Agent / RAG',
    items: ['Dify / RAGFlow', 'Agent 编排与工具调用', 'Function Calling', '规则引擎 / DSL', 'RAG 向量检索', '确定性判定与护栏'],
  },
  {
    label: '后端',
    items: ['Python · FastAPI', 'Java · Spring Boot 3', 'Spring Security / JWT', 'MyBatis Plus', 'MySQL / Redis', 'SSE / 断点续采'],
  },
  {
    label: '前端 / 全栈',
    items: ['Vue3', 'TypeScript', 'Element Plus / Avue', 'Pinia', 'ECharts', 'Vite', 'React（本站）'],
  },
  {
    label: '深度学习',
    items: ['PyTorch', 'MONAI', '医学图像分割', 'Transformer / Mamba', '16 组对照实验', 'BraTS2023'],
  },
  {
    label: '工程与交付',
    items: ['Docker / Nginx', 'Linux / Slurm / Apptainer', 'Git', '数据迁移 / 对账', 'MES / 低代码', 'RPA（UIA / OCR）'],
  },
];

export const resumeEducation = {
  school: '湖北医药学院',
  major: '智能医学工程 · 本科（2027 届）',
  period: '2023.09 – 2027.06',
  highlight: '主修课程：Python 程序设计、机器学习、Web 开发技术、数据挖掘、大数据关键技术、数据库系统原理、计算机网络；连续获得奖学金与优秀大学生标兵。',
  courses: [
    'Python 程序设计',
    '机器学习',
    'Web 开发技术',
    '数据挖掘',
    '大数据关键技术',
    '数据库系统原理',
    '计算机网络',
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

export const resumeCertificates = [
  'CET-4',
  'Python 计算机二级',
  '工业互联网平台开发工程师（初级）',
  'Prompt 工程师',
];

export const resumeSummary =
  '专业背景是智能医学工程，做的事横跨两层：往下碰过模型训练与评估（Lite-Mamba 分割模型、16 组对照实验），往上做过部署与推理服务化（Qwen3-VL 流式服务、H800 / 昇腾 910B 量化加速）与 RAG / Agent 智能体，再用全栈 Web 把它们包成可用的系统。数据清洗、实验记录、量化加速、API 封装、线上排查，完整链路都亲手跑过一遍。';
