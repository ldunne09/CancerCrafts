import Link from 'next/link';

const post = {
  id: 1,
  author: 'Maya',
  role: 'survivor',
  time: '2h ago',
  tag: 'Nutrition',
  body: 'Looking for practical meal ideas for low-energy days and what has helped others maintain appetite. I’d love to talk to anyone who has found a routine that works and doesn’t feel overwhelming.',
};

const comments = [
  { author: 'Lena', body: 'Soup and smoothies helped me most during difficult treatment weeks.', time: '1h ago' },
  { author: 'Theo', body: 'A small grocery delivery service saved me on the days when I had no energy to shop.', time: '48m ago' },
];

export default function PostDetailPage() {
  return (
    <main className="page">
      <div className="breadcrumbs">CARE / Community / Post</div>
      <div className="page-header">
        <div>
          <h1>Community thread</h1>
          <p className="lead">Supportive discussion and shared strategies.</p>
        </div>
        <Link href="/care/community" className="secondary-btn">Back to feed</Link>
      </div>

      <article className="post-card" style={{ marginBottom: 18 }}>
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
          <button className="chip">♥ 24</button>
          <button className="chip">💬 7</button>
          <button className="chip">Report</button>
        </div>
      </article>

      <div className="profile-panel">
        <h3>Comments</h3>
        <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
          {comments.map((comment) => (
            <div key={comment.author} className="list-row">
              <div>
                <strong>{comment.author}</strong>
                <div className="meta">{comment.time}</div>
                <p style={{ marginTop: 8 }}>{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="field" style={{ marginTop: 20 }}>
          <label htmlFor="comment">Add a comment</label>
          <textarea id="comment" placeholder="Share a tip or words of encouragement" />
        </div>
        <button className="primary-btn" style={{ marginTop: 16 }}>Post comment</button>
      </div>
    </main>
  );
}
