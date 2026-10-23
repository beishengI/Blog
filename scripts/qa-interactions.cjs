/* Interaction QA: hero tabs, mobile menu, film/audio fallbacks. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const outDir = path.resolve('.verify/redesign');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  const tabs = await page.getByRole('tab').allTextContents();
  await page.getByRole('tab', { name: /P-01/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'interaction-study-01.png') });
  const title = await page.locator('.hero-findings__title').textContent();

  await page.getByRole('tab', { name: /P-02/ }).click();
  await page.waitForTimeout(300);
  const title2 = await page.locator('.hero-findings__title').textContent();

  await page.getByRole('tab', { name: /P-00/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'interaction-film.png') });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('console', msg => { if (msg.type() === 'error') errors.push(`[mobile] ${msg.text()}`); });
  mobile.on('pageerror', error => errors.push(`[mobile] ${String(error)}`));
  await mobile.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await mobile.getByRole('button', { name: /打开菜单/ }).click();
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: path.join(outDir, 'mobile-menu.png') });

  console.log(JSON.stringify({ tabs, title, title2, errors }, null, 2));
  await browser.close();
})();
