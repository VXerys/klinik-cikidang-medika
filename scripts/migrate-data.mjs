/**
 * Full clinic data migration from the Google Sheets CSV export into the
 * development Supabase project.
 *
 * The script is deliberately destructive-but-safe:
 *   - It refuses to run against the production project.
 *   - It requires the explicit --confirm-dev-reset flag.
 *   - It backs up dependent program tables before the reset and re-links them
 *     afterwards by medical record number.
 *   - It never truncates a value to fit a column: an over-length value is set
 *     to NULL and reported, because a truncated identifier is worse than a
 *     missing one.
 *
 * Usage:
 *   node scripts/migrate-data.mjs --confirm-dev-reset
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------- env loading

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

function projectRef(url) {
  const match = /https:\/\/([^.]+)\./.exec(url || '');
  return match ? match[1] : null;
}

const envArg = process.argv.find((arg) => arg.startsWith('--env='));
const envFileName = envArg ? envArg.split('=')[1] : '.env.local';

const env = readEnv(envFileName);
const prodEnv = readEnv('.env.production');

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(`Kredensial Supabase tidak ditemukan di ${envFileName}`);
  process.exit(1);
}

// ------------------------------------------------------------- safety guards

const targetRef = projectRef(SUPABASE_URL);
const prodRef = projectRef(prodEnv.NEXT_PUBLIC_SUPABASE_URL);
const isProductionTarget = Boolean(prodRef) && targetRef === prodRef;

if (isProductionTarget && !process.argv.includes('--confirm-prod-reset')) {
  console.error(
    'DIHENTIKAN: target menunjuk ke project PRODUKSI.\n' +
      'Skrip ini menghapus seluruh pasien, kunjungan, dan kas sebelum impor ulang.\n' +
      'Pastikan backup sudah dibuat, lalu jalankan dengan:\n' +
      '  node scripts/migrate-data.mjs --env=.env.production --confirm-prod-reset'
  );
  process.exit(1);
}

if (!isProductionTarget && !process.argv.includes('--confirm-dev-reset')) {
  console.error(
    'DIHENTIKAN: skrip ini mengosongkan tabel pasien, kunjungan, dan kas.\n' +
      'Jalankan ulang dengan flag eksplisit:\n' +
      '  node scripts/migrate-data.mjs --confirm-dev-reset'
  );
  process.exit(1);
}

console.log(`Berkas env  : ${envFileName}`);
console.log(`Target      : ${targetRef} (${isProductionTarget ? 'PRODUKSI' : 'pengembangan'})`);
if (prodRef && !isProductionTarget) console.log(`Produksi dijaga: ${prodRef}`);
if (isProductionTarget) {
  console.log('PERHATIAN: menjalankan migrasi ke PRODUKSI. Ada jeda 10 detik untuk pembatalan.');
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ------------------------------------------------------------- csv utilities

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

function parseDate(value, rowNumber, report) {
  const raw = (value || '').trim();
  if (!raw) {
    report.invalidDate.push({ rowNumber, reason: 'kosong' });
    return null;
  }

  const parts = raw.replace(/\//g, '-').split('-');
  if (parts.length === 3) {
    let day;
    let month;
    let year;
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  report.invalidDate.push({ rowNumber, reason: 'format tidak dikenali' });
  return null;
}

// Only a real clock value is stored; anything else becomes NULL rather than
// being written as a fabricated time.
function parseTime(value) {
  const raw = (value || '').trim();
  if (!raw) return null;

  const match = /^(\d{1,2})[:.](\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;
}

// Human age only. A four-digit value is a year, not an age.
function parseAge(value) {
  const raw = (value || '').trim();
  if (!/^\d{1,3}$/.test(raw)) return null;
  const age = parseInt(raw, 10);
  return age >= 0 && age <= 130 ? age : null;
}

function parseRupiah(value) {
  if (!value) return 0;
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Canonical village names, keyed by a normalized lookup form.
const CANONICAL_DESA = [
  'Cikidang',
  'Pangkalan',
  'Cicareuh',
  'Cijambe',
  'Mekar Nangka',
  'Cikiray',
  'Sampora',
  'Nangka Koneng',
  'Bumisari',
  'Taman Sari',
  'Gunung Malang',
  'Cikaray Toyibah',
  'Luar Daerah',
];

const desaLookup = new Map(
  CANONICAL_DESA.map((name) => [name.toLowerCase().replace(/\s+/g, ' '), name])
);

function normalizeDesa(value) {
  const raw = (value || '').trim();
  if (!raw) return { value: 'Luar Daerah', changed: false };

  const key = raw.toLowerCase().replace(/\s+/g, ' ');
  const canonical = desaLookup.get(key);
  if (canonical) {
    return { value: canonical, changed: canonical !== raw };
  }
  return { value: raw, changed: false, unknown: true };
}

// Destination columns and their PostgreSQL limits. `null` means unbounded.
const PATIENT_COLUMNS = [
  { index: 1, column: 'no_rm', limit: 30, key: true },
  { index: 2, column: 'gelar', limit: 10 },
  { index: 3, column: 'nama', limit: 150 },
  { index: 4, column: 'jenis_kelamin', limit: 20 },
  { index: 5, column: 'tanggal_lahir', limit: 20 },
  { index: 7, column: 'desa', limit: 100 },
  { index: 8, column: 'alamat', limit: null },
  { index: 9, column: 'no_ktp', limit: 30 },
  { index: 10, column: 'no_bpjs', limit: 30 },
];

const VISIT_COLUMNS = [
  { index: 13, column: 'bulan', limit: 30 },
  { index: 14, column: 'kode_icd10', limit: 20 },
  { index: 20, column: 'lab', limit: 100 },
  { index: 21, column: 'lab_hasil', limit: 50 },
  { index: 24, column: 'tindakan', limit: 100 },
];

function enforceLimit(rawValue, column, limit, rowNumber, report) {
  const value = (rawValue || '').trim();
  if (!value) return null;
  if (limit === null || value.length <= limit) return value;

  if (column === 'no_rm') {
    throw new Error(
      `Nomor RM melebihi ${limit} karakter pada baris CSV ${rowNumber}. Migrasi dihentikan karena identitas pasien tidak boleh dirusak.`
    );
  }

  report.overLength.push({ rowNumber, column, length: value.length, limit });
  return null;
}

// --------------------------------------------------------------- backup step

const PROGRAM_TABLES = [
  { table: 'tbc_programs', patientColumn: 'pasien_id' },
  { table: 'circumcisions', patientColumn: 'pasien_id' },
  { table: 'post_cares', patientColumn: 'pasien_id' },
  { table: 'public_health_records', patientColumn: 'pasien_id' },
  { table: 'referral_commissions', patientColumn: 'pasien_id' },
];

async function selectAll(tableName) {
  const rows = [];
  const pageSize = 1000;
  let page = 0;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw new Error(`Gagal membaca ${tableName}: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    page += 1;
  }
  return rows;
}

async function backupProgramTables() {
  const patientRows = await selectAll('patients');
  const noRmById = new Map(patientRows.map((row) => [row.id, row.no_rm]));

  const backup = { createdAt: new Date().toISOString(), tables: {} };
  let totalRows = 0;

  for (const { table, patientColumn } of PROGRAM_TABLES) {
    const rows = await selectAll(table);
    totalRows += rows.length;
    backup.tables[table] = rows.map((row) => ({
      ...row,
      __pasien_no_rm: row[patientColumn] ? noRmById.get(row[patientColumn]) ?? null : null,
    }));
  }

  if (totalRows > 0) {
    const backupDir = path.resolve(process.cwd(), 'docs/data');
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `dev-program-backup-${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`Backup data program: ${totalRows} baris -> ${backupPath}`);
  } else {
    console.log('Backup data program: tidak ada baris yang perlu diamankan.');
  }

  return backup;
}

// ---------------------------------------------------------------- reset step

async function resetMigrationTables() {
  const epoch = '1970-01-01T00:00:00Z';

  const deletions = ['visits', 'cash_flows'];
  for (const table of deletions) {
    const { error } = await supabase.from(table).delete().gte('created_at', epoch);
    if (error) throw new Error(`Gagal mengosongkan ${table}: ${error.message}`);
  }

  const { error: patientError } = await supabase
    .from('patients')
    .delete()
    .gte('created_at', epoch);
  if (patientError) throw new Error(`Gagal mengosongkan patients: ${patientError.message}`);

  console.log('Tabel pasien, kunjungan, dan kas dikosongkan.');
}

// -------------------------------------------------------------- restore step

async function restoreProgramTables(backup, patientIdByNoRm) {
  let restored = 0;
  const skipped = [];

  for (const { table, patientColumn } of PROGRAM_TABLES) {
    const rows = backup.tables[table] || [];
    if (rows.length === 0) continue;

    const remapped = [];
    for (const row of rows) {
      const { __pasien_no_rm: noRm, visit_id: visitId, ...rest } = row;

      if (noRm && !patientIdByNoRm.has(noRm)) {
        skipped.push({ table, reason: 'pasien tidak ditemukan di data baru' });
        continue;
      }

      remapped.push({
        ...rest,
        id: undefined,
        [patientColumn]: noRm ? patientIdByNoRm.get(noRm) : null,
        // Visit ids change during migration, so the old link cannot be preserved.
        ...(visitId !== undefined ? { visit_id: null } : {}),
        created_at: undefined,
      });
    }

    if (remapped.length === 0) continue;

    const cleaned = remapped.map((row) => {
      const copy = { ...row };
      delete copy.id;
      delete copy.created_at;
      return copy;
    });

    const { error } = await supabase.from(table).insert(cleaned);
    if (error) throw new Error(`Gagal memulihkan ${table}: ${error.message}`);
    restored += cleaned.length;
    console.log(`  -> Dipulihkan ${cleaned.length} baris ke ${table}`);
  }

  console.log(`Restore data program selesai: ${restored} baris dipulihkan.`);
  if (skipped.length > 0) {
    console.log(`  ${skipped.length} baris dilewati (pasiennya tidak ada di data baru).`);
  }
}

// ------------------------------------------------------------------- migrate

async function runMigration() {
  const csvPath = path.resolve(process.cwd(), 'docs/data/DASHBOARD - DATAUTAMA.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`Berkas CSV tidak ditemukan: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  const header = rows[0];
  const dataRows = rows.slice(1);
  console.log(`CSV terbaca: ${dataRows.length} baris data, ${header.length} kolom.`);

  const report = {
    overLength: [],
    unknownDesa: new Map(),
    desaNormalized: 0,
    missingRm: 0,
    invalidDate: [],
    invalidTime: 0,
    invalidAge: 0,
  };

  // 1. Doctor mapping
  const { data: doctorsData, error: doctorError } = await supabase
    .from('doctors')
    .select('id, nama');
  if (doctorError) throw doctorError;

  const doctorMap = {};
  doctorsData.forEach((doctor) => {
    doctorMap[doctor.nama.toLowerCase().trim()] = doctor.id;
  });

  // 2. Unique patients
  const patientMap = new Map();

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const noRm = enforceLimit(row[1], 'no_rm', 30, rowNumber, report);
    if (!noRm) {
      report.missingRm += 1;
      return;
    }
    if (patientMap.has(noRm)) return;

    const desaResult = normalizeDesa(row[7]);
    if (desaResult.changed) report.desaNormalized += 1;
    if (desaResult.unknown) {
      report.unknownDesa.set(desaResult.value, (report.unknownDesa.get(desaResult.value) || 0) + 1);
    }

    const usia = parseAge(row[6]);
    if (usia === null && (row[6] || '').trim()) report.invalidAge += 1;

    patientMap.set(noRm, {
      no_rm: noRm,
      gelar: enforceLimit(row[2], 'gelar', 10, rowNumber, report) || 'Tn',
      nama: enforceLimit(row[3], 'nama', 150, rowNumber, report) || 'Tanpa Nama',
      jenis_kelamin: enforceLimit(row[4], 'jenis_kelamin', 20, rowNumber, report) || 'Laki-laki',
      tanggal_lahir: enforceLimit(row[5], 'tanggal_lahir', 20, rowNumber, report),
      usia: usia,
      desa: desaResult.value,
      alamat: (row[8] || '').trim() || null,
      no_ktp: enforceLimit(row[9], 'no_ktp', 30, rowNumber, report),
      no_bpjs: enforceLimit(row[10], 'no_bpjs', 30, rowNumber, report),
    });
  });

  const uniquePatients = Array.from(patientMap.values());
  console.log(`Pasien unik terbaca: ${uniquePatients.length}`);
  if (report.missingRm > 0) console.log(`  Baris tanpa Nomor RM: ${report.missingRm}`);
  if (report.desaNormalized > 0) {
    console.log(`  Nama desa diseragamkan: ${report.desaNormalized} pasien`);
  }
  if (report.unknownDesa.size > 0) {
    console.log('  Nama desa tidak dikenali (dibiarkan apa adanya):');
    report.unknownDesa.forEach((count, name) => console.log(`      - ${name} (${count})`));
  }

  // 3. Build visits and cash flows
  const visitsToInsert = [];
  const cashFlowsToInsert = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const noRm = (row[1] || '').trim();
    if (!noRm || !patientMap.has(noRm)) return;

    const doctorName = (row[15] || '').toLowerCase().trim();
    let doctorId = null;
    if (doctorName.includes('ovan')) doctorId = doctorMap['dr. ovan'];
    else if (doctorName.includes('neneng')) doctorId = doctorMap['dr. neneng'];
    else if (doctorName.includes('resa') || doctorName.includes('admin') || doctorName.includes('bidan')) {
      doctorId = doctorMap['admin/bdn.resa'];
    }

    const visitDate = parseDate(row[11], rowNumber, report);
    if (!visitDate) return;

    const visitTime = parseTime(row[12]);
    if (!visitTime && (row[12] || '').trim()) report.invalidTime += 1;
    const payer = (row[22] || '').toUpperCase().includes('BPJS') ? 'BPJS' : 'UMUM';

    visitsToInsert.push({
      nomor_antrian: String(index + 1),
      pasien_no_rm: noRm,
      dokter_id: doctorId,
      tanggal_periksa: visitDate,
      jam_periksa: visitTime,
      bulan: enforceLimit(row[13], 'bulan', 30, rowNumber, report),
      kode_icd10: enforceLimit(row[14], 'kode_icd10', 20, rowNumber, report),
      diagnosa_deskripsi: (row[17] || '').trim() || null,
      keluhan_anamnesa: (row[16] || '').trim() || null,
      terapi_obat: (row[18] || '').trim() || null,
      tindakan: enforceLimit(row[24], 'tindakan', 100, rowNumber, report),
      keterangan_tindakan: (row[25] || '').trim() || null,
      lab: enforceLimit(row[20], 'lab', 100, rowNumber, report),
      lab_hasil: enforceLimit(row[21], 'lab_hasil', 50, rowNumber, report),
      jenis_pasien: payer,
      biaya_periksa: parseRupiah(row[23]),
      pendapatan_lain: parseRupiah(row[26]),
      keterangan_pendapatan: (row[27] || '').trim() || null,
      jenis_pembayaran: (row[32] || '').toUpperCase().includes('TF') ? 'TF' : 'Tunai',
      status_pembayaran: 'Lunas',
    });

    const clinicExpense = parseRupiah(row[28]);
    const nonClinicExpense = parseRupiah(row[29]);
    const cashDeposit = parseRupiah(row[31]);
    const note = (row[30] || '').trim();

    if (clinicExpense > 0) {
      cashFlowsToInsert.push({
        tanggal: visitDate,
        jenis: 'Keluar',
        kategori: 'Pengeluaran Obat / Operasional',
        nominal: clinicExpense,
        keterangan: note || 'Pengeluaran Klinik',
      });
    }
    if (nonClinicExpense > 0) {
      cashFlowsToInsert.push({
        tanggal: visitDate,
        jenis: 'Keluar',
        kategori: 'Pengeluaran Non Klinik',
        nominal: nonClinicExpense,
        keterangan: note || 'Pengeluaran Non Klinik',
      });
    }
    if (cashDeposit > 0) {
      cashFlowsToInsert.push({
        tanggal: visitDate,
        jenis: 'Masuk',
        kategori: 'Setor Tunai',
        nominal: cashDeposit,
        keterangan: 'Setoran Kasir ke Bank',
      });
    }
  });

  console.log(`Kunjungan siap impor: ${visitsToInsert.length}`);
  console.log(`Mutasi kas siap impor: ${cashFlowsToInsert.length}`);
  if (report.invalidTime > 0) {
    console.log(`  Jam tidak valid (dikosongkan): ${report.invalidTime} baris`);
  }
  if (report.invalidAge > 0) {
    console.log(`  Usia tidak wajar (dikosongkan): ${report.invalidAge} baris`);
  }
  if (report.invalidDate.length > 0) {
    console.log(`  Tanggal periksa tidak valid (baris dilewati): ${report.invalidDate.length}`);
  }

  if (report.overLength.length > 0) {
    console.log(`Nilai dikosongkan karena melebihi kapasitas kolom: ${report.overLength.length}`);
    report.overLength.forEach((item) => {
      console.log(
        `      - ${item.column} baris CSV ${item.rowNumber}: panjang ${item.length} (batas ${item.limit})`
      );
    });
  }

  // 4. Backup, then reset
  const backup = await backupProgramTables();
  await resetMigrationTables();

  // 5. Upsert patients
  const BATCH_SIZE = 500;
  for (let index = 0; index < uniquePatients.length; index += BATCH_SIZE) {
    const batch = uniquePatients.slice(index, index + BATCH_SIZE);
    const { error } = await supabase.from('patients').upsert(batch, { onConflict: 'no_rm' });
    if (error) throw new Error(`Gagal upsert pasien batch ${index}: ${error.message}`);
  }
  console.log(`Pasien tersimpan: ${uniquePatients.length}`);

  // 6. Patient id map
  const patientRows = await selectAll('patients');
  const patientIdByNoRm = new Map(patientRows.map((row) => [row.no_rm, row.id]));

  // 7. Insert visits
  for (let index = 0; index < visitsToInsert.length; index += BATCH_SIZE) {
    const batch = visitsToInsert.slice(index, index + BATCH_SIZE).map((visit) => {
      const { pasien_no_rm: noRm, ...rest } = visit;
      return { ...rest, pasien_id: patientIdByNoRm.get(noRm) };
    });
    const { error } = await supabase.from('visits').insert(batch);
    if (error) throw new Error(`Gagal insert kunjungan batch ${index}: ${error.message}`);
  }
  console.log(`Kunjungan tersimpan: ${visitsToInsert.length}`);

  // 8. Insert cash flows
  for (let index = 0; index < cashFlowsToInsert.length; index += BATCH_SIZE) {
    const batch = cashFlowsToInsert.slice(index, index + BATCH_SIZE);
    const { error } = await supabase.from('cash_flows').insert(batch);
    if (error) throw new Error(`Gagal insert kas batch ${index}: ${error.message}`);
  }
  console.log(`Mutasi kas tersimpan: ${cashFlowsToInsert.length}`);

  // 9. Restore dependent program data
  await restoreProgramTables(backup, patientIdByNoRm);

  // 10. Verification
  const countOf = async (tableName) => {
    const { count, error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true });
    if (error) throw new Error(`Gagal menghitung ${tableName}: ${error.message}`);
    return count || 0;
  };

  const finalPatients = await countOf('patients');
  const finalVisits = await countOf('visits');
  const finalCash = await countOf('cash_flows');

  const { count: visitsWithoutPatient } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .is('pasien_id', null);

  const { count: distinctRm } = await supabase
    .from('patients')
    .select('no_rm', { count: 'exact', head: true });

  console.log('\n======================================================');
  console.log('VERIFIKASI HASIL MIGRASI');
  console.log('======================================================');
  console.log(`Pasien    : ${finalPatients}`);
  console.log(`Kunjungan : ${finalVisits}`);
  console.log(`Kas       : ${finalCash}`);
  console.log(`Baris pasien ber-Nomor RM   : ${distinctRm}`);
  console.log(`Kunjungan tanpa relasi pasien: ${visitsWithoutPatient || 0}`);
  console.log('======================================================\n');
}

runMigration().catch((error) => {
  console.error('Migrasi gagal:', error.message);
  process.exit(1);
});
