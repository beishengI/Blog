export interface Heading {
  level: number;
  text: string;
  id: string;
}

/** 匹配 ## / ### 的 ATX 标题行（#### 及更深层级、# 一级标题均不匹配）。 */
const ATX_HEADING = /^(#{2,3})\s+(.+)$/;
/** 围栏代码块起始行：行首至多 3 个空格 + 至少 3 个 ` 或 ~，其后为可选 info string。 */
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/** 将标题文本转换为 URL 友好的 slug（支持中英文与数字）。 */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]+/g, '')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * 去掉标题里的行内 Markdown 标记，得到用于「目录显示 + slug 生成」的纯文本。
 *
 * 为什么必须共用：markdown.ts 的 heading renderer 拿到的是**已内联渲染的 HTML**
 * （`## **粗体**` → `<strong>粗体</strong>`），而 parseHeadings 拿到的是
 * **原始 Markdown 行**。两侧若不先归一化成同一份纯文本，带强调/行内代码/链接的
 * 标题会算出不同的 id，目录项就会指向不存在的锚点。
 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]*)`/g, '$1')                          // 行内代码
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')             // 图片 → alt 文本
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')              // 链接 → 链接文字（丢弃 URL）
    .replace(/\*\*(.*?)\*\*/g, '$1')                      // 加粗 **
    .replace(/__(.*?)__/g, '$1')                          // 加粗 __
    .replace(/(^|[^\w])\*([^*\n]+)\*(?![\w*])/g, '$1$2')  // 斜体 *（不影响 some_var_name 这类字面量）
    .replace(/(^|[^\w])_([^_\n]+)_(?![\w_])/g, '$1$2')    // 斜体 _
    .replace(/~~(.*?)~~/g, '$1')                          // 删除线
    .replace(/<[^>]*>/g, '')                              // 行内 HTML 标签
    .replace(/\s+#+\s*$/, '')                             // 闭合式标题的尾部 #
    .trim();
}

/**
 * 创建一个与 parseHeadings 同源的标题 id 生成器：按出现顺序对重复 slug 追加 -2 / -3 …
 * markdown.ts 在每次 renderMarkdown 前重建一个，保证 HTML 里的 id 序列与目录逐项对应。
 */
export function createHeadingIdFactory(): (raw: string) => string {
  const seen = new Map<string, number>();
  return (raw: string) => {
    // 容错：异常输入（undefined / 非字符串）退化为占位 id，不抛错
    const source = typeof raw === 'string' ? raw : '';
    const base = slugify(stripInlineMarkdown(source)) || 'section';
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count > 1 ? `${base}-${count}` : base;
  };
}

/** 从 Markdown 中解析 ## / ### 标题，生成目录数据。 */
export function parseHeadings(md: string): Heading[] {
  const headings: Heading[] = [];
  // 容错：异步加载 / 编辑器草稿可能传入 undefined 或空串
  if (typeof md !== 'string' || md.length === 0) return headings;

  const nextId = createHeadingIdFactory();
  let fence: { char: string; len: number } | null = null;

  md.split('\n').forEach((line) => {
    // 围栏代码块：块内一律不算标题。闭合行须为「同字符 + 长度 ≥ 开栏 + 其后仅空白」，
    // 与 CommonMark 一致，因此块内的 ```python 不会误闭合外栏。
    if (fence) {
      if (new RegExp(`^ {0,3}${fence.char}{${fence.len},}\\s*$`).test(line)) fence = null;
      return;
    }
    const opened = line.match(FENCE_OPEN);
    if (opened) {
      fence = { char: opened[1][0], len: opened[1].length };
      return;
    }

    const match = line.match(ATX_HEADING);
    if (!match) return;
    const text = stripInlineMarkdown(match[2]);
    if (!text) return; // 容错：空标题（"##" / "## **" 等）不进目录
    headings.push({ level: match[1].length, text, id: nextId(match[2]) });
  });

  return headings;
}
