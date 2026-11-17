import { CatalogDetail } from '@/app/components/CatalogPages';
export default async function Page({params}:{params:Promise<{productId:string}>}) {return <CatalogDetail kind="listing" id={(await params).productId} />;}
