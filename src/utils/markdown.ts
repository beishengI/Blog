import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import { createHeadingIdFactory } from './toc';
// 明色主题的 hljs 语法色（暗色覆盖见 globals.css 的 [data-mode='dark'] 段）
import 'highlight.js/styles/github.css';

marked.setOptions({ breaks: true, gfm: true });

/**
 * 标题 id 生成器：每次 renderMarkdown 前重建，
 * 使 HTML 中的 id 与 parseHeadings 产出的目录（含重复标题的 -2/-3 后缀）逐项对应。
 */
let nextHeadingId = createHeadingIdFactory();

/** 给 H2/H3 注入锚点 id + 可点击的锚点链接，供目录跳转、高亮与分享定位。 */
marked.use({
  renderer: {
    heading(text: string, level: number, raw: string) {
      if (level >= 2 && level <= 3) {
        // 用 raw（已内联渲染的纯文本）而非 text（HTML）算 id，才能与 parseHeadings 同源
        const id = nextHeadingId(raw);
        return `<h${level} id="${id}">${text}<a class="heading-anchor" href="#${id}" aria-label="链接到此章节" tabindex="0">#</a></h${level}>`;
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
    table(header: string, body: string) {
      // 宽表包一层 .table-scroll，窄屏横向滚动（样式见 globals.css），避免整页横向溢出
      const tbody = body ? `<tbody>${body}</tbody>` : '';
      return `<div class="table-scroll"><table><thead>${header}</thead>${tbody}</table></div>`;
    },
  },
});

/** 将 Markdown 转为经过消毒的 HTML，供文章详情与编辑器预览渲染。 */
export function renderMarkdown(md: string): string {
  // 每次渲染重置标题 id 计数器，保证与 parseHeadings 的去重序列一致
  nextHeadingId = createHeadingIdFactory();
  const raw = marked.parse(md) as string;
  // ADD_ATTR 只补 id / tabindex 两个属性，不放宽 allowedTags（DOMPurify 默认即允许 a/href/class/aria-*）
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['id', 'tabindex'] });
}
