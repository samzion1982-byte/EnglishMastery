import {NextResponse} from 'next/server';
import {createServerSupabase,getSessionRole} from '@/lib/supabase-server';
const LANGS=new Set(['ta','hi','ml','te','fr','kn']);
/** Read-only: students never trigger Azure requests, including for disabled languages. */
export async function GET(request:Request){
 const {user,active}=await getSessionRole();
 if(!user||!active)return NextResponse.json({error:'Unauthorized'},{status:401});
 const params=new URL(request.url).searchParams,word=(params.get('word')??'').trim().toLowerCase(),lang=params.get('lang')??'';
 if(!LANGS.has(lang)||word.length>80||!word)return NextResponse.json({error:'Invalid word or language.'},{status:400});
 const sb=await createServerSupabase();
 const result=await sb.from('core_words').select('meaning_ta,meaning_hi,auto_ta,auto_hi').eq('lemma',word).maybeSingle();
 if(result.error)return NextResponse.json({error:'Could not read saved translations.'},{status:503});
 const row=result.data;
 const legacy=lang==='ta'?(row?.meaning_ta||row?.auto_ta):lang==='hi'?(row?.meaning_hi||row?.auto_hi):null;
 if(legacy)return NextResponse.json({word,lang,text:legacy},{headers:{'Cache-Control':'private, no-cache'}});
 const {data,error}=await sb.from('word_translations').select('text,state').eq('lemma',word).eq('language',lang).maybeSingle();
 if(error)return NextResponse.json({error:'Translation storage is not ready.'},{status:503});
 return NextResponse.json({word,lang,text:data?.text??null,pending:!data||data.state==='processing'||data.state==='failed'},{headers:{'Cache-Control':'private, no-cache'}});
}
