/**
 * Apply a .sql file to a Supabase project through the Supabase Management API.
 *
 * The Management API is used instead of a direct Postgres connection because the
 * repository stores no database password, only the project URL and API keys. This is
 * the same path the Supabase MCP server takes for its SQL tool.
 *
 * Safety: applying DDL to the production project requires the explicit --confirm-prod
 * flag, and the target project ref is resolved from the env file rather than hardcoded.
 *
 * Usage:
 *   node scripts/apply-sql.mjs --file=supabase/migrations/<name>.sql
 *   node scripts/apply-sql.mjs --env=.env.production --confirm-prod --file=<path>
 */

import fs from 'fs';
import path from 'path';

function readEnv(envFileName) {
  const envPath = path.resolve(process.cwd(), envFileName);
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        env[key.trim()] = values.join('=').trim();
      }
    });
  return env;
}

const argOf = (name, fallback = null) => {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const envFileName = argOf('env', '.env.local');
const sqlFile = argOf('file');
const inlineQuery = argOf('query');
const confirmProd = process.argv.includes('--confirm-prod');

if (!sqlFile && !inlineQuery) {
  console.error('Wajib menyertakan --file=<path.sql> atau --query="<SQL>"');
  process.exit(1);
}

const env = readEnv(envFileName);
const token = env.SUPABASE_ACCESS_TOKEN;
const refFromEnv = env.SUPABASE_PROJECT_REF;
const refFromUrl = /https:\/\/([^.]+)\./.exec(env.NEXT_PUBLIC_SUPABASE_URL || '')?.[1];
const projectRef = refFromEnv || refFromUrl;

if (!token) {
  console.error(`SUPABASE_ACCESS_TOKEN tidak ada di ${envFileName}`);
  process.exit(1);
}
if (!projectRef) {
  console.error(`Project ref tidak bisa ditentukan dari ${envFileName}`);
  process.exit(1);
}

const prodRef = /https:\/\/([^.]+)\./.exec(readEnv('.env.production').NEXT_PUBLIC_SUPABASE_URL || '')?.[1];
const isProd = Boolean(prodRef) && projectRef === prodRef;

if (isProd && !confirmProd) {
  console.error(
    'DIHENTIKAN: target adalah project PRODUKSI.\n' +
      'Jalankan ulang dengan --confirm-prod bila memang disengaja.'
  );
  process.exit(1);
}

const sqlPath = sqlFile ? path.resolve(process.cwd(), sqlFile) : null;
if (sqlPath && !fs.existsSync(sqlPath)) {
  console.error(`Berkas SQL tidak ditemukan: ${sqlFile}`);
  process.exit(1);
}
const sql = sqlPath ? fs.readFileSync(sqlPath, 'utf-8') : inlineQuery;

console.log(`Env    : ${envFileName}`);
console.log(`Target : ${projectRef} (${isProd ? 'PRODUKSI' : 'pengembangan'})`);
console.log(`Sumber : ${sqlPath ? `${sqlFile} (${sql.length} karakter)` : `query inline (${sql.length} karakter)`}`);

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const raw = await response.text();
let parsed = null;
try {
  parsed = raw ? JSON.parse(raw) : null;
} catch {
  parsed = raw;
}

if (!response.ok) {
  console.error(`\nGAGAL (HTTP ${response.status})`);
  console.error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
  process.exit(1);
}

console.log(sqlPath ? '\nBERHASIL diterapkan.' : '\nBERHASIL dijalankan.');
if (Array.isArray(parsed) && parsed.length > 0) {
  console.log(JSON.stringify(parsed, null, 2));
} else if (Array.isArray(parsed)) {
  console.log('(tidak ada baris hasil)');
}
