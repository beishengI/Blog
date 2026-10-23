/* Mobile QA: no horizontal overflow, plate strip, footer. */
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  await page.evaluate(() => document.getElementById('studies')?.scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.resolve('.verify/redesign/mobile-studies.png') });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.resolve('.verify/redesign/mobile-footer.png') });
  console.log(JSON.stringify({ overflow, errors }, null, 2));
  await browser.close();
})();
