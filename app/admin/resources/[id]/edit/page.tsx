import { notFound } from 'next/navigation';
import { getResource } from '@/lib/resources';
import ResourceForm from '@/app/components/ResourceForm';
export default async function Page({params}:{params:Promise<{id:string}>}){const resource=await getResource((await params).id,true);if(!resource)notFound();return <main className="page"><h1>Edit resource</h1><div className="profile-panel"><ResourceForm resource={resource} /></div></main>;}
