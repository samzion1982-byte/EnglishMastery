'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '@/lib/access';
import { Icon } from '@/components/icon';
import { MenuSelect } from '@/components/menu-select';
import { useNotice } from '@/components/use-notice';
import { fetchAll } from '@/lib/fetch-all';
import { errorText } from '@/lib/error-text';
import { createBrowserSupabase } from '@/lib/supabase';
import { normalizeSchoolCode, parseAcademicYear, registrationLink, suggestAcademicYear } from '@/lib/school-tracker';

type Kind = 'school' | 'individual';
type Status = 'active' | 'suspended';
type Policy = 'hold' | 'refuse';

type Licence = {
  id: string;
  kind: Kind;
  name: string;
  contact_email: string | null;
  login_email: string | null;
  licence_key: string | null;
  csv_validity_error?: string;
  address: string | null;
  phone: string | null;
  seats: number;
  device_limit: number;
  valid_from: string;
  valid_until: string | null;
  status: Status;
  accepting_devices: boolean;
  school_code: string | null;
  second_device_policy: Policy;
  academic_year: string | null;
};

type Draft = {
  name: string;
  email: string;
  loginEmail: string;
  authCode: string;
  address: string;
  phone: string;
  seats: string;
  deviceLimit: string;
  schoolCode: string;
  valid_from: string;
  valid_until: string;
  status: Status;
  accepting: boolean;
  policy: Policy;
  academicYear: string;
};

type FormMode = { mode: 'create' } | { mode: 'edit'; id: string };

const COPY: Record<Kind, { singular: string; plural: string; name: string; seats: string }> = {
  school: { singular: 'school', plural: 'Schools', name: 'School name', seats: '0' },
  individual: { singular: 'individual', plural: 'Individuals', name: 'Holder name', seats: '1' },
};

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function emptyDraft(kind: Kind): Draft {
  return {
    name: '',
    email: '',
    loginEmail: '',
    authCode: '',
    address: '',
    phone: '',
    seats: COPY[kind].seats,
    deviceLimit: '1',
    schoolCode: '',
    valid_from: indiaToday(),
    valid_until: '',
    status: 'active',
    accepting: true,
    policy: 'hold',
    academicYear: kind === 'school' ? suggestAcademicYear() : '',
  };
}

function draftFrom(row: Licence): Draft {
  return {
    name: row.name,
    email: row.contact_email || '',
    loginEmail: row.login_email || row.contact_email || '',
    authCode: row.licence_key || '',
    address: row.address || '',
    phone: row.phone || '',
    seats: String(row.seats),
    deviceLimit: String(row.device_limit || 1),
    schoolCode: row.school_code || '',
    valid_from: row.valid_from,
    valid_until: row.valid_until || '',
    status: row.status,
    accepting: row.accepting_devices,
    policy: row.second_device_policy || 'hold',
    academicYear: row.academic_year || (row.kind === 'school' ? suggestAcademicYear() : ''),
  };
}

function showDate(value: string | null) {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return day && month && year ? `${day}-${month}-${year}` : value;
}

function standing(row: Licence, today: string) {
  if (row.status === 'suspended') return { label: 'Suspended', className: 'status off' };
  if (row.csv_validity_error) return { label: 'Validity unavailable', className: 'status warn' };
  if (row.valid_until && row.valid_until < today) return { label: 'Ended', className: 'status warn' };
  if (row.valid_from > today) return { label: 'Starts later', className: 'status warn' };
  return { label: 'Active', className: 'status on' };
}

function inForce(row: Licence, today: string) {
  return !row.csv_validity_error && row.status === 'active' && row.valid_from <= today && (!row.valid_until || row.valid_until >= today);
}

export function LicencesManager() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});
  const [accountRole, setAccountRole] = useState('student');
  const [createLearner, setCreateLearner] = useState(true);
  const [kind, setKind] = useState<Kind>('school');
  const [rows, setRows] = useState<Licence[]>([]);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft('school'));
  const [form, setForm] = useState<FormMode | null>(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice, noticeTone] = useNotice('A school\'s student count comes from its tracker. Individuals have a configurable number of allowed devices.');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [yearField, setYearField] = useState(true);
  const [contactFields, setContactFields] = useState(true);
  const [formError, setFormError] = useState('');
  const [learners, setLearners] = useState<{ id: string; email: string; name: string }[]>([]);
  const [learnerEmail, setLearnerEmail] = useState('');
  const [events, setEvents] = useState<{ id: string; action: string; detail: string; created_at: string }[]>([]);
  const [deleteSchool, setDeleteSchool] = useState<Licence | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const dialogRef = useRef<HTMLElement>(null);
  const baselineRef = useRef('');
  const draftRef = useRef(draft);
  const returnFocus = useRef<HTMLElement | null>(null);
  draftRef.current = draft;
  const today = indiaToday();
  const copy = COPY[kind];
  const editing = form?.mode === 'edit' ? rows.find((row) => row.id === form.id) || null : null;

  async function load() {
    setLoading(true);
    setLoadError('');
    const page = <T,>(query: unknown) => query as PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
    const wide = 'login_email, licence_key, device_limit, id, kind, name, contact_email, address, phone, seats, valid_from, valid_until, status, accepting_devices, school_code, second_device_policy, academic_year';
    const wideNoContact = 'login_email, licence_key, device_limit, id, kind, name, contact_email, seats, valid_from, valid_until, status, accepting_devices, school_code, second_device_policy, academic_year';
    const narrow = 'login_email, licence_key, device_limit, id, kind, name, contact_email, seats, valid_from, valid_until, status, accepting_devices, school_code, second_device_policy';
    let result = await fetchAll<Licence>((from, to) => page(supabase.from('em_licences').select(wide).order('name').order('id').range(from, to)));
    if (result.error && /address|phone/i.test(result.error.message)) {
      setContactFields(false);
      result = await fetchAll<Licence>((from, to) => page(supabase.from('em_licences').select(wideNoContact).order('name').order('id').range(from, to)));
    } else if (!result.error) {
      setContactFields(true);
    }
    if (result.error && /academic_year/i.test(result.error.message)) {
      setYearField(false);
      result = await fetchAll<Licence>((from, to) => page(supabase.from('em_licences').select(narrow).order('name').order('id').range(from, to)));
    } else if (!result.error) {
      setYearField(true);
    }
    if (result.error) {
      const missingTable = /em_licences/i.test(result.error.message) && !/school_code/i.test(result.error.message);
      const missingRoster = /school_code|em_roster|schema cache|does not exist/i.test(result.error.message);
      setLoadError(/login_email/i.test(result.error.message) ? 'Run supabase/migrations/20261003190000_admin_assigned_purchases.sql, then retry.' : /device_limit/i.test(result.error.message) ? 'Run supabase/migrations/20261003180000_individual_device_limits.sql, then retry.' : /licence_key/i.test(result.error.message) ? 'Run supabase/migrations/20261003120000_individual_accounts.sql, then retry.' : missingTable
        ? 'Run supabase/migrations/20260926130000_licences.sql in the Supabase SQL editor, then retry.'
        : missingRoster
          ? 'Run supabase/migrations/20260926140000_school_roster.sql in the Supabase SQL editor, then retry.'
          : result.error.message);
    } else {
      let dates: Record<string, { date: string | null; error?: string }> = {};
      let issue = '';
      try {
        const response = await fetch('/api/admin/licence-validity', { cache: 'no-store' });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'CSV validity unavailable.');
        dates = body.dates;
      } catch (err) { issue = errorText(err, 'CSV validity unavailable.'); }
      setRows(result.data.map((row) => ({
        ...row,
        valid_from: String(row.valid_from).slice(0, 10),
        valid_until: row.kind === 'individual' ? dates[(row.licence_key || '').trim().toUpperCase()]?.date || null : row.valid_until ? String(row.valid_until).slice(0, 10) : null,
        csv_validity_error: row.kind === 'individual' ? issue || dates[(row.licence_key || '').trim().toUpperCase()]?.error || (!dates[(row.licence_key || '').trim().toUpperCase()] ? 'Auth Code not assigned in CSV' : undefined) : undefined,
        academic_year: row.academic_year || null,
        address: row.address || null,
        phone: row.phone || null,
        second_device_policy: row.second_device_policy || 'hold',
        accepting_devices: row.accepting_devices !== false,
      })));
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setVisiblePasswords({});
    if (form?.mode !== 'edit') {
      setLearners([]);
      setEvents([]);
      return;
    }
    let alive = true;
    const licenceId = form.id;
    void (async () => {
      const eventsResult = await supabase.from('em_licence_events').select('id, action, detail, created_at').eq('licence_id', licenceId).order('created_at', { ascending: false }).limit(8);
      if (alive) setEvents(eventsResult.error ? [] : (eventsResult.data || []) as { id: string; action: string; detail: string; created_at: string }[]);
      if (kind !== 'individual') {
        if (alive) setLearners([]);
        return;
      }
      const members = await supabase.from('em_individual_members').select('user_id').eq('licence_id', licenceId);
      if (!alive) return;
      if (members.error || !members.data?.length) {
        setLearners([]);
        return;
      }
      const ids = members.data.map((row) => row.user_id as string);
      const profiles = await supabase.from('profiles').select('id, email, display_name').in('id', ids);
      if (!alive) return;
      const byId = new Map((profiles.data || []).map((row) => [row.id as string, row]));
      setLearners(ids.map((id) => ({ id, email: String(byId.get(id)?.email || ''), name: String(byId.get(id)?.display_name || '') })));
    })();
    return () => { alive = false; };
  }, [form, kind, supabase]);

  function dirty() {
    return JSON.stringify(draftRef.current) !== baselineRef.current;
  }

  function finishClose() {
    const back = returnFocus.current;
    setForm(null);
    setFormError('');
    window.setTimeout(() => back?.focus(), 0);
  }

  function requestClose() {
    if (dirty() && !window.confirm('Close without saving these changes?')) return;
    finishClose();
  }

  useEffect(() => {
    if (!form) return;
    const dialog = dialogRef.current;
    const field = dialog?.querySelector<HTMLElement>('#licence-name');
    field?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [form]);

  function trapFocus(event: React.KeyboardEvent) {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')]
      .filter((item) => !item.hasAttribute('disabled') && item.tabIndex !== -1);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function remember(next: Draft) {
    baselineRef.current = JSON.stringify(next);
    setDraft(next);
    setFormError('');
  }

  function switchKind(next: Kind) {
    setKind(next);
    setForm(null);
    setFormError('');
    setDraft(emptyDraft(next));
    setQuery('');
  }

  function openCreate() {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    remember(emptyDraft(kind));
    setForm({ mode: 'create' });
  }

  function openEdit(row: Licence) {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    remember(draftFrom(row));
    setForm({ mode: 'edit', id: row.id });
  }

  const visible = rows.filter((row) => row.kind === kind && (!query || [row.name, row.contact_email, row.address, row.phone, row.school_code].some((value) => value?.toLowerCase().includes(query.toLowerCase()))));
  const schools = rows.filter((row) => row.kind === 'school');
  const individuals = rows.filter((row) => row.kind === 'individual');
  const schoolSeats = schools.filter((row) => inForce(row, today)).reduce((sum, row) => sum + row.seats, 0);

  function readDraft() {
    const name = draft.name.trim();
    const email = draft.email.trim();
    const address = draft.address.trim();
    const phone = draft.phone.trim();
    const year = draft.academicYear.trim();
    if (!name) return { error: 'Enter a name.' };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: kind === 'school' ? 'Enter a valid email id, or leave it blank.' : 'Enter a valid contact email, or leave it blank.' };
    if (kind === 'school' && address.length > 200) return { error: 'The address can be at most 200 characters.' };
    if (kind === 'school' && phone && (phone.length < 6 || phone.length > 20 || !/^[\d+\-().\s]+$/.test(phone))) return { error: 'Enter a phone number, or leave it blank.' };
    if (!draft.valid_from) return { error: 'Choose the date the licence starts.' };
    if (kind === 'school' && draft.valid_until && draft.valid_until < draft.valid_from) return { error: 'The end date must be on or after the start date.' };
    const academicYear = year ? parseAcademicYear(year) : null;
    if (kind === 'school' && yearField && !academicYear) return { error: 'Enter the academic year as 2026-27.' };
    if (kind === 'school') {
      const schoolCode = normalizeSchoolCode(draft.schoolCode);
      if (!schoolCode) return { error: 'Enter a school id.' };
      return {
        value: {
          name,
          email,
          address,
          phone,
          schoolCode,
          seats: editing?.seats ?? 0,
          academicYear,
        },
      };
    }
    const devices = Number(draft.deviceLimit);
    if (!Number.isInteger(devices) || devices < 1 || devices > 10) return { error: 'Number of devices must be a whole number from 1 to 10.' };
    const seats = editing?.seats || 1;
    return { value: { name, email, address: '', phone: '', schoolCode: null as string | null, seats, academicYear } };
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = readDraft();
    if ('error' in parsed && parsed.error) {
      setFormError(parsed.error);
      return;
    }
    if (!('value' in parsed) || !parsed.value) return;
    const { name, email, address, phone, schoolCode, seats, academicYear } = parsed.value;
    const payload: {
      name: string;
      contact_email: string | null;
      address?: string | null;
      phone?: string | null;
      valid_from: string;
      valid_until: string | null;
      status: Status;
      accepting_devices: boolean;
      school_code: string | null;
      second_device_policy: Policy;
      seats?: number;
      device_limit?: number;
      academic_year?: string | null;
    } = {
      name,
      contact_email: email || null,
      valid_from: draft.valid_from,
      valid_until: draft.valid_until || null,
      status: draft.status,
      accepting_devices: draft.accepting,
      school_code: schoolCode,
      second_device_policy: draft.policy,
    };
    if (kind === 'individual') { payload.seats = seats; payload.device_limit = Number(draft.deviceLimit); delete (payload as { valid_until?: string | null }).valid_until; }
    else if (form?.mode === 'create') payload.seats = 0;
    if (yearField && kind === 'school') payload.academic_year = academicYear;
    if (contactFields && kind === 'school') {
      payload.address = address || null;
      payload.phone = phone || null;
    } else if (kind === 'school' && (address || phone)) {
      setFormError('Run supabase/migrations/20260926310000_school_contact.sql in the Supabase SQL editor, then save again.');
      return;
    }
    setBusy(true);
    setFormError('');
    setNotice('');
    try {
      if (kind === 'individual') {
        const response = await fetch('/api/admin/individual-purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ details: { ...payload, id: form?.mode === 'edit' ? form.id : undefined, login_email: draft.loginEmail.trim().toLowerCase() || email, auth_code: draft.authCode.trim() }, role: accountRole }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not save purchase.');
        setNotice(result.existingUser ? `${name} purchase saved. Existing login password and access level are retained.` : `${name} purchase and login created. First password: 123456.`, 'success');
        finishClose();
      } else if (form?.mode === 'edit') {
        const { data, error } = await supabase.from('em_licences').update(payload).eq('id', form.id).select('id, name, school_code').maybeSingle();
        if (error) throw error;
        if (!data || (kind === 'school' && (data.school_code || '').toUpperCase() !== (schoolCode || '').toUpperCase())) {
          setFormError('The school id was not saved.');
          return;
        }
        setNotice(`${name} saved.`, 'success');
        finishClose();
      } else {
        const { error } = await supabase.from('em_licences').insert({ ...payload, kind });
        if (error) throw error;
        setNotice(`${name} added.`, 'success');
        setDraft(emptyDraft(kind));
        finishClose();
      }
      await load();
    } catch (err) {
      const text = errorText(err, 'Could not save the licence.');
      setFormError(/device_limit/i.test(text) ? 'Run supabase/migrations/20261003180000_individual_device_limits.sql, then retry.' : /create_individual_account|provision_individual_learner|reset_individual_access|licence_key/i.test(text)
        ? 'Run supabase/migrations/20261003120000_individual_accounts.sql, then retry.'
        : /duplicate|school_code/i.test(text)
        ? 'That school id is already in use.'
        : /academic_year/i.test(text)
          ? 'Run supabase/migrations/20260926180000_school_year_and_open.sql in the Supabase SQL editor, then save again.'
          : /address|phone/i.test(text)
          ? 'Run supabase/migrations/20260926310000_school_contact.sql in the Supabase SQL editor, then save again.'
          : /seats_check|schema cache/i.test(text)
            ? 'Run supabase/migrations/20260926140000_school_roster.sql in the Supabase SQL editor, then try again.'
            : text);
    } finally {
      setBusy(false);
    }
  }

  async function removeLicence(row: Licence) {
    if (busy) return;
    if (row.kind === 'school') {
      setDeleteSchool(row);
      setMasterPassword('');
      setDeleteError('');
      return;
    }
    if (!window.confirm(`Delete the licence for ${row.name}? The login and learning history are retained. Recreating an individual with the same email restores access with password 123456.`)) return;
    setBusy(true);
    try {
      const removed = await supabase.from('em_licences').delete().eq('id', row.id).select('id');
      if (removed.error) throw removed.error;
      if (!removed.data?.length) throw new Error('The licence was not deleted.');
      setRows((all) => all.filter((item) => item.id !== row.id));
      setForm(null);
      setNotice(`${row.name} licence deleted. The unassigned login is retained for recreation.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Not deleted.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmSchoolDelete(event: React.FormEvent) {
    event.preventDefault();
    const row = deleteSchool;
    if (!row || busy) return;
    setBusy(true);
    setDeleteError('');
    try {
      const rpc = await supabase.rpc('delete_school', { p_licence_id: row.id, p_password: masterPassword });
      if (rpc.error) {
        if (/master password/i.test(rpc.error.message)) {
          setDeleteError('Master password is not correct.');
          return;
        }
        if (/delete_school|schema cache|p_password/i.test(rpc.error.message)) {
          setDeleteError('Run supabase/migrations/20260926280000_access_levels.sql in the Supabase SQL editor, then delete the school again.');
          return;
        }
        throw rpc.error;
      }
      setRows((all) => all.filter((item) => item.id !== row.id));
      setForm(null);
      setDeleteSchool(null);
      setMasterPassword('');
      setNotice(`${row.name} licence deleted. The unassigned login is retained for recreation.`, 'success');
    } catch (err) {
      setDeleteError(errorText(err, 'Not deleted.'));
    } finally {
      setBusy(false);
    }
  }

  async function viewPassword(userId: string) {
    if (visiblePasswords[userId]) { setVisiblePasswords((current) => { const next = { ...current }; delete next[userId]; return next; }); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('view_individual_password', { p_user_id: userId });
      if (error) throw error;
      if (!data) { setFormError('This password predates recovery storage or was changed outside the app. Reset it to make it viewable.'); return; }
      setVisiblePasswords((current) => ({ ...current, [userId]: String(data) }));
    } catch (err) { setFormError(errorText(err, 'Could not view password.')); }
    finally { setBusy(false); }
  }

  async function resetIndividual(userId: string, device: boolean) {
    if (form?.mode !== 'edit' || busy) return;
    if (!window.confirm(device ? 'Allow this learner to register a new computer?' : 'Reset this learner to 123456 and require a password change?')) return;
    setBusy(true);
    setVisiblePasswords({});
    try {
      const { error } = await supabase.rpc('reset_individual_access', { p_licence_id: form.id, p_user_id: userId, p_device: device });
      if (error) throw error;
      setNotice(device ? 'Device reset. Sign in with the licence key on the new computer.' : 'Password reset to 123456. The learner must change it at sign-in.', 'success');
    } catch (err) { setFormError(errorText(err, 'Could not reset access.')); }
    finally { setBusy(false); }
  }

  async function addLearner(event: React.FormEvent) {
    event.preventDefault();
    if (form?.mode !== 'edit' || busy) return;
    const email = learnerEmail.trim().toLowerCase();
    if (!email) {
      setFormError('Enter the learner email.');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const { error } = createLearner
        ? await supabase.rpc('provision_individual_learner', { p_licence_id: form.id, p_email: email, p_name: email.split('@')[0], p_role: accountRole })
        : await supabase.rpc('assign_individual_learner', { p_licence_id: form.id, p_email: email });
      if (error) {
        if (/assign_individual_learner|schema cache/i.test(error.message)) {
          setFormError('Run supabase/migrations/20260926250000_licence_followup.sql in the Supabase SQL editor, then assign the learner again.');
          return;
        }
        throw error;
      }
      setLearnerEmail('');
      setNotice(`${email} is on this licence.${createLearner ? ' First password: 123456.' : ''}`, 'success');
      const members = await supabase.from('em_individual_members').select('user_id').eq('licence_id', form.id);
      const ids = (members.data || []).map((row) => row.user_id as string);
      const profiles = ids.length ? await supabase.from('profiles').select('id, email, display_name').in('id', ids) : { data: [] };
      const byId = new Map((profiles.data || []).map((row) => [row.id as string, row]));
      setLearners(ids.map((id) => ({ id, email: String(byId.get(id)?.email || ''), name: String(byId.get(id)?.display_name || '') })));
    } catch (err) {
      setFormError(errorText(err, 'Could not assign that learner.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeLearner(userId: string) {
    if (form?.mode !== 'edit' || busy) return;
    setBusy(true);
    setFormError('');
    try {
      const { error } = await supabase.rpc('remove_individual_learner', { p_licence_id: form.id, p_user_id: userId });
      if (error) throw error;
      setLearners((all) => all.filter((item) => item.id !== userId));
    } catch (err) {
      setFormError(errorText(err, 'Could not remove that learner.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <p className="admin-kicker">Distribution</p>
          <h1>Licences</h1>
          <p className={`admin-note ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p>
        </div>
      </header>

      <div className="licence-summary">
        <article className="admin-card">
          <span>Schools</span>
          <strong>{loading ? '—' : schools.length}</strong>
        </article>
        <article className="admin-card">
          <span>School seats in force</span>
          <strong>{loading ? '—' : schoolSeats}</strong>
        </article>
        <article className="admin-card">
          <span>Individuals</span>
          <strong>{loading ? '—' : individuals.length}</strong>
        </article>
        <article className="admin-card">
          <span>Active individuals</span>
          <strong>{loading ? '—' : individuals.filter((row) => inForce(row, today)).length}</strong>
        </article>
      </div>

      <div className="licence-tabs" role="tablist" aria-label="Licence type">
        {(['school', 'individual'] as const).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={kind === item} onClick={() => switchKind(item)}>
            {COPY[item].plural}
          </button>
        ))}
      </div>

      {form && (
        <div className="licence-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
        <section ref={dialogRef} className="admin-card licence-modal" role="dialog" aria-modal="true" aria-labelledby="licence-form-title" onKeyDown={trapFocus}>
          <button type="button" className="quiet icon-btn modal-x" aria-label="Close" onClick={requestClose}><Icon kind="close" /></button>
          <div className="card-head">
            <h2 id="licence-form-title">{form.mode === 'create' ? `New ${copy.singular}` : editing?.name || copy.name}</h2>
          </div>
          <form className="licence-editor" onSubmit={submit}>
            <label>
              {copy.name}
              <input id="licence-name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </label>
            {kind === 'school' ? (
              <label>
                School id
                <input required spellCheck={false} value={draft.schoolCode} onChange={(event) => setDraft({ ...draft, schoolCode: event.target.value.toUpperCase() })} />
              </label>
            ) : (
              <label>
                Number of devices
                <input required type="number" min={1} max={10} inputMode="numeric" value={draft.deviceLimit} onChange={(event) => setDraft({ ...draft, deviceLimit: event.target.value })} />
                <small>Allowed computers per individual when TrustGate is enabled.</small>
              </label>
            )}
            {kind === 'school' ? (
              <label className="span-2">
                Address
                <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
              </label>
            ) : null}
            {kind === 'school' ? (
              <label>
                Phone number
                <input type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
              </label>
            ) : null}
            <label>
              {kind === 'school' ? 'Email id' : 'Purchaser email (CSV)'}
              <input type="email" autoComplete="email" required={kind === 'individual'} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            </label>
            {kind === 'individual' && <>
              <label>Login / student email<input type="email" value={draft.loginEmail} placeholder="Leave empty to use purchaser email" onChange={(event) => setDraft({ ...draft, loginEmail: event.target.value })} /><small>Use the purchaser email or a different learner email. Existing logins keep their password and role.</small></label>
              <label className="span-2">Auth Code (from CSV)<input required autoComplete="off" value={draft.authCode} onChange={(event) => setDraft({ ...draft, authCode: event.target.value })} placeholder="Paste the tracker licence key" /></label>
            </>}
            {kind === 'individual' && form.mode === 'create' && (<label>Access level<select value={accountRole} onChange={(event) => setAccountRole(event.target.value)}>{ASSIGNABLE_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></label>)}
            {kind === 'school' && yearField && (
              <label className="span-2">
                Academic year
                <input className="year-input" spellCheck={false} value={draft.academicYear} onChange={(event) => setDraft({ ...draft, academicYear: event.target.value })} />
              </label>
            )}
            {kind === 'school' && (
              <div className="licence-date-row span-2">
                <label>
                  Starts
                  <input required type="date" value={draft.valid_from} onChange={(event) => setDraft({ ...draft, valid_from: event.target.value })} />
                </label>
                <label>
                  Ends
                  <input type="date" value={draft.valid_until} onChange={(event) => setDraft({ ...draft, valid_until: event.target.value })} />
                </label>
              </div>
            )}
            <label>
              Standing
              <MenuSelect label="Standing" value={draft.status} onChange={(value) => setDraft({ ...draft, status: value === 'suspended' ? 'suspended' : 'active' })} options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
            </label>
            {kind === 'school' && (
              <label>
                Registrations
                <MenuSelect label="Registrations" value={draft.accepting ? 'open' : 'blocked'} onChange={(value) => setDraft({ ...draft, accepting: value === 'open' })} options={[{ value: 'open', label: 'Open' }, { value: 'blocked', label: 'Blocked' }]} />
              </label>
            )}
            {kind === 'school' && (
              <label>
                Second device
                <MenuSelect label="Second device" value={draft.policy} onChange={(value) => setDraft({ ...draft, policy: value === 'refuse' ? 'refuse' : 'hold' })} options={[{ value: 'hold', label: 'Hold for a decision' }, { value: 'refuse', label: 'Refuse automatically' }]} />
              </label>
            )}
            <div className="licence-actions span-2">
              <button className="go" type="submit" disabled={busy || !!loadError}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
            {formError ? <p className="notice error span-2" role="alert">{formError}</p> : null}
          </form>
          <p className="meta licence-hint">{kind === 'school' ? 'The student count comes from the tracker. Leave the end date empty when the licence has no fixed end.' : 'Assign the CSV Auth Code here. New logins start with 123456 and must change it; existing logins retain their credentials and role. Users are not asked to enter the key.'}</p>
          {form.mode === 'edit' && kind === 'individual' && (
            <div className="licence-editor">
              <p className="meta span-2">The purchaser email and Auth Code are checked against the CSV. The mapped login uses its own credentials.</p>
              {learners.length > 0 && (
                <ul className="meta span-2 individual-learner-list">
                  {learners.map((learner) => (
                    <li key={learner.id} className="individual-learner-card">
                      <div className="individual-learner-details"><strong>{learner.name || learner.email}</strong><span>{learner.email}</span></div>
                      <div className="individual-learner-actions" role="group" aria-label={`Actions for ${learner.name || learner.email}`}>
                        <button type="button" className="quiet" disabled={busy} onClick={() => void viewPassword(learner.id)}>{visiblePasswords[learner.id] ? 'Hide password' : 'View password'}</button>
                        <button type="button" className="quiet" disabled={busy} onClick={() => void resetIndividual(learner.id, false)}>Reset password</button>
                        <button type="button" className="quiet" disabled={busy} onClick={() => void resetIndividual(learner.id, true)}>Reset devices</button>
                        <button type="button" className="quiet danger" disabled={busy} onClick={() => void removeLearner(learner.id)}>Remove</button>
                      </div>
                      {visiblePasswords[learner.id] && <p className="individual-learner-password">Password: {visiblePasswords[learner.id]}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {form.mode === 'edit' && events.length > 0 && (
            <ul className="meta">
              {events.map((event) => (
                <li key={event.id}>{new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.created_at))} · {event.action}{event.detail ? ` · ${event.detail}` : ''}</li>
              ))}
            </ul>
          )}
        </section>
        </div>
      )}

      {deleteSchool && (
        <div className="licence-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDeleteSchool(null); }}>
          <section className="admin-card licence-modal" role="dialog" aria-modal="true" aria-labelledby="delete-school-title">
            <button type="button" className="quiet icon-btn modal-x" aria-label="Close" disabled={busy} onClick={() => setDeleteSchool(null)}><Icon kind="close" /></button>
            <div className="card-head">
              <h2 id="delete-school-title">Delete {deleteSchool.name}</h2>
            </div>
            <p className="meta licence-hint">This removes the registration link, class list, student sign-ins, and staff sign-ins. Enter the master password to continue.</p>
            <form className="licence-editor" onSubmit={(event) => void confirmSchoolDelete(event)}>
              <label className="span-2">
                Master password
                <input type="password" autoFocus autoComplete="off" required value={masterPassword} onChange={(event) => setMasterPassword(event.target.value)} />
              </label>
              {deleteError ? <p className="notice error span-2" role="alert">{deleteError}</p> : null}
              <div className="licence-actions span-2">
                <button type="button" disabled={busy} onClick={() => setDeleteSchool(null)}>Cancel</button>
                <button className="danger" type="submit" disabled={busy || !masterPassword}>{busy ? 'Deleting…' : 'Delete school'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="admin-filterbar">
        <label>
          Search {copy.plural.toLowerCase()}
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === 'school' ? 'Name or school id' : 'Name or email'} />
        </label>
        <button type="button" className="go" onClick={openCreate}>Add {copy.singular}</button>
        {kind === 'individual' && <button type="button" disabled={loading || busy} onClick={() => void load()}>Refresh CSV validity</button>}
      </div>

      {loadError && (
        <p className="notice error" role="alert">
          Could not load licences. {loadError} <button type="button" onClick={() => void load()}>Retry</button>
        </p>
      )}

      <section className="admin-card table-card" aria-busy={loading}>
        <table className="admin-table">
          <thead>
            <tr>
              {kind === 'school' && <th>School id</th>}
              <th>{copy.name}</th>
              <th>{kind === 'school' ? 'Students' : 'Devices'}</th>
              <th>Valid until</th>
              <th>Standing</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={kind === 'school' ? 6 : 5}>Loading licences…</td></tr> : null}
            {!loading && !loadError && visible.length === 0 ? (
              <tr><td colSpan={kind === 'school' ? 6 : 5}>{rows.some((row) => row.kind === kind) ? 'No licences match this search.' : `No ${copy.plural.toLowerCase()} yet.`}</td></tr>
            ) : null}
            {!loading && visible.map((row) => {
              const state = standing(row, today);
              return (
                <tr key={row.id}>
                  {kind === 'school' && (
                    <td><Link className="row-link" href={`/admin/licences/${row.id}`}>{row.school_code || '—'}</Link></td>
                  )}
                  <td>
                    {kind === 'school' ? (
                      <Link className="row-link" href={`/admin/licences/${row.id}`}>{row.name}</Link>
                    ) : (
                      <button type="button" className="row-link" onClick={() => openEdit(row)}>{row.name}</button>
                    )}
                  </td>
                  <td>{kind === 'individual' ? row.device_limit : row.seats}</td>
                  <td>{row.kind === 'individual' && row.csv_validity_error ? row.csv_validity_error : showDate(row.valid_until)}</td>
                  <td><span className={state.className}>{state.label}</span>{kind === 'individual' && <small className="licence-validity">Licence Valid upto : {row.valid_until ? showDate(row.valid_until) : 'Unavailable'}</small>}</td>
                  <td>
                    <div className="licence-actions">
                      {kind === 'school' && row.school_code && (
                        <button type="button" className="quiet icon-btn" aria-label={`Copy link for ${row.name}`} title="Copy link" onClick={() => void navigator.clipboard.writeText(registrationLink(row.school_code || '')).then(() => setNotice('Registration link copied.', 'success')).catch(() => setNotice(registrationLink(row.school_code || '')))}><Icon kind="copy" /></button>
                      )}
                      <button type="button" className="quiet icon-btn" aria-label={`Edit ${row.name}`} title="Edit" onClick={() => openEdit(row)}><Icon kind="pen" /></button>
                      <button type="button" className="quiet icon-btn danger" aria-label={`Delete ${row.name}`} title="Delete" disabled={busy} onClick={() => void removeLicence(row)}><Icon kind="trash" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
