'use client';

import { useId, useState } from 'react';
import type { BeginnerVisual } from '@/lib/beginner-types';

/** Text and vector diagrams stay sharp, accessible, and editable without image assets. */
export function BeginnerDiagram({ kind }: { kind: BeginnerVisual }) {
  const id = useId();
  const [example, setExample] = useState(0);
  const sentences = [
    { subject: 'Meera', predicate: 'sings.', note: 'The predicate tells us what Meera does.' },
    { subject: 'The dog', predicate: 'runs.', note: 'The whole subject can have more than one word.' },
    { subject: 'The milk', predicate: 'is warm.', note: 'This predicate gives a description. It still contains a verb: is.' },
  ];
  const titles: Record<BeginnerVisual, string> = {
    sentence: 'Build a complete thought', object: 'An action or a description?', amount: 'Count items. Measure amounts.',
    ownership: 'Whose things are they?', comparison: 'Long, longer, longest', place: 'Where is it?', repair: 'Two ways to repair a sentence',
  };
  return (
    <figure className={`beginner-visual beginner-visual-${kind}`} aria-labelledby={id}>
      <figcaption id={id}>{titles[kind]}</figcaption>
      {kind === 'sentence' && <>
        <div className="beginner-example-picker" aria-label="Choose a sentence">
          {sentences.map((item, index) => <button type="button" className="s-btn ghost" key={item.subject} aria-pressed={index === example} onClick={() => setExample(index)}>{item.subject} {item.predicate}</button>)}
        </div>
        <div className="beginner-sentence" aria-live="polite">
          <div className="beginner-part subject"><small>Subject · Who or what</small><strong>{sentences[example].subject}</strong></div>
          <span className="beginner-join" aria-hidden="true">+</span>
          <div className="beginner-part predicate"><small>Predicate · What we say about it</small><strong>{sentences[example].predicate}</strong></div>
        </div>
        <p>{sentences[example].note}</p>
      </>}
      {kind === 'object' && <div className="beginner-diagram-rows">
        <div><p className="beginner-diagram-label">An action directed at something</p><div className="beginner-sentence">
          <Part role="Subject" text="Ravi" /><Part role="Action verb" text="kicks" /><Part role="Object" text="the ball." />
        </div><p>Ravi kicks what? The ball.</p></div>
        <div><p className="beginner-diagram-label">A description of the subject</p><div className="beginner-sentence">
          <Part role="Subject" text="Ravi" /><Part role="Linking verb" text="is" /><Part role="Subject complement" text="tired." />
        </div><p>Tired describes Ravi. It does not receive an action.</p></div>
      </div>}
      {kind === 'amount' && <div className="beginner-picture-grid">
        <div><div className="beginner-apples" aria-hidden="true">{[0,1,2].map(n => <i key={n} />)}</div><strong>Three apples</strong><p>Count each apple.</p></div>
        <div><div className="beginner-water" aria-hidden="true" /><strong>Some water</strong><p>Talk about an amount.</p></div>
        <div><div className="beginner-glasses" aria-hidden="true"><i /><i /></div><strong>Two glasses of water</strong><p>Count the glasses.</p></div>
      </div>}
      {kind === 'ownership' && <div className="beginner-picture-grid">
        <div><span className="beginner-owner-count">1 owner</span><strong>The girl<mark>’s</mark> bag</strong><p>One girl: add apostrophe + s.</p></div>
        <div><span className="beginner-owner-count">2 or more owners</span><strong>The girls<mark>’</mark> bags</strong><p>Girls already ends in s. Add the apostrophe after it.</p></div>
        <div><span className="beginner-owner-count">Plural without s</span><strong>The children<mark>’s</mark> toys</strong><p>Children is already plural. Add apostrophe + s.</p></div>
      </div>}
      {kind === 'comparison' && <>
        <div className="beginner-pencils" role="img" aria-label="Pencil A is shortest, B is longer than A, and C is the longest of the three.">
          {['A','B','C'].map((label, index) => <div key={label}><b>{label}</b><span className="beginner-pencil" style={{ width: `${38 + index * 27}%` }} /></div>)}
        </div>
        <div className="beginner-comparison-notes"><p><strong>B is longer than A.</strong><br />Compare two pencils.</p><p><strong>C is the longest of the three.</strong><br />Compare C with the whole group.</p></div>
      </>}
      {kind === 'place' && <>
        <svg className="beginner-place-scene" viewBox="0 0 600 300" role="img" aria-label="A ball is inside an open box on a table. A bag is under the table. A chair is beside the table.">
          <rect x="45" y="151" width="325" height="20" rx="6" fill="#9b704d" />
          <path d="M65 171v108M350 171v108" stroke="#9b704d" strokeWidth="14" />
          <path d="M133 104v45h127v-45" fill="#e7bd7d" stroke="#735131" strokeWidth="3" />
          <ellipse cx="196" cy="104" rx="64" ry="14" fill="#b28751" />
          <circle cx="196" cy="101" r="24" fill="#e67352" stroke="#743425" strokeWidth="3" />
          <path d="M133 105v44h127v-44" fill="#e7bd7d" opacity=".68" />
          <rect x="170" y="220" width="74" height="58" rx="10" fill="#4b8c8b" />
          <path d="M187 220v-8a20 20 0 0 1 40 0v8" fill="none" stroke="#4b8c8b" strokeWidth="8" />
          <path d="M452 131v-37h65v107h-65v-70M452 199v80M517 199v80" fill="none" stroke="#9b704d" strokeWidth="12" strokeLinejoin="round" />
          <path d="M196 36v35M65 117v30M133 247h25M405 144h34" stroke="currentColor" strokeWidth="2" />
          <text x="196" y="25" textAnchor="middle">Ball in the box</text>
          <text x="12" y="105">Box on the table</text>
          <text x="5" y="239">Bag under</text><text x="5" y="260">the table</text>
          <text x="401" y="48">Chair beside</text><text x="401" y="70">the table</text>
        </svg>
        <ul className="beginner-location-key">
          <li><strong>In:</strong> The ball is in the box.</li>
          <li><strong>On:</strong> The box is on the table.</li>
          <li><strong>Under:</strong> The bag is under the table.</li>
          <li><strong>Beside:</strong> The chair is beside the table.</li>
        </ul>
      </>}
      {kind === 'repair' && <div className="beginner-diagram-rows">
        <div><h3>Finish an unfinished thought</h3><p><small>Needs more information</small><br />Because it rained</p><p className="beginner-repaired"><small>Complete sentence</small><br /><strong>We stayed inside</strong> because it rained.</p></div>
        <div><h3>Join two complete ideas</h3><p><small>Needs a proper join</small><br />It rained we stayed inside.</p><p className="beginner-repaired"><small>Complete sentence</small><br />It rained<strong>, so</strong> we stayed inside.</p></div>
      </div>}
    </figure>
  );
}

function Part({ role, text }: { role: string; text: string }) {
  return <div className={`beginner-part ${role === 'Subject' ? 'subject' : 'predicate'}`}><small>{role}</small><strong>{text}</strong></div>;
}
