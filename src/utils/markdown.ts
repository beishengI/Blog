import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { slugify } from './toc';

marked.setOptions({ breaks: true, gfm: true });

/** 给 H2/H3 注入锚点 id，供目录跳转与高亮。 */
marked.use({
  renderer: {
    heading(text: string, level: number) {
      if (level >= 2 && level <= 3) {
        const id = slugify(text);
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
      return `<h${level}>${text}</h${level}>`;
    },
  },
});

/** 将 Markdown 转为经过消毒的 HTML，供文章详情渲染。 */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md) as string;
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['id'] });
}
