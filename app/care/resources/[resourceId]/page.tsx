import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResource } from '@/lib/resources';
import { resourceCategories } from '@/lib/resource-validation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{resourceId:string}>}){
  const resource=await getResource((await params).resourceId);if(!resource)notFound();
  return <main className="page"><div className="page-header"><div><h1>{resource.name}</h1><p className="lead">{resourceCategories[resource.category as keyof typeof resourceCategories]} · {resource.location}</p></div><Link href="/care/resources" className="secondary-btn">Back to resources</Link></div>
    <div className="profile-panel"><h2>{resource.organization}</h2><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{resource.description}</p>{resource.phone&&<p>Phone: {resource.phone}</p>}{resource.website_url&&<a className="primary-btn" href={resource.website_url} target="_blank" rel="noreferrer noopener">Visit website</a>}</div>
  </main>;
}
