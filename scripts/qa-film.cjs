/* Film QA: click through the hero film, verify video/audio and console. */
const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: /P-00/ }).click();
  await page.waitForTimeout(300);
  await page.locator('.lightbox__play').click();
  await page.waitForTimeout(2500);
  const video = await page.evaluate(() => {
    const el = document.querySelector('video');
    if (!el) return null;
    return {
      duration: el.duration,
      currentTime: el.currentTime,
      paused: el.paused,
      readyState: el.readyState,
      src: el.currentSrc,
      videoWidth: el.videoWidth,
      videoHeight: el.videoHeight,
    };
  });
  await page.screenshot({ path: path.resolve('.verify/redesign/film-playing.png') });
  const audio = await page.evaluate(() => {
    const el = document.querySelector('audio');
    return el ? { src: el.currentSrc, duration: el.duration } : null;
  });
  console.log(JSON.stringify({ video, audio, errors }, null, 2));
  await browser.close();
})();
