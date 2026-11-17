import Link from 'next/link';
import HomeAccountActions from './components/HomeAccountActions';

const features = [
  {
    icon: '🤝',
    title: 'CARE community',
    text: 'Share updates, ask questions, and connect with fellow patients, caregivers, and supporters in a safe community space.',
  },
  {
    icon: '💙',
    title: 'Practical resources',
    text: 'Find trusted local support, logistics help, dietary guidance, and services designed around real patient needs.',
  },
  {
    icon: '🧩',
    title: 'HELP requests',
    text: 'Create fundraising or practical requests for transportation, meals, essentials, and other immediate assistance.',
  },
  {
    icon: '💼',
    title: 'EARN marketplace',
    text: 'List handmade goods, support services, or lifestyle products that help patients and survivors earn income.',
  },
  {
    icon: '📍',
    title: 'Local discovery',
    text: 'Filter resources and opportunities by city or region to find the help that is closest and most relevant.',
  },
  {
    icon: '🛡️',
    title: 'Moderation tools',
    text: 'Basic reporting and safety-minded moderation keep the experience helpful, respectful, and manageable.',
  },
];

const stats = [
  { label: 'Supporters online', value: '2,480' },
  { label: 'Active requests', value: '184' },
  { label: 'Marketplace sales', value: '$46K' },
  { label: 'Resources shared', value: '320' },
];

const posts = [
  { author: 'Maya', role: 'survivor', time: '2h ago', body: 'Looking for a gentle meal delivery recommendation for days when treatment leaves me exhausted.', category: 'Nutrition' },
  { author: 'Carter', role: 'caregiver', time: '4h ago', body: 'I started a local ride-share list for appointments and would love to connect with others in this area.', category: 'Transportation' },
  { author: 'Anya', role: 'patient', time: '6h ago', body: 'Anyone have a favorite way to manage side effects while staying active at work?', category: 'Wellbeing' },
];

const resources = [
  { title: 'Cancer Support Center', type: 'Local support', location: 'Seattle, WA' },
  { title: 'Transportation Assistance', type: 'Logistics', location: 'Austin, TX' },
  { title: 'Meal Train Network', type: 'Meals', location: 'Boston, MA' },
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <span className="kicker">Patient-first support</span>
          <h1>Care, connection, and practical support when it matters most.</h1>
          <p>
            CancerCrafts brings together community care, real help requests, and small income opportunities in one compassionate platform for patients and survivors.
          </p>
          <HomeAccountActions />
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric-card">
            <span className="tag">Community support</span>
            <div className="metric-value">12.4k</div>
            <div className="meta">People reached in the last 30 days</div>
          </div>
          <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
            {posts.slice(0, 2).map((post) => (
              <div key={post.author} className="small-panel">
                <div className="user-badge">
                  <div className="avatar">{post.author.charAt(0)}</div>
                  <div>
                    <div>{post.author}</div>
                    <div className="meta">{post.role} • {post.time}</div>
                  </div>
                </div>
                <p style={{ marginTop: '12px' }}>{post.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>How CancerCrafts helps</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="icon-box">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Community highlights</h2>
          <Link href="/care/community" className="secondary-btn">View feed</Link>
        </div>
        <div className="card-grid">
          {posts.map((post) => (
            <article key={post.author + post.time} className="post-card">
              <div className="post-header">
                <div className="user-badge">
                  <div className="avatar">{post.author.charAt(0)}</div>
                  <div>
                    <div>{post.author}</div>
                    <div className="meta">{post.role} • {post.time}</div>
                  </div>
                </div>
                <span className="chip">{post.category}</span>
              </div>
              <p style={{ marginTop: '16px' }}>{post.body}</p>
              <div className="actions-row">
                <button className="chip">♥ 18</button>
                <button className="chip">💬 4</button>
                <button className="chip">Report</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Helpful resources</h2>
          <Link href="/care/resources" className="secondary-btn">Explore resources</Link>
        </div>
        <div className="resource-grid">
          {resources.map((resource) => (
            <article key={resource.title} className="resource-card">
              <div className="thumb" aria-hidden="true" />
              <div className="tag">{resource.type}</div>
              <h3>{resource.title}</h3>
              <p>{resource.location}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
