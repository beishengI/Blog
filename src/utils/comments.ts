/**
 * 评论存储层（纯客户端，localStorage 持久化，按文章 id 分桶）。
 * 键约定遵循全站前缀 medai-blog-；所有读写均 try/catch（隐私模式容错）。
 */

export interface Comment {
  id: string;
  postId: string;
  nickname: string;
  content: string;
  /** ISO 字符串 */
  createdAt: string;
}

const COMMENTS_KEY = 'medai-blog-comments';
const COMMENTER_KEY = 'medai-blog-commenter';

export type CommentBuckets = Record<string, Comment[]>;

/** 校验并收敛任意值为合法分桶（非法键/非法评论剔除，不抛错），供读取与备份恢复共用。 */
export function sanitizeBuckets(value: unknown): CommentBuckets {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: CommentBuckets = {};
  for (const [pid, list] of Object.entries(value as Record<string, unknown>)) {
    if (typeof pid !== 'string' || !Array.isArray(list)) continue;
    out[pid] = list.filter(
      (c): c is Comment =>
        !!c &&
        typeof c === 'object' &&
        typeof (c as Comment).id === 'string' &&
        typeof (c as Comment).nickname === 'string' &&
        typeof (c as Comment).content === 'string' &&
        typeof (c as Comment).createdAt === 'string'
    );
  }
  return out;
}

/** 读取全部分桶；结构非法时返回空对象（不抛错）。 */
function readBuckets(): CommentBuckets {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return {};
    return sanitizeBuckets(JSON.parse(raw));
  } catch {
    return {};
  }
}

/** 写入全部分桶；持久化失败不影响运行期使用。 */
function writeBuckets(buckets: CommentBuckets): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(buckets));
  } catch {
    /* ignore */
  }
}

/** 生成评论 id：c-<YYYYMMDDHHmmss>-<3位随机>，同毫秒重复时重试去重。 */
function genId(existing: Comment[]): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  let id = '';
  do {
    id = `c-${ts}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  } while (existing.some((c) => c.id === id));
  return id;
}

/** 读取全部分桶（备份导出用）；无记录返回空对象。 */
export function readAllBuckets(): CommentBuckets {
  return readBuckets();
}

/** 整库替换评论分桶（备份恢复用）；结构先经 sanitizeBuckets 收敛。 */
export function replaceAllBuckets(value: unknown): CommentBuckets {
  const buckets = sanitizeBuckets(value);
  writeBuckets(buckets);
  return buckets;
}

/** 读取某篇文章的评论（无记录返回 []）。 */
export function loadComments(postId: string): Comment[] {
  return readBuckets()[postId] ?? [];
}

/** 发表评论：trim 后校验昵称 1-20 字、内容 1-500 字，非法抛错；成功返回新评论。 */
export function addComment(
  postId: string,
  input: { nickname: string; content: string }
): Comment {
  const nickname = input.nickname.trim();
  const content = input.content.trim();
  if (nickname.length < 1 || nickname.length > 20) {
    throw new Error('评论昵称需为 1-20 字');
  }
  if (content.length < 1 || content.length > 500) {
    throw new Error('评论内容需为 1-500 字');
  }
  const buckets = readBuckets();
  const list = buckets[postId] ?? [];
  const comment: Comment = {
    id: genId(list),
    postId,
    nickname,
    content,
    createdAt: new Date().toISOString(),
  };
  buckets[postId] = [...list, comment];
  writeBuckets(buckets);
  return comment;
}

/** 删除某篇文章下的指定评论。 */
export function deleteComment(postId: string, commentId: string): void {
  const buckets = readBuckets();
  const list = buckets[postId];
  if (!list) return;
  buckets[postId] = list.filter((c) => c.id !== commentId);
  writeBuckets(buckets);
}

/** 某篇文章的评论总数。 */
export function countComments(postId: string): number {
  return loadComments(postId).length;
}

/** 读取上次使用的评论昵称（单字符串，无记录返回空串）。 */
export function loadLastCommenter(): string {
  try {
    return localStorage.getItem(COMMENTER_KEY) ?? '';
  } catch {
    return '';
  }
}

/** 记住本次使用的评论昵称，便于下次自动填充。 */
export function saveLastCommenter(nickname: string): void {
  try {
    localStorage.setItem(COMMENTER_KEY, nickname);
  } catch {
    /* ignore */
  }
}
