import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/store.js';

let mem;
const fakeStorage = () => ({ getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } });
beforeEach(() => { mem = {}; });

test('save then load round-trips progress', () => {
  const store = createStore(fakeStorage());
  store.save({ instrumentId: 'ipip50', itemCount: 50, answers: [3, 4], index: 2, profile: { band: '25-34' } });
  assert.deepEqual(store.load({ id: 'ipip50', items: Array(50) }).answers, [3, 4]);
});

test('stale progress is discarded (item count changed)', () => {
  const store = createStore(fakeStorage());
  store.save({ instrumentId: 'ipip50', itemCount: 49, answers: [3], index: 1, profile: {} });
  assert.equal(store.load({ id: 'ipip50', items: Array(50) }), null);
  assert.equal(mem['personality-atlas:progress'], undefined);
});

test('corrupt JSON is discarded, not thrown', () => {
  mem['personality-atlas:progress'] = '{not json';
  const store = createStore(fakeStorage());
  assert.equal(store.peek(), null);
});

test('storage that throws is survived', () => {
  const store = createStore({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } });
  assert.doesNotThrow(() => store.save({ instrumentId: 'ipip50', itemCount: 50, answers: [], index: 0, profile: {} }));
  assert.equal(store.peek(), null);
  assert.doesNotThrow(() => store.clear());
});
