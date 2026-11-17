import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPost, displayPost } from '@/lib/posts';
import PostCard from '@/app/components/PostCard';
import DeletePost from '@/app/components/DeletePost';
import { listComments } from '@/lib/comments';
import { CommentForm, DeleteComment, ReportForm } from '@/app/components/CommunityInteractions';

export default async function PostDetailPage({ params, searchParams }: { params: Promise<{ postId: string }>; searchParams: Promise<{ comments?: string }> }) {
  const { postId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const post = await getPost(postId, session?.user.id);
  if (!post) notFound();
  const owned = post.owned;
  const raw = (await searchParams).comments;
  const page = raw && /^\d{1,6}$/.test(raw) ? Math.max(1, Number(raw)) : 1;
  const { comments, hasMore } = await listComments(post.id, session?.user.id, page);
  return <main className="page"><div className="page-header"><div>
    <div className="breadcrumbs">CARE / Community / Post</div><h1>Community post</h1></div>
    <Link href="/care/community" className="secondary-btn">Back to feed</Link></div>
    <PostCard post={displayPost(post)} owned={owned} detail signedIn={!!session} />
    {owned && <div style={{ marginTop: 18 }}><DeletePost id={post.id} /></div>}
    <section id="comments" className="profile-panel" style={{ marginTop: 20 }}><h2>Comments</h2>
      {!comments.length && <p>No comments yet. Share some encouragement.</p>}
      {comments.map(comment => <article key={comment.id} className="post-card" style={{ marginTop: 16 }}>
        <strong>{comment.author}</strong><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{comment.content}</p>
        <div className="actions-row">{comment.owned && <DeleteComment postId={post.id} id={comment.id} />}{session && <ReportForm postId={post.id} commentId={comment.id} />}</div>
      </article>)}
      <nav className="actions-row" aria-label="Comment pages">{page > 1 && <Link href={`?comments=${page - 1}#comments`}>Previous comments</Link>}{hasMore && <Link href={`?comments=${page + 1}#comments`}>More comments</Link>}</nav>
      {session ? <CommentForm postId={post.id} /> : <Link href="/login" className="secondary-btn">Sign in to comment or send support</Link>}
    </section>
  </main>;
}
