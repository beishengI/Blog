/**
 * 包体预算门禁（在 vite build 之后运行）：
 * 1. three 必须独立分包，且不进入首屏（script / modulepreload 均不得出现）；
 * 2. VolumeSlicer / PaletteDialog 等懒加载 chunk 同样不得进入首屏；
 * 3. 首屏 JS（入口 + modulepreload）gzip 体积不得超过基线 + 0.5KB。
 * 基线缺失时自动写入；`--update-baseline` 用于有意变更后的刷新。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const baselinePath = path.join(root, 'scripts', 'bundle-baseline.json');
const updateBaseline = process.argv.includes('--update-baseline');

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('[bundle] dist/index.html 不存在，请先运行 vite build。');
  process.exit(1);
}

const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const assetDir = path.join(dist, 'assets');
const files = readdirSync(assetDir).filter(file => file.endsWith('.js'));
const gzipKb = file => gzipSync(readFileSync(path.join(assetDir, file))).byteLength / 1024;
const kb = value => Math.round(value * 100) / 100;

const pick = pattern => [...html.matchAll(pattern)].map(match => match[1].split('/').pop());
const entry = pick(/<script[^>]+type="module"[^>]+src="([^"]+)"/g);
const preloaded = pick(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g);
const initial = [...new Set([...entry, ...preloaded])].filter(file => files.includes(file));
const initialGzipKb = initial.reduce((sum, file) => sum + gzipKb(file), 0);

const lazyChunks = {
  three: files.find(file => /^three-.*\.js$/.test(file)),
  volume: files.find(file => /^VolumeSlicer-.*\.js$/.test(file)),
  palette: files.find(file => /^PaletteDialog-.*\.js$/.test(file)),
};

const failures = [];
if (!lazyChunks.three) {
  failures.push('未找到 three 独立 chunk（检查 vite.config.ts 的 manualChunks）。');
}
if (!existsSync(path.join(dist, 'showcase', 'volume', 'brats-atlas.png'))) {
  failures.push('缺少真实切片图集 dist/showcase/volume/brats-atlas.png（先运行 scripts/prepare-volume.py）。');
}
for (const [name, file] of Object.entries(lazyChunks)) {
  if (file && initial.includes(file)) {
    failures.push(`懒加载 chunk ${name} (${file}) 进入了首屏 script/modulepreload。`);
  }
}

let baseline = null;
if (existsSync(baselinePath)) {
  baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
}
if (baseline && initialGzipKb > baseline.initialGzipKb + 0.5) {
  failures.push(
    `首屏 JS ${kb(initialGzipKb)}KB 超过基线 ${baseline.initialGzipKb}KB + 0.5KB。` +
      '若为有意变更，请运行 node scripts/check-bundle.mjs --update-baseline。'
  );
}

const snapshot = {
  entryGzipKb: kb(entry.reduce((sum, file) => sum + gzipKb(file), 0)),
  initialGzipKb: kb(initialGzipKb),
  threeGzipKb: lazyChunks.three ? kb(gzipKb(lazyChunks.three)) : 0,
  volumeGzipKb: lazyChunks.volume ? kb(gzipKb(lazyChunks.volume)) : 0,
  paletteGzipKb: lazyChunks.palette ? kb(gzipKb(lazyChunks.palette)) : 0,
  capturedAt: new Date().toISOString().slice(0, 10),
};

if (!baseline || updateBaseline) {
  writeFileSync(baselinePath, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`[bundle] 基线已${baseline ? '更新' : '创建'}：scripts/bundle-baseline.json`);
}

console.log('[bundle] 首屏 JS（gzip）:', JSON.stringify(snapshot));
if (failures.length) {
  failures.forEach(failure => console.error(`[bundle] FAIL ${failure}`));
  process.exit(1);
}
console.log('[bundle] PASS three 独立分包且首屏体积在预算内。');
