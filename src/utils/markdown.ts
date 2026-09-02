import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import { slugify } from './toc';
// 明色主题的 hljs 语法色（暗色覆盖见 globals.css 的 [data-mode='dark'] 段）
import 'highlight.js/styles/github.css';

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
    code(code: string, infostring: string | undefined, _escaped: boolean) {
      const lang = (infostring || '').trim().split(/\s+/)[0];
      const highlighted =
        lang && hljs.getLanguage(lang)
          ? hljs.highlight(code, { language: lang }).value
          : hljs.highlightAuto(code).value;
      // 白名单化后拼入 class，防止 infostring 越界字符逃出属性
      const safeLang = lang.replace(/[^A-Za-z0-9_+#.-]/g, '');
      const langClass = safeLang ? ` language-${safeLang}` : '';
      return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>`;
    },
  },
});

/** 将 Markdown 转为经过消毒的 HTML，供文章详情与编辑器预览渲染。 */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md) as string;
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['id'] });
}
