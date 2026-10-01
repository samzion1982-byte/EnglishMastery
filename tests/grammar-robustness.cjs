// Extended regression suite for boundary handling, false positives, and API attribution.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').resolve(__dirname,'..');const ts=require(root+'/node_modules/typescript');
function load(path,deps={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/'+path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>deps[n]??require(n),Response,Request});return exports;}
const boundaries=load('src/lib/sentence-boundaries.ts');
const engine=load('src/lib/local-grammar.ts',{'./sentence-boundaries':boundaries});
const grammar=load('src/lib/grammar.ts',{'server-only':{},'./local-grammar':engine,'./sentence-boundaries':boundaries});
const {reviewEnglish:r}=engine;
let cases=0;const check=(fn)=>{fn();cases++;};
const good=[
 'I can saw wood.','I can found a company.','They can fell trees.','I have saw marks on my table.','I have spoke wheels.', '“Go!” she shouted.','She said, “Go!” and left.',
 'The U.S. election is over.','Dr. Smith lives nearby.','Mr. Jones arrived. She left.',
 'J. Smith is here.','The price is 3.30 pounds.','Meet me at 3.30. She is ready.',
 'We need fruit, e.g. apples.','The U.N. council met.','I like apples etc. and pears.',
 'Visit example.com for details.','Email sam@example.com today.',
 'If I weren’t tired, I would walk.','I wish she weren’t ill.','If she were here, we could go.',
 'I insist that she have a chance.','They suggested that he do it.','It is essential that everyone have food.',
 'Neither of them are ready.','Neither of them is ready.','The team are ready.','The team is ready.',
 'She doesn’t like tea.','They don’t like tea.','I am not ready.','We aren’t tired.',
 'She hasn’t gone home.','You weren’t there.','I had had enough.','He read a book.',
 'She singed her hair.','The sun shined on us.','I learned English.','I learnt English.',
 'We need more better books.','Most better players practise daily.','This is happier music.',
 'The bag is cheaper than that one.','It is most interesting.','Everyone is here.',
 'If everyone were ready, we could go.','I told her that she has a chance.',
 '  She goes home.  ','“She walks home.”','Birds fly. Go!',
 'They can swim.','Can flies swim?','She can read.','She had gone home.',
 'He sells cheap.','I buy cheap.','She is cheap when selling.',
];
for(const text of good)check(()=>assert.equal(r(text).ok,true,`False positive: ${text}: ${JSON.stringify(r(text))}`));
const fragments=['She Loud speaking.','He quiet talking.','They fast running.','She loudly speaking.','She very carefully writing.','I still learning.','“She Loud speaking.”'];
for(const text of fragments)check(()=>{const result=r(text);assert.equal(result.ok,false,text);assert.equal(result.ambiguous,true,text);assert.equal(result.correction,'',text);assert.ok(result.issues.some(i=>i.rule==='modified-progressive-fragment'),text);});
for(const text of ['She speaks loud.','She is speaking in a loud voice.','She is speaking loudly.','She was speaking loudly.','She is loudly speaking.','She quietly speaks.','They run fast.','She is happy speaking English.','She likes speaking.','She always brings food.','She can speak loudly.'])check(()=>assert.equal(r(text).ok,true,text));
const fixes=[
 ['Mr. Jones arrived. she left.','Mr. Jones arrived. She left.'],
 ['If it rains, I will stay home. She are ready.','If it rains, I will stay home. She is ready.'],
 ['I wish she were here. They is ready.','I wish she were here. They are ready.'],
 ['I know that she are ready.','I know that she is ready.'],
 ['If she are ready, we can go.','If she is ready, we can go.'],
 ["They hasn't went home.","They haven't gone home."],
 ["She don't like tea.","She doesn't like tea."],
 ["He don't likes tea.","He doesn't like tea."],
 ['She don’t likes tea.','She doesn’t like tea.'],
 ["They doesn't like tea.","They don't like tea."],
 ["I isn't hungry.",'I am not hungry.'],["She aren't ready.","She isn't ready."],
 ["They wasn't ready.","They weren't ready."],["He haven't eaten.","He hasn't eaten."],
 ['Everyone are here.','Everyone is here.'],['Nobody have arrived.','Nobody has arrived.'],
 ['She goed home.','She went home.'],['She has goed home.','She has gone home.'],
 ["She didn't goed home.","She didn't go home."],['He eated an apple.','He ate an apple.'],
 ['They buyed a book.','They bought a book.'],['He bringed food.','He brought food.'],
 ['She has writed a letter.','She has written a letter.'],['He can taked it.','He can take it.'],
 ['This is more happier than that.','This is happier than that.'],['This is most biggest.',''],
 ['  she walks.  ','  She walks.  '],['She goes home. he walk.','She goes home. He walks.'],
];
for(const [text,expected]of fixes)check(()=>assert.equal(r(text).correction,expected,text));
check(()=>assert.equal(boundaries.splitSentences('Meet me at 3.30. She is ready.').length,2));
check(()=>assert.equal(boundaries.splitSentences('Dr. Smith met J. Brown. She left.').length,2));
check(()=>assert.equal(boundaries.splitSentences('The U.S. election ended. She left.').length,2));
// Deliberate conservative miss: abbreviated final word may conceal a sentence boundary.
check(()=>assert.equal(r('She works for the U.N. she is proud.').issues.some(i=>i.rule==='capital'),false));
check(()=>assert.equal(r('She walks... slowly.').ok,true));
check(()=>assert.equal(r('She don’t likes tea').correction,'')); // don't advertise a partial repair
check(()=>assert.equal(r('She cheap selling.').ambiguous,true));
check(()=>assert.equal(r('x'.repeat(4001)).issues[0].rule,'length-limit'));
check(()=>assert.equal(engine.containsTarget('écar','car'),false));
check(()=>assert.equal(engine.containsTarget('car2','car'),false));
check(()=>assert.equal(engine.mentionsTarget('She goed home.','go'),true));
check(()=>assert.equal(engine.containsTarget('She goed home.','go'),false));
const unicode='🙂 She don’t likes tea.';
for(const issue of r(unicode).issues)check(()=>assert.ok(issue.offset>=0 && issue.offset+issue.length<=unicode.length));
const diff=load('src/lib/writing-diff.ts');check(()=>assert.equal(diff.writingDiff('a '.repeat(2000),'b '.repeat(2000)).length,1));
(async()=>{
 let fragmentResponse=await grammar.checkWriting('test',[{word:'loud',text:'She Loud speaking.'}]);
 check(()=>assert.equal(fragmentResponse[0].ambiguous,true));
 let results=await grammar.checkWriting('test',[{word:'go',text:''},{word:'listen',text:''}],'She goes to school. He don’t listen.');
 check(()=>assert.equal(results[0].ok,true));check(()=>assert.equal(results[0].original,'She goes to school.'));
 check(()=>assert.equal(results[1].correction,'He doesn’t listen.'));check(()=>assert.equal(results[1].original,'He don’t listen.'));
 results=await grammar.checkWriting('test',[{word:'walk',text:''}],'She walks. He walk.');
 check(()=>assert.equal(results[0].original,'She walks.\nHe walk.'));check(()=>assert.equal(results[0].correction,'She walks.\nHe walks.'));
 check(()=>assert.equal(results[0].original.slice(results[0].issues[0].offset,results[0].issues[0].offset+results[0].issues[0].length),'walk'));
 results=await grammar.checkWriting('test',[{word:'go',text:'She goed home.'}]);check(()=>assert.equal(results[0].correction,'She went home.'));
 const deps={'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'@/lib/grammar':grammar,'@/lib/practice':{},'@/lib/supabase-server':{getSessionRole:async()=>({user:{id:'test'},active:true})}};
 const route=load('src/app/api/practice/mark/route.ts',deps);const next=load('src/app/api/practice/grammar/route.ts',deps);
 const request=b=>new Request('http://test',{method:'POST',body:JSON.stringify(b)});
 let nextResponse=await next.POST(request({word:'loud',text:'She Loud speaking.'}));
 check(()=>assert.equal(nextResponse.status,200));const nextBody=await nextResponse.json();check(()=>assert.equal(nextBody.ok,false));check(()=>assert.equal(nextBody.ambiguous,true));
 for(const mode of ['sentences','story']){const resp=await route.POST(request({mode,words:[{word:'loud'}],story:mode==='story'?'She Loud speaking.':'',sentences:[{word:'loud',text:'She Loud speaking.'}]}));check(()=>assert.equal(resp.status,422));const json=await resp.json();check(()=>assert.equal(json.score,undefined));}
 let response=await route.POST(request({mode:'story',words:[{word:'go'},{word:'listen'}],story:'She goes to school. He don’t listen.',sentences:[]}));let body=await response.json();
 check(()=>assert.equal(response.status,200));check(()=>assert.equal(body.score,1));check(()=>assert.equal(body.notes[1].original,'He don’t listen.'));check(()=>assert.equal(body.notes[0].ok,true));
 response=await route.POST(request({mode:'story',words:[{word:'go'}],story:'She goes home. She cheap selling.',sentences:[]}));body=await response.json();
 check(()=>assert.equal(response.status,422));check(()=>assert.equal(body.score,undefined));check(()=>assert.equal(body.reviews[0].word,'Other sentence 1'));check(()=>assert.equal(body.reviews[0].original,'She cheap selling.'));
 response=await route.POST(request({mode:'story',words:[{word:'go'}],story:'She goes home. He don’t listen.',sentences:[]}));body=await response.json();
 check(()=>assert.equal(body.notes[0].ok,true));check(()=>assert.equal(body.passageNotes[0].original,'He don’t listen.'));
 response=await next.POST(request({word:'go',text:'She goed home.'}));body=await response.json();check(()=>assert.equal(body.correction,'She went home.'));
 response=await route.POST(request({mode:'sentences',words:[{word:'go'}],story:'',sentences:[{word:'go',text:'She goed home.'}]}));body=await response.json();check(()=>assert.equal(body.notes[0].correction,'She went home.'));
 const unauthorized=load('src/app/api/practice/grammar/route.ts',{...deps,'@/lib/supabase-server':{getSessionRole:async()=>({user:null,active:false})}});
 assert.equal((await unauthorized.POST(request({word:'go',text:'Go!'}))).status,401);
 const start=performance.now();for(let i=0;i<50;i++)r('She walks home. '.repeat(240));console.log(`PASS: ${cases} additional checks; 50 passage reviews in ${Math.round(performance.now()-start)}ms. No external service used.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
