import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Baca .env.local secara manual
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    env[key.trim()] = vals.join('=').trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Kredensial Supabase tidak ditemukan di .env.local!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

console.log('Terhubung ke Supabase:', SUPABASE_URL);

// Helper parse CSV sederhana dengan dukungan kutip
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let inQuotes = false;
    let current = '';
    
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
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
    rows.push(row);
  }
  return rows;
}

// Helper parse tanggal ke format YYYY-MM-DD
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const str = dateStr.trim().replace(/\//g, '-');
  const parts = str.split('-');
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Jika format YYYY-MM-DD
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
    
    if (year < 100) year += 2000;
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
  return new Date().toISOString().split('T')[0];
}

// Helper parse rupiah
function parseRupiah(val) {
  if (!val) return 0;
  const clean = val.replace(/[^0-9]/g, '');
  if (!clean) return 0;
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

async function runMigration() {
  const csvPath = path.resolve(process.cwd(), 'docs/data/DASHBOARD - DATAUTAMA.csv');
  console.log('Membaca CSV:', csvPath);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  
  console.log(`Total baris terbaca: ${rows.length} (termasuk header)`);
  const dataRows = rows.slice(1); // skip header
  
  // 1. Ambil Dokter dari DB untuk mapping nama -> dokter_id
  const { data: doctorsData, error: docErr } = await supabase.from('doctors').select('id, nama');
  if (docErr) throw docErr;
  
  const doctorMap = {};
  doctorsData.forEach(d => {
    doctorMap[d.nama.toLowerCase().trim()] = d.id;
  });
  console.log('Daftar Dokter di DB:', doctorsData.map(d => d.nama));

  // 2. Kumpulkan Pasien Unik berdasarkan No RM
  console.log('Mengekstrak data pasien unik...');
  const patientMap = new Map();
  
  for (const row of dataRows) {
    const noRm = row[1]?.trim();
    if (!noRm) continue;
    
    if (!patientMap.has(noRm)) {
      patientMap.set(noRm, {
        no_rm: noRm,
        gelar: row[2]?.trim() || 'Tn',
        nama: row[3]?.trim() || 'Tanpa Nama',
        jenis_kelamin: row[4]?.trim() || 'Laki-laki',
        tanggal_lahir: row[5]?.trim() || null,
        usia: parseInt(row[6], 10) || null,
        desa: row[7]?.trim() || 'Cikidang',
        alamat: row[8]?.trim() || null,
        no_ktp: row[9]?.trim() || null,
        no_bpjs: row[10]?.trim() || null
      });
    }
  }

  const uniquePatients = Array.from(patientMap.values());
  console.log(`Ditemukan ${uniquePatients.length} pasien unik dari 7.493 catatan!`);

  // 3. Batch UPSERT Pasien ke Supabase (500 per batch per Supabase Best Practices)
  console.log('Memulai Batch Upsert Pasien ke Supabase...');
  const BATCH_SIZE = 500;
  for (let i = 0; i < uniquePatients.length; i += BATCH_SIZE) {
    const batch = uniquePatients.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('patients').upsert(batch, { onConflict: 'no_rm' });
    if (error) {
      console.error(`Error upsert batch pasien ${i}-${i + batch.length}:`, error.message);
      throw error;
    }
    console.log(`  -> Berhasil upsert pasien: ${Math.min(i + BATCH_SIZE, uniquePatients.length)} / ${uniquePatients.length}`);
  }

  // 4. Ambil semua pasien id untuk mapping no_rm -> id (dengan pagination per Supabase Best Practices)
  console.log('Mengambil mapping ID seluruh pasien...');
  const allPatients = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data: pageData, error: pErr } = await supabase
      .from('patients')
      .select('id, no_rm')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (pErr) throw pErr;
    if (!pageData || pageData.length === 0) break;
    
    allPatients.push(...pageData);
    console.log(`  -> Terambil ${allPatients.length} pasien untuk mapping...`);
    if (pageData.length < pageSize) break;
    page++;
  }
  
  console.log(`Total mapping pasien siap: ${allPatients.length}`);
  const patientIdMap = {};
  allPatients.forEach(p => {
    patientIdMap[p.no_rm] = p.id;
  });

  // 5. Siapkan Data Kunjungan (Visits) & Cash Flows
  console.log('Menyiapkan data kunjungan & buku kas...');
  const visitsToInsert = [];
  const cashFlowsToInsert = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const noRm = row[1]?.trim();
    if (!noRm || !patientIdMap[noRm]) continue;

    const rawDokter = row[15]?.toLowerCase().trim();
    let dokterId = null;
    if (rawDokter) {
      if (rawDokter.includes('ovan')) dokterId = doctorMap['dr. ovan'];
      else if (rawDokter.includes('neneng')) dokterId = doctorMap['dr. neneng'];
      else if (rawDokter.includes('resa') || rawDokter.includes('admin') || rawDokter.includes('bidan')) dokterId = doctorMap['admin/bdn.resa'];
    }

    const tglPeriksa = parseDate(row[11]);
    const jenisPasien = row[22]?.toUpperCase().includes('BPJS') ? 'BPJS' : 'UMUM';
    const biayaPeriksa = parseRupiah(row[23]);
    const pendapatanLain = parseRupiah(row[26]);
    const jenisPembayaran = row[32]?.toUpperCase().includes('TF') ? 'TF' : 'Tunai';

    const rawJam = row[12]?.trim();
    const jamPeriksa = (rawJam && !rawJam.includes('#') && !rawJam.includes('REF')) ? rawJam : null;

    visitsToInsert.push({
      nomor_antrian: String(i + 1),
      pasien_id: patientIdMap[noRm],
      dokter_id: dokterId,
      tanggal_periksa: tglPeriksa,
      jam_periksa: jamPeriksa,
      bulan: row[13]?.trim() || null,
      kode_icd10: row[14]?.trim() || null,
      diagnosa_deskripsi: row[17]?.trim() || null,
      keluhan_anamnesa: row[16]?.trim() || null,
      terapi_obat: row[18]?.trim() || null,
      tindakan: row[24]?.trim() || null,
      keterangan_tindakan: row[25]?.trim() || null,
      lab: row[20]?.trim() || null,
      lab_hasil: row[21]?.trim() || null,
      jenis_pasien: jenisPasien,
      biaya_periksa: biayaPeriksa,
      pendapatan_lain: pendapatanLain,
      keterangan_pendapatan: row[27]?.trim() || null,
      jenis_pembayaran: jenisPembayaran,
      status_pembayaran: 'Lunas'
    });

    // Catat pengeluaran klinik jika ada
    const pengeluaranKlinik = parseRupiah(row[28]);
    const pengeluaranNon = parseRupiah(row[29]);
    const setorTunai = parseRupiah(row[31]);

    if (pengeluaranKlinik > 0) {
      cashFlowsToInsert.push({
        tanggal: tglPeriksa,
        jenis: 'Keluar',
        kategori: 'Pengeluaran Obat / Operasional',
        nominal: pengeluaranKlinik,
        keterangan: row[30]?.trim() || 'Pengeluaran Klinik'
      });
    }
    if (pengeluaranNon > 0) {
      cashFlowsToInsert.push({
        tanggal: tglPeriksa,
        jenis: 'Keluar',
        kategori: 'Pengeluaran Non Klinik',
        nominal: pengeluaranNon,
        keterangan: row[30]?.trim() || 'Pengeluaran Non Klinik'
      });
    }
    if (setorTunai > 0) {
      cashFlowsToInsert.push({
        tanggal: tglPeriksa,
        jenis: 'Masuk',
        kategori: 'Setor Tunai',
        nominal: setorTunai,
        keterangan: 'Setoran Kasir ke Bank'
      });
    }
  }

  // 6. Batch INSERT Kunjungan (Visits) ke Supabase
  console.log(`Memulai Batch Insert ${visitsToInsert.length} data kunjungan ke Supabase...`);
  for (let i = 0; i < visitsToInsert.length; i += BATCH_SIZE) {
    const batch = visitsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('visits').insert(batch);
    if (error) {
      console.error(`Error insert batch kunjungan ${i}-${i + batch.length}:`, error.message);
      throw error;
    }
    console.log(`  -> Berhasil insert kunjungan: ${Math.min(i + BATCH_SIZE, visitsToInsert.length)} / ${visitsToInsert.length}`);
  }

  // 7. Batch INSERT Cash Flows ke Supabase
  if (cashFlowsToInsert.length > 0) {
    console.log(`Memulai Batch Insert ${cashFlowsToInsert.length} data buku kas ke Supabase...`);
    for (let i = 0; i < cashFlowsToInsert.length; i += BATCH_SIZE) {
      const batch = cashFlowsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('cash_flows').insert(batch);
      if (error) {
        console.error(`Error insert batch cash flows ${i}-${i + batch.length}:`, error.message);
        throw error;
      }
      console.log(`  -> Berhasil insert cash flow: ${Math.min(i + BATCH_SIZE, cashFlowsToInsert.length)} / ${cashFlowsToInsert.length}`);
    }
  }

  console.log('\n======================================================');
  console.log('MIGRASI DATA BERHASIL 100%!');
  console.log(`Total Pasien: ${uniquePatients.length}`);
  console.log(`Total Kunjungan: ${visitsToInsert.length}`);
  console.log(`Total Cash Flows: ${cashFlowsToInsert.length}`);
  console.log('======================================================\n');
}

runMigration().catch(err => {
  console.error('Fatal Error saat migrasi:', err);
  process.exit(1);
});
