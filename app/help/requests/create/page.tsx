import Link from 'next/link';

export default function CreateRequestPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">HELP / Requests / Create</div>
          <h1>Create an assistance request</h1>
          <p className="lead">Share what you need and invite support from your community.</p>
        </div>
        <Link href="/help/requests" className="secondary-btn">Cancel</Link>
      </div>

      <div className="profile-panel" style={{ maxWidth: 760 }}>
        <form className="form-grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" defaultValue="Transportation to treatment" />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" defaultValue="transportation">
              <option value="transportation">Transportation</option>
              <option value="meals">Meals</option>
              <option value="household">Household</option>
              <option value="financial">Financial</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="amount">Goal amount</label>
            <input id="amount" type="text" defaultValue="$800" />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" defaultValue="I need help covering rides to weekly treatment appointments and lab visits for the next month." />
          </div>
          <button type="button" className="primary-btn">Publish request</button>
        </form>
      </div>
    </main>
  );
}
