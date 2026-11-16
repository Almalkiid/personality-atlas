import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const light = css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: dark)'));
const token = name => light.match(new RegExp(`--pa-${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
const lum = hex => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('small grey text meets WCAG AA (4.5:1) on page and card backgrounds', () => {
  assert.ok(ratio(token('text-3'), token('bg')) >= 4.5, `text-3 on bg ${ratio(token('text-3'), token('bg')).toFixed(2)}`);
  assert.ok(ratio(token('text-3'), token('surface')) >= 4.5);
});

test('High chip text meets WCAG AA on its tint', () => {
  const chipText = css.match(/\.chip-high \{[^}]*color:\s*var\(--pa-([a-z-]+)\)/)[1];
  assert.ok(ratio(token(chipText), token('amber-soft')) >= 4.5, `${chipText} ${ratio(token(chipText), token('amber-soft')).toFixed(2)}`);
});

test('small grey text meets WCAG AA in dark mode', () => {
  const dark = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'), css.indexOf('/* ---------- Base'));
  const d = name => dark.match(new RegExp(`--pa-${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
  for (const bg of ['bg', 'surface', 'surface-2']) assert.ok(ratio(d('text-3'), d(bg)) >= 4.5, `dark text-3 on ${bg} ${ratio(d('text-3'), d(bg)).toFixed(2)}`);
});
