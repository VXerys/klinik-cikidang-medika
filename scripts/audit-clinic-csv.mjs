/**
 * Audit the clinic Google Sheets export before migration.
 *
 * Reports row counts, doctor/payment value variants, and every field whose
 * length exceeds the target PostgreSQL column limit. Patient identifiers are
 * never printed; only lengths and row numbers are reported.
 */

import fs from 'fs';
import path from 'path';

const CSV_PATH = path.resolve(process.cwd(), 'docs/data/DASHBOARD - DATAUTAMA.csv');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
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
    return row;
  });
}

// Target destination column and its PostgreSQL length limit.
// `null` limit means the destination is TEXT (unbounded).
const PATIENT_FIELDS = [
  { index: 1, column: 'no_rm', limit: 30 },
  { index: 2, column: 'gelar', limit: 10 },
  { index: 3, column: 'nama', limit: 150 },
  { index: 4, column: 'jenis_kelamin', limit: 20 },
  { index: 5, column: 'tanggal_lahir', limit: 20 },
  { index: 7, column: 'desa', limit: 100 },
  { index: 8, column: 'alamat', limit: null },
  { index: 9, column: 'no_ktp', limit: 30 },
  { index: 10, column: 'no_bpjs', limit: 30 },
];

const VISIT_FIELDS = [
  { index: 13, column: 'bulan', limit: 30 },
  { index: 14, column: 'kode_icd10', limit: 20 },
  { index: 15, column: 'dokter (mapping)', limit: null },
  { index: 16, column: 'keluhan_anamnesa', limit: null },
  { index: 17, column: 'diagnosa_deskripsi', limit: null },
  { index: 18, column: 'terapi_obat', limit: null },
  { index: 20, column: 'lab', limit: 100 },
  { index: 21, column: 'lab_hasil', limit: 50 },
  { index: 24, column: 'tindakan', limit: 100 },
  { index: 25, column: 'keterangan_tindakan', limit: null },
  { index: 30, column: 'keterangan_pengeluaran', limit: null },
];

function audit(rawText) {
  const rows = parseCSV(rawText);
  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log('=========================================================');
  console.log('AUDIT CSV DATA KLINIK');
  console.log('=========================================================');
  console.log(`Berkas        : ${path.basename(CSV_PATH)}`);
  console.log(`Ukuran        : ${(fs.statSync(CSV_PATH).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Baris total   : ${rows.length} (termasuk 1 baris header)`);
  console.log(`Baris data    : ${dataRows.length}`);
  console.log(`Jumlah kolom  : ${header.length}`);
  console.log('');

  console.log('--- Peta Kolom CSV ---');
  header.forEach((name, idx) => {
    console.log(`  [${String(idx).padStart(2, '0')}] ${name || '(tanpa nama)'}`);
  });
  console.log('');

  // Unique patients and rows without a medical record number.
  const noRmIndex = 1;
  const uniqueRm = new Map();
  let rowsWithoutRm = 0;
  dataRows.forEach((row, idx) => {
    const noRm = (row[noRmIndex] || '').trim();
    if (!noRm) {
      rowsWithoutRm += 1;
      return;
    }
    if (!uniqueRm.has(noRm)) uniqueRm.set(noRm, idx + 2);
  });

  console.log('--- Ringkasan Pasien ---');
  console.log(`  Nomor RM unik        : ${uniqueRm.size}`);
  console.log(`  Baris tanpa Nomor RM : ${rowsWithoutRm}`);
  console.log('');

  // Length violations against destination column limits.
  console.log('--- Pelanggaran Panjang Kolom (akan menggagalkan migrasi) ---');
  let totalViolations = 0;

  const checkFields = (fields, scope) => {
    fields.forEach((field) => {
      if (field.limit === null) return;

      let maxLength = 0;
      let violationCount = 0;
      const samples = [];

      dataRows.forEach((row, idx) => {
        const value = (row[field.index] || '').trim();
        if (!value) return;
        if (value.length > maxLength) maxLength = value.length;
        if (value.length > field.limit) {
          if (violationCount === 0) {
            samples.push(`baris CSV ${idx + 2} (panjang ${value.length})`);
          }
          violationCount += 1;
        }
      });

      if (violationCount > 0) {
        totalViolations += violationCount;
        console.log(
          `  [!] ${scope}.${field.column}: ${violationCount} nilai melebihi batas ${field.limit} ` +
            `(terpanjang ${maxLength}) contoh: ${samples.join(', ')}`
        );

        // Report the shape of the offending value, never its content.
        dataRows.forEach((row, idx) => {
          const value = (row[field.index] || '').trim();
          if (value.length <= field.limit) return;
          const digits = (value.match(/[0-9]/g) || []).length;
          const letters = (value.match(/[A-Za-z]/g) || []).length;
          const spaces = (value.match(/\s/g) || []).length;
          const separators = (value.match(/[^0-9A-Za-z\s]/g) || []).length;
          console.log(
            `      bentuk nilai (baris ${idx + 2}): ${value.length} karakter, ` +
              `${digits} angka, ${letters} huruf, ${spaces} spasi, ${separators} karakter lain`
          );
        });
      }
    });
  };

  checkFields(PATIENT_FIELDS, 'patients');
  checkFields(VISIT_FIELDS, 'visits');
  console.log('');

  if (totalViolations === 0) {
    console.log('  Tidak ada pelanggaran panjang kolom.');
  } else {
    console.log(`  Total nilai bermasalah: ${totalViolations}`);
  }
  console.log('');

  // Distinct value variants that drive mapping decisions.
  console.log('--- Variasi Nilai untuk Pemetaan ---');

  const countValues = (index, label, maxShown = 12) => {
    const counts = new Map();
    dataRows.forEach((row) => {
      const value = (row[index] || '').trim();
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    console.log(`  ${label}: ${sorted.length} nilai unik`);
    sorted.slice(0, maxShown).forEach(([value, count]) => {
      console.log(`      - ${value} (${count})`);
    });
    if (sorted.length > maxShown) {
      console.log(`      ... dan ${sorted.length - maxShown} nilai lainnya`);
    }
  };

  countValues(15, 'Kolom dokter');
  countValues(4, 'Jenis kelamin');
  countValues(22, 'Kolom indeks 22');
  countValues(23, 'Kolom indeks 23');
  countValues(32, 'Metode pembayaran');
  countValues(7, 'Desa (semua nilai)', 30);
  console.log('');

  // Columns that must satisfy a strict PostgreSQL type (DATE, TIME, INT, NUMERIC).
  console.log('--- Pemeriksaan Nilai Bertipe Ketat ---');

  const timePattern = /^(\d{1,2})[:.](\d{2})(?::(\d{2}))?$/;
  const datePartsPattern = /^(\d{1,4})[-/](\d{1,2})[-/](\d{1,4})$/;

  const strictChecks = [
    { index: 11, label: 'Tgl Pmrksan (DATE)', test: (v) => datePartsPattern.test(v) },
    { index: 12, label: 'Jam (TIME)', test: (v) => timePattern.test(v) },
    { index: 6, label: 'Usia (INT)', test: (v) => /^\d{1,3}$/.test(v) },
    { index: 23, label: 'Pendapatan (NUMERIC)', test: (v) => /^[Rr]p?\s?[\d.,]+$/.test(v) },
    { index: 26, label: 'Pendpatan lain (NUMERIC)', test: (v) => /^[Rr]p?\s?[\d.,]+$/.test(v) },
    { index: 13, label: 'Bulan (VARCHAR 30)', test: (v) => v.length <= 30 },
    { index: 14, label: 'Kode ICD (VARCHAR 20)', test: (v) => v.length <= 20 },
  ];

  strictChecks.forEach((check) => {
    const invalid = new Map();
    let invalidCount = 0;

    dataRows.forEach((row, idx) => {
      const value = (row[check.index] || '').trim();
      if (!value) return;
      if (check.test(value)) return;
      invalidCount += 1;
      // Record only a shape signature, never the raw value.
      const signature = `${value.length} karakter (${
        /^[0-9]+$/.test(value) ? 'angka' : /^[A-Za-z]+$/.test(value) ? 'huruf' : 'campuran'
      })`;
      invalid.set(signature, (invalid.get(signature) || 0) + 1);
    });

    if (invalidCount === 0) {
      console.log(`  [OK]    ${check.label}: seluruh nilai valid`);
    } else {
      console.log(`  [!]     ${check.label}: ${invalidCount} nilai tidak valid`);
      [...invalid.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([signature, count]) => {
          console.log(`            - ${count} nilai berbentuk ${signature}`);
        });
    }
  });
  console.log('');
  // otherwise every downstream index maps to the wrong field.
  console.log('--- Pemeriksaan Keselarasan Kolom ---');
  const lengthCounts = new Map();
  dataRows.forEach((row) => {
    lengthCounts.set(row.length, (lengthCounts.get(row.length) || 0) + 1);
  });
  console.log(`  Panjang baris header : ${header.length} kolom`);
  [...lengthCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([len, count]) => {
      console.log(`  Panjang baris data   : ${len} kolom -> ${count} baris`);
    });

  const sampleRow = dataRows.find((row) => row.length === header.length) || dataRows[0];
  console.log('  Perbandingan header vs data (indeks 18-33):');
  for (let idx = 18; idx < Math.max(header.length, 34); idx++) {
    const head = header[idx] ?? '(tidak ada)'; 
    const val = (sampleRow[idx] ?? '').slice(0, 28) || '(kosong)';
    console.log(`    [${String(idx).padStart(2, '0')}] header="${head}" | data="${val}"`);
  }
  console.log('');

  // No RM shape analysis (no identifiers printed, only lengths and patterns).
  console.log('--- Bentuk Nomor RM ---');
  const rmLengths = new Map();
  let numericOnly = 0;
  let withDash = 0;
  uniqueRm.forEach((_rowIdx, rm) => {
    rmLengths.set(rm.length, (rmLengths.get(rm.length) || 0) + 1);
    if (/^[0-9]+$/.test(rm)) numericOnly += 1;
    if (rm.includes('-')) withDash += 1;
  });
  console.log(`  Nomor RM unik            : ${uniqueRm.size}`);
  console.log(`  Hanya angka (tanpa tanda) : ${numericOnly}`);
  console.log(`  Mengandung tanda hubung   : ${withDash}`);
  [...rmLengths.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([len, count]) => {
      console.log(`  Panjang ${len} karakter -> ${count} nomor RM`);
    });
  console.log('');
}

const raw = fs.readFileSync(CSV_PATH, 'utf-8');
audit(raw);
