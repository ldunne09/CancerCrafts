import Link from 'next/link';

const resources = [
  { id: 1, title: 'Cancer Support Center', type: 'Support', city: 'Seattle, WA', description: 'Peer mentoring, local counseling, and practical care coordination.' },
  { id: 2, title: 'Ride for Treatment', type: 'Transportation', city: 'Austin, TX', description: 'Volunteer drivers for appointments and infusion center visits.' },
  { id: 3, title: 'Meal Train Network', type: 'Meals', city: 'Boston, MA', description: 'Meal coordination and support for families navigating treatment.' },
  { id: 4, title: 'Caregiver Toolkit', type: 'Guidance', city: 'Remote', description: 'Checklists, planning templates, and everyday support ideas.' },
  { id: 5, title: 'Wellness Resource Library', type: 'Education', city: 'Remote', description: 'Curated guidance for symptom management and wellness.' },
  { id: 6, title: 'Practical Needs Fund', type: 'Financial Support', city: 'Denver, CO', description: 'Small emergency assistance for essentials and travel-related needs.' },
];

export default function ResourcesPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">CARE / Resources</div>
          <h1>Resources</h1>
          <p className="lead">Find trusted support, practical help, and local services.</p>
        </div>
      </div>

      <div className="resource-grid">
        {resources.map((resource) => (
          <article key={resource.id} className="resource-card">
            <div className="thumb" />
            <div className="tag">{resource.type}</div>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <div className="meta" style={{ marginTop: 10 }}>{resource.city}</div>
            <div className="actions-row">
              <Link href={`/care/resources/${resource.id}`} className="secondary-btn">View details</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
