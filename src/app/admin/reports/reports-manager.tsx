'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDialog } from '@/components/use-dialog';
import { useNotice } from '@/components/use-notice';
import { isFullAccess } from '@/lib/access';
import { errorText } from '@/lib/error-text';
import {
  buildSchoolReport,
  reportFileName,
  type ClassRef,
  type SchoolReport,
} from '@/lib/school-report';
import { downloadBlob } from '@/lib/excel-vocab';
import { createBrowserSupabase } from '@/lib/supabase';

type SchoolRow = { id: string; name: string; school_code: string | null };
type StaffRow = { id: string; name: string; designation: string; coverage: ClassRef[] };
type Desk = {
  school: string;
  code: string | null;
  staff: StaffRow[];
};

const SQL = 'Run supabase/migrations/20260926300000_report_dates.sql in the Supabase SQL editor, then try again.';

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function academicStart() {
  const now = new Date();
  const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-06-01`;
}

function prettyDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ReportsManager({ role, designation, licenceId }: { role: string; designation: string | null; licenceId: string | null }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const deskUser = isFullAccess(role);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [schoolId, setSchoolId] = useState(licenceId || '');
  const [desk, setDesk] = useState<Desk | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice, noticeTone] = useNotice('');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeAll, setRangeAll] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState(todayIso);
  const dialog = useDialog<HTMLElement>(() => { if (busy !== 'download' && busy !== 'folder') setRangeOpen(false); }, rangeOpen);

  async function loadSchools() {
    const { data, error } = await supabase.from('em_licences').select('id, name, school_code').eq('kind', 'school').order('name');
    if (error) throw error;
    setSchools((data || []) as SchoolRow[]);
  }

  async function loadDesk(id: string) {
    const { data, error } = await supabase.rpc('list_school_coverage', { p_licence_id: id });
    if (error) throw error;
    const next = data as Desk;
    setDesk(next);
  }

  async function openSchool(id: string) {
    setLoading(true);
    setLoadError('');
    setSchoolId(id);
    try {
      await loadDesk(id);
    } catch (err) {
      const message = errorText(err, 'Could not open this school.');
      setLoadError(/list_school_coverage|schema cache|does not exist/i.test(message) ? SQL : message);
      setDesk(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let gone = false;
    async function start() {
      setLoading(true);
      setLoadError('');
      try {
        if (deskUser) await loadSchools();
        if (licenceId) await loadDesk(licenceId);
      } catch (err) {
        const message = errorText(err, 'Could not load reports.');
        if (!gone) setLoadError(/list_school_coverage|schema cache|does not exist|em_licences/i.test(message) ? SQL : message);
      } finally {
        if (!gone) setLoading(false);
      }
    }
    void start();
    return () => { gone = true; };
  }, [licenceId]);

  async function reportFor(id: string, from: string, to: string) {
    const { data, error } = await supabase.rpc('school_learning_report', {
      p_licence_id: id,
      p_from: from || null,
      p_to: to,
    });
    if (error) throw error;
    const report = data as SchoolReport;
    if (!(report.address || '').trim()) {
      const extra = await supabase.from('em_licences').select('address').eq('id', id).maybeSingle();
      if (extra.data?.address) report.address = extra.data.address;
    }
    return report;
  }

  function missingCoverage() {
    if (designation !== 'hod' && designation !== 'teacher' && designation !== 'tutor') return false;
    return !(desk?.staff[0]?.coverage || []).length;
  }

  async function openRange(all: boolean) {
    if (!all && missingCoverage()) {
      setNotice(designation === 'hod'
        ? 'No standards are assigned yet. The principal chooses which standards this HOD covers.'
        : 'No classes are assigned yet. The principal chooses the classes for this teacher or tutor.', 'error');
      return;
    }
    setRangeAll(all);
    setSelectedSchools(all ? schools.map(school => school.id) : []);
    setNotice('');
    setEnd(todayIso());
    setStart(all ? '' : academicStart());
    setRangeOpen(true);
    if (!all && schoolId) {
      const { data, error } = await supabase.rpc('school_tracker_date', { p_licence_id: schoolId });
      if (!error && data) setStart(String(data).slice(0, 10));
    }
  }

  async function generate() {
    if (!end) {
      setNotice('Choose an end date.', 'error');
      return;
    }
    if (!rangeAll && !start) {
      setNotice('Choose a start date.', 'error');
      return;
    }
    if (start && start > end) {
      setNotice('The start date must be on or before the end date.', 'error');
      return;
    }
    if (rangeAll) {
      const selected = schools.filter(school => selectedSchools.includes(school.id));
      if (!selected.length) { setNotice('Select at least one school.', 'error'); return; }
      await writeAll(selected, start, end);
      return;
    }
    await downloadSchool(schoolId, desk?.school || 'School', start, end);
  }

  async function downloadSchool(id: string, school: string, from: string, to: string) {
    setBusy('download');
    setNotice('');
    try {
      const report = await reportFor(id, from, to);
      if (report.needs_assignment) {
        setNotice(designation === 'hod'
          ? 'No standards are assigned yet. The principal chooses which standards this HOD covers.'
          : 'No classes are assigned yet. The principal chooses the classes for this teacher or tutor.', 'error');
        return;
      }
      if (!report.coverage.length) {
        setNotice('There are no classes in your coverage for this report.', 'error');
        return;
      }
      downloadBlob(await buildSchoolReport(report), reportFileName(report.school || school));
      setRangeOpen(false);
      setNotice('Report generated. Each class has its own sheet, and classes in one standard share a tab colour.', 'success');
    } catch (err) {
      const message = errorText(err, 'Could not build the report.');
      setNotice(/school_learning_report|schema cache|does not exist|school_tracker_date/i.test(message) ? SQL : message, 'error');
    } finally {
      setBusy('');
    }
  }

  async function writeAll(selected: SchoolRow[], from: string, to: string) {
    setBusy('folder');
    setNotice('');
    try {
      let count = 0;
      const { default: JSZip } = await import('jszip');
      const archive = new JSZip();
      let exported = 0;
      for (const school of selected) {
        count += 1;
        setNotice(`Writing ${count} of ${selected.length}: ${school.name}`);
        const report = await reportFor(school.id, from, to);
        if (!report.coverage.length) continue;
        const workbook = await buildSchoolReport(report);
        archive.file(school.id + '/' + reportFileName(report.school || school.name), await workbook.arrayBuffer());
        exported += 1;
      }
      setRangeOpen(false);
      if (!exported) { setNotice('No school reports are available for this date range.', 'error'); return; }
      downloadBlob(await archive.generateAsync({ type: 'blob' }), 'Reports - Selected Schools.zip');
      setNotice(`Downloaded ${exported} school workbooks in Reports - Selected Schools.zip.`, 'success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setNotice('');
        return;
      }
      const message = errorText(err, 'Could not write the school reports.');
      setNotice(/school_learning_report|schema cache|does not exist/i.test(message) ? SQL : message, 'error');
    } finally {
      setBusy('');
    }
  }

  const viewing = !!schoolId && !!desk;

  return (
    <div className="report-page">
      <header className="page-head">
        <div>
          <p className="admin-kicker">Reports</p>
          <h1>{viewing ? desk?.school : 'Learning reports'}</h1>
          <p className="admin-note">
            {deskUser && !viewing
              ? 'Each school workbook is included in a single ZIP download. Each class has its own sheet. Classes in the same standard share a tab colour.'
              : designation === 'principal'
                ? 'Generate this school for the dates you choose. You get every class. Assign classes on the Staff page.'
                : deskUser
                  ? 'Generate this school for the dates you choose. Each class is a separate sheet.'
                : designation === 'hod'
                  ? 'You can generate only the standards assigned to you, and only the classes inside those standards.'
                  : 'You can generate only the classes assigned to you.'}
          </p>
        </div>
        <div className="perm-actions">
          {deskUser && !viewing ? (
            <button type="button" className="go" disabled={loading || !!busy || !schools.length} onClick={() => void openRange(true)}>
              {busy === 'folder' ? 'Writing…' : 'Download all school reports'}
            </button>
          ) : null}
          {viewing && deskUser ? (
            <button type="button" onClick={() => { setSchoolId(''); setDesk(null); }}>All schools</button>
          ) : null}
          {viewing && !deskUser ? (
            <button type="button" className="go" disabled={!!busy} onClick={() => void openRange(false)}>
              {busy === 'download' ? 'Building…' : 'Generate Report'}
            </button>
          ) : null}
        </div>
      </header>
      {notice ? <p className={`notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p> : null}
      {loadError ? <p className="notice error" role="alert">{loadError}</p> : null}
      {loading ? <p className="admin-note">Loading reports…</p> : null}
      {!loading && !deskUser && !licenceId ? <p className="notice error" role="alert">This sign-in is not linked to a school yet.</p> : null}

      {!loading && deskUser && !viewing ? (
        <div className="school-board">
          {schools.length === 0 ? <p className="admin-note">No schools are on the register yet.</p> : schools.map((school) => (
            <button key={school.id} type="button" className="school-card" onClick={() => void openSchool(school.id)}>
              <small>{school.school_code || 'School'}</small>
              <strong>{school.name}</strong>
              <em>Open report</em>
            </button>
          ))}
        </div>
      ) : null}

      {!loading && viewing && deskUser ? (
        <p className="crumb-back">
          <button type="button" className="go" disabled={!!busy} onClick={() => void openRange(false)}>
            {busy === 'download' ? 'Building…' : 'Generate Report'}
          </button>
        </p>
      ) : null}
      {rangeOpen ? (
        <div className="report-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setRangeOpen(false); }}>
          <section ref={dialog} className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-dates-title">
            <header>
              <p className="admin-kicker">Report period</p>
              <h2 id="report-dates-title">{rangeAll ? 'Choose schools' : (desk?.school || 'Generate Report')}</h2>
              <p>
                {rangeAll
                  ? 'Leave the start date empty and each school begins on the day its tracker was uploaded. The end date is today unless you change it. The workbooks are downloaded together as a ZIP file.'
                  : 'The start date is the day this year’s tracker was uploaded, or 1 June if that day is not on record. Change either date if you need a different period.'}
              </p>
            </header>
            <form onSubmit={(event) => { event.preventDefault(); void generate(); }}>
              {rangeAll && (
                <fieldset className="report-school-picker" disabled={!!busy}>
                  <legend>Schools to include</legend>
                  <div className="report-school-tools">
                    <span aria-live="polite">{selectedSchools.length} of {schools.length} selected</span>
                    <button type="button" onClick={() => setSelectedSchools(schools.map(school => school.id))}>Select all</button>
                    <button type="button" onClick={() => setSelectedSchools([])}>Clear all</button>
                  </div>
                  <div className="report-school-list">
                    {schools.map(school => (
                      <label key={school.id} className="report-school-option">
                        <input type="checkbox" checked={selectedSchools.includes(school.id)} onChange={event => {
                          const checked = event.target.checked;
                          setSelectedSchools(ids => checked ? [...ids, school.id] : ids.filter(id => id !== school.id));
                        }} />
                        <span>{school.name}{school.school_code && <small>{school.school_code}</small>}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="report-date-grid">
                <label>
                  Start date
                  <input type="date" disabled={!!busy} value={start} max={end || undefined} onChange={(event) => setStart(event.target.value)} />
                </label>
                <label>
                  End date
                  <input required type="date" disabled={!!busy} value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} />
                </label>
              </div>
              <p className="report-span">{start && end ? `${prettyDate(start)} – ${prettyDate(end)}` : end ? `Through ${prettyDate(end)}` : 'Choose the end date.'}</p>
              <div aria-live="polite">{notice && <p className={`notice ${noticeTone}`}>{notice}</p>}</div>
              <div className="report-dialog-actions">
                <button type="button" disabled={!!busy} onClick={() => setRangeOpen(false)}>Cancel</button>
                <button className="go" type="submit" disabled={!!busy || (rangeAll && !selectedSchools.length)}>{busy ? 'Building…' : rangeAll ? `Generate reports (${selectedSchools.length})` : 'Generate Report'}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
