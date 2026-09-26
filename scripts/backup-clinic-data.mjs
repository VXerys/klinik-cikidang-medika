/**
 * Dump clinic tables to a local JSON file as a rollback safety net.
 *
 * Runs read-only through the Supabase Management API, so it needs a personal
 * access token rather than database credentials. Output lands in `docs/data/`,
 * which is gitignored because it contains patient data.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=... node scripts/backup-clinic-data.mjs <projectRef> [label]
 */

import fs from 'fs';
import path from 'path';

const [projectRef, label = 'backup'] = process.argv.slice(2);
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectRef) {
  console.error('Usage: node scripts/backup-clinic-data.mjs <projectRef> [label]');
  process.exit(1);
}

if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN wajib diset.');
  process.exit(1);
}

const TABLES = [
  'doctors',
  'patients',
  'visits',
  'cash_flows',
  'tbc_programs',
  'circumcisions',
  'post_cares',
  'public_health_records',
  'referral_commissions',
];

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Query gagal (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

async function fetchTable(tableName) {
  const rows = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const data = await runQuery(
      `select * from public.${tableName} order by created_at limit ${pageSize} offset ${offset}`
    );
    if (!Array.isArray(data) || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return rows;
}

async function main() {
  console.log(`Backup project: ${projectRef}`);
  const dump = { projectRef, label, createdAt: new Date().toISOString(), tables: {} };

  let totalRows = 0;
  for (const table of TABLES) {
    try {
      const rows = await fetchTable(table);
      dump.tables[table] = rows;
      totalRows += rows.length;
      console.log(`  ${table}: ${rows.length} baris`);
    } catch (error) {
      console.log(`  ${table}: dilewati (${error.message})`);
      dump.tables[table] = null;
    }
  }

  const backupDir = path.resolve(process.cwd(), 'docs/data');
  fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `${label}-${stamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(dump), 'utf-8');

  const sizeMb = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  console.log(`\nBackup selesai: ${totalRows} baris, ${sizeMb} MB`);
  console.log(`Berkas: ${filePath}`);
}

main().catch((error) => {
  console.error('Backup gagal:', error.message);
  process.exit(1);
});
