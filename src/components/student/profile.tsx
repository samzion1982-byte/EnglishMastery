'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../icon';
import { checkCompanion } from '@/lib/companion';
import { COUNTRIES, type CountryId } from '@/lib/countries';
import type { Language, LearnerData, LearnerProfile, ResetScope } from '@/lib/learner';
import { trackSummary } from '@/lib/learner-stats';
import { checkEntrySync, storedEntryCount, syncEntries, type EntrySyncStatus } from '@/lib/word-store';
import { HI_FONTS, SCRIPT_SAMPLE, TA_FONTS } from '@/lib/script-font';
import { REF_GROUPS, THESAURUS_META, type ThesaurusId } from '@/lib/thesaurus';
import { MOTHER_TONGUES } from '@/lib/languages';
import { bucketLabel } from '@/lib/vocab';

export function ProfileView({
  data,
  sample,
  onSave,
  onReset,
  onBack,
}: {
  data: LearnerData;
  sample: boolean;
  onSave: (profile: LearnerProfile) => Promise<void>;
  onReset: (scope: ResetScope) => Promise<void>;
  onBack: () => void;
}) {
  const profile = data.profile;
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState<ResetScope | null>(null);
  const [message, setMessage] = useState('');
  const [device, setDevice] = useState('');
  const [sync, setSync] = useState<EntrySyncStatus | null>(null);
  const [syncBusy, setSyncBusy] = useState<'count' | 'check' | 'update' | null>(null);
  const changed = JSON.stringify(draft) !== JSON.stringify(profile);
  const summary = trackSummary(data, profile.track, profile.batchSize);
  const trackLemmas = data.words.filter((w) => w.bucket === profile.track).map((w) => w.lemma);
  const level = summary.current ?? (summary.complete ? summary.levels.at(-1) ?? null : null);
  const levelLearned = level?.learned ?? 0;
  const trackLearned = summary.learned;

  useEffect(() => {
    if (!data.userId || !draft.localCache || !trackLemmas.length) {
      setSync(null);
      return;
    }
    let live = true;
    setSyncBusy('count');
    void storedEntryCount(trackLemmas, data.userId).then((stored) => {
      if (live) {
        setSync({ total: trackLemmas.length, stored, missing: Math.max(0, trackLemmas.length - stored), stale: 0 });
        setSyncBusy(null);
      }
    });
    return () => {
      live = false;
    };
  }, [data.userId, draft.localCache, profile.track, trackLemmas.length]);

  async function save() {
    const name = draft.name.trim();
    if (!name) {
      setMessage('Please enter a name.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await onSave({ ...draft, name });
      setMessage('Saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function leave(event: BeforeUnloadEvent) { if (changed) { event.preventDefault(); event.returnValue = ''; } }
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [changed]);
  async function reset(scope: ResetScope) {
    const target = scope === 'level' ? level : null;
    const count = scope === 'level' ? levelLearned : trackLearned;
    const title = scope === 'level' ? `level ${target?.number ?? ''}` : `${bucketLabel[profile.track]} track`;
    if (!window.confirm(`Reset ${title.trim()}? This clears ${count} learned word${count === 1 ? '' : 's'} and today's goal on this device and your account. Week XP stays.`)) {
      return;
    }
    setResetting(scope);
    setMessage('');
    try {
      await onReset(scope);
      setMessage(scope === 'level' ? 'Level reset.' : 'Track reset.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setResetting(null);
    }
  }

  const scriptLang = draft.language === 'hi' ? 'hi' : 'ta';
  const fonts = scriptLang === 'hi' ? HI_FONTS : TA_FONTS;
  const fontValue = scriptLang === 'hi' ? draft.hiFont : draft.taFont;

  return (
    <section className="profile">
      <div className="profile-head">
        <button type="button" className="s-btn ghost" onClick={() => { if (!changed || window.confirm("Discard unsaved profile changes?")) onBack(); }}>
          <Icon kind="home" />
          Hub
        </button>
        <h1>Profile & settings</h1>
      </div>

      <div className="card form-card">
        <h2>Learning preferences</h2><p className="field-hint">Save your learning preferences below. Theme and font are in the account menu.</p>
        <label className="field">
          <span>Your name</span>
          <input maxLength={30} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>

        <label className="field">
          <span>Country</span>
          <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value as CountryId })}>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="field-hint">Sets the first day of Week scores. India starts on Sunday; the UK starts on Monday.</p>
        </label>

        <label className="field">
          <span>Mother tongue</span>
          <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value as Language })}>
            {MOTHER_TONGUES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="field-hint">Word meanings are shown in this language. You can change it here whenever you want.</p>
        </label>

        {(draft.language === 'ta' || draft.language === 'hi') && <label className="field">
          <span>{scriptLang === 'hi' ? 'Hindi font' : 'Tamil font'}</span>
          <select
            value={fontValue}
            onChange={(e) => {
              const id = e.target.value;
              setDraft(scriptLang === 'hi' ? { ...draft, hiFont: id as typeof draft.hiFont } : { ...draft, taFont: id as typeof draft.taFont });
            }}
          >
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
          <p className="font-preview" lang={scriptLang} style={{ fontFamily: fonts.find((f) => f.id === fontValue)?.family }}>
            {scriptLang === 'hi' ? SCRIPT_SAMPLE.hi : SCRIPT_SAMPLE.ta}
          </p>
          <p className="field-hint">Used for the mother-tongue word on study cards.</p>
        </label>}

        <label className="field">
          <span>When you tap a word, open</span>
          <select value={draft.thesaurus} onChange={(e) => setDraft({ ...draft, thesaurus: e.target.value as ThesaurusId })}>
            {REF_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {THESAURUS_META.filter((t) => t.group === group).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="field-hint">{THESAURUS_META.find((t) => t.id === draft.thesaurus)?.note}</p>
        </label>

        <details className="settings-advanced"><summary>Device & offline settings</summary>
        <label className="check-row">
          <input type="checkbox" checked={draft.localCache !== false} onChange={(e) => setDraft({ ...draft, localCache: e.target.checked })} />
          <span>
            <strong>Keep words on this device</strong>
            <em>Keeps your current track on this device. After a track is chosen, its word details download quietly so the next level opens at once. Turn off to always load from the server.</em>
          </span>
        </label>
        {draft.localCache !== false && data.userId && (
          <div className="cache-sync">
            <p>
              {syncBusy === 'count' || syncBusy === 'check'
                ? 'Checking this device against the server…'
                : sync
                  ? sync.missing + sync.stale === 0
                    ? `All ${sync.total} ${bucketLabel[profile.track]} words are on this device.`
                    : `${sync.stored} of ${sync.total} ${bucketLabel[profile.track]} words are on this device${
                        sync.stale ? ` · ${sync.stale} newer on the server` : ''
                      }${sync.missing && !sync.stale ? ` · ${sync.missing} still downloading` : ''}.`
                  : 'Device copy not checked yet.'}
            </p>
            <div className="cache-sync-actions">
              <button
                type="button"
                className="s-btn ghost"
                disabled={syncBusy !== null}
                onClick={() => {
                  setSyncBusy('check');
                  void checkEntrySync(trackLemmas, data.userId)
                    .then(setSync)
                    .catch((err: unknown) => setMessage(err instanceof Error ? err.message : 'Could not check sync.'))
                    .finally(() => setSyncBusy(null));
                }}
              >
                {syncBusy === 'check' ? 'Checking…' : 'Check with server'}
              </button>
              <button
                type="button"
                className="s-btn ghost"
                disabled={syncBusy !== null || !sync || sync.missing + sync.stale === 0}
                onClick={() => {
                  setSyncBusy('update');
                  void syncEntries(trackLemmas, data.userId)
                    .then(setSync)
                    .catch((err: unknown) => setMessage(err instanceof Error ? err.message : 'Could not update the device copy.'))
                    .finally(() => setSyncBusy(null));
                }}
              >
                {syncBusy === 'update' ? 'Updating…' : 'Update now'}
              </button>
            </div>
          </div>
        )}

        </details>
        <div className="form-actions">
          <button type="button" className="s-btn primary" onClick={() => void save()} disabled={saving || !changed}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {message && (
            <span className={`form-message ${message === "Saved." ? "success" : "error"}`} role="status">
              {message}
            </span>
          )}
        </div>
      </div>

      <div className="card reset-card">
        <Icon kind="repeat" />
        <div>
          <h2>Reset progress</h2>
          <p>
            Clear learned words so you can start {level ? `level ${level.number}` : 'this level'} or the whole {bucketLabel[profile.track]} track again.
            Review history for those words is removed.
            {sample ? ' You are on sample words, so this only changes this browser.' : ''}
          </p>
          <div className="reset-actions">
            <button
              type="button"
              className="s-btn danger"
              disabled={resetting !== null}
              onClick={() => void reset('level')}
            >
              {resetting === 'level' ? 'Resetting…' : level ? `Reset level ${level.number}` : 'Reset current level'}
            </button>
            <button
              type="button"
              className="s-btn danger"
              disabled={resetting !== null}
              onClick={() => void reset('track')}
            >
              {resetting === 'track' ? 'Resetting…' : `Reset ${bucketLabel[profile.track]} track`}
            </button>
          </div>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </div>
      </div>

      <details className="card device-card"><summary>Advanced device diagnostics</summary>
        <Icon kind="shield" />
        <div>
          <h2>Device check</h2>
          <p>Looks for the TrustGate companion on this computer.</p>
          <button
            type="button"
            className="s-btn ghost"
            disabled={device === 'Checking…'}
            onClick={async () => {
              setDevice('Checking…');
              setDevice((await checkCompanion()) ? 'Companion detected' : 'Not reachable. Open TrustGate and retry.');
            }}
          >
            Check companion
          </button>
          {device && (
            <p className="form-message" role="status">
              {device}
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
