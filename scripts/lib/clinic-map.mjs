/**
 * Field-level transforms shared by the clinic data scripts.
 *
 * These mirror the mapping the F-005 migration used, so rows written by the
 * reconciliation script are shaped identically to rows already in the database.
 */

import { VISIT_COLUMNS } from './clinic-csv.mjs';

export const CANONICAL_DESA = [
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

const desaLookup = new Map(CANONICAL_DESA.map((name) => [name.toLowerCase().replace(/\s+/g, ' '), name]));

// Village codes used by the F-008 medical record number pattern (NN-NN-NNNNNN).
// Kept in step with DESA_RM_CODE in src/constants/clinic.ts.
export const DESA_RM_CODE = {
  Cikidang: '01',
  Pangkalan: '02',
  Cicareuh: '03',
  Cijambe: '04',
  'Mekar Nangka': '05',
  Cikiray: '06',
  Sampora: '07',
  'Nangka Koneng': '08',
  Bumisari: '09',
  'Taman Sari': '10',
  'Gunung Malang': '11',
  'Cikaray Toyibah': '12',
  'Luar Daerah': '13',
};

// Spellings that appear in the register sheets for a village in the canonical list.
const DESA_ALIAS = {
  pngkalan: 'Pangkalan',
  pangkalan: 'Pangkalan',
  cikidang: 'Cikidang',
  cicareuh: 'Cicareuh',
  cijambe: 'Cijambe',
};

// The clinic only serves the villages above; anything else is recorded as outside area,
// which is what "Luar Daerah" means and is already the code used by the migration.
export function desaRmCode(desaName) {
  const raw = (desaName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const canonical = DESA_ALIAS[raw] || desaLookup.get(raw);
  return DESA_RM_CODE[canonical] || DESA_RM_CODE['Luar Daerah'];
}

export function genderRmCode(jenisKelamin) {
  return jenisKelamin === 'Perempuan' ? '02' : '01';
}

export function formatRm(jkCode, desaCode, sequence) {
  return `${jkCode}-${desaCode}-${String(sequence).padStart(6, '0')}`;
}

// Village names in the Sheets export drifted ("Pngkalan", "Pelabuhan ratu", "Gunungmalang"),
// so an unrecognized name is kept as-is rather than silently reassigned to a canon.
export function normalizeDesa(value) {
  const raw = (value || '').trim();
  if (!raw) return { value: 'Luar Daerah', changed: false };
  const canonical = desaLookup.get(raw.toLowerCase().replace(/\s+/g, ' '));
  if (canonical) return { value: canonical, changed: canonical !== raw };
  return { value: raw, changed: false, unknown: true };
}

// Returns null instead of a guessed date. The caller decides whether to skip the row.
export function parseDate(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  const parts = raw.replace(/\//g, '-').split('-');
  if (parts.length !== 3) return null;

  const [first, second, third] = parts;
  let day;
  let month;
  let year;
  if (first.length === 4) {
    year = Number.parseInt(first, 10);
    month = Number.parseInt(second, 10);
    day = Number.parseInt(third, 10);
  } else {
    day = Number.parseInt(first, 10);
    month = Number.parseInt(second, 10);
    year = Number.parseInt(third, 10);
  }

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  if (year < 100) year += 2000;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseTime(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  const match = /^(\d{1,2})[:.](\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!match) return null;
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Age is a human age only. A four-digit value is a year, not an age.
export function parseAge(value) {
  const raw = (value || '').trim();
  if (!/^\d{1,3}$/.test(raw)) return null;
  const age = Number.parseInt(raw, 10);
  return age >= 0 && age <= 130 ? age : null;
}

export function parseRupiah(value) {
  if (!value) return 0;
  const digits = String(value).replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Over-length values are dropped rather than truncated, because a truncated
// identifier is worse than a missing one.
export function limit(value, max, onViolation) {
  const trimmed = (value || '').trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  onViolation?.(trimmed.length, max);
  return null;
}

export function resolveDoctorId(officerName, doctorIdByName) {
  const name = (officerName || '').toLowerCase().trim();
  if (name.includes('ovan')) return doctorIdByName.get('dr. ovan') ?? null;
  if (name.includes('neneng')) return doctorIdByName.get('dr. neneng') ?? null;
  if (name.includes('resa') || name.includes('admin') || name.includes('bidan')) {
    return doctorIdByName.get('admin/bdn.resa') ?? null;
  }
  return null;
}

export function patientFromVisitRow(row, report) {
  const desaResult = normalizeDesa(row[VISIT_COLUMNS.desa]);
  if (desaResult.changed) report.desaNormalized += 1;
  if (desaResult.unknown) {
    report.unknownDesa.set(desaResult.value, (report.unknownDesa.get(desaResult.value) || 0) + 1);
  }

  return {
    gelar: limit(row[VISIT_COLUMNS.gelar], 10) || 'Tn',
    nama: limit(row[VISIT_COLUMNS.nama], 150) || 'Tanpa Nama',
    jenis_kelamin: limit(row[VISIT_COLUMNS.jenisKelamin], 20) || 'Laki-laki',
    tanggal_lahir: limit(row[VISIT_COLUMNS.tanggalLahir], 20),
    usia: parseAge(row[VISIT_COLUMNS.usia]),
    desa: desaResult.value,
    alamat: (row[VISIT_COLUMNS.alamat] || '').trim() || null,
    no_ktp: limit(row[VISIT_COLUMNS.ktp], 30),
    no_bpjs: limit(row[VISIT_COLUMNS.bpjs], 30),
  };
}

export function visitFromRow(row, { rowIndex, doctorIdByName, report }) {
  const tanggalPeriksa = parseDate(row[VISIT_COLUMNS.tanggalPeriksa]);
  if (!tanggalPeriksa) {
    report.invalidDate.push(rowIndex + 2);
    return null;
  }

  const jamPeriksa = parseTime(row[VISIT_COLUMNS.jam]);
  if (!jamPeriksa && (row[VISIT_COLUMNS.jam] || '').trim()) report.invalidTime += 1;

  return {
    tanggal_periksa: tanggalPeriksa,
    jam_periksa: jamPeriksa,
    nomor_antrian: String(rowIndex + 1),
    dokter_id: resolveDoctorId(row[VISIT_COLUMNS.petugas], doctorIdByName),
    bulan: limit(row[VISIT_COLUMNS.bulan], 30),
    kode_icd10: limit(row[VISIT_COLUMNS.kodeIcd10], 20),
    diagnosa_deskripsi: (row[VISIT_COLUMNS.diagnosa] || '').trim() || null,
    keluhan_anamnesa: (row[VISIT_COLUMNS.anamnesa] || '').trim() || null,
    terapi_obat: (row[VISIT_COLUMNS.terapi] || '').trim() || null,
    tindakan: limit(row[VISIT_COLUMNS.tindakan], 100),
    keterangan_tindakan: (row[VISIT_COLUMNS.keteranganTindakan] || '').trim() || null,
    lab: limit(row[VISIT_COLUMNS.lab], 100),
    lab_hasil: limit(row[VISIT_COLUMNS.labHasil], 50),
    jenis_pasien: (row[VISIT_COLUMNS.penjamin] || '').toUpperCase().includes('BPJS') ? 'BPJS' : 'UMUM',
    biaya_periksa: parseRupiah(row[VISIT_COLUMNS.tarif]),
    pendapatan_lain: parseRupiah(row[VISIT_COLUMNS.pendapatanLain]),
    keterangan_pendapatan: (row[VISIT_COLUMNS.keteranganPendapatan] || '').trim() || null,
    jenis_pembayaran: (row[VISIT_COLUMNS.jenisPembayaran] || '').toUpperCase().includes('TF') ? 'TF' : 'Tunai',
    status_pembayaran: 'Lunas',
    payment_state: 'Lunas',
  };
}

export function cashFlowsFromRow(row, tanggalPeriksa) {
  const flows = [];
  const note = (row[VISIT_COLUMNS.keteranganPengeluaran] || '').trim();
  const clinicExpense = parseRupiah(row[VISIT_COLUMNS.pengeluaranKlinik]);
  const nonClinicExpense = parseRupiah(row[VISIT_COLUMNS.pengeluaranNonKlinik]);
  const deposit = parseRupiah(row[VISIT_COLUMNS.setorTunai]);

  if (clinicExpense > 0) {
    flows.push({
      tanggal: tanggalPeriksa,
      jenis: 'Keluar',
      kategori: 'Pengeluaran Obat / Operasional',
      nominal: clinicExpense,
      keterangan: note || 'Pengeluaran Klinik',
    });
  }
  if (nonClinicExpense > 0) {
    flows.push({
      tanggal: tanggalPeriksa,
      jenis: 'Keluar',
      kategori: 'Pengeluaran Non Klinik',
      nominal: nonClinicExpense,
      keterangan: note || 'Pengeluaran Non Klinik',
    });
  }
  if (deposit > 0) {
    flows.push({
      tanggal: tanggalPeriksa,
      jenis: 'Masuk',
      kategori: 'Setor Tunai',
      nominal: deposit,
      keterangan: 'Setoran Kasir ke Bank',
    });
  }
  return flows;
}
