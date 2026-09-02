/**
 * 数据备份/恢复工具（纯客户端，无网络）。
 * 备份范围：用户文章（localStorage medai-blog-posts）、评论（medai-blog-comments）、
 * 阅读量（medai-blog-views）。内置文章保存在代码中，不参与备份。
 * 所有导入数据先经形状校验收敛，非法条目剔除并计数，不抛结构异常。
 */
import { Post, posts as builtinPosts } from '../data/posts';
import { sanitizeBuckets, type CommentBuckets } from './comments';

const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  app: 'medai-blog';
  exportedAt: string;
  posts: Post[];
  comments: CommentBuckets;
  views: Record<string, number>;
}

export interface ParsedBackup {
  posts: Post[];
  comments: CommentBuckets;
  views: Record<string, number>;
  /** 形状非法或与内置文章 id 冲突而被剔除的文章数（导入提示用）。 */
  postsDropped: number;
}

/** 触发浏览器下载（Blob + 隐形 <a>）。 */
function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** 可选字符串字段收敛为 either undefined。 */
function optString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/** 可选字符串数组字段收敛为 string[]。 */
function optStringList(v: unknown): string[] | undefined {
  return Array.isArray(v) ? v.filter((t): t is string => typeof t === 'string') : undefined;
}

/** 把宽松的备份文章对象收敛为完整 Post（缺省字段按 EditorPage 新建语义补齐）。 */
function normalizePost(p: Record<string, unknown>): Post {
  const content = p.content as string;
  const post: Post = {
    id: p.id as string,
    title: p.title as string,
    excerpt: typeof p.excerpt === 'string' ? p.excerpt : '',
    category: typeof p.category === 'string' ? p.category : '未分类',
    tags: optStringList(p.tags) ?? [],
    date: typeof p.date === 'string' ? p.date : todayStamp(),
    readingTime:
      typeof p.readingTime === 'number' && Number.isFinite(p.readingTime) && p.readingTime > 0
        ? Math.round(p.readingTime)
        : Math.max(1, Math.round(content.length / 400)),
    aiSummary: typeof p.aiSummary === 'string' ? p.aiSummary : '',
    terms: optStringList(p.terms) ?? [],
    content,
  };
  const cover = optString(p.cover);
  if (cover) post.cover = cover;
  if (p.draft === true) post.draft = true;
  const updatedAt = optString(p.updatedAt);
  if (updatedAt) post.updatedAt = updatedAt;
  const description = optString(p.description);
  if (description) post.description = description;
  const keywords = optStringList(p.keywords);
  if (keywords && keywords.length > 0) post.keywords = keywords;
  return post;
}

/** 导出全量备份 JSON 并触发下载。 */
export function exportBackup(
  posts: Post[],
  comments: CommentBuckets,
  views: Record<string, number>
): void {
  const data: BackupData = {
    version: BACKUP_VERSION,
    app: 'medai-blog',
    exportedAt: new Date().toISOString(),
    posts,
    comments,
    views,
  };
  download(
    `medai-blog-backup-${todayStamp()}.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  );
}

/** 解析并校验备份文本；非本站备份抛错（中文消息），结构非法条目剔除计数。 */
export function parseBackup(raw: string): ParsedBackup {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('文件不是合法的 JSON');
  }
  if (!isRecord(data) || data.app !== 'medai-blog' || data.version !== BACKUP_VERSION) {
    throw new Error('不是本站导出的备份文件');
  }

  const rawPosts = Array.isArray(data.posts) ? data.posts : [];
  const seen = new Set<string>();
  const postsOut: Post[] = [];
  let postsDropped = 0;
  for (const p of rawPosts) {
    if (!isRecord(p) || typeof p.id !== 'string' || typeof p.title !== 'string' || typeof p.content !== 'string') {
      postsDropped += 1;
      continue;
    }
    if (builtinPosts.some((b) => b.id === p.id) || seen.has(p.id)) {
      postsDropped += 1;
      continue;
    }
    seen.add(p.id);
    postsOut.push(normalizePost(p));
  }

  const comments = sanitizeBuckets(data.comments);
  const views: Record<string, number> = {};
  if (isRecord(data.views)) {
    for (const [id, n] of Object.entries(data.views)) {
      if (typeof n === 'number' && Number.isFinite(n) && n >= 0) views[id] = Math.floor(n);
    }
  }

  return { posts: postsOut, comments, views, postsDropped };
}

/** YAML 双引号标量（同时是合法 JSON 字符串，规避中文/冒号/引号转义歧义）。 */
const yq = (v: string) => JSON.stringify(v);

/** 单篇文章导出为 Markdown 文件（YAML frontmatter + 正文），内置文章亦可导出。 */
export function exportPostMarkdown(post: Post): void {
  const lines: string[] = [
    '---',
    `title: ${yq(post.title)}`,
    `excerpt: ${yq(post.excerpt)}`,
    `category: ${yq(post.category)}`,
    `tags: ${JSON.stringify(post.tags)}`,
    `date: ${post.date}`,
  ];
  if (post.draft === true) lines.push('draft: true');
  if (post.description) lines.push(`description: ${yq(post.description)}`);
  if (post.keywords && post.keywords.length > 0) {
    lines.push(`keywords: ${JSON.stringify(post.keywords)}`);
  }
  if (post.cover) lines.push(`cover: ${yq(post.cover)}`);
  if (post.aiSummary) lines.push(`aiSummary: ${yq(post.aiSummary)}`);
  if (post.terms.length > 0) lines.push(`terms: ${JSON.stringify(post.terms)}`);
  lines.push('---', '', post.content, '');

  download(`${post.date}-${post.id}.md`, lines.join('\n'), 'text/markdown;charset=utf-8');
}
