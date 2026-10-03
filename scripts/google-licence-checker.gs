// Paste into Extensions > Apps Script for the converted licence sheet.
// Set LICENCE_API_SECRET in Project Settings > Script Properties.
var LICENCE_SHEET_ID = '1-p0J7-AnyK3blIU5AC20Sz_Nrl0ZvY9hpAtZ1QfA_tQ';
var LICENCE_TAB = 'EM_Licenses';

function licenceReply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function checkLicenceRows(rows, key, email) {
  var normal = function (value) { return String(value == null ? '' : value).trim().toLowerCase(); };
  if (!Array.isArray(rows) || rows.length < 2 || !normal(key) || !normal(email)) return { ok: false, reason: 'invalid_request' };
  var headers = rows[0].map(normal);
  var keyCol = headers.indexOf('auth code');
  var emailCol = headers.indexOf('email');
  var statusCol = headers.indexOf('validation status');
  if (keyCol < 0 || emailCol < 0 || statusCol < 0 || headers.filter(function (h) { return h === 'auth code'; }).length !== 1 || headers.filter(function (h) { return h === 'email'; }).length !== 1 || headers.filter(function (h) { return h === 'validation status'; }).length !== 1) return { ok: false, reason: 'invalid_columns' };
  var matches = rows.slice(1).filter(function (row) { return normal(row[keyCol]) === normal(key); });
  if (matches.length !== 1 || normal(matches[0][emailCol]) !== normal(email)) return { ok: false, reason: 'not_assigned' };
  if (normal(matches[0][statusCol]) !== 'active') return { ok: false, reason: 'inactive' };
  return { ok: true };
}

function doPost(event) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('LICENCE_API_SECRET');
    var input = JSON.parse(event.postData.contents);
    if (!secret || secret.length < 32 || typeof input.secret !== 'string' || input.secret !== secret) return licenceReply({ ok: false, reason: 'unauthorized' });
    var sheet = SpreadsheetApp.openById(LICENCE_SHEET_ID).getSheetByName(LICENCE_TAB);
    if (!sheet) return licenceReply({ ok: false, reason: 'missing_tab' });
    // Fresh sheet read for each authenticated request; never return keys or personal data.
    return licenceReply(checkLicenceRows(sheet.getDataRange().getDisplayValues(), input.key, input.email));
  } catch (error) {
    return licenceReply({ ok: false, reason: 'unavailable' });
  }
}
