import { loadEnvConfig } from '@next/env';
import { getMigrations } from 'better-auth/db/migration';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  loadEnvConfig(process.cwd(), !process.argv.includes('--production'));
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    throw new Error('Set DATABASE_URL and BETTER_AUTH_SECRET in .env.local first.');
  }
  const { auth } = await import('../lib/auth');
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  const { db } = await import('../lib/db');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(67311302)');
    await client.query('CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = join(process.cwd(), 'migrations');
    for (const name of (await readdir(directory)).filter(name => name.endsWith('.sql')).sort()) {
      const applied = await client.query('SELECT name FROM app_migrations WHERE name = $1', [name]);
      if (!applied.rowCount) {
        await client.query(await readFile(join(directory, name), 'utf8'));
        await client.query('INSERT INTO app_migrations (name) VALUES ($1)', [name]);
        console.log(`Applied ${name}`);
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await db.end();
  }
  console.log('Authentication and application schemas are up to date.');
}
main().then(() => process.exit(0)).catch(() => {
  console.error('Migration failed. Check the database connection and authentication configuration.');
  process.exit(1);
});
