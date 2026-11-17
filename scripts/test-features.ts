import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { chromium, type BrowserContext, type Page, type Request, type APIResponse } from 'playwright-core';
import { ensureFixtureSession } from './email-test-helpers';

async function main() {
  const production=process.argv.includes('--production');
  loadEnvConfig(process.cwd(),!production);
  const configured=process.env.TEST_BASE_URL||(production?process.env.BETTER_AUTH_URL:'http://localhost:3000');
  if(!configured||!process.env.DATABASE_URL)throw new Error('Configure the test URL and database.');
  const baseURL:string=configured;
  const run=randomUUID(); const emails=[`delivered+features-owner-${run}@resend.dev`,`delivered+features-reader-${run}@resend.dev`];
  const ownerName=`Feature Owner ${run}`;
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const owner=await browser.newContext({baseURL}); const reader=await browser.newContext({baseURL}); const guest=await browser.newContext({baseURL});
  const a=await owner.newPage(); const b=await reader.newPage();
  const errors:string[]=[]; for(const page of [a,b])page.on('pageerror',error=>errors.push(error.message));
  async function action(page:Page,button:string) {
    const request=page.waitForRequest(r=>r.method()==='POST'&&!!r.headers()['next-action']);
    await page.getByRole('button',{name:button,exact:true}).click();
    return request;
  }
  async function replay(context:BrowserContext,request:Request,data=request.postDataBuffer()) {
    return context.request.post(request.url(),{headers:{Origin:baseURL,'Content-Type':request.headers()['content-type'],'Next-Action':request.headers()['next-action']},data:data!,maxRedirects:0});
  }
  try {
    for(const [index,context] of [owner,reader].entries()) {
      let response:APIResponse|undefined;
      for(let attempt=0;attempt<8;attempt++) {
        response=await context.request.post('/api/auth/sign-up/email',{headers:{Origin:baseURL},data:{name:index?`Feature Reader ${run}`:ownerName,email:emails[index],password:`Test-${run}`,role:'supporter'}});
        if(response.status()!==429)break;
        console.log('Waiting for the signup rate limit to reset.'); await new Promise(resolve=>setTimeout(resolve,10000));
      }
      assert.equal(response?.status(),200);
      await ensureFixtureSession(context,pool,emails[index],`Test-${run}`,baseURL,response!);
    }
    await a.goto('/care/community/create'); await a.getByLabel('Post',{exact:true}).fill(`Feature post ${run}`); await a.getByLabel('Post anonymously').check();
    await action(a,'Publish post'); await a.waitForURL(/\/care\/community\/[0-9a-f-]{36}$/);
    const postURL=a.url(); const postId=postURL.split('/').pop()!;
    await b.goto(postURL); await b.getByLabel('Add a comment').fill(`Encouragement ${run}`); await action(b,'Post comment');
    await b.locator('#comments article').getByText(`Encouragement ${run}`,{exact:true}).waitFor();
    await b.reload(); assert.ok((await b.innerText('#comments')).includes(`Encouragement ${run}`));
    const support=await action(b,'Send support · 0'); await b.getByRole('button',{name:'Supported · 1',exact:true}).waitFor();
    await replay(reader,support);
    assert.equal((await pool.query('SELECT count(*)::int AS count FROM community_support WHERE post_id=$1',[postId])).rows[0].count,1);
    await action(b,'Supported · 1'); await b.getByRole('button',{name:'Send support · 0',exact:true}).waitFor();
    await b.getByRole('button',{name:'Report post',exact:true}).click(); await b.getByLabel('Report reason').selectOption('privacy');
    await action(b,'Submit report'); await b.getByText(/Report received/).waitFor(); await b.getByRole('button',{name:'Close report',exact:true}).click();
    await b.getByRole('button',{name:'Report comment',exact:true}).click(); await action(b,'Submit report'); await b.getByText(/Report received/).waitFor();
    assert.equal((await pool.query('SELECT count(*)::int AS count FROM community_reports WHERE post_id=$1 OR comment_id IN(SELECT id FROM community_comments WHERE post_id=$1)',[postId])).rows[0].count,2);
    await a.reload(); await a.getByLabel('Add a comment').fill(`Anonymous reply ${run}`); await action(a,'Post comment'); await a.locator('#comments article').getByText(`Anonymous reply ${run}`,{exact:true}).waitFor();
    const anonymousHTML=await(await guest.request.get(postURL)).text(); assert.ok(!anonymousHTML.includes(ownerName));
    await b.reload(); const readerComment=b.locator('#comments article').filter({hasText:`Encouragement ${run}`});
    await readerComment.getByRole('button',{name:'Delete comment',exact:true}).click();
    let forgedCommentChecked=false;
    await b.route('**/care/community/**',async route=>{
      if(route.request().method()==='POST') {
        const denied=await replay(owner,route.request());
        assert.ok((await denied.text()).includes('belongs to another user'));
        assert.equal((await pool.query('SELECT id FROM community_comments WHERE post_id=$1 AND content=$2',[postId,`Encouragement ${run}`])).rowCount,1);
        forgedCommentChecked=true;
      }
      await route.continue();
    });
    await readerComment.getByRole('button',{name:'Confirm delete comment',exact:true}).click();
    await b.getByText(`Encouragement ${run}`,{exact:true}).waitFor({state:'hidden'});
    await b.unroute('**/care/community/**'); assert.ok(forgedCommentChecked);
    console.log('PASS: comments persist, support is unique/toggles, reports persist, anonymous author replies stay anonymous, and comment deletion is scoped');

    await a.goto('/earn/sell'); await a.getByLabel('Title',{exact:true}).fill(`Listing ${run}`); await a.getByLabel('Description',{exact:true}).fill('A handmade item for the community.');
    await a.getByLabel('Price (USD)').fill('19.99');
    await a.getByLabel('Product image (optional)').setInputFiles({name:'fake.png',mimeType:'image/png',buffer:Buffer.from('<script>not an image</script>')});
    await action(a,'Publish listing'); await a.getByRole('alert').filter({hasText:'valid PNG'}).waitFor();
    assert.equal(await a.getByLabel('Title',{exact:true}).inputValue(),`Listing ${run}`);
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
    await a.getByLabel('Product image (optional)').setInputFiles({name:'product.png',mimeType:'image/png',buffer:png});
    await action(a,'Publish listing'); await a.waitForURL(/\/earn\/marketplace\/[0-9a-f-]{36}$/);
    const listingURL=a.url(); const listingId=listingURL.split('/').pop()!;
    await a.reload(); assert.ok((await a.innerText('main')).includes('$19.99'));
    const image=await guest.request.get(`/api/listings/${listingId}/image`); assert.equal(image.status(),200); assert.deepEqual(await image.body(),png);
    await a.goto('/earn/my-listings'); await a.getByRole('heading',{name:`Listing ${run}`,exact:true}).waitFor();
    assert.equal((await reader.request.get(`${listingURL}/edit`)).status(),404);
    await a.goto(`${listingURL}/edit`); await a.getByLabel('Title',{exact:true}).fill(`Edited listing ${run}`); await a.getByLabel('Price (USD)').fill('22.50');
    const editListing=await action(a,'Save changes'); await a.waitForURL(listingURL);
    assert.ok((await(await replay(reader,editListing)).text()).includes('belongs to another user'));
    const badPrice=editListing.postDataBuffer()!.toString().replace('22.50','-1');
    assert.notEqual(badPrice,editListing.postDataBuffer()!.toString());
    assert.ok((await(await replay(owner,editListing,Buffer.from(badPrice))).text()).includes('Enter a title'));
    await b.goto(listingURL); await b.getByLabel('I understand this is a simulation with no payment.').check(); await action(b,'Confirm simulated purchase'); await b.waitForURL(/\/earn\/orders\/[0-9a-f-]{36}$/);
    const orderURL=b.url(); assert.ok((await b.innerText('main')).includes('$22.50')); assert.equal((await owner.request.get(orderURL)).status(),404);
    console.log('PASS: listing creation, image storage/serving, owner listings, price editing, forged edit rejection, and buyer-only simulated order');

    await a.goto('/help/requests/create'); await a.getByLabel('Title',{exact:true}).fill(`Assistance ${run}`); await a.getByLabel('Description',{exact:true}).fill('Help with groceries and transport.'); await a.getByLabel('Goal amount (USD)').fill('100.00');
    await action(a,'Publish request'); await a.waitForURL(/\/help\/requests\/[0-9a-f-]{36}$/);
    const requestURL=a.url(); const requestId=requestURL.split('/').pop()!;
    assert.equal((await reader.request.get(`${requestURL}/edit`)).status(),404);
    await a.getByLabel('Add an update').fill(`Progress update ${run}`); const update=await action(a,'Publish update'); await a.locator('section p').filter({hasText:`Progress update ${run}`}).waitFor();
    assert.ok((await(await replay(reader,update)).text()).includes('belongs to another user'));
    await b.goto(requestURL); await b.getByLabel('Donation amount (USD)').fill('25.00'); await b.getByLabel('I understand this is a simulation with no payment.').check();
    await action(b,'Confirm simulated donation'); await b.getByText('Simulated donation saved. No money was charged.',{exact:true}).waitFor();
    await b.reload(); assert.ok((await b.innerText('main')).includes('$25.00 simulated support'));
    assert.equal(Number((await pool.query('SELECT sum(amount_cents) AS total FROM assistance_donations WHERE request_id=$1',[requestId])).rows[0].total),2500);
    await a.goto(`${requestURL}/edit`); await a.getByLabel('Goal amount (USD)').fill('150.00'); const editRequest=await action(a,'Save changes'); await a.waitForURL(requestURL);
    assert.ok((await(await replay(reader,editRequest)).text()).includes('belongs to another user'));
    for(const [url,kind] of [[requestURL,'request'],[listingURL,'listing']]) {
      let forgedDeleteChecked=false;
      await a.route(url,async route=>{
        if(route.request().method()==='POST') {
          assert.ok((await(await replay(reader,route.request())).text()).includes('belongs to another user'));
          assert.equal((await pool.query(`SELECT id FROM ${kind==='listing'?'marketplace_listings':'assistance_requests'} WHERE id=$1`,[url.split('/').pop()])).rowCount,1);
          forgedDeleteChecked=true;
        }
        await route.continue();
      });
      await a.goto(url); await a.getByRole('button',{name:`Delete ${kind}`,exact:true}).click(); const deletion=await action(a,`Confirm delete ${kind}`); await a.waitForURL(kind==='listing'?'**/earn/marketplace':'**/help/requests');
      assert.equal((await guest.request.get(url)).status(),404); assert.ok((await(await replay(reader,deletion)).text()).includes('belongs to another user'));
      await a.unroute(url); assert.ok(forgedDeleteChecked);
    }
    assert.equal((await guest.request.get(`/api/listings/${listingId}/image`)).status(),404);
    assert.equal((await pool.query('SELECT id FROM assistance_donations WHERE request_id=$1',[requestId])).rowCount,0);
    console.log('PASS: assistance creation/editing/updates, simulated donation persistence, protected ownership, cascading deletion, and image removal');
    assert.deepEqual(errors,[]);
  } finally {
    await browser.close();
    const users=await pool.query('SELECT id FROM "user" WHERE email=ANY($1::text[])',[emails]);
    for(const {id} of users.rows) {
      await pool.query('DELETE FROM community_posts WHERE author_id=$1',[id]);
      await pool.query('DELETE FROM marketplace_listings WHERE seller_id=$1',[id]);
      await pool.query('DELETE FROM assistance_requests WHERE user_id=$1',[id]);
      await pool.query('DELETE FROM session WHERE "userId"=$1',[id]); await pool.query('DELETE FROM account WHERE "userId"=$1',[id]); await pool.query('DELETE FROM "user" WHERE id=$1',[id]);
    }
    await pool.end();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
