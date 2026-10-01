import type ExcelJS from 'exceljs';
import { classLabel, classRank } from './school-tracker';

export type ClassRef = { standard: string; section: string | null };

export type ReportStudent = {
  admission: string;
  name: string;
  standard: string;
  section: string;
  learned: number;
  reviews: number;
  correct: number;
  xp: number;
  last_seen: string | null;
};

export type SchoolReport = {
  school: string;
  code: string | null;
  address?: string | null;
  mode: 'standard' | 'class';
  from?: string | null;
  to?: string | null;
  needs_assignment: boolean;
  coverage: ClassRef[];
  students: ReportStudent[];
};

const TAB: Record<string, string> = {
  I: 'FF5B9BD5',
  II: 'FF0070C0',
  III: 'FF00B0F0',
  IV: 'FF7030A0',
  V: 'FF203864',
  VI: 'FF002060',
  VII: 'FF184315',
  VIII: 'FFC00000',
  IX: 'FFED7D31',
  X: 'FFBF8F00',
  XI: 'FF00B050',
  XII: 'FF833C0C',
};

const NAVY = 'FF1E3A5F';
const BAND = 'FF2C4C74';
const GOLD = 'FFE4C56A';
const PAPER = 'FFF8F5EE';
const MIST = 'FFEEF3FA';
const WHITE = 'FFFFFFFF';
const INK = 'FF111827';
const MUTED = 'FF4B5563';
const ALT = 'FFEEF3FA';
const TOTAL = 'FFF0F4FB';
const INNER = 'FFC5CEE0';
const HEADERS = ['Admission', 'Student', 'Words learned', 'Reviews', 'Correct', 'Accuracy', 'XP', 'Last active'] as const;
const innerThin: ExcelJS.Border = { style: 'thin', color: { argb: INNER } };
const outerMed: ExcelJS.Border = { style: 'medium', color: { argb: NAVY } };

type SheetPlan = { name: string; standard: string; title: string; color: string; students: ReportStudent[] };

function percent(correct: number, reviews: number) {
  if (!reviews) return '';
  return `${Math.round((correct / reviews) * 100)}%`;
}

function indiaStamp(when = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(when);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return { date: `${part('day')}-${part('month')}-${part('year')}`, time: `${part('hour')}:${part('minute')}` };
}

function reportStamp(when = new Date()) {
  const { date, time } = indiaStamp(when);
  return `Report date: ${date}, ${time}`;
}

function properCase(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^|[^a-z'])([a-z])/g, (_match, lead: string, letter: string) => `${lead}${letter.toUpperCase()}`);
}

function periodLabel(from?: string | null, to?: string | null) {
  const fmt = (value?: string | null) => {
    if (!value) return '';
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return value.slice(0, 10);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const start = fmt(from);
  const end = fmt(to);
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function sheetPlans(report: SchoolReport): SheetPlan[] {
  return [...report.coverage]
    .filter((item) => item.section)
    .sort((a, b) => classRank(a.standard, a.section || 'A') - classRank(b.standard, b.section || 'A'))
    .map((item) => {
      const name = classLabel(item.standard, item.section || 'A');
      return {
        name,
        standard: item.standard,
        title: `Class ${name}`,
        color: TAB[item.standard] || 'FF1A8F7C',
        students: report.students
          .filter((pupil) => pupil.standard === item.standard && pupil.section === item.section)
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    });
}

function frame(isTop: boolean, isBottom: boolean, isLeft: boolean, isRight: boolean): Partial<ExcelJS.Borders> {
  return {
    top: isTop ? outerMed : innerThin,
    bottom: isBottom ? outerMed : innerThin,
    left: isLeft ? outerMed : innerThin,
    right: isRight ? outerMed : innerThin,
  };
}

type Banner = {
  school: string;
  address: string;
  title: string;
  bits: string[];
  stamp: string;
};

function paintBannerRow(
  sheet: ExcelJS.Worksheet,
  rowNo: number,
  cols: number,
  height: number,
  fill: string,
  value: ExcelJS.CellRichTextValue,
  goldBottom = false,
) {
  sheet.mergeCells(rowNo, 1, rowNo, cols);
  const row = sheet.getRow(rowNo);
  row.height = height;
  const border: Partial<ExcelJS.Borders> = goldBottom
    ? { bottom: { style: 'thin', color: { argb: GOLD } } }
    : {};
  for (let col = 1; col <= cols; col += 1) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }
  row.getCell(1).value = value;
}

function joinedBits(bits: string[]): ExcelJS.CellRichTextValue {
  const richText: ExcelJS.RichText[] = [];
  bits.filter(Boolean).forEach((bit, index) => {
    if (index) richText.push({ text: '   ·   ', font: { name: 'Calibri', size: 11, color: { argb: GOLD } } });
    richText.push({ text: bit, font: { name: 'Calibri', size: 11, color: { argb: NAVY } } });
  });
  if (!richText.length) richText.push({ text: '', font: { name: 'Calibri', size: 11, color: { argb: NAVY } } });
  return { richText };
}

function stampLine(stamp: string): ExcelJS.CellRichTextValue {
  const mark = stamp.indexOf(': ');
  if (mark < 0) {
    return { richText: [{ text: stamp, font: { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } } }] };
  }
  return {
    richText: [
      { text: `${stamp.slice(0, mark)}   `, font: { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } } },
      { text: stamp.slice(mark + 2), font: { name: 'Calibri', size: 11, bold: true, color: { argb: NAVY } } },
    ],
  };
}

function writeBanner(sheet: ExcelJS.Worksheet, cols: number, banner: Banner) {
  const address = banner.address.trim();
  let row = 1;
  paintBannerRow(sheet, row, cols, 36, NAVY, {
    richText: [{ text: banner.school || 'Learning report', font: { name: 'Calibri', bold: true, size: 20, color: { argb: WHITE } } }],
  });
  row += 1;
  if (address) {
    paintBannerRow(sheet, row, cols, 20, BAND, {
      richText: [{ text: address, font: { name: 'Calibri', size: 12, color: { argb: WHITE } } }],
    });
    row += 1;
  }
  paintBannerRow(sheet, row, cols, 18, BAND, {
    richText: [{ text: 'ENGLISH MASTERY', font: { name: 'Calibri', bold: true, size: 10, color: { argb: GOLD } } }],
  }, true);
  row += 1;
  paintBannerRow(sheet, row, cols, 28, PAPER, {
    richText: [{ text: banner.title, font: { name: 'Calibri', bold: true, size: 16, color: { argb: NAVY } } }],
  }, true);
  row += 1;
  paintBannerRow(sheet, row, cols, 20, MIST, joinedBits(banner.bits));
  row += 1;
  paintBannerRow(sheet, row, cols, 18, WHITE, stampLine(banner.stamp));
  return row;
}

function writeHeader(sheet: ExcelJS.Worksheet, rowNo: number, labels: readonly string[]) {
  const row = sheet.getRow(rowNo);
  row.height = 24;
  labels.forEach((label, index) => {
    const cell = row.getCell(index + 1);
    cell.value = label;
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = frame(true, false, index === 0, index === labels.length - 1);
  });
}

function writeBody(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  cols: number,
  rows: { values: (string | number | ExcelJS.CellHyperlinkValue)[]; linkCol?: number; align: ExcelJS.Alignment['horizontal'][] }[],
  empty: string,
) {
  if (!rows.length) {
    sheet.mergeCells(startRow, 1, startRow, cols);
    const cell = sheet.getCell(startRow, 1);
    cell.value = empty;
    cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    const border = frame(false, true, true, true);
    cell.border = border;
    sheet.getCell(startRow, cols).border = border;
    sheet.getRow(startRow).height = 20;
    return startRow;
  }
  rows.forEach((item, index) => {
    const row = sheet.getRow(startRow + index);
    const last = index === rows.length - 1;
    row.height = 18;
    item.values.forEach((value, col) => {
      const cell = row.getCell(col + 1);
      cell.value = value;
      const linked = item.linkCol === col;
      cell.font = linked
        ? { name: 'Calibri', size: 10, underline: true, color: { theme: 10 } }
        : { name: 'Calibri', size: 10, color: { argb: INK } };
      cell.alignment = { vertical: 'middle', horizontal: item.align[col] || 'center' };
      cell.border = frame(false, last, col === 0, col === cols - 1);
      if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT } };
    });
  });
  return startRow + rows.length - 1;
}

function addDataSheet(workbook: ExcelJS.Workbook, plan: SheetPlan, report: SchoolReport, stamp: string) {
  const cols = HEADERS.length;
  const period = periodLabel(report.from, report.to);
  const count = `${plan.students.length} student${plan.students.length === 1 ? '' : 's'}`;
  const sheet = workbook.addWorksheet(plan.name, {
    properties: { tabColor: { argb: plan.color } },
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  sheet.columns = [16, 32, 16, 16, 14, 14, 12, 16].map((width) => ({ width }));
  const bannerEnd = writeBanner(sheet, cols, {
    school: report.school,
    address: report.address || '',
    title: plan.title,
    bits: [period, count],
    stamp,
  });
  const headerRow = bannerEnd + 1;
  sheet.views = [{ state: 'frozen', ySplit: headerRow, showGridLines: false }];
  sheet.pageSetup.printTitlesRow = `1:${headerRow}`;
  sheet.headerFooter.oddFooter = `&LEnglish Mastery&C${plan.title}&R${stamp}`;
  writeHeader(sheet, headerRow, HEADERS);
  const learned = plan.students.reduce((sum, pupil) => sum + pupil.learned, 0);
  const reviews = plan.students.reduce((sum, pupil) => sum + pupil.reviews, 0);
  const correct = plan.students.reduce((sum, pupil) => sum + pupil.correct, 0);
  const xp = plan.students.reduce((sum, pupil) => sum + pupil.xp, 0);
  const last = writeBody(
    sheet,
    headerRow + 1,
    cols,
    plan.students.map((pupil) => ({
      values: [pupil.admission, pupil.name, pupil.learned, pupil.reviews, pupil.correct, percent(pupil.correct, pupil.reviews), pupil.xp, pupil.last_seen || ''],
      align: ['center', 'left', 'center', 'center', 'center', 'center', 'center', 'center'],
    })),
    'No students in this class.',
  );
  if (plan.students.length) {
    const totalRow = sheet.getRow(last + 1);
    totalRow.height = 20;
    const totals: (string | number)[] = ['', 'Total', learned, reviews, correct, percent(correct, reviews), xp, ''];
    totals.forEach((value, col) => {
      const cell = totalRow.getCell(col + 1);
      cell.value = value;
      cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: INK } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL } };
      cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' };
      cell.border = frame(true, true, col === 0, col === cols - 1);
    });
  }
  if (plan.students.length) sheet.autoFilter = { from: `A${headerRow}`, to: `H${last}` };
}

export async function buildSchoolReport(report: SchoolReport) {
  const plans = sheetPlans(report);
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'English Mastery';
  workbook.created = new Date();
  const stamp = reportStamp();
  const period = periodLabel(report.from, report.to);
  const pupils = plans.reduce((sum, plan) => sum + plan.students.length, 0);
  const index = workbook.addWorksheet('Index', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  const indexCols = 6;
  index.columns = [16, 18, 14, 18, 14, 14].map((width) => ({ width }));
  const bannerEnd = writeBanner(index, indexCols, {
    school: report.school,
    address: report.address || '',
    title: 'Learning report',
    bits: [period, `${plans.length} class${plans.length === 1 ? '' : 'es'}`, `${pupils} student${pupils === 1 ? '' : 's'}`],
    stamp,
  });
  const headerRow = bannerEnd + 1;
  index.views = [{ state: 'frozen', ySplit: headerRow, showGridLines: false }];
  index.headerFooter.oddFooter = `&LEnglish Mastery&CLearning report&R${stamp}`;
  const labels = ['Standard', 'Class', 'Students', 'Words learned', 'Reviews', 'Accuracy'] as const;
  writeHeader(index, headerRow, labels);
  const learnedAll = plans.reduce((sum, plan) => sum + plan.students.reduce((inner, pupil) => inner + pupil.learned, 0), 0);
  const reviewsAll = plans.reduce((sum, plan) => sum + plan.students.reduce((inner, pupil) => inner + pupil.reviews, 0), 0);
  const correctAll = plans.reduce((sum, plan) => sum + plan.students.reduce((inner, pupil) => inner + pupil.correct, 0), 0);
  const last = writeBody(
    index,
    headerRow + 1,
    indexCols,
    plans.map((plan) => {
      const learned = plan.students.reduce((sum, pupil) => sum + pupil.learned, 0);
      const reviews = plan.students.reduce((sum, pupil) => sum + pupil.reviews, 0);
      const correct = plan.students.reduce((sum, pupil) => sum + pupil.correct, 0);
      return {
        values: [
          plan.standard,
          { text: plan.name, hyperlink: `#'${plan.name}'!A1` },
          plan.students.length,
          learned,
          reviews,
          percent(correct, reviews),
        ],
        linkCol: 1,
        align: ['center', 'center', 'center', 'center', 'center', 'center'],
      };
    }),
    'No classes are included in this report.',
  );
  if (plans.length) {
    const totalRow = index.getRow(last + 1);
    totalRow.height = 20;
    ['', 'Total', pupils, learnedAll, reviewsAll, percent(correctAll, reviewsAll)].forEach((value, col) => {
      const cell = totalRow.getCell(col + 1);
      cell.value = value;
      cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: INK } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = frame(true, true, col === 0, col === indexCols - 1);
    });
    let row = headerRow + 1;
    while (row <= last) {
      const standard = String(index.getCell(row, 1).value ?? '');
      let end = row;
      while (end + 1 <= last && String(index.getCell(end + 1, 1).value ?? '') === standard) end += 1;
      const cell = index.getCell(row, 1);
      cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: NAVY } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (end > row) {
        index.mergeCells(row, 1, end, 1);
        cell.border = frame(false, end === last, true, false);
      }
      row = end + 1;
    }
  }
  plans.forEach((plan) => addDataSheet(workbook, plan, report, stamp));
  const buffer = await workbook.xlsx.writeBuffer();
  const marked = await visitedClassLinks(buffer);
  return new Blob([new Uint8Array(marked)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const LINK_FONT = '<font><u/><sz val="10"/><color theme="10"/><name val="Calibri"/><family val="2"/></font>';
const VISITED_FONT = '<font><b/><u/><sz val="10"/><color rgb="FF800080"/><name val="Calibri"/><family val="2"/></font>';

function spliceFonts(styles: string) {
  const count = Number(styles.match(/<fonts\b[^>]*\bcount="(\d+)"/)?.[1] || 0);
  if (!count) return { styles, linkFont: 0, visitedFont: 0 };
  const linkFont = count;
  const visitedFont = count + 1;
  return {
    linkFont,
    visitedFont,
    styles: styles
      .replace(/(<fonts\b[^>]*\bcount=")(\d+)(")/, `$1${count + 2}$3`)
      .replace('</fonts>', `${LINK_FONT}${VISITED_FONT}</fonts>`),
  };
}

function spliceLinkStyles(styles: string, linkFont: number, visitedFont: number) {
  const styleXfs = `<cellStyleXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="${linkFont}" fillId="0" borderId="0" applyFont="1"/><xf numFmtId="0" fontId="${visitedFont}" fillId="0" borderId="0" applyFont="1"/></cellStyleXfs>`;
  const named = '<cellStyles count="3"><cellStyle name="Normal" xfId="0" builtinId="0"/><cellStyle name="Hyperlink" xfId="1" builtinId="8"/><cellStyle name="Followed Hyperlink" xfId="2" builtinId="9"/></cellStyles>';
  return styles
    .replace(/<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"\/><\/cellStyleXfs>/, styleXfs)
    .replace(/<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"\/><\/cellStyles>/, named);
}

function useHyperlinkStyle(styles: string, styleIds: Set<number>) {
  return styles.replace(/<cellXfs count="(\d+)">([\s\S]*?)<\/cellXfs>/, (full: string, count: string, inner: string) => {
    const xfs = inner.match(/<xf\b[^>]*\/>|<xf\b[^>]*>[\s\S]*?<\/xf>/g) || [];
    const next = xfs.map((xf, index) => {
      if (!styleIds.has(index)) return xf;
      const open = xf.replace(/\sxfId="\d+"/, '').replace(/\sapplyFont="1"/, ' applyFont="0"');
      return open.replace(/<xf\b/, '<xf xfId="1"');
    }).join('');
    return `<cellXfs count="${count}">${next}</cellXfs>`;
  });
}

async function visitedClassLinks(buffer: ArrayBuffer | ExcelJS.Buffer) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const sheetFile = zip.file('xl/worksheets/sheet1.xml');
  const stylesFile = zip.file('xl/styles.xml');
  if (!sheetFile || !stylesFile) return buffer;
  const sheet = await sheetFile.async('string');
  const refs = new Set([...sheet.matchAll(/<hyperlink\b[^>]*\bref="([A-Z]+\d+)"/g)].map((match) => match[1]));
  if (!refs.size) return buffer;
  const styleIds = new Set<number>();
  for (const match of sheet.matchAll(/<c\b([^>]*)>/g)) {
    const ref = match[1].match(/\br="([^"]+)"/)?.[1];
    const styleId = match[1].match(/\bs="(\d+)"/)?.[1];
    if (ref && styleId && refs.has(ref)) styleIds.add(Number(styleId));
  }
  if (!styleIds.size) return buffer;
  const fonts = spliceFonts(await stylesFile.async('string'));
  const styled = useHyperlinkStyle(spliceLinkStyles(fonts.styles, fonts.linkFont, fonts.visitedFont), styleIds);
  zip.file('xl/styles.xml', styled);
  return zip.generateAsync({ type: 'uint8array' });
}

export function reportFileName(school: string, when = new Date()) {
  const { date, time } = indiaStamp(when);
  const title = properCase(school).slice(0, 80) || 'School';
  return `Report - ${title}_${date}, ${time.replace(':', '-')}.xlsx`;
}

export async function saveReportToDesktop(name: string, blob: Blob) {
  const body = new FormData();
  body.append('file', blob, name);
  const response = await fetch('/api/admin/reports', { method: 'POST', body });
  const data = await response.json().catch(() => ({})) as { error?: string; folder?: string };
  if (!response.ok) throw new Error(data.error || 'Could not save the report.');
  return data.folder || 'Desktop\\Reports - All Schools';
}
