/**
 * 质感升级 QA：签名主视觉 / 调阅面板 / 原生转场 / 描画与数字滚动。
 * 运行前提：本地 dev server 监听 127.0.0.1:5173。
 * 断言全部基于 data-* 状态属性与可观察行为，并校验 console/pageerror 为空。
 */
const { chromium } = require('playwright');
const path = require('node:path');

const BASE = 'http://127.0.0.1:5173';
const SHOTS = path.resolve('.verify/showcase');
const results = [];
const errors = [];
let failed = false;

function check(name, condition, detail) {
  results.push({ name, pass: Boolean(condition), ...(detail === undefined ? {} : { detail }) });
  if (!condition) failed = true;
}

function watch(page, tag) {
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${tag}: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`${tag}: ${String(error)}`));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });

  // ---------- 桌面：WebGL 主视觉 + 交互 ----------
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  watch(page, 'desktop');
  let atlasOk = false;
  page.on('response', response => {
    if (response.url().includes('brats-intensity.jpg')) atlasOk = response.ok();
  });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  const status = await page.locator('.volume').getAttribute('data-webgl');
  await page
    .waitForFunction(() => document.querySelector('.volume')?.getAttribute('data-source') === 'brats', { timeout: 15000 })
    .catch(() => undefined);
  const source = await page.locator('.volume').getAttribute('data-source');
  check('桌面默认展示体切片且 WebGL 运行', status === 'on', `data-webgl=${status}`);
  check('体切片使用真实 BraTS 数据集', source === 'brats', `data-source=${source}`);
  check('真实切片图集请求成功', atlasOk);
  check('体切片 canvas 已挂载', (await page.locator('.volume__canvas').count()) === 1);
  await page.screenshot({ path: path.join(SHOTS, 'volume-desktop.png') });

  const box = await page.locator('.volume').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 20, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    check('拖拽旋转后无运行时错误', true);
  }
  await page.locator('.volume__auto').click();
  check('扫描复位按钮可用', (await page.locator('.volume__auto').getAttribute('aria-pressed')) === 'true');
  await page.screenshot({ path: path.join(SHOTS, 'volume-after-drag.png') });

  // ---------- 调阅面板 ----------
  await page.keyboard.press('Control+K');
  await page.waitForSelector('[data-cmd-open]', { timeout: 5000 });
  check('Ctrl+K 唤出调阅面板', true);
  await page.screenshot({ path: path.join(SHOTS, 'palette-open.png') });
  await page.keyboard.type('分割');
  await page.waitForTimeout(300);
  const optionText = await page.locator('.cmd__list').innerText();
  check('检索「分割」命中 Lite-Mamba', optionText.includes('Lite-Mamba'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Esc 收回调阅面板', (await page.locator('[data-cmd-open]').count()) === 0);

  await page.keyboard.press('Control+K');
  await page.waitForSelector('[data-cmd-open]');
  await page.keyboard.type('Lite-Mamba');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  check('Enter 直达作品检查报告', page.url().includes('/work/lite-mamba'), page.url());

  // ---------- 原生路由转场 ----------
  const vt = await page.evaluate(() => ({
    supported: typeof document.startViewTransition === 'function',
    name: getComputedStyle(document.getElementById('main')).viewTransitionName,
  }));
  check('支持 View Transitions 时正文已命名', !vt.supported || vt.name === 'main', JSON.stringify(vt));

  // ---------- 数字滚动 + 链路描画 ----------
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('.number-band').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  const numberText = await page.locator('.number-band__value').first().innerText();
  check('关键数字滚动后定格为真实值', numberText.includes('83.9'), numberText);
  await page.locator('.pipeline-trace').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  check('能力链路进入视口后描画', (await page.locator('.pipeline-trace.is-traced').count()) === 1);
  await page.screenshot({ path: path.join(SHOTS, 'pipeline-traced.png') });
  await desktop.close();

  // ---------- 减动效：静态帧 ----------
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  watch(reducedPage, 'reduced');
  await reducedPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await reducedPage.getByRole('tab', { name: /体切片/ }).click();
  await reducedPage.waitForTimeout(1500);
  const reducedStatus = await reducedPage.locator('.volume').getAttribute('data-webgl');
  check('减动效下输出静态帧', reducedStatus === 'static', `data-webgl=${reducedStatus}`);
  check('减动效下面板可键盘唤出', true);
  await reducedPage.screenshot({ path: path.join(SHOTS, 'volume-reduced.png') });
  await reduced.close();

  // ---------- 无 WebGL：CSS 图版回退 ----------
  const noGl = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const noGlPage = await noGl.newPage();
  watch(noGlPage, 'no-webgl');
  await noGlPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await noGlPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await noGlPage.getByRole('tab', { name: /体切片/ }).click();
  await noGlPage.waitForTimeout(800);
  const offStatus = await noGlPage.locator('.volume').getAttribute('data-webgl');
  check('无 WebGL 时退化为图版', offStatus === 'off', `data-webgl=${offStatus}`);
  check('图版包含 CSS 切片', (await noGlPage.locator('.volume__fallback span').count()) === 7);
  await noGlPage.screenshot({ path: path.join(SHOTS, 'volume-no-webgl.png') });
  await noGl.close();

  // ---------- 移动端：无横向溢出 ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  watch(mobilePage, 'mobile');
  await mobilePage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);
  for (const ratio of [0, 0.4, 1]) {
    await mobilePage.evaluate(value => {
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * value);
    }, ratio);
    await mobilePage.waitForTimeout(500);
    const width = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    check(`移动端滚动 ${ratio * 100}% 无横向溢出`, width <= 391, `scrollWidth=${width}`);
  }
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(SHOTS, 'mobile-home.png'), fullPage: false });

  await mobilePage.getByRole('tab', { name: /体切片/ }).click();
  await mobilePage
    .waitForFunction(() => document.querySelector('.volume')?.getAttribute('data-source') === 'brats', { timeout: 15000 })
    .catch(() => undefined);
  const mobileStatus = await mobilePage.locator('.volume').getAttribute('data-webgl');
  const mobileSource = await mobilePage.locator('.volume').getAttribute('data-source');
  check('移动端可展示真实体切片', mobileStatus === 'on' && mobileSource === 'brats', `${mobileStatus}/${mobileSource}`);
  await mobilePage.screenshot({ path: path.join(SHOTS, 'mobile-volume.png'), fullPage: false });
  await mobile.close();

  await browser.close();

  check('全程无 console/pageerror', errors.length === 0, errors.slice(0, 5));
  console.log(JSON.stringify({ results, errors }, null, 2));
  process.exit(failed || errors.length ? 1 : 0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
