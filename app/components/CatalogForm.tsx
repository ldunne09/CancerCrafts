'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveCatalog } from '@/app/catalog-actions';
import { assistanceCategories, listingCategories, type CatalogKind } from '@/lib/catalog-validation';

type Values = { id: string; title: string; description: string; category: string; amount: number; has_image: boolean };
export default function CatalogForm({ kind, item }: { kind: CatalogKind; item?: Values }) {
  const [state, action, pending] = useActionState(saveCatalog.bind(null,kind,item?.id || null),{});
  const [title,setTitle]=useState(item?.title || ''); const [description,setDescription]=useState(item?.description || '');
  const [amount,setAmount]=useState(item ? (item.amount/100).toFixed(2) : '');
  const [category,setCategory]=useState(item?.category || (kind==='listing'?'care-kits':'transportation'));
  const base=kind==='listing'?'/earn/marketplace':'/help/requests';
  return <form action={action} className="form-grid" aria-busy={pending}>
    <div className="field"><label htmlFor="item-title">Title</label><input id="item-title" name="title" required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} /></div>
    <div className="field"><label htmlFor="item-category">Category</label><select id="item-category" name="category" value={category} onChange={e=>setCategory(e.target.value)}>{Object.entries(kind==='listing'?listingCategories:assistanceCategories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <div className="field"><label htmlFor="item-amount">{kind==='listing'?'Price (USD)':'Goal amount (USD)'}</label><input id="item-amount" name="amount" type="number" min="0.01" max="1000000" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} /></div>
    <div className="field"><label htmlFor="item-description">Description</label><textarea id="item-description" name="description" required maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} /></div>
    <p className="meta">This description is public. Share only details you are comfortable making public.</p>
    {kind==='listing' && <><div className="field"><label htmlFor="item-image">Product image (optional)</label><input id="item-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" /><span className="meta">PNG, JPEG, or WebP, up to 2 MB.</span></div>
      {item?.has_image && <div className="checkbox-row"><input id="remove-image" type="checkbox" name="removeImage" /><label htmlFor="remove-image">Remove current image</label></div>}</>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.error && kind==='listing' && <p className="meta">If you attached an image, select it again before retrying.</p>}
    <div className="actions-row"><button type="submit" className="primary-btn" disabled={pending}>{pending?'Saving…':item?'Save changes':kind==='listing'?'Publish listing':'Publish request'}</button><Link className="secondary-btn" href={item?`${base}/${item.id}`:base}>Cancel</Link></div>
  </form>;
}
