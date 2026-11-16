import { test, expect } from '@playwright/test';

async function start(page, testName, { age, sex } = {}) {
  await page.goto('./');
  await page.getByRole('button', { name: new RegExp(testName) }).click();
  if (age) await page.getByRole('radio', { name: age, exact: true }).check({ force: true });
  if (sex) await page.getByRole('radio', { name: sex, exact: true }).check({ force: true });
  await page.getByRole('button', { name: /Begin|Continue/ }).click();
}

test('under 10 sees the age gate and cannot start', async ({ page }) => {
  await start(page, 'Quick', { age: 'Under 10' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ages 10 and up');
  await expect(page.getByText(/Statement 1 of/)).toHaveCount(0);
});

test('10-13 is routed to In-depth with caution flag', async ({ page }) => {
  await start(page, 'Quick', { age: '10–13' });
  await expect(page.getByText('Statement 1 of 120')).toBeVisible();
  await expect(page.getByText(/In-depth test/)).toBeVisible();
});

test('key 3 answers and auto-advances', async ({ page }) => {
  await start(page, 'Quick');
  await expect(page.getByText('Statement 1 of 50')).toBeVisible();
  await page.keyboard.press('3');
  await expect(page.getByText('Statement 2 of 50')).toBeVisible();
  await page.keyboard.press('Backspace');
  await expect(page.getByText('Statement 1 of 50')).toBeVisible();
  await expect(page.getByRole('radio', { name: /Neither accurate nor inaccurate/ })).toHaveAttribute('aria-checked', 'true');
});

test('refresh offers resume at the same statement', async ({ page }) => {
  await start(page, 'Quick');
  for (const k of ['4', '2', '5']) { await page.keyboard.press(k); await page.waitForTimeout(260); }
  await expect(page.getByText('Statement 4 of 50')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Resume/ }).click();
  await expect(page.getByText('Statement 4 of 50')).toBeVisible();
});

test('skipping about-you still reaches results', async ({ page }) => {
  await start(page, 'Quick');
  for (let i = 0; i < 50; i++) { await page.keyboard.press(String((i % 5) + 1)); await page.waitForTimeout(220); }
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your personality profile');
});
