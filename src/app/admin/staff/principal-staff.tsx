'use client';

import { useEffect, useMemo, useState } from 'react';
import { AssignClasses, loadCoverageLabels } from '@/components/assign-classes';
import { fetchAll } from '@/lib/fetch-all';
import { Icon } from '@/components/icon';
import { useNotice } from '@/components/use-notice';
import { errorText } from '@/lib/error-text';
import { STAFF_LABEL, STAFF_LEVEL, type StaffDesignation } from '@/lib/school-tracker';
import { createBrowserSupabase } from '@/lib/supabase';

type Person = {
  id: string;
  user_id: string | null;
  staff_name: string;
  designation: StaffDesignation;
  email: string | null;
  rank_level: number;
  sort_no: number;
  active: boolean;
};

const POSTS: StaffDesignation[] = ['principal', 'hod', 'teacher', 'tutor'];
const SQL = 'Run supabase/migrations/20260926360000_principal_staff_access.sql in the Supabase SQL editor, then try again.';
const emptyDraft = { name: '', email: '', designation: 'teacher' as StaffDesignation };

function validEmail(value: string) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
}

export function PrincipalStaff({ licenceId, school, code, schoolAdmin = false }: { licenceId: string; school: string; code: string | null; schoolAdmin?: boolean }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [edit, setEdit] = useState<{ id: string; name: string; designation: StaffDesignation; email: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice, noticeTone] = useNotice('Add, edit, disable, reset, or remove staff at this school. The first password is 123456.');
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState(emptyDraft);
  const [me, setMe] = useState('');

  async function load() {
    setLoading(true);
    setLoadError('');
    const session = await supabase.auth.getUser();
    setMe(session.data.user?.id || '');
    const { data, error } = schoolAdmin
      ? await fetchAll<Person>((from, to) => supabase.from('em_school_staff')
          .select('id, user_id, staff_name, designation, email, rank_level, sort_no, active')
          .eq('licence_id', licenceId).order('sort_no').order('id').range(from, to))
      : await supabase.rpc('list_my_school_staff');
    if (error) {
      setLoadError(/list_my_school_staff|schema cache|does not exist/i.test(error.message) ? SQL : error.message);
      setRows([]);
    } else {
      setRows((data || []) as Person[]);
      const labels = await loadCoverageLabels(supabase, licenceId).catch(() => ({} as Record<string, string>));
      setClasses(labels);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function denied(message: string) {
    return /schema cache|does not exist|Super Admin required|Principal access required/i.test(message);
  }

  async function addStaff(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const name = draft.name.replace(/\s+/g, ' ').trim();
    const email = draft.email.replace(/\s+/g, '').trim().toLowerCase();
    if (!validEmail(email)) {
      setNotice(`Enter a valid email for ${name || 'this person'}.`, 'error');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.rpc('add_school_staff', {
        p_licence_id: licenceId,
        p_name: name,
        p_designation: draft.designation,
        p_email: email,
      });
      if (error) {
        if (denied(error.message)) {
          setNotice(SQL, 'error');
          return;
        }
        throw error;
      }
      setDraft(emptyDraft);
      setNotice(`${name} can sign in with password 123456 and must choose a new one.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not add that staff member.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function setActive(person: Person, active: boolean) {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.rpc('set_school_staff_active', {
        p_licence_id: licenceId,
        p_staff_id: person.id,
        p_active: active,
      });
      if (error) {
        if (denied(error.message)) {
          setNotice(SQL, 'error');
          return;
        }
        throw error;
      }
      setRows((all) => all.map((item) => (item.id === person.id ? { ...item, active } : item)));
      setNotice(active ? `${person.staff_name} can sign in again.` : `${person.staff_name} is disabled.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not update that staff member.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(person: Person) {
    if (busy) return;
    if (!window.confirm(`Reset ${person.staff_name} to password 123456? They choose a new password at the next sign-in.`)) return;
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.rpc('reset_school_staff_password', { p_licence_id: licenceId, p_staff_id: person.id });
      if (error) {
        if (denied(error.message)) {
          setNotice(SQL, 'error');
          return;
        }
        throw error;
      }
      setNotice(`${person.staff_name} can sign in with password 123456 and must choose a new one.`, 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not reset that password.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeStaff(person: Person) {
    if (busy) return;
    if (!window.confirm(`Remove ${person.staff_name} from this school? Their sign-in will stop.`)) return;
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.rpc('delete_school_staff', { p_licence_id: licenceId, p_staff_id: person.id });
      if (error) {
        if (denied(error.message)) {
          setNotice(SQL, 'error');
          return;
        }
        throw error;
      }
      setNotice(`${person.staff_name} removed.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not delete that staff member.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!edit || busy) return;
    const name = edit.name.replace(/\s+/g, ' ').trim();
    const email = edit.email.replace(/\s+/g, '').trim().toLowerCase();
    if (!validEmail(email)) {
      setNotice(`Enter a valid email for ${name || 'this person'}.`, 'error');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.rpc('update_school_staff', {
        p_licence_id: licenceId,
        p_staff_id: edit.id,
        p_name: name,
        p_designation: edit.designation,
        p_email: email,
        p_level: STAFF_LEVEL[edit.designation],
      });
      if (error) {
        if (denied(error.message)) {
          setNotice(SQL, 'error');
          return;
        }
        throw error;
      }
      setEdit(null);
      setNotice(`${name} updated.`, 'success');
      await load();
    } catch (err) {
      setNotice(errorText(err, 'Could not update that staff member.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <p className="admin-kicker">Access</p>
          <h1>{school}</h1>
          <p className="admin-note">{code ? `${code} · ` : ''}Add, edit, disable, reset, or remove staff at your school. Students stay on the school roll.</p>
        </div>
        <AssignClasses licenceId={licenceId} onSaved={setClasses} />
      </header>
      <section className="admin-card">
        <div className="card-head"><h2>Add staff</h2></div>
        <form className="staff-add" onSubmit={(event) => void addStaff(event)}>
          <label>
            Name
            <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label>
            Email
            <input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label>
            Designation
            <select value={draft.designation} onChange={(event) => setDraft({ ...draft, designation: event.target.value as StaffDesignation })}>
              {POSTS.map((post) => <option key={post} value={post}>{STAFF_LABEL[post]} · {STAFF_LEVEL[post]}</option>)}
            </select>
          </label>
          <button className="go" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to school'}</button>
        </form>
      </section>
      {notice ? <p className={`notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p> : null}
      {loadError ? <p className="notice error" role="alert">{loadError} <button type="button" onClick={() => void load()}>Retry</button></p> : null}
      <section className="admin-card table-card" aria-busy={loading}>
        <div className="staff-table-wrap">
        <table className="admin-table staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Email</th>
              <th className="col-classes">Classes</th>
              <th>Status</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6}>Loading staff…</td></tr> : null}
            {!loading && !loadError && rows.length === 0 ? <tr><td colSpan={6}>No staff are on this school yet.</td></tr> : null}
            {!loading && rows.map((person) => {
              const editing = edit?.id === person.id;
              return (
                <tr key={person.id} className={[person.active ? '' : 'is-off', editing ? 'is-editing' : ''].filter(Boolean).join(' ') || undefined}>
                  <td>
                    {editing && edit ? (
                      <input className="cell-input" required value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} />
                    ) : person.staff_name}
                  </td>
                  <td>
                    {editing && edit ? (
                      <select value={edit.designation} onChange={(event) => setEdit({ ...edit, designation: event.target.value as StaffDesignation })}>
                        {POSTS.map((post) => <option key={post} value={post}>{STAFF_LABEL[post]}</option>)}
                      </select>
                    ) : STAFF_LABEL[person.designation] || person.designation}
                  </td>
                  <td>
                    {editing && edit ? (
                      <input className="cell-input" required type="email" value={edit.email} onChange={(event) => setEdit({ ...edit, email: event.target.value })} />
                    ) : (person.email || '—')}
                  </td>
                  <td className="col-classes">{person.designation === 'principal' ? 'Whole school' : (classes[person.id] || '—')}</td>
                  <td><span className={person.active ? 'status on' : 'status off'}>{person.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="col-actions">
                    {editing ? (
                      <div className="licence-actions">
                        <button type="button" className="quiet icon-btn" aria-label={`Save ${edit?.name || person.staff_name}`} title="Save" disabled={busy} onClick={() => void save()}>
                          <Icon kind="check" />
                        </button>
                        <button type="button" className="quiet icon-btn" aria-label="Cancel" title="Cancel" disabled={busy} onClick={() => setEdit(null)}>
                          <Icon kind="close" />
                        </button>
                      </div>
                    ) : (
                      <div className="licence-actions">
                        {person.user_id !== me ? (
                          <button type="button" className={person.active ? 'access-dot is-on' : 'access-dot is-off'} aria-label={person.active ? `Disable ${person.staff_name}` : `Enable ${person.staff_name}`} title={person.active ? 'Disable access' : 'Enable access'} disabled={busy} onClick={() => void setActive(person, !person.active)}>
                            <span />
                          </button>
                        ) : <span className="action-slot" aria-hidden="true" />}
                        <button type="button" className="quiet icon-btn" aria-label={`Edit ${person.staff_name}`} title="Edit" disabled={busy} onClick={() => setEdit({ id: person.id, name: person.staff_name, designation: person.designation, email: person.email || '' })}>
                          <Icon kind="pen" />
                        </button>
                        <button type="button" className="quiet icon-btn" aria-label={`Reset password for ${person.staff_name}`} title="Reset password" disabled={busy || !person.email} onClick={() => void resetPassword(person)}>
                          <Icon kind="key" />
                        </button>
                        {person.user_id !== me ? (
                          <button type="button" className="quiet icon-btn danger" aria-label={`Delete ${person.staff_name}`} title="Delete" disabled={busy} onClick={() => void removeStaff(person)}>
                            <Icon kind="trash" />
                          </button>
                        ) : <span className="action-slot" aria-hidden="true" />}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
    </>
  );
}
