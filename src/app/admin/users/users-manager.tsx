'use client';
import { PrincipalStaff } from '../staff/principal-staff';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Icon } from '@/components/icon';
import { AssignClasses, loadCoverageLabels } from '@/components/assign-classes';
import { Pagination } from '@/components/pagination';
import { useNotice } from '@/components/use-notice';
import { ADMIN_STAFF_ROLES, ASSIGNABLE_ROLES, ROLE_LABELS, STUDENT_DEFAULT_PASSWORD } from '@/lib/access';
import { errorText } from '@/lib/error-text';
import { fetchAll } from '@/lib/fetch-all';
import { STAFF_LABEL, STAFF_LEVEL, type StaffDesignation } from '@/lib/school-tracker';
import { createBrowserSupabase } from '@/lib/supabase';

type Kind = 'school' | 'individual';

type School = {
  id: string;
  name: string;
  code: string | null;
};

type LicenceRow = {
  id: string;
  name: string;
  school_code: string | null;
};

type Staff = {
  id: string;
  name: string;
  email: string;
  designation: string;
  active: boolean;
  schoolId: string;
  schoolName: string;
  schoolCode: string | null;
  sortNo: number;
};

type ConsoleRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  nickname: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
};

type StaffRecord = {
  id: string;
  licence_id: string;
  staff_name: string;
  designation: string;
  email: string | null;
  sort_no: number;
  active?: boolean;
};

const CONSOLE_ROLES = ASSIGNABLE_ROLES.filter((role) => role !== 'student');
const emptyForm = { name: '', email: '', role: 'admin1' };
const emptyStaff = { name: '', email: '', designation: 'teacher' as StaffDesignation };
const POSTS: StaffDesignation[] = ['principal', 'hod', 'teacher', 'tutor'];
const SQL_ADD = 'Run supabase/migrations/20260926270000_add_school_staff.sql in the Supabase SQL editor, then add the person again.';
const SQL_CONTROLS = 'Run supabase/migrations/20260926230000_school_staff_controls.sql in the Supabase SQL editor, then try again.';

function designationLabel(value: string) {
  return value in STAFF_LABEL ? STAFF_LABEL[value as StaffDesignation] : value;
}

function validEmail(value: string) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
}

export function UsersManager() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [kind, setKind] = useState<Kind>('school');
  const [schools, setSchools] = useState<School[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffError, setStaffError] = useState('');
  const [query, setQuery] = useState('');
  const [staffStatus, setStaffStatus] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyStaff);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [staffNote, setStaffNote, staffTone] = useNotice('');
  const [classes, setClasses] = useState<Record<string, string>>({});

  const [rows, setRows] = useState<ConsoleRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice, noticeTone] = useNotice('A new console account uses password 123456 and must change it at first sign-in.');
  const [creating, setCreating] = useState(false);
  const [consoleError, setConsoleError] = useState('');
  const [consoleQuery, setConsoleQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [consolePage, setConsolePage] = useState(1);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const openSchool = schools.find((school) => school.id === openId) || null;
  const schoolPeople = staff.filter((row) => row.schoolId === openId);
  const visibleSchools = schools.filter((school) => {
    if (!query) return true;
    const needle = query.toLowerCase();
    return [school.name, school.code].some((value) => value?.toLowerCase().includes(needle));
  });
  const visibleStaff = schoolPeople.filter((row) => {
    if (staffStatus === 'active' && !row.active) return false;
    if (staffStatus === 'inactive' && row.active) return false;
    if (!query) return true;
    const needle = query.toLowerCase();
    return [row.name, row.email, designationLabel(row.designation)].some((value) => value?.toLowerCase().includes(needle));
  });
  const listed = openSchool ? visibleStaff : visibleSchools;
  const pages = Math.max(1, Math.ceil(listed.length / 25));
  const currentPage = Math.min(page, pages);

  const filteredConsole = rows.filter((row) => (
    (!consoleQuery || [row.display_name, row.email].some((value) => value?.toLowerCase().includes(consoleQuery.toLowerCase())))
    && (roleFilter === 'all' || row.role === roleFilter)
    && (statusFilter === 'all' || row.is_active === (statusFilter === 'active'))
  ));
  const consolePages = Math.max(1, Math.ceil(filteredConsole.length / 25));
  const currentConsolePage = Math.min(consolePage, consolePages);

  useEffect(() => setPage(1), [query, staffStatus, openId, kind]);
  useEffect(() => {
    if (!openId) return;
    let gone = false;
    void loadCoverageLabels(supabase, openId).then((labels) => { if (!gone) setClasses(labels); }).catch(() => { if (!gone) setClasses({}); });
    return () => { gone = true; };
  }, [openId, supabase]);
  useEffect(() => setConsolePage(1), [consoleQuery, roleFilter, statusFilter]);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setStaffError('');
    setConsoleError('');
    const staffQuery = (columns: string) => (from: number, to: number) => supabase
      .from('em_school_staff')
      .select(columns)
      .order('sort_no')
      .range(from, to) as PromiseLike<{ data: StaffRecord[] | null; error: { message: string } | null }>;
    const [profiles, licenceResult, initialStaff] = await Promise.all([
      supabase
      .from('profiles')
      .select('id, email, display_name, nickname, role, is_active, must_change_password')
      .in('role', [...ADMIN_STAFF_ROLES])
      .order('created_at'),
      fetchAll<LicenceRow>((from, to) => supabase
      .from('em_licences')
      .select('id, name, school_code')
      .eq('kind', 'school')
      .order('name')
      .range(from, to) as PromiseLike<{ data: LicenceRow[] | null; error: { message: string } | null }>),
      fetchAll(staffQuery('id, licence_id, staff_name, designation, email, sort_no, active')),
    ]);
    if (profiles.error) setConsoleError(profiles.error.message);
    else setRows((profiles.data || []) as ConsoleRow[]);
    let staffResult = initialStaff;
    if (staffResult.error && /active/i.test(staffResult.error.message)) {
      staffResult = await fetchAll(staffQuery('id, licence_id, staff_name, designation, email, sort_no'));
    }
    if (licenceResult.error || staffResult.error) {
      const message = staffResult.error?.message || licenceResult.error?.message || '';
      setStaffError(/em_school_staff|schema cache|does not exist/i.test(message)
        ? 'Run supabase/migrations/20260926220000_school_staff_login.sql in the Supabase SQL editor, then retry.'
        : message);
      setSchools([]);
      setStaff([]);
    } else {
      const schoolRows = licenceResult.data.map((item) => ({ id: item.id, name: item.name, code: item.school_code }));
      const byId = new Map(schoolRows.map((item) => [item.id, item]));
      setSchools(schoolRows);
      setStaff(staffResult.data.map((item) => {
        const school = byId.get(item.licence_id);
        return {
          id: item.id,
          name: item.staff_name,
          email: item.email || '',
          designation: item.designation,
          active: item.active !== false,
          schoolId: item.licence_id,
          schoolName: school?.name || 'Unknown school',
          schoolCode: school?.code || null,
          sortNo: item.sort_no,
        };
      }).sort((a, b) => a.sortNo - b.sortNo || a.name.localeCompare(b.name)));
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function switchKind(next: Kind) {
    setKind(next);
    setOpenId(null);
    setQuery('');
    setStaffStatus('all');
    setStaffNote('');
  }

  function openSchoolView(id: string) {
    setOpenId(id);
    setQuery('');
    setStaffStatus('all');
    setDraft(emptyStaff);
    setStaffNote('');
  }

  async function addStaff(event: React.FormEvent) {
    event.preventDefault();
    if (!openSchool || working) return;
    const name = draft.name.replace(/\s+/g, ' ').trim();
    const email = draft.email.replace(/\s+/g, '').trim().toLowerCase();
    if (!validEmail(email)) {
      setStaffNote(`Enter a valid email for ${name || 'this person'}.`, 'error');
      return;
    }
    setWorking('add');
    setStaffNote('');
    try {
      const { error } = await supabase.rpc('add_school_staff', {
        p_licence_id: openSchool.id,
        p_name: name,
        p_designation: draft.designation,
        p_email: email,
      });
      if (error) {
        if (/add_school_staff|schema cache/i.test(error.message) && /schema cache|does not exist/i.test(error.message)) {
          setStaffNote(SQL_ADD, 'error');
          return;
        }
        throw error;
      }
      setDraft(emptyStaff);
      setStaffNote(`${name} can sign in with password 123456 and must choose a new one.`, 'success');
      await load(true);
    } catch (err) {
      setStaffNote(errorText(err, 'Could not add that staff member.'), 'error');
    } finally {
      setWorking('');
    }
  }

  async function setStaffActive(person: Staff, active: boolean) {
    if (working) return;
    setWorking(person.id);
    setStaffNote('');
    try {
      const { error } = await supabase.rpc('set_school_staff_active', {
        p_licence_id: person.schoolId,
        p_staff_id: person.id,
        p_active: active,
      });
      if (error) {
        if (/set_school_staff_active|schema cache|active/i.test(error.message) && /schema cache|does not exist/i.test(error.message)) {
          setStaffNote(SQL_CONTROLS, 'error');
          return;
        }
        throw error;
      }
      setStaff((all) => all.map((item) => (item.id === person.id ? { ...item, active } : item)));
      setStaffNote(active ? `${person.name} can sign in again.` : `${person.name} is deactivated.`, 'success');
    } catch (err) {
      setStaffNote(errorText(err, 'Could not update that staff member.'), 'error');
    } finally {
      setWorking('');
    }
  }

  async function removeStaff(person: Staff) {
    if (working) return;
    if (!window.confirm(`Remove ${person.name} from ${person.schoolName}? Their sign-in will stop.`)) return;
    setWorking(`delete-${person.id}`);
    setStaffNote('');
    try {
      const { error } = await supabase.rpc('delete_school_staff', {
        p_licence_id: person.schoolId,
        p_staff_id: person.id,
      });
      if (error) {
        if (/delete_school_staff|schema cache/i.test(error.message)) {
          setStaffNote(SQL_CONTROLS, 'error');
          return;
        }
        throw error;
      }
      setStaffNote(`${person.name} removed.`, 'success');
      await load(true);
    } catch (err) {
      setStaffNote(errorText(err, 'Could not delete that staff member.'), 'error');
    } finally {
      setWorking('');
    }
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setNotice('');
    try {
      const password = STUDENT_DEFAULT_PASSWORD;
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const temp = createBrowserClient(url, key, {
        isSingleton: false,
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { data, error } = await temp.auth.signUp({
        email: form.email.trim(),
        password,
        options: { data: { display_name: form.name.trim() } },
      });
      if (error) throw error;
      const id = data.user?.id;
      if (!id) throw new Error('No user id returned. If email confirmation is on, confirm the mailbox then try again.');
      const { error: profileError } = await supabase.from('profiles').upsert({
        id,
        email: form.email.trim(),
        display_name: form.name.trim(),
        role: form.role,
        is_active: true,
        must_change_password: true,
      });
      if (profileError) throw profileError;
      setNotice(`${form.name} created as ${ROLE_LABELS[form.role]}. Temporary password is 123456.`, 'success');
      setForm(emptyForm);
      await load(true);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not create user.', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function updateRow(row: ConsoleRow, changes: Partial<ConsoleRow>) {
    if (row.role === 'super_admin' || pending[row.id]) return;
    setPending((current) => ({ ...current, [row.id]: true }));
    setFeedback((current) => ({ ...current, [row.id]: 'Saving…' }));
    try {
      const { error } = await supabase.from('profiles').update(changes).eq('id', row.id);
      if (error) throw error;
      setRows((all) => all.map((item) => item.id === row.id ? { ...item, ...changes } : item));
      setFeedback((current) => ({ ...current, [row.id]: 'Saved' }));
    } catch (err) {
      setFeedback((current) => ({ ...current, [row.id]: 'Not saved. ' + (err instanceof Error ? err.message : 'Try again.') }));
    } finally {
      setPending((current) => ({ ...current, [row.id]: false }));
    }
  }

  const activeCount = schoolPeople.filter((row) => row.active).length;

  return (
    <>
      <header className="page-head">
        <div>
          <p className="admin-kicker">Access</p>
          <h1>{openSchool ? openSchool.name : 'Staff'}</h1>
          <p className="admin-note">
            {openSchool
              ? `${openSchool.code ? `${openSchool.code} · ` : ''}Add a person, or deactivate and delete people already on this school. The first password is 123456.`
              : 'Open a school to manage its staff. Students stay on the school roll or the individual licence.'}
          </p>
        </div>
      </header>

      {!openSchool && (
        <div className="licence-tabs" role="tablist" aria-label="Staff group">
          <button type="button" role="tab" aria-selected={kind === 'school'} onClick={() => switchKind('school')}>
            Schools<span className="tab-count">{loading ? '—' : schools.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={kind === 'individual'} onClick={() => switchKind('individual')}>
            Individuals<span className="tab-count">0</span>
          </button>
        </div>
      )}

      {kind === 'individual' && !openSchool ? (
        <section className="admin-card">
          <p>Individual licences do not include staff. Open a licence to assign its learners.</p>
        </section>
      ) : openSchool ? (
        <>
          <p className="crumb-back">
            <button type="button" onClick={() => { setOpenId(null); setQuery(''); setStaffNote(''); void load(); }}>
              <Icon kind="back" /> All schools
            </button>
          </p>
          <PrincipalStaff key={openSchool.id} licenceId={openSchool.id} school={openSchool.name} code={openSchool.code} schoolAdmin />
        </>
      ) : (
        <>
          <div className="admin-filterbar">
            <label>
              Search schools
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="School name or id" />
            </label>
            <Link className="go" href="/admin/licences">Licences</Link>
          </div>
          {staffError && <p className="notice error" role="alert">Could not load schools. {staffError} <button type="button" onClick={() => void load()}>Retry</button></p>}
          {loading ? <p className="admin-note">Loading schools…</p> : null}
          {!loading && !staffError && visibleSchools.length === 0 ? (
            <section className="admin-card">
              <p>{schools.length ? 'No schools match this search.' : 'No schools yet. Add a school on Licences, then open it here.'}</p>
            </section>
          ) : null}
          <div className="school-board">
            {!loading && visibleSchools.slice((currentPage - 1) * 25, currentPage * 25).map((school) => {
              const people = staff.filter((row) => row.schoolId === school.id);
              const active = people.filter((row) => row.active).length;
              return (
                <button key={school.id} type="button" className="school-card" onClick={() => openSchoolView(school.id)}>
                  <small>{school.code || 'School'}</small>
                  <strong>{school.name}</strong>
                  <span>{people.length} staff{people.length - active > 0 ? ` · ${people.length - active} inactive` : ''}</span>
                  <em>Open staff</em>
                </button>
              );
            })}
          </div>
          <Pagination page={currentPage} pages={pages} total={visibleSchools.length} onPage={setPage} />
        </>
      )}

      <div className="users-split">
        <section className="admin-card">
          <div className="card-head">
            <h2>Console staff</h2>
          </div>
          <p className={`admin-note ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p>
          <form className="user-form" onSubmit={createUser}>
            <label>
              Name
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                {CONSOLE_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </label>
            <button className="go" type="submit" disabled={creating}>{creating ? 'Saving…' : 'Add user'}</button>
          </form>
        </section>
        <div className="admin-filterbar">
          <label>
            Search console staff
            <input type="search" value={consoleQuery} onChange={(event) => setConsoleQuery(event.target.value)} placeholder="Name or email" />
          </label>
          <label>
            Filter by role
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">All roles</option>
              {[...CONSOLE_ROLES, 'super_admin'].map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </label>
          <label>
            Filter by status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        {consoleError && <p className="notice error" role="alert">Could not load console staff. {consoleError} <button type="button" onClick={() => void load()}>Retry</button></p>}
        <section className="admin-card table-card" aria-busy={loading}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5}>Loading console staff…</td></tr> : null}
              {!loading && !consoleError && filteredConsole.length === 0 ? (
                <tr><td colSpan={5}>{rows.length ? 'No console staff match these filters.' : 'No console staff yet. Add the first account above.'}</td></tr>
              ) : null}
              {!loading && filteredConsole.slice((currentConsolePage - 1) * 25, currentConsolePage * 25).map((row) => (
                <tr key={row.id}>
                  <td>{row.display_name || '—'}</td>
                  <td>{row.email}</td>
                  <td>
                    {row.role === 'super_admin' ? ROLE_LABELS[row.role] : (
                      <select disabled={pending[row.id]} value={row.role} onChange={(event) => void updateRow(row, { role: event.target.value })} aria-label={`Role for ${row.display_name}`}>
                        {CONSOLE_ROLES.map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={row.is_active ? 'status on' : 'status off'}>{row.is_active ? 'Active' : 'Inactive'}</span>
                    {row.must_change_password ? <span className="status warn">Password change required</span> : null}
                  </td>
                  <td>
                    {row.role !== 'super_admin' && (
                      <button type="button" disabled={pending[row.id]} onClick={() => void updateRow(row, { is_active: !row.is_active })}>
                        {row.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    <span className="row-feedback" role="status">{feedback[row.id]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <Pagination page={currentConsolePage} pages={consolePages} total={filteredConsole.length} onPage={setConsolePage} />
      </div>
    </>
  );
}
