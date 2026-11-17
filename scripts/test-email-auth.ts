import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { betterAuth } from 'better-auth';
import { createEmailVerificationToken } from 'better-auth/api';

// Uses the real auth handlers and local PostgreSQL, capturing messages only in this test.
// No test transport or token-returning endpoint is installed in the application.
async function main() {
  loadEnvConfig(process.cwd(), true);
  process.env.EMAIL_VERIFICATION_REQUIRED = 'true';
  const { auth } = await import('../lib/auth');
  const { db } = await import('../lib/db');
  const baseURL = 'http://localhost:3100';
  const email = `email-test-${randomUUID()}@example.com`;
  const password = `Initial-${randomUUID()}`;
  const newPassword = `Updated-${randomUUID()}`;
  const messages: { to: string; url: string; kind: string }[] = [];
  const testAuth = betterAuth({
    ...auth.options,
    baseURL,
    plugins: [],
    advanced: undefined,
    rateLimit: { enabled: false },
    logger: { disabled: true },
    emailAndPassword: { ...auth.options.emailAndPassword, sendResetPassword: async ({ user, url }) => { messages.push({ to: user.email, url, kind: 'reset' }); } },
    emailVerification: { ...auth.options.emailVerification, sendVerificationEmail: async ({ user, url }) => { messages.push({ to: user.email, url, kind: 'verification' }); } },
  });
  const cookies = new Map<string, string>();
  async function call(path: string, body?: object, authenticated = false) {
    const response = await testAuth.handler(new Request(`${baseURL}/api/auth${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Origin: baseURL, 'Content-Type': 'application/json', ...(authenticated ? { Cookie: [...cookies].map(([key,value]) => `${key}=${value}`).join('; ') } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    }));
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';'); const index = pair.indexOf('='); cookies.set(pair.slice(0,index),pair.slice(index+1));
    }
    return response;
  }
  try {
    assert.equal(auth.options.emailAndPassword?.requireEmailVerification, true);
    assert.equal(auth.options.emailAndPassword?.autoSignIn, false);
    assert.equal(auth.options.emailVerification?.autoSignInAfterVerification, false);
    const signup = await call('/sign-up/email', { name: 'Email Verification Tester', email, password, role: 'supporter', callbackURL: '/verify-email?verified=1' });
    assert.equal(signup.status, 200);
    assert.equal((await signup.json()).token, null);
    const user = (await db.query('SELECT id, "emailVerified" FROM "user" WHERE email = $1', [email])).rows[0];
    assert.equal(user.emailVerified, false);
    assert.equal((await db.query('SELECT id FROM session WHERE "userId"=$1',[user.id])).rowCount, 0);
    assert.equal(messages.length, 1); assert.equal(messages[0].to, email);
    const beforeVerification = await call('/sign-in/email',{email,password});
    assert.equal(beforeVerification.status,403);
    assert.equal((await beforeVerification.json()).code,'EMAIL_NOT_VERIFIED');
    console.log('PASS: signup sends verification without a session; unverified sign-in is rejected');

    const verification = new URL(messages[0].url);
    const token = verification.searchParams.get('token')!;
    const tampered = await call(`/verify-email?token=${encodeURIComponent(token.slice(0,-8)+'tampered')}`);
    assert.equal(tampered.status,401);
    const secret = (await testAuth.$context).secret;
    const expiredToken = await createEmailVerificationToken(secret,email,undefined,-5,{userId:user.id});
    assert.equal((await call(`/verify-email?token=${encodeURIComponent(expiredToken)}`)).status,401);
    assert.equal((await db.query('SELECT "emailVerified" FROM "user" WHERE id=$1',[user.id])).rows[0].emailVerified,false);
    const resend = await call('/send-verification-email',{email,callbackURL:'/verify-email?verified=1'});
    assert.equal(resend.status,200);
    assert.equal(messages.filter(message=>message.kind==='verification').length,2);
    const unknown = await call('/send-verification-email',{email:`unknown-${email}`});
    assert.equal(unknown.status,200);
    const verified = await call(verification.pathname.replace('/api/auth','')+verification.search);
    assert.equal(verified.status,302);
    assert.equal((await db.query('SELECT "emailVerified" FROM "user" WHERE id=$1',[user.id])).rows[0].emailVerified,true);
    assert.equal((await db.query('SELECT id FROM session WHERE "userId"=$1',[user.id])).rowCount,0);
    const login = await call('/sign-in/email',{email,password});
    assert.equal(login.status,200);
    assert.ok((await call('/get-session',undefined,true)).status===200);
    console.log('PASS: tampered/expired links fail, resend works, verification enables password sign-in without a link-created session');

    const startCount = messages.length;
    assert.equal((await call('/request-password-reset',{email:`unknown-${email}`,redirectTo:'/reset-password'})).status,200);
    assert.equal(messages.length,startCount);
    assert.equal((await call('/request-password-reset',{email,redirectTo:'/reset-password'})).status,200);
    const reset = [...messages].reverse().find(message=>message.kind==='reset')!;
    assert.equal(reset.to,email);
    const resetURL = new URL(reset.url);
    const resetToken = resetURL.pathname.split('/').pop()!;
    assert.equal((await call('/reset-password',{token:resetToken,newPassword:'short'})).status,400);
    assert.equal((await call('/reset-password',{token:resetToken,newPassword})).status,200);
    assert.equal(await (await call('/get-session',undefined,true)).json(),null);
    assert.equal((await db.query('SELECT id FROM session WHERE "userId"=$1',[user.id])).rowCount,0);
    assert.equal((await call('/reset-password',{token:resetToken,newPassword})).status,400);
    assert.equal((await call('/sign-in/email',{email,password})).status,401);
    assert.equal((await call('/sign-in/email',{email,password:newPassword})).status,200);
    assert.equal((await call('/request-password-reset',{email,redirectTo:'https://untrusted.example/reset'})).status,403);
    console.log('PASS: private reset requests, password validation, single-use reset tokens, session revocation, new-password login, and redirect protection');
  } finally {
    const users = await db.query('SELECT id FROM "user" WHERE email=$1',[email]);
    for (const {id} of users.rows) {
      await db.query('DELETE FROM verification WHERE value=$1',[id]);
      await db.query('DELETE FROM session WHERE "userId"=$1',[id]);
      await db.query('DELETE FROM account WHERE "userId"=$1',[id]);
      await db.query('DELETE FROM "user" WHERE id=$1',[id]);
    }
    await db.end();
  }
}
main().catch(error=>{console.error(error instanceof assert.AssertionError ? {message:error.message,actual:error.actual,expected:error.expected,stack:error.stack?.split('\n').slice(0,3).join('\n')} : 'Email auth test failed.');process.exitCode=1;});
