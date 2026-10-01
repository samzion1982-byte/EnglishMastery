import { writeFileSync } from 'fs';
import { classifyLemma } from '../src/lib/classify.ts';

const cases: { word: string; expect: 'beginner' | 'intermediate' | 'advanced' }[] = [
  { word: 'Abate', expect: 'advanced' },
  { word: 'Abscond', expect: 'advanced' },
  { word: 'Acumen', expect: 'advanced' },
  { word: 'Arcane', expect: 'advanced' },
  { word: 'Austere', expect: 'advanced' },
  { word: 'Bombastic', expect: 'advanced' },
  { word: 'Abrogate', expect: 'advanced' },
  { word: 'Emaciated', expect: 'advanced' },
  { word: 'Ephemeral', expect: 'advanced' },
  { word: 'Lucid', expect: 'advanced' },
  { word: 'Imply', expect: 'intermediate' },
  { word: 'Allocate', expect: 'intermediate' },
  { word: 'Assert', expect: 'intermediate' },
  { word: 'Denote', expect: 'intermediate' },
  { word: 'Delicious', expect: 'beginner' },
  { word: 'Communicate', expect: 'intermediate' },
  { word: 'Construct', expect: 'intermediate' },
  { word: 'Compensation', expect: 'intermediate' },
  { word: 'Comprehensive', expect: 'intermediate' },
  { word: 'Considerable', expect: 'intermediate' },
  { word: 'Consequently', expect: 'intermediate' },
  { word: 'Differentiate', expect: 'intermediate' },
  { word: 'Technology', expect: 'intermediate' },
  { word: 'Comfortable', expect: 'beginner' },
  { word: 'Unreliable', expect: 'beginner' },
  { word: 'Magnificent', expect: 'intermediate' },
  { word: 'Happy', expect: 'beginner' },
  { word: 'Collaborate', expect: 'intermediate' },
  { word: 'Significant', expect: 'intermediate' },
  { word: 'Professional', expect: 'intermediate' },
  { word: 'Investigate', expect: 'intermediate' },
  { word: 'Docile', expect: 'advanced' },
  { word: 'Hiatus', expect: 'advanced' },
  { word: 'Nascent', expect: 'advanced' },
  { word: 'Profound', expect: 'advanced' },
  { word: 'Big', expect: 'beginner' },
  { word: 'Free', expect: 'beginner' },
];

async function main() {
  const lines: string[] = [];
  let fail = 0;
  for (const c of cases) {
    const r = classifyLemma(c.word);
    const ok = r.bucket === c.expect;
    if (!ok) fail += 1;
    lines.push(`${ok ? 'OK' : 'FAIL'}  ${c.word.padEnd(16)} got=${r.bucket.padEnd(12)} want=${c.expect.padEnd(12)} ${r.reason}`);
  }
  lines.push('');
  lines.push(`Failed: ${fail}/${cases.length}`);

  // Full workbook if present
  try {
    const ExcelJS = (await import('exceljs')).default;
    const path = 'c:/Users/Sam/Downloads/english-mastery-core-vocab.xlsx';
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path);
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    const sheetTo: Record<string, string> = {
      Beginner: 'beginner',
      Intermediate: 'intermediate',
      Advanced: 'advanced',
    };
    let moved = 0;
    const moveSamples: string[] = [];
    for (const sheet of wb.worksheets) {
      if (sheet.name === 'Archive') continue;
      sheet.eachRow((row, n) => {
        if (n === 1) return;
        const v = row.getCell(1).value;
        let word = '';
        if (typeof v === 'string' || typeof v === 'number') word = String(v).trim();
        else if (v && typeof v === 'object' && 'text' in (v as object))
          word = String((v as { text: string }).text).trim();
        if (!word || word.toLowerCase() === 'word') return;
        const r = classifyLemma(word);
        counts[r.bucket]++;
        const old = sheetTo[sheet.name];
        if (old && old !== r.bucket) {
          moved += 1;
          if (moveSamples.length < 40) moveSamples.push(`${sheet.name}->${r.bucket}: ${word}`);
        }
      });
    }
    lines.push('');
    lines.push(`Workbook re-sort: ${JSON.stringify(counts)} moves=${moved}`);
    lines.push(...moveSamples);
  } catch (e) {
    lines.push(`Workbook skip: ${e}`);
  }

  writeFileSync('sorter-verify.txt', lines.join('\n'), 'utf8');
  console.error(lines.join('\n'));
  if (fail) process.exit(1);
}

main();
