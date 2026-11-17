import Link from 'next/link';
import { pageNumber } from '@/lib/admin-queries';
import { resourceList } from '@/lib/resources';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
  const page=pageNumber((await searchParams).page);const resources=await resourceList({page},true);
  return <main className="page"><div className="page-header"><h1>Resource directory management</h1><Link className="primary-btn" href="/admin/resources/new">Add resource</Link></div><p>Published resources appear in CARE. Disable a resource to remove it from the public directory.</p>{!resources.length&&<p>No resources added yet.</p>}{resources.slice(0,24).map(resource=><article className="profile-panel" key={resource.id} style={{marginTop:12}}><h2>{resource.name}</h2><p>{resource.is_active?'Published':'Disabled'}</p><Link className="secondary-btn" href={`/admin/resources/${resource.id}/edit`}>Edit resource</Link></article>)}
    <nav className="actions-row" aria-label="Resource pages">{page>1&&<Link href={`?page=${page-1}`}>Previous resources</Link>}{resources.length>24&&<Link href={`?page=${page+1}`}>More resources</Link>}</nav></main>;
}
