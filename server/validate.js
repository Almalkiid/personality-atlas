/* Personality Atlas — submission validation and sheet row building.
 * Plain script (no modules): pushed to Apps Script as-is and loaded by the Node tests via vm. */
var ITEM_COUNTS = { ipip50: 50, ipipneo120: 120 };
var AGE_BANDS = ['', '10-13', '14-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
var YOUTH_BANDS = ['10-13', '14-17'];
var COLUMNS = ['received_at', 'app_version', 'instrument', 'name', 'email', 'adult', 'age_band', 'sex',
  'parent_name', 'parent_email', 'consent_version', 'norm_group',
  'E_pct', 'A_pct', 'C_pct', 'N_pct', 'O_pct', 'E_raw', 'A_raw', 'C_raw', 'N_raw', 'O_raw',
  'facets_pct_json', 'answers'];
var DOMAIN_IDS = ['E', 'A', 'C', 'N', 'O'];

function isText_(v, min, max) { return typeof v === 'string' && v.trim().length >= min && v.length <= max; }
function isEmailOrEmpty_(v) { return v === '' || (isText_(v, 3, 200) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())); }
function isInt_(v, lo, hi) { return typeof v === 'number' && Math.floor(v) === v && v >= lo && v <= hi; }

function validateSubmission(p, itemCounts) {
  var fail = function (msg) { return { ok: false, error: msg }; };
  if (!p || typeof p !== 'object') return fail('Empty submission.');
  if (p.website) return fail('Rejected.');
  if (!itemCounts.hasOwnProperty(p.instrument)) return fail('Unknown test.');
  if (!isText_(p.name, 1, 100)) return fail('Please enter your name (up to 100 characters).');
  if (typeof p.email !== 'string' || !isEmailOrEmpty_(p.email)) return fail('That email address does not look right.');
  if (p.consent !== true) return fail('Consent is required.');
  if (typeof p.adult !== 'boolean') return fail('Please say whether you are 18 or over.');
  if (AGE_BANDS.indexOf(p.ageBand || '') === -1) return fail('Unknown age band.');
  if (p.adult && YOUTH_BANDS.indexOf(p.ageBand) !== -1) return fail('Age band and adult answer disagree.');
  if (!p.adult) {
    if (!isText_(p.parentName, 1, 100)) return fail("A parent or guardian's name is required for under-18s.");
    if (typeof p.parentEmail !== 'string' || !isEmailOrEmpty_(p.parentEmail)) return fail("The parent's email address does not look right.");
    if (p.parentConsent !== true) return fail('Parent or guardian consent is required for under-18s.');
  }
  if (['', 'm', 'f'].indexOf(p.sex || '') === -1) return fail('Unknown sex value.');
  var n = itemCounts[p.instrument];
  if (!Array.isArray(p.answers) || p.answers.length !== n) return fail('Answer count does not match the test.');
  for (var i = 0; i < n; i++) if (!isInt_(p.answers[i], 1, 5)) return fail('Answers must be 1–5.');
  if (!p.domains) return fail('Scores missing.');
  for (var d = 0; d < DOMAIN_IDS.length; d++) {
    var s = p.domains[DOMAIN_IDS[d]];
    if (!s || !isInt_(s.pct, 1, 99) || !isInt_(s.raw, 1, 600)) return fail('Scores are invalid.');
  }
  if (!isText_(p.consentVersion, 1, 20) || !isText_(p.normGroup, 1, 20) || !isText_(p.v, 1, 20)) return fail('Metadata missing.');
  return { ok: true };
}

// Prevent spreadsheet formula injection: text starting with = + - @ is stored as literal text.
function cell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string') return v;
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function toRow(p, now) {
  var dom = function (k, f) { return p.domains[k][f]; };
  return [
    now.toISOString(), cell_(p.v), cell_(p.instrument), cell_(p.name.trim()), cell_(p.email.trim()),
    p.adult ? 'yes' : 'no', cell_(p.ageBand || ''), cell_(p.sex || ''),
    cell_(p.adult ? '' : p.parentName.trim()), cell_(p.adult ? '' : p.parentEmail.trim()),
    cell_(p.consentVersion), cell_(p.normGroup),
    dom('E', 'pct'), dom('A', 'pct'), dom('C', 'pct'), dom('N', 'pct'), dom('O', 'pct'),
    dom('E', 'raw'), dom('A', 'raw'), dom('C', 'raw'), dom('N', 'raw'), dom('O', 'raw'),
    p.facets ? JSON.stringify(p.facets) : '', p.answers.join(''),
  ];
}
