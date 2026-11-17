import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { pageNumber } from '@/lib/admin-queries';
import { catalogFeed,catalogPath } from '@/lib/catalog';
import { money,type CatalogKind } from '@/lib/catalog-validation';
export default async function AdminCatalogOverview({kind,searchParams}:{kind:CatalogKind;searchParams:Promise<{page?:string}>}){
  await requireAdmin();const page=pageNumber((await searchParams).page);const {items,hasMore}=await catalogFeed(kind,undefined,page);
  return <main className="page"><h1>{kind==='listing'?'Marketplace listings':'Assistance requests'}</h1><p>Read-only overview. Listing and request edits remain restricted to their owners.</p>{items.map(item=><article key={item.id} className="profile-panel" style={{marginTop:12}}><h2>{item.title}</h2><p>{item.owner_name} · {money(item.amount)}</p><Link href={`${catalogPath(kind)}/${item.id}`} className="secondary-btn">View details</Link></article>)}<nav className="actions-row" aria-label="Catalog pages">{page>1&&<Link href={`?page=${page-1}`}>Newer items</Link>}{hasMore&&<Link href={`?page=${page+1}`}>Older items</Link>}</nav></main>;
}
