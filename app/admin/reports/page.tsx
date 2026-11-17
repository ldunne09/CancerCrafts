import Link from 'next/link';
import { adminReports,pageNumber } from '@/lib/admin-queries';
import { ModerateContentForm,ResolveReportForm } from '@/app/components/AdminControls';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string;status?:string}>}){
  const search=await searchParams;const page=pageNumber(search.page);const status=['open','resolved','all'].includes(search.status||'')?search.status!:'open';
  const reports=await adminReports(page,status);
  return <main className="page"><h1>Moderation queue</h1><p>Hiding content removes it from public pages. Resolving a report records the decision separately.</p>
    <nav className="actions-row" aria-label="Report status">{['open','resolved','all'].map(value=><Link className="secondary-btn" href={`?status=${value}`} key={value}>{value}</Link>)}</nav>
    {!reports.length&&<p>No reports in this view.</p>}
    {reports.slice(0,25).map(report=><article key={report.id} className="profile-panel" style={{marginTop:20}} data-report-id={report.id}>
      <h2>Reported {report.comment_id?'comment':'post'}</h2><p>Reason: {report.reason} · Status: {report.status}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{report.details}</p>
      <blockquote style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{report.content}</blockquote><p>{report.is_hidden?'Hidden':'Visible'}{report.parent_hidden&&report.comment_id?' · Parent post is hidden':''}</p>
      <Link href={`/admin/posts?post=${report.thread_id}`} className="secondary-btn">Review thread</Link>
      <ModerateContentForm kind={report.comment_id?'comment':'post'} id={report.comment_id||report.post_id!} hidden={report.is_hidden} />
      {report.resolution_note&&<p>Previous note: {report.resolution_note}</p>}<ResolveReportForm id={report.id} resolved={report.status==='resolved'} />
    </article>)}
    <nav className="actions-row" aria-label="Report pages">{page>1&&<Link href={`?status=${status}&page=${page-1}`}>Previous reports</Link>}{reports.length>25&&<Link href={`?status=${status}&page=${page+1}`}>More reports</Link>}</nav>
  </main>;
}
