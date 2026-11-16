import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipip50 } from '../js/instruments/ipip50.js';
import { scoreAnswers } from '../js/scoring.js';

const count = (inst, d, k) => inst.items.filter(i => i.domain === d && i.keyed === k).length;

test('ipip50 has 10 items per domain', () => {
  for (const d of ['E', 'A', 'C', 'N', 'O']) assert.equal(ipip50.items.filter(i => i.domain === d).length, 10, d);
  assert.equal(ipip50.items.length, 50);
});

test('ipip50 key matches official (N = official Emotional Stability inverted)', () => {
  const expected = { E: [5, 5], A: [6, 4], C: [6, 4], N: [8, 2], O: [7, 3] };
  for (const [d, [plus, minus]] of Object.entries(expected)) {
    assert.equal(count(ipip50, d, 'plus'), plus, `${d} plus`);
    assert.equal(count(ipip50, d, 'minus'), minus, `${d} minus`);
  }
});

test('ipip50 item 1 and item 4 keyed as on ipip.ori.org', () => {
  assert.deepEqual([ipip50.items[0].text, ipip50.items[0].domain, ipip50.items[0].keyed], ['Am the life of the party.', 'E', 'plus']);
  // Official: "Get stressed out easily" is Emotional Stability minus → Neuroticism plus.
  assert.deepEqual([ipip50.items[3].text, ipip50.items[3].domain, ipip50.items[3].keyed], ['Get stressed out easily.', 'N', 'plus']);
});

test('all-5 answers give E raw 30 (5 plus x5 + 5 minus x1)', () => {
  const r = scoreAnswers(ipip50, Array(50).fill(5));
  assert.equal(r.domains.E.raw, 30);
  assert.equal(r.domains.E.min, 10);
  assert.equal(r.domains.E.max, 50);
});

test('N raw equals 60 minus official Emotional Stability raw', () => {
  const answers = ipip50.items.map((_, i) => (i % 5) + 1);
  const r = scoreAnswers(ipip50, answers);
  // Official ES scoring: ES item keyed plus in official key = our minus.
  const es = ipip50.items.reduce((s, it, i) => it.domain !== 'N' ? s : s + (it.keyed === 'minus' ? answers[i] : 6 - answers[i]), 0);
  assert.equal(r.domains.N.raw, 60 - es);
});

test('incomplete answers throw', () => {
  assert.throws(() => scoreAnswers(ipip50, Array(49).fill(3)));
  assert.throws(() => scoreAnswers(ipip50, [...Array(49).fill(3), null]));
  assert.throws(() => scoreAnswers(ipip50, [...Array(49).fill(3), 6]));
});
