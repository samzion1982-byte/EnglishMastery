import type ExcelJS from 'exceljs';
import type { SpeechReport, SpeechStatus, SpeechUsageRow } from './speech-usage';

const TEAL = 'FF1A8F7C';
const INK = 'FF16362F';
const CREAM = 'FFF6F0DC';
const LINE = 'FFD7E3DE';
const WHITE = 'FFFFFFFF';
const MUTED = 'FF5C726A';

const STATUS: Record<SpeechStatus, string> = {
  running: 'In progress',
  ok: 'Heard',
  silent: 'Silent',
  error: 'Failed',
  capped: 'App limit',
  rate_limited: 'Groq limit',
};

const RESULT_FILL: Partial<Record<SpeechStatus, string>> = {
  rate_limited: 'FFFFF3D6',
  capped: 'FFFFE8D6',
  error: 'FFFDE8E8',
  silent: 'FFF4F1EA',
  running: 'FFE7F4F8',
};

const thin = { style: 'thin' as const, color: { argb: LINE } };

function minutes(ms: number) {
  return Math.round((ms / 60000) * 100) / 100;
}

function seconds(ms: number | null) {
  if (ms == null) return null;
  return Math.round((ms / 1000) * 10) / 10;
}

function paintHeader(row: ExcelJS.Row, cols: number) {
  row.height = 22;
  row.font = { bold: true, color: { argb: WHITE }, name: 'Calibri', size: 11 };
  row.alignment = { vertical: 'middle', wrapText: true };
  for (let col = 1; col <= cols; col += 1) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
    cell.border = { top: thin, bottom: thin, left: thin, right: thin };
  }
}

function paintBody(sheet: ExcelJS.Worksheet, headerRow: number, lastRow: number, cols: number) {
  for (let index = headerRow + 1; index <= lastRow; index += 1) {
    const row = sheet.getRow(index);
    row.height = 20;
    row.alignment = { vertical: 'middle' };
    row.font = { name: 'Calibri', size: 11, color: { argb: INK } };
    const zebra = index % 2 === 0;
    for (let col = 1; col <= cols; col += 1) {
      const cell = row.getCell(col);
      cell.border = { top: thin, bottom: thin, left: thin, right: thin };
      if (zebra) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } };
    }
  }
}

function finishTable(sheet: ExcelJS.Worksheet, headerRow: number, lastRow: number, cols: number, widths?: number[]) {
  paintHeader(sheet.getRow(headerRow), cols);
  paintBody(sheet, headerRow, Math.max(headerRow, lastRow), cols);
  sheet.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: Math.max(headerRow, lastRow), column: cols } };
  sheet.views = [{ state: 'frozen', ySplit: headerRow, showGridLines: false }];
  sheet.pageSetup = {
    orientation: cols > 8 ? 'landscape' : 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };
  sheet.headerFooter = {
    oddHeader: '&LEnglish Mastery&RSpeech recognition',
    oddFooter: '&LConfidential&RPage &P of &N',
  };
  sheet.pageSetup.printTitlesRow = `${headerRow}:${headerRow}`;
  sheet.properties.tabColor = { argb: TEAL };
  widths?.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
}

function label(status: SpeechStatus) {
  return STATUS[status];
}

function schoolOf(name: string) {
  return name.trim() || 'No school';
}

function writeSummary(sheet: ExcelJS.Worksheet, report: SpeechReport) {
  sheet.properties.tabColor = { argb: TEAL };
  sheet.views = [{ showGridLines: false }];
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, paperSize: 9 };
  sheet.columns = [{ width: 34 }, { width: 18 }, { width: 18 }, { width: 16 }, { width: 24 }];
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'Speech recognition';
  sheet.getCell('A1').font = { name: 'Calibri', size: 20, bold: true, color: { argb: TEAL } };
  sheet.getRow(1).height = 28;
  sheet.mergeCells('A2:E2');
  const exported = new Date(report.generatedAt);
  sheet.getCell('A2').value = `Groq ${report.configuredModel}  ·  Exported ${exported.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  sheet.getCell('A2').font = { name: 'Calibri', size: 11, color: { argb: MUTED } };
  sheet.mergeCells('A4:E4');
  sheet.getCell('A4').value = 'Audio minutes are what Groq meters. Peak students is how many people had a check open at the same moment. A Groq limit means the current allowance refused the check. Use Schools, Students, Hours, and Checks to filter and pivot.';
  sheet.getCell('A4').alignment = { wrapText: true, vertical: 'middle' };
  sheet.getCell('A4').font = { name: 'Calibri', size: 11, color: { argb: INK } };
  sheet.getRow(4).height = 36;

  const headers = ['Measure', 'Last hour', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];
  sheet.getRow(6).values = headers;
  paintHeader(sheet.getRow(6), 5);
  const windows = [report.hour, report.day, report.week, report.month];
  const measures: { name: string; pick: (window: SpeechReport['hour']) => number; format: string }[] = [
    { name: 'Checks', pick: (item) => item.requests, format: '#,##0' },
    { name: 'Students', pick: (item) => item.users, format: '#,##0' },
    { name: 'Peak students at once', pick: (item) => item.peakUsers, format: '#,##0' },
    { name: 'Peak overlapping checks', pick: (item) => item.peakChecks, format: '#,##0' },
    { name: 'Audio sent (minutes)', pick: (item) => minutes(item.audioMs), format: '#,##0.00' },
  ];
  measures.forEach((measure, index) => {
    const row = sheet.getRow(7 + index);
    row.getCell(1).value = measure.name;
    windows.forEach((item, column) => {
      const cell = row.getCell(column + 2);
      cell.value = measure.pick(item);
      cell.numFmt = measure.format;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });
  });
  paintBody(sheet, 6, 11, 5);
  measures.forEach((measure, index) => {
    windows.forEach((_, column) => {
      sheet.getRow(7 + index).getCell(column + 2).alignment = { horizontal: 'right', vertical: 'middle' };
    });
  });

  sheet.getRow(13).values = ['Result, last 30 days', 'Checks', 'Share of finished checks'];
  paintHeader(sheet.getRow(13), 3);
  const outcomeRows: [string, number][] = [
    ['Heard', report.outcomes.ok],
    ['Silent', report.outcomes.silent],
    ['Failed', report.outcomes.error],
    ['Groq limit', report.outcomes.rate_limited],
    ['App limit', report.outcomes.capped],
  ];
  const finished = outcomeRows.reduce((sum, [, count]) => sum + count, 0);
  outcomeRows.forEach(([name, count], index) => {
    const row = sheet.getRow(14 + index);
    row.getCell(1).value = name;
    row.getCell(2).value = count;
    row.getCell(2).numFmt = '#,##0';
    row.getCell(3).value = finished ? count / finished : 0;
    row.getCell(3).numFmt = '0%';
  });
  paintBody(sheet, 13, 18, 3);

  const notes: [string, number | string, string][] = [
    ['Speaking now', report.liveUsers, report.liveChecks === 1 ? '1 check in flight' : `${report.liveChecks} checks in flight`],
    ['Typical wait, last 7 days (seconds)', seconds(report.latencyMs.average) ?? 0, 'Average time Groq took to answer'],
    ['Slowest 5%, last 7 days (seconds)', seconds(report.latencyMs.p95) ?? 0, '95th percentile wait'],
  ];
  notes.forEach((note, index) => {
    const row = sheet.getRow(20 + index);
    row.getCell(1).value = note[0];
    row.getCell(2).value = note[1];
    if (typeof note[1] === 'number') row.getCell(2).numFmt = '#,##0.0';
    row.getCell(3).value = note[2];
    row.font = { name: 'Calibri', size: 11, color: { argb: INK } };
    row.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
  });
}

function writeSchools(sheet: ExcelJS.Worksheet, rows: SpeechUsageRow[]) {
  const grouped = new Map<string, { students: Set<string>; checks: number; audioMs: number; heard: number; silent: number; errors: number; groq: number; app: number; last: string }>();
  for (const row of rows) {
    if (row.status === 'running') continue;
    const key = schoolOf(row.school);
    const current = grouped.get(key) ?? { students: new Set<string>(), checks: 0, audioMs: 0, heard: 0, silent: 0, errors: 0, groq: 0, app: 0, last: row.startedAt };
    current.students.add(row.userId);
    current.checks += 1;
    if (row.status === 'ok' || row.status === 'silent' || row.status === 'error') current.audioMs += row.audioMs;
    if (row.status === 'ok') current.heard += 1;
    if (row.status === 'silent') current.silent += 1;
    if (row.status === 'error') current.errors += 1;
    if (row.status === 'rate_limited') current.groq += 1;
    if (row.status === 'capped') current.app += 1;
    if (Date.parse(row.startedAt) > Date.parse(current.last)) current.last = row.startedAt;
    grouped.set(key, current);
  }
  const headers = ['School', 'Students', 'Checks', 'Audio minutes', 'Heard', 'Silent', 'Failed', 'Groq limits', 'App limits', 'Last check'];
  sheet.addRow(headers);
  const list = [...grouped.entries()].sort((a, b) => b[1].checks - a[1].checks || a[0].localeCompare(b[0]));
  for (const [school, item] of list) {
    const row = sheet.addRow([school, item.students.size, item.checks, minutes(item.audioMs), item.heard, item.silent, item.errors, item.groq, item.app, new Date(item.last)]);
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(10).numFmt = 'dd mmm yyyy hh:mm';
  }
  finishTable(sheet, 1, Math.max(1, list.length + 1), headers.length, [32, 14, 12, 18, 12, 12, 12, 14, 14, 20]);
}

function writeStudents(sheet: ExcelJS.Worksheet, report: SpeechReport) {
  const headers = ['Student', 'Email', 'School', 'Class', 'Checks', 'Audio minutes', 'Groq limits', 'App limits', 'Failures', 'Last check'];
  sheet.addRow(headers);
  for (const person of report.people) {
    const row = sheet.addRow([
      person.name,
      person.email,
      schoolOf(person.school),
      person.classLabel,
      person.checks,
      minutes(person.audioMs),
      person.groqLimits,
      person.appLimits,
      person.errors,
      new Date(person.lastAt),
    ]);
    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(10).numFmt = 'dd mmm yyyy hh:mm';
  }
  finishTable(sheet, 1, Math.max(1, report.people.length + 1), headers.length, [24, 32, 28, 12, 12, 16, 14, 14, 12, 20]);
}

function writeHours(sheet: ExcelJS.Worksheet, report: SpeechReport) {
  const headers = ['Hour', 'Checks', 'Students', 'Peak students at once', 'Audio minutes'];
  sheet.addRow(headers);
  const hours = [...report.hours].reverse();
  for (const hour of hours) {
    const row = sheet.addRow([new Date(hour.start), hour.requests, hour.users, hour.peakUsers, minutes(hour.audioMs)]);
    row.getCell(1).numFmt = 'dd mmm yyyy hh:mm';
    row.getCell(5).numFmt = '#,##0.00';
  }
  finishTable(sheet, 1, Math.max(1, hours.length + 1), headers.length, [22, 12, 14, 24, 16]);
}

function writeChecks(sheet: ExcelJS.Worksheet, rows: SpeechUsageRow[]) {
  const headers = ['Started', 'Finished', 'Student', 'Email', 'School', 'Class', 'Level', 'Model', 'Result', 'Audio minutes', 'Size KB', 'Wait seconds', 'Keywords heard', 'Keywords', 'Accuracy', 'HTTP'];
  sheet.addRow(headers);
  const ordered = [...rows].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  for (const item of ordered) {
    const accuracy = item.matched != null && item.total ? item.matched / item.total : null;
    const row = sheet.addRow([
      new Date(item.startedAt),
      item.finishedAt ? new Date(item.finishedAt) : null,
      item.name,
      item.email,
      schoolOf(item.school),
      item.classLabel,
      item.level,
      item.model,
      label(item.status),
      minutes(item.audioMs),
      Math.round(item.audioBytes / 1024),
      seconds(item.latencyMs),
      item.matched,
      item.total,
      accuracy,
      item.httpStatus,
    ]);
    row.getCell(1).numFmt = 'dd mmm yyyy hh:mm';
    row.getCell(2).numFmt = 'dd mmm yyyy hh:mm';
    row.getCell(10).numFmt = '#,##0.00';
    row.getCell(12).numFmt = '#,##0.0';
    if (accuracy != null) row.getCell(15).numFmt = '0%';
  }
  finishTable(sheet, 1, Math.max(1, ordered.length + 1), headers.length, [20, 20, 22, 32, 28, 12, 14, 22, 14, 16, 12, 14, 16, 12, 12, 10]);
  ordered.forEach((item, index) => {
    const tone = RESULT_FILL[item.status];
    if (!tone) return;
    const cell = sheet.getRow(index + 2).getCell(9);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tone } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
  });
}

/** Workbook for Super Admin to filter, pivot, and decide when speech recognition needs a paid plan. */
async function buildSpeechWorkbook(rows: SpeechUsageRow[], report: SpeechReport) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'English Mastery';
  workbook.created = new Date(report.generatedAt);
  workbook.title = 'Speech recognition';
  workbook.subject = `Groq ${report.configuredModel}`;
  writeSummary(workbook.addWorksheet('Summary'), report);
  writeSchools(workbook.addWorksheet('Schools'), rows);
  writeStudents(workbook.addWorksheet('Students'), report);
  writeHours(workbook.addWorksheet('Hours'), report);
  writeChecks(workbook.addWorksheet('Checks'), rows);
  const out = await workbook.xlsx.writeBuffer();
  return new Uint8Array(out as ArrayBuffer);
}

export { buildSpeechWorkbook };
