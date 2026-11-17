import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { getPost } from '@/lib/posts';
import PostForm from '@/app/components/PostForm';

export default async function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { user } = await requireSession();
  const { postId } = await params;
  const post = await getPost(postId, user.id);
  if (!post || !post.owned) notFound();
  return <main className="page"><div className="page-header"><div>
    <div className="breadcrumbs">CARE / Community / Edit</div><h1>Edit your post</h1>
  </div></div><div className="profile-panel" style={{ maxWidth: 760 }}>
    <PostForm post={{ id: post.id, category: post.category, content: post.content, is_anonymous: post.is_anonymous }} />
  </div></main>;
}
