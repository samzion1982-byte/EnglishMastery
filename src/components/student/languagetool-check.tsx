'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { LocalReview } from '@/lib/local-grammar';
import type { LanguageToolResult } from '@/lib/languagetool-public';

type CheckResult={text:string;language:string;local?:LocalReview;external?:LanguageToolResult;error?:string};
export function LanguageToolCheck({text,disabled=false}:{text:string;disabled?:boolean}){
  const id=useId();
  const [language,setLanguage]=useState<'en-GB'|'en-US'>('en-GB');
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<CheckResult|null>(null);
  const [retryAt,setRetryAt]=useState(0);
  const [seconds,setSeconds]=useState(0);
  const ticket=useRef(0),locked=useRef(false),controller=useRef<AbortController|null>(null);
  useEffect(()=>{
    ticket.current++;controller.current?.abort();locked.current=false;setBusy(false);setResult(null);
    return ()=>{ticket.current++;controller.current?.abort();};
  },[text,language]);
  useEffect(()=>{
    const update=()=>setSeconds(Math.max(0,Math.ceil((retryAt-Date.now())/1000)));
    update();if(retryAt<=Date.now())return;
    const timer=setInterval(update,1000);return()=>clearInterval(timer);
  },[retryAt]);
  async function run(){
    if(locked.current||disabled||!text.trim()||Date.now()<retryAt)return;
    locked.current=true;setBusy(true);setResult(null);
    const current=++ticket.current;const abort=new AbortController();controller.current=abort;
    const timer=setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch('/api/practice/double-check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language}),signal:abort.signal});
      const body=await response.json();if(current!==ticket.current)return;
      if(response.status===429){const retry=Number(response.headers.get('retry-after'))||60;setRetryAt(Date.now()+Math.min(3600,Math.max(1,retry))*1000);}
      if(!response.ok){setResult({text,language,local:body.local,error:body.error||'LanguageTool is unavailable. No external check was completed.'});return;}
      if(!body.local||!body.external||!Array.isArray(body.external.matches))throw new Error('Incomplete response');
      setResult({text,language,local:body.local,external:body.external});
    }catch{
      if(current===ticket.current)setResult({text,language,error:'The double-check did not complete. Your writing is unchanged; you can still use Next and Submit.'});
    }finally{
      clearTimeout(timer);if(current===ticket.current){locked.current=false;setBusy(false);}
    }
  }
  const visible=result?.text===text&&result.language===language?result:null;
  return <section className="practice-double-check" aria-label="Optional grammar double-check">
    <div className="practice-double-controls">
      <button type="button" className="s-btn ghost" disabled={disabled||busy||!text.trim()||seconds>0} onClick={()=>void run()}>{busy?'Double-checking…':seconds>0?`Try again in ${seconds}s`:'Double-check with LanguageTool'}</button>
      <label htmlFor={id}>English variant <select id={id} value={language} disabled={busy||disabled} onChange={e=>setLanguage(e.target.value as 'en-GB'|'en-US')}><option value="en-GB">British English</option><option value="en-US">American English</option></select></label>
    </div>
    <p className="field-hint">Optional: clicking sends this writing to <a href="https://languagetool.org" target="_blank" rel="noopener noreferrer">LanguageTool</a>. Avoid personal information. <a href="https://languagetool.org/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a>. Next and Submit use our own checks.</p>
    {busy&&<p role="status">Checking this writing with both checkers…</p>}
    {visible&&<div className="practice-double-results" aria-live="polite">
      {visible.local&&<div><strong>1. Our checker</strong><p>{visible.local.message}</p></div>}
      <div><strong>2. LanguageTool</strong>
        {visible.error?<p role="alert">{visible.error}</p>:visible.external&&<>
          <p>{visible.external.matches.length?`${visible.external.matches.length} possible issue${visible.external.matches.length===1?'':'s'} found.`:'No issues detected by LanguageTool. This does not guarantee correct meaning or grammar.'}{visible.external.cached?' Recent result reused for unchanged writing.':''}</p>
          <ul>{visible.external.matches.map((match,index)=><li key={`${match.offset}:${match.rule}:${index}`}>
            <p><strong>{text.slice(match.offset,match.offset+match.length)||`At character ${match.offset+1}`}</strong>: {match.message}</p>
            {match.replacements.length>0&&<p>Suggestions: {match.replacements.map(value=>value||'(remove)').join(' · ')}</p>}
          </li>)}</ul>
        </>}
      </div>
      <p className="field-hint">Review suggestions before editing. If the checkers disagree, neither result overrides the other. Suggestions are not applied automatically.</p>
    </div>}
  </section>;
}
