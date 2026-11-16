// Empirical norms: percentile lookup, norm-group choice and score bands.

export const BANDS = ['10-13', '14-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

export function ageBand(age) {
  if (age < 10) return 'under10';
  if (age <= 13) return '10-13';
  if (age <= 17) return '14-17';
  if (age <= 24) return '18-24';
  if (age >= 65) return '65+';
  const lo = Math.floor((age - 5) / 10) * 10 + 5; // 25-34, 35-44, 45-54, 55-64
  return `${lo}-${lo + 9}`;
}

// Mid-rank percentile: (people below + half the people with the same score) / N.
export function percentile(scale, raw) {
  const { min, counts } = scale;
  const n = counts.reduce((a, b) => a + b, 0);
  const idx = raw - min;
  if (idx < 0) return 1;
  if (idx >= counts.length) return 99;
  let below = 0;
  for (let i = 0; i < idx; i++) below += counts[i];
  const p = Math.round(((below + counts[idx] / 2) / n) * 100);
  return Math.min(99, Math.max(1, p));
}

export function band(p) {
  if (p < 30) return 'low';
  if (p > 70) return 'high';
  return 'average';
}

// Fallback order: band×sex → band → (10-13 only: 14-17×sex → 14-17) → all×sex → all.
export function pickGroup(norms, { band: b, sex } = {}) {
  const min = norms.meta.minCell;
  const s = sex === 'm' || sex === 'f' ? sex : null;
  const order = [];
  if (b) {
    if (s) order.push(`${b}|${s}`);
    order.push(`${b}|any`);
    if (b === '10-13') { if (s) order.push(`14-17|${s}`); order.push('14-17|any'); }
  }
  if (s) order.push(`all|${s}`);
  order.push('all|any');
  const wanted = order[0];
  for (const key of order) {
    const g = norms.groups[key];
    if (g && (g.n >= min || key === 'all|any')) return { key, n: g.n, fallback: key !== wanted };
  }
  throw new Error('Norms have no all|any group.');
}
