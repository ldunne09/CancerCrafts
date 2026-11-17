import { CatalogEditor } from '@/app/components/CatalogPages';
export default async function Page({params}:{params:Promise<{requestId:string}>}) {return <CatalogEditor kind="request" id={(await params).requestId} />;}
