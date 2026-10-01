'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import { AssignClasses, loadCoverageLabels } from '@/components/assign-classes';
import { MenuSelect } from '@/components/menu-select';
import { useNotice } from '@/components/use-notice';
import { fetchAll } from '@/lib/fetch-all';
import { errorText } from '@/lib/error-text';
import { createBrowserSupabase } from '@/lib/supabase';
import {
  classLabel,
  classRank,
  diffRoster,
  normalizeClass,
  parseAcademicYear,
  parseSchoolTracker,
  parseStaffFile,
  STAFF_LABEL,
  STAFF_LEVEL,
  suggestAcademicYear,
  type RosterPerson,
  type StaffDesignation,
  type StaffPerson,
  type TrackerStudent,
} from '@/lib/school-tracker';

type Licence = {
  id: string;
  name: string;
  kind: string;
  school_code: string | null;
  seats: number;
  status: string;
  second_device_policy: 'hold' | 'refuse';
  accepting_devices: boolean;
  valid_from: string;
  valid_until: string | null;
  academic_year: string | null;
};

type Registration = {
  id: string;
  admission_no: string;
  status: string;
  request_kind: 'primary' | 'extra';
};

const emptyManual = { admission: '', name: '', standard: '', section: '' };
const STUDENT_NOTE = 'Uploading a tracker replaces this year\'s class list. A student who is missing from the file leaves the roll. Their progress stays on the account.';
const STAFF_NOTE = 'Uploading a staff file replaces the current list. Each person signs in with the email in the file. The first password is 123456.';
const SQL_CONTROLS = 'Run supabase/migrations/20260926190000_school_student_controls.sql in the Supabase SQL editor, then retry.';
const SQL_STAFF = 'Run supabase/migrations/20260926220000_school_staff_login.sql in the Supabase SQL editor, then upload the staff file again.';
const SQL_STAFF_SAVE = 'Run supabase/migrations/20260926330000_staff_email_save.sql in the Supabase SQL editor, then click Save staff list again.';
const SQL_STAFF_CONTROLS = 'Run supabase/migrations/20260926230000_school_staff_controls.sql in the Supabase SQL editor, then try again.';
const SQL_REPAIRS = 'Run supabase/migrations/20260926240000_licence_repairs.sql in the Supabase SQL editor, then try again.';

type SchoolStaff = StaffPerson & { id: string; active: boolean };

type Pupil = RosterPerson & { active: boolean };

export function SchoolDesk({ licenceId }: { licenceId: string }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [licence, setLicence] = useState<Licence | null>(null);
  const [roster, setRoster] = useState<Pupil[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState('');
  const [notice, setNotice, noticeTone] = useNotice(STUDENT_NOTE);
  const [desk, setDesk] = useState<'students' | 'staff'>('students');
  const [preview, setPreview] = useState<{ students: TrackerStudent[]; summary: string; warnings: string[]; blocked: string } | null>(null);
  const [confirmDrop, setConfirmDrop] = useState(false);
  const [manual, setManual] = useState(emptyManual);
  const [classFilter, setClassFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [studentControls, setStudentControls] = useState(true);
  const [academicYear, setAcademicYear] = useState(suggestAcademicYear);
  const [yearColumn, setYearColumn] = useState(true);
  const [staff, setStaff] = useState<SchoolStaff[]>([]);
  const [coverage, setCoverage] = useState<Record<string, string>>({});
  const [staffReady, setStaffReady] = useState(true);
  const [staffControls, setStaffControls] = useState(true);
  const [staffPreview, setStaffPreview] = useState<{ people: StaffPerson[]; errors: string[] } | null>(null);
  const [staffEdit, setStaffEdit] = useState<{ id: string; name: string; designation: StaffDesignation; email: string } | null>(null);
  const [history, setHistory] = useState<{ id: string; action: string; detail: string; created_at: string }[]>([]);

  async function load() {
    setLoading(true);
    setMissing('');
    type LicenceRow = Licence & { academic_year?: string | null };
    type RosterRow = { admission_no: string; student_name: string; standard_label: string; section_label: string; source: string; device_limit: number; active?: boolean };
    type StaffRow = { id: string; staff_name: string; designation: StaffPerson['designation']; email: string | null; rank_level: number; sort_no: number; active?: boolean };
    const asPage = <T,>(query: unknown) => query as PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
    const wide = await supabase.from('em_licences').select('id, name, kind, school_code, seats, status, second_device_policy, accepting_devices, valid_from, valid_until, academic_year').eq('id', licenceId).maybeSingle();
    let licenceError = wide.error;
    let licenceRow = wide.data as LicenceRow | null;
    if (wide.error && /academic_year/i.test(wide.error.message)) {
      setYearColumn(false);
      const narrow = await supabase.from('em_licences').select('id, name, kind, school_code, seats, status, second_device_policy, accepting_devices, valid_from, valid_until').eq('id', licenceId).maybeSingle();
      licenceError = narrow.error;
      licenceRow = narrow.data as LicenceRow | null;
    } else if (!wide.error) {
      setYearColumn(true);
    }
    if (licenceError) {
      const message = licenceError.message;
      setMissing(/second_device_policy|device_limit|request_kind/i.test(message)
        ? 'Run supabase/migrations/20260926150000_one_device.sql in the Supabase SQL editor, then retry.'
        : /school_code|schema cache|does not exist/i.test(message)
          ? 'Run supabase/migrations/20260926140000_school_roster.sql in the Supabase SQL editor, then retry.'
          : message);
      setLoading(false);
      return;
    }
    if (!licenceRow || licenceRow.kind !== 'school') {
      setMissing('This school licence is not on the list.');
      setLoading(false);
      return;
    }
    const rosterQuery = (columns: string) => (from: number, to: number) => asPage<RosterRow>(
      supabase.from('em_roster').select(columns).eq('licence_id', licenceId).order('admission_no').range(from, to),
    );
    let rosterResult = await fetchAll(rosterQuery('admission_no, student_name, standard_label, section_label, source, device_limit, active'));
    if (rosterResult.error && /active/i.test(rosterResult.error.message)) {
      setStudentControls(false);
      rosterResult = await fetchAll(rosterQuery('admission_no, student_name, standard_label, section_label, source, device_limit'));
    } else if (!rosterResult.error) {
      setStudentControls(true);
    }
    const registrationResult = await fetchAll<Registration>((from, to) => asPage(
      supabase.from('em_device_registrations').select('id, admission_no, status, request_kind, created_at').eq('licence_id', licenceId).order('created_at').order('id').range(from, to),
    ));
    if (rosterResult.error || registrationResult.error) {
      const message = rosterResult.error?.message || registrationResult.error?.message || '';
      setMissing(/device_limit|request_kind/i.test(message)
        ? 'Run supabase/migrations/20260926150000_one_device.sql in the Supabase SQL editor, then retry.'
        : 'Run supabase/migrations/20260926140000_school_roster.sql in the Supabase SQL editor, then retry.');
      setLoading(false);
      return;
    }
    const row = licenceRow;
    row.valid_from = String(row.valid_from).slice(0, 10);
    row.valid_until = row.valid_until ? String(row.valid_until).slice(0, 10) : null;
    row.academic_year = row.academic_year || null;
    row.accepting_devices = row.accepting_devices !== false;
    setLicence(row);
    if (row.academic_year) setAcademicYear(row.academic_year);
    setRoster(rosterResult.data.map((item) => ({
      admissionNo: item.admission_no,
      name: item.student_name,
      standard: item.standard_label,
      section: item.section_label,
      source: item.source,
      deviceLimit: item.device_limit,
      active: item.active !== false,
    })).sort((a, b) => classRank(a.standard, a.section) - classRank(b.standard, b.section) || a.admissionNo.localeCompare(b.admissionNo)));
    setRegistrations(registrationResult.data);
    const staffQuery = (columns: string) => (from: number, to: number) => asPage<StaffRow>(
      supabase.from('em_school_staff').select(columns).eq('licence_id', licenceId).order('sort_no').range(from, to),
    );
    let staffRows = await fetchAll(staffQuery('id, staff_name, designation, email, rank_level, sort_no, active'));
    if (staffRows.error && /active/i.test(staffRows.error.message)) {
      setStaffControls(false);
      staffRows = await fetchAll(staffQuery('id, staff_name, designation, email, rank_level, sort_no'));
    } else if (!staffRows.error) {
      setStaffControls(true);
    }
    if (staffRows.error) {
      setStaffReady(false);
      setStaff([]);
    } else {
      setStaffReady(true);
      setStaff(staffRows.data.map((item) => ({
        id: item.id,
        name: item.staff_name,
        designation: item.designation,
        email: item.email || '',
        level: item.rank_level,
        active: item.active !== false,
      })));
    }
    const events = await supabase.from('em_licence_events').select('id, action, detail, created_at').eq('licence_id', licenceId).order('created_at', { ascending: false }).limit(20);
    setHistory(events.error ? [] : (events.data || []) as { id: string; action: string; detail: string; created_at: string }[]);
    const labels = await loadCoverageLabels(supabase, licenceId).catch(() => ({} as Record<string, string>));
    setCoverage(labels);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [licenceId]);

  function openDesk(next: 'students' | 'staff') {
    setDesk(next);
    if (noticeTone === 'info') setNotice(next === 'staff' ? STAFF_NOTE : STUDENT_NOTE);
  }

  async function onFile(file: File | undefined) {
    setPreview(null);
    setConfirmDrop(false);
    if (!file) return;
    setBusy('read');
    try {
      const parsed = await parseSchoolTracker(await file.arrayBuffer());
      if (parsed.errors.length) {
        setPreview({ students: [], summary: '', warnings: parsed.errors.slice(0, 12), blocked: parsed.errors.length > 12 ? `${parsed.errors.length - 12} more issues.` : 'Fix the tracker and choose it again.' });
        return;
      }
      const diff = diffRoster(roster, parsed.students);
      const heavy = roster.length > 0 && diff.left.length / roster.length > 0.2;
      const classBits = parsed.classes.map((item) => `${classLabel(item.standard, item.section)} ${item.count}`);
      setPreview({
        students: parsed.students,
        summary: `${parsed.students.length} students across ${parsed.classes.length} classes. ${diff.added.length} new, ${diff.moved.length} moved, ${diff.renamed.length} name updates, ${diff.kept.length} unchanged, ${diff.left.length} leaving the roll.`,
        warnings: [
          classBits.join(' · '),
          diff.left.length ? `Leaving: ${diff.left.slice(0, 8).map((row) => `${row.admissionNo} ${row.name}`).join(', ')}${diff.left.length > 8 ? ` and ${diff.left.length - 8} more` : ''}.` : '',
        ].filter(Boolean),
        blocked: heavy ? 'This file drops more than a fifth of the current roll. Tick the box below only when that is the full school list.' : '',
      });
    } catch (err) {
      setNotice(errorText(err, 'Could not read that workbook.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function applyTracker() {
    if (!preview?.students.length || busy) return;
    const year = parseAcademicYear(academicYear);
    if (!year) {
      setNotice('Enter the academic year as 2026-27.', 'error');
      return;
    }
    setBusy('apply');
    setNotice('');
    try {
      const { error } = await supabase.rpc('apply_school_roster', {
        p_licence_id: licenceId,
        p_rows: preview.students.map((row) => ({
          admission_no: row.admissionNo,
          student_name: row.name,
          standard_label: row.standard,
          section_label: row.section,
        })),
        p_academic_year: year,
      });
      if (error) {
        if (/apply_school_roster|schema cache|academic_year/i.test(error.message)) {
          setNotice('Run supabase/migrations/20260926250000_licence_followup.sql in the Supabase SQL editor, then upload the tracker again. Nothing was saved.', 'error');
          return;
        }
        throw error;
      }
      setPreview(null);
      setConfirmDrop(false);
      setAcademicYear(year);
      setNotice(`Tracker uploaded for ${year}. The student count now matches the file.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not upload the tracker.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function onStaffFile(file: File | undefined) {
    setStaffPreview(null);
    if (!file) return;
    setBusy('read-staff');
    try {
      const parsed = await parseStaffFile(await file.arrayBuffer());
      setStaffPreview(parsed);
    } catch (err) {
      setNotice(errorText(err, 'Could not read that workbook.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function writeStaffEmails(people: StaffPerson[]) {
    const saved = await supabase.from('em_school_staff').select('id, staff_name, email').eq('licence_id', licenceId);
    if (saved.error) return saved.error.message;
    for (const person of people) {
      const row = (saved.data || []).find((item) => item.staff_name.trim().toLowerCase() === person.name.trim().toLowerCase());
      if (!row) return `${person.name} is not on the saved staff list.`;
      if ((row.email || '').toLowerCase() === person.email.toLowerCase()) continue;
      const edit = await supabase.rpc('update_school_staff', {
        p_licence_id: licenceId,
        p_staff_id: row.id,
        p_name: person.name,
        p_designation: person.designation,
        p_email: person.email,
        p_level: person.level,
      });
      if (edit.error) return edit.error.message;
    }
    return '';
  }

  async function applyStaff() {
    if (!staffPreview?.people.length || staffPreview.errors.length || busy) return;
    setBusy('apply-staff');
    setNotice('');
    const people = staffPreview.people;
    try {
      const { data, error } = await supabase.rpc('apply_school_staff', {
        p_licence_id: licenceId,
        p_rows: people.map((person) => ({
          staff_name: person.name,
          designation: person.designation,
          email: person.email,
          rank_level: person.level,
        })),
      });
      if (error) {
        const rowError = await writeStaffEmails(people);
        if (rowError) {
          setNotice(`${error.message} ${SQL_STAFF_SAVE}`, 'error');
          return;
        }
        setStaffPreview(null);
        setNotice('Staff emails saved.', 'success');
        await load();
        return;
      }
      const created = data && typeof data === 'object' && 'created' in data ? Number(data.created) : 0;
      const warning = data && typeof data === 'object' && 'warning' in data && data.warning ? String(data.warning) : '';
      const saved = await supabase.from('em_school_staff').select('id, email').eq('licence_id', licenceId);
      const stillBlank = !saved.error && (saved.data || []).some((row) => !row.email);
      if (saved.error || stillBlank) {
        const rowError = await writeStaffEmails(people);
        if (rowError) {
          setNotice(`${saved.error?.message || rowError} ${SQL_STAFF_SAVE}`, 'error');
          return;
        }
      }
      setStaffPreview(null);
      setNotice(warning
        ? `Staff emails saved. Sign-ins were not created: ${warning}`
        : created > 0
          ? `Staff list saved. ${created} new sign-ins use password 123456 and must change it at the first login.`
          : 'Staff list saved. Existing sign-ins keep their passwords.', warning ? 'error' : 'success');
      await load();
    } catch (err) {
      setNotice(`${errorText(err, 'Could not save the staff file.')} ${SQL_STAFF_SAVE}`, 'error');
    } finally {
      setBusy('');
    }
  }

  async function resetStaffPassword(person: SchoolStaff) {
    if (busy) return;
    if (!window.confirm(`Reset ${person.name} to password 123456? They choose a new password at the next sign-in.`)) return;
    setBusy(`reset-${person.id}`);
    setNotice('');
    try {
      const { error } = await supabase.rpc('reset_school_staff_password', { p_licence_id: licenceId, p_staff_id: person.id });
      if (error) {
        if (/reset_school_staff_password|schema cache/i.test(error.message)) {
          setNotice(SQL_STAFF, 'error');
          return;
        }
        throw error;
      }
      setNotice(`${person.name} can sign in with password 123456 and must choose a new one.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not reset that password.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function saveStaffEdit() {
    if (!staffEdit || busy) return;
    const name = staffEdit.name.replace(/\s+/g, ' ').trim();
    const email = staffEdit.email.replace(/\s+/g, '').trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      setNotice(`Enter a valid email for ${name || 'this person'}.`, 'error');
      return;
    }
    setBusy('edit-staff');
    setNotice('');
    try {
      const { error } = await supabase.rpc('update_school_staff', {
        p_licence_id: licenceId,
        p_staff_id: staffEdit.id,
        p_name: name,
        p_designation: staffEdit.designation,
        p_email: email,
        p_level: STAFF_LEVEL[staffEdit.designation],
      });
      if (error) {
        if (/update_school_staff|schema cache|active/i.test(error.message) && /schema cache|does not exist/i.test(error.message)) {
          setStaffControls(false);
          setNotice(SQL_STAFF_CONTROLS, 'error');
          return;
        }
        throw error;
      }
      setStaffEdit(null);
      setNotice(`${name} updated.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not update that staff member.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function setStaffActive(person: SchoolStaff, active: boolean) {
    if (busy) return;
    setBusy(person.id);
    setNotice('');
    try {
      const { error } = await supabase.rpc('set_school_staff_active', {
        p_licence_id: licenceId,
        p_staff_id: person.id,
        p_active: active,
      });
      if (error) {
        if (/set_school_staff_active|schema cache|active/i.test(error.message) && /schema cache|does not exist/i.test(error.message)) {
          setStaffControls(false);
          setNotice(SQL_STAFF_CONTROLS, 'error');
          return;
        }
        throw error;
      }
      setStaff((all) => all.map((item) => (item.id === person.id ? { ...item, active } : item)));
      setNotice(active ? `${person.name} can sign in again.` : `${person.name} is disabled.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not update that staff member.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function removeStaff(person: SchoolStaff) {
    if (busy) return;
    if (!window.confirm(`Remove ${person.name} from this school? Their sign-in will stop.`)) return;
    setBusy(`delete-${person.id}`);
    setNotice('');
    try {
      const { error } = await supabase.rpc('delete_school_staff', { p_licence_id: licenceId, p_staff_id: person.id });
      if (error) {
        if (/delete_school_staff|schema cache/i.test(error.message)) {
          setStaffControls(false);
          setNotice(SQL_STAFF_CONTROLS, 'error');
          return;
        }
        throw error;
      }
      setNotice(`${person.name} removed.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not delete that staff member.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function addStudent(event: React.FormEvent) {
    event.preventDefault();
    const place = normalizeClass(manual.standard, manual.section);
    if (!place) {
      setNotice('Enter a standard and section such as VI and A.', 'error');
      return;
    }
    setBusy('add');
    setNotice('');
    try {
      const { data, error } = await supabase.rpc('add_school_student', {
        p_licence_id: licenceId,
        p_admission: manual.admission,
        p_name: manual.name,
        p_standard: place.standard,
        p_section: place.section,
      });
      if (error) throw error;
      const moved = !!(data && typeof data === 'object' && 'moved' in data && data.moved);
      setManual(emptyManual);
      setNotice(moved ? `${manual.admission.trim().toUpperCase()} moved to ${classLabel(place.standard, place.section)}.` : `${manual.admission.trim().toUpperCase()} added to ${classLabel(place.standard, place.section)}.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not add that student.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function setPolicy(value: 'hold' | 'refuse') {
    if (!licence || busy) return;
    setBusy('policy');
    try {
      const { error } = await supabase.from('em_licences').update({ second_device_policy: value }).eq('id', licence.id);
      if (error) throw error;
      setLicence({ ...licence, second_device_policy: value });
      setNotice(value === 'refuse' ? 'Further devices are refused automatically.' : 'Further devices wait for your decision.', 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not save that rule.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function decideExtra(row: Registration, allow: boolean) {
    if (busy) return;
    setBusy(row.id);
    try {
      const { error } = await supabase.rpc('decide_school_device', {
        p_licence_id: licenceId,
        p_registration_id: row.id,
        p_allow: allow,
      });
      if (error) {
        if (/decide_school_device|schema cache/i.test(error.message)) {
          setNotice(SQL_REPAIRS, 'error');
          return;
        }
        throw error;
      }
      setNotice(allow ? `Second device allowed for ${row.admission_no}.` : `Second device refused for ${row.admission_no}.`, 'success');
      await load();
    } catch (err) {
      const text = errorText(err, 'Could not update that device.');
      setNotice(/five devices/i.test(text) ? 'This student already has five devices.' : text, 'error');
    } finally {
      setBusy('');
    }
  }

  async function setStudentActive(pupil: Pupil, active: boolean) {
    if (busy) return;
    setBusy(pupil.admissionNo);
    try {
      const rpc = await supabase.rpc('set_school_student_active', {
        p_licence_id: licenceId,
        p_admission: pupil.admissionNo,
        p_active: active,
      });
      if (rpc.error) {
        if (/set_school_student_active|active|schema cache/i.test(rpc.error.message)) {
          setStudentControls(false);
          setNotice(SQL_CONTROLS, 'error');
          return;
        }
        throw rpc.error;
      }
      setRoster((all) => all.map((item) => (item.admissionNo === pupil.admissionNo ? { ...item, active } : item)));
      setNotice(active ? `${pupil.admissionNo} can sign in again.` : `${pupil.admissionNo} is disabled.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not update that student.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function removeStudent(pupil: Pupil) {
    if (busy) return;
    if (!window.confirm(`Remove ${pupil.name} (${pupil.admissionNo}) from this school?`)) return;
    setBusy(`delete-${pupil.admissionNo}`);
    try {
      const rpc = await supabase.rpc('delete_school_student', { p_licence_id: licenceId, p_admission: pupil.admissionNo });
      if (rpc.error) {
        if (/delete_school_student|schema cache/i.test(rpc.error.message)) {
          setNotice(SQL_CONTROLS, 'error');
          return;
        }
        throw rpc.error;
      }
      setNotice(`${pupil.admissionNo} removed.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not delete that student.'), 'error');
    } finally {
      setBusy('');
    }
  }

  async function approveWaiting() {
    if (busy) return;
    setBusy('approve');
    try {
      const { error } = await supabase.from('em_device_registrations').update({ status: 'approved' }).eq('licence_id', licenceId).eq('status', 'pending').eq('request_kind', 'primary');
      if (error) throw error;
      setNotice('Waiting students are approved.', 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not approve the waiting list.'), 'error');
    } finally {
      setBusy('');
    }
  }

  const rosterByAdmission = new Map(roster.map((row) => [row.admissionNo, row]));
  const waiting = registrations.filter((row) => row.status === 'pending' && row.request_kind !== 'extra');
  const pending = registrations.filter((row) => row.status === 'pending');
  const refused = registrations.filter((row) => row.status === 'rejected');
  const approvedAdmissions = new Set(registrations.filter((row) => row.status === 'approved').map((row) => row.admission_no));
  const classes = [...new Map(roster.map((row) => [classLabel(row.standard, row.section), row])).keys()];
  const visible = roster.filter((row) => (classFilter === 'all' || classLabel(row.standard, row.section) === classFilter) && (!query || `${row.admissionNo} ${row.name}`.toLowerCase().includes(query.toLowerCase())));
  const dropHeavy = !!preview?.blocked;
  const missingEmails = staff.filter((person) => !person.email).length;
  const incomingStaff = staffPreview && staffPreview.errors.length === 0 ? staffPreview.people : null;
  const staffCounts = {
    principal: staff.filter((person) => person.designation === 'principal').length,
    hod: staff.filter((person) => person.designation === 'hod').length,
    teacher: staff.filter((person) => person.designation === 'teacher').length,
    tutor: staff.filter((person) => person.designation === 'tutor').length,
  };

  return (
    <>
      <header className="page-head">
        <div>
          <p className="admin-kicker">Distribution</p>
          <h1>{licence?.name || 'School'}</h1>
          <p className={`admin-note ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p>
        </div>
      </header>
      <p className="meta"><Link href="/admin/licences">All licences</Link></p>

      {missing && <p className="notice error" role="alert">{missing} <button type="button" onClick={() => void load()}>Retry</button></p>}
      {loading && !missing ? <p className="admin-note">Loading the school…</p> : null}

      {licence && !missing && (
        <>
          <div className="licence-tabs" role="tablist" aria-label="School">
            <button type="button" role="tab" aria-selected={desk === 'students'} onClick={() => openDesk('students')}>
              Students<span className="tab-count">{roster.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={desk === 'staff'} onClick={() => openDesk('staff')}>
              Staff<span className="tab-count">{staff.length}</span>
            </button>
          </div>

          {desk === 'students' && (
          <div role="tabpanel" aria-label="Students">
          <div className="licence-summary">
            <article className="admin-card"><span>Academic year</span><strong>{licence.academic_year || '—'}</strong></article>
            <article className="admin-card"><span>Students</span><strong>{roster.length}</strong></article>
            <article className="admin-card"><span>Classes</span><strong>{classes.length}</strong></article>
            <article className="admin-card"><span>Waiting</span><strong>{waiting.length}</strong></article>
          </div>

          <section className="admin-card">
            <div className="card-head"><h2>Yearly tracker</h2></div>
            <label>
              Academic year
              <input className="year-input" required spellCheck={false} value={academicYear} placeholder="2026-27" onChange={(event) => setAcademicYear(event.target.value)} />
            </label>
            {academicYear && !parseAcademicYear(academicYear) ? <p className="meta">Use the form 2026-27.</p> : null}
            <label>
              Workbook
              <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void onFile(event.target.files?.[0])} />
            </label>
            {busy === 'read' ? <p className="meta">Reading the workbook…</p> : null}
            {preview ? (
              <div className="roster-preview">
                {preview.summary ? <p>{parseAcademicYear(academicYear) ? `Academic year ${parseAcademicYear(academicYear)}. ` : ''}{preview.summary}</p> : null}
                {preview.warnings.length > 0 && (
                  <ul>
                    {preview.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                )}
                {preview.blocked ? <p className="notice error" role="alert">{preview.blocked}</p> : null}
                {dropHeavy && preview.students.length > 0 && (
                  <label className="perm-row">
                    <input type="checkbox" checked={confirmDrop} onChange={(event) => setConfirmDrop(event.target.checked)} />
                    Replace the roll even though students will leave it
                  </label>
                )}
                {preview.students.length > 0 && (
                  <button type="button" className="go" disabled={busy === 'apply' || (dropHeavy && !confirmDrop) || !parseAcademicYear(academicYear)} onClick={() => void applyTracker()}>
                    {busy === 'apply' ? 'Uploading…' : 'Replace this year\'s list'}
                  </button>
                )}
              </div>
            ) : <p className="meta licence-hint">Enter the academic year as 2026-27, then choose the workbook. Each worksheet is a class, named like VI-A. Row 1 is S. No, Admission Number, Name. The student count becomes the number of filled rows.{yearColumn ? '' : ' Run supabase/migrations/20260926180000_school_year_and_open.sql before the next upload so the year can be saved.'}</p>}
          </section>

          <section className="admin-card">
            <div className="card-head"><h2>Mid-year student</h2></div>
            <form className="manual-add" onSubmit={addStudent}>
              <label>
                Admission number
                <input required value={manual.admission} onChange={(event) => setManual({ ...manual, admission: event.target.value })} />
              </label>
              <label>
                Name
                <input required value={manual.name} onChange={(event) => setManual({ ...manual, name: event.target.value })} />
              </label>
              <label>
                Standard
                <input required value={manual.standard} placeholder="VI" onChange={(event) => setManual({ ...manual, standard: event.target.value })} />
              </label>
              <label>
                Section
                <input required value={manual.section} placeholder="A" onChange={(event) => setManual({ ...manual, section: event.target.value })} />
              </label>
              <button className="go" type="submit" disabled={busy === 'add'}>{busy === 'add' ? 'Saving…' : 'Add student'}</button>
            </form>
          </section>

          <section className="admin-card table-card">
            <div className="card-head roster-head">
              <h2>Waiting for approval{pending.length ? ` (${pending.length})` : ''}</h2>
              <label>
                Second device
                <MenuSelect label="Second device" value={licence.second_device_policy || 'hold'} disabled={busy === 'policy'} onChange={(value) => void setPolicy(value === 'refuse' ? 'refuse' : 'hold')} options={[{ value: 'hold', label: 'Hold for a decision' }, { value: 'refuse', label: 'Refuse automatically' }]} />
              </label>
              <button type="button" className="go" disabled={!waiting.length || busy === 'approve'} onClick={() => void approveWaiting()}>
                {busy === 'approve' ? 'Approving…' : waiting.length === 0 ? 'Approve first devices' : waiting.length === pending.length ? `Approve ${waiting.length}` : `Approve ${waiting.length} first ${waiting.length === 1 ? 'device' : 'devices'}`}
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Admission number</th><th>Name</th><th>Class</th><th>Device</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {pending.length === 0 ? <tr><td colSpan={6}>{registrations.length === 0 ? 'No students have registered yet.' : 'No students are waiting.'}</td></tr> : pending.map((row) => {
                  const pupil = rosterByAdmission.get(row.admission_no);
                  const extra = row.request_kind === 'extra';
                  const label = row.status === 'approved' ? (extra ? 'Second device allowed' : 'Approved') : row.status === 'pending' ? (extra ? 'Second device waiting' : 'Waiting') : 'Refused';
                  return (
                    <tr key={row.id}>
                      <td>{row.admission_no}</td>
                      <td>{pupil?.name || '—'}</td>
                      <td>{pupil ? classLabel(pupil.standard, pupil.section) : '—'}</td>
                      <td>{extra ? 'Second' : 'First'}</td>
                      <td><span className={row.status === 'approved' ? 'status on' : row.status === 'pending' ? 'status warn' : 'status off'}>{label}</span></td>
                      <td>
                        {extra && row.status !== 'approved' && (
                          <div className="licence-actions">
                            <button type="button" disabled={busy === row.id} onClick={() => void decideExtra(row, true)}>Allow</button>
                            {row.status === 'pending' && <button type="button" disabled={busy === row.id} onClick={() => void decideExtra(row, false)}>Reject</button>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {refused.length > 0 && (
          <section className="admin-card table-card">
            <div className="card-head"><h2>Refused</h2></div>
            <table className="admin-table">
              <thead>
                <tr><th>Admission number</th><th>Name</th><th>Class</th><th>Device</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {refused.map((row) => {
                  const pupil = rosterByAdmission.get(row.admission_no);
                  const extra = row.request_kind === 'extra';
                  return (
                    <tr key={row.id}>
                      <td>{row.admission_no}</td>
                      <td>{pupil?.name || '—'}</td>
                      <td>{pupil ? classLabel(pupil.standard, pupil.section) : '—'}</td>
                      <td>{extra ? 'Second' : 'First'}</td>
                      <td><span className="status off">Refused</span></td>
                      <td>
                        {extra && (
                          <button type="button" disabled={busy === row.id} onClick={() => void decideExtra(row, true)}>Allow</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          )}

          <div className="admin-filterbar">
            <label>
              Search the roll
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or admission number" />
            </label>
            <label>
              Class
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="all">All classes</option>
                {classes.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>
          </div>
          {!studentControls ? <p className="notice error" role="alert">{SQL_CONTROLS}</p> : null}
          <section className="admin-card table-card">
            <table className="admin-table">
              <thead>
                <tr><th>Admission number</th><th>Name</th><th>Class</th><th>How added</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {visible.length === 0 ? <tr><td colSpan={6}>{roster.length ? 'No students match.' : 'Upload a tracker or add the first student.'}</td></tr> : visible.map((row) => (
                  <tr key={row.admissionNo} className={row.active ? undefined : 'is-off'}>
                    <td>{row.admissionNo}</td>
                    <td>{row.name}{row.active ? null : <span className="status off">Disabled</span>}</td>
                    <td>{classLabel(row.standard, row.section)}</td>
                    <td>{row.source === 'manual' ? 'Added by hand' : 'Tracker'}</td>
                    <td>{approvedAdmissions.has(row.admissionNo) ? <span className="status on">Approved</span> : null}</td>
                    <td>
                      <div className="licence-actions">
                        <button type="button" className="quiet icon-btn" aria-label={row.active ? `Disable ${row.name}` : `Enable ${row.name}`} title={row.active ? 'Disable' : 'Enable'} disabled={!!busy} onClick={() => void setStudentActive(row, !row.active)}>
                          <Icon kind={row.active ? 'lock' : 'check'} />
                        </button>
                        <button type="button" className="quiet icon-btn danger" aria-label={`Delete ${row.name}`} title="Delete" disabled={!!busy} onClick={() => void removeStudent(row)}>
                          <Icon kind="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {history.length > 0 && (
            <section className="admin-card">
              <div className="card-head"><h2>Recent changes</h2></div>
              <ul className="meta">
                {history.map((event) => (
                  <li key={event.id}>{new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.created_at))} · {event.action}{event.detail ? ` · ${event.detail}` : ''}</li>
                ))}
              </ul>
            </section>
          )}
          </div>
          )}

          {desk === 'staff' && (
          <div role="tabpanel" aria-label="Staff">
          <div className="licence-summary">
            <article className="admin-card"><span>Principal</span><strong>{staffCounts.principal}</strong></article>
            <article className="admin-card"><span>HOD</span><strong>{staffCounts.hod}</strong></article>
            <article className="admin-card"><span>Teacher</span><strong>{staffCounts.teacher}</strong></article>
            <article className="admin-card"><span>Tutor</span><strong>{staffCounts.tutor}</strong></article>
          </div>
          <section className="admin-card">
            <div className="card-head">
              <h2>Staff file</h2>
              <div className="licence-actions">
                {incomingStaff ? (
                  <button type="button" className="go" disabled={busy === 'apply-staff'} onClick={() => void applyStaff()}>
                    {busy === 'apply-staff' ? 'Saving…' : 'Save staff list'}
                  </button>
                ) : null}
                <AssignClasses licenceId={licenceId} onSaved={setCoverage} />
              </div>
            </div>
            {!staffReady ? <p className="notice error" role="alert">{SQL_STAFF}</p> : null}
            <label>
              Workbook
              <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void onStaffFile(event.target.files?.[0])} />
            </label>
            {busy === 'read-staff' ? <p className="meta">Reading the workbook…</p> : null}
            {staffPreview ? (
              <div className="roster-preview">
                {staffPreview.errors.length > 0 ? (
                  <ul>
                    {staffPreview.errors.slice(0, 12).map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                ) : <p>{staffPreview.people.length} staff, with email addresses. Click Save staff list. Choosing the file does not store them.</p>}
              </div>
            ) : <p className="meta licence-hint">One worksheet. Row 1 is S. No, Name, Designation, Email, Level. Principal is 4, HOD is 3, Teacher is 2, Tutor is 1. The first password is 123456.</p>}
            {!staffControls ? <p className="notice error" role="alert">{SQL_STAFF_CONTROLS}</p> : null}
            {missingEmails > 0 && !incomingStaff ? <p className="notice error" role="alert">{missingEmails} saved staff have no email. Choose the workbook, then click Save staff list.</p> : null}
            <div className="staff-table-wrap">
            <table className="admin-table staff-table">
              <thead>
                <tr>
                  <th className="col-sno">S. No</th>
                  <th>Name</th>
                  <th className="col-post">Designation</th>
                  <th>Email</th>
                  <th className="col-classes">Classes</th>
                  <th className="col-level">Level</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {incomingStaff ? incomingStaff.map((person, index) => (
                  <tr key={`${person.email}-${index}`}>
                    <td className="col-sno">{index + 1}</td>
                    <td>{person.name}</td>
                    <td className="col-post">{STAFF_LABEL[person.designation]}</td>
                    <td>{person.email}</td>
                    <td className="col-classes">{person.designation === 'principal' ? 'Whole school' : '—'}</td>
                    <td className="col-level">{person.level}</td>
                    <td className="col-actions"></td>
                  </tr>
                )) : staff.length === 0 ? <tr><td colSpan={7}>No staff have been uploaded.</td></tr> : staff.map((person, index) => {
                  const saved = person;
                  const editing = !!(saved && staffEdit?.id === saved.id);
                  return (
                    <tr key={saved?.id || `${person.email}-${index}`} className={[saved && !saved.active ? 'is-off' : '', editing ? 'is-editing' : ''].filter(Boolean).join(' ') || undefined}>
                      <td className="col-sno">{index + 1}</td>
                      <td>
                        {editing && staffEdit ? (
                          <input className="cell-input" required value={staffEdit.name} onChange={(event) => setStaffEdit({ ...staffEdit, name: event.target.value })} />
                        ) : person.name}
                        {saved && !saved.active ? <span className="status off">Disabled</span> : null}
                      </td>
                      <td className="col-post">
                        {editing && staffEdit ? (
                          <MenuSelect label="Designation" value={staffEdit.designation} disabled={busy === 'edit-staff'} onChange={(value) => setStaffEdit({ ...staffEdit, designation: value as StaffDesignation })} options={[
                            { value: 'principal', label: 'Principal' },
                            { value: 'hod', label: 'HOD' },
                            { value: 'teacher', label: 'Teacher' },
                            { value: 'tutor', label: 'Tutor' },
                          ]} />
                        ) : STAFF_LABEL[person.designation]}
                      </td>
                      <td>
                        {editing && staffEdit ? (
                          <input className="cell-input" required type="email" value={staffEdit.email} onChange={(event) => setStaffEdit({ ...staffEdit, email: event.target.value })} />
                        ) : (person.email || '—')}
                      </td>
                      <td className="col-classes">{person.designation === 'principal' ? 'Whole school' : (saved ? (coverage[saved.id] || '—') : '—')}</td>
                      <td className="col-level">{editing && staffEdit ? STAFF_LEVEL[staffEdit.designation] : person.level}</td>
                      <td className="col-actions">
                        {saved && editing ? (
                          <div className="licence-actions">
                            <button type="button" className="quiet icon-btn" aria-label={`Save ${person.name}`} title="Save" disabled={!!busy} onClick={() => void saveStaffEdit()}>
                              <Icon kind="check" />
                            </button>
                            <button type="button" className="quiet icon-btn" aria-label="Cancel" title="Cancel" disabled={busy === 'edit-staff'} onClick={() => setStaffEdit(null)}>
                              <Icon kind="close" />
                            </button>
                          </div>
                        ) : saved ? (
                          <div className="licence-actions">
                            <button type="button" className="quiet icon-btn" aria-label={`Edit ${person.name}`} title="Edit" disabled={!!busy} onClick={() => setStaffEdit({ id: saved.id, name: person.name, designation: person.designation, email: person.email })}>
                              <Icon kind="pen" />
                            </button>
                            <button type="button" className={saved.active ? 'access-dot is-on' : 'access-dot is-off'} aria-label={saved.active ? `Disable ${person.name}` : `Enable ${person.name}`} title={saved.active ? 'Disable access' : 'Enable access'} disabled={!!busy} onClick={() => void setStaffActive(saved, !saved.active)}>
                              <span />
                            </button>
                            <button type="button" className="quiet icon-btn" aria-label={busy === `reset-${saved.id}` ? `Resetting password for ${person.name}` : `Reset password for ${person.name}`} title="Reset password" disabled={!!busy || !saved.email} onClick={() => void resetStaffPassword(saved)}>
                              <Icon kind="key" />
                            </button>
                            <button type="button" className="quiet icon-btn danger" aria-label={`Delete ${person.name}`} title="Delete" disabled={!!busy} onClick={() => void removeStaff(saved)}>
                              <Icon kind="trash" />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </section>
          </div>
          )}
        </>
      )}
    </>
  );
}
