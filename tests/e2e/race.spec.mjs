import { test, expect } from '@playwright/test';

const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('personality-atlas:progress')));
async function startQuick(page) {
  await page.goto('./');
  await page.getByRole('button', { name: /Quick/ }).click();
  await page.getByRole('button', { name: 'Begin' }).click();
  await expect(page.getByText('Statement 1 of 50')).toBeVisible();
}

test('Next during auto-advance does not skip a statement', async ({ page }) => {
  await startQuick(page);
  await page.keyboard.press('2');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(400);
  await expect(page.getByText('Statement 2 of 50')).toBeVisible();
  expect((await saved(page)).answers.slice(0, 3)).toEqual([2, null, null]);
});

test('fast keys answer consecutive statements, never overwrite', async ({ page }) => {
  await startQuick(page);
  await page.keyboard.press('3');
  await page.keyboard.press('4');
  await page.waitForTimeout(400);
  await expect(page.getByText('Statement 3 of 50')).toBeVisible();
  expect((await saved(page)).answers.slice(0, 3)).toEqual([3, 4, null]);
});

test('Backspace during auto-advance stays on the previous statement', async ({ page }) => {
  await startQuick(page);
  await page.keyboard.press('5');
  await expect(page.getByText('Statement 2 of 50')).toBeVisible();
  await page.keyboard.press('2');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  await expect(page.getByText('Statement 1 of 50')).toBeVisible();
});

test('back to About and Begin keeps the answers', async ({ page }) => {
  await startQuick(page);
  for (const k of ['4', '2', '5']) { await page.keyboard.press(k); await page.waitForTimeout(260); }
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Backspace'); await page.waitForTimeout(60); }
  await page.getByRole('button', { name: 'Begin' }).click();
  await expect(page.getByText('Statement 1 of 50')).toBeVisible();
  expect((await saved(page)).answers.slice(0, 4)).toEqual([4, 2, 5, null]);
});
