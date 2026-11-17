# CancerCrafts

Next.js 15 + React 19 MVP for CARE, EARN, and HELP. Registration uses Better Auth and PostgreSQL; passwords are hashed by Better Auth and sessions are stored in PostgreSQL.

## Local setup (Windows)

Requires Node.js 22+ and PostgreSQL installed under `C:\Program Files\PostgreSQL` (or set `POSTGRES_BIN` to the PostgreSQL bin directory).

```powershell
npm.cmd install
npm.cmd run db:local
npm.cmd run db:migrate
npm.cmd run dev
```

Visit http://localhost:3000/signup. Create an account with a display name, community role, email, and a 12–128 character password. Signup signs you in and opens CARE. PROFILE shows your account; Sign out ends the session. No email delivery is needed for local testing.

`db:local` creates a separate local PostgreSQL cluster on **127.0.0.1:5433**, with generated credentials and an auth secret saved in `.env.local`. It does not alter the existing PostgreSQL service. Data and credentials are ignored by Git. Run `npm.cmd run db:local` after a restart, and `npm.cmd run db:stop` to stop this cluster. Avoid moving its data directory while it is running.

## Existing PostgreSQL / AWS RDS

Skip `db:local`. Copy `.env.example` to `.env.local` without replacing existing environment values, configure `DATABASE_URL`, set `BETTER_AUTH_URL` to your application origin, and generate a random `BETTER_AUTH_SECRET` of at least 32 characters. Then run `npm.cmd run db:migrate`. Use an encrypted, certificate-verified database connection for RDS. Keep all three values server-side and configure them separately in the hosting provider. The local cluster is for development only.

## Live website deployment

The live app is at https://cancercrafts.logandunne.com. Its Vercel project is `cc-crafts/cancer-crafts`, connected to the Neon Free database `cancercrafts-production` in `iad1`. Create a fresh account at `/signup`; the original prototype's sample identities were never registered accounts.

The local database is accessible only from this computer. The Vercel project needs a hosted PostgreSQL database and production values for `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL=https://cancercrafts.logandunne.com`.

Run the authentication migration against that hosted database before deploying the updated source. Never upload `.env.local` or `.local-postgres`; `.vercelignore` excludes both. Accounts created locally are separate from accounts on the live site.

For deployment checks, keep the production environment in the ignored `.env.production.local` file and run `npm.cmd run db:migrate -- --production`. After deployment, `npm.cmd run test:auth -- --production` uses that production environment for both browser requests and its temporary database test records.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:auth
npm.cmd run test:posts
npm.cmd run test:features
npm.cmd run test:email-auth
npm.cmd run test:admin
npm.cmd run test:profile
```

`test:auth` expects a running app at `http://localhost:3000` (override with `TEST_BASE_URL`). It creates a temporary account, checks persistence, password hashing, duplicate/invalid signup, login, session protection, and logout, then deletes its test account.

`test:posts` checks publishing, persistence, both feeds, editing, deletion, anonymous author display, validation, and attempts to modify another user's posts. It uses two temporary accounts and deletes its test records. Add `-- --production` for the live site and production database.

## Community posts

Open CARE → Create post, choose a category, and publish up to 5,000 characters. Posts are saved in PostgreSQL and appear in CARE and the community feed. Open your own post to edit it or permanently delete it after confirmation. Anonymous posts hide the author's name and role from readers while preserving ownership controls. Posts are publicly readable; sign-in is required to publish and manage them. Older posts remain accessible through the feed's pagination.

`npm.cmd run db:migrate` applies the auth schema and versioned SQL files in `migrations/`. Application migrations are transactional and tracked to avoid applying them twice. Run with `-- --production` against the production environment before deploying schema changes.

## Current scope

Authentication, account identity, posts, comments, supportive reactions, reports, marketplace listings, product images, assistance requests, and request updates use PostgreSQL. Listing images accept PNG, JPEG, or WebP files up to 2 MB and are stored in PostgreSQL for this MVP. Marketplace checkout and donations are explicitly simulated; their saved records do not move money or initiate fulfillment. Listing prices and request goals use integer cents.

Signed-in users can create comments and send or withdraw support (one reaction per user/post). Post and comment reports are deduplicated per reporter and stored privately in the administrator moderation queue. Replies by the author of an anonymous post hide that author's identity. Users can delete their own comments; a post author cannot delete other users' comments. Administrators can hide/restore content and resolve/reopen reports, with a required reason and a transactional audit entry.

EARN and HELP show saved records. Create, view, edit, and delete your own listings/requests; My listings and My requests show your records. Only a simulated order's buyer can view its confirmation. Deleting a request cascades to its updates and simulated donations. Deleting a listing removes its image while keeping the buyer's simulated order snapshot.

Settings controls remain a prototype. Administrator access is managed separately from community roles and requires a verified account and a server-managed database grant. Email verification and password recovery are live with Resend Free and the verified domain `mail.cancercrafts.logandunne.com`. Production requires email verification before password sign-in and protected actions. Signup, delivered verification/reset emails, password changes, one-use reset links, and session revocation were checked through the live browser flow. DNS setup is documented in [docs/email-dns.md](docs/email-dns.md). Rate limits use process memory and should use shared storage for multiple app instances.

## Profile editing

Open Profile → Edit profile to change your display name (1–80 characters), optional location (up to 160 characters), and optional bio (up to 1,000 characters). The form starts with your saved values, preserves typed values on validation/save errors, and supports clearing optional fields. Cancel returns without saving. Name/profile changes commit together, and the account identifier comes only from the authenticated server session; submitted account IDs or privileged fields cannot target another account or change permissions.

Display names are stored in the auth user record, so non-anonymous posts, comments, and listings show the updated name. Existing anonymous posts and anonymous-author replies remain masked. Location and bio are stored separately in `user_profiles` and shown only on the signed-in user's own profile for now. Email, community role, verification status, password, and administrator grants are not edited by this form. Native auth name updates also enforce the display-name rules. Profile rows are removed automatically if their account is deleted.

`test:profile` uses two temporary accounts to check saved values, reloads, session/author-name changes, anonymous/private fields, forged account IDs, privileged-field injection, guest rejection, validation, failed-form preservation, cancellation, and clearing optional fields. Use `-- --production` to test the live site and production database.

## Administrator access

`administrator_permissions` controls administrator access independently of patient/survivor/caregiver/supporter roles. Sign up and verify the intended account first. A database operator can grant or revoke access with:

```powershell
npm.cmd run admin:access -- --email admin@example.com --reason "Initial administrator" --production
npm.cmd run admin:access -- --email admin@example.com --reason "Access no longer needed" --revoke --production
```

Use the real verified account email. These commands operate on the production database only with `--production`; without it they use local development. Grants are idempotent, audited, and refused for unknown/unverified accounts. Revocation refuses to remove the final verified administrator. Commands require the existing server-side database credentials; there is no public grant endpoint or role selector. Never put database credentials in client code.

Administrators get an **Admin dashboard** link on their Profile. `/admin` shows actual counts; `/admin/reports` reviews reports and moderation decisions; `/admin/posts` reviews posts and comments; `/admin/resources` creates, edits, publishes, and disables resources; `/admin/users` is a read-only account overview; `/admin/audit` shows permission and moderation history. Listing/assistance overviews remain read-only. Appointment of other admins through a web interface, account disabling, and destructive administrative deletion are not part of this version.

All admin pages check the database grant server-side. Each write transaction rechecks and locks the grant until commit, so revocation affects subsequent requests even when a browser session remains valid. Moderation/resource writes and their audit entries commit together. The app exposes no audit-edit/delete controls. Controlled command-line changes are labeled **Database operator** in the audit log. Database owners retain direct database access; the audit log is not a separate tamper-proof system.

Hidden posts return 404 publicly, disappear from CARE/community feeds, and cannot receive new comments/support/reports or owner edits. Hidden comments disappear from public threads and counts. Hiding preserves content for administrator review/restoration; it does not permanently delete it. Anonymous author identities remain masked in the moderation views. Resources published by administrators appear in CARE's searchable directory; disabling a resource removes its detail page and directory entry. Existing sample resources were replaced by real database records.

`test:admin` uses two temporary accounts to exercise controlled grants, verified-account requirements, regular-user route/action rejection, hiding/restoration, report resolution/reopening, resource management, URL validation, audit transactions, and active-session revocation. It deletes only its own fixtures and test audit entries. Add `-- --production` for the live site after migrating and deploying.

## Email verification and password recovery rollout

Server-side configuration uses `RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN`, and `EMAIL_VERIFICATION_REQUIRED=true`. Enable the final flag and deploy only after Resend verifies the domain and email sending has been checked. Keep the default false for local development unless testing verification. API keys and authentication secrets must remain server-side.

With verification required, signup does not issue a session. The user opens a signed verification link (valid for 30 minutes) and then signs in with their password. Existing unverified accounts also need to verify before their next sign-in or protected action; no accounts are automatically marked verified. The resend screen is `/verify-email`. Reset requests start at `/forgot-password`; links expire after 30 minutes, can only be used once, and revoke existing sessions when a password is changed. `/reset-password` handles missing, expired, and invalid links. Public request messages avoid disclosing whether an email has an account. Resend/send-reset requests are rate-limited, and Vercel background tasks preserve email delivery after requests finish.

Authentication emails use a branded HTML button (Verify email / Reset password) rather than displaying the long token URL. The button links directly to the CancerCrafts domain, and a plain-text fallback preserves accessibility for text-only email clients.

`test:email-auth` uses real Better Auth handlers and local PostgreSQL with messages captured inside the test only. It checks verification gating, link signatures and expiration, resend behavior, password reset, single-use reset tokens, session revocation, and redirect protection. It does not establish production deliverability. `test:auth -- --production` uses labeled Resend test recipients, retrieves only that test recipient's emails, and follows the actual verification/reset links through the browser. Post/catalog tests prepare verified test fixtures separately so their ownership tests remain focused on those features. There are no test-token endpoints or test email transports in the app.

`test:features` exercises the new community interactions and catalog flows with two temporary accounts, including forged ownership requests, image validation, and simulated transactions. It cleans up its own records. Use `-- --production` to test the live deployment and production database.

Integration follows [Better Auth's Next.js guide](https://better-auth.com/docs/integrations/next) and [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql).
