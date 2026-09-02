/**
 * LLM Wiki 知识库索引与加载器。
 * - 30 篇文档以原始 Markdown 形式存放于本目录（与仓库同源，便于在 GitHub 直接阅读）。
 * - 元信息（标题 / 所属层 / 简介）在此静态维护，分组逻辑来自 LLM_Wiki_INDEX.md。
 * - 正文通过 Vite 的 import.meta.glob 按需懒加载，沿用项目的 marked + DOMPurify 渲染链路。
 */

export type WikiLayer =
  | '理论层'
  | '选型与工具层'
  | '流程方法论层'
  | '规范与能力封装层';

export interface WikiDoc {
  slug: string;
  title: string;
  layer: WikiLayer;
  description: string;
}

/** 顶层分组顺序（决定知识库列表页的呈现顺序）。 */
export const WIKI_LAYERS: WikiLayer[] = [
  '理论层',
  '选型与工具层',
  '流程方法论层',
  '规范与能力封装层',
];

export const wikiDocs: WikiDoc[] = [
  // —— 理论层 ——
  { slug: 'Agent_Architecture_Wiki', title: 'Agent 核心架构', layer: '理论层', description: 'Agent 由什么构成、如何运转？ReAct / Agent Loop / workflow / ETCLOVG。' },
  { slug: 'Agent_Harness_Engineering_Wiki', title: 'Agent Harness 详解', layer: '理论层', description: '怎么让 Agent 可靠干活？ETCLOVG 七层框架 + Harness 自动合成。' },
  { slug: 'Harness_Model_CoEvolution_Wiki', title: 'Harness×模型协同进化', layer: '理论层', description: 'harness 与模型如何互相塑造？“模型吃 harness”之争。' },
  { slug: 'Context_Engineering_Wiki', title: '上下文工程', layer: '理论层', description: '怎么系统性地管好上下文？系统化框架与最佳实践。' },
  { slug: 'Context_Rot_Wiki', title: '上下文腐烂', layer: '理论层', description: '上下文为什么越用越烂？如何测量、防御。' },
  { slug: 'Agent_Memory_Wiki', title: 'Agent 记忆系统', layer: '理论层', description: '记忆怎么分层、怎么选框架？深度解析。' },
  { slug: 'Memory_Engineering_Wiki', title: '记忆系统工程化', layer: '理论层', description: '记忆生产级怎么做？冲突 / 编辑 / 评估 / 防坑。' },
  { slug: 'Memory_Security_Wiki', title: '记忆安全与对抗', layer: '理论层', description: '记忆投毒 / 提取攻击怎么防？' },
  { slug: 'Prompt_Engineering_Wiki', title: 'Prompt Engineering', layer: '理论层', description: '怎么对模型说话？CoT / ToT / 官方方法 / 程序化优化。' },
  { slug: 'Agent_Observability_Security_Wiki', title: '可观测性与安全治理', layer: '理论层', description: '怎么“看得见”与“管得住”Agent？三支柱 + OWASP 全谱。' },

  // —— 选型与工具层 ——
  { slug: 'Agent_Tools_Selection_Wiki', title: 'Agent 工具生态与选型', layer: '选型与工具层', description: 'Claude Code / Codex / Cursor 怎么选？怎么配合？' },
  { slug: 'Domestic_Toolchain_Wiki', title: '国产工具链对比分析', layer: '选型与工具层', description: 'TRAE / Kimi Code / DeepSeek Harness / 通义灵码 怎么选？与国外差距在哪？' },

  // —— 流程方法论层 ——
  { slug: 'Vibe_Coding_Methodology_Wiki', title: 'Vibe Coding 防屎山方法论', layer: '流程方法论层', description: '如何避免 AI 写出屎山？文档优先 / 审问 / 五阶段。' },
  { slug: 'Research_Agent_Workflow_Wiki', title: '科研 Agent 工作流', layer: '流程方法论层', description: '科研项目如何用 Agent 从 0 到 1？' },
  { slug: 'AI_Coding_Quality_Gate_Wiki', title: 'AI 编码质量防线', layer: '流程方法论层', description: '如何让 AI 用证据证明“做完了”？' },
  { slug: 'RAG_Practice_Wiki', title: 'RAG 实战全链路', layer: '流程方法论层', description: 'RAG 系统怎么从数据到评估完整落地？' },
  { slug: 'Agentic_RAG_Wiki', title: 'Agentic RAG 深入实战', layer: '流程方法论层', description: 'LLM 自主检索怎么做？模式 / 框架 / 护栏。' },
  { slug: 'Graph_RAG_Deep_Dive_Wiki', title: 'Graph RAG 深入实战', layer: '流程方法论层', description: '何时用 Graph RAG？怎么落地？成本如何？' },
  { slug: 'Multi_Agent_Design_Wiki', title: '多智能体协作设计', layer: '流程方法论层', description: '多 agent 怎么协作？模式 / 框架 / 成本与风险。' },
  { slug: 'Multi_Agent_Protocol_Wiki', title: '多智能体通信协议', layer: '流程方法论层', description: 'MCP / A2A / Handoffs 怎么选？怎么实现？' },
  { slug: 'Multi_Agent_Security_Wiki', title: '多智能体安全与滥用', layer: '流程方法论层', description: '注入传播 / 流氓代理 / 级联失败怎么防？' },
  { slug: 'Multi_Agent_Evaluation_Wiki', title: '多智能体评测与基准', layer: '流程方法论层', description: '多 agent 系统怎么测？基准怎么选？方法学批判。' },
  { slug: 'Agent_Benchmarks_Wiki', title: '评测基准盘点', layer: '流程方法论层', description: '有哪些评测基准、各测什么、怎么选、怎么防被分数骗？' },
  { slug: 'Eval_Infrastructure_Wiki', title: '评估基础设施搭建', layer: '流程方法论层', description: '怎么建自己的评估体系？Golden Set / Judge / 门禁。' },
  { slug: 'Prompt_Optimization_Practice_Wiki', title: 'Prompt 自动优化实战', layer: '流程方法论层', description: 'DSPy 怎么落地？何时程序化 vs 手工？' },
  { slug: 'Domain_Deployment_Wiki', title: '领域落地实战', layer: '流程方法论层', description: '金融 / 法律 / 医疗怎么落地？合规 / 溯源 / 评测。' },
  { slug: 'Agent_Economics_Wiki', title: 'Agent 经济性', layer: '流程方法论层', description: 'token 成本怎么算、怎么控？成本-精度怎么权衡？' },
  { slug: 'Hallucination_Governance_Wiki', title: '幻觉治理专题', layer: '流程方法论层', description: '幻觉成因 / 检测 / 缓解怎么全谱治理？' },

  // —— 规范与能力封装层 ——
  { slug: 'LLM_Wiki', title: '上下文文件编写指南', layer: '规范与能力封装层', description: 'CLAUDE.md / AGENTS.md 怎么写？' },
  { slug: 'LLM_Skills_Wiki', title: 'Agent Skills 完全指南', layer: '规范与能力封装层', description: 'Skill 是什么、怎么写、怎么选？' },
];

const modules = import.meta.glob('./*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

const slugToFile = new Map<string, string>();
for (const key of Object.keys(modules)) {
  const file = key.replace(/^\.\//, '').replace(/\.md$/, '');
  slugToFile.set(file, key);
}

export function getWikiDoc(slug: string): WikiDoc | undefined {
  return wikiDocs.find((d) => d.slug === slug);
}

const slugSet = new Set(wikiDocs.map((d) => d.slug));

/** 把文档内指向其他 wiki 的 .md 链接改写为站点内路由，保持知识库内跳转可用。 */
function rewriteWikiLinks(md: string): string {
  return md.replace(/\]\(([^)]+?\.md)(#[^)]*)?\)/g, (_m, p1: string, anchor?: string) => {
    const base = p1.split('/').pop()!.replace(/\.md$/, '');
    if (slugSet.has(base)) {
      return `](/wiki/${base}${anchor ?? ''})`;
    }
    return `](${p1}${anchor ?? ''})`;
  });
}

/** 按需加载某篇 wiki 正文（已重写内部链接）。 */
export async function loadWikiContent(slug: string): Promise<string> {
  const key = slugToFile.get(slug);
  if (!key) throw new Error(`Wiki doc not found: ${slug}`);
  const raw = await modules[key]();
  return rewriteWikiLinks(raw);
}
