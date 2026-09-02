/**
 * 构建期 RSS 生成脚本（scripts/gen-rss.mjs）
 *
 * 用 esbuild 把 TS 数据模块（src/data/posts.ts / src/config/default.config.ts）
 * 打包成 Node 可 import 的临时 ESM 文件，读取数据后手写拼接 RSS 2.0 XML，
 * 输出到 public/rss.xml。
 *
 * 限制说明：用户在浏览器「管理」页创建的文章保存在浏览器 localStorage，
 * 构建期不可得，因此不会进 RSS。用户新建/编辑内置文章后需重跑
 * `npm run gen:rss` 刷新 public/rss.xml（dev 模式下亦然）。
 */
import { build } from 'esbuild';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TMP_DIR = path.join(ROOT, 'node_modules', '.tmp');
const OUT_FILE = path.join(ROOT, 'public', 'rss.xml');

/** 用 esbuild 打包单个 TS 入口为临时 ESM 文件并 import，返回 { mod, tmpPath } */
async function bundleEntry(entry, tmpName) {
  const tmpPath = path.join(TMP_DIR, tmpName);
  await mkdir(TMP_DIR, { recursive: true });
  const result = await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    outfile: tmpPath,
    logLevel: 'silent',
  });
  await writeFile(tmpPath, result.outputFiles[0].text, 'utf8');
  const mod = await import(pathToFileURL(tmpPath).href);
  return { mod, tmpPath };
}

/** XML 转义：& < > " ' → 实体（必须先转 &） */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function main() {
  const tmpFiles = [];
  try {
    const postsBundle = await bundleEntry('src/data/posts.ts', 'rss-posts.mjs');
    const configBundle = await bundleEntry('src/config/default.config.ts', 'rss-config.mjs');
    tmpFiles.push(postsBundle.tmpPath, configBundle.tmpPath);

    const posts = postsBundle.mod.posts;
    const site = configBundle.mod.defaultConfig.site;

    const SITE_URL = (
      process.env.SITE_URL || site.url || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    // 仅收录内置已发布文章；草稿(draft === true)与 localStorage 用户文章不进 RSS
    const published = posts
      .filter((p) => p.draft !== true)
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<rss version="2.0">');
    lines.push('<channel>');
    lines.push(`  <title>${esc(site.title)}</title>`);
    lines.push(`  <link>${esc(SITE_URL)}</link>`);
    lines.push(`  <description>${esc(site.bio)}</description>`);
    lines.push('  <language>zh-CN</language>');
    lines.push(`  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`);
    lines.push('  <generator>MedAI Blog</generator>');
    for (const post of published) {
      lines.push('  <item>');
      lines.push(`    <guid isPermaLink="false">${esc(post.id)}</guid>`);
      lines.push(`    <link>${esc(`${SITE_URL}/posts/${post.id}`)}</link>`);
      lines.push(`    <title>${esc(post.title)}</title>`);
      lines.push(`    <description>${esc(post.description ?? post.excerpt)}</description>`);
      lines.push(`    <pubDate>${new Date(post.date).toUTCString()}</pubDate>`);
      for (const tag of post.tags ?? []) {
        lines.push(`    <category>${esc(tag)}</category>`);
      }
      lines.push('  </item>');
    }
    lines.push('</channel>');
    lines.push('</rss>');

    await mkdir(path.dirname(OUT_FILE), { recursive: true });
    await writeFile(OUT_FILE, lines.join('\n') + '\n', 'utf8');
    console.log(`[gen-rss] 已生成 ${published.length} 条订阅条目 -> ${path.relative(ROOT, OUT_FILE)}`);
  } catch (err) {
    console.error('[gen-rss] 生成失败:', err);
    process.exitCode = 1;
  } finally {
    // 临时文件清理（容错：删除失败不阻断）
    for (const file of tmpFiles) {
      try {
        await rm(file, { force: true });
      } catch {
        /* ignore */
      }
    }
  }
}

main();
