import assert from 'node:assert/strict';
import { Resend } from 'resend';
import type { APIResponse, BrowserContext } from 'playwright-core';
import type { Pool } from 'pg';

export async function findTestEmailLink(email: string, purpose: 'verification' | 'reset', origin: string) {
  if (!/^delivered\+[^@]+@resend\.dev$/.test(email)) throw new Error('Only Resend test recipients are allowed.');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = purpose === 'verification' ? 'Verify your CancerCrafts email' : 'Reset your CancerCrafts password';
  for (let attempt = 0; attempt < 25; attempt++) {
    const list = await resend.emails.list({ limit: 100 });
    if (list.error && list.error.name !== 'rate_limit_exceeded') throw new Error('Cannot inspect test email delivery.');
    const message = list.data?.data.find(item => item.to.includes(email) && item.subject === subject);
    if (message) {
      const details = await resend.emails.get(message.id);
      const match = details.data?.text?.match(/https?:\/\/[^\s]+/);
      if (match && details.data && ['delivered','opened','clicked'].includes(details.data.last_event)) {
        const url = new URL(match[0]);
        if (url.origin !== new URL(origin).origin || !url.pathname.startsWith('/api/auth/')) throw new Error('Unexpected authentication email link.');
        return url;
      }
    }
    if (attempt % 6 === 0) console.log('Waiting for the authentication email at the Resend test recipient.');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error('Authentication email did not arrive at the test recipient.');
}

// Post/catalog tests need authenticated fixtures; verification itself is covered by test:auth
// and test:email-auth. This helper is never imported by application code.
export async function ensureFixtureSession(context: BrowserContext, pool: Pool, email: string, password: string, origin: string, signup: APIResponse) {
  assert.match(email, /^delivered\+[^@]+@resend\.dev$/);
  const response = await signup.json();
  if (response.token !== null) return;
  const result = await pool.query('UPDATE "user" SET "emailVerified"=true WHERE email=$1 RETURNING id', [email]);
  assert.equal(result.rowCount, 1);
  const login = await context.request.post('/api/auth/sign-in/email', { headers: { Origin: origin }, data: { email, password } });
  assert.equal(login.status(), 200);
}
