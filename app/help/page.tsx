import { CatalogBoard, type CatalogSearch } from '@/app/components/CatalogPages';
export const dynamic='force-dynamic';
export default function Page({searchParams}:{searchParams:CatalogSearch}) {return <CatalogBoard kind="request" home searchParams={searchParams} />;}
