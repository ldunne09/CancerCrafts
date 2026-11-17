import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { chromium, type BrowserContext, type Request, type APIResponse } from 'playwright-core';
import { ensureFixtureSession } from './email-test-helpers';

async function main() {
  const production = process.argv.includes('--production');
  loadEnvConfig(process.cwd(), !production);
  const configured = process.env.TEST_BASE_URL || (production ? process.env.BETTER_AUTH_URL : 'http://localhost:3000');
  if (!configured || !process.env.DATABASE_URL) throw new Error('Configure app URL and database.');
  const baseURL: string = configured;
  const run = randomUUID();
  const emails = [`delivered+profile-owner-${run}@resend.dev`, `delivered+profile-other-${run}@resend.dev`];
  const password = `Test-${run}`;
  const names = [`Profile Owner ${run}`, `Profile Other ${run}`];
  const updatedName = `Updated ${run}`;
  const location = `Profile location ${run}`;
  const bio = `Profile bio ${run}\n<script>alert('not executable')</script>`;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const owner = await browser.newContext({ baseURL });
  const other = await browser.newContext({ baseURL });
  const guest = await browser.newContext({ baseURL });
  const page = await owner.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async dialog => { errors.push('Unexpected script dialog.'); await dialog.dismiss(); });
  let ownerId = ''; let otherId = '';
  const publicPost = randomUUID(); const anonymousPost = randomUUID();
  async function replay(context: BrowserContext, request: Request, updates?: Record<string, string>) {
    let data = request.postDataBuffer()!;
    let contentType = request.headers()['content-type'];
    if (updates) {
      const parsed = await new Request(request.url(), { method: 'POST', headers: { 'Content-Type': contentType }, body: new Uint8Array(data) }).formData();
      const key = [...parsed.keys()].find(key => key === 'name' || key.endsWith('_name'));
      assert.ok(key, 'Expected a name field in the profile form.');
      const prefix = key.slice(0, -4);
      for (const [field, value] of Object.entries(updates)) parsed.set(prefix + field, value);
      const serialized = new Request(request.url(), { method: 'POST', body: parsed });
      contentType = serialized.headers.get('content-type')!;
      data = Buffer.from(await serialized.arrayBuffer());
    }
    return context.request.post(request.url(), { headers: { Origin: baseURL, 'Content-Type': contentType, 'Next-Action': request.headers()['next-action'] }, data, maxRedirects: 0 });
  }
  try {
    for (const [index, context] of [owner, other].entries()) {
      let response: APIResponse | undefined;
      for (let attempt = 0; attempt < 8; attempt++) {
        response = await context.request.post('/api/auth/sign-up/email', { headers: { Origin: baseURL }, data: { name: names[index], email: emails[index], password, role: 'supporter' } });
        if (response.status() !== 429) break;
        console.log('Waiting for signup rate limit.'); await new Promise(resolve => setTimeout(resolve, 10000));
      }
      assert.equal(response?.status(), 200);
      await ensureFixtureSession(context, pool, emails[index], password, baseURL, response!);
    }
    const users = (await pool.query('SELECT id,email,name,role,"emailVerified" FROM "user" WHERE email=ANY($1::text[])', [emails])).rows;
    const originalOwner = users.find(user => user.email === emails[0]);
    const originalOther = users.find(user => user.email === emails[1]);
    ownerId = originalOwner.id; otherId = originalOther.id;
    await pool.query('INSERT INTO community_posts(id,author_id,category,content,is_anonymous) VALUES($1,$3,$4,$5,false),($2,$3,$4,$6,true)', [publicPost,anonymousPost,ownerId,'support',`Public profile test ${run}`,`Anonymous profile test ${run}`]);
    assert.equal((await guest.request.get('/profile/edit', { maxRedirects: 0 })).status(), 307);
    await page.goto('/profile'); await page.getByRole('link', { name: 'Edit profile', exact: true }).click();
    assert.equal(await page.getByLabel('Display name', { exact: true }).inputValue(), names[0]);
    assert.equal(await page.getByLabel('Location (optional)').inputValue(), '');
    assert.equal(await page.getByLabel('Bio (optional)').inputValue(), '');
    await page.getByLabel('Display name', { exact: true }).fill(`  ${updatedName}  `);
    await page.getByLabel('Location (optional)').fill(location);
    await page.getByLabel('Bio (optional)').fill(bio);
    const saveRequest = page.waitForRequest(request => request.method() === 'POST' && !!request.headers()['next-action']);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL('**/profile?updated=1');
    const saved = await saveRequest;
    await page.getByRole('heading', { name: updatedName, exact: true }).waitFor();
    await page.reload();
    assert.ok((await page.innerText('main')).includes(location));
    assert.ok((await page.innerText('main')).includes(bio));
    assert.equal((await pool.query('SELECT name FROM "user" WHERE id=$1', [ownerId])).rows[0].name, updatedName);
    assert.deepEqual((await pool.query('SELECT location,bio FROM user_profiles WHERE user_id=$1', [ownerId])).rows[0], { location, bio });
    const session = await (await owner.request.get('/api/auth/get-session')).json();
    assert.equal(session.user.name, updatedName);
    const publicHTML = await (await guest.request.get(`/care/community/${publicPost}`)).text();
    assert.ok(publicHTML.includes(updatedName)); assert.ok(!publicHTML.includes(location)); assert.ok(!publicHTML.includes(`Profile bio ${run}`));
    const anonymousHTML = await (await guest.request.get(`/care/community/${anonymousPost}`)).text();
    assert.ok(!anonymousHTML.includes(updatedName)); assert.ok(!anonymousHTML.includes(names[0]));
    console.log('PASS: current-account form values, atomic save/reload, updated session and author name, escaped bio, and private/anonymous fields');

    const targetAttempt = await replay(other, saved, { user_id: ownerId, userId: ownerId, id: ownerId, name: `Other account ${run}`, role: 'admin', email: emails[0], emailVerified: 'true', administrator: 'true' });
    assert.ok(targetAttempt.status() < 400);
    const afterOwner = (await pool.query('SELECT name,email,role,"emailVerified" FROM "user" WHERE id=$1', [ownerId])).rows[0];
    const afterOther = (await pool.query('SELECT name,email,role,"emailVerified" FROM "user" WHERE id=$1', [otherId])).rows[0];
    assert.equal(afterOwner.name, updatedName); assert.equal(afterOther.name, `Other account ${run}`);
    assert.equal(afterOwner.email, originalOwner.email); assert.equal(afterOther.email, originalOther.email);
    assert.equal(afterOther.role, originalOther.role); assert.equal(afterOther.emailVerified, originalOther.emailVerified);
    assert.equal((await pool.query('SELECT user_id FROM administrator_permissions WHERE user_id=ANY($1::text[])', [[ownerId,otherId]])).rowCount, 0);
    const unauthorized = await replay(guest, saved, { name: `Unauthorized ${run}` });
    assert.ok(unauthorized.status() === 303 || unauthorized.headers()['x-action-redirect']?.includes('/login'));
    assert.equal((await pool.query('SELECT name FROM "user" WHERE id=$1', [ownerId])).rows[0].name, updatedName);
    const invalidInputs: Record<string, string>[] = [{ name: ' ' }, { name: 'x'.repeat(81) }, { location: 'x'.repeat(161) }, { bio: 'x'.repeat(1001) }];
    for (const updates of invalidInputs) {
      const invalid = await replay(owner, saved, updates);
      assert.ok((await invalid.text()).includes('Use a display name'));
    }
    for (const name of [' ', 'x'.repeat(81)]) {
      const invalid = await owner.request.post('/api/auth/update-user', { headers: { Origin: baseURL }, data: { name } });
      assert.equal(invalid.status(), 400);
    }
    assert.equal((await pool.query('SELECT name FROM "user" WHERE id=$1',[ownerId])).rows[0].name,updatedName);
    console.log('PASS: forged account IDs cannot target another account, privileged fields ignored, guest writes denied, and server/native-auth validation');

    await page.goto('/profile/edit');
    await page.getByLabel('Display name', { exact: true }).fill('   ');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('Bio (optional)').inputValue(), bio);
    await page.getByLabel('Display name', { exact: true }).fill(`Unsaved ${run}`);
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await page.getByRole('heading', { name: updatedName, exact: true }).waitFor();
    await page.goto('/profile/edit');
    await page.getByLabel('Location (optional)').fill(''); await page.getByLabel('Bio (optional)').fill('');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click(); await page.waitForURL('**/profile?updated=1');
    await page.reload();
    assert.deepEqual((await pool.query('SELECT location,bio FROM user_profiles WHERE user_id=$1',[ownerId])).rows[0],{location:'',bio:''});
    assert.deepEqual(errors,[]);
    console.log('PASS: failed saves preserve input, cancellation discards edits, and optional profile fields can be cleared');
  } finally {
    await browser.close();
    const users = (await pool.query('SELECT id FROM "user" WHERE email=ANY($1::text[])',[emails])).rows;
    for (const { id } of users) {
      await pool.query('DELETE FROM community_posts WHERE author_id=$1',[id]);
      await pool.query('DELETE FROM verification WHERE value=$1',[id]);
      await pool.query('DELETE FROM session WHERE "userId"=$1',[id]);
      await pool.query('DELETE FROM account WHERE "userId"=$1',[id]);
      await pool.query('DELETE FROM "user" WHERE id=$1',[id]);
      assert.equal((await pool.query('SELECT user_id FROM user_profiles WHERE user_id=$1',[id])).rowCount,0);
    }
    await pool.end();
  }
}
main().catch(error => { console.error(String(error)); process.exitCode=1; });
