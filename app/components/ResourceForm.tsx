'use client';
import Link from 'next/link';
import { useActionState,useState } from 'react';
import { saveResource } from '@/app/admin/actions';
import { resourceCategories } from '@/lib/resource-validation';
import type { Resource } from '@/lib/resources';
export default function ResourceForm({resource}:{resource?:Resource}){
  const [state,action,pending]=useActionState(saveResource.bind(null,resource?.id||null),{});
  const [values,setValues]=useState({name:resource?.name||'',organization:resource?.organization||'',description:resource?.description||'',location:resource?.location||'',website:resource?.website_url||'',phone:resource?.phone||'',category:resource?.category||'emotional',reason:'',active:resource?.is_active??true});
  const update=(key:string,value:string|boolean)=>setValues(previous=>({...previous,[key]:value}));
  return <form action={action} className="form-grid" aria-busy={pending}>
    {(['name','organization','location','website','phone'] as const).map(key=><div className="field" key={key}><label htmlFor={`resource-${key}`}>{({name:'Resource name',organization:'Organization',location:'Location',website:'Website (HTTPS)',phone:'Phone'})[key]}</label>
      <input id={`resource-${key}`} name={key} type={key==='website'?'url':'text'} required={key==='name'} maxLength={key==='website'?2048:key==='phone'?40:160} value={values[key]} onChange={event=>update(key,event.target.value)} /></div>)}
    <div className="field"><label htmlFor="resource-category">Category</label><select name="category" id="resource-category" value={values.category} onChange={event=>update('category',event.target.value)}>{Object.entries(resourceCategories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <div className="field"><label htmlFor="resource-description">Description</label><textarea id="resource-description" name="description" required maxLength={5000} value={values.description} onChange={event=>update('description',event.target.value)} /></div>
    <div className="checkbox-row"><input id="resource-active" name="active" type="checkbox" checked={values.active} onChange={event=>update('active',event.target.checked)} /><label htmlFor="resource-active">Published in the public directory</label></div>
    <p className="meta">Confirm this resource and its contact information are accurate before publishing.</p>
    <div className="field"><label htmlFor="resource-reason">Administrative reason</label><textarea id="resource-reason" name="reason" required maxLength={1000} value={values.reason} onChange={event=>update('reason',event.target.value)} /></div>
    {state.error&&<p role="alert">{state.error}</p>}<div className="actions-row"><button className="primary-btn" type="submit" disabled={pending}>{pending?'Saving…':'Save resource'}</button><Link className="secondary-btn" href="/admin/resources">Cancel</Link></div>
  </form>;
}
