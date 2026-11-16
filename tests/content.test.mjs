import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportText } from '../js/content/report-text.js';
import { sources } from '../js/content/sources.js';
import { ipipneo120 } from '../js/instruments/ipipneo120.js';

const DOMAINS = ['E', 'A', 'C', 'N', 'O'];
const allText = JSON.stringify(reportText);

test('every domain has all bands for adult and youth', () => {
  for (const d of DOMAINS) for (const b of ['low', 'average', 'high']) for (const who of ['adult', 'youth']) {
    assert.ok(reportText[d].bands[b][who]?.length > 40, `${d} ${b} ${who}`);
  }
});

test('every domain has strengths, watch-outs and tips for low and high', () => {
  for (const d of DOMAINS) for (const k of ['strengths', 'watchOuts', 'tips']) for (const b of ['low', 'high']) {
    assert.ok(reportText[d][k][b].length >= 2, `${d} ${k} ${b}`);
  }
});

test('every outcomes entry cites a known source key', () => {
  for (const d of DOMAINS) {
    assert.ok(reportText[d].outcomes.length >= 2, d);
    for (const o of reportText[d].outcomes) assert.ok(sources[o.source], `${d}: ${o.source}`);
  }
});

test("no text contains 'neurotic', 'disorder', 'diagnos'", () => {
  assert.doesNotMatch(allText, /neurotic\b|disorder|diagnos/i);
});

test('all 30 facets have text matching Johnson facet names', () => {
  for (const f of ipipneo120.facets) {
    const t = reportText[f.domain].facets[f.facet];
    assert.equal(t?.name, f.name, `${f.domain}${f.facet}`);
    assert.ok(t.low.length > 10 && t.high.length > 10, `${f.domain}${f.facet}`);
  }
});

test('every source has a citation and an https url', () => {
  for (const [k, s] of Object.entries(sources)) {
    assert.ok(s.citation.length > 20, k);
    assert.match(s.url, /^https:\/\//, k);
  }
});
