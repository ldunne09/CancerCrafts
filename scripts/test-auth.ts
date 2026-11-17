import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { chromium } from 'playwright-core';
import { verifyPassword } from 'better-auth/crypto';
import { findTestEmailLink } from './email-test-helpers';

async function main() {
  const production = process.argv.includes('--production');
  loadEnvConfig(process.cwd(), !production);
  const configuredURL = process.env.TEST_BASE_URL || (production ? process.env.BETTER_AUTH_URL : 'http://localhost:3000');
  if (!configuredURL || !process.env.DATABASE_URL) throw new Error('Configure the test app URL and database connection first.');
  const baseURL: string = configuredURL;
  const email = `delivered+auth-test-${randomUUID()}@resend.dev`;
  const password = `Test-${randomUUID()}`;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const anonymous = await context.request.get('/profile', { maxRedirects: 0 });
    assert.equal(anonymous.status(), 307);
    assert.equal(anonymous.headers().location, '/login');
    await page.goto('/signup');
    await page.getByLabel('Display name').fill('Registration Tester');
    await page.getByLabel('Community role').selectOption('caregiver');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    const verificationRequired = await page.getByText('You will need to verify your email before signing in.', { exact: true }).count() > 0;
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    if (verificationRequired) {
      await page.getByRole('heading', { name: 'Check your inbox' }).waitFor();
      const rejected = await context.request.post('/api/auth/sign-in/email', { headers: { Origin: baseURL }, data: { email, password } });
      assert.equal(rejected.status(), 403);
      assert.equal(await (await context.request.get('/api/auth/get-session')).json(), null);
      const link = await findTestEmailLink(email, 'verification', baseURL);
      await page.goto(link.href);
      await page.waitForURL('**/verify-email?verified=1');
      await page.getByRole('link', { name: 'Sign in', exact: true }).last().click();
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      console.log('PASS: real verification email, unverified login rejection, and inbox-link verification');
    }
    await page.waitForURL('**/care');
    await page.getByRole('link', { name: 'PROFILE', exact: true }).click();
    await page.getByRole('heading', { name: 'Registration Tester', exact: true }).waitFor();
    assert.match(await page.innerText('main'), /caregiver/);
    assert.ok((await page.innerText('main')).includes(email));
    await page.reload();
    await page.getByRole('heading', { name: 'Registration Tester', exact: true }).waitFor();
    const users = await pool.query('select id, name, role from "user" where email = $1', [email]);
    assert.equal(users.rowCount, 1);
    assert.equal(users.rows[0].role, 'caregiver');
    const accounts = await pool.query('select password from account where "userId" = $1', [users.rows[0].id]);
    assert.notEqual(accounts.rows[0].password, password);
    assert.equal(await verifyPassword({ hash: accounts.rows[0].password, password }), true);
    console.log('PASS: browser signup, profile, persistence, role, and hashed password');

    const sessionCookie = (await context.cookies()).filter((cookie) => cookie.name.includes('session_token')).map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
    assert.ok(sessionCookie);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.waitForURL('**/login');
    const revoked = await fetch(`${baseURL}/api/auth/get-session`, { headers: { Cookie: sessionCookie } });
    assert.equal(await revoked.json(), null);
    await page.goto('/profile');
    await page.waitForURL('**/login');
    console.log('PASS: sign out revokes the database session and profile access');

    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(new URL(page.url()).pathname, '/login');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL('**/care');
    console.log('PASS: wrong password rejected and correct password signs in');

    async function signup(body: object, origin = baseURL) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const response = await context.request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: body });
        if (response.status() !== 429) return response;
        console.log('Signup rate limit active; waiting 10 seconds before the next validation check.');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
      }
      throw new Error('Signup rate limit did not reset.');
    }
    const duplicate = await signup({ email, password, name: 'Duplicate' });
    assert.ok(verificationRequired ? duplicate.status() === 200 : duplicate.status() >= 400 && duplicate.status() < 500);
    assert.equal((await pool.query('SELECT id FROM "user" WHERE email=$1',[email])).rowCount,1);
    const short = await signup({ email: `short-${email}`, password: 'short', name: 'Tester' });
    assert.equal(short.status(), 400);
    const invalidRole = await signup({ email: `role-${email}`, password, name: 'Tester', role: 'admin' });
    assert.equal(invalidRole.status(), 400);
    const blankName = await signup({ email: `blank-${email}`, password, name: '   ' });
    assert.equal(blankName.status(), 400);
    const foreignOrigin = await signup({ email: `foreign-${email}`, password, name: 'Tester' }, 'https://untrusted.example');
    assert.equal(foreignOrigin.status(), 403);
    const admin = await context.request.get('/admin');
    assert.equal(admin.status(), 404);
    if (verificationRequired) {
      const resetContext = await browser.newContext({ baseURL });
      const resetPage = await resetContext.newPage();
      await resetPage.goto('/forgot-password');
      await resetPage.getByLabel('Email', { exact: true }).fill(email);
      await resetPage.getByRole('button', { name: 'Send password reset link', exact: true }).click();
      await resetPage.getByText(/If an eligible account exists/).waitFor();
      const resetLink = await findTestEmailLink(email,'reset',baseURL);
      await resetPage.goto(resetLink.href);
      await resetPage.waitForURL(/\/reset-password\?token=/);
      const resetToken = new URL(resetPage.url()).searchParams.get('token');
      const updatedPassword = `Updated-${randomUUID()}`;
      await resetPage.getByLabel('New password', { exact: true }).fill(updatedPassword);
      await resetPage.getByLabel('Confirm new password', { exact: true }).fill(updatedPassword);
      await resetPage.getByRole('button', { name: 'Reset password', exact: true }).click();
      await resetPage.getByRole('heading', { name: 'Password updated', exact: true }).waitFor();
      assert.equal(await (await context.request.get('/api/auth/get-session')).json(),null);
      const reused = await resetContext.request.post('/api/auth/reset-password',{headers:{Origin:baseURL},data:{token:resetToken,newPassword:updatedPassword}});
      assert.equal(reused.status(),400);
      await resetPage.getByRole('link',{name:'Sign in',exact:true}).last().click();
      await resetPage.getByLabel('Email',{exact:true}).fill(email);
      await resetPage.getByLabel('Password',{exact:true}).fill(updatedPassword);
      await resetPage.getByRole('button',{name:'Sign in',exact:true}).click();
      await resetPage.waitForURL('**/care');
      await resetContext.close();
      console.log('PASS: delivered reset email, browser password reset, one-use token, revoked sessions, and new-password login');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: duplicate, short password, blank name, admin role, foreign origin, and admin access rejected');
  } finally {
    await browser.close();
    // Only remove accounts created with this run's unique test email suffix.
    const result = await pool.query('select id from "user" where email = $1 or email = $2 or email = $3 or email = $4 or email = $5', [email, `short-${email}`, `role-${email}`, `blank-${email}`, `foreign-${email}`]);
    for (const { id } of result.rows) {
      await pool.query('delete from verification where value=$1',[id]);
      await pool.query('delete from session where "userId" = $1', [id]);
      await pool.query('delete from account where "userId" = $1', [id]);
      await pool.query('delete from "user" where id = $1', [id]);
    }
    await pool.end();
  }
}
main().catch((error) => { console.error(String(error).replace(/([?&]token=)[^&\s"'\\]+/g,'$1[redacted]').replace(/(\/reset-password\/)[^?\s"'\\]+/g,'$1[redacted]')); process.exitCode = 1; });
