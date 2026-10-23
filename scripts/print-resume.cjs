/* Generate the public resume PDF from the live /resume page.
 * The page only contains the masked phone and no GPA, so the PDF is safe to publish.
 *
 * Run (with the dev server on :5173):
 *   $env:NODE_PATH='...\@playwright\cli\node_modules'
 *   node scripts/print-resume.cjs
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const outDir = path.resolve('public/resume');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'zhangdongdong-resume.pdf');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  await page.goto('http://127.0.0.1:5173/resume', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });
  console.log(out, fs.statSync(out).size);
  await browser.close();
})();
