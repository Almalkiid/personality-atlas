import { test, expect } from '@playwright/test';
import { openReport } from './helpers.mjs';

function stub(page, reply = { ok: true }) {
  const sent = [];
  page.route('**/macros/s/**', async route => {
    sent.push(JSON.parse(route.request().postData()));
    await new Promise(r => setTimeout(r, 150));
    if (reply === 'network') return route.abort('failed');
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(reply) });
  });
  return sent;
}
const card = page => page.locator('section.submit-card');

test('adult sends name only', async ({ page }) => {
  const sent = stub(page);
  await openReport(page, { profile: { band: '25-34', sex: 'f' } });
  await card(page).getByLabel('Your name').fill('Sara Ahmed');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  await card(page).getByRole('button', { name: 'Send my results' }).click();
  await expect(card(page).getByText(/Sent/)).toBeVisible();
  expect(sent).toHaveLength(1);
  const p = sent[0];
  expect([p.name, p.email, p.adult, p.ageBand, p.sex, p.instrument, p.answers.length, p.consent]).toEqual(['Sara Ahmed', '', true, '25-34', 'f', 'ipip50', 50, true]);
  expect(Object.keys(p.domains)).toEqual(['E', 'A', 'C', 'N', 'O']);
  expect(p.domains.E.pct).toBeGreaterThan(0);
  expect(p.normGroup).toBe('25-34|f');
});

test('send disabled until name and consent', async ({ page }) => {
  stub(page);
  await openReport(page, { profile: { band: '25-34' } });
  const send = card(page).getByRole('button', { name: 'Send my results' });
  await expect(send).toBeDisabled();
  await card(page).getByLabel('Your name').fill('Sara');
  await expect(send).toBeDisabled();
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  await expect(send).toBeEnabled();
});

test('minor must give parent name and parent consent', async ({ page }) => {
  const sent = stub(page);
  await openReport(page, { instrumentId: 'ipipneo120', itemCount: 120, profile: { band: '14-17', sex: 'm' } });
  await card(page).getByLabel('Your name').fill('Omar');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  const send = card(page).getByRole('button', { name: 'Send my results' });
  await expect(send).toBeDisabled();
  await card(page).getByLabel("Parent or guardian's name").fill('Huda Ahmed');
  await expect(send).toBeDisabled();
  await card(page).getByRole('checkbox', { name: /parent or guardian/ }).check();
  await send.click();
  await expect(card(page).getByText(/Sent/)).toBeVisible();
  expect([sent[0].adult, sent[0].parentName, sent[0].parentConsent, sent[0].parentEmail]).toEqual([false, 'Huda Ahmed', true, '']);
  expect(Object.keys(sent[0].facets)).toHaveLength(30);
});

test('no age → asks 18 or over', async ({ page }) => {
  const sent = stub(page);
  await openReport(page, {});
  await card(page).getByLabel('Your name').fill('Sam');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  const send = card(page).getByRole('button', { name: 'Send my results' });
  await expect(send).toBeDisabled();
  await card(page).getByRole('radio', { name: 'Yes, 18 or over' }).check();
  await send.click();
  await expect(card(page).getByText(/Sent/)).toBeVisible();
  expect([sent[0].adult, sent[0].ageBand]).toEqual([true, '']);
});

test('send twice creates one submission', async ({ page }) => {
  const sent = stub(page);
  await openReport(page, { profile: { band: '25-34' } });
  await card(page).getByLabel('Your name').fill('Sara');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  const send = card(page).getByRole('button', { name: 'Send my results' });
  await send.evaluate(b => { b.click(); b.click(); }); // a real double-click: two clicks in the same instant
  await expect(card(page).getByText(/Sent/)).toBeVisible();
  expect(sent).toHaveLength(1);
});

test('failed send shows copyable record', async ({ page }) => {
  stub(page, 'network');
  await openReport(page, { profile: { band: '25-34' } });
  await card(page).getByLabel('Your name').fill('Sara');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  await card(page).getByRole('button', { name: 'Send my results' }).click();
  await expect(card(page).getByText(/Could not send/)).toBeVisible();
  const raw = await card(page).locator('textarea').inputValue();
  expect(JSON.parse(raw).name).toBe('Sara');
  await expect(card(page).getByRole('button', { name: 'Send my results' })).toBeEnabled();
});

test('server rejection message is shown', async ({ page }) => {
  stub(page, { ok: false, error: 'Please enter your name (up to 100 characters).' });
  await openReport(page, { profile: { band: '25-34' } });
  await card(page).getByLabel('Your name').fill('Sara');
  await card(page).getByRole('checkbox', { name: /I agree to send/ }).check();
  await card(page).getByRole('button', { name: 'Send my results' }).click();
  await expect(card(page).getByText(/up to 100 characters/)).toBeVisible();
});
