import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import nextEnv from '@next/env';

const root = process.cwd();
nextEnv.loadEnvConfig(root, true);
const directory = resolve(root, '.local-postgres');
const data = join(directory, 'data');
const pgRoot = join(process.env.ProgramFiles || 'C:/Program Files', 'PostgreSQL');
const versions = existsSync(pgRoot) ? readdirSync(pgRoot).sort((a, b) => Number(b) - Number(a)) : [];
const bin = process.env.POSTGRES_BIN || (versions[0] && join(pgRoot, versions[0], 'bin'));
if (!bin) throw new Error('Install PostgreSQL or set POSTGRES_BIN to its bin directory.');
const executable = (name) => join(bin, name + (process.platform === 'win32' ? '.exe' : ''));
function run(name, args, quiet = false) {
  const result = spawnSync(executable(name), args, {
    encoding: 'utf8', windowsHide: true,
    // Do not leave capture pipes open in the background PostgreSQL process.
    stdio: name === 'pg_ctl' ? 'ignore' : 'pipe',
  });
  if (result.status !== 0) throw new Error(`${name} failed: ${result.stderr || result.stdout || result.error}`);
  if (!quiet && result.stdout) console.log(result.stdout.trim());
}

if (process.argv.includes('--stop')) {
  run('pg_ctl', ['-D', data, '-m', 'fast', 'stop']);
  process.exit(0);
}
mkdirSync(directory, { recursive: true });
const envPath = resolve(root, '.env.local');
const env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
if (!existsSync(join(data, 'PG_VERSION'))) {
  if (process.env.DATABASE_URL) throw new Error('DATABASE_URL already exists. This script will not replace an existing database configuration.');
  const password = randomBytes(32).toString('hex');
  const pwFile = join(directory, 'init-password');
  writeFileSync(pwFile, password, { mode: 0o600 });
  try {
    run('initdb', ['-D', data, '-U', 'cancercrafts', '-A', 'scram-sha-256', '--pwfile', pwFile, '--encoding=UTF8', '--locale=C'], true);
  } finally {
    unlinkSync(pwFile);
  }
  appendFileSync(envPath, `${env.endsWith('\n') ? '' : '\n'}DATABASE_URL=postgresql://cancercrafts:${password}@127.0.0.1:5433/postgres\n`);
}
const additions = [];
if (!process.env.BETTER_AUTH_SECRET) additions.push(`BETTER_AUTH_SECRET=${randomBytes(48).toString('base64url')}`);
if (!process.env.BETTER_AUTH_URL) additions.push('BETTER_AUTH_URL=http://localhost:3000');
if (additions.length) appendFileSync(envPath, '\n' + additions.join('\n') + '\n');
const status = spawnSync(executable('pg_ctl'), ['-D', data, 'status'], { windowsHide: true, encoding: 'utf8' });
if (status.status !== 0) run('pg_ctl', ['-D', data, '-l', join(directory, 'server.log'), '-o', '-h 127.0.0.1 -p 5433', '-w', 'start']);
console.log('CancerCrafts local PostgreSQL is ready on 127.0.0.1:5433. Credentials are in .env.local.');
