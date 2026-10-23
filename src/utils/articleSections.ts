/**
 * 文章内页的章节切分工具。
 *
 * 背景：文章正文由 renderMarkdown 一次性渲染成完整 HTML（保留 h2/h3 的锚点 id），
 * 编辑式内页需要把「intro + 每个 H2 章节」拆开，才能在章节之间插入情绪锚点、
 * 或在章节内部指定位置插入石墨暗室，同时不破坏任何原有节点。
 *
 * 为什么用 DOMParser 而不是正则切字符串：
 * 正文里存在代码块、表格、引用，其中完全可能出现「##」「<h2>」等字面量；
 * 正则切会把它们切坏，DOMParser 按真实 DOM 结构分组，天然安全。
 *
 * 安全边界：入参来自 renderMarkdown（DOMPurify 已消毒）；本模块只做节点搬运，
 * 不新增标签、不改属性，返回的 HTML 仍然来自同一份已消毒的输入。
 */

export interface ArticleSectionData {
  /** H2 的锚点 id（与 parseHeadings 同源，可直接作为目录 href） */
  id: string;
  /** 去掉 heading-anchor「#」后的纯文本标题 */
  title: string;
  /** 章节短名：冒号 / 顿号 / 斜杠前的第一段，用于墨线目录与章号 */
  shortTitle: string;
  /** 从该 H2 起、到下一个 H2 前的完整 HTML（含 H2 本身） */
  html: string;
}

export interface ArticleSectionsData {
  /** 第一个 H2 之前的全部 HTML（标题、首段等） */
  introHtml: string;
  sections: ArticleSectionData[];
}

/** 取标题纯文本：克隆节点后移除可点击锚点，避免把「#」读进目录。 */
function headingText(heading: Element): string {
  const clone = heading.cloneNode(true) as Element;
  clone.querySelectorAll('.heading-anchor').forEach(node => node.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** 章节目录短名：只取第一个标点前的部分，例如「规则体系:配置 / 策略 / DSL 三级」→「规则体系」。 */
export function shortHeading(title: string): string {
  const head = title.split(/[:：·/|—,，、]/)[0]?.trim();
  return head || title;
}

/** 把一组节点按原顺序序列化为 HTML 字符串（不追加包裹层）。 */
function serializeNodes(doc: Document, nodes: Element[]): string {
  const holder = doc.createElement('div');
  nodes.forEach(node => holder.appendChild(node.cloneNode(true)));
  return holder.innerHTML;
}

/**
 * 把完整正文 HTML 拆成 intro + 按 H2 分组的章节。
 * 没有 H2 时 introHtml 为空字符串、sections 为空（页面按单篇散文整体渲染）。
 */
export function splitArticleHtml(html: string): ArticleSectionsData {
  if (typeof DOMParser === 'undefined' || typeof html !== 'string' || html.length === 0) {
    return { introHtml: html, sections: [] };
  }

  const doc = new DOMParser().parseFromString('<!doctype html><body>' + html + '</body>', 'text/html');
  const body = doc.body;
  const intro: Element[] = [];
  const groups: { heading: Element; nodes: Element[] }[] = [];

  Array.from(body.children).forEach(node => {
    if (node.tagName === 'H2') {
      groups.push({ heading: node, nodes: [] });
      return;
    }
    const last = groups[groups.length - 1];
    if (last) last.nodes.push(node);
    else intro.push(node);
  });

  const sections: ArticleSectionData[] = groups.map(group => {
    const title = headingText(group.heading);
    const id = group.heading.id || '';
    return {
      id,
      title,
      shortTitle: shortHeading(title),
      html: serializeNodes(doc, [group.heading, ...group.nodes]),
    };
  });

  return { introHtml: serializeNodes(doc, intro), sections };
}

export interface SplitBeforeLastBlockquote {
  /** 最后一个 blockquote 之前的 HTML（含所在章节的标题与正文前半） */
  headHtml: string;
  /** 最后一个 blockquote 及其之后的 HTML（通常只有尾注引用） */
  tailHtml: string;
}

/**
 * 在「最后一个 blockquote 之前」切一刀，用于把石墨暗室插到尾注引用之前。
 *
 * 若被引用的 blockquote 被包在别的容器里（少见），则上溯到该容器作为切点，
 * 保证插入点仍然在它前面，绝不丢内容。没有 blockquote 时 tailHtml 为空。
 */
export function splitBeforeLastBlockquote(html: string): SplitBeforeLastBlockquote {
  if (typeof DOMParser === 'undefined' || typeof html !== 'string' || html.length === 0) {
    return { headHtml: html, tailHtml: '' };
  }

  const doc = new DOMParser().parseFromString('<!doctype html><body>' + html + '</body>', 'text/html');
  const quotes = doc.body.querySelectorAll('blockquote');
  const lastQuote = quotes[quotes.length - 1];
  if (!lastQuote) return { headHtml: html, tailHtml: '' };

  let cut: Element = lastQuote;
  while (cut.parentElement && cut.parentElement !== doc.body) cut = cut.parentElement;

  const headNodes: Element[] = [];
  const tailNodes: Element[] = [];
  let inTail = false;
  Array.from(doc.body.children).forEach(node => {
    if (node === cut) inTail = true;
    if (inTail) tailNodes.push(node);
    else headNodes.push(node);
  });

  return {
    headHtml: serializeNodes(doc, headNodes),
    tailHtml: serializeNodes(doc, tailNodes),
  };
}

/** 按标题前缀找章节下标：优先完整标题前缀，其次短名前缀；找不到返回 -1。 */
export function findSectionIndex(sections: ArticleSectionData[], headingPrefix: string): number {
  if (!headingPrefix) return -1;
  return sections.findIndex(
    section =>
      section.title.startsWith(headingPrefix) || section.shortTitle.startsWith(headingPrefix)
  );
}
