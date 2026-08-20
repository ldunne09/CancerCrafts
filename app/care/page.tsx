import Link from 'next/link';

const communityPosts = [
  { id: 1, author: 'Leah', time: '1h ago', category: 'Wellbeing', body: 'I’m looking for low-key activity ideas during infusion weeks that won’t leave me wiped out.', reactions: 24, comments: 6 },
  { id: 2, author: 'Marco', time: '3h ago', category: 'Transportation', body: 'Sharing a local volunteer driver list for appointments and infusion center visits.', reactions: 42, comments: 11 },
  { id: 3, author: 'Avery', time: '9h ago', category: 'Nutrition', body: 'Anyone have favorite recipes for quick energy during treatment days?', reactions: 17, comments: 9 },
];

const resources = [
  { title: 'Community Support Hub', type: 'Support', location: 'Brooklyn, NY' },
  { title: 'Practical Care Guide', type: 'Resource', location: 'Remote' },
  { title: 'Meal Train Directory', type: 'Meals', location: 'Chicago, IL' },
];

export default function CarePage() {
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
          <div className="summary-box" style={{ gridTemplateColumns: '1fr', marginTop: 20 }}>
            <div>
              <span className="meta">Members</span>
              <strong>12.4k</strong>
            </div>
            <div>
              <span className="meta">New this week</span>
              <strong>184</strong>
            </div>
            <div>
              <span className="meta">Reports resolved</span>
              <strong>96%</strong>
            </div>
          </div>
        </aside>

        <section style={{ display: 'grid', gap: 18 }}>
          {communityPosts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <div className="user-badge">
                  <div className="avatar">{post.author.charAt(0)}</div>
                  <div>
                    <div>{post.author}</div>
                    <div className="meta">{post.time}</div>
                  </div>
                </div>
                <span className="chip">{post.category}</span>
              </div>
              <p style={{ marginTop: 16 }}>{post.body}</p>
              <div className="actions-row">
                <button className="chip">♥ {post.reactions}</button>
                <button className="chip">💬 {post.comments}</button>
                <button className="chip">Report</button>
              </div>
            </article>
          ))}
        </section>
      </div>

      <div className="section-head">
        <h2>Resource highlights</h2>
        <Link href="/care/resources" className="secondary-btn">Browse all</Link>
      </div>
      <div className="resource-grid">
        {resources.map((resource) => (
          <article key={resource.title} className="resource-card">
            <div className="thumb" />
            <div className="tag">{resource.type}</div>
            <h3>{resource.title}</h3>
            <p>{resource.location}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
