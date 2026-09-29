/**
 * Audit seluruh ekspor Google Sheets klinik di docs/data sebelum rekonsiliasi.
 *
 * Skrip ini read-only dan tidak pernah menulis ke database. Tujuannya menjawab
 * pertanyaan klien "apakah ada data yang terlewat", dengan cara:
 *
 *   A. Profil tiap berkas  : bentuk, kolom, tingkat keterisian, kandidat kunci
 *   B. Perbandingan pasien : himpunan No RM antar berkas sumber
 *   C. Format No RM        : deteksi duplikat akibat nol depan yang hilang
 *   D. Selisih migrasi     : apa yang ada di REKAMMEDIS tapi belum di DATAUTAMA
 *   E. Verifikasi turunan  : apakah LAPORAN DPP/QUERY hanya view dari REKAMMEDIS
 *   F. Rujukan bidan       : ekstraksi nama bidan dari kolom "Ket. Tindakan"
 *   G. Struktur sheet      : dump blok filter (rentang tanggal) pada sheet QUERY
 *
 * Identitas pasien tidak pernah dicetak; hanya jumlah, panjang, dan sampel tersamar.
 *
 * Usage:
 *   node scripts/audit-clinic-sheets.mjs
 */

import fs from 'fs';
import path from 'path';
import {
  DATA_DIR,
  FILES,
  fillRate,
  frequency,
  keyStats,
  normalizeDate,
  readCsv,
  rmKey,
  rule,
  visitKey,
  visitKeyOf,
} from './lib/clinic-csv.mjs';

// Berkas turunan punya susunan kolom sendiri, jadi kolom No RM dideteksi per berkas.
function detectNoRmColumn(rows) {
  let best = { index: 0, score: -1 };
  [0, 1, 2].forEach((index) => {
    const score = rows
      .slice(0, 300)
      .filter((row) => /^\d{5,11}$/.test((row[index] || '').trim())).length;
    if (score > best.score) best = { index, score };
  });
  return best.index;
}

const DERIVED_REPORTS = [
  FILES.dppPtm,
  FILES.dppKb,
  FILES.tripleEliminasi,
  FILES.dppUsg,
  FILES.dataUsg,
  FILES.hbSAg,
];

// ------------------------------------------------------------- A. profil berkas

const files = fs
  .readdirSync(DATA_DIR)
  .filter((name) => name.toLowerCase().endsWith('.csv'))
  .sort();

console.log(`\n${rule()}\nA. PROFIL BERKAS CSV (${files.length} berkas)\n${rule()}`);

files.forEach((fileName) => {
  const { header, rows } = readCsv(fileName);
  const sizeKb = Math.round(fs.statSync(path.join(DATA_DIR, fileName)).size / 1024);
  const named = header.map((name, idx) => ({ name, idx })).filter((entry) => entry.name.length > 0);
  const unnamedCount = header.length - named.length;

  console.log(`\n${fileName}`);
  console.log(
    `   ${sizeKb} KB | ${rows.length} baris | ${header.length} kolom (${unnamedCount} tanpa nama)`
  );

  if (named.length === 0) {
    const sample = rows
      .slice(0, 6)
      .flatMap((row) => row.slice(0, 2))
      .filter(Boolean)
      .slice(0, 12);
    console.log(`   (pivot/analisa, tanpa nama kolom) contoh: ${sample.join(' | ')}`);
    return;
  }

  named.forEach(({ name, idx }) => {
    console.log(`   [${String(idx).padStart(2, '0')}] ${name}  (terisi ${Math.round(fillRate(rows, idx) * 100)}%)`);
  });

  if (rows.length >= 5) {
    const keys = named
      .map(({ name, idx }) => ({ name, idx, ...keyStats(rows, idx) }))
      .filter((entry) => entry.unique >= rows.length * 0.5)
      .sort((a, b) => b.unique - a.unique)
      .slice(0, 6);
    if (keys.length > 0) {
      console.log('   kandidat kunci:');
      keys.forEach((entry) =>
        console.log(`      ${entry.name}: ${entry.unique} unik, ${entry.duplicates} duplikat`)
      );
    }
  }
});

// ------------------------------------------------- B. perbandingan himpunan pasien

console.log(`\n${rule()}\nB. PERBANDINGAN HIMPUNAN No RM ANTAR SUMBER\n${rule()}`);

const setOf = (fileName, index) => {
  const { rows } = readCsv(fileName);
  return new Set(rows.map((row) => rmKey(row[index])).filter(Boolean));
};

const sets = {
  'DATAUTAMA': setOf(FILES.utama, 1),
  'REKAMMEDIS (sumber terlengkap)': setOf(FILES.rekam, 1),
  'DATAPASIEN': setOf(FILES.datapasien, 3),
  'USG [DATA]': setOf(FILES.dataUsg, 0),
  'USG (DPP)': setOf(FILES.dppUsg, 0),
};

Object.entries(sets).forEach(([label, set]) => console.log(`   ${label.padEnd(32)}: ${set.size} pasien`));

const compare = (label, left, right) => {
  const onlyLeft = [...left].filter((value) => !right.has(value)).length;
  const onlyRight = [...right].filter((value) => !left.has(value)).length;
  const inter = [...left].filter((value) => right.has(value)).length;
  console.log(`   ${label.padEnd(32)}: kiri ${onlyLeft} | kanan ${onlyRight} | irisan ${inter}`);
};

console.log('');
compare('DATAUTAMA vs REKAMMEDIS', sets['DATAUTAMA'], sets['REKAMMEDIS (sumber terlengkap)']);
compare('REKAMMEDIS vs DATAPASIEN', sets['REKAMMEDIS (sumber terlengkap)'], sets['DATAPASIEN']);
compare('USG [DATA] vs USG (DPP)', sets['USG [DATA]'], sets['USG (DPP)']);

// ---------------------------------------------------------------- C. format No RM

console.log(`\n${rule()}\nC. FORMAT No RM & DUPLIKAT AKIBAT NOL DEPAN HILANG\n${rule()}`);

[
  { fileName: FILES.utama, noRmIndex: 1 },
  { fileName: FILES.rekam, noRmIndex: 1 },
  { fileName: FILES.datapasien, noRmIndex: 3 },
].forEach(({ fileName, noRmIndex }) => {
  const { rows } = readCsv(fileName);
  const raw = new Set();
  const grouped = new Map();
  const lengths = new Map();

  rows.forEach((row) => {
    const value = (row[noRmIndex] || '').trim();
    if (!value) return;
    raw.add(value);
    lengths.set(value.length, (lengths.get(value.length) || 0) + 1);
    const key = rmKey(value) || `RAW:${value}`;
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key).add(value);
  });

  const groups = [...grouped.values()].filter((group) => group.size > 1);
  const excess = groups.reduce((sum, group) => sum + group.size - 1, 0);

  console.log(`\n${fileName}`);
  console.log(`   nilai No RM mentah      : ${raw.size}`);
  console.log(`   identitas setelah norm. : ${grouped.size}`);
  console.log(`   grup duplikat           : ${groups.length}  (baris berlebih: ${excess})`);
  groups.slice(0, 5).forEach((group) => {
    const masked = [...group].map((value) => `${value.slice(0, 3)}***${value.slice(-2)}`);
    console.log(`      contoh: ${masked.join('  ==  ')}`);
  });
  console.log(
    `   sebaran panjang nilai   : ${[...lengths.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([len, total]) => `${len} digit ${total}x`)
      .join(', ')}`
  );
});

// ----------------------------------------------------------- D. selisih kunjungan

console.log(`\n${rule()}\nD. SELISIH REKAMMEDIS vs DATAUTAMA (DATA BELUM TERMIGRASI)\n${rule()}`);

const utama = readCsv(FILES.utama);
const rekam = readCsv(FILES.rekam);

const utamaKeys = new Set(utama.rows.map(visitKeyOf));
const rekamKeys = new Set(rekam.rows.map(visitKeyOf));
const onlyRekam = rekam.rows.filter((row) => !utamaKeys.has(visitKeyOf(row)));

console.log(`\n   DATAUTAMA  : ${utama.rows.length} baris kunjungan`);
console.log(`   REKAMMEDIS : ${rekam.rows.length} baris kunjungan`);
console.log(`   hanya di REKAMMEDIS                 : ${onlyRekam.length} baris`);
console.log(
  `   hanya di DATAUTAMA (cek regresi)    : ${
    utama.rows.filter((row) => !rekamKeys.has(visitKeyOf(row))).length
  } baris`
);

const utamaNoRm = new Set(utama.rows.map((row) => rmKey(row[1])).filter(Boolean));
const extraNoRm = new Set(onlyRekam.map((row) => rmKey(row[1])).filter(Boolean));
const brandNew = [...extraNoRm].filter((key) => !utamaNoRm.has(key));

console.log(`   pasien melibatkan baris ekstra      : ${extraNoRm.size}`);
console.log(`     - benar-benar pasien baru         : ${brandNew.length}`);
console.log(`     - pasien lama dengan kunjungan baru: ${extraNoRm.size - brandNew.length}`);

const dates = onlyRekam
  .map((row) => normalizeDate(row[11]))
  .filter(Boolean)
  .sort();
if (dates.length > 0) {
  console.log(`   rentang tanggal baris ekstra        : ${dates[0]} s/d ${dates[dates.length - 1]}`);
}
const extraByMonth = new Map();
onlyRekam.forEach((row) => {
  const bulan = (row[13] || '').trim() || '(kosong)';
  extraByMonth.set(bulan, (extraByMonth.get(bulan) || 0) + 1);
});
console.log(
  `   sebaran bulan                       : ${[...extraByMonth.entries()]
    .map(([bulan, total]) => `${bulan} ${total}x`)
    .join(', ')}`
);

// -------------------------------------------------------- E. verifikasi turunan

console.log(`\n${rule()}\nE. VERIFIKASI BERKAS TURUNAN (view vs sumber)\n${rule()}`);

const rekamNoRm = new Set(rekam.rows.map((row) => rmKey(row[1])).filter(Boolean));

DERIVED_REPORTS.forEach((fileName) => {
  const { rows } = readCsv(fileName);
  const noRmCol = detectNoRmColumn(rows);
  const patients = new Set();
  const keys = new Set();

  rows.forEach((row) => {
    const key = rmKey(row[noRmCol]);
    if (!key) return;
    patients.add(key);
    keys.add(
      visitKey(row[noRmCol], row[noRmCol + 10], row[noRmCol + 13])
    );
  });

  const patientHit = [...patients].filter((key) => rekamNoRm.has(key)).length;
  const keyHit = [...keys].filter((key) => rekamKeys.has(key)).length;
  const pct = (hit, total) => (total === 0 ? 0 : Math.round((hit / total) * 100));

  console.log(`\n   ${fileName}`);
  console.log(`      ${rows.length} baris | No RM di kolom ${noRmCol}`);
  console.log(`      pasien ada di REKAMMEDIS : ${patientHit}/${patients.size} (${pct(patientHit, patients.size)}%)`);
  console.log(`      kunjungan cocok          : ${keyHit}/${keys.size} (${pct(keyHit, keys.size)}%)`);
});

// ------------------------------------------------------------ F. rujukan bidan

console.log(`\n${rule()}\nF. RUJUKAN BIDAN (kolom "Ket. Tindakan" berawalan "Bdn.")\n${rule()}`);

const referralRows = rekam.rows.filter((row) => /^bdn\./i.test((row[25] || '').trim()));
const bidanCounts = new Map();
const bidanPatients = new Map();
const bidanIcd = new Map();

referralRows.forEach((row) => {
  const bidan = (row[25] || '').trim();
  const icd = (row[14] || '').trim() || '(kosong)';
  bidanCounts.set(bidan, (bidanCounts.get(bidan) || 0) + 1);
  bidanIcd.set(`${bidan} -> ${icd}`, (bidanIcd.get(`${bidan} -> ${icd}`) || 0) + 1);
  if (!bidanPatients.has(bidan)) bidanPatients.set(bidan, new Set());
  bidanPatients.get(bidan).add(rmKey(row[1]));
});

console.log(`\n   total baris rujukan: ${referralRows.length}\n`);
[...bidanCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([bidan, total]) =>
    console.log(
      `   ${String(total).padStart(4)}x  ${bidan.padEnd(12)} (${bidanPatients.get(bidan).size} pasien unik)`
    )
  );

console.log('\n   Kode ICD dominan per bidan (top 12):');
[...bidanIcd.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .forEach(([key, total]) => console.log(`   ${String(total).padStart(4)}x  ${key}`));

console.log('\n   Catatan: "Admin/Bdn.Resa" di kolom "Dokter / Petugas" adalah petugas internal,');
console.log('   bukan sumber rujukan. Jangan dicampur dengan Bdn.<nama> di "Ket. Tindakan".');

// ------------------------------------------------------- G. struktur sheet QUERY

console.log(`\n${rule()}\nG. STRUKTUR SHEET BER-FILTER (blok rentang tanggal di atas tabel)\n${rule()}`);

[FILES.dashboardQuery, FILES.dppQuery, FILES.pendataanUsg].forEach((fileName) => {
  const { rows } = readCsv(fileName);
  console.log(`\n   ${fileName} (${rows.length} baris)`);
  rows.slice(0, 9).forEach((row, rowIndex) => {
    const rendered = row
      .slice(0, 16)
      .map((cell, colIndex) => (cell ? `[${colIndex}]${cell.slice(0, 22)}` : null))
      .filter(Boolean)
      .join('  ');
    console.log(`      ${rowIndex === 0 ? 'HDR' : `R${String(rowIndex).padStart(2, '0')}`} ${rendered}`);
  });
  console.log('      (baris "Tgl Pmrksan : a - b" adalah rentang tanggal filter laporan)');
});

console.log(`\n${rule()}\nSELESAI\n${rule()}\n`);
