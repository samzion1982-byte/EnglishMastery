import type ExcelJS from 'exceljs';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] as const;
const STANDARD_RANK = Object.fromEntries(ROMAN.map((label, index) => [label, index + 1]));

export type TrackerStudent = {
  admissionNo: string;
  name: string;
  standard: string;
  section: string;
};

export type TrackerClass = {
  standard: string;
  section: string;
  count: number;
};

export type RosterPerson = TrackerStudent & { source?: string; deviceLimit?: number };

export function classLabel(standard: string, section: string) {
  return `${standard}-${section}`;
}

export function classRank(standard: string, section: string) {
  return (STANDARD_RANK[standard] || 99) * 100 + section.charCodeAt(0);
}

export function normalizeSchoolCode(value: string) {
  const code = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/.test(code) || code.length < 2 || code.length > 20) return null;
  return code;
}

export function suggestAcademicYear(now = new Date()) {
  const start = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export function parseAcademicYear(value: string) {
  const match = value.trim().match(/^(20\d{2})-(\d{2})$/);
  if (!match) return null;
  const start = Number(match[1]);
  if (Number(match[2]) !== (start + 1) % 100) return null;
  return `${match[1]}-${match[2]}`;
}

export function registrationLink(code: string) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/j/${encodeURIComponent(code)}`;
}

export function normalizeClass(standard: string, section: string) {
  return parseClassName(`${standard}-${section}`);
}

export function parseClassName(name: string): { standard: string; section: string } | null {
  const cleaned = name.trim().toUpperCase().replace(/\s+/g, '');
  const match = cleaned.match(/^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I|1[0-2]|[1-9])-([A-Z])$/);
  if (!match) return null;
  const raw = match[1];
  const standard = /^\d+$/.test(raw) ? ROMAN[Number(raw) - 1] : raw;
  return { standard, section: match[2] };
}

function cellText(value: ExcelJS.CellValue | undefined): { text: string; date: boolean } {
  if (value == null) return { text: '', date: false };
  if (value instanceof Date) return { text: '', date: true };
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return { text: String(value).trim(), date: false };
  }
  if (typeof value === 'object' && 'richText' in value && Array.isArray(value.richText)) {
    return { text: value.richText.map((part) => part.text || '').join('').trim(), date: false };
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return { text: value.text.trim(), date: false };
  }
  if (typeof value === 'object' && 'result' in value && value.result != null && !(value.result instanceof Date)) {
    return { text: String(value.result).trim(), date: false };
  }
  if (typeof value === 'object' && 'result' in value && value.result instanceof Date) {
    return { text: '', date: true };
  }
  return { text: '', date: false };
}

function headerKind(text: string) {
  const key = text.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
  if (key === 's no' || key === 'sno' || key === 'sl no' || key === 'serial' || key === 'serial no') return 'sno';
  if (key === 'admission number' || key === 'admission no' || key === 'admissionnumber') return 'admission';
  if (key === 'name' || key === 'student name') return 'name';
  return null;
}

function rowCells(row: ExcelJS.Row) {
  const cells: { text: string; date: boolean }[] = [];
  const last = Math.max(row.cellCount, 5);
  for (let column = 1; column <= last; column += 1) cells.push(cellText(row.getCell(column).value));
  return cells;
}

export async function parseSchoolTracker(buffer: ArrayBuffer): Promise<{ students: TrackerStudent[]; classes: TrackerClass[]; errors: string[] }> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const students: TrackerStudent[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();

  if (workbook.worksheets.length === 0) errors.push('The workbook has no worksheets.');

  for (const sheet of workbook.worksheets) {
    const parsedName = parseClassName(sheet.name);
    let header: { sno: number; admission: number; name: number } | null = null;
    let occupied = false;

    for (let index = 1; index <= sheet.rowCount; index += 1) {
      const cells = rowCells(sheet.getRow(index));
      const texts = cells.map((cell) => cell.text);
      if (texts.every((text) => !text) && cells.every((cell) => !cell.date)) continue;
      occupied = true;
      if (!header) {
        const kinds = texts.map(headerKind);
        const admission = kinds.indexOf('admission');
        const name = kinds.indexOf('name');
        if (index !== 1 || admission < 0 || name < 0) {
          errors.push(`${sheet.name}: row 1 must be the header S. No, Admission Number, Name.`);
          break;
        }
        header = { sno: kinds.indexOf('sno'), admission, name };
        continue;
      }
      if (!parsedName) {
        errors.push(`${sheet.name}: name the sheet like VI-A.`);
        break;
      }
      const admissionCell = cells[header.admission] || { text: '', date: false };
      const name = (texts[header.name] || '').replace(/\s+/g, ' ').trim();
      if (admissionCell.date) {
        errors.push(`${sheet.name} row ${index}: format the admission number as text, for example 2019-0001.`);
        continue;
      }
      const admissionNo = admissionCell.text.replace(/\s+/g, '').toUpperCase();
      if (!admissionNo && !name) continue;
      if (!admissionNo || !name) {
        errors.push(`${sheet.name} row ${index}: each student needs an admission number and a name.`);
        continue;
      }
      if (!/^[A-Z0-9][A-Z0-9./-]{1,39}$/.test(admissionNo)) {
        errors.push(`${sheet.name} row ${index}: ${admissionNo} is not a usable admission number.`);
        continue;
      }
      if (name.length > 160) {
        errors.push(`${sheet.name} row ${index}: the name is too long.`);
        continue;
      }
      const previous = seen.get(admissionNo);
      if (previous) {
        errors.push(`${admissionNo} appears on ${previous} and ${classLabel(parsedName.standard, parsedName.section)}.`);
        continue;
      }
      seen.set(admissionNo, classLabel(parsedName.standard, parsedName.section));
      students.push({
        admissionNo,
        name,
        standard: parsedName.standard,
        section: parsedName.section,
      });
    }

    if (occupied && !parsedName && !errors.some((error) => error.startsWith(`${sheet.name}:`))) {
      errors.push(`${sheet.name}: name the sheet like VI-A.`);
    }
  }

  const counts = new Map<string, TrackerClass>();
  for (const student of students) {
    const key = classLabel(student.standard, student.section);
    const current = counts.get(key) || { standard: student.standard, section: student.section, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }
  const classes = [...counts.values()].sort((a, b) => classRank(a.standard, a.section) - classRank(b.standard, b.section));
  if (errors.length === 0 && students.length === 0) errors.push('The workbook has no students.');
  return { students, classes, errors };
}

export function diffRoster(current: RosterPerson[], next: TrackerStudent[]) {
  const now = new Map(current.map((row) => [row.admissionNo.toUpperCase(), row]));
  const incoming = new Map(next.map((row) => [row.admissionNo.toUpperCase(), row]));
  const added: TrackerStudent[] = [];
  const moved: TrackerStudent[] = [];
  const renamed: TrackerStudent[] = [];
  const kept: TrackerStudent[] = [];
  const left: RosterPerson[] = [];

  for (const row of next) {
    const previous = now.get(row.admissionNo.toUpperCase());
    if (!previous) {
      added.push(row);
      continue;
    }
    const sameClass = previous.standard === row.standard && previous.section === row.section;
    if (!sameClass) moved.push(row);
    else if (previous.name.trim() !== row.name.trim()) renamed.push(row);
    else kept.push(row);
  }
  for (const row of current) {
    if (!incoming.has(row.admissionNo.toUpperCase())) left.push(row);
  }
  return { added, moved, renamed, kept, left };
}

export type StaffDesignation = 'principal' | 'hod' | 'teacher' | 'tutor';

export type StaffPerson = {
  name: string;
  designation: StaffDesignation;
  email: string;
  level: number;
};

export const STAFF_LABEL: Record<StaffDesignation, string> = {
  principal: 'Principal',
  hod: 'HOD',
  teacher: 'Teacher',
  tutor: 'Tutor',
};

export const STAFF_LEVEL: Record<StaffDesignation, number> = {
  principal: 4,
  hod: 3,
  teacher: 2,
  tutor: 1,
};

function staffHeaderKind(text: string) {
  const key = text.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
  if (key === 's no' || key === 'sno' || key === 'sl no' || key === 'serial' || key === 'serial no') return 'sno';
  if (key === 'name' || key === 'staff name') return 'name';
  if (key === 'designation') return 'designation';
  if (key === 'email' || key === 'email id' || key === 'e-mail' || key === 'mail') return 'email';
  if (key === 'level') return 'level';
  return null;
}

function parseStaffDesignation(value: string): StaffDesignation | null {
  const key = value.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
  if (key === 'principal') return 'principal';
  if (key === 'hod' || key === 'h o d' || key === 'head of department' || key === 'head of the department') return 'hod';
  if (key === 'teacher') return 'teacher';
  if (key === 'tutor') return 'tutor';
  return null;
}

export async function parseStaffFile(buffer: ArrayBuffer): Promise<{ people: StaffPerson[]; errors: string[] }> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const people: StaffPerson[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const seenEmail = new Set<string>();
  const sheet = workbook.worksheets[0];
  if (!sheet) return { people, errors: ['The workbook has no worksheets.'] };

  let header: { name: number; designation: number; email: number; level: number } | null = null;
  for (let index = 1; index <= sheet.rowCount; index += 1) {
    const cells = rowCells(sheet.getRow(index));
    const texts = cells.map((cell) => cell.text);
    if (texts.every((text) => !text) && cells.every((cell) => !cell.date)) continue;
    if (!header) {
      const kinds = texts.map(staffHeaderKind);
      const name = kinds.indexOf('name');
      const designation = kinds.indexOf('designation');
      const email = kinds.indexOf('email');
      const level = kinds.indexOf('level');
      if (index !== 1 || name < 0 || designation < 0 || email < 0 || level < 0) {
        errors.push('Row 1 must be the header S. No, Name, Designation, Email, Level.');
        break;
      }
      header = { name, designation, email, level };
      continue;
    }
    const name = (texts[header.name] || '').replace(/\s+/g, ' ').trim();
    const designationText = texts[header.designation] || '';
    const email = (texts[header.email] || '').replace(/\s+/g, '').trim().toLowerCase();
    const levelText = (texts[header.level] || '').replace(/\.0$/, '');
    if (!name && !designationText && !email && !levelText) continue;
    const designation = parseStaffDesignation(designationText);
    const level = Number(levelText);
    if (!name || !designation || !Number.isInteger(level)) {
      errors.push(`Row ${index}: each person needs a name, a designation, and a level. Use Principal, HOD, Teacher, or Tutor.`);
      continue;
    }
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) || email.length > 160) {
      errors.push(`Row ${index}: enter a valid email for ${name}.`);
      continue;
    }
    if (name.length > 160) {
      errors.push(`Row ${index}: the name is too long.`);
      continue;
    }
    if (STAFF_LEVEL[designation] !== level) {
      errors.push(`Row ${index}: ${STAFF_LABEL[designation]} is level ${STAFF_LEVEL[designation]}.`);
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Row ${index}: ${name} is already in the file.`);
      continue;
    }
    if (seenEmail.has(email)) {
      errors.push(`Row ${index}: ${email} is already in the file.`);
      continue;
    }
    seen.add(key);
    seenEmail.add(email);
    people.push({ name, designation, email, level });
  }

  if (errors.length === 0 && people.length === 0) errors.push('The workbook has no staff.');
  return { people, errors };
}
