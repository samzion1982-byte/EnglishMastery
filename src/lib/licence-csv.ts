export const LICENCE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvrXJ6k3ZDkOgoa9383xhJhSULy5DHuLTHKhAMIYHPjhqcIEDrg0-QVLKhwZvrA4PFTUIawHMmjMSE/pub?gid=1318597772&single=true&output=csv';

export function parseLicenceCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let value = ''; let quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(value); if (row.some(cell => cell.trim())) rows.push(row); row = []; value = '';
    } else value += char;
  }
  if (quoted) throw new Error('The licence CSV is malformed.');
  row.push(value); if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}

export function licenceExpiry(value: string): string {
  const match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(value.trim());
  if (!match) throw new Error('The licence validity date must use DD-MM-YYYY.');
  const [, day, month, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('The licence validity date is invalid.');
  return date.toISOString().slice(0, 10);
}

export function checkCsvLicence(text: string, key: string, email: string, today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())) {
  const normal = (value: string | undefined) => (value || '').trim().toLowerCase();
  const rows = parseLicenceCsv(text); const headers = rows.shift()?.map(normal) || [];
  const required = ['auth code', 'email', 'validity upto', 'validation status'];
  for (const header of required) if (headers.filter(h => h === header).length !== 1) throw new Error(`The licence sheet needs one ${header} column.`);
  if (!normal(key) || !normal(email)) throw new Error('A licence key and assigned email are required.');
  const keyIndex = headers.indexOf('auth code');
  const matches = rows.filter(row => normal(row[keyIndex]) === normal(key));
  if (matches.length !== 1 || normal(matches[0][headers.indexOf('email')]) !== normal(email)) throw new Error('This licence key is not assigned to your email.');
  const row = matches[0];
  if (normal(row[headers.indexOf('validation status')]) !== 'active') throw new Error('Your licence is not Active in the licence sheet.');
  const validUntil = licenceExpiry(row[headers.indexOf('validity upto')] || '');
  if (validUntil < today) throw new Error('Your licence has expired.');
  return { key: row[keyIndex].trim().toUpperCase(), validUntil };
}

export async function readCsvLicence(key: string, email: string) {
  const response = await fetch(LICENCE_CSV_URL, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('The licence sheet could not be checked. Please try again.');
  const text = await response.text();
  if (text.length > 5_000_000) throw new Error('The licence sheet is too large.');
  return checkCsvLicence(text, key, email);
}
