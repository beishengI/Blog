/**
 * 阅读量统计存储层（纯客户端，不引入任何网络/第三方统计）。
 * - localStorage 键 medai-blog-views：Record<postId, number>（累计阅读次数）
 * - sessionStorage 键 medai-blog-viewed：JSON 数组存本会话已计数的文章 id
 *   （同一浏览器会话同一文章只计 1 次；读失败视为空）。
 * 所有读写均 try/catch（隐私模式/沙箱 iframe 容错），持久化失败不影响运行期使用。
 */

const VIEWS_KEY = 'medai-blog-views';
const VIEWED_KEY = 'medai-blog-viewed';

type ViewCounts = Record<string, number>;

/** 读取全站阅读量；结构非法时返回空对象（不抛错）。 */
function readViewCounts(): ViewCounts {
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ViewCounts = {};
    for (const [id, n] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof id === 'string' && typeof n === 'number' && Number.isFinite(n) && n >= 0) {
        out[id] = Math.floor(n);
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** 写入全站阅读量；持久化失败静默忽略。 */
function writeViewCounts(counts: ViewCounts): void {
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(counts));
  } catch {
    /* ignore */
  }
}

/** 读取本会话已计数的文章 id；读失败视为空。 */
function readViewedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

/** 写入本会话已计数的文章 id；失败静默忽略（下次进入可能重复 +1，可接受）。 */
function writeViewedIds(ids: string[]): void {
  try {
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** 读取某篇文章的累计阅读次数（无记录返回 0）。 */
export function getViewCount(id: string): number {
  return readViewCounts()[id] ?? 0;
}

/** 记录一次阅读：同一浏览器会话同一文章只计 1 次（sessionStorage 去重）。 */
export function recordView(id: string): void {
  if (!id) return;
  const viewed = readViewedIds();
  if (viewed.includes(id)) return;
  const counts = readViewCounts();
  counts[id] = (counts[id] ?? 0) + 1;
  writeViewCounts(counts);
  writeViewedIds([...viewed, id]);
}

/** 读取全站阅读量（供热门排行等组件使用）；无记录返回空对象。 */
export function getAllViewCounts(): ViewCounts {
  return readViewCounts();
}
