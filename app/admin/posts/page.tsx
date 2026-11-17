import Link from 'next/link';
import { adminPosts,adminComments,pageNumber } from '@/lib/admin-queries';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { validPostId } from '@/lib/post-validation';
import { notFound } from 'next/navigation';
import { ModerateContentForm } from '@/app/components/AdminControls';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string;post?:string}>}){
  await requireAdmin();const search=await searchParams;const page=pageNumber(search.page);
  if(search.post){
    if(!validPostId(search.post))notFound();
    const post=(await db.query<{id:string;content:string;is_hidden:boolean}>('SELECT id,content,is_hidden FROM community_posts WHERE id=$1',[search.post])).rows[0];if(!post)notFound();
    const comments=await adminComments(post.id);
    return <main className="page"><h1>Review community thread</h1><div className="profile-panel"><h2>Post</h2><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{post.content}</p><ModerateContentForm kind="post" id={post.id} hidden={post.is_hidden} /></div>
      <h2>Comments</h2>{comments.slice(0,100).map(comment=><article key={comment.id} className="profile-panel" style={{marginTop:16}}><strong>{comment.author}</strong><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{comment.content}</p><ModerateContentForm kind="comment" id={comment.id} hidden={comment.is_hidden} /></article>)}
      {comments.length>100&&<p>This view shows the first 100 comments. Later reported comments can be reviewed directly in the reports queue.</p>}</main>;
  }
  const posts=await adminPosts(page);
  return <main className="page"><h1>Community posts</h1>{posts.slice(0,25).map(post=><article key={post.id} className="profile-panel" style={{marginTop:16}}><strong>{post.author}</strong><p>{post.is_hidden?'Hidden':'Visible'}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{post.content}</p><Link className="secondary-btn" href={`?post=${post.id}`}>Review thread</Link><ModerateContentForm kind="post" id={post.id} hidden={post.is_hidden} /></article>)}
    <nav className="actions-row" aria-label="Post pages">{page>1&&<Link href={`?page=${page-1}`}>Newer posts</Link>}{posts.length>25&&<Link href={`?page=${page+1}`}>Older posts</Link>}</nav></main>;
}
