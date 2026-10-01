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
let resolveMedia;let trackStops=0;let mediaRequests=0;
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
  navigator:{mediaDevices:{getUserMedia:()=>{mediaRequests++;return new Promise(resolve=>{resolveMedia=resolve;});}}},document:{body:{}},Blob,File,FormData,AbortSignal,
  fetch:async()=>{if(assessmentFails)throw new Error('offline');return ({ok:true,json:async()=>({matched:1,total:2,keywords:[{word:'apple',hit:true},{word:'river',hit:false}],heard:'apple'})});}
});
function render(){cursor=0;effects=[];const tree=component.SpeakingRound({words:[],learnedIds:new Set(),onClose(){}});effects.forEach(f=>f());return tree;}
function find(tree,predicate){if(!tree||typeof tree!=='object')return; if(predicate(tree))return tree; for(const child of [tree.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}}
function feed(peak){const data=new Float32Array(4096);for(let i=0;i<data.length;i++)data[i]=peak*Math.sin(i/10);processor.onaudioprocess({inputBuffer:{getChannelData:()=>data}});}

(async()=>{
 const tree=render();
 find(tree,n=>n.type==='button'&&n.props.children==='Okay').props.onClick();
 find(tree,n=>n.type==='button'&&n.props.children==='Okay').props.onClick();
 await new Promise(r=>setImmediate(r));
 assert.equal(mediaRequests,1,'double Okay must request only one stream');
 for(const slot of slots)slot?.cleanup?.();
 resolveMedia({getTracks:()=>[{stop(){trackStops++;}}]});
 await new Promise(r=>setImmediate(r));
 assert.equal(trackStops,1);
 assert.equal(slots.some(slot=>slot?.current?.getTracks),false);
 console.log('Late microphone permission stops the stream after modal closes');
})().catch(e=>{console.error(e);process.exitCode=1;});