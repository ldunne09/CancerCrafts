import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { APIError } from 'better-auth/api';
import { waitUntil } from '@vercel/functions';
import { emailConfigured, emailVerificationRequired, sendAuthEmail } from './email';
import { validDisplayName } from './profile-validation';

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true, minPasswordLength: 12, maxPasswordLength: 128,
    requireEmailVerification: emailVerificationRequired,
    autoSignIn: !emailVerificationRequired,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 30 * 60,
    sendResetPassword: emailConfigured ? async ({ user, url }) => sendAuthEmail(user.email, url, 'password-reset') : undefined,
  },
  emailVerification: {
    sendOnSignUp: emailVerificationRequired,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    expiresIn: 30 * 60,
    sendVerificationEmail: emailConfigured ? async ({ user, url }) => sendAuthEmail(user.email, url, 'verification') : undefined,
  },
  advanced: process.env.VERCEL === '1' ? { backgroundTasks: { handler: waitUntil } } : undefined,
  user: { additionalFields: {
    role: {
      type: ['patient', 'survivor', 'caregiver', 'supporter'],
      required: false,
      defaultValue: 'supporter',
      transform: { input: (value) => {
        if (typeof value !== 'string' || !['patient', 'survivor', 'caregiver', 'supporter'].includes(value)) {
          throw new APIError('BAD_REQUEST', { message: 'Choose a valid community role.' });
        }
        return value;
      } },
    },
  } },
  rateLimit: {
    enabled: true, window: 60, max: 30,
    customRules: {
      '/send-verification-email': { window: 60, max: 3 },
      '/request-password-reset': { window: 60, max: 3 },
    },
  },
  databaseHooks: { user: { create: { before: async (user) => {
    const name = user.name.trim();
    if (!name || name.length > 80 || user.email.length > 254) {
      throw new APIError('BAD_REQUEST', { message: 'Enter a display name of 1–80 characters and a valid email address.' });
    }
    return { data: { ...user, name } };
  } }, update: { before: async (user) => {
    if (user.name !== undefined && !validDisplayName(user.name)) {
      throw new APIError('BAD_REQUEST', { message: 'Enter a display name of 1–80 characters.' });
    }
    return { data: { ...user, ...(user.name !== undefined ? { name: user.name.trim() } : {}) } };
  } } } },
  plugins: [nextCookies()],
});
