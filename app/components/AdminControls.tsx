'use client';
import { useActionState } from 'react';
import { moderateContent,resolveReport } from '@/app/admin/actions';

export function ModerateContentForm({kind,id,hidden}:{kind:'post'|'comment';id:string;hidden:boolean}){
  const [state,action,pending]=useActionState(moderateContent.bind(null,kind,id),{});
  return <form action={action} className="form-grid" aria-busy={pending} style={{marginTop:12}}>
    <input type="hidden" name="hidden" value={String(!hidden)} />
    <div className="field"><label>Moderation reason<textarea name="reason" required maxLength={1000} /></label></div>
    {state.error&&<p role="alert">{state.error}</p>}{state.message&&<p role="status">{state.message}</p>}
    <button className="secondary-btn" type="submit" disabled={pending}>{pending?'Saving…':`${hidden?'Restore':'Hide'} ${kind}`}</button>
  </form>;
}
export function ResolveReportForm({id,resolved}:{id:string;resolved:boolean}){
  const [state,action,pending]=useActionState(resolveReport.bind(null,id),{});
  return <form action={action} className="form-grid" aria-busy={pending} style={{marginTop:12}}>
    <input type="hidden" name="status" value={resolved?'open':'resolved'} />
    <div className="field"><label>Resolution note<textarea name="reason" required maxLength={1000} /></label></div>
    {state.error&&<p role="alert">{state.error}</p>}{state.message&&<p role="status">{state.message}</p>}
    <button className="primary-btn" type="submit" disabled={pending}>{pending?'Saving…':resolved?'Reopen report':'Resolve report'}</button>
  </form>;
}
