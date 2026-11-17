import Link from 'next/link';
import { adminUsers,pageNumber } from '@/lib/admin-queries';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
  const page=pageNumber((await searchParams).page);const users=await adminUsers(page);
  return <main className="page"><h1>User overview</h1><p>Administrator permission is separate from community roles and can only be changed through the controlled database command.</p>{users.slice(0,50).map(user=><article className="profile-panel" key={user.id} style={{marginTop:12}}><h2>{user.name}</h2><p>{user.email}</p><p>{user.role} · {user.emailVerified?'Email verified':'Email unverified'} · {user.administrator?'Administrator':'Member'}</p></article>)}
    <nav className="actions-row" aria-label="User pages">{page>1&&<Link href={`?page=${page-1}`}>Previous users</Link>}{users.length>50&&<Link href={`?page=${page+1}`}>More users</Link>}</nav></main>;
}
