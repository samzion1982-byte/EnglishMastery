'use client';

import { useId } from 'react';
import type { BeginnerVisualGuide as Guide } from '@/lib/beginner-types';

/** Labelled word relationships stay readable without relying on colour or a bitmap. */
export function BeginnerVisualGuide({ guide }: { guide: Guide }) {
  const titleId = useId();
  return <figure className="beginner-guide" aria-labelledby={titleId}>
    <figcaption id={titleId}>{guide.title}</figcaption>
    <div className="beginner-guide-rows">
      {guide.rows.map(row => <section key={row.label} className="beginner-guide-row">
        <h4>{row.label}</h4>
        <div className="beginner-word-route">
          {row.parts.map((part, index) => <div className="beginner-word-tile" key={`${part.text}-${index}`}>
            <strong>{part.text}</strong><span>{part.label}</span>
          </div>)}
        </div>
        {row.note && <p>{row.note}</p>}
      </section>)}
    </div>
  </figure>;
}
