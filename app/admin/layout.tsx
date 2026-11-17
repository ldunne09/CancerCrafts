import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
export const dynamic='force-dynamic';
export default async function AdminLayout({children}:{children:React.ReactNode}){
  await requireAdmin();
  return <><nav className="page actions-row" aria-label="Administration">{[['Overview','/admin'],['Reports','/admin/reports'],['Posts','/admin/posts'],['Resources','/admin/resources'],['Users','/admin/users'],['Audit log','/admin/audit']].map(([label,href])=><Link className="secondary-btn" key={href} href={href}>{label}</Link>)}</nav>{children}</>;
}
