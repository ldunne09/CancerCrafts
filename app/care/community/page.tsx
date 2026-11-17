import Link from 'next/link';
import PostFeed from '@/app/components/PostFeed';
export const dynamic = 'force-dynamic';

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: raw } = await searchParams;
  const page = raw && /^\d{1,6}$/.test(raw) ? Math.max(1, Number(raw)) : 1;
  return <main className="page">
    <div className="page-header"><div><div className="breadcrumbs">CARE / Community</div><h1>Community Feed</h1>
      <p className="lead">A space for patient stories, care tips, and practical encouragement.</p></div>
      <Link href="/care/community/create" className="primary-btn">New post</Link></div>
    <PostFeed page={page} />
  </main>;
}
