import Link from 'next/link';
import { adminOverview } from '@/lib/admin-queries';
export default async function Page(){
  const counts=await adminOverview();
  const cards=[['Users','/admin/users',counts.users],['Posts','/admin/posts',counts.posts],['Open reports','/admin/reports',counts.reports],['Published resources','/admin/resources',counts.resources],['Listings','/admin/products',counts.listings],['Assistance requests','/admin/assistance',counts.requests]] as const;
  return <main className="page"><div className="page-header"><div><h1>Admin dashboard</h1><p className="lead">Review community reports, moderate content, and maintain resources.</p></div></div><div className="admin-grid">{cards.map(([name,href,count])=><Link className="admin-card" key={href} href={href}><h2>{name}</h2><p style={{fontSize:'2rem'}}>{count}</p></Link>)}</div></main>;
}
