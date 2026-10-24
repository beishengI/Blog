/**
 * 首页展示页专用数据：证据带、能力链、技能证据、时间线、影片元信息。
 * 所有数字都能在 resume.ts / works.ts / README 中找到出处；没有出处的标 pending。
 */

export interface EvidenceMetric {
  value: string;
  unit?: string;
  label: string;
  source: string;
  href?: string;
}

export const evidenceBand: EvidenceMetric[] = [
  { value: '−83.9', unit: '%', label: 'Lite-Mamba 参数量（67.7M → 10.9M）', source: '简历 PDF', href: '/work/lite-mamba' },
  { value: '100', unit: '%', label: '合同预审判定确定性', source: '简历 PDF', href: '/work/contract-agent' },
  { value: '92', unit: '表', label: '出租车平台迁移 · 零丢失', source: '简历 PDF', href: '/work/taxi-platform' },
  { value: '5', unit: '段', label: '从感知到交付的能力链路', source: '本站', href: '/#studies' },
];

export interface PipelineNode {
  no: string;
  title: string;
  subtitle: string;
  works: string[];
  points: string[];
}

export const pipeline: PipelineNode[] = [
  {
    no: '01',
    title: '数据与训练',
    subtitle: 'DATA / TRAIN',
    works: ['lite-mamba'],
    points: ['BraTS2023 1251 例 4 模态', '16 组对照实验', 'A800 HPC · Slurm + Apptainer'],
  },
  {
    no: '02',
    title: '模型与服务',
    subtitle: 'MODEL / SERVE',
    works: ['lite-mamba', 'qwen3-inference'],
    points: ['轻量化分割模型', '32B 单卡推理', 'SSE · OpenAI 兼容 · 遥测'],
  },
  {
    no: '03',
    title: 'Agent 与规则',
    subtitle: 'AGENT / RULES',
    works: ['contract-agent', 'scp-rpa'],
    points: ['Dify 抽取 / 对齐', '纯 Java 规则引擎', 'RPA 执行 + Dify 总控'],
  },
  {
    no: '04',
    title: '系统与界面',
    subtitle: 'SYSTEM / UI',
    works: ['mes-system', 'unionplore'],
    points: ['MES 状态机与追溯', '若依二开 / WebSocket', 'Vue3 / TypeScript'],
  },
  {
    no: '05',
    title: '迁移与交付',
    subtitle: 'MIGRATE / SHIP',
    works: ['taxi-platform'],
    points: ['92 表迁移零丢失', '三重对账', '三级回滚'],
  },
];

export interface SkillGroup {
  label: string;
  en: string;
  items: string[];
  evidence: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: '大模型推理与部署',
    en: 'INFERENCE',
    items: ['Qwen3-VL 服务化', 'OpenAI 兼容 API', 'SSE 流式', '量化加速', '首字时延 / 吞吐', 'A800 / H800 / 昇腾 910B'],
    evidence: ['qwen3-inference', 'lite-mamba'],
  },
  {
    label: 'AI Agent / RAG',
    en: 'AGENT',
    items: ['Dify / RAGFlow', '工具调用', '规则引擎 / DSL', '防幻觉护栏', '确定性判定', 'RPA 编排'],
    evidence: ['contract-agent', 'scp-rpa'],
  },
  {
    label: '后端',
    en: 'BACKEND',
    items: ['Python · FastAPI', 'Java · Spring Boot 3', 'Spring Security / JWT', 'MyBatis Plus', 'MySQL / Redis', 'SSE / 断点续采'],
    evidence: ['contract-agent', 'mes-system', 'scp-rpa'],
  },
  {
    label: '前端 / 全栈',
    en: 'FRONTEND',
    items: ['Vue3 / TypeScript', 'Element Plus / Avue', 'Pinia', 'ECharts', 'Vite', 'React（本站）'],
    evidence: ['lite-mamba', 'unionplore', 'llm-wiki'],
  },
  {
    label: '深度学习',
    en: 'DEEP LEARNING',
    items: ['PyTorch', 'MONAI', '医学图像分割', 'Transformer / Mamba', '对照实验', 'BraTS2023'],
    evidence: ['lite-mamba'],
  },
  {
    label: '工程与交付',
    en: 'DELIVERY',
    items: ['Docker / Nginx', 'Linux / Slurm', '数据迁移 / 对账', 'MES / 低代码', '三级回滚', '客户对接'],
    evidence: ['taxi-platform', 'mes-system'],
  },
];

export interface TimelineItem {
  period: string;
  title: string;
  org: string;
  body: string;
  tags?: string[];
}

export const timeline: TimelineItem[] = [
  {
    period: '2023.09 – 2027.06',
    title: '智能医学工程 · 本科',
    org: '湖北医药学院',
    body: '主修智能医学工程：医学影像、机器学习、Web 开发；国家奖学金、校特等奖学金、优秀大学生标兵。',
    tags: ['医学影像', '机器学习', 'Web 开发'],
  },
  {
    period: '2026.06 – 至今',
    title: '全栈开发工程师（实习）',
    org: '武汉引力云科技有限公司',
    body: '独立负责 MES 与出租车运营平台的需求、架构、全栈开发、数据迁移、测试与部署运维。',
    tags: ['MES', '低代码', '迁移'],
  },
  {
    period: '2026.06 – 2026.09',
    title: '出租车平台重构迁移',
    org: '某出行运营企业',
    body: '92 张表、6.9 万条数据、5.1G 附件迁移；88 张表对账 src_only=0，生产切换数据零丢失。',
    tags: ['92 表', '零丢失', '三重对账'],
  },
  {
    period: '2026.07 – 至今',
    title: 'MES 生产制造执行系统',
    org: '某制造企业',
    body: '9 Tab 表单引擎 + 四类扩展；工单-工序-检验多状态机、一单一码、14 类追溯节点。',
    tags: ['状态机', '追溯', '全栈'],
  },
  {
    period: '2026',
    title: '合同预审智能体 / Lite-Mamba / Qwen3 / SCP',
    org: '独立项目',
    body: '合同判定确定性 100%；Lite-Mamba 参数量 −83.9%、Dice 0.879；Qwen3-VL-32B 单卡流式服务；SCP 取数 MVP 66 测试全绿。',
    tags: ['Agent', '医学影像', '推理服务', 'RPA'],
  },
  {
    period: '2026',
    title: '4C Web 开发挑战赛 · 国家三等奖',
    org: 'UnionPlore 在线教育平台',
    body: '若依深度二开：课程/课件、Netty WebSocket 弹幕、Gitea 集成、学生聚合视图。',
    tags: ['若依二开', 'WebSocket', 'Gitea'],
  },
];

export interface WritingPath {
  title: string;
  en: string;
  description: string;
  slugs: { slug: string; note: string }[];
}

export const writingPaths: WritingPath[] = [
  {
    title: 'Agent 工程入门',
    en: 'AGENT ENGINEERING',
    description: '从 Agent 架构到上下文工程，再到 AI 编码质量门禁。',
    slugs: [
      { slug: 'Agent_Architecture_Wiki', note: 'Agent 由什么构成' },
      { slug: 'Agent_Harness_Engineering_Wiki', note: '怎么让 Agent 可靠干活' },
      { slug: 'Context_Engineering_Wiki', note: '怎么管好上下文' },
      { slug: 'AI_Coding_Quality_Gate_Wiki', note: '怎么用证据证明做完了' },
    ],
  },
  {
    title: 'RAG 落地路径',
    en: 'RAG IN PRODUCTION',
    description: '从基础 RAG 到 Agentic / Graph RAG，再到评估基础设施。',
    slugs: [
      { slug: 'RAG_Practice_Wiki', note: 'RAG 全链路' },
      { slug: 'Agentic_RAG_Wiki', note: 'LLM 自主检索' },
      { slug: 'Graph_RAG_Deep_Dive_Wiki', note: '何时用图谱' },
      { slug: 'Eval_Infrastructure_Wiki', note: '怎么建评估' },
    ],
  },
  {
    title: '高风险 AI 治理',
    en: 'TRUST & GOVERNANCE',
    description: '幻觉治理、可观测性与安全、领域落地。',
    slugs: [
      { slug: 'Hallucination_Governance_Wiki', note: '幻觉全谱治理' },
      { slug: 'Agent_Observability_Security_Wiki', note: '看得见与管得住' },
      { slug: 'Domain_Deployment_Wiki', note: '金融/法律/医疗落地' },
    ],
  },
];

export interface FilmMeta {
  title: string;
  subtitle: string;
  src: string;
  poster: string;
  audio?: string;
  transcript?: string;
  captions?: string;
  duration: string;
  available: boolean;
  chapters: { time: string; label: string }[];
  summary: string;
}

export const film: FilmMeta = {
  title: '一份报告的旅行',
  subtitle: "A REPORT'S JOURNEY / 1:15 / 中英硬字幕",
  src: '/showcase/report-journey-75s.mp4',
  poster: '/showcase/poster.jpg',
  transcript: '/showcase/transcript.md',
  duration: '1:15',
  available: true,
  // 75s 版为 60s 时间线等比例 ×1.25；以下为关键节拍
  chapters: [
    { time: '00:00', label: '封面' },
    { time: '00:05', label: '问号' },
    { time: '00:10', label: '读片台' },
    { time: '00:18', label: '检查所见' },
    { time: '00:25', label: '能力链' },
    { time: '00:30', label: '文献索引' },
    { time: '00:38', label: '文章' },
    { time: '00:45', label: '简历' },
    { time: '00:56', label: '自述' },
    { time: '01:02', label: '签发' },
    { time: '01:10', label: '片尾' },
  ],
  summary:
    '75 秒一镜到底：一份被退回的报告缺一个受检者。小片沿着网站读完读片台、检查所见、能力链、文献、文章与简历，最后发现——报告可以自证，签名只能由本人落下。中英双语硬字幕。',
};

export const awardItems = [
  { title: '国家奖学金', note: '全国本专科生前 0.2%', kind: 'scholarship' },
  { title: '国家励志奖学金 ×2', note: '连续获得', kind: 'scholarship' },
  { title: '校特等奖学金', note: '前 0.5%', kind: 'scholarship' },
  { title: '优秀大学生标兵', note: '校级', kind: 'honor' },
  { title: '4C Web 开发挑战赛', note: '国家三等奖 · 2026', kind: 'competition' },
  { title: '全国大学生软件测试大赛', note: '国赛三等奖', kind: 'competition' },
  { title: '全国大学生数学建模竞赛', note: '省赛二等奖', kind: 'competition' },
  { title: '蓝桥杯 Python 赛道', note: '省赛三等奖', kind: 'competition' },
];
