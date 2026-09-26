import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SUPABASE_URL = 'https://jpqmnbtowvfctxciuktj.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcW1uYnRvd3ZmY3R4Y2l1a3RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDEzMzY0MywiZXhwIjoyMTA1NzA5NjQzfQ.sYBt71pgJkJUNdV49Z7czumcoK69qvY-aecKZUYTR6I';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Simple CSV line parser handling quotes
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDateToIso(str) {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

async function run() {
  console.log('🚀 Memulai migrasi data sampel ke Database Staging (jpqmnbtowvfctxciuktj)...');

  // 1. Ambil data dokter yang ada
  const { data: doctors, error: docErr } = await supabase.from('doctors').select('id, nama');
  if (docErr) throw docErr;
  console.log(`👨‍⚕️ Ditemukan ${doctors.length} dokter di staging:`, doctors.map((d) => d.nama).join(', '));
  const defaultDocId = doctors[0]?.id;

  // 2. Baca file CSV
  const csvFile = path.join(projectRoot, 'docs', 'data', 'DASHBOARD - DATAUTAMA.csv');
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File CSV tidak ditemukan di ${csvFile}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  console.log(`📄 Total baris dalam CSV: ${lines.length}`);

  // Header line
  const header = parseCsvLine(lines[0]);
  console.log('📋 Kolom CSV:', header.slice(0, 15).join(', '));

  // Ambil 120 baris pertama untuk sampel
  const sampleLines = lines.slice(1, 121);
  console.log(`⚡ Mengambil ${sampleLines.length} baris riwayat kunjungan sampel...`);

  const uniquePatients = new Map();
  const rawRows = [];

  for (const line of sampleLines) {
    const cols = parseCsvLine(line);
    const noRm = cols[1];
    if (!noRm) continue;

    const row = {
      noRm,
      gelar: cols[2] || 'Tn.',
      nama: cols[3] || 'Pasien',
      jenisKelamin: cols[4] === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
      tanggalLahir: cols[5] || null,
      usia: parseInt(cols[6], 10) || null,
      desa: cols[7] || 'Cikidang',
      alamat: cols[8] || null,
      noKtp: cols[9] || null,
      noBpjs: cols[10] || null,
      tanggalPeriksa: parseDateToIso(cols[11]),
      jamPeriksa: cols[12] || '09:00',
      bulan: cols[13] || 'Agustus',
      kodeIcd10: (cols[14] || '').toUpperCase(),
      dokterName: cols[15] || 'dr. Neneng',
      anamnesa: cols[16] || '',
      diagnosa: cols[17] || '',
      terapi: cols[18] || '',
      tindakan: cols[24] || null,
      jenisPasien: (cols[22] || '').toUpperCase().includes('BPJS') ? 'BPJS' : 'UMUM',
      biayaPeriksa: (cols[22] || '').toUpperCase().includes('BPJS') ? 0 : 150000,
    };

    rawRows.push(row);

    if (!uniquePatients.has(noRm)) {
      // Tambahkan variasi riwayat alergi untuk beberapa pasien guna demo fitur Drug Safety Alert
      let riwayatAlergi = 'Tidak Ada';
      if (noRm === '10200003') riwayatAlergi = 'Amoxicillin, Penicillin';
      if (noRm === '20100005') riwayatAlergi = 'Paracetamol, Sulfa';
      if (noRm === '20200002') riwayatAlergi = 'Cetirizine, Antihistamin';

      uniquePatients.set(noRm, {
        no_rm: noRm,
        gelar: row.gelar,
        nama: row.nama,
        jenis_kelamin: row.jenisKelamin,
        tanggal_lahir: row.tanggalLahir,
        usia: row.usia,
        desa: row.desa,
        alamat: row.alamat,
        no_ktp: row.noKtp,
        no_bpjs: row.noBpjs,
        riwayat_alergi: riwayatAlergi,
        no_telepon: '0812-3456-' + noRm.slice(-4),
        pekerjaan: 'Wiraswasta',
      });
    }
  }

  console.log(`👥 Terkumpul ${uniquePatients.size} pasien unik untuk dimigrasikan.`);

  // 3. Masukkan pasien ke database Staging
  const patientRecords = Array.from(uniquePatients.values());
  const { data: insertedPatients, error: pErr } = await supabase
    .from('patients')
    .upsert(patientRecords, { onConflict: 'no_rm' })
    .select('id, no_rm, nama');

  if (pErr) throw pErr;
  console.log(`✅ Berhasil upsert ${insertedPatients.length} data master pasien ke Staging.`);

  // Buat lookup map No RM -> ID
  const patientIdMap = new Map();
  insertedPatients.forEach((p) => patientIdMap.set(p.no_rm, p.id));

  // 4. Siapkan kunjungan
  const todayStr = new Date().toISOString().split('T')[0];
  const visitInserts = [];

  let queueNumber = 1;
  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    const pid = patientIdMap.get(r.noRm);
    if (!pid) continue;

    // Cari ID dokter
    const doc = doctors.find((d) => d.nama.toLowerCase().includes(r.dokterName.toLowerCase())) || doctors[0];

    // Jadikan 6 data pertama sebagai antrean HARI INI di loket dan rekam medis
    const isTodayQueue = i < 6;
    const tanggalPeriksa = isTodayQueue ? todayStr : r.tanggalPeriksa || todayStr;
    const nomorAntrian = isTodayQueue ? `A-00${queueNumber++}` : `A-${String(i + 1).padStart(3, '0')}`;

    const hour = 8 + Math.floor((30 + i * 5) / 60);
    const minute = (30 + i * 5) % 60;
    const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    visitInserts.push({
      pasien_id: pid,
      dokter_id: doc.id,
      tanggal_periksa: tanggalPeriksa,
      jam_periksa: isTodayQueue ? timeFormatted : r.jamPeriksa ? `${r.jamPeriksa}:00` : '09:00:00',
      bulan: r.bulan,
      nomor_antrian: nomorAntrian,
      kode_icd10: isTodayQueue && i < 2 ? null : r.kodeIcd10 || null, // biarkan 2 antrean belum diperiksa untuk uji form dokter
      diagnosa_deskripsi: isTodayQueue && i < 2 ? null : r.diagnosa || null,
      keluhan_anamnesa: r.anamnesa || 'Kontrol keluhan rutin',
      terapi_obat: isTodayQueue && i < 2 ? null : r.terapi || null,
      tindakan: r.tindakan,
      jenis_pasien: r.jenisPasien,
      biaya_periksa: r.biayaPeriksa,
      status_pembayaran: 'Lunas',
      jenis_pembayaran: r.jenisPasien === 'BPJS' ? 'Tunai' : i % 3 === 0 ? 'TF' : 'Tunai',
    });
  }

  // 5. Masukkan kunjungan
  const { data: insertedVisits, error: vErr } = await supabase
    .from('visits')
    .insert(visitInserts)
    .select('id');

  if (vErr) throw vErr;
  console.log(`✅ Berhasil menginjeksi ${insertedVisits.length} riwayat kunjungan ke Database Staging!`);
  console.log(`🎉 Antrean aktif hari ini (${todayStr}) tersedia 6 pasien untuk dicoba langsung.`);
}

run().catch((err) => {
  console.error('❌ Gagal menjalankan migrasi sampel:', err);
  process.exit(1);
});
