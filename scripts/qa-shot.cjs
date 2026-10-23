/* Local QA helper: scroll the SPA to trigger reveals, capture sections, collect console errors.
 * Run:
 *   $env:NODE_PATH='C:\Users\<user>\AppData\Roaming\npm\node_modules\@playwright\cli\node_modules'
 *   node scripts/qa-shot.cjs http://127.0.0.1:5173/
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const url = process.argv[2] || 'http://127.0.0.1:5173/';
const outDir = path.resolve('.verify/redesign');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', error => errors.push(`[pageerror] ${String(error)}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await page.evaluate(value => window.scrollTo(0, value), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(outDir, 'home-qa-full.png'), fullPage: true });
  const sections = [
    ['#studies', 'studies'],
    ['#diagnosis', 'diagnosis'],
    ['#protocols', 'protocols'],
    ['#history', 'history'],
    ['#literature', 'literature'],
    ['#contact', 'contact'],
    ['.lightbox-interlude', 'interlude'],
  ];
  for (const [selector, name] of sections) {
    const element = await page.$(selector);
    if (element) await element.screenshot({ path: path.join(outDir, `${name}.png`) });
  }

  // Mobile viewport check
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[mobile console] ${msg.text()}`);
  });
  mobile.on('pageerror', error => errors.push(`[mobile pageerror] ${String(error)}`));
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(800);
  await mobile.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: false });
  await mobile.screenshot({ path: path.join(outDir, 'home-mobile-full.png'), fullPage: true });

  // Route pass: catch console errors and take top-of-page screenshots.
  const routes = [
    ['/about', 'about'],
    ['/resume', 'resume'],
    ['/work', 'work'],
    ['/posts', 'posts'],
    ['/posts/contract-preaudit-agent', 'post-detail'],
    ['/work/contract-agent', 'work-detail'],
    ['/wiki', 'wiki'],
  ];
  for (const [route, name] of routes) {
    await page.goto(`${url.replace(/\/$/, '')}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `route-${name}.png`), fullPage: false });
  }

  console.log(JSON.stringify({ errors, height, mobileHeight: await mobile.evaluate(() => document.body.scrollHeight) }, null, 2));
  await browser.close();
})();
