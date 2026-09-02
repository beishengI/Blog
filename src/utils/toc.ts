export interface Heading {
  level: number;
  text: string;
  id: string;
}

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

/** 从 Markdown 中解析 ## / ### 标题，生成目录数据。 */
export function parseHeadings(md: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  md.split('\n').forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return;
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, '').replace(/`/g, '').trim();
    let id = slugify(text) || 'section';
    // 处理重复标题
    const count = (seen.get(id) ?? 0) + 1;
    seen.set(id, count);
    if (count > 1) id = `${id}-${count}`;
    headings.push({ level, text, id });
  });
  return headings;
}
