/**
 * Create or rotate the clinic's Supabase Auth accounts.
 *
 * Every account has its own password, read from the selected env file (or the
 * shell), so a handover credential never appears on a command line or in Git.
 * The script refuses to run if two accounts would share a password.
 *
 * Rotation also covers accounts outside the role list, so no account keeps a
 * password that has been retired.
 *
 * Usage:
 *   node scripts/seed-auth-users.mjs --env=.env.staging
 *   node scripts/seed-auth-users.mjs --env=.env.staging --rotate
 *   node scripts/seed-auth-users.mjs --env=.env.production --confirm-prod --rotate
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
const rotate = process.argv.includes('--rotate');
const env = readEnv(envFileName);
const secretOf = (name) => process.env[name] || env[name];

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = /https:\/\/([^.]+)\./.exec(url || '')?.[1];
const prodRef = /https:\/\/([^.]+)\./.exec(readEnv('.env.production').NEXT_PUBLIC_SUPABASE_URL || '')?.[1];
const isProduction = Boolean(prodRef) && projectRef === prodRef;

// The two roles the application supports. An extra account would map to
// dokter_admin at runtime and inherit clinical read access.
const ACCOUNTS = [
  {
    email: 'owner@cikidangmedika.com',
    role: 'owner',
    name: 'dr. Ovan & dr. Neneng (Pimpinan)',
    passwordEnv: 'SEED_PASSWORD_OWNER',
  },
  {
    email: 'dokter@cikidangmedika.com',
    role: 'dokter_admin',
    name: 'Dokter Jaga & Admin Klinik',
    passwordEnv: 'SEED_PASSWORD_DOKTER',
  },
];

// Any account that is not one of the two roles above. It has no legitimate place
// in the two-role model, but it must not keep a retired password either.
const LEGACY_PASSWORD_ENV = 'SEED_DEFAULT_PASSWORD';

const CLINIC = 'Klinik Pratama Cikidang Medika';

if (!url || !serviceKey) {
  console.error(`NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di ${envFileName}.`);
  process.exit(1);
}
if (isProduction && !process.argv.includes('--confirm-prod')) {
  console.error(
    'DIHENTIKAN: target adalah project PRODUKSI.\n' +
      'Jalankan ulang dengan --confirm-prod bila memang disengaja.'
  );
  process.exit(1);
}

const missing = ACCOUNTS.filter((account) => !secretOf(account.passwordEnv));
if (missing.length > 0) {
  console.error(
    `Kata sandi belum diset: ${missing.map((account) => account.passwordEnv).join(', ')}.\n` +
      `Isi variabel tersebut di ${envFileName}. Kata sandi tidak pernah disimpan di repositori.`
  );
  process.exit(1);
}

const tooShort = ACCOUNTS.filter((account) => secretOf(account.passwordEnv).length < 12);
if (tooShort.length > 0) {
  console.error(
    `Kata sandi minimal 12 karakter: ${tooShort.map((account) => account.passwordEnv).join(', ')}.`
  );
  process.exit(1);
}

const rolePasswords = [
  ...ACCOUNTS.map((account) => ({ key: account.passwordEnv, value: secretOf(account.passwordEnv) })),
  ...(secretOf(LEGACY_PASSWORD_ENV) ? [{ key: LEGACY_PASSWORD_ENV, value: secretOf(LEGACY_PASSWORD_ENV) }] : []),
];
const distinct = new Set(rolePasswords.map((entry) => entry.value));
if (distinct.size !== rolePasswords.length) {
  console.error(
    'Kata sandi tiap akun harus berbeda. Duplikat ditemukan pada: ' +
      rolePasswords.map((entry) => entry.key).join(', ')
  );
  process.exit(1);
}

console.log(`Env    : ${envFileName}`);
console.log(`Target : ${projectRef} (${isProduction ? 'PRODUKSI' : 'pengembangan'})`);
console.log(`Mode   : ${rotate ? 'BUAT + ROTASI kata sandi tiap akun' : 'BUAT saja (akun lama dilewati)'}\n`);

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function listAllUsers() {
  const all = [];
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    all.push(...data.users);
    if (data.users.length < 200) break;
    page += 1;
  }
  return all;
}

let created = 0;
let updated = 0;
let skipped = 0;

try {
  const existingUsers = await listAllUsers();
  const byEmail = new Map(existingUsers.map((user) => [user.email?.toLowerCase(), user]));
  const covered = new Set();

  for (const account of ACCOUNTS) {
    const key = account.email.toLowerCase();
    covered.add(key);

    const password = secretOf(account.passwordEnv);
    const metadata = { role: account.role, name: account.name, clinic: CLINIC };
    const existing = byEmail.get(key);

    if (!existing) {
      const { error } = await supabase.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) throw new Error(`${account.email}: ${error.message}`);
      console.log(`Dibuat          : ${account.email} (${account.role})`);
      created += 1;
      continue;
    }

    if (!rotate) {
      console.log(`Dilewati        : ${account.email} (sudah ada; pakai --rotate untuk memperbarui)`);
      skipped += 1;
      continue;
    }

    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: metadata,
    });
    if (error) throw new Error(`${account.email}: ${error.message}`);
    console.log(`Sandi diperbarui: ${account.email} (${account.role})`);
    updated += 1;
  }

  if (rotate) {
    const leftovers = existingUsers.filter((user) => !covered.has(user.email?.toLowerCase()));
    const legacyPassword = secretOf(LEGACY_PASSWORD_ENV);

    for (const user of leftovers) {
      if (!legacyPassword) {
        console.log(`Perlu ditinjau : ${user.email} (tidak ada ${LEGACY_PASSWORD_ENV}, sandi dibiarkan)`);
        skipped += 1;
        continue;
      }
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: legacyPassword });
      if (error) throw new Error(`${user.email}: ${error.message}`);
      console.log(`Sandi diperbarui: ${user.email} (akun di luar daftar peran, mohon ditinjau)`);
      updated += 1;
    }
  }

  console.log(`\nSelesai. Dibuat ${created}, diperbarui ${updated}, dilewati ${skipped}.`);
} catch (error) {
  console.error(`GAGAL: ${error.message}`);
  process.exit(1);
}
