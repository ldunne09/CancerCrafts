import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { chromium, type Request, type BrowserContext, type APIResponse } from 'playwright-core';
import { ensureFixtureSession } from './email-test-helpers';

async function main() {
  const production = process.argv.includes('--production');
  loadEnvConfig(process.cwd(), !production);
  const baseURL = process.env.TEST_BASE_URL || (production ? process.env.BETTER_AUTH_URL : 'http://localhost:3000');
  if (!baseURL || !process.env.DATABASE_URL) throw new Error('Configure the app and database first.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const run = randomUUID();
  const emails = [`delivered+post-owner-${run}@resend.dev`, `delivered+post-reader-${run}@resend.dev`];
  const ownerName = `Owner ${run}`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const owner = await browser.newContext({ baseURL });
  const reader = await browser.newContext({ baseURL });
  const guest = await browser.newContext({ baseURL });
  const content = `Community test ${run}\nA helpful message. <script>alert('test')</script>`;
  const edited = `Edited community test ${run}`;
  const page = await owner.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  async function replay(context: BrowserContext, request: Request, data = request.postDataBuffer()) {
    const headers = request.headers();
    return context.request.post(request.url(), {
      headers: { 'Content-Type': headers['content-type'], 'Next-Action': headers['next-action'], Origin: baseURL! },
      data: data!, maxRedirects: 0,
    });
  }
  try {
    for (const [index, context] of [owner, reader].entries()) {
      const response: APIResponse = await context.request.post('/api/auth/sign-up/email', {
        headers: { Origin: baseURL }, data: { name: index ? `Reader ${run}` : ownerName, email: emails[index], password: `Test-${run}`, role: 'supporter' },
      });
      assert.equal(response.status(), 200);
      await ensureFixtureSession(context,pool,emails[index],`Test-${run}`,baseURL,response);
    }
    const unauthenticated = await guest.request.get('/care/community/create', { maxRedirects: 0 });
    assert.equal(unauthenticated.status(), 307);
    assert.equal(unauthenticated.headers().location, '/login');
    await page.goto('/care/community/create');
    await page.getByLabel('Post', { exact: true }).fill(content);
    await page.getByLabel('Category').selectOption('wellbeing');
    await page.getByLabel('Post anonymously').check();
    const createRequest = page.waitForRequest(request => request.method() === 'POST' && !!request.headers()['next-action']);
    await page.getByRole('button', { name: 'Publish post', exact: true }).click();
    await page.waitForURL(/\/care\/community\/[0-9a-f-]{36}$/);
    const postURL = page.url();
    const id = postURL.split('/').pop()!;
    const originalCreate = await createRequest;
    assert.match(await page.innerText('main'), /Anonymous member/);
    assert.equal(await page.locator('article p').innerText(), content);
    await page.reload();
    assert.ok((await page.innerText('main')).includes(content));
    assert.equal((await pool.query('SELECT content FROM community_posts WHERE id = $1', [id])).rows[0].content, content);
    const html = await (await guest.request.get(postURL)).text();
    assert.ok(!html.includes(ownerName));
    assert.ok(!html.includes(emails[0]));
    console.log('PASS: create, reload, database persistence, plain-text rendering, and anonymous identity');

    await page.goto('/care');
    assert.ok((await page.innerText('main')).includes(content));
    await page.goto('/care/community');
    assert.ok((await page.innerText('main')).includes(content));
    const readerPage = await reader.newPage();
    await readerPage.goto(postURL);
    assert.equal(await readerPage.getByRole('link', { name: 'Edit post', exact: true }).count(), 0);
    assert.equal(await readerPage.getByRole('button', { name: 'Delete post', exact: true }).count(), 0);
    assert.equal((await reader.request.get(`${postURL}/edit`)).status(), 404);
    assert.equal((await guest.request.get('/care/community/not-a-post')).status(), 404);

    await page.goto(`${postURL}/edit`);
    await page.getByLabel('Post', { exact: true }).fill(edited);
    await page.getByLabel('Category').selectOption('transportation');
    await page.getByLabel('Post anonymously').uncheck();
    const editRequest = page.waitForRequest(request => request.method() === 'POST' && !!request.headers()['next-action']);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL(postURL);
    assert.ok((await page.innerText('main')).includes(edited));
    assert.ok((await page.innerText('main')).includes(ownerName));
    const originalEdit = await editRequest;
    const forgedEdit = await replay(reader, originalEdit);
    assert.ok((await forgedEdit.text()).includes('permission'));
    assert.equal((await pool.query('SELECT category FROM community_posts WHERE id = $1', [id])).rows[0].category, 'transportation');
    const countBefore = (await pool.query('SELECT count(*)::int AS count FROM community_posts')).rows[0].count;
    await replay(guest, originalCreate);
    assert.equal((await pool.query('SELECT count(*)::int AS count FROM community_posts')).rows[0].count, countBefore);
    const emptyContent = originalCreate.postDataBuffer()!.toString().replace(content.replaceAll('\n', '\r\n'), '   ');
    assert.notEqual(emptyContent, originalCreate.postDataBuffer()!.toString());
    const invalid = await replay(owner, originalCreate, Buffer.from(emptyContent));
    assert.ok((await invalid.text()).includes('1–5,000'));
    console.log('PASS: both feeds, editing, ownership enforcement, anonymous write rejection, and server validation');

    await page.getByRole('button', { name: 'Delete post', exact: true }).click();
    await page.getByRole('button', { name: 'Keep post', exact: true }).click();
    assert.equal((await pool.query('SELECT id FROM community_posts WHERE id = $1', [id])).rowCount, 1);
    await page.getByRole('button', { name: 'Delete post', exact: true }).click();
    // Intercept the delete once so the same action can first be tested as the other account.
    let originalDelete: Request | undefined;
    await page.route('**/care/community/**', async route => {
      if (route.request().method() === 'POST') {
        originalDelete = route.request();
        await route.abort();
      } else await route.continue();
    });
    await page.getByRole('button', { name: 'Confirm delete', exact: true }).click();
    await page.waitForTimeout(300);
    assert.ok(originalDelete);
    const deniedDelete = await replay(reader, originalDelete);
    assert.ok((await deniedDelete.text()).includes('permission'));
    assert.equal((await pool.query('SELECT id FROM community_posts WHERE id = $1', [id])).rowCount, 1);
    await page.unroute('**/care/community/**');
    // The intentionally aborted request may have put React into its error boundary.
    pageErrors.length = 0;
    await page.goto(postURL);
    await page.getByRole('button', { name: 'Delete post', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm delete', exact: true }).click();
    await page.waitForURL('**/care/community');
    assert.equal((await pool.query('SELECT id FROM community_posts WHERE id = $1', [id])).rowCount, 0);
    assert.equal((await guest.request.get(postURL)).status(), 404);
    await page.goto('/care');
    assert.ok(!(await page.innerText('main')).includes(edited));
    assert.deepEqual(pageErrors, []);
    console.log('PASS: delete confirmation/cancel, forged deletion blocked, owner deletion, and feed removal');
  } finally {
    await browser.close();
    const users = await pool.query('SELECT id FROM "user" WHERE email = ANY($1::text[])', [emails]);
    for (const { id } of users.rows) {
      await pool.query('DELETE FROM community_posts WHERE author_id = $1', [id]);
      await pool.query('DELETE FROM session WHERE "userId" = $1', [id]);
      await pool.query('DELETE FROM account WHERE "userId" = $1', [id]);
      await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
    }
    await pool.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
