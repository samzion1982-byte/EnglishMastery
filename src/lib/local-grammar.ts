import { splitSentences } from './sentence-boundaries';
/** Conservative checks for standard written English. A clean result is not proof of correctness. */
export type GrammarIssue = { rule: string; message: string; offset: number; length: number; replacement?: string; needsContext?: boolean };
export type LocalReview = { ok: boolean; correction: string; ambiguous: boolean; message: string; issues: GrammarIssue[] };

// Explicit inflections avoid guesses such as "goed", "buyed", and treating every -s word as a verb.
const verbs: Record<string, [string, string, string]> = {
  read:['reads','read','read'], sit:['sits','sat','sat'], stand:['stands','stood','stood'],
  impact:['impacts','impacted','impacted'], influence:['influences','influenced','influenced'],
  go:['goes','went','gone'], do:['does','did','done'], have:['has','had','had'],
  eat:['eats','ate','eaten'], drink:['drinks','drank','drunk'], see:['sees','saw','seen'],
  write:['writes','wrote','written'], speak:['speaks','spoke','spoken'], take:['takes','took','taken'],
  give:['gives','gave','given'], buy:['buys','bought','bought'], sell:['sells','sold','sold'],
  run:['runs','ran','run'], come:['comes','came','come'], make:['makes','made','made'],
  know:['knows','knew','known'], think:['thinks','thought','thought'], teach:['teaches','taught','taught'],
  bring:['brings','brought','brought'], catch:['catches','caught','caught'], find:['finds','found','found'],
  feel:['feels','felt','felt'], leave:['leaves','left','left'], sleep:['sleeps','slept','slept'],
  choose:['chooses','chose','chosen'], break:['breaks','broke','broken'], drive:['drives','drove','driven'],
  begin:['begins','began','begun'], swim:['swims','swam','swum'], sing:['sings','sang','sung'],
  forget:['forgets','forgot','forgotten'], fly:['flies','flew','flown'], fall:['falls','fell','fallen'],
  walk:['walks','walked','walked'], play:['plays','played','played'], work:['works','worked','worked'],
  like:['likes','liked','liked'], love:['loves','loved','loved'], want:['wants','wanted','wanted'],
  need:['needs','needed','needed'], live:['lives','lived','lived'], learn:['learns','learned','learned'],
  study:['studies','studied','studied'], try:['tries','tried','tried'], manage:['manages','managed','managed'],
  help:['helps','helped','helped'], watch:['watches','watched','watched'], wash:['washes','washed','washed'],
  enjoy:['enjoys','enjoyed','enjoyed'], visit:['visits','visited','visited'], finish:['finishes','finished','finished'],
  talk:['talks','talked','talked'], look:['looks','looked','looked'], listen:['listens','listened','listened'],
  open:['opens','opened','opened'], close:['closes','closed','closed'], stop:['stops','stopped','stopped'],
  carry:['carries','carried','carried'], use:['uses','used','used'], call:['calls','called','called'],
};
const byForm = new Map<string,string>();
for (const [base,forms] of Object.entries(verbs)) for (const form of [base,...forms]) if(form!==base) byForm.set(form,base);
const esc = (s:string) => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const learnerForms: Record<string,string> = {goed:'go',eated:'eat',buyed:'buy',bringed:'bring',teached:'teach',catched:'catch',thinked:'think',runned:'run',writed:'write',speaked:'speak',taked:'take',gived:'give',choosed:'choose',drived:'drive',swimmed:'swim'};
const wordsOf = (s:string) => s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) ?? [];
const matchCase = (source:string,replacement:string) => /^[A-Z]/.test(source) ? replacement[0].toUpperCase()+replacement.slice(1) : replacement;

function reviewSentence(text:string):GrammarIssue[] {
  const issues:GrammarIssue[]=[];
  function mandativeBefore(index:number) {
    // Only an explicit mandative construction protects base verbs. Ordinary "if/that" never suppresses agreement checks.
    const clause=text.slice(0,index);
    return /\b(?:insist|insists|insisted|suggest|suggests|suggested|recommend|recommends|recommended|demand|demands|demanded|request|requests|requested|require|requires|required|essential|important|necessary)\b[^.!?;]*\bthat\s*$/i.test(clause) || /\blest\s*$/i.test(clause);
  }
  function add(rule:string,message:string,offset:number,length:number,replacement?:string,needsContext=false){
    if(issues.some(i=>i.offset===offset && i.rule===rule)) return;
    issues.push({rule,message,offset,length,replacement,needsContext});
  }
  function scan(re:RegExp,callback:(m:RegExpMatchArray)=>void){for(const m of text.replace(/’/g,"'").matchAll(re))callback(m);}
  const words=wordsOf(text);
  if(!words.length) add('empty','Write a sentence using your target word.',0,text.length,undefined,true);
  // Fragments need context; do not expand a bare word into an invented example.
  if(words.length===1 && !/^(?:go|stop|wait|look|listen|run|help|come|leave|eat|drink|read|write|sit|stand)$/i.test(words[0]))
    add('bare-word','Add enough detail to show what happens or what you mean.',0,text.length,undefined,true);

  scan(/(^)(["“‘(]*)([a-z])/g,m=>add('capital','Start this sentence with a capital letter.',m.index!+m[1].length+m[2].length,1,m[3].toUpperCase()));
  scan(/(?<![\p{L}\p{N}'’.-])i(?![\p{L}\p{N}'’.-])/gu,m=>add('pronoun-i','Write the pronoun I with a capital letter.',m.index!,1,'I'));
  if(text.trim() && !/[.!?]["'”’)]*$/.test(text.trim())) add('end-mark','Add a full stop, question mark, or exclamation mark at the end.',text.trimEnd().length,0);

  // Only adjacent pronoun + verb patterns; complex clauses and noun subjects are left alone.
  scan(/\b(I|you|we|they|he|she|it)\s+(am|is|are|was|were|has|have|does|do)\b/gi,m=>{
    const subject=m[1].toLowerCase(), v=m[2].toLowerCase();let replacement='';
    if(v==='am'&&subject!=='i')replacement=/^(he|she|it)$/.test(subject)?'is':'are';
    if(v==='is'&&/^(i|you|we|they)$/.test(subject))replacement=subject==='i'?'am':'are';
    if(v==='are'&&/^(i|he|she|it)$/.test(subject))replacement=subject==='i'?'am':'is';
    if(v==='was'&&/^(you|we|they)$/.test(subject))replacement='were';
    // "If I were" and "I wish she were" are valid: never globally replace were.
    if(v==='has'&&/^(i|you|we|they)$/.test(subject))replacement='have';
    if(v==='have'&&/^(he|she|it)$/.test(subject))replacement='has';
    if(v==='does'&&/^(i|you|we|they)$/.test(subject))replacement='do';
    if(v==='do'&&/^(he|she|it)$/.test(subject))replacement='does';
    // Subjunctive clauses may intentionally use a base form: "I insist that she have..."
    if((v==='have'||v==='do')&&mandativeBefore(m.index!))return;
    if(replacement)add('agreement',`Check the verb used with “${m[1]}”.`,m.index!+m[0].lastIndexOf(m[2]),m[2].length,replacement);
  });
  scan(/(^)(I|you|we|they|he|she|it)\s+([a-z]+)\b/gi,m=>{
    const sub=m[2].toLowerCase(),v=m[3].toLowerCase();let replacement='';
    if(/^(he|she|it)$/.test(sub)&&verbs[v]&&verbs[v][1]!==v&&!['have','do'].includes(v))replacement=verbs[v][0];
    if(/^(i|you|we|they)$/.test(sub)){const base=byForm.get(v);if(base&&verbs[base][0]===v&&!['has','does'].includes(v))replacement=base;}
    if(replacement)add('present-agreement',`Check the present-tense verb after “${m[2]}”.`,m.index!+m[0].lastIndexOf(m[3]),m[3].length,replacement);
  });
  scan(/\b(?:I|you|we|they|he|she|it)\s+(can|could|will|would|should|must|might|may|did|does|do|didn't|doesn't|don't|can't|couldn't|won't|wouldn't|shouldn't|mustn't)\s+(?:not\s+)?([a-z]+)\b/gi,m=>{
    const form=m[2].toLowerCase(),base=byForm.get(form);
    if(base && form!==base&&!['saw','found','fell'].includes(form))add('aux-base',`Use the base verb after “${m[1]}${/\snot\s/i.test(m[0])?' not':''}”.`,m.index!+m[0].lastIndexOf(m[2]),m[2].length,base);
  });
  scan(/\b(has|have|had|hasn't|haven't|hadn't)\s+(?:not\s+)?([a-z]+)\b/gi,m=>{
    const form=m[2].toLowerCase(),base=byForm.get(form);
    const following=text.slice(m.index!+m[0].length);
    // Saw/spoke can modify nouns; fell can be a separate verb. Do not guess their part of speech.
    if(['saw','spoke','broke','fell'].includes(form)&&!/^\s+(?:it|them|him|her|us|me|you|the|a|an|to)\b/i.test(following))return;
    if(base&&verbs[base][1]===form&&verbs[base][2]!==form)
      add('perfect-participle',`Check the verb form after “${m[1]}”.`,m.index!+m[0].lastIndexOf(m[2]),m[2].length,verbs[base][2]);
  });
  const negativeAgreement: Record<string, { subjects: RegExp; replacement: (s:string)=>string }> = {
    "isn't": {subjects:/^(i|you|we|they)$/,replacement:s=>s==='i'?'am not':"aren't"},
    "aren't": {subjects:/^(i|he|she|it)$/,replacement:s=>s==='i'?'am not':"isn't"},
    "wasn't": {subjects:/^(you|we|they)$/,replacement:()=>"weren't"},
    "hasn't": {subjects:/^(i|you|we|they)$/,replacement:()=>"haven't"},
    "haven't": {subjects:/^(he|she|it)$/,replacement:()=>"hasn't"},
    "doesn't": {subjects:/^(i|you|we|they)$/,replacement:()=>"don't"},
    "don't": {subjects:/^(he|she|it)$/,replacement:()=>"doesn't"},
  };
  scan(/\b(I|you|we|they|he|she|it)\s+(isn't|aren't|wasn't|weren't|hasn't|haven't|doesn't|don't)\b/gi,m=>{
    const subject=m[1].toLowerCase(), negative=m[2].toLowerCase();
    const rule=negativeAgreement[negative];
    // Weren't can express a hypothetical. Leave it for review rather than rewriting its meaning.
    if(!rule || !rule.subjects.test(subject))return;
    const offset=m.index!+m[0].lastIndexOf(m[2]);
    let replacement=rule.replacement(subject);
    if(text.slice(offset,offset+m[2].length).includes('’'))replacement=replacement.replace(/'/g,'’');
    add('negative-agreement',`Check the negative verb used with “${m[1]}”.`,offset,m[2].length,replacement);
  });
  scan(/\b(everyone|everybody|someone|somebody|anyone|anybody|nobody|everything|something|anything|nothing)\s+(are|have|do|were)\b/gi,m=>{
    if(m[2].toLowerCase()==='were')return; // hypotheticals: "If everyone were..."
    if(mandativeBefore(m.index!))return;
    const replacement:Record<string,string>={are:'is',have:'has',do:'does'};
    add('indefinite-agreement',`Use a singular verb with “${m[1]}” in this statement.`,m.index!+m[0].lastIndexOf(m[2]),m[2].length,replacement[m[2].toLowerCase()]);
  });
  // A bounded list of learner overregularizations, never a generic spelling guess.
  scan(/\b(I|you|we|they|he|she|it)\s+(?:(has|have|had|did|didn't|does|doesn't|do|don't|can|could|will|would|should|must|might|may)\s+(?:not\s+)?)?(goed|eated|buyed|bringed|teached|catched|thinked|runned|writed|speaked|taked|gived|choosed|drived|swimmed|singed)\b/gi,m=>{
    // "singed" is a real word (burned slightly), so never autocorrect it to sang.
    if(m[3].toLowerCase()==='singed')return;
    const base=learnerForms[m[3].toLowerCase()];if(!base)return;
    const auxiliary=m[2]?.toLowerCase();
    const replacement=auxiliary?(/^(has|have|had)$/.test(auxiliary)?verbs[base][2]:base):verbs[base][1];
    add('irregular-form','Check this irregular verb form.',m.index!+m[0].lastIndexOf(m[3]),m[3].length,replacement);
  });

  // Restrict article checks to known pronunciation patterns, not arbitrary first letters.
  const vowel=/^(apple|orange|egg|elephant|umbrella|idea|animal|old|easy|interesting|expensive|affordable|honest|hour|honour|honor)$/i;
  const consonant=/^(book|bag|car|dog|cat|house|student|teacher|cheap|big|small|beautiful|good|useful|university|uniform|European|one)$/i;
  scan(/\b(a|an)\s+([a-z]+)\b/gi,m=>{
    const art=m[1].toLowerCase(), next=m[2];
    if((art==='a'&&vowel.test(next))||(art==='an'&&consonant.test(next)))add('article-sound','Check a/an before this word; the choice depends on its starting sound.',m.index!,m[1].length,matchCase(m[1],art==='a'?'an':'a'));
  });
  scan(/\b(?:is|are|was|were|seems|looks|feels)\s+(more|most)\s+(better|best|worse|worst|happier|happiest|bigger|biggest|smaller|smallest|cheaper|cheapest|easier|easiest|faster|fastest|taller|tallest)\b(?=\s*(?:than\b|[.!?]|$))/gi,m=>{
    const offset=m.index!+m[0].indexOf(m[1]);
    add('double-comparison','Use one comparison form here.',offset,m[0].length-(offset-m.index!),/^(happiest|biggest|smallest|cheapest|easiest|fastest|tallest)$/i.test(m[2])?undefined:m[2]);
  });
  scan(/\b(very|much)\s+([a-z]+)\b/gi,m=>{
    if(m[1].toLowerCase()==='very'&&/^(better|worse|bigger|smaller|cheaper)$/.test(m[2].toLowerCase()))add('comparison-modifier','Use much, rather than very, to strengthen this comparison.',m.index!,m[1].length,matchCase(m[1],'much'));
  });
  scan(/\b(the|a|an|to|of|and)\s+\1\b/gi,m=>add('repeated-word','Check whether this repeated word is intentional.',m.index!,m[0].length));
  // A modifier can separate the subject from an -ing verb and hide a missing auxiliary.
  // Use known forms, not arbitrary -ing suffixes (sing/bring are finite verbs).
  const doubledProgressives:Record<string,string>={run:'running',swim:'swimming',begin:'beginning',sit:'sitting',stop:'stopping'};
  const progressives=new Set(['being',...Object.keys(verbs).map(base=>doubledProgressives[base] ?? (base.endsWith('e')?base.slice(0,-1)+'ing':base+'ing'))]);
  scan(/^["“‘(]*(he|she|it|they|we|you|I)\s+((?:(?:very|really|so|too|quite|loud|loudly|quiet|quietly|quick|quickly|slow|slowly|fast|hard|happy|happily|sad|sadly|careful|carefully|always|often|still|just|not)\s+){1,4})([a-z]+ing)\b/gi,m=>{
    if(!progressives.has(m[3].toLowerCase()))return;
    add('modified-progressive-fragment','Check for a missing helping verb before the -ing action. Make clear when it happens, and check the word describing how it happens.',m.index!,m[0].length,undefined,true);
  });
  // High-risk learner fragments. Ask for meaning rather than choosing a tense or inventing an object.
  scan(/(^)(he|she|it|they|we|you|I)\s+([a-z]+ing)\b/gi,m=>{
    if(['sing','bring','spring','cling','swing','ring','sting'].includes(m[3].toLowerCase()))return;
    add('missing-finite-verb','Check whether a helping verb is missing. Make clear who is doing what and when.',m.index!+m[1].length,m[0].length-m[1].length,undefined,true);
  });
  scan(/(^)(he|she|it|they|we|you|I)\s+(cheap|affordable|happy|sad|hungry|tired|beautiful|expensive|ready|angry|ill)\b/gi,m=>add('unclear-predicate','Make clear what you are describing or what the person is doing. Do not just place an adjective after the subject.',m.index!+m[1].length,m[0].length-m[1].length,undefined,true));
  scan(/\b(?:manage|buy|sell|carry|bring|take|give|find)\s+(?:very\s+)?(affordable|expensive|beautiful)\s*(?=[.!?]|$)/gi,m=>add('missing-object-context','What does this describing word refer to? Add the missing detail.',m.index!,m[0].length,undefined,true));
  scan(/(^)(he|she|it|they|we|you|I)\s+(impact|effect|influence)\s*(?=[.!?]|$)/gi,m=>add('unclear-word-role','Show how you mean to use this word: describe the action or say what has this effect.',m.index!+m[1].length,m[0].length-m[1].length,undefined,true));
  return issues;
}

function collectIssues(text:string):GrammarIssue[] {
  const spans=splitSentences(text);
  if(!spans.length)return reviewSentence(text);
  return spans.flatMap(span=>reviewSentence(span.text).map(issue=>({...issue,offset:issue.offset+span.start})))
    .sort((a,b)=>a.offset-b.offset||b.length-a.length);
}

export function reviewEnglish(text:string):LocalReview {
  // Same bound as the largest API input; prevents accidental unbounded use by future callers.
  if(text.length>4000)return {ok:false,correction:'',ambiguous:true,message:'Please keep your writing within 4,000 characters.',issues:[{rule:'length-limit',message:'Writing is too long to check.',offset:4000,length:text.length-4000,needsContext:true}]};
  const issues=collectIssues(text);
  const ambiguous=issues.some(issue=>issue.needsContext);
  let correction='';
  if(issues.length&&!ambiguous&&issues.every(issue=>issue.replacement!==undefined)){
    const edits:GrammarIssue[]=[];let conflict=false;
    for(const issue of issues){
      const overlap=edits.find(previous=>issue.offset<previous.offset+previous.length && previous.offset<issue.offset+issue.length);
      if(overlap){if(overlap.offset!==issue.offset||overlap.length!==issue.length||overlap.replacement!==issue.replacement)conflict=true;}
      else edits.push(issue);
    }
    if(!conflict){
      let candidate=text;
      for(const issue of [...edits].reverse())candidate=candidate.slice(0,issue.offset)+issue.replacement+candidate.slice(issue.offset+issue.length);
      // Withhold a partial repair if another supported issue remains. This does NOT certify correctness.
      if(candidate!==text && !collectIssues(candidate).length)correction=candidate;
    }
  }
  return {ok:!issues.length,correction,ambiguous,message:issues.length?[...new Set(issues.map(issue=>issue.message))].join(' '):'No issues detected by the available rules. Meaning and naturalness have not been verified.',issues};
}

/** Target presence is a vocabulary check, not a grammar verdict. */
export function containsTarget(text:string,word:string){
  const base=word.trim().toLowerCase();if(!base)return false;
  const forms=new Set([base]);
  if(verbs[base])for(const form of verbs[base])forms.add(form);
  if(/^[a-z]+$/.test(base)){
    if(/[^aeiou]y$/.test(base))forms.add(base.slice(0,-1)+'ies');
    else forms.add(base+(/(?:s|x|z|ch|sh)$/.test(base)?'es':'s'));
    if(verbs[base]) {
      const doubled:Record<string,string>={run:'running',swim:'swimming',begin:'beginning',sit:'sitting',stop:'stopping'};
      forms.add(doubled[base] ?? (base.endsWith('e')?base.slice(0,-1)+'ing':base+'ing'));
    }
  }
  return new RegExp('(?<![\\p{L}\\p{N}])(?:'+[...forms].map(esc).join('|')+')(?![\\p{L}\\p{N}])','iu').test(text);
}

/** Recognize a known attempted form for feedback, never as correct usage. */
export function mentionsTarget(text:string, word:string) {
  if(containsTarget(text,word))return true;
  const base=word.trim().toLowerCase();
  return Object.entries(learnerForms).some(([form,lemma])=>lemma===base && new RegExp('(?<![\\p{L}\\p{N}])'+esc(form)+'(?![\\p{L}\\p{N}])','iu').test(text));
}
