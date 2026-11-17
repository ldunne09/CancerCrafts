import Link from 'next/link';
import { resourceList } from '@/lib/resources';
import { resourceCategories } from '@/lib/resource-validation';
import { pageNumber } from '@/lib/pagination';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string;q?:string;category?:string;location?:string}>}){
  const search=await searchParams;const page=pageNumber(search.page);
  const q=typeof search.q==='string'?search.q.slice(0,160):'';const category=typeof search.category==='string'&&Object.hasOwn(resourceCategories,search.category)?search.category:'';const location=typeof search.location==='string'?search.location.slice(0,160):'';
  const resources=await resourceList({page,q,category,location});
  const link=(page:number)=>`?${new URLSearchParams({q,category,location,page:String(page)})}`;
  return <main className="page"><div className="page-header"><div><h1>Resources</h1><p className="lead">Practical support and services published by the CancerCrafts team.</p></div></div>
    <form method="get" className="form-grid"><div className="field"><label htmlFor="resource-search">Search resources</label><input id="resource-search" name="q" defaultValue={q} maxLength={160} /></div>
      <div className="field"><label htmlFor="filter-category">Category</label><select id="filter-category" name="category" defaultValue={category}><option value="">All categories</option>{Object.entries(resourceCategories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="filter-location">Location</label><input id="filter-location" name="location" defaultValue={location} maxLength={160} /></div><button type="submit" className="primary-btn">Search</button>
    </form>
    {!resources.length&&<div className="profile-panel" style={{marginTop:20}}><p>No published resources match your search.</p></div>}
    <div className="resource-grid" style={{marginTop:20}}>{resources.slice(0,24).map(resource=><article className="resource-card" key={resource.id}><span className="tag">{resourceCategories[resource.category as keyof typeof resourceCategories]}</span><h2>{resource.name}</h2><p>{resource.organization}</p><p style={{overflowWrap:'anywhere'}}>{resource.description.slice(0,220)}</p><p className="meta">{resource.location}</p><Link href={`/care/resources/${resource.id}`} className="secondary-btn">View details</Link></article>)}</div>
    <nav className="actions-row" aria-label="Resource pages">{page>1&&<Link href={link(page-1)}>Previous resources</Link>}{resources.length>24&&<Link href={link(page+1)}>More resources</Link>}</nav>
  </main>;
}
