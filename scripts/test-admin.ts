import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { chromium,type BrowserContext,type Page,type Request } from 'playwright-core';

async function main(){
  const production=process.argv.includes('--production');loadEnvConfig(process.cwd(),!production);
  const configured=process.env.TEST_BASE_URL||(production?process.env.BETTER_AUTH_URL:'http://localhost:3000');
  if(!configured||!process.env.DATABASE_URL)throw new Error('Configure test URL and database.');const baseURL:string=configured;
  const run=randomUUID();const emails=[`delivered+admin-${run}@resend.dev`,`delivered+member-${run}@resend.dev`];const password=`Test-${run}`;
  const pool=new Pool({connectionString:process.env.DATABASE_URL});const browser=await chromium.launch({channel:'msedge',headless:true});
  const admin=await browser.newContext({baseURL});const member=await browser.newContext({baseURL});const guest=await browser.newContext({baseURL});
  const a=await admin.newPage();const b=await member.newPage();const errors:string[]=[];a.on('pageerror',error=>errors.push(error.message));
  const postId=randomUUID(),commentId=randomUUID(),reportId=randomUUID(),commentReportId=randomUUID();let adminId='',memberId='';
  const resourceName=`Admin test resource ${run}`;
  function access(email:string,revoke=false){
    return spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/admin-access.ts','--email',email,'--reason',`Admin security test ${run}`,...(production?['--production']:[]),...(revoke?['--revoke']:[])],{encoding:'utf8',windowsHide:true});
  }
  async function action(page:Page,name:string,scope=page.locator('main')){
    const request=page.waitForRequest(request=>request.method()==='POST'&&!!request.headers()['next-action']);
    await scope.getByRole('button',{name,exact:true}).click();return request;
  }
  async function replay(context:BrowserContext,request:Request,data=request.postDataBuffer()){
    return context.request.post(request.url(),{headers:{Origin:baseURL,'Content-Type':request.headers()['content-type'],'Next-Action':request.headers()['next-action']},data:data!,maxRedirects:0});
  }
  try{
    for(const [index,context]of[admin,member].entries()){
      let response;
      for(let attempt=0;attempt<8;attempt++){
        response=await context.request.post('/api/auth/sign-up/email',{headers:{Origin:baseURL},data:{email:emails[index],password,name:`Admin fixture ${index} ${run}`,role:'supporter'}});
        if(response.status()!==429)break;
        console.log('Waiting for signup rate limit.');await new Promise(resolve=>setTimeout(resolve,10000));
      }
      assert.equal(response!.status(),200);
      if(index===0){const refused=access(emails[0]);assert.notEqual(refused.status,0);assert.ok(refused.stderr.includes('must verify'));}
      await pool.query('UPDATE "user" SET "emailVerified"=true WHERE email=$1',[emails[index]]);
      const login=await context.request.post('/api/auth/sign-in/email',{headers:{Origin:baseURL},data:{email:emails[index],password}});assert.equal(login.status(),200);
    }
    adminId=(await pool.query('SELECT id FROM "user" WHERE email=$1',[emails[0]])).rows[0].id;
    memberId=(await pool.query('SELECT id FROM "user" WHERE email=$1',[emails[1]])).rows[0].id;
    const grant=access(emails[0]);assert.equal(grant.status,0,grant.stderr);
    const grantAgain=access(emails[0]);assert.equal(grantAgain.status,0);
    assert.equal((await pool.query('SELECT id FROM admin_audit_log WHERE target_id=$1 AND action=$2',[adminId,'grant_admin'])).rowCount,1);
    assert.equal((await guest.request.get('/admin',{maxRedirects:0})).status(),307);
    for(const path of ['/admin','/admin/reports','/admin/posts','/admin/resources','/admin/resources/new','/admin/users','/admin/audit','/admin/products','/admin/assistance']){
      assert.equal((await member.request.get(path)).status(),404,`${path} must reject a regular member`);
    }
    await member.request.post('/api/auth/update-user',{headers:{Origin:baseURL},data:{administrator:true,isAdmin:true}});
    const elevated=await member.request.post('/api/auth/update-user',{headers:{Origin:baseURL},data:{role:'admin'}});assert.equal(elevated.status(),400);
    assert.equal((await pool.query('SELECT user_id FROM administrator_permissions WHERE user_id=$1',[memberId])).rowCount,0);
    await a.goto('/profile');await a.getByRole('link',{name:'Admin dashboard',exact:true}).waitFor();
    await b.goto('/profile');assert.equal(await b.getByRole('link',{name:'Admin dashboard',exact:true}).count(),0);
    console.log('PASS: verified-only controlled grant, idempotent audit, all admin routes protected, and no profile/signup privilege escalation');

    await pool.query('INSERT INTO community_posts(id,author_id,category,content,is_anonymous) VALUES($1,$2,$3,$4,true)',[postId,memberId,'support',`Moderation post ${run}`]);
    await pool.query('INSERT INTO community_comments(id,post_id,author_id,content) VALUES($1,$2,$3,$4)',[commentId,postId,memberId,`Moderation comment ${run}`]);
    await pool.query('INSERT INTO community_reports(id,reporter_id,post_id,reason) VALUES($1,$2,$3,$4)',[reportId,adminId,postId,'privacy']);
    await pool.query('INSERT INTO community_reports(id,reporter_id,comment_id,reason) VALUES($1,$2,$3,$4)',[commentReportId,adminId,commentId,'harassment']);
    await a.goto('/admin/reports');
    let report=a.locator(`[data-report-id="${reportId}"]`);await report.getByLabel('Moderation reason').fill(`Hide reason ${run}`);
    const hidePost=await action(a,'Hide post',report);await report.getByRole('button',{name:'Restore post',exact:true}).waitFor();
    assert.equal((await guest.request.get(`/care/community/${postId}`)).status(),404);
    const feedHTML=await(await guest.request.get('/care/community')).text();assert.ok(!feedHTML.includes(`Moderation post ${run}`));
    await report.getByLabel('Moderation reason').fill(`Restore reason ${run}`);await action(a,'Restore post',report);await report.getByRole('button',{name:'Hide post',exact:true}).waitFor();
    const before=(await pool.query('SELECT count(*)::int AS count FROM admin_audit_log WHERE actor_id=$1',[adminId])).rows[0].count;
    const forged=await replay(member,hidePost);assert.ok((await forged.text()).includes('Administrator permission is required'));
    assert.equal((await pool.query('SELECT is_hidden FROM community_posts WHERE id=$1',[postId])).rows[0].is_hidden,false);
    assert.equal((await pool.query('SELECT count(*)::int AS count FROM admin_audit_log WHERE actor_id=$1',[adminId])).rows[0].count,before);
    const commentReport=a.locator(`[data-report-id="${commentReportId}"]`);await commentReport.getByLabel('Moderation reason').fill(`Hide comment ${run}`);await action(a,'Hide comment',commentReport);await commentReport.getByRole('button',{name:'Restore comment',exact:true}).waitFor();
    assert.ok(!(await(await guest.request.get(`/care/community/${postId}`)).text()).includes(`Moderation comment ${run}`));
    await commentReport.getByLabel('Moderation reason').fill(`Restore comment ${run}`);await action(a,'Restore comment',commentReport);await commentReport.getByRole('button',{name:'Hide comment',exact:true}).waitFor();
    await report.getByLabel('Resolution note').fill(`Resolved ${run}`);const resolution=await action(a,'Resolve report',report);await report.waitFor({state:'hidden'});
    assert.equal((await pool.query('SELECT status,resolved_by FROM community_reports WHERE id=$1',[reportId])).rows[0].resolved_by,adminId);
    assert.ok((await(await replay(member,resolution)).text()).includes('Administrator permission is required'));
    await a.goto('/admin/reports?status=resolved');report=a.locator(`[data-report-id="${reportId}"]`);await report.getByLabel('Resolution note').fill(`Reopen ${run}`);await action(a,'Reopen report',report);await report.waitFor({state:'hidden'});
    assert.equal((await pool.query('SELECT status FROM community_reports WHERE id=$1',[reportId])).rows[0].status,'open');
    console.log('PASS: hide/restore posts and comments, public removal, forged action rejection, report resolution/reopening, and transactional audit');

    await a.goto('/admin/resources/new');await a.getByLabel('Resource name').fill(resourceName);await a.getByLabel('Description',{exact:true}).fill(`Resource description ${run}`);await a.getByLabel('Location',{exact:true}).fill('Denver, CO');await a.getByLabel('Website (HTTPS)').fill('https://example.com/support');await a.getByLabel('Administrative reason').fill(`Create resource ${run}`);
    const createResource=await action(a,'Save resource');await a.waitForURL('**/admin/resources');
    const resourceId=(await pool.query('SELECT id FROM resources WHERE name=$1',[resourceName])).rows[0].id;
    assert.ok((await(await replay(member,createResource)).text()).includes('Administrator permission is required'));
    assert.equal((await pool.query('SELECT id FROM resources WHERE name=$1',[resourceName])).rowCount,1);
    assert.equal((await guest.request.get(`/care/resources/${resourceId}`)).status(),200);
    await b.goto(`/care/resources?q=${encodeURIComponent(resourceName)}&location=Denver`);await b.getByRole('heading',{name:resourceName,exact:true}).waitFor();
    await a.goto(`/admin/resources/${resourceId}/edit`);await a.getByLabel('Administrative reason').fill(`Update resource ${run}`);const updateResource=await action(a,'Save resource');await a.waitForURL('**/admin/resources');
    const unsafe=updateResource.postDataBuffer()!.toString().replace('https://example.com/support','javascript:alert(1)');assert.notEqual(unsafe,updateResource.postDataBuffer()!.toString());
    assert.ok((await(await replay(admin,updateResource,Buffer.from(unsafe))).text()).includes('HTTPS'));
    await a.goto(`/admin/resources/${resourceId}/edit`);await a.getByLabel('Published in the public directory').uncheck();await a.getByLabel('Administrative reason').fill(`Disable resource ${run}`);await action(a,'Save resource');await a.waitForURL('**/admin/resources');
    assert.equal((await guest.request.get(`/care/resources/${resourceId}`)).status(),404);
    await b.goto(`/care/resources?q=${encodeURIComponent(resourceName)}`);
    assert.equal(await b.getByRole('heading',{name:resourceName,exact:true}).count(),0);
    await a.goto('/admin/audit');assert.ok((await a.innerText('main')).includes(`Disable resource ${run}`));
    console.log('PASS: administrator resource create/edit/disable, public search and visibility, unsafe URL rejection, and audited resource changes');

    const secondGrant=access(emails[1]);assert.equal(secondGrant.status,0,secondGrant.stderr);
    const revoke=access(emails[0],true);assert.equal(revoke.status,0,revoke.stderr);
    assert.equal((await admin.request.get('/admin')).status(),404);
    assert.ok((await(await replay(admin,updateResource)).text()).includes('Administrator permission is required'));
    assert.equal((await pool.query('SELECT is_active FROM resources WHERE id=$1',[resourceId])).rows[0].is_active,false);
    const remaining=(await pool.query('SELECT count(*)::int AS count FROM administrator_permissions')).rows[0].count;
    if(remaining===1){const last=access(emails[1],true);assert.notEqual(last.status,0);assert.ok(last.stderr.includes('final administrator'));}
    assert.deepEqual(errors,[]);
    console.log('PASS: existing-session revocation enforced immediately; controlled grants/revocations audited; final-admin safeguard checked when applicable');
  }finally{
    await browser.close();
    const users=(await pool.query('SELECT id FROM "user" WHERE email=ANY($1::text[])',[emails])).rows.map(row=>row.id);
    // Delete only this run's isolated fixtures, including its test audit entries.
    await pool.query('DELETE FROM admin_audit_log WHERE actor_id=ANY($1::text[]) OR (target_type=$2 AND target_id=ANY($1::text[]))',[users,'administrator']);
    await pool.query('DELETE FROM resources WHERE name=$1',[resourceName]);
    await pool.query('DELETE FROM community_posts WHERE id=$1',[postId]);
    for(const id of users){await pool.query('DELETE FROM administrator_permissions WHERE user_id=$1',[id]);await pool.query('DELETE FROM verification WHERE value=$1',[id]);await pool.query('DELETE FROM session WHERE "userId"=$1',[id]);await pool.query('DELETE FROM account WHERE "userId"=$1',[id]);await pool.query('DELETE FROM "user" WHERE id=$1',[id]);}
    await pool.end();
  }
}
main().catch(error=>{console.error(String(error));process.exitCode=1;});
