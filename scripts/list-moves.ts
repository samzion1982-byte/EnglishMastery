import { writeFileSync } from 'fs';
import ExcelJS from 'exceljs';
import { classifyLemma } from '../src/lib/classify';

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('c:/Users/Sam/Downloads/english-mastery-core-vocab.xlsx');
  const bags: Record<string, string[]> = {
    'B->I': [],
    'B->A': [],
    'I->A': [],
    'I->B': [],
    'A->I': [],
    'A->B': [],
  };
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
      const old = sheet.name[0];
      const neu = r.bucket[0].toUpperCase();
      if (old === neu) return;
      const key = `${old}->${neu}`;
      bags[key]?.push(word);
    });
  }
  const lines: string[] = [];
  for (const [k, arr] of Object.entries(bags)) {
    lines.push(`${k} (${arr.length}): ${arr.join(', ')}`);
    lines.push('');
  }
  writeFileSync('sorter-moves.txt', lines.join('\n'), 'utf8');
  console.error('wrote sorter-moves.txt');
}

main();
