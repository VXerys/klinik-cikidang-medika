/**
 * Create or rotate the clinic's Supabase Auth accounts.
 *
 * The password comes from SEED_DEFAULT_PASSWORD in the selected env file (or the
 * shell), so a handover credential never has to appear on a command line or in Git.
 *
 * Rotation covers every account already in the project, not only the two role
 * accounts, so no account keeps a password that has been retired.
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
const password = process.env.SEED_DEFAULT_PASSWORD || env.SEED_DEFAULT_PASSWORD;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = /https:\/\/([^.]+)\./.exec(url || '')?.[1];
const prodRef = /https:\/\/([^.]+)\./.exec(readEnv('.env.production').NEXT_PUBLIC_SUPABASE_URL || '')?.[1];
const isProduction = Boolean(prodRef) && projectRef === prodRef;

if (!password) {
  console.error(`SEED_DEFAULT_PASSWORD tidak ada di ${envFileName} maupun di environment.`);
  process.exit(1);
}
if (password.length < 12) {
  console.error('SEED_DEFAULT_PASSWORD minimal 12 karakter.');
  process.exit(1);
}
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

// The two roles the application supports. An extra account would map to
// dokter_admin at runtime and inherit clinical read access.
const ACCOUNTS = [
  {
    email: 'owner@cikidangmedika.com',
    role: 'owner',
    name: 'dr. Ovan & dr. Neneng (Pimpinan)',
  },
  {
    email: 'dokter@cikidangmedika.com',
    role: 'dokter_admin',
    name: 'Dokter Jaga & Admin Klinik',
  },
];

const CLINIC = 'Klinik Pratama Cikidang Medika';

console.log(`Env    : ${envFileName}`);
console.log(`Target : ${projectRef} (${isProduction ? 'PRODUKSI' : 'pengembangan'})`);
console.log(`Mode   : ${rotate ? 'BUAT + ROTASI semua kata sandi akun' : 'BUAT saja (akun lama dilewati)'}\n`);

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
    for (const user of leftovers) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
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
