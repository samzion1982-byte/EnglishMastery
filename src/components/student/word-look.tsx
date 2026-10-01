'use client';

import { useEffect, useState } from 'react';
import { useDialog } from '../use-dialog';
import { Icon } from '../icon';
import { useWord } from './use-word';
import { WordHead, WordReveal } from './word-view';
import { classifyLemma } from '@/lib/classify';
import type { Language, StudyWord } from '@/lib/learner';
import type { ThesaurusId } from '@/lib/thesaurus';
import { bucketLabel, liveBuckets, type LiveBucket } from '@/lib/vocab';
import { addLookedUpWord } from '@/lib/word-lookup';

export function WordLook({
  word,
  inRepo,
  language,
  thesaurus,
  canAdd,
  kicker,
  onAdded,
  onClose,
}: {
  word: StudyWord;
  inRepo: boolean;
  language: Language;
  thesaurus: ThesaurusId;
  canAdd?: boolean;
  /** Replaces the “in our word list” line. Appendix browse uses this and does not offer adding the word to Core. */
  kicker?: string;
  onAdded?: (word: StudyWord) => void;
  onClose: () => void;
}) {
  const dialog = useDialog<HTMLDivElement>(() => { if (!saving) onClose(); });
  const { word: resolved, loading, entry } = useWord(word);
  const [saved, setSaved] = useState(inRepo);
  const [guess, setGuess] = useState(() => classifyLemma(word.word));
  const [bucket, setBucket] = useState<LiveBucket>(guess.bucket);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const next = classifyLemma(word.word);
    setSaved(inRepo);
    setGuess(next);
    setBucket(next.bucket);
    setError('');
  }, [inRepo, word.word, word.lemma]);



  async function add() {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const next = await addLookedUpWord(word, bucket, entry);
      setSaved(true);
      onAdded?.(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The word could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="look-backdrop" onClick={onClose}>
      <div ref={dialog} className="look-stage" role="dialog" aria-modal="true" aria-labelledby="look-title" onClick={(e) => e.stopPropagation()}>
        <div className="card study-card open">
          <p className={`eyebrow accent${saved || kicker ? '' : ' look-out'}`}>
            <Icon kind={kicker ? 'bookmark' : saved ? 'book' : 'sparkle'} />
            {kicker ?? (saved ? 'In our word list' : 'From the web')}
          </p>
          <h2 id="look-title" className="sr-only">
            {word.word}
          </h2>
          <WordHead
            word={word}
            resolved={resolved}
            auto={!loading}
            language={language}
            showTongue
            thesaurus={thesaurus}
          />
          <WordReveal word={word} resolved={resolved} language={language} loading={loading} />
          <div className="card-actions">
            {canAdd && !saved && !kicker && (
              <div className="look-add">
                <p>
                  {bucket === guess.bucket
                    ? `Goes in ${bucketLabel[guess.bucket]}`
                    : `Override · was ${bucketLabel[guess.bucket]}`}
                </p>
                <div className="look-add-tracks" role="group" aria-label="Track">
                  {liveBuckets.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`track-${id}${id === bucket ? ' on' : ''}${id === guess.bucket ? ' suggested' : ''}`}
                      onClick={() => setBucket(id)}
                    >
                      {bucketLabel[id]}
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="look-add-error" role="status">
                    {error}
                  </p>
                )}
                <button type="button" className="s-btn primary lg block" onClick={() => void add()} disabled={saving || loading}>
                  {saving ? 'Adding…' : `Add to ${bucketLabel[bucket]}`}
                </button>
              </div>
            )}
            <button type="button" className={`s-btn ${canAdd && !saved ? 'ghost' : 'primary'} lg block`} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
