/**
 * Personality Atlas — results receiver (container-bound to the "Personality Atlas — Results" sheet).
 * Pattern copied from Edison Practice Papers: public web app, executeAs USER_DEPLOYING,
 * so visitors need no Google account and only this script can write to Ed's sheet.
 * Validation and row layout live in validate.js (unit-tested in the repo).
 */
var MAX_BODY = 20000;
var SHEET_NAME = 'Results';

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sh;
}

function doGet() {
  return json_({ ok: true, service: 'personality-atlas', columns: COLUMNS.length });
}

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents || '';
    if (body.length > MAX_BODY) return json_({ ok: false, error: 'Submission too large.' });
    var p = JSON.parse(body);
    var v = validateSubmission(p, ITEM_COUNTS);
    if (!v.ok) return json_(v);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow(toRow(p, new Date()));
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'The server could not save this result.' });
  }
}
