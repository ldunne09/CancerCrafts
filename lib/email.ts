import { Resend } from 'resend';

export const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_EMAIL_DOMAIN);
export const emailVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === 'true';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export async function sendAuthEmail(to: string, url: string, purpose: 'verification' | 'password-reset') {
  if (!emailConfigured) throw new Error('Authentication email delivery is not configured.');
  const origin = new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3000').origin;
  if (new URL(url).origin !== origin) throw new Error('Invalid authentication email origin.');
  const verification = purpose === 'verification';
  const title = verification ? 'Verify your email address' : 'Reset your password';
  const label = verification ? 'Verify email' : 'Reset password';
  const description = verification
    ? 'Welcome to CancerCrafts. Confirm your email address to finish setting up your account.'
    : 'We received a request to reset your CancerCrafts password.';
  const nextStep = verification
    ? 'After verifying, sign in with your password.'
    : 'This link can be used once. Updating your password signs out your existing sessions.';
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: `CancerCrafts <no-reply@${process.env.RESEND_EMAIL_DOMAIN}>`,
    to,
    subject: verification ? 'Verify your CancerCrafts email' : 'Reset your CancerCrafts password',
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:24px 12px;background:#f6f4ff;font-family:Arial,Helvetica,sans-serif;color:#1f2233;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e0f5;border-radius:16px;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 24px;color:#5d4ae3;font-size:22px;font-weight:bold;">CancerCrafts</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${title}</h1>
        <p style="font-size:16px;line-height:1.6;">${description}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr><td bgcolor="#5d4ae3" style="border-radius:8px;">
          <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;border:1px solid #5d4ae3;border-radius:8px;">${label}</a>
        </td></tr></table>
        <p style="font-size:14px;line-height:1.6;">This link expires in 30 minutes. ${nextStep}</p>
        <p style="font-size:14px;line-height:1.6;color:#6d7287;">If you did not request this email, you can ignore it.</p>
        <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #eeeaff;font-size:12px;color:#6d7287;">CancerCrafts &middot; ${escapeHtml(new URL(origin).hostname)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    text: verification
      ? `Confirm your email address for CancerCrafts by opening this link:\n\n${url}\n\nThis link expires in 30 minutes. After verification, sign in with your password. If you did not request this, you can ignore this email.`
      : `Reset your CancerCrafts password by opening this link:\n\n${url}\n\nThis link expires in 30 minutes and can only be used once. Resetting your password signs out your existing sessions. If you did not request this, you can ignore this email.`,
  });
  if (error) {
    // Do not log the recipient, verification token, reset URL, or provider payload.
    console.error('Authentication email delivery failed:', error.name);
    throw new Error('Authentication email could not be sent. Please try again later.');
  }
}
