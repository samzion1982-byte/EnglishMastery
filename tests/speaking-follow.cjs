const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
function load(file, extras={}) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, jsx:ts.JsxEmit.ReactJSX}}).outputText, {exports, ...extras});
  return exports;
}
const lines=load('src/lib/speaking-lines.ts');
const wav=load('src/lib/speak-wav.ts',{Blob});
const slots=[]; let cursor=0; let effects=[]; let intervals=[]; let processor;
const hooks={
  useState(init){const i=cursor++; if(!(i in slots)) slots[i]=typeof init==='function'?init():init; return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
  useRef(init){const i=cursor++; return slots[i]??(slots[i]={current:init});},
  useMemo(fn){cursor++; return fn();},
  useEffect(fn,deps){const i=cursor++; const old=slots[i]; if(!old || deps.some((d,j)=>d!==old.deps[j])) effects.push(()=>{old?.cleanup?.();slots[i]={deps,fn,cleanup:fn()};});}
};
const graph=[];
const node=(name)=>({connect(to){graph.push([name,to.name]);},disconnect(){},name});
class Context {
  sampleRate=48000; state='running'; destination=node('destination');
  resume(){return Promise.resolve();} close(){return Promise.resolve();}
  createMediaStreamSource(){return node('source');}
  createScriptProcessor(){return processor=node('processor');}
  createGain(){return {...node('mute'),gain:{value:1}};}
}
let recognition;
class Recognition {
 constructor(){recognition=this;}
 start(){this.starts=(this.starts||0)+1;}
 abort(){this.aborted=true;}
}
const timers=[];
let assessmentFails=false;
const spokenWords=[];let speechStops=0;
const jsx=(type,props)=>({type,props});
const component=load('src/components/student/speaking-round.tsx',{
  require(id){return id==='react'?hooks:id==='react/jsx-runtime'?{jsx,jsxs:jsx}:id==='react-dom'?{createPortal:x=>x}:id==='@/lib/speech'?{speakWord:(word)=>{spokenWords.push(word);return true;},stopDictate(){speechStops++;}}:id.includes('speaking-lines')?lines:wav;},
  window:{AudioContext:Context,webkitSpeechRecognition:Recognition,setInterval(fn){intervals.push(fn);return 1;},clearInterval(){},setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}},
  navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}},document:{body:{}},Blob,File,FormData,AbortSignal,
  fetch:async()=>{if(assessmentFails)throw new Error('offline');return ({ok:true,json:async()=>({matched:1,total:2,keywords:[{word:'apple',hit:true},{word:'river',hit:false}],heard:'apple'})});}
});
function render(){cursor=0;effects=[];const tree=component.SpeakingRound({words:[],learnedIds:new Set(),onClose(){}});effects.forEach(f=>f());return tree;}
function find(tree,predicate){if(!tree||typeof tree!=='object')return; if(predicate(tree))return tree; for(const child of [tree.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}}
function feed(peak){const data=new Float32Array(4096);for(let i=0;i<data.length;i++)data[i]=peak*Math.sin(i/10);processor.onaudioprocess({inputBuffer:{getChannelData:()=>data}});}
(async()=>{
 let tree=render();
 // Replay mount effects with retained refs, as Strict Mode does.
 for(const slot of slots)if(slot?.fn){slot.cleanup?.();slot.cleanup=slot.fn();}
 find(tree,n=>n.type==='button'&&n.props.children==='Okay').props.onClick();
 await new Promise(r=>setImmediate(r));render();
 assert.equal(recognition.starts,1,'recognition connects during countdown');
 assert.equal(processor,undefined,'official WAV capture waits for reading');
 const warmed=recognition;
 recognition.onresult({results:[{0:{transcript:'three two one '},isFinal:false}]});
 intervals.at(-1)();intervals.at(-1)();intervals.at(-1)();intervals.at(-1)();render();
 assert.equal(recognition,warmed,'countdown session survives into reading');
 assert.equal(recognition.starts,1,'no second connection at Go');
 const passage=()=>find(render(),n=>n.props?.className==='speak-passage');
 const lit=()=>passage().props.children.filter(n=>n.props.className==='is-hit').length;
 feed(0);assert.equal(lit(),0);
 for(let i=0;i<100;i++)feed(.02);
 assert.equal(lit(),0,'noise must never advance words');
 const say=(text,isFinal=false)=>recognition.onresult({results:[{0:{transcript:text},isFinal}]});
 say('three two one After');assert.equal(lit(),1,'first result highlights immediately, excluding countdown speech');
 const first=passage().props.children.find(n=>n.props.className==='is-hit');assert.equal(first.props.children,'After');
 say('After');assert.equal(lit(),1,'duplicate interim result');
 timers.at(-1)();
 assert.ok(find(render(),n=>n.props?.className?.includes('speak-live-note')).props.children.toString().includes('Waiting for new speech-recognition results'));
 assert.equal(lit(),1,'missing results do not advance highlighting');
 say('After lunch');assert.equal(lit(),2,'no second-update delay');
 const previews=()=>passage().props.children.filter(n=>n.props.className==='is-preview');
 assert.equal(previews().length,1,'prediction is bounded to one word');
 assert.equal(previews()[0].props.children,'Kim');
 for(let i=0;i<100;i++)feed(.02);assert.equal(lit(),2,'pause with background noise');
 for(let i=0;i<100;i++)feed(0);
 assert.equal(previews().length,1);
 assert.equal(previews()[0].props.children,'Kim','silence cannot move the prediction');
 say('After lunch Kim');assert.equal(lit(),3,'late word result is not lost to volume gating');
 say('After lunch');assert.equal(lit(),2,'incorrect interim word retracts');
 assert.equal(previews().length,0,'a correction cancels speculative progress');
 say('After lunch Kim',true);assert.equal(lit(),3,'final words commit');
 assert.equal(previews().length,0,'final result does not guess another word');
 recognition.onresult({results:[{0:{transcript:'After lunch Kim'},isFinal:true},{0:{transcript:'walked'},isFinal:false}]});
 assert.equal(lit(),4,'final and interim segments combine without duplication');
 recognition.onresult({results:[{0:{transcript:'After lunch Kim'},isFinal:true}]});
 assert.equal(lit(),3,'removed interim segment retracts');
 recognition.onend();timers.at(-1)();say('walked');assert.equal(lit(),4,'restart uses confirmed base immediately');
 say('walked',true);assert.equal(lit(),4);
 const restOfPassage=lines.targetWords(passage().props.children.map(n=>n.props.children).join('')).slice(3).filter(word=>word.toLowerCase()!=='moved').join(' ');
 say(restOfPassage,true);
 assert.equal(passage().props.children.find(n=>n.props.children==='moved').props.className,'is-followed','recognition gap gets progress colour, not heard status');
 assert.equal(passage().props.children.find(n=>n.props.children==='carefully').props.className,'is-hit');
 const starts=recognition.starts;const timerCount=timers.length;
 recognition.onerror({error:'network'});
 recognition.onend();assert.equal(timers.length,timerCount,'fatal errors do not loop restarts');
 assert.equal(recognition.starts,starts);
 assert.ok(find(render(),n=>n.props?.className?.includes('speak-live-note')).props.children.toString().includes('Live highlighting is unavailable'));
 const lateResult=recognition.onresult;
 assert.ok(graph.some(([a,b])=>a==='processor'&&b==='mute'));assert.ok(graph.some(([a,b])=>a==='mute'&&b==='destination'));
 const tape=slots.find(s=>s?.current?.wav)?.current;assert.ok(tape.wav().size>800);
 // Exercise the actual submission -> score -> pronunciation -> retake controls.
 find(render(),n=>n.type==='button'&&n.props.children==="I'm done").props.onClick();
 assert.ok(find(render(),n=>n.type==='h2'&&n.props.children==='Checking'));
 assert.equal(find(render(),n=>n.props?.className==='s-btn speak-pronounce'),undefined);
 await new Promise(r=>setImmediate(r));
 const scoreTree=render();
 const speaker=find(scoreTree,n=>n.props?.className==='s-btn speak-pronounce');
 assert.equal(speaker.props['aria-label'],'Hear pronunciation of river');
 assert.ok(find(scoreTree,n=>n.props?.className==='speak-result-mark'&&n.props.children==='✓'));
 assert.ok(find(scoreTree,n=>n.props?.className==='speak-result-mark'&&n.props.children==='✕'));
 speaker.props.onClick();assert.deepEqual(spokenWords,['river']);
 const stopsBefore=speechStops;
 find(scoreTree,n=>n.type==='button'&&n.props.children==='Read again').props.onClick();
 assert.equal(speechStops,stopsBefore+1,'retake stops pronunciation before recording');
 assessmentFails=true;
 render();intervals.at(-1)();intervals.at(-1)();intervals.at(-1)();intervals.at(-1)();render();
 for(let i=0;i<8;i++)feed(.02);
 find(render(),n=>n.type==='button'&&n.props.children==="I'm done").props.onClick();
 render();await new Promise(r=>setImmediate(r));
 assert.ok(find(render(),n=>n.type==='h2'&&n.props.children==='Unable to assess'));
 assert.equal(find(render(),n=>n.props?.className==='speak-result-mark'),undefined,'service failure must not show wrong answers');
 assert.ok(find(render(),n=>n.props?.onClick&&n.props.className==='s-btn primary'&&n.props.disabled));


 for(const slot of slots)slot?.cleanup?.();assert.equal(processor.onaudioprocess,null);
 assert.equal(recognition.aborted,true);
 assert.equal(recognition.onresult,null);
 lateResult({results:[{0:{transcript:'practised her new words'},isFinal:true}]});
 assert.equal(lines.followTranscript('Before school Maya', 'window umbrella'),0);
 assert.equal(lines.followTranscript('Before school Maya', 'um before school'),2);
 assert.equal(lines.followTranscript('Before school Maya', 'Maya school before'),1);
 assert.equal(lines.followTranscript('Before school Maya', ''),0);
 assert.equal(lines.followTranscript('Before school Maya', 'Maya',2),3);
 assert.equal(lines.followTranscript('The word was the word', 'the word'),2);
 assert.equal(lines.followTranscript('The word was the word', 'the word was the word'),5);
 assert.equal(lines.followTranscript('Before school', 'before schooling'),1,'similar prefixes do not count as spoken words');
 assert.equal(lines.followTranscript('She practised', 'she practiced'),2);
 console.log('Sequential recognition, noisy pauses, interim revisions, restart, failure status, WAV and cleanup passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
