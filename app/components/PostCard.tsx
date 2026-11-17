import Link from 'next/link';
import { categories } from '@/lib/post-validation';
import type { DisplayPost } from '@/lib/posts';
import { ReportForm, SupportButton } from './CommunityInteractions';

export default function PostCard({ post, owned = false, detail = false, signedIn = false }: { post: DisplayPost; owned?: boolean; detail?: boolean; signedIn?: boolean }) {
  const author = post.is_anonymous ? 'Anonymous member' : post.author;
  return <article className="post-card">
    <div className="post-header"><div className="user-badge">
      <div className="avatar" aria-hidden="true">{post.is_anonymous ? '?' : author.charAt(0)}</div>
      <div><strong>{author}</strong>{owned && <span className="meta"> · Your post</span>}
        <div className="meta">{!post.is_anonymous && `${post.role} · `}<time dateTime={post.created_at.toISOString()}>{post.created_at.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Denver' })} MT</time>
          {post.updated_at.getTime() > post.created_at.getTime() && ' · Edited'}</div>
      </div></div><span className="chip">{categories[post.category]}</span></div>
    <p style={{ marginTop: 16, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{post.content}</p>
    <div className="actions-row">
      {signedIn ? <SupportButton id={post.id} supported={post.supported} count={post.support_count} /> : <span className="meta">Support · {post.support_count}</span>}
      <Link href={`/care/community/${post.id}#comments`} className="chip">Comments · {post.comment_count}</Link>
      {!detail && <Link href={`/care/community/${post.id}`} className="chip">View post</Link>}
      {owned && <Link href={`/care/community/${post.id}/edit`} className="chip">Edit post</Link>}
    </div>
    {signedIn && <ReportForm postId={post.id} />}
  </article>;
}
