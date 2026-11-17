import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { listPosts, displayPost } from '@/lib/posts';
import PostCard from './PostCard';

export default async function PostFeed({ page = 1, preview = false }: { page?: number; preview?: boolean }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { posts, hasMore } = await listPosts(preview ? 3 : 20, page, session?.user.id);
  return <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
    {posts.length ? posts.map(post => <PostCard key={post.id} post={displayPost(post)} owned={post.owned} signedIn={!!session} />) :
      <div className="profile-panel"><h2>{page > 1 ? 'No more posts' : 'Start the conversation'}</h2><p>{page > 1 ? 'Return to the feed to see the latest posts.' : 'Be the first to share something helpful or ask the community for support.'}</p>
        <Link href={page > 1 ? '/care/community' : '/care/community/create'} className="secondary-btn">{page > 1 ? 'Latest posts' : 'Create a post'}</Link></div>}
    {!preview && <nav className="actions-row" aria-label="Community feed pages">
      {page > 1 && <Link href={`/care/community?page=${page - 1}`} className="secondary-btn">Newer posts</Link>}
      {hasMore && <Link href={`/care/community?page=${page + 1}`} className="secondary-btn">Older posts</Link>}
    </nav>}
    {preview && posts.length > 0 && <Link href="/care/community" className="secondary-btn">Browse all posts</Link>}
  </div>;
}
