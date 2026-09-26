/**
 * Canonical Clinic Constants & Configuration
 * Klinik Pratama Cikidang Medika
 */

export const CLINIC_PROFILE = {
  name: 'Klinik Pratama Cikidang Medika',
  shortName: 'Klinik Cikidang Medika',
  tagline: 'Layanan Kesehatan Terpadu Masyarakat Cikidang',
  address: 'Jl. Raya Cikidang KM. 01, Kec. Cikidang, Kab. Sukabumi, Jawa Barat 43367',
  phone: '0857-2090-0012',
  email: 'klinik.cikidangmedika@gmail.com',
  license: '503/012/K-PRATAMA/DPMPTSP/2024',
  faskesCode: '0122B004',
} as const;

export const DESA_OPTIONS = [
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
] as const;

export type DesaOption = typeof DESA_OPTIONS[number];

export const GELAR_OPTIONS = ['Tn.', 'Ny.', 'Nn.', 'An.', 'By.'] as const;
export type GelarOption = typeof GELAR_OPTIONS[number];

export const JENIS_KELAMIN_OPTIONS = ['Laki-laki', 'Perempuan'] as const;
export type JenisKelaminOption = typeof JENIS_KELAMIN_OPTIONS[number];

export const JENIS_KELAMIN_RM_CODE: Record<JenisKelaminOption, string> = {
  'Laki-laki': '01',
  Perempuan: '02',
} as const;

export const DESA_RM_CODE: Record<string, string> = {
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
  // Legacy alias compatibility
  Tamansari: '10',
  Gunungmalang: '11',
  Bumiasih: '09',
  Nangerang: '05',
} as const;

export const JENIS_PASIEN_OPTIONS = ['BPJS', 'UMUM'] as const;
export type JenisPasienOption = typeof JENIS_PASIEN_OPTIONS[number];

export const METODE_PEMBAYARAN_OPTIONS = ['Tunai', 'TF'] as const;
export type MetodePembayaranOption = typeof METODE_PEMBAYARAN_OPTIONS[number];

export const DEFAULT_TARIFFS = {
  umum: 150000,
  bpjs: 0,
} as const;

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const CASH_FLOW_CATEGORIES = {
  masuk: [
    'Kapitasi BPJS',
    'Setor Tunai',
    'Pendapatan Lain',
    'Rujukan USG / Lab',
  ],
  keluar: [
    'Pengeluaran Obat / Operasional',
    'Pengeluaran Non Klinik',
    'Operasional & Listrik/Air',
    'Honor & Transport',
    'Perlengkapan Medis',
    'Setor ke Rekening Pemilik',
  ],
} as const;

export type CashFlowCategoryMasuk = typeof CASH_FLOW_CATEGORIES.masuk[number];
export type CashFlowCategoryKeluar = typeof CASH_FLOW_CATEGORIES.keluar[number];
export type CashFlowCategory = CashFlowCategoryMasuk | CashFlowCategoryKeluar;

export const REFERRAL_SERVICE_OPTIONS = [
  { id: 'infus', label: 'Infus' },
  { id: 'usg', label: 'USG' },
  { id: 'lab', label: 'Cek Lab' },
] as const;
