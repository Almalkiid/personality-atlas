// Norm tables are loaded on demand and cached for the session.
const cache = {};
export function loadNorms(instrumentId) {
  cache[instrumentId] ??= fetch(new URL(`../data/norms-${instrumentId}.json`, import.meta.url)).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
  return cache[instrumentId];
}
