import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const playwright = require('playwright');

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const file = (name) => 'file:///' + path.join(here, name).replace(/\\/g, '/');

const jobs = [
  { html: 'character-sheet.html', selector: '#sheet', out: 'character-sheet.png', width: 2400, height: 2000 },
  { html: 'camera-map-60s.html', selector: '#map', out: 'camera-map-60s.png', width: 2400, height: 1200 },
  { html: 'storyboard-60s.html', selector: '#sheet', out: 'storyboard-60s.png', width: 2400, height: 3000 },
];

const browser = await playwright.chromium.launch({ channel: 'chrome' });
for (const job of jobs) {
  if (!fs.existsSync(path.join(here, job.html))) {
    console.log(JSON.stringify({ html: job.html, skipped: 'missing' }));
    continue;
  }
  const page = await browser.newPage({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1.5,
    locale: 'zh-CN',
  });
  await page.goto(file(job.html), { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(500);
  const el = page.locator(job.selector).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
  const box = await el.boundingBox();
  if (!box) {
    console.log(JSON.stringify({ html: job.html, error: 'no box' }));
    await page.close();
    continue;
  }
  await page.screenshot({
    path: path.join(here, job.out),
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 10000) },
    animations: 'disabled',
  });
  console.log(JSON.stringify({ html: job.html, out: job.out, w: box.width, h: box.height }));
  await page.close();
}
await browser.close();
