import 'server-only';
import { createHash } from 'node:crypto';
export type LanguageToolMatch = { message:string; offset:number; length:number; replacements:string[]; rule:string };
export type LanguageToolResult = { matches:LanguageToolMatch[]; cached:boolean };
export class LanguageToolError extends Error {
  constructor(message:string,public status=503,public retryAfter=0){super(message);}
}
const cache=new Map<string,{until:number;matches:LanguageToolMatch[]}>();
const pending=new Map<string,Promise<LanguageToolResult>>();
const recent:{at:number;bytes:number}[]=[];
let cooldownUntil=0;

/** Best-effort per-process throttling; the provider also limits the shared outbound IP. */
export async function checkLanguageTool(user:string,text:string,language:'en-GB'|'en-US'):Promise<LanguageToolResult>{
  const bytes=Buffer.byteLength(text,'utf8');
  if(!text.trim()||text.length>4000||bytes>16000)throw new LanguageToolError('Use between 1 and 4,000 characters.',400);
  if(language!=='en-GB'&&language!=='en-US')throw new LanguageToolError('Choose British or American English.',400);
  const now=Date.now();
  for(const [key,entry]of cache)if(entry.until<=now)cache.delete(key);
  const key=createHash('sha256').update(JSON.stringify([user,text,language])).digest('hex');
  const saved=cache.get(key);if(saved)return {matches:saved.matches,cached:true};
  const inFlight=pending.get(key);if(inFlight)return inFlight;
  const task=run();pending.set(key,task);
  try{return await task;}finally{pending.delete(key);}
  async function run():Promise<LanguageToolResult>{
    if(cooldownUntil>now)throw new LanguageToolError('LanguageTool is temporarily rate-limited. Please wait and retry, or skip this sentence.',429,Math.ceil((cooldownUntil-now)/1000));
    while(recent.length&&recent[0].at<=now-60000)recent.shift();
    // Stay below published peak limits, with room for other traffic on this IP.
    if(recent.length>=8||recent.reduce((n,r)=>n+r.bytes,0)+bytes>40000)
      throw new LanguageToolError('The shared LanguageTool allowance is busy. Please wait a minute and try again.',429,60);
    recent.push({at:now,bytes});
    try{
      const response=await fetch('https://api.languagetool.org/v2/check',{
        method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({text,language}),signal:AbortSignal.timeout(12000),cache:'no-store',redirect:'error',
      });
      if(response.status===429){
        const header=response.headers.get('retry-after');
        const seconds=header&&/^\d+$/.test(header)?Number(header):header?Math.ceil((Date.parse(header)-Date.now())/1000):60;
        const retry=Math.max(1,Math.min(3600,Number.isFinite(seconds)?seconds:60));
        cooldownUntil=Date.now()+retry*1000;
        throw new LanguageToolError('LanguageTool has reached its shared limit. No external check was completed.',429,retry);
      }
      if(!response.ok)throw new LanguageToolError('LanguageTool is unavailable. No external check was completed.');
      const raw=await response.text();if(raw.length>1_000_000)throw new Error('Oversize response');
      const body=JSON.parse(raw);
      if(!body||!Array.isArray(body.matches)||body.matches.length>200||body.warnings?.incompleteResults===true)throw new Error('Incomplete response');
      const matches:LanguageToolMatch[]=body.matches.map((row:unknown)=>{
        if(!row||typeof row!=='object')throw new Error('Invalid match');
        const m=row as Record<string,unknown>;
        if(typeof m.message!=='string'||!m.message.trim()||m.message.length>1500||!Number.isInteger(m.offset)||!Number.isInteger(m.length))throw new Error('Invalid match');
        const offset=m.offset as number,length=m.length as number;
        if(offset<0||length<0||offset+length>text.length||!Array.isArray(m.replacements))throw new Error('Invalid range');
        const replacements=m.replacements.slice(0,5).map((r:unknown)=>{
          if(!r||typeof r!=='object'||typeof (r as {value?:unknown}).value!=='string'||(r as {value:string}).value.length>1000)throw new Error('Invalid replacement');
          return (r as {value:string}).value;
        });
        const rule=m.rule&&typeof m.rule==='object'&&typeof (m.rule as {id?:unknown}).id==='string'?(m.rule as {id:string}).id.slice(0,100):'LanguageTool';
        return {message:m.message,offset,length,replacements,rule};
      });
      cache.set(key,{until:Date.now()+5*60000,matches});while(cache.size>200)cache.delete(cache.keys().next().value!);
      return {matches,cached:false};
    }catch(error){
      if(error instanceof LanguageToolError)throw error;
      throw new LanguageToolError('LanguageTool did not complete a reliable response. Please try again later; your writing is unchanged.');
    }
  }
}
