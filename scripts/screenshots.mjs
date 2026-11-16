// Capture README screenshots in real Chromium. Needs `npm run serve` running on :8765.
import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:8765/';
const out = p => `docs/screenshots/${p}.png`;
const seed = (n, id, profile) => ({ instrumentId: id, itemCount: n, answers: Array.from({ length: n }, (_, i) => [4, 2, 5, 3, 4, 1, 4, 3][i % 8]), index: n - 1, profile, rerouted: false });

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) for (const [vw, vh, tag] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
  const page = await browser.newPage({ viewport: { width: vw, height: vh }, colorScheme: scheme, deviceScaleFactor: 2 });
  const shot = async name => page.screenshot({ path: out(`${name}-${tag}-${scheme}`) });
  await page.goto(BASE); await page.waitForTimeout(300); await shot('1-home');
  await page.getByRole('button', { name: /In-depth/ }).click(); await page.waitForTimeout(250); await shot('2-about');
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.keyboard.press('4'); await page.waitForTimeout(400); await page.keyboard.press('2'); await page.waitForTimeout(400); await shot('3-question');
  await page.evaluate(s => localStorage.setItem('personality-atlas:progress', JSON.stringify(s)), seed(120, 'ipipneo120', { band: '35-44', sex: 'f' }));
  await page.goto(BASE); await page.getByRole('button', { name: 'Resume' }).click();
  await page.getByRole('heading', { level: 1, name: 'Your personality profile' }).waitFor(); await page.waitForTimeout(400);
  await shot('4-report-top');
  await page.locator('.domain-card').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await shot('5-report-card');
  if (tag === 'desktop' && scheme === 'light') {
    await page.screenshot({ path: out('report-full'), fullPage: true });
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Share image' }).click()]);
    await dl.saveAs(out('share-card'));
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: 'docs/screenshots/report-sample.pdf', format: 'A4', printBackground: true });
    await page.emulateMedia({ media: 'screen' });
  }
  await page.goto(BASE + '#method'); await page.waitForTimeout(400); await shot('6-method');
  await page.close();
}
await browser.close();
console.log('done');
