const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').resolve(__dirname,'..');const ts=require(root+'/node_modules/typescript');
function load(path,deps={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/'+path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>deps[n]??require(n),Response,Request});return exports;}
const boundaries=load('src/lib/sentence-boundaries.ts');
const engine=load('src/lib/local-grammar.ts',{'./sentence-boundaries':boundaries});const {reviewEnglish:r,containsTarget}=engine;
const valid=['Birds fly.','Go!','Stop.','She walks to school.','They walk to school.','I am happy.','You are ready.','If I were rich, I would travel.','I wish she were here.','I insist that she have a chance.','He can swim.','Can flies swim?','She has gone home.','She had had a dog.','They had left.','She bought an affordable dress.','She sells things cheaply.','This is a useful book.','She is an honest person.','This is a university.','He waited an hour.','She has a one-year-old dog.','Because it rained we stayed home.','Although she was tired she finished her work.','The children are playing.','I like reading.','I sing.','They bring food.','She enjoys swimming.','She bought a red apple.','She is cheap when selling.','He read a book.','She can have some cake.','I saw the book.','It costs five pounds.','Please help me.','The meeting is at 3.30.'];
for(const text of valid)assert.equal(r(text).ok,true,'False positive: '+text+' '+JSON.stringify(r(text).issues));
const fixes=[['She walk to school.','She walks to school.'],['They walks home.','They walk home.'],['She have a book.','She has a book.'],['I is ready.','I am ready.'],['They was ready.','They were ready.'],['He can goes home.','He can go home.'],['She did not went home.','She did not go home.'],['She doesn’t likes tea.','She doesn’t like tea.'],["He doesn't likes tea.","He doesn't like tea."],['She has went home.','She has gone home.'],['I have saw it.','I have seen it.'],['She bought a apple.','She bought an apple.'],['This is an useful book.','This is a useful book.'],['This is more better.','This is better.'],['This is very cheaper.','This is much cheaper.'],['she walks.','She walks.'],['Today i walk.','Today I walk.']];
for(const [text,expected]of fixes)assert.equal(r(text).correction,expected,text);
const unclear=['she impact.','She cheap selling.','Affordable.','He tried to manage affordable.','She selling books.','They hungry.'];
for(const text of unclear){assert.equal(r(text).ambiguous,true,text);assert.equal(r(text).correction,'',text);}
assert.equal(r('She walks').ok,false);assert.equal(r('The the cat sleeps.').ok,false);
for(const [text,word]of [['She is running.','run'],['She impacted the team.','impact'],['She went home.','go'],['She bought it.','buy'],['She studies.','study'],['These are cities.','city']])assert.equal(containsTarget(text,word),true);
assert.equal(containsTarget('He buyed it.','buy'),false);assert.equal(containsTarget('The carpet is blue.','car'),false);
const grammar=load('src/lib/grammar.ts',{'server-only':{},'./local-grammar':engine,'./sentence-boundaries':boundaries});
(async()=>{
 const deps={'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@/lib/grammar':grammar,'@/lib/practice':{textUsesWord:containsTarget},'@/lib/supabase-server':{getSessionRole:async()=>({user:{id:'test'},active:true})}};
 const next=load('src/app/api/practice/grammar/route.ts',deps),mark=load('src/app/api/practice/mark/route.ts',deps);
 const req=b=>new Request('http://test',{method:'POST',body:JSON.stringify(b)});
 let response=await next.POST(req({word:'cheap',text:'She cheap selling.'}));let body=await response.json();assert.equal(body.ambiguous,true);assert.equal(body.correction,'');assert.ok(body.message);
 for(const mode of ['sentences','story']){response=await mark.POST(req({mode,words:[{word:'cheap'}],story:mode==='story'?'She cheap selling.':'',sentences:[{word:'cheap',text:'She cheap selling.'}]}));body=await response.json();assert.equal(response.status,422);assert.equal(body.score,undefined);assert.ok(body.reviews[0].message);}
 response=await mark.POST(req({mode:'sentences',words:[{word:'walk'}],story:'',sentences:[{word:'walk',text:'She walks.'}]}));body=await response.json();assert.equal(response.status,200);assert.equal(body.score,1);assert.match(body.summary,/not a grammar grade/);
 response=await next.POST(req({word:'walk',text:'x'.repeat(501)}));assert.equal(response.status,400);
 console.log('PASS: '+valid.length+' accepted sentences, '+fixes.length+' exact corrections, '+unclear.length+' clarification cases, punctuation, target forms, and Next/Submit integration. No network or API key used.');
})().catch(e=>{console.error(e);process.exitCode=1;});
