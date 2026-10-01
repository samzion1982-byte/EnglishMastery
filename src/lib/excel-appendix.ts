import type ExcelJS from 'exceljs';
import { downloadBlob } from './excel-vocab';
import { treeOf, type AppendixCategory, type AppendixNode, type AppendixWordDraft } from './appendix';

const HEADERS = ['Category', 'Sub-category', 'Sub-category 2', 'Sub-category 3', 'On'] as const;
const TEAL = 'FF1A8F7C';
const INK = 'FF16362F';
const CREAM = 'FFF6F0DC';
const LINE = 'FFD7E3DE';

export type AppendixImportRow = { names: string[]; enabled: boolean };

function cellText(value: ExcelJS.CellValue | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') return value.text;
  if (typeof value === 'object' && 'result' in value && value.result != null) return String(value.result);
  return '';
}

function cleanName(raw: string) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 80);
}

function asEnabled(raw: string) {
  const v = raw.trim().toLowerCase();
  if (!v || v === 'yes' || v === 'on' || v === 'true' || v === '1') return true;
  if (v === 'no' || v === 'off' || v === 'false' || v === '0') return false;
  return true;
}

function paintHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
  row.alignment = { vertical: 'middle' };
  row.height = 22;
}

function styleSheet(sheet: ExcelJS.Worksheet, cols: number[], lastRow: number) {
  sheet.columns = cols.map((width) => ({ width }));
  sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];
  sheet.autoFilter = { from: 'A1', to: `E${Math.max(2, lastRow)}` };
  for (let i = 2; i <= Math.max(2, lastRow); i += 1) {
    const row = sheet.getRow(i);
    row.alignment = { vertical: 'middle' };
    row.height = 20;
    if (i % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col <= 5) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } };
      });
    }
  }
}

function flatten(nodes: AppendixNode[], path: string[] = [], out: AppendixImportRow[] = []) {
  for (const node of nodes) {
    const next = [...path, node.name];
    out.push({ names: next, enabled: node.enabled });
    flatten(node.children, next, out);
  }
  return out;
}

function fillCategories(sheet: ExcelJS.Worksheet, rows: AppendixImportRow[]) {
  sheet.addRow([...HEADERS]);
  paintHeader(sheet.getRow(1));
  for (const item of rows) {
    const cells = ['', '', '', '', item.enabled ? 'Yes' : 'No'];
    item.names.forEach((name, i) => {
      if (i < 4) cells[i] = name;
    });
    const row = sheet.addRow(cells);
    if (item.names.length === 1) row.getCell(1).font = { bold: true, name: 'Calibri', size: 11 };
  }
  styleSheet(sheet, [28, 28, 28, 28, 10], rows.length + 1);
}

function fillInstructions(sheet: ExcelJS.Worksheet) {
  sheet.columns = [{ width: 22 }, { width: 28 }, { width: 22 }, { width: 18 }, { width: 10 }];
  sheet.getCell('A1').value = 'English Mastery — Appendix categories';
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: INK }, name: 'Calibri' };
  sheet.mergeCells('A1:E1');
  sheet.getRow(1).height = 24;

  const lines = [
    '',
    'Use the Categories sheet. Each row is one item in the tree.',
    'Leave deeper columns blank if that row stops at a higher level.',
    '',
    'Column',
    'A  Category — top-level group. Required on every row.',
    'B  Sub-category — child of A.',
    'C  Sub-category 2 — child of B.',
    'D  Sub-category 3 — child of C.',
    'E  On — Yes or No. Applies to the last name written on that row.',
    '',
    'Import adds missing names. Names that already exist are not duplicated.',
    'Turn a row Off if that group should stay hidden from students later.',
    '',
    'Example',
  ];
  lines.forEach((text, i) => {
    const cell = sheet.getCell(`A${i + 2}`);
    cell.value = text;
    cell.font = { name: 'Calibri', size: text === 'Column' || text === 'Example' ? 12 : 11, bold: text === 'Column' || text === 'Example', color: { argb: INK } };
  });

  const sample = sheet.addRow(['Category', 'Sub-category', 'Sub-category 2', 'Sub-category 3', 'On']);
  paintHeader(sample);
  const examples = [
    ['Furniture & Fittings', '', '', '', 'Yes'],
    ['Furniture & Fittings', 'Chairs', '', '', 'Yes'],
    ['Furniture & Fittings', 'Chairs', 'Wooden', '', 'Yes'],
    ['Furniture & Fittings', 'Chairs', 'Plastic', '', 'Yes'],
    ['Electrical & Electronics', '', '', '', 'Yes'],
  ];
  const exampleRows = examples.map((line) => {
    const row = sheet.addRow(line);
    row.alignment = { vertical: 'middle' };
    row.getCell(1).font = { bold: !line[1], name: 'Calibri' };
    return row;
  });
  for (const row of [sample, ...exampleRows]) {
    for (const col of [1, 2, 3, 4, 5]) {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: LINE } },
        bottom: { style: 'thin', color: { argb: LINE } },
        left: { style: 'thin', color: { argb: LINE } },
        right: { style: 'thin', color: { argb: LINE } },
      };
    }
  }
  sheet.views = [{ showGridLines: false }];
}

async function workbookOf(rows: AppendixImportRow[]) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'English Mastery';
  workbook.created = new Date();
  fillInstructions(workbook.addWorksheet('Instructions'));
  fillCategories(workbook.addWorksheet('Categories'), rows);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export async function buildAppendixWorkbook(rows: AppendixCategory[]) {
  return workbookOf(flatten(treeOf(rows)));
}

export async function buildAppendixTemplate() {
  return workbookOf([]);
}

export function saveAppendixWorkbook(blob: Blob, filename: string) {
  downloadBlob(blob, filename);
}

function labelsOf(row: ExcelJS.Row) {
  return [1, 2, 3, 4, 5, 6].map((i) => cleanName(cellText(row.getCell(i).value)).toLowerCase());
}

function isCategoryTemplate(labels: string[]) {
  const hasCategory = labels.includes('category');
  const hasWord = labels.includes('word') || labels.includes('words');
  return hasCategory && !hasWord && (labels.includes('on') || labels.includes('sub-category 2') || labels.includes('sub-category 3'));
}

function columnOf(labels: string[], names: string[]) {
  const at = labels.findIndex((label) => names.includes(label));
  return at >= 0 ? at + 1 : 0;
}

/**
 * Words workbook. Either one sheet per category (column A sub-category, column B word),
 * or a flat sheet with Category, Sub-category, and Word columns.
 */
/** The submission workbook: one sheet per topic, sub-category in column A, the word in column B. */
export async function isAppendixWordWorkbook(buffer: ArrayBuffer) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheets = workbook.worksheets.filter((sheet) => {
    const name = sheet.name.toLowerCase();
    return name !== 'instructions' && name !== 'categories';
  });
  if (sheets.length < 2) return false;
  const labels = labelsOf(sheets[0].getRow(1));
  if (!labels[0] || labels[0] === 'category' || isCategoryTemplate(labels)) return false;
  const row = sheets[0].getRow(1);
  const subcategory = cleanName(cellText(row.getCell(1).value));
  const word = cleanName(cellText(row.getCell(2).value));
  const deeper = cleanName(cellText(row.getCell(3).value));
  return Boolean(subcategory && word && !deeper);
}

export async function parseAppendixWordsWorkbook(buffer: ArrayBuffer): Promise<AppendixWordDraft[]> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheets = workbook.worksheets.filter((sheet) => sheet.name.toLowerCase() !== 'instructions');
  if (!sheets.length) return [];

  const firstLabels = labelsOf(sheets[0].getRow(1));
  if (isCategoryTemplate(firstLabels)) {
    throw new Error('This is the category template. Import it on the Categories tab. A words file has the word itself in each row.');
  }

  const wordCol = columnOf(firstLabels, ['word', 'words', 'phrase', 'term']);
  const categoryCol = columnOf(firstLabels, ['category']);
  const flat = wordCol > 0 && categoryCol > 0;
  const subCols = flat
    ? ['sub-category', 'subcategory', 'sub-category 2', 'subcategory 2', 'sub-category 3', 'subcategory 3']
        .map((name) => columnOf(firstLabels, [name]))
        .filter((col, index, all) => col > 0 && all.indexOf(col) === index)
    : [];

  const out: AppendixWordDraft[] = [];
  const seen = new Set<string>();

  function push(names: string[], word: string) {
    const path = names.map((name) => cleanName(name)).filter(Boolean);
    const display = cleanName(word).slice(0, 160);
    if (!path.length || !display) return;
    if (display.toLowerCase() === 'word' || display.toLowerCase() === 'words') return;
    const key = `${path.join('\0')}::${display}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ names: path, word: display });
  }

  for (const sheet of sheets) {
    const category = cleanName(sheet.name);
    sheet.eachRow((row, rowNumber) => {
      if (flat) {
        if (rowNumber === 1) return;
        const names = [cleanName(cellText(row.getCell(categoryCol).value))];
        for (const col of subCols) {
          const part = cleanName(cellText(row.getCell(col).value));
          if (part) names.push(part);
        }
        push(names, cellText(row.getCell(wordCol).value));
        return;
      }
      const sub = cleanName(cellText(row.getCell(1).value));
      const word = cleanName(cellText(row.getCell(2).value));
      if (!word) return;
      if (rowNumber === 1 && /sub-?category/.test(sub.toLowerCase()) && word.toLowerCase() === 'word') return;
      push(sub ? [category, sub] : [category], word);
    });
  }
  return out;
}

export async function parseAppendixWorkbook(buffer: ArrayBuffer): Promise<AppendixImportRow[]> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet('Categories') ?? workbook.worksheets.find((s) => s.name.toLowerCase() !== 'instructions') ?? workbook.worksheets[0];
  if (!sheet) return [];

  const out: AppendixImportRow[] = [];
  const seen = new Set<string>();
  sheet.eachRow((row, rowNumber) => {
    const names = [1, 2, 3, 4].map((i) => cleanName(cellText(row.getCell(i).value))).filter(Boolean);
    if (!names.length) return;
    if (rowNumber === 1 && names[0].toLowerCase() === 'category') return;
    const key = names.join('\0').toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ names, enabled: asEnabled(cellText(row.getCell(5).value)) });
  });
  return out;
}
