import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { openReport } from './helpers.mjs';

test('share image downloads a 1080x1350 png', async ({ page }) => {
  await openReport(page, { profile: { band: '25-34', sex: 'm' } });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Share image' }).click()]);
  expect(download.suggestedFilename()).toBe('personality-atlas.png');
  const buf = readFileSync(await download.path());
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  expect(buf.readUInt32BE(16)).toBe(1080);
  expect(buf.readUInt32BE(20)).toBe(1350);
});

test('print media hides buttons and keeps every domain card', async ({ page }) => {
  await openReport(page, { instrumentId: 'ipipneo120', itemCount: 120 });
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('button', { name: 'Save as PDF' })).toBeHidden();
  await expect(page.locator('.domain-card')).toHaveCount(5);
  await expect(page.locator('.print-only')).toBeVisible();
  const pdf = await page.pdf({ format: 'A4' });
  expect(pdf.length).toBeGreaterThan(20000);
});
