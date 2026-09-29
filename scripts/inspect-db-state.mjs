/**
 * Read-only snapshot of the clinic database: row counts, leading-zero duplicate
 * medical record numbers, and how much referral (bidan) data actually landed.
 *
 * Nothing is written. Prints counts and normalised samples, not raw identifiers.
 *
 * Usage:
 *   node scripts/inspect-db-state.mjs                 # development project
 *   node scripts/inspect-db-state.mjs --env=.env.production
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

const envArg = process.argv.find((arg) => arg.startsWith('--env='));
const envFileName = envArg ? envArg.split('=')[1] : '.env.staging';
const env = readEnv(envFileName);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ref = /https:\/\/([^.]+)\./.exec(env.NEXT_PUBLIC_SUPABASE_URL || '')?.[1] ?? 'tidak diketahui';
console.log(`\n===== SNAPSHOT DATABASE (${envFileName} -> ${ref}) =====\n`);

async function countOf(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) return `ERROR: ${error.message}`;
  return count;
}

for (const table of [
  'patients',
  'visits',
  'cash_flows',
  'public_health_records',
  'referral_commissions',
  'tbc_programs',
  'circumcisions',
  'post_cares',
]) {
  console.log(`${table.padEnd(24)}: ${await countOf(table)}`);
}

async function selectAll(table, columns = '*') {
  const rows = [];
  const pageSize = 1000;
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    page += 1;
  }
  return rows;
}

const strip = (value) => (value || '').replace(/[^0-9]/g, '').replace(/^0+/, '');

// ------------------------------------------------- leading zero duplicates
console.log('\n-- Duplikat nomor RM (beda hanya pada nol depan / pemisah) --');
const patients = await selectAll('patients', 'no_rm');
const byNormalized = new Map();
patients.forEach((row) => {
  const key = strip(row.no_rm) || `RAW:${row.no_rm}`;
  if (!byNormalized.has(key)) byNormalized.set(key, []);
  byNormalized.get(key).push(row.no_rm);
});
const collisions = [...byNormalized.entries()].filter(([, list]) => list.length > 1);
console.log(`   Pasien total              : ${patients.length}`);
console.log(`   Identitas setelah norm.   : ${byNormalized.size}`);
console.log(`   Grup duplikat             : ${collisions.length}`);
console.log(
  `   Baris berlebih            : ${collisions.reduce((sum, [, list]) => sum + list.length - 1, 0)}`
);
collisions.slice(0, 8).forEach(([, list]) => {
  const masked = list.map((value) => `${value.slice(0, 2)}***${value.slice(-2)}`);
  console.log(`      contoh: ${masked.join('  ==  ')}`);
});

// ------------------------------------------------- referral / bidan coverage
console.log('\n-- Data rujukan bidan di tabel visits --');
const visits = await selectAll('visits', 'id,tanggal_periksa,keterangan_tindakan,tindakan,kode_icd10,bulan');
const bidanRows = visits.filter((row) => /^bdn\./i.test((row.keterangan_tindakan || '').trim()));
const bidanCounts = new Map();
bidanRows.forEach((row) => {
  const name = (row.keterangan_tindakan || '').trim();
  bidanCounts.set(name, (bidanCounts.get(name) || 0) + 1);
});
console.log(`   Kunjungan dengan keterangan_tindakan berawalan "Bdn.": ${bidanRows.length}`);
[...bidanCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, total]) => console.log(`      ${String(total).padStart(4)}x  ${name}`));

const adminRows = visits.filter((row) => /admin\/bdn/i.test(row.keterangan_tindakan || ''));
console.log(`   (catatan: "Admin/Bdn.Resa" disimpan di kolom dokter/petugas, bukan keterangan_tindakan)`);

// ------------------------------------------------- program register coverage
console.log('\n-- Public health records per program --');
const phr = await selectAll('public_health_records', 'program_type');
const phrCounts = new Map();
phr.forEach((row) => phrCounts.set(row.program_type, (phrCounts.get(row.program_type) || 0) + 1));
[...phrCounts.entries()].forEach(([type, total]) => console.log(`      ${String(total).padStart(4)}x  ${type}`));

// ------------------------------------------------- date span of visits
console.log('\n-- Rentang tanggal kunjungan --');
const dates = visits.map((row) => row.tanggal_periksa).filter(Boolean).sort();
console.log(`   paling awal : ${dates[0] ?? '-'}`);
console.log(`   paling akhir: ${dates[dates.length - 1] ?? '-'}`);

const bulanCounts = new Map();
visits.forEach((row) => bulanCounts.set(row.bulan, (bulanCounts.get(row.bulan) || 0) + 1));
console.log('\n-- Kunjungan per Bulan (top 15) --');
[...bulanCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([bulan, total]) => console.log(`      ${String(total).padStart(5)}x  ${bulan}`));

// ------------------------------------------------- column completeness
function fillRate(rows, column) {
  const filled = rows.filter((row) => {
    const value = row[column];
    return value !== null && value !== undefined && String(value).trim() !== '';
  }).length;
  const pct = rows.length === 0 ? 0 : Math.round((filled / rows.length) * 100);
  return `${String(filled).padStart(6)} / ${String(rows.length).padStart(6)}  (${String(pct).padStart(3)}%)`;
}

const fullPatients = await selectAll('patients');
const fullVisits = await selectAll('visits');
console.log('\n-- Keterisian kolom patients --');
for (const column of [
  'usia',
  'alamat',
  'no_ktp',
  'no_bpjs',
  'riwayat_alergi',
  'no_telepon',
  'pekerjaan',
]) {
  console.log(`   ${column.padEnd(18)}: ${fillRate(fullPatients, column)}`);
}

console.log('\n-- Keterisian kolom visits --');
for (const column of [
  'jam_periksa',
  'diagnosa_deskripsi',
  'keluhan_anamnesa',
  'terapi_obat',
  'tindakan',
  'keterangan_tindakan',
  'lab',
  'lab_hasil',
  'keterangan_pendapatan',
  'jenis_pembayaran',
]) {
  console.log(`   ${column.padEnd(22)}: ${fillRate(fullVisits, column)}`);
}

const group = (rows, column, limit = 10) => {
  const counts = new Map();
  rows.forEach((row) => {
    const value = row[column];
    if (value === null || value === undefined || String(value).trim() === '') return;
    counts.set(String(value), (counts.get(String(value)) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
};

console.log('\n-- jenis_pembayaran --');
group(fullVisits, 'jenis_pembayaran').forEach(([k, v]) => console.log(`   ${String(v).padStart(5)}x  ${k}`));
console.log('-- tindakan (top 10) --');
group(fullVisits, 'tindakan').forEach(([k, v]) => console.log(`   ${String(v).padStart(5)}x  ${k}`));
console.log('-- kode_icd10 (top 10) --');
group(fullVisits, 'kode_icd10').forEach(([k, v]) => console.log(`   ${String(v).padStart(5)}x  ${k}`));

console.log('');
