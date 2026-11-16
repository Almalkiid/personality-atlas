import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// server/validate.js is plain Apps Script code (no modules). Load it the way Apps Script does: as globals.
const ctx = {};
vm.runInNewContext(readFileSync(new URL('../server/validate.js', import.meta.url), 'utf8'), ctx);
const { validateSubmission, toRow, ITEM_COUNTS, COLUMNS } = ctx;

const domains = { E: { pct: 45, raw: 31 }, A: { pct: 4, raw: 30 }, C: { pct: 45, raw: 33 }, N: { pct: 43, raw: 29 }, O: { pct: 20, raw: 34 } };
const base = () => ({
  v: '0.3.0', instrument: 'ipip50', name: 'Sara Ahmed', email: '', adult: true, ageBand: '25-34', sex: 'f',
  parentName: '', parentEmail: '', consent: true, parentConsent: false, consentVersion: '2026-11-16',
  normGroup: '25-34|f', domains, facets: null, answers: Array(50).fill(3), website: '',
});

test('validate accepts a complete adult record', () => assert.equal(JSON.stringify(validateSubmission(base(), ITEM_COUNTS)), '{"ok":true}'));
test('email optional (empty accepted), malformed rejected', () => {
  assert.equal(validateSubmission({ ...base(), email: '' }, ITEM_COUNTS).ok, true);
  assert.equal(validateSubmission({ ...base(), email: 'sara@example.com' }, ITEM_COUNTS).ok, true);
  assert.equal(validateSubmission({ ...base(), email: 'not-an-email' }, ITEM_COUNTS).ok, false);
});
test('rejects missing or too-long name', () => {
  assert.equal(validateSubmission({ ...base(), name: '   ' }, ITEM_COUNTS).ok, false);
  assert.equal(validateSubmission({ ...base(), name: 'x'.repeat(101) }, ITEM_COUNTS).ok, false);
});
test('rejects missing consent', () => assert.equal(validateSubmission({ ...base(), consent: false }, ITEM_COUNTS).ok, false));
test('rejects minor without parent', () => {
  const minor = { ...base(), adult: false, ageBand: '14-17' };
  assert.equal(validateSubmission(minor, ITEM_COUNTS).ok, false);
  assert.equal(validateSubmission({ ...minor, parentName: 'Huda Ahmed' }, ITEM_COUNTS).ok, false); // no parent consent tick
  assert.equal(validateSubmission({ ...minor, parentName: 'Huda Ahmed', parentConsent: true }, ITEM_COUNTS).ok, true);
});
test('rejects a youth age band marked adult', () => assert.equal(validateSubmission({ ...base(), ageBand: '10-13' }, ITEM_COUNTS).ok, false));
test('rejects wrong answer count or values', () => {
  assert.equal(validateSubmission({ ...base(), answers: Array(49).fill(3) }, ITEM_COUNTS).ok, false);
  assert.equal(validateSubmission({ ...base(), answers: [...Array(49).fill(3), 6] }, ITEM_COUNTS).ok, false);
  assert.equal(validateSubmission({ ...base(), instrument: 'bfi2' }, ITEM_COUNTS).ok, false);
});
test('rejects honeypot', () => assert.equal(validateSubmission({ ...base(), website: 'http://spam' }, ITEM_COUNTS).ok, false));
test('row has the 24 columns in order', () => {
  assert.equal(COLUMNS.length, 24);
  assert.equal(COLUMNS[0], 'received_at');
  assert.equal(COLUMNS[23], 'answers');
  const row = toRow(base(), new Date('2026-11-16T12:00:00Z'));
  assert.equal(row.length, 24);
  assert.equal(row[COLUMNS.indexOf('name')], 'Sara Ahmed');
  assert.equal(row[COLUMNS.indexOf('E_pct')], 45);
  assert.equal(row[COLUMNS.indexOf('answers')], '3'.repeat(50));
  assert.equal(row[COLUMNS.indexOf('adult')], 'yes');
});
test('cell values are formula-safe', () => {
  const row = toRow({ ...base(), name: '=HYPERLINK("http://x","y")', email: '+1@x.com' }, new Date());
  assert.equal(row[COLUMNS.indexOf('name')], `'=HYPERLINK("http://x","y")`);
  assert.equal(row[COLUMNS.indexOf('email')], `'+1@x.com`);
});
