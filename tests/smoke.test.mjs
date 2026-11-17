import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package version is 0.3.1', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.version, '0.3.1');
});

test('index.html loads the app as a module and the stylesheet', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<script type="module" src="js\/app\.js">/);
  assert.match(html, /href="css\/styles\.css"/);
});
