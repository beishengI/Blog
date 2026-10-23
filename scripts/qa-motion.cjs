/* QA for crosshair, contact-sheet progress, footer closing. */
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.hover('.lightbox');
  await page.waitForTimeout(300);
  const cross = await page.locator('.media-cross').count();
  await page.screenshot({ path: path.resolve('.verify/redesign/crosshair.png') });

  await page.evaluate(() => {
    const el = document.querySelector('.plate-strip__viewport');
    if (el) el.scrollLeft = 420;
  });
  await page.waitForTimeout(300);
  const progress = await page.locator('.plate-strip__bar span').evaluate(el => el.style.width);
  const strip = await page.$('.plate-strip');
  if (strip) await strip.screenshot({ path: path.resolve('.verify/redesign/plate-strip-scrolled.png') });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.resolve('.verify/redesign/footer-final.png') });

  console.log(JSON.stringify({ cross, progress, errors }, null, 2));
  await browser.close();
})();
