#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * qa-editorial.cjs — 《读片》VOL.07 改版实现 · 全站 QA（独立验证）
 *
 * 用法（Windows / PowerShell）：
 *   $env:NODE_PATH='C:\Users\86138\AppData\Roaming\npm\node_modules\@playwright\cli\node_modules'
 *   node scripts\qa-editorial.cjs
 *   node scripts\qa-editorial.cjs --base=http://127.0.0.1:5173 --strict-content
 *
 * 参数 / 环境变量：
 *   --base=<url>        站点根地址，默认 http://127.0.0.1:5173（或 QA_BASE）
 *   --only=home,work    只跑指定 slug（逗号分隔）
 *   --strict-content    /posts 与文章页内容检查不再降级为 WIP（终检用）
 *   --no-full           不输出 1440/390 全页长截图
 *   --headed            有头模式
 *
 * 覆盖：
 *   - 路由：/、/posts、文章页、/work、/work/contract-agent、/wiki、wiki 详情、/about、
 *           /resume、/archive、/tags、/posts?cat=、/posts?q=，附加 /tags/Agent、/admin
 *   - 视口：1440x900 / 1024x768 / 390x844
 *   - 全局 chrome：.ed-band 高度 / sticky / sticky 滚动、导航 00–05 文本与 aria-current、
 *                  检索面板、声音 / 日夜开关（含 localStorage）、移动端菜单 ESC + 焦点回归
 *   - 布局：横向溢出（含溢出元素）、console error / pageerror、4xx/5xx 与请求失败
 *   - 内容：h1、body 非空、footer 链接数、/posts 的 7 个标题、文章页 6 个 H2 / 锚点顺序 /
 *           评论 / 相关 / 上下篇（页面未完成时记 WIP，strict 模式下才失败）
 *   - 暗色：data-mode=dark 下逐路由截图与底色 / 纯白块 / 溢出 / console 检查
 *
 * 产物：.verify/editorial/*.png + report.json
 * 退出码：0 = 无严重问题（WIP 不阻塞）；1 = 有严重问题
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.verify', 'editorial');
const T0 = Date.now();
const STARTED = new Date().toISOString();

const argv = process.argv.slice(2);
function getArg(name) {
  const prefix = '--' + name + '=';
  const hit = argv.find((a) => a.indexOf(prefix) === 0);
  return hit ? hit.slice(prefix.length) : null;
}
const BASE = (process.env.QA_BASE || getArg('base') || 'http://127.0.0.1:5173').replace(/\/+$/, '');
const STRICT = argv.indexOf('--strict-content') >= 0 || process.env.QA_STRICT === '1';
const NO_FULL = argv.indexOf('--no-full') >= 0;
const HEADLESS = argv.indexOf('--headed') < 0;
const ONLY = (getArg('only') || '').split(',').map((s) => s.trim()).filter(Boolean);

const NAV = [
  { no: '00', label: '读片台', href: '/' },
  { no: '01', label: '项目', href: '/work' },
  { no: '02', label: '文章', href: '/posts' },
  { no: '03', label: '知识库', href: '/wiki' },
  { no: '04', label: '简历', href: '/resume' },
  { no: '05', label: '关于', href: '/about' },
];

const POST_TITLES = [
  '合同预审智能体:Dify 抽取 + 纯规则判定的确定性设计',
  '从 PHP 单体到低代码平台:出租车公司系统的迁移实战',
  '用 U-Net 做肺部 CT 图像分割：从数据到部署',
  '可解释性实战：用 Grad-CAM 让模型「说清」它在看哪',
  '构建临床知识库问答：RAG 而非微调',
  '把模型做成 API：FastAPI + ONNX 推理服务',
  '大四实习笔记：医院影像科的 AI 落地观察',
];

const ARTICLE_PATH = '/posts/contract-preaudit-agent';
const ARTICLE_H2 = ['痛点', '三层架构', '规则体系', '防幻觉', '工程化', '用对抗测试换质量'];
const PAUSE_A = '预审要的不是';
const PAUSE_B = '可信度不来自';

const ROUTES = [
  { slug: 'home', path: '/', h1: '让模型，在真实系统里跑起来。', current: 0 },
  { slug: 'posts', path: '/posts', current: 2, content: 'posts' },
  { slug: 'article-contract', path: ARTICLE_PATH, h1: '合同预审智能体:Dify 抽取 + 纯规则判定的确定性设计', current: 2, content: 'article' },
  { slug: 'work', path: '/work', h1: '七项工程，一条能力链路', current: 1 },
  { slug: 'work-contract', path: '/work/contract-agent', h1: '合同预审智能体', current: 1 },
  { slug: 'wiki', path: '/wiki', h1: '30 篇 Agent 知识，四层结构', current: 3 },
  { slug: 'wiki-context', path: '/wiki/Context_Engineering_Wiki', h1Prefix: '上下文工程', current: 3 },
  { slug: 'about', path: '/about', h1: '把证据做进系统的人', current: 5 },
  { slug: 'resume', path: '/resume', h1: '张栋栋', current: 4 },
  { slug: 'archive', path: '/archive', h1: '按时间翻卷', current: null, mobileCurrent: '归档', currentNote: '不在 00–05 导航内：桌面无 aria-current（符合预期）；移动端 current 应显示「归档」' },
  { slug: 'tags', path: '/tags', h1: '标签不是分类，是线索', current: null, mobileCurrent: '标签', currentNote: '不在 00–05 导航内：桌面无 aria-current（符合预期）；移动端 current 应显示「标签」' },
  { slug: 'posts-cat', path: '/posts?cat=工程', current: 2, content: 'posts', subset: true, expectFilterCount: 3 },
  { slug: 'posts-q', path: '/posts?q=规则', current: 2, content: 'posts', subset: true, expectFilterCount: 1 },
  { slug: 'tags-agent', path: '/tags/Agent', current: null, mobileCurrent: '标签', extra: true, currentNote: '不在 00–05 导航内：桌面无 aria-current（符合预期）；移动端 current 应显示「标签」' },
  { slug: 'admin', path: '/admin', current: null, mobileCurrent: '管理', extra: true, currentNote: '不在 00–05 导航内：桌面无 aria-current（符合预期）；移动端 current 应显示「管理」' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

const DARK_KEY_390 = ['home', 'posts', 'article-contract', 'resume', 'work'];

/** 额外窄视口复核（Lead 修复 footer 640–1023 溢出后追加）：全路由横向溢出 / footer 溢出 / 发行条 */
const NARROW_VIEWPORTS = [
  { name: 'narrow768', width: 768, height: 900 },
  { name: 'narrow640', width: 640, height: 900 },
];

const report = {
  meta: {
    base: BASE,
    startedAt: STARTED,
    script: 'scripts/qa-editorial.cjs',
    strictContent: STRICT,
    headless: HEADLESS,
    viewports: VIEWPORTS.map((v) => v.width + 'x' + v.height),
    routes: ROUTES.map((r) => r.path),
  },
  summary: {},
  observations: [],
  issues: [],
  routes: [],
  interactions: [],
  dark: [],
  narrow: [],
  screenshots: [],
};

function norm(text) {
  return String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
}
function compact(text) {
  return norm(text).replace(/\s+/g, '');
}
function shorten(text, limit) {
  const s = String(text == null ? '' : text);
  return s.length > limit ? s.slice(0, limit) + '…' : s;
}
function relPath(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}
function deepDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function cleanOldShots() {
  // 只清理本脚本命名的截图，避免误删其他验证成员的临时产物
  const mine = /^(desktop|tablet|mobile)-|^dark-(desktop|mobile)-|^state-(desktop|tablet|mobile)-|^narrow-(768|640)-/;
  try {
    for (const file of fs.readdirSync(OUT)) {
      if (/\.png$/i.test(file) && mine.test(file)) fs.unlinkSync(path.join(OUT, file));
    }
  } catch (e) { /* 目录可能还不存在 */ }
}

function addIssue(severity, route, viewport, check, detail) {
  report.issues.push({
    severity,
    route: route || null,
    viewport: viewport || null,
    check,
    detail: shorten(detail, 700),
  });
}

function push(state, name, status, detail, opts) {
  opts = opts || {};
  let final = status;
  let note = detail || '';
  if (final === 'fail' && state.wip && !opts.global && !STRICT) {
    final = 'wip';
    note = 'WIP（/posts 或文章页改造中）· ' + note;
  }
  if (final === 'wip' && STRICT) {
    final = 'fail';
    note = 'strict · ' + note;
  }
  state.checks.push({ name, status: final, detail: shorten(note, 500) });
  if (final === 'fail') addIssue('error', state.route.path, state.vp.name, name, note);
  else if (final === 'warn') addIssue('warn', state.route.path, state.vp.name, name, note);
  else if (final === 'wip') addIssue('wip', state.route.path, state.vp.name, name, note);
  return final;
}

function worstStatus(checks) {
  const order = { fail: 5, error: 5, warn: 4, wip: 3, pass: 2, skip: 1 };
  let worst = 'pass';
  for (const c of checks) {
    if (order[c.status] > order[worst]) worst = c.status;
  }
  return worst;
}

/* ============================================================
   页面内部快照（在浏览器里执行）
   ============================================================ */
function inspectPage(arg) {
  const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const band = document.querySelector('.ed-band');
  const bandRect = band ? band.getBoundingClientRect() : null;
  const bandStyle = band ? getComputedStyle(band) : null;
  const navEl = document.querySelector('.ed-band__nav');
  const navLinks = Array.from(document.querySelectorAll('.ed-band__nav a')).map((a) => ({
    text: norm(a.textContent),
    current: a.getAttribute('aria-current'),
    href: a.getAttribute('href'),
    display: getComputedStyle(a).display,
  }));
  const currentEl = document.querySelector('.ed-band__current');
  const currentStyle = currentEl ? getComputedStyle(currentEl) : null;
  const currentMarker = currentEl ? {
    text: norm(currentEl.textContent),
    visible: currentStyle.display !== 'none' && currentStyle.visibility !== 'hidden',
  } : null;
  const utils = Array.from(document.querySelectorAll('.ed-band__util')).map((b) => ({
    text: norm(b.textContent),
    display: getComputedStyle(b).display,
    ariaLabel: b.getAttribute('aria-label'),
  }));
  const menuBtnEl = document.querySelector('.ed-band__menu-btn');
  const menuBtn = menuBtnEl ? { display: getComputedStyle(menuBtnEl).display, text: norm(menuBtnEl.textContent) } : null;
  const h1s = Array.from(document.querySelectorAll('h1')).map((h) => norm(h.textContent)).filter(Boolean);
  const h2s = Array.from(document.querySelectorAll('h2')).map((h) => norm(h.textContent));
  const footer = document.querySelector('.site-footer');
  const footerLinks = footer ? Array.from(footer.querySelectorAll('a')).length : 0;
  const bodyText = norm(document.body.innerText);
  const main = document.querySelector('main');
  const cw = document.documentElement.clientWidth;
  const overflowElements = [];
  const all = document.querySelectorAll('body *');
  for (let i = 0; i < all.length; i += 1) {
    const el = all[i];
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const over = Math.max(r.right - cw, -r.left);
    if (over > 1) {
      overflowElements.push({
        over: Math.round(over),
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 80),
        text: norm(el.textContent).slice(0, 40),
      });
    }
  }
  overflowElements.sort((a, b) => b.over - a.over);
  const articleLinks = Array.from(document.querySelectorAll('a[href^="/posts/"]'))
    .map((a) => a.getAttribute('href'))
    .filter(Boolean);

  function findDeep(text) {
    const candidates = document.querySelectorAll('p, blockquote, div, section, span, figcaption, aside, article');
    let best = null;
    for (let i = 0; i < candidates.length; i += 1) {
      const el = candidates[i];
      const t = norm(el.textContent);
      if (t.indexOf(text) < 0) continue;
      if (t.length > 500) continue;
      if (!best || t.length < norm(best.textContent).length) best = el;
    }
    return best;
  }
  function h2El(prefix) {
    const list = document.querySelectorAll('h2');
    for (let i = 0; i < list.length; i += 1) {
      if (norm(list[i].textContent).replace(/#+$/, '').indexOf(prefix) >= 0) return list[i];
    }
    return null;
  }
  function follows(a, b) {
    return !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  }
  const h2Total = h2El('痛点');
  const h2Arch = h2El('三层架构');
  const h2Rules = h2El('规则体系');
  const h2Last = h2El('用对抗测试换质量');
  const pauseAEl = findDeep(arg.pauseA);
  const pauseBEl = findDeep(arg.pauseB);
  let tailEl = null;
  if (h2Last) {
    const candidates = document.querySelectorAll('blockquote, p, div, section, article');
    for (let i = 0; i < candidates.length; i += 1) {
      const el = candidates[i];
      const t = norm(el.textContent);
      if (t.indexOf('经验') < 0 || t.length > 300) continue;
      if (!(h2Last.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      if (!tailEl || t.length < norm(tailEl.textContent).length) tailEl = el;
    }
  }
  const articleOrder = {
    h2Found: [!!h2Total, !!h2Arch, !!h2Rules, !!(h2El('防幻觉')), !!(h2El('工程化')), !!h2Last],
    pauseAFound: !!pauseAEl,
    pauseBFound: !!pauseBEl,
    pauseAAfterH2: follows(h2Arch, pauseAEl),
    pauseABeforeH2: follows(pauseAEl, h2Rules),
    pauseBAfterH2: follows(h2Last, pauseBEl),
    tailFound: !!tailEl,
    pauseBBeforeTail: follows(pauseBEl, tailEl),
  };
  const htmlStyle = getComputedStyle(document.documentElement);
  return {
    title: document.title,
    url: location.href,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientWidth: cw,
    bodyLen: bodyText.length,
    bodySample: bodyText.slice(0, 200),
    bodyText,
    mainExists: !!main && main.id === 'main',
    viteOverlay: !!document.querySelector('vite-error-overlay'),
    vitOverlay: !!document.querySelector('.vite-error-overlay'),
    bandExists: !!band,
    bandRect: bandRect ? { top: Math.round(bandRect.top), height: bandRect.height, width: Math.round(bandRect.width) } : null,
    bandPosition: bandStyle ? bandStyle.position : null,
    bandBrand: norm((document.querySelector('.ed-band__brand') || {}).textContent),
    bandMeta: norm((document.querySelector('.ed-band__meta') || {}).textContent),
    bandMetaDisplay: (() => { const el = document.querySelector('.ed-band__meta'); return el ? getComputedStyle(el).display : null; })(),
    bandNow: norm((document.querySelector('.ed-band__now') || {}).textContent),
    bandVisibleText: (function () {
      const root = document.querySelector('.ed-band');
      if (!root) return '';
      let out = '';
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const el = node.parentElement;
        if (!el) continue;
        let p = el, vis = true;
        while (p && p !== root.parentElement) {
          const cs = getComputedStyle(p);
          if (cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; }
          p = p.parentElement;
        }
        if (vis) out += ' ' + node.textContent;
      }
      return out.replace(/\s+/g, ' ').trim();
    })(),
    filterStatus: norm((document.querySelector('.jp-filter__status') || {}).textContent).slice(0, 160),
    articleMetaSeparators: Array.from(document.querySelectorAll('.ja-head__sep')).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { display: cs.display, visible: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 };
    }),
    scrollFadeContainers: (function () {
      const list = [];
      const all = document.querySelectorAll('body *');
      for (let i = 0; i < all.length; i += 1) {
        const el = all[i];
        const cs = getComputedStyle(el);
        if (el.scrollWidth <= el.clientWidth + 2) continue;
        if (cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') continue;
        if (el.clientWidth < 40) continue;
        if (el.tagName === 'PRE' || el.tagName === 'CODE' || el.tagName === 'TEXTAREA' || el.closest('pre, code, textarea, .hljs')) continue;
        const mask = cs.maskImage || cs.webkitMaskImage || 'none';
        list.push({ cls: String(el.className || '').slice(0, 60), scrollW: el.scrollWidth, clientW: el.clientWidth, mask: mask === 'none' ? 'none' : 'gradient' });
      }
      return list.slice(0, 6);
    })(),
    headerVar: htmlStyle.getPropertyValue('--ed-header-h').trim(),
    navDisplay: navEl ? getComputedStyle(navEl).display : null,
    navLinks,
    currentMarker,
    utils,
    menuBtn,
    h1s,
    h2s,
    footerExists: !!footer,
    footerLinks,
    articleLinks,
    articleOrder,
    overflowElements: overflowElements.slice(0, 8),
    htmlMode: document.documentElement.getAttribute('data-mode'),
    intro: {
      hasSearch: bodyText.indexOf('检索') >= 0,
      hasComments: bodyText.indexOf('评论') >= 0,
      hasRelated: bodyText.indexOf('相关文章') >= 0 || bodyText.indexOf('相关阅读') >= 0,
      hasPrevNext: bodyText.indexOf('上一篇') >= 0 || bodyText.indexOf('下一篇') >= 0,
    },
  };
}

/* 暗色快照 */
function inspectDark() {
  function parseLum(color) {
    const m = String(color).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
    if (parts.length >= 4 && parts[3] === 0) return null;
    const r = parts[0], g = parts[1], b = parts[2];
    return Math.round(((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * 1000) / 1000;
  }
  const body = document.body;
  const html = document.documentElement;
  const bodyBg = getComputedStyle(body).backgroundColor;
  const htmlBg = getComputedStyle(html).backgroundColor;
  const band = document.querySelector('.ed-band');
  const bandBg = band ? getComputedStyle(band).backgroundColor : null;
  const bodyLum = parseLum(bodyBg) !== null ? parseLum(bodyBg) : parseLum(htmlBg);
  const areaThreshold = window.innerWidth * window.innerHeight * 0.2;
  const whiteBlocks = [];
  const blocks = document.querySelectorAll('header, main, section, article, aside, footer, div');
  for (let i = 0; i < blocks.length; i += 1) {
    const el = blocks[i];
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.backgroundColor !== 'rgb(255, 255, 255)') continue;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < areaThreshold) continue;
    whiteBlocks.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 60) });
  }
  return {
    mode: html.getAttribute('data-mode'),
    bodyBg,
    htmlBg,
    bandBg,
    bodyLum,
    bandLum: parseLum(bandBg),
    whiteBlocks: whiteBlocks.slice(0, 6),
    scrollWidth: html.scrollWidth,
    clientWidth: html.clientWidth,
    scrollHeight: html.scrollHeight,
    bodyLen: String(document.body.innerText || '').replace(/\s+/g, ' ').trim().length,
    title: document.title,
  };
}

/* 窄视口（768/640）快照：横向溢出 + footer 溢出 + 发行条 */
function inspectNarrow() {
  const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const band = document.querySelector('.ed-band');
  const bandRect = band ? band.getBoundingClientRect() : null;
  const footer = document.querySelector('.site-footer');
  let bandVisibleText = '';
  if (band) {
    let out = '';
    const walker = document.createTreeWalker(band, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      if (!el) continue;
      let p = el, vis = true;
      while (p && p !== band.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; }
        p = p.parentElement;
      }
      if (vis) out += ' ' + node.textContent;
    }
    bandVisibleText = out.replace(/\s+/g, ' ').trim();
  }
  return {
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    innerW: window.innerWidth,
    bodyLen: norm(document.body.innerText).length,
    h1: norm((document.querySelector('h1') || {}).textContent),
    bandHeight: bandRect ? bandRect.height : null,
    bandTop: bandRect ? bandRect.top : null,
    bandVisibleText,
    footerLinks: footer ? footer.querySelectorAll('a').length : 0,
    footerOverflow: footer ? footer.scrollWidth - footer.clientWidth : null,
  };
}

/* ============================================================
   路由审计
   ============================================================ */
async function auditViewport(browser, vp) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const bucket = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(shorten(msg.text(), 240));
  });
  page.on('pageerror', (err) => bucket.pageErrors.push(shorten(String((err && err.message) || err), 240)));
  page.on('requestfailed', (req) => {
    const fail = req.failure();
    bucket.failedRequests.push({ url: shorten(req.url(), 160), err: fail ? fail.errorText : '' });
  });
  page.on('response', (res) => {
    if (res.status() >= 400) bucket.badResponses.push({ status: res.status(), url: shorten(res.url(), 160) });
  });
  for (const route of ROUTES) {
    if (ONLY.length && ONLY.indexOf(route.slug) < 0) continue;
    await auditRoute(page, vp, route, bucket);
  }
  await auditInteractions(page, vp);
  await context.close();
}

function clearBucket(bucket) {
  bucket.consoleErrors.length = 0;
  bucket.pageErrors.length = 0;
  bucket.failedRequests.length = 0;
  bucket.badResponses.length = 0;
}

function needsRetry(snap, httpStatus, navError) {
  if (navError) return true;
  if (httpStatus !== null && httpStatus !== 200) return true;
  if (!snap || snap.evalError) return true;
  if (snap.bodyLen < 50) return true;
  if (snap.viteOverlay) return true;
  return false;
}

async function auditRoute(page, vp, route, bucket) {
  const state = {
    route,
    vp,
    wip: route.content === 'posts' || route.content === 'article',
    checks: [],
    screenshots: [],
    attempts: 0,
  };
  const url = BASE + route.path;
  let navError = '';
  let httpStatus = null;
  let snap = null;

  async function load() {
    clearBucket(bucket);
    navError = '';
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      httpStatus = resp ? resp.status() : null;
    } catch (e) {
      navError = shorten(String((e && e.message) || e), 200);
    }
    await page.waitForTimeout(450);
    try {
      snap = await page.evaluate(inspectPage, { pauseA: PAUSE_A, pauseB: PAUSE_B, h2Expect: ARTICLE_H2 });
    } catch (e) {
      snap = { evalError: String((e && e.message) || e) };
    }
  }

  state.attempts = 1;
  await load();
  if (needsRetry(snap, httpStatus, navError)) {
    state.attempts = 2;
    await page.waitForTimeout(900);
    await load();
  }

  /* ---- 结构 / 全局 chrome 检查 ---- */
  await auditSnapshot(state, httpStatus, navError, bucket, snap);

  /* ---- 截图 ---- */
  try {
    await page.evaluate(() => window.scrollTo(0, 0));
  } catch (e) { /* ignore */ }
  await page.waitForTimeout(120);
  const shot = path.join(OUT, vp.name + '-' + route.slug + '.png');
  try {
    await page.screenshot({ path: shot, timeout: 15000 });
    state.screenshots.push(relPath(shot));
    report.screenshots.push(relPath(shot));
  } catch (e) {
    addIssue('warn', route.path, vp.name, 'screenshot:viewport', String((e && e.message) || e));
  }
  if ((vp.width === 1440 || vp.width === 390) && !NO_FULL) {
    try {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(650);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      const full = path.join(OUT, vp.name + '-' + route.slug + '-full.png');
      await page.screenshot({ path: full, fullPage: true, timeout: 30000 });
      state.screenshots.push(relPath(full));
      report.screenshots.push(relPath(full));
    } catch (e) {
      addIssue('warn', route.path, vp.name, 'screenshot:full', String((e && e.message) || e));
    }
  }

  /* ---- sticky 滚动检查 ---- */
  const scrollable = snap && snap.scrollHeight > vp.height + 120;
  if (!scrollable) {
    push(state, 'band:sticky-scroll', 'pass', '页面高度不足，跳过滚动检查（position=' + (snap ? snap.bandPosition : '?') + '）', { global: true });
  } else {
    try {
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForTimeout(200);
      const top = await page.evaluate(() => {
        const b = document.querySelector('.ed-band');
        return b ? Math.round(b.getBoundingClientRect().top) : null;
      });
      push(state, 'band:sticky-scroll', top !== null && Math.abs(top) <= 1 ? 'pass' : 'fail', 'scrollY=900 时 band.top=' + top, { global: true });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(120);
    } catch (e) {
      push(state, 'band:sticky-scroll', 'warn', '滚动检查异常：' + String((e && e.message) || e), { global: true });
    }
  }

  const status = worstStatus(state.checks);
  report.routes.push({
    slug: route.slug,
    path: route.path,
    viewport: vp.name + ' ' + vp.width + 'x' + vp.height,
    wip: state.wip,
    attempts: state.attempts,
    status,
    checks: state.checks,
    screenshots: state.screenshots,
  });
}

function auditSnapshot(state, httpStatus, navError, bucket, snap) {
  const vp = state.vp;
  const route = state.route;
  const g = { global: true };

  if (navError) push(state, 'http:navigation', 'fail', 'goto 失败：' + navError, g);
  push(state, 'http:status', httpStatus === 200 ? 'pass' : 'fail', 'status=' + httpStatus, g);
  if (!snap || snap.evalError) {
    push(state, 'page:evaluate', 'fail', '页面快照失败：' + (snap ? snap.evalError : 'null'), g);
    return;
  }
  push(state, 'vite:overlay', snap.viteOverlay || snap.vitOverlay ? 'fail' : 'pass', snap.viteOverlay ? '出现 Vite 编译/运行错误覆盖层' : '', g);
  push(state, 'main:present', snap.mainExists ? 'pass' : 'fail', 'main#main=' + snap.mainExists, g);

  /* body 非空 */
  if (snap.bodyLen < 50) push(state, 'body:content', 'fail', 'body 几乎为空（' + snap.bodyLen + ' 字符）', {});
  else if (snap.bodyLen < 150) push(state, 'body:content', 'fail', 'body 内容过少（' + snap.bodyLen + ' 字符）', {});
  else push(state, 'body:content', 'pass', snap.bodyLen + ' 字符', {});

  /* h1 */
  if (route.h1) {
    const ok = snap.h1s.length === 1 && norm(snap.h1s[0]) === route.h1;
    push(state, 'h1:text', ok ? 'pass' : 'fail', 'h1=' + JSON.stringify(snap.h1s) + ' 期望=' + JSON.stringify(route.h1), {});
  } else if (route.h1Prefix) {
    const ok = snap.h1s.some((t) => norm(t).indexOf(route.h1Prefix) === 0);
    push(state, 'h1:text', ok ? 'pass' : 'fail', 'h1=' + JSON.stringify(snap.h1s) + ' 期望前缀=' + route.h1Prefix, {});
  } else {
    push(state, 'h1:record', snap.h1s.length ? 'pass' : 'warn', 'h1=' + JSON.stringify(snap.h1s.slice(0, 3)), {});
  }
  if (route.h1Prefix) {
    push(state, 'h1:single', snap.h1s.length === 1 ? 'pass' : 'warn', 'h1 数量=' + snap.h1s.length + '（疑似页面标题 + 正文 Markdown H1 重复）', {});
  }
  if (snap.h1s.length > 1) {
    report.observations.push({
      route: route.path,
      viewport: vp.name,
      note: '页面出现 ' + snap.h1s.length + ' 个 h1：' + JSON.stringify(snap.h1s),
    });
  }

  /* 发行信息条 */
  const bh = snap.bandRect ? Math.round(snap.bandRect.height) : null;
  const bandOk = !!snap.bandExists && bh !== null && bh >= 43 && bh <= 48;
  push(state, 'band:present', bandOk ? 'pass' : 'fail', 'height=' + bh + 'px position=' + snap.bandPosition + ' --ed-header-h=' + snap.headerVar, g);
  push(state, 'band:sticky', snap.bandPosition === 'sticky' ? 'pass' : 'fail', 'position=' + snap.bandPosition, g);
  push(state, 'band:text', snap.bandBrand.indexOf('读片') >= 0 && snap.bandMeta.indexOf('VOL.07') >= 0 ? 'pass' : 'fail', 'brand=' + snap.bandBrand + ' meta=' + snap.bandMeta, g);
  push(state, 'band:clock', /此刻\s*\d{2}:\d{2}/.test(snap.bandNow || '') ? 'pass' : 'warn', 'now=' + snap.bandNow, g);
  const editionOk = (snap.bandVisibleText || '').indexOf('VOL.07') >= 0;
  push(state, 'band:edition-visible', editionOk ? 'pass' : 'fail', '可见文本=' + String(snap.bandVisibleText || '').slice(0, 130), g);
  if (snap.bandRect && Math.abs(snap.bandRect.width - snap.clientWidth) > 2) {
    push(state, 'band:width', 'fail', 'band.width=' + snap.bandRect.width + ' clientWidth=' + snap.clientWidth, g);
  } else {
    push(state, 'band:width', 'pass', 'band.width=' + (snap.bandRect ? snap.bandRect.width : '?'), g);
  }
  if (route.slug === 'home') {
    const heightVar = parseFloat(snap.headerVar);
    const measured = snap.bandRect ? snap.bandRect.height : null;
    const diff = measured !== null && !isNaN(heightVar) ? Math.round((measured - heightVar) * 100) / 100 : null;
    push(state, 'band:height-spec', diff !== null && Math.abs(diff) <= 0.5 ? 'pass' : 'warn',
      '实测高度=' + (measured === null ? '?' : measured) + 'px vs --ed-header-h=' + snap.headerVar + '（差 ' + diff + 'px）', g);
  }

  /* 导航 */
  if (vp.width > 960) {
    push(state, 'nav:visible', snap.navDisplay !== 'none' ? 'pass' : 'fail', 'display=' + snap.navDisplay, g);
    push(state, 'nav:count', snap.navLinks.length === 6 ? 'pass' : 'fail', 'links=' + snap.navLinks.length, g);
    const labelOk = snap.navLinks.length === 6 && NAV.every((item, i) => {
      const text = norm(snap.navLinks[i].text);
      return text.indexOf(item.no) === 0 && text.indexOf(item.label) >= 0;
    });
    push(state, 'nav:labels', labelOk ? 'pass' : 'fail', JSON.stringify(snap.navLinks.map((l) => l.text)), g);
    if (route.current !== null && route.current !== undefined) {
      const currents = snap.navLinks.map((l, i) => (l.current ? i : -1)).filter((i) => i >= 0);
      const curOk = currents.length === 1 && currents[0] === route.current;
      push(state, 'nav:aria-current', curOk ? 'pass' : 'fail', 'aria-current 索引=' + JSON.stringify(currents) + ' 期望=' + route.current, g);
    } else {
      const navCurrentCount = snap.navLinks.filter((l) => l.current).length;
      push(state, 'nav:aria-current', navCurrentCount === 0 ? 'pass' : 'warn', '不在导航内的路由：aria-current 数量=' + navCurrentCount + '（期望 0）', g);
    }
  } else {
    push(state, 'nav:mobile-collapsed', snap.navDisplay === 'none' ? 'pass' : 'fail', 'nav display=' + snap.navDisplay, g);
    if (route.current === null || route.current === undefined) {
      const fallback = snap.currentMarker ? norm(snap.currentMarker.text) : '';
      const expectedLabel = route.mobileCurrent || '';
      const mentionsHome = fallback.indexOf('读片台') >= 0;
      const ok = expectedLabel ? fallback.indexOf(expectedLabel) >= 0 : fallback !== '' && !mentionsHome;
      push(state, 'nav:mobile-current', ok ? 'pass' : (mentionsHome ? 'fail' : 'warn'),
        '不在导航内的路由：移动端 current 显示「' + fallback + '」' + (expectedLabel ? '，期望含「' + expectedLabel + '」' : '，期望非「00 读片台」'), g);
    } else {
      const expected = NAV[route.current];
      const markerOk = !!snap.currentMarker && snap.currentMarker.visible && norm(snap.currentMarker.text).indexOf(expected.label) >= 0;
      push(state, 'nav:mobile-current', markerOk ? 'pass' : 'fail', 'current=' + (snap.currentMarker ? snap.currentMarker.text : 'null') + ' 期望含 ' + expected.label, g);
    }
    const utilText = snap.utils.map((u) => u.text).join(' | ');
    push(state, 'utils:mobile', utilText.indexOf('检索') >= 0 && utilText.indexOf('目录') >= 0 ? 'pass' : 'fail', 'utils=' + utilText, g);
    push(state, 'menu:button-visible', snap.menuBtn && snap.menuBtn.display !== 'none' ? 'pass' : 'fail', 'menu button display=' + (snap.menuBtn ? snap.menuBtn.display : 'null'), g);
  }

  /* footer */
  push(state, 'footer:links', snap.footerLinks >= 10 ? (snap.footerLinks === 12 ? 'pass' : 'warn') : 'fail', 'footer <a> 数量=' + snap.footerLinks + '（期望 12）', g);
  push(state, 'footer:present', snap.footerExists ? 'pass' : 'fail', 'footer=' + snap.footerExists, g);

  /* 横向溢出 */
  const delta = snap.scrollWidth - snap.clientWidth;
  if (delta > 1) {
    const detail = snap.overflowElements.slice(0, 4).map((e) => e.tag + '.' + e.cls + ' +' + e.over + 'px "' + e.text + '"').join('；');
    push(state, 'layout:overflow-x', 'fail', 'scrollWidth=' + snap.scrollWidth + ' clientWidth=' + snap.clientWidth + ' 超出=' + delta + 'px；' + detail, {});
  } else {
    push(state, 'layout:overflow-x', 'pass', 'scrollWidth=' + snap.scrollWidth + ' == clientWidth=' + snap.clientWidth, {});
  }

  /* 移动端横向滚动容器的渐隐提示（chips / pills） */
  if (vp.width <= 960 && (route.content === 'posts' || route.content === 'article')) {
    const containers = snap.scrollFadeContainers || [];
    const missing = containers.filter((c) => c.mask === 'none');
    push(state, 'ui:horizontal-fade', missing.length === 0 ? 'pass' : 'warn',
      '横向滚动容器=' + JSON.stringify(containers.map((c) => ({ c: c.cls, sw: c.scrollW, cw: c.clientW, mask: c.mask }))), {});
  }

  /* 控制台 / 页面错误 */
  const consoleErrors = bucket.consoleErrors;
  const pageErrors = bucket.pageErrors;
  const errDetail = consoleErrors.slice(0, 3).concat(pageErrors.slice(0, 3)).join(' || ');
  push(state, 'console:errors', consoleErrors.length === 0 && pageErrors.length === 0 ? 'pass' : 'fail',
    'console=' + consoleErrors.length + ' pageerror=' + pageErrors.length + (errDetail ? ' · ' + errDetail : ''), {});

  /* 网络 */
  const bad = bucket.badResponses;
  push(state, 'network:bad-responses', bad.length === 0 ? 'pass' : 'warn', JSON.stringify(bad.slice(0, 5)), {});
  const failed = bucket.failedRequests.filter((f) => f.err.indexOf('ERR_ABORTED') < 0);
  push(state, 'network:failed-requests', failed.length === 0 ? 'pass' : 'warn', JSON.stringify(failed.slice(0, 5)), {});

  /* 主题初始状态 */
  push(state, 'theme:data-mode', snap.htmlMode === 'light' || snap.htmlMode === 'dark' ? 'pass' : 'fail', 'data-mode=' + snap.htmlMode, g);

  /* 内容检查 */
  auditContent(state, route, snap);


}

function auditContent(state, route, snap) {
  if (route.content === 'posts') {
    const body = compact(snap.bodyText);
    const found = POST_TITLES.filter((t) => body.indexOf(compact(t)) >= 0);
    const missing = POST_TITLES.filter((t) => body.indexOf(compact(t)) < 0);
    const statusMatch = (snap.filterStatus || '').match(/筛选结果\s*(\d+)\s*篇/);
    const statusCount = statusMatch ? Number(statusMatch[1]) : null;
    if (route.subset) {
      const countOk = found.length >= 1 && found.length < POST_TITLES.length;
      const expectOk = route.expectFilterCount === undefined ? true : found.length === route.expectFilterCount;
      const statusOk = statusCount === null || statusCount === found.length;
      push(state, 'content:posts-filtered', countOk && expectOk && statusOk ? 'pass' : 'fail',
        '筛选结果 ' + found.length + ' 篇（期望 ' + (route.expectFilterCount === undefined ? '1..6' : route.expectFilterCount) + '）；状态文案「' + (snap.filterStatus || '') + '」', {});
    } else if (found.length === POST_TITLES.length) {
      push(state, 'content:posts-7-titles', 'pass', '7/7 标题存在；文章链接 ' + snap.articleLinks.length + ' 个', {});
    } else {
      push(state, 'content:posts-7-titles', 'wip', '标题 ' + found.length + '/7；缺：' + missing.slice(0, 4).join(' / '), {});
    }
  }
  if (route.content === 'article') {
    const h2clean = snap.h2s.map((h) => norm(h).replace(/#+$/, ''));
    const missingH2 = ARTICLE_H2.filter((p) => !h2clean.some((h) => h.indexOf(p) >= 0));
    push(state, 'content:article-h2', missingH2.length === 0 ? 'pass' : 'wip', missingH2.length ? '缺 H2：' + missingH2.join(' / ') : '6 个 H2 齐全', {});
    const ord = snap.articleOrder || {};
    if (!ord.pauseAFound && !ord.pauseBFound) {
      push(state, 'content:article-anchors', 'wip', '未发现情绪锚点元素（页面可能仍在改造：旧版结构）', {});
    } else {
      const aOk = !!(ord.pauseAFound && ord.pauseAAfterH2 && ord.pauseABeforeH2);
      const bOk = !!(ord.pauseBFound && ord.pauseBAfterH2 && (ord.tailFound ? ord.pauseBBeforeTail : false));
      push(state, 'content:article-anchor-A', aOk ? 'pass' : 'fail', 'PAUSE A：found=' + ord.pauseAFound + ' after02=' + ord.pauseAAfterH2 + ' before03=' + ord.pauseABeforeH2, {});
      push(state, 'content:article-anchor-B', bOk ? 'pass' : 'fail', 'PAUSE B：found=' + ord.pauseBFound + ' after06=' + ord.pauseBAfterH2 + ' tail=' + ord.tailFound + ' beforeTail=' + ord.pauseBBeforeTail, {});
    }
    if (state.vp.width <= 620) {
      const seps = snap.articleMetaSeparators || [];
      const visibleSeps = seps.filter((s) => s.visible);
      push(state, 'content:article-meta-sep', visibleSeps.length === 0 ? 'pass' : 'fail',
        '≤620 元信息分隔符可见数量=' + visibleSeps.length + ' / ' + seps.length, {});
    }
    push(state, 'content:comments', snap.intro.hasComments ? 'pass' : 'wip', snap.intro.hasComments ? '' : '未发现评论区块', {});
    push(state, 'content:related', snap.intro.hasRelated ? 'pass' : 'wip', snap.intro.hasRelated ? '' : '未发现相关文章区块', {});
    const prevnext = snap.intro.hasPrevNext || snap.articleLinks.length >= 2;
    push(state, 'content:prevnext', prevnext ? 'pass' : 'wip', 'articleLinks=' + snap.articleLinks.length, {});
  }
}

/* ============================================================
   交互检查
   ============================================================ */
async function auditInteractions(page, vp) {
  const rec = (check, status, detail) => {
    const entry = { viewport: vp.name + ' ' + vp.width + 'x' + vp.height, check, status, detail: shorten(detail || '', 400) };
    report.interactions.push(entry);
    if (status === 'fail') addIssue('error', null, vp.name, check, detail);
    else if (status === 'warn') addIssue('warn', null, vp.name, check, detail);
  };
  const go = async (routePath) => {
    try {
      await page.goto(BASE + routePath, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(450);
    } catch (e) {
      await page.waitForTimeout(300);
    }
  };

  /* ---- 检索面板 ---- */
  try {
    await go('/');
    const searchBtn = page.locator('.ed-band__util', { hasText: '检索' }).first();
    if (!(await searchBtn.isVisible().catch(() => false))) {
      rec('search:button-visible', 'fail', '检索按钮不可见');
    } else {
      await searchBtn.click();
      await page.waitForTimeout(220);
      try {
        await page.locator('#ed-search').waitFor({ state: 'visible', timeout: 4000 });
        rec('search:opens', 'pass', '点击「检索」后面板出现');
        const panelOffset = await page.evaluate(() => {
          const band = document.querySelector('.ed-band');
          const panel = document.querySelector('#ed-search');
          if (!band || !panel) return null;
          const br = band.getBoundingClientRect();
          const pr = panel.getBoundingClientRect();
          return { bandBottom: Math.round(br.bottom * 100) / 100, panelTop: Math.round(pr.top * 100) / 100, gap: Math.round((pr.top - br.bottom) * 100) / 100 };
        });
        rec('search:panel-offset', panelOffset && Math.abs(panelOffset.gap) <= 0.5 ? 'pass' : 'warn', JSON.stringify(panelOffset));
        const active = await page.evaluate(() => (document.activeElement ? document.activeElement.id : ''));
        rec('search:autofocus', active === 'ed-search-input' ? 'pass' : 'warn', 'activeElement=' + active);
        try {
          await page.screenshot({ path: path.join(OUT, 'state-' + vp.name + '-search-open.png'), timeout: 10000 });
          report.screenshots.push(relPath(path.join(OUT, 'state-' + vp.name + '-search-open.png')));
        } catch (e) { /* ignore */ }
        await page.fill('#ed-search-input', '规则');
        await page.press('#ed-search-input', 'Enter');
        let matched = false;
        try {
          await page.waitForURL((u) => u.pathname === '/posts' && u.searchParams.get('q') === '规则', { timeout: 6000 });
          matched = true;
        } catch (e) { /* ignore */ }
        rec('search:submit', matched ? 'pass' : 'fail', 'url=' + page.url());
        const panelGone = await page.evaluate(() => !document.querySelector('#ed-search'));
        rec('search:close-after-submit', panelGone ? 'pass' : 'warn', 'panel gone=' + panelGone);
      } catch (e) {
        rec('search:opens', 'fail', '面板未出现：' + String((e && e.message) || e));
      }
      /* ESC 关闭 */
      await go('/');
      try {
        await page.locator('.ed-band__util', { hasText: '检索' }).first().click();
        await page.locator('#ed-search').waitFor({ state: 'visible', timeout: 4000 });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(280);
        const stillOpen = await page.evaluate(() => {
          const el = document.querySelector('#ed-search');
          if (!el) return false;
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden';
        });
        rec('search:esc-close', stillOpen ? 'fail' : 'pass', 'stillOpen=' + stillOpen);
      } catch (e) {
        rec('search:esc-close', 'fail', 'ESC 检查异常：' + String((e && e.message) || e));
      }
    }
  } catch (e) {
    rec('search:exception', 'fail', String((e && e.message) || e));
  }

  if (vp.width > 960) {
    /* ---- 声音开关 ---- */
    try {
      await go('/');
      const soundBtn = page.locator('.ed-band__util--sound');
      if (!(await soundBtn.isVisible().catch(() => false))) {
        rec('sound:button-visible', 'fail', '声音按钮不可见');
      } else {
        const before = await soundBtn.getAttribute('aria-pressed');
        await soundBtn.click();
        await page.waitForTimeout(280);
        const after = await page.evaluate(() => ({
          pressed: (document.querySelector('.ed-band__util--sound') || {}).getAttribute
            ? document.querySelector('.ed-band__util--sound').getAttribute('aria-pressed') : null,
          ls: localStorage.getItem('bs-sound'),
        }));
        const onOk = after.pressed === 'true' && after.ls === 'on';
        rec('sound:toggle-on', onOk ? 'pass' : 'fail', 'aria-pressed ' + before + ' -> ' + after.pressed + '；bs-sound=' + after.ls);
        await page.locator('.ed-band__util--sound').click();
        await page.waitForTimeout(220);
        const off = await page.evaluate(() => ({
          pressed: (document.querySelector('.ed-band__util--sound') || {}).getAttribute
            ? document.querySelector('.ed-band__util--sound').getAttribute('aria-pressed') : null,
          ls: localStorage.getItem('bs-sound'),
        }));
        rec('sound:toggle-off', off.pressed === 'false' && off.ls === 'off' ? 'pass' : 'fail', 'aria-pressed=' + off.pressed + '；bs-sound=' + off.ls);
      }
    } catch (e) {
      rec('sound:exception', 'fail', String((e && e.message) || e));
    }

    /* ---- 日夜开关 ---- */
    try {
      await go('/');
      const themeBtn = page.locator('.ed-band__util--theme');
      if (!(await themeBtn.isVisible().catch(() => false))) {
        rec('theme:button-visible', 'fail', '日夜按钮不可见');
      } else {
        const before = await page.evaluate(() => ({ mode: document.documentElement.getAttribute('data-mode'), ls: localStorage.getItem('bs-mode') }));
        await themeBtn.click();
        await page.waitForTimeout(320);
        const after = await page.evaluate(() => ({ mode: document.documentElement.getAttribute('data-mode'), ls: localStorage.getItem('bs-mode') }));
        rec('theme:toggle', after.mode !== before.mode ? 'pass' : 'fail', 'data-mode ' + before.mode + ' -> ' + after.mode);
        rec('theme:localstorage', after.ls === after.mode ? 'pass' : 'fail', 'bs-mode=' + after.ls + ' data-mode=' + after.mode);
        await themeBtn.click();
        await page.waitForTimeout(300);
        const back = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
        rec('theme:toggle-back', back === before.mode ? 'pass' : 'warn', 'data-mode=' + back);
      }
    } catch (e) {
      rec('theme:exception', 'fail', String((e && e.message) || e));
    }
  } else {
    /* ---- 移动端菜单 ---- */
    try {
      await go('/');
      const menuBtn = page.locator('.ed-band__menu-btn');
      if (!(await menuBtn.isVisible().catch(() => false))) {
        rec('menu:button-visible', 'fail', '目录按钮不可见');
      } else {
        await menuBtn.click();
        await page.waitForTimeout(280);
        const menuState = await page.evaluate(() => {
          const menu = document.querySelector('#ed-menu');
          if (!menu) return { open: false };
          const links = Array.from(menu.querySelectorAll('.ed-menu__list a')).map((a) => ({
            text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
            current: a.getAttribute('aria-current'),
            href: a.getAttribute('href'),
          }));
          return {
            open: true,
            display: getComputedStyle(menu).display,
            linkCount: links.length,
            links,
            bodyOverflow: document.body.style.overflow,
            active: (document.activeElement && (document.activeElement.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 20)) || '',
          };
        });
        rec('menu:opens', menuState.open ? 'pass' : 'fail', 'menu open=' + menuState.open);
        const menuOffset = await page.evaluate(() => {
          const band = document.querySelector('.ed-band');
          const menu = document.querySelector('#ed-menu');
          if (!band || !menu) return null;
          const br = band.getBoundingClientRect();
          const mr = menu.getBoundingClientRect();
          return { bandBottom: Math.round(br.bottom * 100) / 100, menuTop: Math.round(mr.top * 100) / 100, gap: Math.round((mr.top - br.bottom) * 100) / 100 };
        });
        rec('menu:panel-offset', menuOffset && Math.abs(menuOffset.gap) <= 0.5 ? 'pass' : 'warn', JSON.stringify(menuOffset));
        rec('menu:links', menuState.linkCount === 6 ? 'pass' : 'fail', '链接数=' + menuState.linkCount + ' ' + JSON.stringify(menuState.links.map((l) => l.text)));
        const currentLinks = (menuState.links || []).filter((l) => l.current);
        rec('menu:aria-current', currentLinks.length === 1 && currentLinks[0].text.indexOf('读片台') >= 0 ? 'pass' : 'warn', JSON.stringify(currentLinks));
        rec('menu:body-lock', menuState.bodyOverflow === 'hidden' ? 'pass' : 'warn', 'body.overflow=' + menuState.bodyOverflow);
        try {
          await page.screenshot({ path: path.join(OUT, 'state-' + vp.name + '-menu-open.png'), timeout: 10000 });
          report.screenshots.push(relPath(path.join(OUT, 'state-' + vp.name + '-menu-open.png')));
        } catch (e) { /* ignore */ }

        /* 菜单里的声音 / 日夜开关 */
        try {
          const menuSound = page.locator('.ed-menu__util', { hasText: '声音' }).first();
          const s0 = await menuSound.getAttribute('aria-pressed');
          await menuSound.click();
          await page.waitForTimeout(240);
          const s1 = await page.evaluate(() => ({
            pressed: (() => {
              const btns = Array.from(document.querySelectorAll('.ed-menu__util'));
              const b = btns.find((x) => (x.textContent || '').indexOf('声音') >= 0);
              return b ? b.getAttribute('aria-pressed') : null;
            })(),
            ls: localStorage.getItem('bs-sound'),
          }));
          rec('menu:sound-toggle', s1.pressed !== s0 && s1.ls === (s1.pressed === 'true' ? 'on' : 'off') ? 'pass' : 'fail',
            'aria-pressed ' + s0 + ' -> ' + s1.pressed + '；bs-sound=' + s1.ls);
        } catch (e) {
          rec('menu:sound-toggle', 'fail', String((e && e.message) || e));
        }
        try {
          const m0 = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
          const menuTheme = page.locator('.ed-menu__util', { hasText: '模式' }).first();
          await menuTheme.click();
          await page.waitForTimeout(320);
          const m1 = await page.evaluate(() => ({ mode: document.documentElement.getAttribute('data-mode'), ls: localStorage.getItem('bs-mode') }));
          rec('menu:theme-toggle', m1.mode !== m0 && m1.ls === m1.mode ? 'pass' : 'fail',
            'data-mode ' + m0 + ' -> ' + m1.mode + '；bs-mode=' + m1.ls);
          /* 切回浅色，避免影响后续 */
          await page.locator('.ed-menu__util', { hasText: '模式' }).first().click();
          await page.waitForTimeout(250);
        } catch (e) {
          rec('menu:theme-toggle', 'fail', String((e && e.message) || e));
        }

        /* ESC + 焦点回归 */
        try {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(320);
          const closed = await page.evaluate(() => {
            const menu = document.querySelector('#ed-menu');
            if (!menu) return true;
            const cs = getComputedStyle(menu);
            return cs.display === 'none' || cs.visibility === 'hidden';
          });
          rec('menu:esc-close', closed ? 'pass' : 'fail', 'menu closed=' + closed);
          const active = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return null;
            return { tag: el.tagName, cls: String(el.className || ''), label: el.getAttribute('aria-label') };
          });
          const focusOk = !!(active && (String(active.label || '').indexOf('菜单') >= 0 || String(active.cls || '').indexOf('menu-btn') >= 0));
          rec('menu:focus-return', focusOk ? 'pass' : 'warn', 'activeElement=' + JSON.stringify(active));
        } catch (e) {
          rec('menu:esc-close', 'fail', String((e && e.message) || e));
        }
      }
    } catch (e) {
      rec('menu:exception', 'fail', String((e && e.message) || e));
    }
  }
}

/* ============================================================
   暗色模式审计
   ============================================================ */
async function auditDark(browser) {
  const vp = { name: 'desktop', width: 1440, height: 900 };
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await context.addInitScript(() => {
    try { window.localStorage.setItem('bs-mode', 'dark'); } catch (e) { /* ignore */ }
  });
  const page = await context.newPage();
  const bucket = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', (msg) => { if (msg.type() === 'error') bucket.consoleErrors.push(shorten(msg.text(), 240)); });
  page.on('pageerror', (err) => bucket.pageErrors.push(shorten(String((err && err.message) || err), 240)));
  page.on('response', (res) => { if (res.status() >= 400) bucket.badResponses.push({ status: res.status(), url: shorten(res.url(), 160) }); });

  const darkRoutes = ROUTES.filter((r) => !ONLY.length || ONLY.indexOf(r.slug) >= 0);
  for (const route of darkRoutes) {
    const wip = route.content === 'posts' || route.content === 'article';
    clearBucket(bucket);
    try {
      await page.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 25000 });
    } catch (e) { /* ignore */ }
    await page.waitForTimeout(450);
    let snap = null;
    try { snap = await page.evaluate(inspectDark); } catch (e) { snap = null; }
    const entry = { route: route.path, viewport: 'desktop', mode: snap ? snap.mode : null, bodyLum: snap ? snap.bodyLum : null, bandLum: snap ? snap.bandLum : null, whiteBlocks: snap ? snap.whiteBlocks : [], darkOk: false, screenshot: null };
    const shot = path.join(OUT, 'dark-desktop-' + route.slug + '.png');
    try {
      await page.screenshot({ path: shot, timeout: 15000 });
      entry.screenshot = relPath(shot);
      report.screenshots.push(relPath(shot));
    } catch (e) { /* ignore */ }
    if (!snap) {
      addIssue('error', route.path, 'dark-1440', 'dark:snapshot', '暗色快照失败');
    } else {
      entry.darkOk = snap.mode === 'dark';
      const pushDark = (name, status, detail) => {
        let sev = status === 'fail' ? 'error' : status === 'warn' ? 'warn' : null;
        if (status === 'fail' && wip && !STRICT) sev = 'wip';
        if (sev) addIssue(sev, route.path, 'dark-1440', name, detail);
        entry[name] = status;
      };
      pushDark('dark:mode', snap.mode === 'dark' ? 'pass' : 'fail', 'data-mode=' + snap.mode);
      pushDark('dark:body-bg', snap.bodyLum !== null && snap.bodyLum <= 0.6 ? 'pass' : 'fail', 'bodyBg=' + snap.bodyBg + ' lum=' + snap.bodyLum);
      pushDark('dark:band-bg', snap.bandLum !== null && snap.bandLum <= 0.7 ? 'pass' : 'fail', 'bandBg=' + snap.bandBg + ' lum=' + snap.bandLum);
      pushDark('dark:white-blocks', snap.whiteBlocks.length === 0 ? 'pass' : 'warn', JSON.stringify(snap.whiteBlocks));
      const delta = snap.scrollWidth - snap.clientWidth;
      pushDark('dark:overflow-x', delta <= 1 ? 'pass' : 'fail', 'scrollWidth=' + snap.scrollWidth + ' clientWidth=' + snap.clientWidth + ' 超出=' + delta);
      pushDark('dark:console-errors', bucket.consoleErrors.length + bucket.pageErrors.length === 0 ? 'pass' : 'fail',
        'console=' + bucket.consoleErrors.length + ' pageerror=' + bucket.pageErrors.length + ' · ' + bucket.consoleErrors.slice(0, 2).join(' || '));
    }
    report.dark.push(entry);
  }

  /* 390 暗色关键路由 */
  const mobileKey = ROUTES.filter((r) => DARK_KEY_390.indexOf(r.slug) >= 0);
  if (mobileKey.length) {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await mctx.addInitScript(() => { try { window.localStorage.setItem('bs-mode', 'dark'); } catch (e) { /* ignore */ } });
    const mpage = await mctx.newPage();
    const merr = [];
    mpage.on('console', (msg) => { if (msg.type() === 'error') merr.push(shorten(msg.text(), 200)); });
    mpage.on('pageerror', (err) => merr.push(shorten(String((err && err.message) || err), 200)));
    for (const route of mobileKey) {
      try { await mpage.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 25000 }); } catch (e) { /* ignore */ }
      await mpage.waitForTimeout(450);
      let snap = null;
      try { snap = await mpage.evaluate(inspectDark); } catch (e) { snap = null; }
      const entry = { route: route.path, viewport: 'mobile', mode: snap ? snap.mode : null, bodyLum: snap ? snap.bodyLum : null, darkOk: !!(snap && snap.mode === 'dark'), screenshot: null };
      const shot = path.join(OUT, 'dark-mobile-' + route.slug + '.png');
      try {
        await mpage.screenshot({ path: shot, timeout: 15000 });
        entry.screenshot = relPath(shot);
        report.screenshots.push(relPath(shot));
      } catch (e) { /* ignore */ }
      if (snap) {
        const wip = route.content === 'posts' || route.content === 'article';
        const delta = snap.scrollWidth - snap.clientWidth;
        const sev = delta > 1 ? (wip && !STRICT ? 'wip' : 'error') : null;
        if (sev) addIssue(sev, route.path, 'dark-390', 'dark:overflow-x', 'scrollWidth=' + snap.scrollWidth + ' clientWidth=' + snap.clientWidth + ' 超出=' + delta);
        if (merr.length) addIssue(wip && !STRICT ? 'wip' : 'error', route.path, 'dark-390', 'dark:console-errors', merr.slice(0, 3).join(' || '));
      }
      report.dark.push(entry);
    }
    await mctx.close();
  }
  await context.close();
}

/* ============================================================
   窄视口复核（768 / 640，全路由）
   ============================================================ */
async function auditNarrow(browser) {
  for (const vp of NARROW_VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const bucket = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
    page.on('console', (msg) => { if (msg.type() === 'error') bucket.consoleErrors.push(shorten(msg.text(), 240)); });
    page.on('pageerror', (err) => bucket.pageErrors.push(shorten(String((err && err.message) || err), 240)));
    page.on('response', (res) => { if (res.status() >= 400) bucket.badResponses.push({ status: res.status(), url: shorten(res.url(), 160) }); });
    for (const route of ROUTES) {
      if (ONLY.length && ONLY.indexOf(route.slug) < 0) continue;
      const wip = route.content === 'posts' || route.content === 'article';
      clearBucket(bucket);
      let httpStatus = null;
      let navError = '';
      try {
        const resp = await page.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 25000 });
        httpStatus = resp ? resp.status() : null;
      } catch (e) {
        navError = shorten(String((e && e.message) || e), 200);
      }
      await page.waitForTimeout(360);
      let snap = null;
      try {
        snap = await page.evaluate(inspectNarrow);
      } catch (e) {
        snap = { evalError: String((e && e.message) || e) };
      }
      const checks = [];
      const rec = (name, status, detail) => {
        let final = status;
        let note = detail || '';
        if (final === 'fail' && wip && !STRICT) { final = 'wip'; note = 'WIP · ' + note; }
        checks.push({ name, status: final, detail: shorten(note, 400) });
        if (final === 'fail') addIssue('error', route.path, vp.name + ' ' + vp.width + 'x' + vp.height, name, note);
        else if (final === 'warn') addIssue('warn', route.path, vp.name + ' ' + vp.width + 'x' + vp.height, name, note);
        else if (final === 'wip') addIssue('wip', route.path, vp.name + ' ' + vp.width + 'x' + vp.height, name, note);
      };
      rec('narrow:http-status', httpStatus === 200 && !navError ? 'pass' : 'fail', 'status=' + httpStatus + (navError ? ' · err=' + navError : ''));
      if (!snap || snap.evalError) {
        rec('narrow:evaluate', 'fail', '窄视口快照失败：' + (snap ? snap.evalError : 'null'));
      } else {
        rec('narrow:body', snap.bodyLen >= 150 ? 'pass' : 'fail', 'bodyLen=' + snap.bodyLen + ' h1=' + JSON.stringify(snap.h1));
        rec('narrow:overflow-x', snap.sw - snap.cw <= 1 ? 'pass' : 'fail', 'scrollWidth=' + snap.sw + ' clientWidth=' + snap.cw + ' 超出=' + (snap.sw - snap.cw));
        rec('narrow:footer-overflow', snap.footerOverflow === null || snap.footerOverflow <= 1 ? 'pass' : 'fail', 'footer.scrollWidth-clientWidth=' + snap.footerOverflow);
        rec('narrow:band-edition', (snap.bandVisibleText || '').indexOf('VOL.07') >= 0 ? 'pass' : 'fail', 'bandVisibleText=' + String(snap.bandVisibleText || '').slice(0, 120));
        rec('narrow:band-height', snap.bandHeight !== null && Math.abs(snap.bandHeight - 44) <= 1 ? 'pass' : 'fail', 'bandHeight=' + snap.bandHeight);
        rec('narrow:console', bucket.consoleErrors.length + bucket.pageErrors.length === 0 ? 'pass' : 'fail',
          'console=' + bucket.consoleErrors.length + ' pageerror=' + bucket.pageErrors.length + ' · ' + bucket.consoleErrors.slice(0, 2).join(' || '));
      }
      let shot = null;
      try {
        const shotPath = path.join(OUT, 'narrow-' + vp.width + '-' + route.slug + '.png');
        await page.screenshot({ path: shotPath, timeout: 15000 });
        shot = relPath(shotPath);
        report.screenshots.push(shot);
      } catch (e) { /* ignore */ }
      report.narrow.push({
        slug: route.slug,
        path: route.path,
        viewport: vp.name + ' ' + vp.width + 'x' + vp.height,
        status: worstStatus(checks),
        checks,
        screenshot: shot,
      });
    }
    await context.close();
  }
}

/* ============================================================
   汇总 / 输出
   ============================================================ */
function finalize() {
  const counts = { error: 0, warn: 0, wip: 0 };
  for (const issue of report.issues) {
    if (issue.severity === 'error') counts.error += 1;
    else if (issue.severity === 'warn') counts.warn += 1;
    else if (issue.severity === 'wip') counts.wip += 1;
  }
  const routeStatus = { pass: 0, warn: 0, wip: 0, fail: 0 };
  for (const r of report.routes) {
    if (routeStatus[r.status] === undefined) routeStatus[r.status] = 0;
    routeStatus[r.status] += 1;
  }
  const narrowStatus = { pass: 0, warn: 0, wip: 0, fail: 0 };
  for (const r of report.narrow) {
    if (narrowStatus[r.status] === undefined) narrowStatus[r.status] = 0;
    narrowStatus[r.status] += 1;
  }
  const narrowOverflow = report.narrow.filter((r) => r.checks.some((c) => c.name === 'narrow:overflow-x' && c.status !== 'pass')).length;
  const narrowFooterOverflow = report.narrow.filter((r) => r.checks.some((c) => c.name === 'narrow:footer-overflow' && c.status !== 'pass')).length;
  const firstBand = report.routes.find((r) => r.checks.some((c) => c.name === 'band:present'));
  let bandInfo = null;
  if (firstBand) {
    const check = firstBand.checks.find((c) => c.name === 'band:present');
    bandInfo = check ? check.detail : null;
  }
  report.summary = {
    durationMs: Date.now() - T0,
    routeViews: report.routes.length,
    routeStatus,
    checks: report.routes.reduce((sum, r) => sum + r.checks.length, 0),
    interactions: report.interactions.length,
    interactionFailures: report.interactions.filter((i) => i.status === 'fail').length,
    screenshots: report.screenshots.length,
    errors: counts.error,
    warnings: counts.warn,
    wip: counts.wip,
    strictContent: STRICT,
    narrowViews: report.narrow.length,
    narrowStatus,
    narrowOverflow,
    narrowFooterOverflow,
    bandInfo,
    exitCode: counts.error > 0 ? 1 : 0,
    finishedAt: new Date().toISOString(),
  };
  const issueChecks = {};
  for (const issue of report.issues) issueChecks[issue.check] = true;
  if (issueChecks['band:height-spec']) {
    report.observations.push({
      route: '*',
      viewport: 'all',
      note: '发行条实测高度约 45–45.3px（min-height 44px + 下边线/行盒），但 --ed-header-h 固定 44px；检索抽屉 top、移动菜单 inset-top 都按 44px 定位，会压住发行条下边线 0.3–1.3px。建议两处使用同一实测高度，或把发行条总高锁到 44px。',
    });
  }
  if (issueChecks['band:edition-visible'] || issueChecks['narrow:band-edition']) {
    report.observations.push({
      route: '*',
      viewport: '≤1180',
      note: '发行条可见文本缺少 VOL.07（设计 v2 要求 ≤1180 折行仍显示期号）。',
    });
  }
  if (narrowFooterOverflow > 0) {
    report.observations.push({
      route: '*',
      viewport: '768/640',
      note: '窄视口 footer 内部横向溢出 ' + narrowFooterOverflow + ' 处，需检查 footer 两列布局与 overflow-wrap。',
    });
  }
  if (issueChecks['h1:single']) {
    report.observations.push({
      route: '/wiki/Context_Engineering_Wiki',
      viewport: 'all',
      note: 'wiki 详情页同时存在 2 个 h1：页面标题「上下文工程」（52px）与正文 Markdown 自带 H1「LLM Wiki — 上下文工程…」（30px）。建议正文 H1 降级为 h2 或不再渲染。',
    });
  }
  if (report.meta.strictContent) {
    report.observations.push({ route: '*', viewport: 'all', note: '本次为 --strict-content 终检模式：页面未完成的 WIP 内容会按失败处理。' });
  }
}

function printSummary() {
  const s = report.summary;
  const lines = [];
  lines.push('');
  lines.push('============================================================');
  lines.push('《读片》VOL.07 改版 QA · scripts/qa-editorial.cjs');
  lines.push('BASE: ' + BASE + '   strict-content=' + STRICT + '   ' + s.durationMs + 'ms');
  lines.push('路由×视口: ' + s.routeViews + '   检查项: ' + s.checks + '   截图: ' + s.screenshots + ' 张');
  lines.push('ERROR: ' + s.errors + '   WARN: ' + s.warnings + '   WIP: ' + s.wip);
  lines.push('路由状态: ' + JSON.stringify(s.routeStatus));
  if (s.bandInfo) lines.push('发行条: ' + s.bandInfo);
  if (s.narrowViews) lines.push('窄视口 768/640: ' + s.narrowViews + ' 路由×视口（横向溢出=' + s.narrowOverflow + '，footer 溢出=' + s.narrowFooterOverflow + '） 状态=' + JSON.stringify(s.narrowStatus));
  lines.push('报告: ' + relPath(path.join(OUT, 'report.json')));
  lines.push('------------------------------------------------------------');
  const errors = report.issues.filter((i) => i.severity === 'error');
  const warns = report.issues.filter((i) => i.severity === 'warn');
  const wips = report.issues.filter((i) => i.severity === 'wip');
  if (errors.length) {
    lines.push('严重问题（exit 1）:');
    for (const i of errors.slice(0, 80)) {
      lines.push('  [error] ' + (i.viewport || '-') + '  ' + (i.route || 'global') + '  ' + i.check + ': ' + i.detail);
    }
    if (errors.length > 80) lines.push('  ... 另有 ' + (errors.length - 80) + ' 条');
  } else {
    lines.push('严重问题: 0');
  }
  if (warns.length) {
    lines.push('警告（不阻塞）:');
    for (const i of warns.slice(0, 60)) {
      lines.push('  [warn] ' + (i.viewport || '-') + '  ' + (i.route || 'global') + '  ' + i.check + ': ' + i.detail);
    }
    if (warns.length > 60) lines.push('  ... 另有 ' + (warns.length - 60) + ' 条');
  }
  if (wips.length) {
    lines.push('WIP（页面改造中，终检需复查）: ' + wips.length + ' 条');
    const seen = {};
    for (const i of wips) {
      const key = (i.route || 'global') + ' | ' + i.check;
      if (seen[key]) continue;
      seen[key] = true;
      lines.push('  [wip] ' + (i.route || 'global') + '  ' + i.check + ': ' + i.detail);
    }
  }
  if (report.observations.length) {
    lines.push('观察 / 待确认:');
    const seen = {};
    for (const o of report.observations) {
      const key = o.note;
      if (seen[key]) continue;
      seen[key] = true;
      lines.push('  - ' + o.note);
    }
  }
  lines.push('============================================================');
  console.log(lines.join('\n'));
}

(async function main() {
  deepDir(OUT);
  cleanOldShots();
  console.log('[qa-editorial] BASE=' + BASE + ' strict=' + STRICT + ' headless=' + HEADLESS);
  let browser = null;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: HEADLESS });
    for (const vp of VIEWPORTS) {
      console.log('[qa-editorial] audit viewport ' + vp.width + 'x' + vp.height + ' ...');
      await auditViewport(browser, vp);
    }
    console.log('[qa-editorial] audit dark mode ...');
    await auditDark(browser);
    console.log('[qa-editorial] audit narrow viewports (768/640) ...');
    await auditNarrow(browser);
  } catch (e) {
    addIssue('error', null, null, 'script:fatal', String((e && e.stack) || e));
    console.error('[qa-editorial] fatal:', e);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
  finalize();
  const reportPath = path.join(OUT, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  printSummary();
  process.exit(report.summary.exitCode);
})();
