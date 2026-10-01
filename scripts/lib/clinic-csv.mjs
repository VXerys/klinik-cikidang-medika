/**
 * Shared parsing and identity helpers for the clinic Sheets exports.
 *
 * The Sheets export left medical record numbers in several shapes because the
 * spreadsheet stored them as numbers: "20200002", "020200002", and "0102939" all
 * describe the same kind of value. Two helpers exist because the two jobs differ:
 *
 *   rmKey()       groups values that differ only by leading zeros. Safe to merge on.
 *   canonicalRm() produces the stored 9-digit form, or null when padding would guess.
 *
 * Patient identifiers are never printed by these helpers; they return values only.
 */

import fs from 'fs';
import path from 'path';

export const DATA_DIR = path.resolve(process.cwd(), 'docs/data');

export const FILES = {
  rekam: '[DATA] Klinik Cikidang Medika  - REKAMMEDIS.csv',
  utama: 'DASHBOARD - DATAUTAMA.csv',
  datapasien: '[DATA] Klinik Cikidang Medika  - DATAPASIEN .csv',
  sunat: '[DATA] Klinik Cikidang Medika  - SUNAT .csv',
  tripleEliminasi: 'LAPORAN DPP DR. ADE SOFYAN - TRIPLE ELIMINASI.csv',
  hbSAg: '[DATA] Klinik Cikidang Medika  - DATA H_S_HbSAg.csv',
  dppPtm: 'LAPORAN DPP DR. ADE SOFYAN - PTM.csv',
  dppKb: 'LAPORAN DPP DR. ADE SOFYAN - KB.csv',
  dppUsg: 'LAPORAN DPP DR. ADE SOFYAN - USG.csv',
  dataUsg: '[DATA] Klinik Cikidang Medika  - USG.csv',
  dashboardQuery: 'DASHBOARD - QUERY.csv',
  dppQuery: 'LAPORAN DPP DR. ADE SOFYAN - QUERY.csv',
  pendataanUsg: '[DATA] Klinik Cikidang Medika  - pendataan USG.csv',
};

// Column indexes of the canonical visit log. The export has an unnamed first
// column, so every later index is offset by one.
export const VISIT_COLUMNS = {
  noRm: 1,
  gelar: 2,
  nama: 3,
  jenisKelamin: 4,
  tanggalLahir: 5,
  usia: 6,
  desa: 7,
  alamat: 8,
  ktp: 9,
  bpjs: 10,
  tanggalPeriksa: 11,
  jam: 12,
  bulan: 13,
  kodeIcd10: 14,
  petugas: 15,
  anamnesa: 16,
  diagnosa: 17,
  terapi: 18,
  monitor: 19,
  lab: 20,
  labHasil: 21,
  penjamin: 22,
  tarif: 23,
  tindakan: 24,
  keteranganTindakan: 25,
  pendapatanLain: 26,
  keteranganPendapatan: 27,
  pengeluaranKlinik: 28,
  pengeluaranNonKlinik: 29,
  keteranganPengeluaran: 30,
  setorTunai: 31,
  jenisPembayaran: 32,
};

export const PATIENT_COLUMNS_DATAPASIEN = {
  noUrut: 0,
  rmDesa: 2,
  noRm: 3,
  gelar: 4,
  nama: 5,
  jenisKelamin: 6,
  tanggalLahir: 7,
  usia: 8,
  desa: 9,
  alamat: 10,
  ktp: 11,
  bpjs: 12,
  telepon: 13,
  asuransi: 14,
  statusPernikahan: 15,
  pekerjaan: 16,
  alergiObat: 17,
};

// The MONITOR column is the clinic's own program tag. Unknown values are reported,
// never guessed into a program.
export const MONITOR_TO_PROGRAM = {
  ANC: 'ANC',
  PTM: 'PTM',
  KB: 'KB',
  '3 ELIMINASI': 'ELIMINASI_3',
};

export function parseCSVLine(line) {
  const row = [];
  let inQuotes = false;
  let current = '';
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else current += char;
  }
  row.push(current.trim());
  return row;
}

export function readCsv(fileName) {
  const raw = fs.readFileSync(path.join(DATA_DIR, fileName), 'utf-8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return { header: parseCSVLine(lines[0]), rows: lines.slice(1).map(parseCSVLine) };
}

export function csvExists(fileName) {
  return fs.existsSync(path.join(DATA_DIR, fileName));
}

export function allCsvFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.toLowerCase().endsWith('.csv'))
    .sort();
}

export const blank = (value) => value === undefined || value === null || String(value).trim() === '';

export const digitsOnly = (value) => (value || '').replace(/[^0-9]/g, '');

/**
 * Grouping key: digits with leading zeros removed. Two values with the same key can
 * only differ by leading zeros, so merging them cannot combine two different people.
 */
export const rmKey = (value) => digitsOnly(value).replace(/^0+/, '');

/**
 * Stored form: the 9-digit zero-padded value. Returns null for anything that is not
 * 8 or 9 digits, because padding a 10-digit or non-numeric value would be a guess.
 */
export function canonicalRm(value) {
  const digits = digitsOnly(value);
  if (/^\d{8}$/.test(digits)) return `0${digits}`;
  if (/^\d{9}$/.test(digits)) return digits;
  return null;
}

// Exports disagree on date format ("5-1-2026" vs "2026-01-05"), so normalise to
// YYYY-MM-DD before comparing.
export function normalizeDate(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(raw);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  return raw;
}

export function normalizeTime(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  const match = /^(\d{1,2})[:.](\d{2})(?::(\d{2}))?/.exec(raw);
  if (!match) return null;
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;
}

export function visitKey(noRm, tanggalPeriksa, kodeIcd10) {
  return [rmKey(noRm), normalizeDate(tanggalPeriksa), (kodeIcd10 || '').trim().toUpperCase()].join('|');
}

export function visitKeyOf(row) {
  return visitKey(
    row[VISIT_COLUMNS.noRm],
    row[VISIT_COLUMNS.tanggalPeriksa],
    row[VISIT_COLUMNS.kodeIcd10]
  );
}

// Some exports put an ordinal column first and some do not. Pick the column that
// holds the most 5 to 11 digit values.
export function detectNoRmColumn(rows) {
  let best = { index: 0, score: -1 };
  [0, 1, 2].forEach((index) => {
    const score = rows
      .slice(0, 300)
      .filter((row) => /^\d{5,11}$/.test((row[index] || '').trim())).length;
    if (score > best.score) best = { index, score };
  });
  return best.index;
}

/**
 * A referral source is recorded as "Bdn.<name>" in the action note. "Admin/Bdn.Resa"
 * names internal staff and must never be read as a referral source.
 */
export function extractBidan(keteranganTindakan) {
  const raw = (keteranganTindakan || '').trim();
  const match = /^(bdn\.[a-z]+)$/i.exec(raw);
  return match ? match[1] : null;
}

export function fillRate(rows, index) {
  if (rows.length === 0) return 0;
  return rows.filter((row) => !blank(row[index])).length / rows.length;
}

export function keyStats(rows, index) {
  const seen = new Set();
  let duplicates = 0;
  rows.forEach((row) => {
    const value = (row[index] || '').trim();
    if (!value) return;
    if (seen.has(value)) duplicates += 1;
    else seen.add(value);
  });
  return { unique: seen.size, duplicates };
}

export function frequency(rows, index, limit = 25) {
  const counts = new Map();
  rows.forEach((row) => {
    const value = (row[index] || '').trim();
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export const rule = (char = '=') => char.repeat(78);
