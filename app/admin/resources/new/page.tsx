import { requireAdmin } from '@/lib/admin';
import ResourceForm from '@/app/components/ResourceForm';
export default async function Page(){await requireAdmin();return <main className="page"><h1>Add resource</h1><div className="profile-panel"><ResourceForm /></div></main>;}
