const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const root=require('path').resolve(__dirname,'..');const ts=require(root+'/node_modules/typescript');
function load(path,deps={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/'+path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>deps[n]??require(n),Response,Request,Buffer,URLSearchParams,AbortSignal,fetch,...globals});return exports;}
const service=fetcher=>load('src/lib/languagetool-public.ts',{'server-only':{}},{fetch:fetcher});
const response=matches=>new Response(JSON.stringify({matches}));
const match={message:'Check the verb.',offset:4,length:4,replacements:[{value:'walks'}],rule:{id:'AGREEMENT'}};
(async()=>{
 let calls=0,body;const api=service(async(url,options)=>{assert.equal(url,'https://api.languagetool.org/v2/check');assert.equal(options.method,'POST');assert.equal(options.redirect,'error');body=options.body;calls++;return response([match]);});
 let value=await api.checkLanguageTool('u','She walk.','en-GB');assert.equal(value.matches[0].replacements[0],'walks');assert.equal(body.get('text'),'She walk.');assert.equal(body.get('language'),'en-GB');assert.equal([...body.keys()].length,2);
 assert.equal((await api.checkLanguageTool('u','She walk.','en-GB')).cached,true);assert.equal(calls,1);
 await api.checkLanguageTool('v','She walk.','en-GB');await api.checkLanguageTool('u','She walk.','en-US');assert.equal(calls,3);
 let parallelCalls=0;const parallel=service(async()=>{parallelCalls++;await new Promise(r=>setTimeout(r,10));return response([]);});await Promise.all([parallel.checkLanguageTool('u','Go!','en-GB'),parallel.checkLanguageTool('u','Go!','en-GB')]);assert.equal(parallelCalls,1);
 let limitedCalls=0;const limit=service(async()=>{limitedCalls++;return new Response('',{status:429,headers:{'retry-after':'30'}});});for(let i=0;i<2;i++)await assert.rejects(limit.checkLanguageTool('u','Go!','en-GB'),e=>e.status===429&&e.retryAfter>0);assert.equal(limitedCalls,1);
 const shared=service(async()=>response([]));for(let i=0;i<8;i++)await shared.checkLanguageTool('u','Go '+i+'!','en-GB');await assert.rejects(shared.checkLanguageTool('u','Next!','en-GB'),e=>e.status===429);
 const bytes=service(async()=>response([]));for(let i=0;i<3;i++)await bytes.checkLanguageTool('u','語'.repeat(3990)+i,'en-GB');await assert.rejects(bytes.checkLanguageTool('u','語'.repeat(3990)+'next','en-GB'),e=>e.status===429);
 for(const bad of [{}, {matches:[{...match,offset:99}]},{matches:[],warnings:{incompleteResults:true}},{matches:[{...match,replacements:[{value:42}]}]}]){const broken=service(async()=>new Response(JSON.stringify(bad)));await assert.rejects(broken.checkLanguageTool('u','She walk.','en-GB'),e=>e.status===503);}
 const timeout=service(async()=>{throw new DOMException('Timeout','TimeoutError');});await assert.rejects(timeout.checkLanguageTool('u','Go!','en-GB'),e=>e.status===503);
 const unavailable=service(async()=>new Response('',{status:500}));await assert.rejects(unavailable.checkLanguageTool('u','Go!','en-GB'),e=>e.status===503);
 await assert.rejects(api.checkLanguageTool('u','x'.repeat(4001),'en-GB'),e=>e.status===400);await assert.rejects(api.checkLanguageTool('u','Go!','fr'),e=>e.status===400);
 console.log('PASS: provider mapping, user/variant cache isolation, coalescing, byte/request limits, cooldown, invalid/incomplete responses, timeout, provider response validation.');
 if(process.argv.includes('--live')){const live=service(fetch);const result=await live.checkLanguageTool('synthetic-verification','She walk to school.','en-GB');console.log('Live synthetic check:',JSON.stringify(result));assert.ok(result.matches.length>0);}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
