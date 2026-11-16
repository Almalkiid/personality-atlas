// Build empirical norm tables from the raw research datasets (never committed; see raw/).
//   IPIP-NEO-120: Johnson (2014) IPIP120.dat, OSF https://osf.io/download/q9jrh/ (codebook DAT120.doc)
//   IPIP-50:      Open-Source Psychometrics Project BIG5 dataset, https://openpsychometrics.org/_rawdata/BIG5.zip
// Run from the repo root: node scripts/build-norms.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ipipneo120 } from '../js/instruments/ipipneo120.js';
import { ipip50 } from '../js/instruments/ipip50.js';
import { ageBand, BANDS } from '../js/norms.js';

const MIN_CELL = 500;

// Fixed-width record (DAT120.doc): SEX col 7, AGE cols 8–9, I1..I120 cols 32–151.
// Values are stored ALREADY reverse-recoded, so they are summed as-is.
export function parseIpip120Line(line, inst) {
  const sexCode = line[6];
  const age = Number(line.slice(7, 9));
  const raw = line.slice(31, 151);
  if (raw.length !== 120) return { error: 'short' };
  const scores = {};
  for (let i = 0; i < 120; i++) {
    const v = raw.charCodeAt(i) - 48;
    if (v < 1 || v > 5) return { error: 'missing' };
    const it = inst.items[i];
    scores[it.domain] = (scores[it.domain] ?? 0) + v;
    const f = it.domain + it.facet;
    scores[f] = (scores[f] ?? 0) + v;
  }
  return { sex: sexCode === '1' ? 'm' : sexCode === '2' ? 'f' : null, age, scores };
}

function scaleShapes(inst) {
  const shapes = {};
  for (const it of inst.items) {
    shapes[it.domain] = (shapes[it.domain] ?? 0) + 1;
    if (it.facet) shapes[it.domain + it.facet] = (shapes[it.domain + it.facet] ?? 0) + 1;
  }
  return shapes; // scale → item count
}

function makeTables(inst, records, meta) {
  const shapes = scaleShapes(inst);
  const groups = {};
  const add = (key, scores) => {
    const g = (groups[key] ??= { n: 0, scales: Object.fromEntries(Object.entries(shapes).map(([k, c]) => [k, { min: c, counts: Array(c * 4 + 1).fill(0) }])) });
    g.n += 1;
    for (const [k, v] of Object.entries(scores)) g.scales[k].counts[v - g.scales[k].min] += 1;
  };
  for (const r of records) {
    const b = ageBand(r.age);
    add(`${b}|any`, r.scores);
    add('all|any', r.scores);
    if (r.sex) { add(`${b}|${r.sex}`, r.scores); add(`all|${r.sex}`, r.scores); }
  }
  return { meta: { ...meta, nTotal: groups['all|any'].n, bands: BANDS, minCell: MIN_CELL }, groups };
}

function buildNeo120() {
  const text = readFileSync('raw/IPIP120.dat', 'latin1');
  const records = [];
  const excluded = { missing: 0, ageOutOfRange: 0, malformed: 0 };
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const r = parseIpip120Line(line, ipipneo120);
    if (r.error === 'missing') { excluded.missing++; continue; }
    if (r.error) { excluded.malformed++; continue; }
    if (!(r.age >= 10 && r.age <= 99)) { excluded.ageOutOfRange++; continue; }
    records.push(r);
  }
  return makeTables(ipipneo120, records, {
    instrument: 'ipipneo120',
    source: "Johnson's IPIP-NEO data repository, IPIP120.dat (N = 619,150 raw)",
    url: 'https://osf.io/tbmh5/',
    citation: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. Journal of Research in Personality, 51, 78–89.',
    excluded,
  });
}

const norm = s => s.replace(/^I /, '').replace(/\.$/, '').trim().toLowerCase();

export function mapBig5Columns(header, codebook, inst) {
  // codebook lines "E1\tI am the life of the party."
  const textByCol = Object.fromEntries(codebook.split(/\r?\n/).map(l => l.split('\t')).filter(p => /^[ENACO]\d+$/.test(p[0])).map(([c, t]) => [c, norm(t)]));
  return inst.items.map(it => {
    const col = Object.keys(textByCol).find(c => textByCol[c] === norm(it.text));
    if (!col) throw new Error(`No BIG5 column for item "${it.text}"`);
    const idx = header.indexOf(col);
    if (idx < 0) throw new Error(`Column ${col} missing from data header`);
    return idx;
  });
}

function buildIpip50() {
  const rows = readFileSync('raw/BIG5-data.csv', 'utf8').split(/\r?\n/).filter(Boolean).map(l => l.split('\t'));
  const header = rows.shift();
  const cols = mapBig5Columns(header, readFileSync('raw/BIG5-codebook.txt', 'utf8'), ipip50);
  const iAge = header.indexOf('age'), iGender = header.indexOf('gender');
  const records = [];
  const excluded = { missing: 0, ageOutOfRange: 0 };
  for (const row of rows) {
    const vals = cols.map(c => Number(row[c]));
    if (vals.some(v => !(v >= 1 && v <= 5))) { excluded.missing++; continue; }
    const age = Number(row[iAge]);
    if (!(age >= 13 && age <= 99)) { excluded.ageOutOfRange++; continue; }
    const scores = {};
    ipip50.items.forEach((it, i) => { scores[it.domain] = (scores[it.domain] ?? 0) + (it.keyed === 'minus' ? 6 - vals[i] : vals[i]); });
    const g = row[iGender];
    records.push({ age, sex: g === '1' ? 'm' : g === '2' ? 'f' : null, scores });
  }
  return makeTables(ipip50, records, {
    instrument: 'ipip50',
    source: 'Open-Source Psychometrics Project, BIG5 dataset (N = 19,719 raw; collected c. 2012; ages 13+)',
    url: 'https://openpsychometrics.org/_rawdata/',
    citation: 'Open-Source Psychometrics Project (2012). Answers to the IPIP Big-Five Factor Markers [BIG5 dataset]. openpsychometrics.org/_rawdata.',
    excluded,
  });
}

function report(name, t) {
  console.log(`\n${name}: kept ${t.meta.nTotal}, excluded ${JSON.stringify(t.meta.excluded)}`);
  console.log('band      any      m      f');
  for (const b of [...BANDS, 'all']) {
    const n = s => String(t.groups[`${b}|${s}`]?.n ?? 0).padStart(7);
    console.log(b.padEnd(7), n('any'), n('m'), n('f'));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync('data', { recursive: true });
  for (const [name, build, file] of [['IPIP-NEO-120', buildNeo120, 'data/norms-ipipneo120.json'], ['IPIP-50', buildIpip50, 'data/norms-ipip50.json']]) {
    const t = build();
    writeFileSync(file, JSON.stringify(t));
    report(name, t);
  }
}
