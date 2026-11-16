import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { percentile, pickGroup, band, ageBand } from '../js/norms.js';
import { parseIpip120Line } from '../scripts/build-norms.mjs';
import { ipipneo120 } from '../js/instruments/ipipneo120.js';
import { ipip50 } from '../js/instruments/ipip50.js';
import { scoreAnswers } from '../js/scoring.js';

test('percentile uses mid-rank and is clamped to 1..99', () => {
  const scale = { min: 1, counts: [10, 20, 40, 20, 10] }; // N = 100, symmetric
  assert.equal(percentile(scale, 3), 50);          // (30 + 20) / 100
  assert.equal(percentile(scale, 1), 5);           // (0 + 5) / 100
  assert.equal(percentile({ min: 1, counts: [1000, 0] }, 1), 50);
  assert.equal(percentile({ min: 1, counts: [0, 1000] }, 2), 50);
  assert.equal(percentile({ min: 1, counts: [1, 100000] }, 1), 1);   // clamp low
  assert.equal(percentile({ min: 1, counts: [100000, 1] }, 2), 99);  // clamp high
  assert.equal(percentile(scale, 99), 99);          // beyond range → top
});

test('band cut points: 29 low, 30 average, 70 average, 71 high', () => {
  assert.equal(band(29), 'low');
  assert.equal(band(30), 'average');
  assert.equal(band(70), 'average');
  assert.equal(band(71), 'high');
});

test('ageBand maps ages to the agreed bands', () => {
  assert.equal(ageBand(9), 'under10');
  assert.equal(ageBand(10), '10-13');
  assert.equal(ageBand(17), '14-17');
  assert.equal(ageBand(18), '18-24');
  assert.equal(ageBand(64), '55-64');
  assert.equal(ageBand(65), '65+');
});

test('pickGroup falls back when a cell has fewer than 500 people', () => {
  const norms = { meta: { minCell: 500 }, groups: {
    '25-34|f': { n: 900 }, '65+|f': { n: 120 }, '65+|any': { n: 700 }, '10-13|any': { n: 80 }, 'all|any': { n: 5000 } } };
  assert.deepEqual(pickGroup(norms, { band: '25-34', sex: 'f' }), { key: '25-34|f', n: 900, fallback: false });
  assert.deepEqual(pickGroup(norms, { band: '65+', sex: 'f' }), { key: '65+|any', n: 700, fallback: true });
  assert.deepEqual(pickGroup(norms, { band: '10-13', sex: 'm' }), { key: 'all|any', n: 5000, fallback: true });
  assert.deepEqual(pickGroup(norms, {}), { key: 'all|any', n: 5000, fallback: false });
  assert.deepEqual(pickGroup(norms, { sex: 'f' }), { key: 'all|any', n: 5000, fallback: true });
});

test('ages 10-13 fall back to 14-17 norms before the whole sample (spec)', () => {
  const norms = { meta: { minCell: 500 }, groups: {
    '10-13|any': { n: 80 }, '14-17|m': { n: 600 }, '14-17|any': { n: 1500 }, 'all|any': { n: 5000 } } };
  assert.deepEqual(pickGroup(norms, { band: '10-13', sex: 'm' }), { key: '14-17|m', n: 600, fallback: true });
  assert.deepEqual(pickGroup(norms, { band: '10-13' }), { key: '14-17|any', n: 1500, fallback: true });
});

test('norms raw data not double-reversed (IPIP120.dat stores already-recoded values)', () => {
  const line = readFileSync(new URL('./fixtures/ipip120-head3.dat', import.meta.url), 'utf8').split(/\r?\n/)[0];
  const rec = parseIpip120Line(line, ipipneo120);
  assert.equal(rec.sex, 'f');
  assert.equal(rec.age, 19);
  const digits = line.slice(31, 151).split('').map(Number);
  const handN = ipipneo120.items.reduce((s, it, i) => it.domain === 'N' ? s + digits[i] : s, 0);
  assert.equal(rec.scores.N, handN);
  const handN1 = ipipneo120.items.reduce((s, it, i) => it.domain === 'N' && it.facet === 1 ? s + digits[i] : s, 0);
  assert.equal(rec.scores.N1, handN1);
});

const built = existsSync(new URL('../data/norms-ipip50.json', import.meta.url));
test('ipip50 N direction matches app: an all-calm pattern is below the 10th percentile', { skip: !built && 'norms not built' }, () => {
  const norms = JSON.parse(readFileSync(new URL('../data/norms-ipip50.json', import.meta.url)));
  // Calm: agree fully with calm items (N minus), disagree with upset items (N plus); neutral elsewhere.
  const answers = ipip50.items.map(it => it.domain !== 'N' ? 3 : it.keyed === 'plus' ? 1 : 5);
  const raw = scoreAnswers(ipip50, answers).domains.N.raw;
  assert.equal(raw, 10);
  assert.ok(percentile(norms.groups['all|any'].scales.N, raw) < 10);
});

test('norm tables have the documented shape and sane sizes', { skip: !built && 'norms not built' }, () => {
  for (const [file, inst, minN] of [['norms-ipip50.json', ipip50, 15000], ['norms-ipipneo120.json', ipipneo120, 400000]]) {
    const norms = JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url)));
    const all = norms.groups['all|any'];
    assert.ok(all.n >= minN, `${file} n=${all.n}`);
    for (const d of ['E', 'A', 'C', 'N', 'O']) {
      const s = all.scales[d];
      const items = inst.items.filter(i => i.domain === d).length;
      assert.equal(s.min, items);
      assert.equal(s.counts.length, items * 4 + 1);
      assert.equal(s.counts.reduce((a, b) => a + b, 0), all.n);
    }
  }
});
