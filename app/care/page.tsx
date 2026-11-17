import Link from 'next/link';
import PostFeed from '@/app/components/PostFeed';
import { resourceList } from '@/lib/resources';
import { resourceCategories } from '@/lib/resource-validation';
export const dynamic = 'force-dynamic';

export default async function CarePage() {
  const resources=(await resourceList({})).slice(0,3);
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">CARE / Community</div>
          <h1>CARE</h1>
          <p className="lead">Stay connected, ask for support, and discover trusted resources.</p>
        </div>
        <Link href="/care/community/create" className="primary-btn">Create post</Link>
      </div>

      <div className="profile-grid">
        <aside className="profile-panel">
          <h3>Community</h3>
          <div className="nav" style={{ padding: 0, display: 'grid', justifyContent: 'stretch' }}>
            <Link href="/care/community" className="active">Community</Link>
            <Link href="/care/resources">Resources</Link>
          </div>
          <p className="meta">Share experiences, ask for support, and find practical encouragement.</p>
        </aside>

        <section aria-label="Recent community posts"><PostFeed preview /></section>
      </div>

      <div className="section-head">
        <h2>Resource highlights</h2>
        <Link href="/care/resources" className="secondary-btn">Browse all</Link>
      </div>
      <div className="resource-grid">
        {resources.map((resource) => (
          <article key={resource.id} className="resource-card">
            <div className="thumb" />
            <div className="tag">{resourceCategories[resource.category as keyof typeof resourceCategories]}</div>
            <h3>{resource.name}</h3>
            <p>{resource.location}</p>
            <Link href={`/care/resources/${resource.id}`} className="secondary-btn">View resource</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
