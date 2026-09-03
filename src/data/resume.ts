/**
 * 简历页结构化数据(src/pages/ResumePage.tsx 消费)。
 * 文案原则:只写可核查的事实(数字、名词、后果),不写口号。
 * A4 打印版在 public/resume-doc.html,两处内容保持一致。
 */

export const resumeHero = {
  name: '北省',
  facts:
    '智能医学工程 2027 届。做过医学影像分割模型,也把大模型部署成过线上服务——现在专注 AI 应用开发。',
  tags: ['AI 应用开发', 'RAG · Agent', '医学影像 AI', '全栈'],
  email: '1611045292@qq.com',
  github: 'beishengI',
  location: '湖北 · 武汉',
};

export const resumeSkills: { label: string; items: string[] }[] = [
  {
    label: '大模型推理与部署',
    items: ['Qwen3-VL 服务化', 'SSE 流式输出', '模型量化加速', '请求级性能遥测', 'A800 / H800 / 昇腾 910B'],
  },
  {
    label: 'AI Agent / RAG',
    items: ['Dify / RAGFlow', '向量检索', 'Agent 编排与工具调用', 'Function Calling', 'LangChain / LlamaIndex'],
  },
  {
    label: '后端',
    items: ['Python · FastAPI', 'Java · Spring Boot', 'Spring Security / JWT', 'MySQL / Redis', 'RESTful / 接口限流'],
  },
  {
    label: '前端 / 全栈',
    items: ['Vue3', 'TypeScript', 'Element Plus', 'Pinia', 'ECharts', 'Vite'],
  },
  {
    label: '深度学习',
    items: ['PyTorch', 'MONAI', '医学图像分割', 'Transformer / Mamba', 'BERTopic'],
  },
  {
    label: '工程与运维',
    items: ['Linux', 'Docker / Nginx', 'Git', 'Kubernetes(了解)', 'Prompt 工程(持认证)'],
  },
];

export interface ResumeProject {
  name: string;
  tag: string;
  period: string;
  points: string[];
  stack: string[];
  link?: string;
}

export const resumeProjects: ResumeProject[] = [
  {
    name: '合同预审智能体',
    tag: 'Agent 编排 / 规则引擎',
    period: '2026 至今',
    points: [
      '面向某国企合同「三单比对」人工审核量大、漏判风险高的痛点,基于低代码平台从 0 到 1 交付,覆盖 6 类合同模板',
      '设计「Dify 字段抽取 → 语义对齐 → 纯 Java 规则引擎」三层架构:判定不依赖大模型,确定性 100%,5 种比对模式',
      '四级判定(OK/WARN/BLOCK/MISSING)+ 状态机 + SSE 实时进度 + 报告版本化与多轮追问,接入 OpenAI 流式对话',
    ],
    stack: ['Spring Boot 3', 'Vue3', 'Dify', 'MySQL / Redis', 'OpenAI API'],
  },
  {
    name: 'Lite-Mamba 医学影像分割可视化系统',
    tag: '模型训练 · 评估 / 医疗 AI',
    period: '2026 至今',
    link: 'https://github.com/beishengI/Lite-Mamba-Visualization',
    points: [
      '在 HPC 集群(A800 80GB,Slurm + Apptainer)自主训练轻量分割模型:BraTS2023 脑肿瘤任务,1251 例 4 模态 MRI',
      '16 组对照实验:参数量 10.9M(↓83.9%)、计算量 ↓86.5%,Dice 0.879(仅降 0.97pt)且 HD95 反优于基线',
      'FastAPI + Vue3 + ECharts 可视化平台:E001–E016 指标对比、三视图切片、.nii.gz 在线推理、四类报告一键导出',
    ],
    stack: ['PyTorch', 'MONAI', 'FastAPI', 'Vue3', 'ECharts', 'Docker/Nginx'],
  },
  {
    name: 'Qwen3 大模型在线推理服务与性能优化',
    tag: '模型部署 · 推理加速',
    period: '2026',
    points: [
      '独立部署 Qwen3-VL-32B:bfloat16 单卡约 70GB,FastAPI 封装 OpenAI 兼容 API,TextIteratorStreamer 实现逐 token 流式',
      '自研 PerformanceMonitor:逐请求记录时延 / token / GPU 利用率 / 显存并落盘 JSONL,支撑吞吐与首字时延瓶颈定位',
      'H800(80GB)与昇腾 910B 异构硬件完成量化与推理加速;以 tmux 会话 + SSH 反向隧道 + 自愈脚本保障长稳在线',
    ],
    stack: ['Qwen3-VL-32B', 'BGE-M3', 'FastAPI', 'SSE', '昇腾 910B'],
  },
  {
    name: '大学代码课程学生管理系统',
    tag: '全栈开发 / 权限管理',
    period: '2026',
    points: [
      '基于若依(RuoYi)二次开发的「学生-课程」信息管理系统,获 4C Web 开发挑战赛国家三等奖',
      'Spring Security + JWT 权限认证、动态权限菜单、代码生成器自动化生成接口与页面',
    ],
    stack: ['Spring Boot', 'Spring Security', 'Redis', 'Vue3', 'MySQL'],
  },
  {
    name: '某市商业出租车管理系统平台',
    tag: '低代码全栈',
    period: '2026',
    points: [
      'JeeLowCode 低代码框架:在线建表、统计报表(SQL 即报表)、多表关联、租户数据权限',
      '沉淀「JeeLowCode 开发技能包」——框架架构、四种增强模式、硬性约束与运行时校验清单等标准化文档',
    ],
    stack: ['Spring Boot', 'JeeLowCode', 'Vue3', 'OpenAI API'],
  },
];

export const resumeEducation = {
  school: '湖北医药学院',
  major: '智能医学工程 · 本科(2027 届)',
  period: '2023.09 – 2027.06',
  highlight: '平均学分绩点 3.77(专业第 1 · 已修 65 门,0 不及格),平均分 89.75',
  courses: ['Python 程序设计 95.5', '机器学习及应用 91.6', 'Web 开发技术 94.8/96', '数据挖掘', '大数据关键技术', '数据库系统原理', '计算机网络'],
};

export const resumeHonors = [
  '全国 4C Web 开发挑战赛 · 国家三等奖',
  '全国大学生软件测试大赛 · 国赛三等奖',
  '全国大学生数学建模竞赛 · 省赛二等奖',
  '蓝桥杯(Python 赛道)· 省赛三等奖',
  '国家励志奖学金(连续)',
  '校特等奖学金(前 0.5%)',
  '优秀大学生标兵',
];

export const resumeCertificates = ['CET-4', '工业互联网平台开发工程师(初级)', 'Prompt 工程师', 'Python 计算机二级'];

export const resumeSummary =
  '专业背景是智能医学工程,做的事横跨两层:往下碰过模型训练与评估(Lite-Mamba 分割模型、16 组对照实验),往上做过部署与推理服务化(Qwen3-VL 流式服务、H800/昇腾 910B 量化加速)与 RAG / Agent 智能体,再用全栈 Web 把它们包成可用的系统。数据清洗、实验记录、量化加速、API 封装、线上排查,完整链路都亲手跑过一遍。';
