'use client';
import { useEffect, useRef } from 'react';
import { Icon } from '../icon';
import type { LanguageToolMatch } from '@/lib/languagetool-public';
import { mistakeParts } from '@/lib/writing-diff';
import { sentenceFrame } from '@/lib/practice';
export type CorrectionReview={word:string;original:string;message?:string;matches:LanguageToolMatch[]};
export function PracticeCorrectionDialog({reviews,onEdit,onSkip}:{reviews:CorrectionReview[];onEdit:()=>void;onSkip?:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close();},[]);
  return <dialog ref={dialog} className="practice-correction-dialog" aria-labelledby="practice-correction-title" onCancel={e=>{e.preventDefault();onEdit();}}>
    <div className="practice-correction-badge" aria-hidden="true"><span className="practice-correction-symbol"><Icon kind="close" /></span><span className="practice-correction-face">😬</span></div>
    <h2 id="practice-correction-title">Let’s review your writing</h2>
    {reviews.map((review,index)=>{
      const suggestions=review.matches.flatMap((match)=>match.replacements).filter(Boolean);
      const frame=sentenceFrame(review.original);
      const parts=mistakeParts(review.original, suggestions);
      let seenWord=false;
      let lastWord=-1;
      parts.forEach((part, partIndex)=>{ if(!/^\s+$/.test(part.text)) lastWord=partIndex; });
      return <section key={index}>
        <h3>{review.word}</h3>
        <blockquote className="practice-wrong">{parts.map((part, partIndex) => {
          const word=!/^\s+$/.test(part.text);
          const first=word && !seenWord;
          if(word) seenWord=true;
          const wrong=part.wrong || (first && !frame.capital) || (review.word==='Your story' && partIndex===lastWord && !frame.stop);
          return wrong ? <mark key={partIndex}>{part.text}</mark> : <span key={partIndex}>{part.text}</span>;
        })}</blockquote>
        {suggestions.length && review.message ? <p className="practice-reason">{review.message}</p> : null}
        {suggestions.length ? <div className="practice-suggestion"><p>Suggested replacements</p><ol>{suggestions.map((line)=><li key={line}><strong>{line}</strong></li>)}</ol></div> : review.message && <p>{review.message}</p>}
      </section>;
    })}
    <p>Read the suggestions, then edit your sentence and check it again. Choose the wording that keeps your meaning.</p>
    <div className="practice-actions"><button autoFocus type="button" className="s-btn primary" onClick={onEdit}>Edit and try again</button>{onSkip&&<button type="button" className="s-btn ghost" onClick={onSkip}>Skip this word</button>}</div>
    <small>These are suggested sentences. They can be mistaken.</small>
  </dialog>;
}
