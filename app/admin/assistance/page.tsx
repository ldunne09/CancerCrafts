import AdminCatalogOverview from '@/app/components/AdminCatalogOverview';
export default function Page({searchParams}:{searchParams:Promise<{page?:string}>}){return <AdminCatalogOverview kind="request" searchParams={searchParams} />;}
