import { test, expect } from '@playwright/test';
import { openReport } from './helpers.mjs';

test('report shows 5 domain percentiles and the norm group with N', async ({ page }) => {
  await openReport(page, { profile: { band: '25-34', sex: 'f' } });
  await expect(page.locator('.domain-card')).toHaveCount(5);
  await expect(page.getByText(/Compared with [\d,]+ women aged 25–34/)).toBeVisible();
  for (const name of ['Extraversion', 'Agreeableness', 'Conscientiousness', 'Neuroticism', 'Openness to Experience']) {
    await expect(page.locator('.bar-row', { hasText: name }).locator('.pct')).toHaveText(/^\d{1,2}$/);
  }
  await expect(page.getByRole('heading', { name: 'Watch-outs' }).first()).toBeVisible();
});

test('in-depth report shows 30 facets', async ({ page }) => {
  await openReport(page, { instrumentId: 'ipipneo120', itemCount: 120 });
  await expect(page.locator('.facet')).toHaveCount(30);
  await expect(page.getByText(/Compared with [\d,]+ people of all ages/)).toBeVisible();
});

test("youth report shows the reliability note and no 'Watch-outs' label", async ({ page }) => {
  await openReport(page, { instrumentId: 'ipipneo120', itemCount: 120, profile: { band: '10-13', sex: 'm' } });
  await expect(page.getByText(/less reliable/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Watch-outs' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Worth knowing' }).first()).toBeVisible();
});

test('method page lists every source with a link', async ({ page }) => {
  const { sources } = await import('../../js/content/sources.js');
  await page.goto('./#method');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Method & sources');
  for (const s of Object.values(sources)) await expect(page.locator(`a[href="${s.url}"]`).first()).toBeAttached();
  await expect(page.getByText(/410,376/)).toBeVisible();
});
