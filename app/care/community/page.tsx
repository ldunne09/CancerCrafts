import Link from 'next/link';

const posts = [
  { id: 1, author: 'Maya', role: 'survivor', time: '2h ago', tag: 'Nutrition', body: 'Looking for practical meal ideas for low-energy days and what has helped others maintain appetite.', likes: 24, comments: 7 },
  { id: 2, author: 'Jonathan', role: 'caregiver', time: '5h ago', tag: 'Transportation', body: 'I’ve started a schedule for a rideshare list. Happy to coordinate with neighbors in the area.', likes: 31, comments: 9 },
  { id: 3, author: 'Ari', role: 'patient', time: '1d ago', tag: 'Support', body: 'Anyone want to compare notes on managing fatigue while balancing work and appointments?', likes: 18, comments: 4 },
];

export default function CommunityPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">CARE / Community</div>
          <h1>Community Feed</h1>
          <p className="lead">A space for patient stories, care tips, and practical encouragement.</p>
        </div>
        <Link href="/care/community/create" className="primary-btn">New post</Link>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <div className="post-header">
              <div className="user-badge">
                <div className="avatar">{post.author.charAt(0)}</div>
                <div>
                  <div>{post.author}</div>
                  <div className="meta">{post.role} • {post.time}</div>
                </div>
              </div>
              <span className="chip">{post.tag}</span>
            </div>
            <p style={{ marginTop: 16 }}>{post.body}</p>
            <div className="actions-row">
              <button className="chip">♥ {post.likes}</button>
              <button className="chip">💬 {post.comments}</button>
              <Link href={`/care/community/${post.id}`} className="chip">View thread</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
