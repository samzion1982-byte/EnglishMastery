const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,extra={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,...extra});return exports;}
const lines=load('src/lib/speaking-lines.ts');
const passage=lines.beginnerLevels([],new Set(),()=>.99)[0];
const reversed=lines.targetWords(passage.text).reverse().join(' ');
const coverage=lines.passageCoverage(passage.text,reversed);
assert.ok(coverage.incomplete);
assert.equal(lines.passageCoverage(passage.text,passage.text).incomplete,false);
console.log('Reversed passage rejected by ordered completion');
const joined=lines.keywordScore(['through','notebook'],'note through book');assert.equal(joined.matched,1);
assert.equal(lines.keywordScore(['notebook'],'note book').matched,1);
console.log('Non-adjacent compound words receive no false credit');
let transcriptions=0;const user={id:'audit-user'};
const route=load('src/app/api/speaking/hear/route.ts',{
 require(id){if(id==='next/server')return {NextResponse:{json:(body,init={})=>({body,status:init.status??200})}};
 if(id.includes('speaking-lines'))return lines;
 if(id.includes('speaking-transcribe'))return {SPEAK_MODEL:'test',SpeakCheckError:class extends Error{},transcribeLine:async()=>{transcriptions++;return {heard:passage.text,silent:false}}};
 return {getSessionRole:async()=>({user,active:true}),createServerSupabase:async()=>({rpc:async()=>({data:null,error:null})})};},
 Blob,Date,JSON,Map
});
function request(live){const values=new Map([['passage',passage.text],['keywords',JSON.stringify(passage.keywords.map(w=>w.word))],['audio',new Blob([new Uint8Array(1000)],{type:'audio/wav'})],['audioMs','1000'],['live',live?'1':'0']]);return {formData:async()=>values};}
(async()=>{let result;for(let i=0;i<13;i++){result=await route.POST(request(false));assert.equal(result.status,i<12?200:429);}assert.equal(result.status,429);const before=transcriptions;for(let i=0;i<20;i++){result=await route.POST(request(true));assert.equal(result.status,429);}assert.equal(transcriptions-before,0);console.log('Normal and legacy live requests share the rate limit');})().catch(e=>{console.error(e);process.exitCode=1});
