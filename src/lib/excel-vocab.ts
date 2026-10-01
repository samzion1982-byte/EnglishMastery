import type ExcelJS from 'exceljs';
import { displayWord, lemmaOf, type Bucket, type CoreStore, bucketLabel, buckets } from './vocab';

const HEADER = 'Word';
const SHEET_TO_BUCKET: Record<string, Bucket> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  archive: 'archive',
};

function cellText(value: ExcelJS.CellValue | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') return value.text;
  if (typeof value === 'object' && 'result' in value && value.result != null) return String(value.result);
  return '';
}

function sheetBucket(name: string): Bucket | null {
  const key = name.trim().toLowerCase();
  return SHEET_TO_BUCKET[key] ?? null;
}

function wordsFromColumnA(sheet: ExcelJS.Worksheet, skipHeader: boolean) {
  const out: string[] = [];
  const seen = new Set<string>();
  sheet.eachRow((row, rowNumber) => {
    if (skipHeader && rowNumber === 1) {
      const first = displayWord(cellText(row.getCell(1).value));
      if (lemmaOf(first) === 'word' || first.toLowerCase() === HEADER.toLowerCase()) return;
    }
    const raw = displayWord(cellText(row.getCell(1).value));
    const lemma = lemmaOf(raw);
    if (!lemma || lemma === 'word' || seen.has(lemma)) return;
    seen.add(lemma);
    out.push(raw);
  });
  return out;
}

export type ExcelImportResult =
  | { mode: 'fresh'; words: string[] }
  | { mode: 'by-sheet'; groups: { bucket: Bucket; words: string[] }[] };

export async function parseVocabWorkbook(buffer: ArrayBuffer): Promise<ExcelImportResult> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const named = workbook.worksheets
    .map((sheet) => ({ sheet, bucket: sheetBucket(sheet.name) }))
    .filter((entry): entry is { sheet: ExcelJS.Worksheet; bucket: Bucket } => !!entry.bucket);

  if (named.length > 0) {
    return {
      mode: 'by-sheet',
      groups: named.map(({ sheet, bucket }) => ({
        bucket,
        words: wordsFromColumnA(sheet, true),
      })),
    };
  }

  const first = workbook.worksheets[0];
  if (!first) return { mode: 'fresh', words: [] };
  return { mode: 'fresh', words: wordsFromColumnA(first, false) };
}

export async function buildVocabWorkbook(store: CoreStore): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'English Mastery';
  workbook.created = new Date();

  for (const bucket of buckets) {
    const sheet = workbook.addWorksheet(bucketLabel[bucket], {
      views: [{ state: 'frozen', ySplit: 1 }],
    });
    sheet.columns = [{ header: HEADER, key: 'word', width: 28 }];
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A8F7C' } };
    header.alignment = { vertical: 'middle' };
    header.height = 22;

    const words = store.words
      .filter((w) => w.bucket === bucket)
      .sort((a, b) => a.word.localeCompare(b.word));
    for (const item of words) {
      const row = sheet.addRow({ word: item.word });
      row.alignment = { vertical: 'middle' };
    }
    sheet.autoFilter = { from: 'A1', to: `A${Math.max(1, words.length + 1)}` };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
