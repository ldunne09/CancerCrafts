import { CatalogEditor } from '@/app/components/CatalogPages';
export default async function Page({params}:{params:Promise<{productId:string}>}) {return <CatalogEditor kind="listing" id={(await params).productId} />;}
