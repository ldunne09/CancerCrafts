import Link from 'next/link';
import { adminAudit,pageNumber } from '@/lib/admin-queries';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
  const page=pageNumber((await searchParams).page);const entries=await adminAudit(page);
  return <main className="page"><h1>Administrator audit log</h1><p>Read-only history of permission changes, moderation decisions, and resource updates.</p>{entries.slice(0,50).map(entry=><article key={entry.id} className="profile-panel" style={{marginTop:12}}><h2>{entry.action.replaceAll('_',' ')}</h2><p>{entry.actor_name} · <time dateTime={entry.created_at.toISOString()}>{entry.created_at.toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Denver'})} MT</time></p><p>{entry.target_type}: {entry.target_id}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{entry.reason}</p></article>)}
    <nav className="actions-row" aria-label="Audit pages">{page>1&&<Link href={`?page=${page-1}`}>Newer entries</Link>}{entries.length>50&&<Link href={`?page=${page+1}`}>Older entries</Link>}</nav></main>;
}
