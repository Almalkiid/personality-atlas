import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facetDescription } from '../js/views/report.js';

const ft = { low: 'LOW', high: 'HIGH' };
test('facet at p=50 shows neither extreme; <30 low; >70 high', () => {
  assert.equal(facetDescription(ft, 29), 'LOW');
  assert.equal(facetDescription(ft, 30), 'Typical for your comparison group.');
  assert.equal(facetDescription(ft, 50), 'Typical for your comparison group.');
  assert.equal(facetDescription(ft, 70), 'Typical for your comparison group.');
  assert.equal(facetDescription(ft, 71), 'HIGH');
});
