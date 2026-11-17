'use client';
import { useActionState, useState } from 'react';
import { deleteCatalog, donate, purchase, addRequestUpdate } from '@/app/catalog-actions';
import type { CatalogKind } from '@/lib/catalog-validation';
export function DeleteCatalog({kind,id}:{kind:CatalogKind;id:string}) {
  const [open,setOpen]=useState(false); const [state,action,pending]=useActionState(deleteCatalog.bind(null,kind,id),{});
  if(!open)return <button type="button" className="secondary-btn" onClick={()=>setOpen(true)}>Delete {kind}</button>;
  return <form action={action}><p>Permanently delete this {kind}?</p>{state.error&&<p role="alert">{state.error}</p>}<button type="submit" className="primary-btn" disabled={pending}>Confirm delete {kind}</button><button type="button" className="secondary-btn" onClick={()=>setOpen(false)}>Keep {kind}</button></form>;
}
export function SimulationForm({kind,id}:{kind:CatalogKind;id:string}) {
  const [state,action,pending]=useActionState((kind==='listing'?purchase:donate).bind(null,id),{});
  return <form action={action} className="form-grid" style={{marginTop:20}}><h2>{kind==='listing'?'Simulated checkout':'Simulated donation'}</h2>
    <p>No money will move. This is an MVP demonstration.</p>
    {kind==='request'&&<div className="field"><label htmlFor="donation-amount">Donation amount (USD)</label><input name="amount" id="donation-amount" type="number" min="0.01" max="1000000" step="0.01" required /></div>}
    <div className="checkbox-row"><input id="confirm-simulation" name="confirm" type="checkbox" required /><label htmlFor="confirm-simulation">I understand this is a simulation with no payment.</label></div>
    {state.error&&<p role="alert">{state.error}</p>}{state.message&&<p role="status">{state.message}</p>}
    <button type="submit" className="primary-btn" disabled={pending}>{pending?'Saving…':kind==='listing'?'Confirm simulated purchase':'Confirm simulated donation'}</button>
  </form>;
}
export function RequestUpdate({id}:{id:string}) {
  const [state,action,pending]=useActionState(addRequestUpdate.bind(null,id),{});
  return <form action={action} className="form-grid"><div className="field"><label htmlFor="request-update">Add an update</label><textarea name="content" id="request-update" required maxLength={2000} /></div>
    {state.error&&<p role="alert">{state.error}</p>}{state.message&&<p role="status">{state.message}</p>}<button type="submit" className="secondary-btn" disabled={pending}>Publish update</button></form>;
}
