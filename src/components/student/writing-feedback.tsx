import { writingDiff } from '@/lib/writing-diff';
export type WritingFeedbackData = { original: string; correction: string; ambiguous: boolean; message?: string };
export function WritingFeedback({original, correction, ambiguous, message}:WritingFeedbackData){
  return <div className="practice-feedback" role="status">
    <p><strong>{ambiguous?'Needs clarification':correction?'Suggested correction':'Review your writing'}</strong></p>
    {correction && <p>{writingDiff(original,correction).map((part,i)=>part.changed?<strong className="practice-change" key={i}>{part.text}</strong>:part.text)}</p>}
    {message && <p>{message}</p>}
    <p>{ambiguous?'Keep your original meaning and add the missing detail. This has not been marked wrong.':'Edit your original writing, then check it again.'}</p>
    {correction && <p>Bold words show additions or replacements. Compare with your original for removals.</p>}
  </div>;
}
