'use client';

import { useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Icon } from '@/components/icon';
import { useDialog } from '@/components/use-dialog';
import { useNotice } from '@/components/use-notice';
import { errorText } from '@/lib/error-text';
import { STAFF_LABEL, classLabel, classRank, type StaffDesignation } from '@/lib/school-tracker';
import type { ClassRef } from '@/lib/school-report';
import { createBrowserSupabase } from '@/lib/supabase';

type StaffRow = { id: string; name: string; designation: StaffDesignation; coverage: ClassRef[] };
type ClassRoom = { standard: string; section: string };
type Desk = {
  can_assign: boolean;
  standards: string[];
  classes: ClassRoom[];
  staff: StaffRow[];
};

const SQL = 'Run supabase/migrations/20260926290000_school_reports.sql in the Supabase SQL editor, then try again.';

function itemKey(item: ClassRef) {
  return item.section ? classLabel(item.standard, item.section) : item.standard;
}

function groupedClasses(classes: { standard: string; section: string }[]) {
  const groups: { standard: string; sections: string[] }[] = [];
  const ordered = [...classes].sort((a, b) => classRank(a.standard, a.section) - classRank(b.standard, b.section));
  for (const room of ordered) {
    const last = groups.at(-1);
    if (last?.standard === room.standard) last.sections.push(room.section);
    else groups.push({ standard: room.standard, sections: [room.section] });
  }
  return groups;
}

export function coverageText(items: ClassRef[]) {
  const classes = items.filter((item) => item.section).map((item) => ({ standard: item.standard, section: item.section as string }));
  if (!classes.length) return items.map((item) => item.standard).join(', ');
  return groupedClasses(classes).map((group) => `${group.standard} ${group.sections.join(', ')}`).join(' · ');
}

export async function loadCoverageLabels(client: SupabaseClient, licenceId: string) {
  const { data, error } = await client.rpc('list_school_coverage', { p_licence_id: licenceId });
  if (error) throw error;
  const desk = data as Desk;
  const labels: Record<string, string> = {};
  for (const person of desk.staff || []) labels[person.id] = coverageText(person.coverage || []);
  return labels;
}

export function AssignClasses({ licenceId, onSaved }: { licenceId: string; onSaved?: (labels: Record<string, string>) => void }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [open, setOpen] = useState(false);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [draft, setDraft] = useState<Record<string, ClassRef[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice, noticeTone] = useNotice('');
  const dialog = useDialog<HTMLElement>(() => { if (!saving) setOpen(false); }, open);

  async function openModal() {
    setOpen(true);
    setLoading(true);
    setNotice('');
    setDesk(null);
    const { data, error } = await supabase.rpc('list_school_coverage', { p_licence_id: licenceId });
    if (error) {
      const message = errorText(error, 'Could not load classes.');
      setNotice(/list_school_coverage|schema cache|does not exist/i.test(message) ? SQL : message, 'error');
      setLoading(false);
      return;
    }
    const next = data as Desk;
    const picked: Record<string, ClassRef[]> = {};
    for (const person of next.staff || []) picked[person.id] = [...(person.coverage || [])];
    setDesk(next);
    setDraft(picked);
    setLoading(false);
  }

  function give(personId: string, item: ClassRef, hods: boolean) {
    setDraft((current) => {
      const staff = desk?.staff || [];
      const next: Record<string, ClassRef[]> = { ...current };
      const had = (current[personId] || []).some((entry) => itemKey(entry) === itemKey(item));
      for (const person of staff) {
        const same = hods ? person.designation === 'hod' : (person.designation === 'teacher' || person.designation === 'tutor');
        if (!same) continue;
        next[person.id] = (next[person.id] || []).filter((entry) => itemKey(entry) !== itemKey(item));
      }
      if (!had) next[personId] = [...(next[personId] || []), item];
      return next;
    });
  }

  async function save() {
    if (!desk || saving) return;
    setSaving(true);
    setNotice('');
    try {
      for (const person of desk.staff) {
        const items = (draft[person.id] || []).map((item) => (
          person.designation === 'hod' ? { standard: item.standard } : { standard: item.standard, section: item.section }
        ));
        const { error } = await supabase.rpc('set_staff_coverage', { p_staff_id: person.id, p_items: items });
        if (error) throw error;
      }
      const labels: Record<string, string> = {};
      for (const person of desk.staff) labels[person.id] = coverageText(draft[person.id] || []);
      onSaved?.(labels);
      setOpen(false);
    } catch (err) {
      const message = errorText(err, 'Could not save classes.');
      setNotice(/set_staff_coverage|schema cache|does not exist/i.test(message) ? SQL : message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const hods = (desk?.staff || []).filter((person) => person.designation === 'hod');
  const teachers = (desk?.staff || []).filter((person) => person.designation === 'teacher' || person.designation === 'tutor');
  const heldStandards = new Set(hods.flatMap((person) => (draft[person.id] || []).map((item) => item.standard)));
  const heldClasses = new Set(teachers.flatMap((person) => (draft[person.id] || []).map(itemKey)));
  const classGroups = groupedClasses(desk?.classes || []);
  const openGroups = groupedClasses((desk?.classes || []).filter((room) => !heldClasses.has(classLabel(room.standard, room.section))));

  return (
    <>
      <button type="button" onClick={() => void openModal()}>Assign classes</button>
      {open ? (
        <div className="licence-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setOpen(false); }}>
          <section ref={dialog} className="admin-card licence-modal assign-modal" role="dialog" aria-modal="true" aria-labelledby="assign-classes-title">
            <button type="button" className="quiet icon-btn modal-x" aria-label="Close" disabled={saving} onClick={() => setOpen(false)}><Icon kind="close" /></button>
            <h2 id="assign-classes-title">Assign classes</h2>
            <p className="admin-note">A standard stays with one HOD. A class stays with one teacher or tutor. Tick a box to move it.</p>
            {notice ? <p className={`notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p> : null}
            {loading ? <p className="admin-note">Loading the roll…</p> : null}
            {!loading && desk && desk.standards.length === 0 ? <p className="admin-note">Upload the school roll before assigning classes.</p> : null}
            {!loading && desk && hods.length === 0 && teachers.length === 0 ? <p className="admin-note">Add an HOD, teacher, or tutor before assigning classes.</p> : null}
            {!loading && desk && hods.length > 0 ? (
              <fieldset className="assign-group">
                <legend>HODs</legend>
                <p>{heldStandards.size < desk.standards.length ? `Still open: ${desk.standards.filter((standard) => !heldStandards.has(standard)).join(', ')}` : 'Every standard has an HOD.'}</p>
                {hods.map((person) => (
                  <div key={person.id} className="assign-row">
                    <strong>{person.name} <small>{STAFF_LABEL.hod}</small></strong>
                    <div className="coverage-picks">
                      {desk.standards.map((standard) => (
                        <label key={standard}>
                          <input type="checkbox" checked={(draft[person.id] || []).some((item) => item.standard === standard && !item.section)} onChange={() => give(person.id, { standard, section: null }, true)} />
                          {standard}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>
            ) : null}
            {!loading && desk && teachers.length > 0 ? (
              <fieldset className="assign-group">
                <legend>Teachers and tutors</legend>
                <p>{openGroups.length ? `Still open: ${openGroups.map((group) => `${group.standard} ${group.sections.join(', ')}`).join(' · ')}` : 'Every class has a teacher or tutor.'}</p>
                {teachers.map((person) => (
                  <div key={person.id} className="assign-row">
                    <strong>{person.name} <small>{STAFF_LABEL[person.designation]}</small></strong>
                    <div className="assign-standards">
                      {classGroups.map((group) => (
                        <div key={group.standard} className="assign-standard">
                          <span>{group.standard}</span>
                          <div className="coverage-picks">
                            {group.sections.map((section) => {
                              const item = { standard: group.standard, section };
                              return (
                                <label key={section}>
                                  <input
                                    type="checkbox"
                                    checked={(draft[person.id] || []).some((entry) => itemKey(entry) === itemKey(item))}
                                    aria-label={`${classLabel(group.standard, section)} for ${person.name}`}
                                    onChange={() => give(person.id, item, false)}
                                  />
                                  {section}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>
            ) : null}
            <div className="licence-actions">
              <button type="button" className="go" disabled={loading || saving || !desk?.staff.length} onClick={() => void save()}>{saving ? 'Saving…' : 'Save classes'}</button>
              <button type="button" disabled={saving} onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
