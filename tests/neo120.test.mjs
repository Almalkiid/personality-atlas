import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ipipneo120 } from '../js/instruments/ipipneo120.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/alheimsins-neo120-en.json', import.meta.url)));
const norm = s => s.replace(/\.$/, '').trim().toLowerCase();

test('120 items, 24 per domain, 4 per facet', () => {
  assert.equal(ipipneo120.items.length, 120);
  for (const d of ['N', 'E', 'O', 'A', 'C']) {
    assert.equal(ipipneo120.items.filter(i => i.domain === d).length, 24, d);
    for (let f = 1; f <= 6; f++) assert.equal(ipipneo120.items.filter(i => i.domain === d && i.facet === f).length, 4, d + f);
  }
  assert.equal(ipipneo120.facets.length, 30);
});

test('item order matches IPIP120.dat I1..I120 (Johnson short-form numbering)', () => {
  ipipneo120.items.forEach((it, i) => assert.equal(it.id, 'i' + (i + 1)));
  assert.equal(ipipneo120.items[0].text, 'Worry about things.');
  assert.equal(ipipneo120.items[1].text, 'Make friends easily.');
});

test('text, domain, facet and keying agree with the independent alheimsins copy', () => {
  ipipneo120.items.forEach((it, i) => {
    const f = fixture[i];
    // Item 58: Johnson's official questionnaire (OSF uf6dg) reads "right or wrong"; alheimsins has "right and wrong".
    if (i + 1 === 58) assert.equal(it.text, 'Believe that there is no absolute right or wrong.');
    else assert.equal(norm(it.text), norm(f.text), `item ${i + 1} text`);
    assert.equal(it.domain, f.domain, `item ${i + 1} domain`);
    assert.equal(it.facet, f.facet, `item ${i + 1} facet`);
    assert.equal(it.keyed, f.keyed, `item ${i + 1} keyed`);
  });
});
