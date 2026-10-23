/* Layout QA for footer alignment and new motion layers. */
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.resolve('.verify/redesign/footer-1920.png') });
  const metrics = await page.evaluate(() => {
    const footer = document.querySelector('.site-footer');
    const cols = [...document.querySelectorAll('.site-footer__col')].map(el => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent?.trim().slice(0, 12), x: Math.round(r.x), width: Math.round(r.width) };
    });
    const sign = document.querySelector('.contact-sign')?.getBoundingClientRect();
    const phone = document.querySelector('.site-footer__phone')?.getBoundingClientRect();
    return {
      footer: footer ? { x: Math.round(footer.getBoundingClientRect().x), width: Math.round(footer.getBoundingClientRect().width) } : null,
      cols,
      sign: sign ? { x: Math.round(sign.x), y: Math.round(sign.y), width: Math.round(sign.width) } : null,
      phone: phone ? { x: Math.round(phone.x), y: Math.round(phone.y), width: Math.round(phone.width), height: Math.round(phone.height) } : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  desktop.on('pageerror', error => errors.push(String(error)));
  await desktop.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await desktop.waitForTimeout(1500);
  await desktop.screenshot({ path: path.resolve('.verify/redesign/home-motion.png') });
  await desktop.evaluate(() => document.getElementById('studies')?.scrollIntoView());
  await desktop.waitForTimeout(900);
  await desktop.screenshot({ path: path.resolve('.verify/redesign/studies-motion.png') });
  const strip = await desktop.$('.plate-strip');
  if (strip) await strip.screenshot({ path: path.resolve('.verify/redesign/plate-strip.png') });
  const ticker = await desktop.$('.evidence-ticker');
  if (ticker) await ticker.screenshot({ path: path.resolve('.verify/redesign/ticker.png') });

  console.log(JSON.stringify({ metrics, errors }, null, 2));
  await browser.close();
})();
