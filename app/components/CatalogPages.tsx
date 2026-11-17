import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';
import { catalogFeed, catalogItem, catalogPath } from '@/lib/catalog';
import { assistanceCategories, listingCategories, money, type CatalogKind } from '@/lib/catalog-validation';
import CatalogForm from './CatalogForm';
import { DeleteCatalog, RequestUpdate, SimulationForm } from './CatalogControls';

export type CatalogSearch = Promise<{page?:string;mine?:string}>;
export async function CatalogBoard({kind,searchParams,mine=false,home=false}:{kind:CatalogKind;searchParams?:CatalogSearch;mine?:boolean;home?:boolean}) {
  const search=searchParams?await searchParams:{};
  mine=mine||search.mine==='1';
  const session=mine?await requireSession():await auth.api.getSession({headers:await headers()});
  const page=search.page&&/^\d{1,6}$/.test(search.page)?Math.max(1,Number(search.page)):1;
  const {items,hasMore}=await catalogFeed(kind,session?.user.id,page,mine);
  const base=catalogPath(kind); const create=kind==='listing'?'/earn/sell':'/help/requests/create';
  const categories:Record<string,string>=kind==='listing'?listingCategories:assistanceCategories;
  return <main className="page"><div className="page-header"><div><div className="breadcrumbs">{kind==='listing'?'EARN':'HELP'}</div><h1>{home?(kind==='listing'?'EARN':'HELP'):mine?(kind==='listing'?'My listings':'My requests'):(kind==='listing'?'Marketplace':'Assistance requests')}</h1><p className="lead">{kind==='listing'?'Products and services shared by the community.':'Practical support from your community. Donation totals below are simulated.'}</p></div><Link className="primary-btn" href={create}>{kind==='listing'?'List an item':'Create request'}</Link></div>
    <nav className="actions-row" aria-label={kind==='listing'?'Marketplace navigation':'Assistance navigation'}><Link href={base} className="secondary-btn">Browse all</Link><Link href={kind==='listing'?'/earn/my-listings':`${base}?mine=1`} className="secondary-btn">{kind==='listing'?'My listings':'My requests'}</Link></nav>
    <div className="card-grid" style={{marginTop:20}}>{items.map(item=><article key={item.id} className={kind==='listing'?'product-card':'request-card'}>
      {item.has_image&&<img src={`/api/listings/${item.id}/image?v=${item.updated_at.getTime()}`} alt={item.title} style={{width:'100%',height:220,objectFit:'cover',borderRadius:12}} />}
      <span className="tag">{categories[item.category]}</span><h2>{item.title}</h2><p className="meta">by {item.owner_name}{item.owned?' · Yours':''}</p>
      <p style={{overflowWrap:'anywhere'}}>{item.description.slice(0,220)}{item.description.length>220?'…':''}</p>
      {kind==='listing'?<p className="price">{money(item.amount)}</p>:<><progress value={Math.min(item.raised,item.amount)} max={item.amount} aria-label="Simulated support progress" /><p>{money(item.raised)} simulated · Goal {money(item.amount)}</p></>}
      <Link className="primary-btn" href={`${base}/${item.id}`}>{kind==='listing'?'View item':'View request'}</Link>
    </article>)}</div>
    {!items.length&&<div className="profile-panel" style={{marginTop:20}}><h2>{mine?'Nothing published yet':'No items here yet'}</h2><p>Create the first {kind==='listing'?'listing':'request'} or return to the latest page.</p></div>}
    <nav className="actions-row" aria-label="Pages">{page>1&&<Link className="secondary-btn" href={`?page=${page-1}${mine?'&mine=1':''}`}>Newer items</Link>}{hasMore&&<Link className="secondary-btn" href={`?page=${page+1}${mine?'&mine=1':''}`}>Older items</Link>}</nav>
  </main>;
}
export async function CatalogEditor({kind,id}:{kind:CatalogKind;id?:string}) {
  const {user}=await requireSession(); const item=id?await catalogItem(kind,id,user.id):null;
  if(id&&(!item||!item.owned))notFound();
  return <main className="page"><div className="page-header"><div><h1>{id?'Edit':kind==='listing'?'Create a':'Create an assistance'} {kind==='listing'?'listing':'request'}</h1></div></div><div className="profile-panel"><CatalogForm kind={kind} item={item?{id:item.id,title:item.title,description:item.description,category:item.category,amount:item.amount,has_image:item.has_image}:undefined} /></div></main>;
}
export async function CatalogDetail({kind,id}:{kind:CatalogKind;id:string}) {
  const session=await auth.api.getSession({headers:await headers()}); const item=await catalogItem(kind,id,session?.user.id);
  if(!item)notFound(); const base=catalogPath(kind); const categories:Record<string,string>=kind==='listing'?listingCategories:assistanceCategories;
  const updates=kind==='request'?(await db.query<{id:string;content:string}>('SELECT id,content FROM assistance_updates WHERE request_id=$1 ORDER BY created_at DESC LIMIT 100',[id])).rows:[];
  return <main className="page"><div className="page-header"><div><h1>{item.title}</h1><p className="lead">{categories[item.category]} · by {item.owner_name}</p></div><Link className="secondary-btn" href={base}>Back to {kind==='listing'?'marketplace':'requests'}</Link></div>
    <div className="profile-panel">{item.has_image&&<img src={`/api/listings/${id}/image?v=${item.updated_at.getTime()}`} alt={item.title} style={{maxWidth:600,maxHeight:440,objectFit:'contain'}} />}
      <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{item.description}</p>
      <p className="price">{kind==='listing'?money(item.amount):`${money(item.raised)} simulated support · Goal ${money(item.amount)}`}</p>
      {kind==='request'&&<progress value={Math.min(item.raised,item.amount)} max={item.amount} aria-label="Simulated support progress" />}
      {item.owned&&<div className="actions-row"><Link className="secondary-btn" href={`${base}/${id}/edit`}>Edit {kind}</Link><DeleteCatalog kind={kind} id={id} /></div>}
      {session?(kind==='request'||!item.owned)&&<SimulationForm kind={kind} id={id} />:<Link className="secondary-btn" href="/login">Sign in to participate</Link>}
    </div>
    {kind==='request'&&<section className="profile-panel" style={{marginTop:20}}><h2>Request updates</h2>{updates.length?updates.map(update=><p key={update.id} style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{update.content}</p>):<p>No updates yet.</p>}{item.owned&&<RequestUpdate id={id} />}</section>}
  </main>;
}
