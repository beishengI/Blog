import type { Post } from '../../../data/posts';

/** 两位编号：01 / 07 / 12 */
export function pad2(value: number): string {
  return value < 10 ? '0' + String(value) : String(value);
}

/** 2026-09-02 → 2026.09.02（刊物的日期写法） */
export function fmtDate(date: string): string {
  return date.split('-').join('.');
}

export interface CategoryCount {
  name: string;
  count: number;
}

/** 分类顺序：先固定顺序，再补未列出的新分类（按数量降序） */
const CATEGORY_ORDER = ['工程', '医学影像', '可解释性', 'NLP', '随笔'];

export function countCategories(posts: Post[]): CategoryCount[] {
  const map = new Map<string, number>();
  posts.forEach(post => {
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
  });
  const rows: CategoryCount[] = [];
  map.forEach((count, name) => rows.push({ name, count }));
  rows.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.name);
    const bi = CATEGORY_ORDER.indexOf(b.name);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return b.count - a.count || a.name.localeCompare(b.name);
  });
  return rows;
}

/**
 * 本期拼贴的七篇文章（按故事权重，不按日期）。
 * 顺序同时决定刊头目录编号与 Bento 的入场次序。
 */
export const EDITORIAL_ORDER = [
  'contract-preaudit-agent',
  'jiayu-lowcode-migration',
  'cnn-ct-segmentation',
  'rag-clinical-qa',
  'gradcam-interpretability',
  'deploy-fastapi',
  'study-notes-ml',
];

/** 封面粉碎标题：仅当手工断行与真实标题完全一致时才采用，避免与数据漂移 */
export function coverTitleLines(title: string): string[] {
  const manual = ['合同预审智能体:', 'Dify 抽取 + 纯规则', '判定的确定性设计'];
  return manual.join('') === title ? manual : [title];
}
