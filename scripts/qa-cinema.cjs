/* QA for the pinned cinema + number band. */
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const out = p => path.resolve('.verify/redesign', p);
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.evaluate(() => document.querySelector('.number-band')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(700);
  const band = await page.$('.number-band');
  if (band) await band.screenshot({ path: out('number-band.png') });

  await page.evaluate(() => document.getElementById('studies-cinema')?.scrollIntoView());
  await page.waitForTimeout(800);
  await page.screenshot({ path: out('cinema-01.png') });
  const states = [];
  for (let i = 0; i < 4; i += 1) {
    await page.mouse.wheel(0, 780);
    await page.waitForTimeout(650);
    states.push(await page.evaluate(() => ({
      transform: document.querySelector('.cinema__track')?.style.transform || '',
      active: document.querySelector('.cinema__nav .is-active')?.textContent || '',
      pinned: document.querySelector('.cinema')?.classList.contains('is-pinned') || false,
    })));
    if (i === 1) await page.screenshot({ path: out('cinema-02.png') });
  }
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('pageerror', error => errors.push(String(error)));
  await mobile.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await mobile.evaluate(() => document.getElementById('studies-cinema')?.scrollIntoView());
  await mobile.waitForTimeout(700);
  await mobile.screenshot({ path: out('cinema-mobile.png') });
  const mobileState = await mobile.evaluate(() => ({
    pinned: document.querySelector('.cinema')?.classList.contains('is-pinned') || false,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  console.log(JSON.stringify({ states, overflow, mobileState, errors }, null, 2));
  await browser.close();
})();
