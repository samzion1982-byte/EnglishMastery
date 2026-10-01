import 'server-only';
import { reviewEnglish, containsTarget, mentionsTarget, type LocalReview } from './local-grammar';
import { splitSentences } from './sentence-boundaries';
export type WritingItem = { word: string; text: string };
export type WritingCheck = LocalReview & { original: string };
export class WritingServiceError extends Error {
  constructor(message: string, public status=503, public retryAfter=0) { super(message); }
}
function reviewTarget(text:string, word:string):WritingCheck {
  const review=reviewEnglish(text);
  if(containsTarget(text,word))return {...review,original:text};
  // Keep useful morphology feedback when the target is attempted as "goed" etc.
  if(mentionsTarget(text,word)&&!review.ok)return {...review,original:text};
  return {...review,original:text,ok:false,correction:'',message:`Include “${word}” in your writing. ${review.ok?'':review.message}`.trim(),issues:[...review.issues,{rule:'target-missing',message:'Include the target word.',offset:0,length:0}]};
}
/** Local checks only. Each target owns only sentences that actually mention it. */
export async function checkWriting(_user:string, items:WritingItem[], story=''):Promise<WritingCheck[]> {
  if(!story)return items.map(item=>reviewTarget(item.text,item.word));
  const segments=splitSentences(story);
  const cache=new Map<string,LocalReview>();
  return items.map(item=>{
    const owning=segments.filter(segment=>mentionsTarget(segment.text,item.word));
    const original=owning.map(segment=>segment.text).join('\n');
    if(!original)return reviewTarget('',item.word);
    // Identical spans are reviewed once; all offsets refer to this returned original.
    let review=cache.get(original);
    if(!review){review=reviewEnglish(original);cache.set(original,review);}
    return {...review,original};
  });
}
/** Keep mistakes in sentences without a target visible, without assigning them to unrelated words. */
export function reviewUnassignedSentences(story:string,items:WritingItem[]):WritingCheck[] {
  return splitSentences(story).filter(segment=>!items.some(item=>mentionsTarget(segment.text,item.word)))
    .map(segment=>({...reviewEnglish(segment.text),original:segment.text})).filter(review=>!review.ok);
}
