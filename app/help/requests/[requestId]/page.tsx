import { CatalogDetail } from '@/app/components/CatalogPages';
export default async function Page({params}:{params:Promise<{requestId:string}>}) {return <CatalogDetail kind="request" id={(await params).requestId} />;}
