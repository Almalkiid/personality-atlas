import { test, expect } from '@playwright/test';

const seed = (page, s) => page.evaluate(v => localStorage.setItem('personality-atlas:progress', JSON.stringify(v)), s);

test('report does not paint over another view', async ({ page }) => {
  await page.route('**/data/norms-ipip50.json', async route => { await new Promise(r => setTimeout(r, 1200)); await route.continue(); });
  await page.goto('./');
  await seed(page, { instrumentId: 'ipip50', itemCount: 50, answers: Array(50).fill(3), index: 49, profile: {}, rerouted: false });
  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.getByRole('link', { name: 'Method & sources' }).click();
  await page.waitForTimeout(1800);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Method & sources');
});

test('starting another test asks before discarding progress', async ({ page }) => {
  await page.goto('./');
  await seed(page, { instrumentId: 'ipip50', itemCount: 50, answers: [4, 2, ...Array(48).fill(null)], index: 2, profile: {}, rerouted: false });
  await page.reload();
  await page.getByRole('button', { name: /In-depth/ }).click();
  await expect(page.getByRole('heading', { name: 'You have a test in progress' })).toBeVisible();
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('personality-atlas:progress')).answers.slice(0, 2));
  expect(kept).toEqual([4, 2]);
  await page.getByRole('button', { name: 'Keep my progress' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: /In-depth/ }).click();
  await page.getByRole('button', { name: 'Discard and start' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A little about you');
});

test('privacy wording says data leaves only if you choose to send', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('footer')).toContainText('unless you choose to send them');
  await expect(page.getByText(/never leave/)).toHaveCount(0);
});
