const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');const root=path.resolve(__dirname,'..');const ts=require(root+'/node_modules/typescript');
let calls=[];let matches=[];let failure=null;let active=true;
class LanguageToolError extends Error{constructor(message,status=503,retryAfter=0){super(message);this.status=status;this.retryAfter=retryAfter;}}
const deps={'next/server':{NextResponse:{json:(value,options)=>Response.json(value,options)}},'@/lib/languagetool-public':{LanguageToolError,checkLanguageTool:async(user,text,language)=>{calls.push({text,language});if(failure)throw failure;return {matches};}},'@/lib/supabase-server':{getSessionRole:async()=>({user:{id:'test'},active})},'@/lib/practice':{textUsesWord:(text,word)=>text.toLowerCase().includes(word.toLowerCase())}};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{if(!(name in deps))throw Error('Unexpected dependency (local checker must not run): '+name);return deps[name];},Response,Request});return exports;}
const next=load('src/app/api/practice/grammar/route.ts'),mark=load('src/app/api/practice/mark/route.ts');const req=body=>new Request('http://test',{method:'POST',body:JSON.stringify(body)});
const issue={offset:4,length:5,message:'Check agreement.',replacements:['trends','trended'],rule:'HE_VERB_AGR'};
(async()=>{
 let res=await next.POST(req({word:'trend',text:'She trends.',language:'en-US'}));let body=await res.json();assert.equal(body.ok,true);assert.equal(calls[0].language,'en-US');
 matches=[issue];res=await next.POST(req({word:'trend',text:'She trend.'}));body=await res.json();assert.equal(body.ok,false);assert.equal(body.matches[0].replacements[0],'trends');assert.equal(body.original,'She trend.');
 failure=new LanguageToolError('Wait',429,60);res=await next.POST(req({word:'trend',text:'She trend.'}));body=await res.json();assert.equal(res.status,429);assert.equal(body.ok,undefined);assert.equal(res.headers.get('retry-after'),'60');
 failure=null;matches=[];res=await next.POST(req({word:'trend',text:'She walks.'}));assert.equal((await res.json()).ok,false);
 calls=[];res=await mark.POST(req({mode:'sentences',words:[{word:'trend'},{word:'walk'}],sentences:[{word:'trend',text:'She trend.'},{word:'walk',text:'She walks.'}],story:'',skipped:['trend'],language:'en-GB'}));body=await res.json();assert.equal(res.status,200);assert.equal(body.score,1);assert.match(body.notes[0].teach,/Skipped/);assert.equal(calls.length,1);assert.equal(calls[0].text,'She walks.');
 matches=[issue];res=await mark.POST(req({mode:'sentences',words:[{word:'trend'}],sentences:[{word:'trend',text:'She trend.'}],story:''}));body=await res.json();assert.equal(res.status,422);assert.equal(body.reviews[0].matches.length,1);assert.equal(body.score,undefined);
 calls=[];res=await mark.POST(req({mode:'story',words:[{word:'trend'}],sentences:[],story:'She trend.'}));assert.equal(res.status,422);assert.equal(calls.length,1);
 matches=[];res=await mark.POST(req({mode:'story',words:[{word:'trend'}],sentences:[],story:'She trends.'}));assert.equal(res.status,200);
 failure=new LanguageToolError('Unavailable');res=await mark.POST(req({mode:'sentences',words:[{word:'trend'}],sentences:[{word:'trend',text:'She trends.'}],story:''}));assert.equal(res.status,503);assert.equal((await res.json()).score,undefined);
 active=false;res=await next.POST(req({word:'trend',text:'She trends.'}));assert.equal(res.status,401);
 console.log('PASS: LanguageTool-only Next/Submit, issue popup payload, pass result, skip exclusion, story check, variant selection, rate limit, service failure and auth.');
})().catch(e=>{console.error(e);process.exitCode=1;});
