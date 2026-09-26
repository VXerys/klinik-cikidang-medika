import * as XLSX from 'xlsx';

export interface VisitExportRow {
  no_rm: string;
  nama_pasien: string;
  jenis_kelamin: string;
  desa: string;
  tanggal_periksa: string;
  nama_dokter: string;
  kode_icd10: string;
  diagnosa_deskripsi: string;
  jenis_pasien: string;
  biaya_periksa: number;
  pendapatan_lain: number;
  total_biaya: number;
  jenis_pembayaran: string;
}

export interface CashFlowExportRow {
  tanggal: string;
  jenis: string;
  kategori: string;
  nominal: number;
  keterangan: string;
}

export interface MorbidityExportRow {
  rank: number;
  kode_icd10: string;
  diagnosa_deskripsi: string;
  jumlah_kasus: number;
  persentase: number;
}

interface DateRange {
  start?: string;
  end?: string;
}

function calculateColumnWidths(data: (string | number)[][]): { wch: number }[] {
  const colWidths: { wch: number }[] = [];
  data.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const cellLen = cell !== undefined && cell !== null ? String(cell).length : 10;
      if (!colWidths[colIdx] || cellLen > colWidths[colIdx].wch) {
        colWidths[colIdx] = { wch: Math.min(Math.max(cellLen + 3, 12), 48) };
      }
    });
  });
  return colWidths;
}

function createMetadataHeader(title: string, dateRange?: DateRange): (string | number)[][] {
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const periodStr =
    dateRange?.start && dateRange?.end
      ? `${dateRange.start} s/d ${dateRange.end}`
      : 'Semua Data Terdaftar';

  return [
    ['KLINIK PRATAMA CIKIDANG MEDIKA'],
    [title],
    [`Periode: ${periodStr} | Tanggal Unduh: ${todayFormatted}`],
    [],
  ];
}

export function exportVisitsToExcel(visits: VisitExportRow[], dateRange?: DateRange) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'No RM',
    'Nama Pasien',
    'L/P',
    'Desa / Wilayah',
    'Tanggal Periksa',
    'Dokter Pemeriksa',
    'Kode ICD-10',
    'Diagnosa Medis',
    'Jenis Pasien',
    'Biaya Periksa (Rp)',
    'Pendapatan Lain (Rp)',
    'Total Billing (Rp)',
    'Pembayaran',
  ];

  const rows = visits.map((v) => [
    v.no_rm,
    v.nama_pasien,
    v.jenis_kelamin,
    v.desa,
    v.tanggal_periksa,
    v.nama_dokter,
    v.kode_icd10,
    v.diagnosa_deskripsi,
    v.jenis_pasien,
    v.biaya_periksa,
    v.pendapatan_lain,
    v.total_biaya,
    v.jenis_pembayaran,
  ]);

  const sheetData = [
    ...createMetadataHeader('LAPORAN REKAPITULASI KUNJUNGAN PASIEN & BILLING', dateRange),
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = calculateColumnWidths(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kunjungan');

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Kunjungan_Cikidang_${fileNameDate}.xlsx`);
}

export function exportCashFlowsToExcel(flows: CashFlowExportRow[], dateRange?: DateRange) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Tanggal Transaksi',
    'Jenis (Masuk/Keluar)',
    'Kategori Arus Kas',
    'Nominal Transaksi (Rp)',
    'Keterangan Transaksi',
  ];

  const rows = flows.map((f) => [
    f.tanggal,
    f.jenis,
    f.kategori,
    f.nominal,
    f.keterangan || '-',
  ]);

  const sheetData = [
    ...createMetadataHeader('LAPORAN MUTASI ARUS KAS & BUKU KAS OPERASIONAL', dateRange),
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = calculateColumnWidths(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas');

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Buku_Kas_Cikidang_${fileNameDate}.xlsx`);
}

export function exportMorbidityToExcel(morbidity: MorbidityExportRow[], dateRange?: DateRange) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Peringkat',
    'Kode ICD-10',
    'Nama Diagnosa / Penyakit',
    'Jumlah Kasus',
    'Persentase (%)',
  ];

  const rows = morbidity.map((m) => [
    m.rank,
    m.kode_icd10,
    m.diagnosa_deskripsi,
    m.jumlah_kasus,
    Number(m.persentase.toFixed(2)),
  ]);

  const sheetData = [
    ...createMetadataHeader('LAPORAN 10 BESAR PENYAKIT (MORBIDITAS ICD-10)', dateRange),
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = calculateColumnWidths(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, 'Morbiditas ICD-10');

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Morbiditas_ICD10_Cikidang_${fileNameDate}.xlsx`);
}

export function exportFullClinicWorkbook(params: {
  visits: VisitExportRow[];
  flows: CashFlowExportRow[];
  morbidity: MorbidityExportRow[];
  dateRange?: DateRange;
}) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Kunjungan
  const visitHeaders = [
    'No RM',
    'Nama Pasien',
    'L/P',
    'Desa / Wilayah',
    'Tanggal Periksa',
    'Dokter Pemeriksa',
    'Kode ICD-10',
    'Diagnosa Medis',
    'Jenis Pasien',
    'Biaya Periksa (Rp)',
    'Pendapatan Lain (Rp)',
    'Total Billing (Rp)',
    'Pembayaran',
  ];
  const visitRows = params.visits.map((v) => [
    v.no_rm,
    v.nama_pasien,
    v.jenis_kelamin,
    v.desa,
    v.tanggal_periksa,
    v.nama_dokter,
    v.kode_icd10,
    v.diagnosa_deskripsi,
    v.jenis_pasien,
    v.biaya_periksa,
    v.pendapatan_lain,
    v.total_biaya,
    v.jenis_pembayaran,
  ]);
  const visitSheetData = [
    ...createMetadataHeader('REKAPITULASI KUNJUNGAN PASIEN', params.dateRange),
    visitHeaders,
    ...visitRows,
  ];
  const wsVisits = XLSX.utils.aoa_to_sheet(visitSheetData);
  wsVisits['!cols'] = calculateColumnWidths(visitSheetData);
  XLSX.utils.book_append_sheet(wb, wsVisits, 'Rekap Kunjungan');

  // 2. Sheet Morbiditas ICD-10
  const morbHeaders = [
    'Peringkat',
    'Kode ICD-10',
    'Nama Diagnosa / Penyakit',
    'Jumlah Kasus',
    'Persentase (%)',
  ];
  const morbRows = params.morbidity.map((m) => [
    m.rank,
    m.kode_icd10,
    m.diagnosa_deskripsi,
    m.jumlah_kasus,
    Number(m.persentase.toFixed(2)),
  ]);
  const morbSheetData = [
    ...createMetadataHeader('10 BESAR MORBIDITAS PENYAKIT ICD-10', params.dateRange),
    morbHeaders,
    ...morbRows,
  ];
  const wsMorb = XLSX.utils.aoa_to_sheet(morbSheetData);
  wsMorb['!cols'] = calculateColumnWidths(morbSheetData);
  XLSX.utils.book_append_sheet(wb, wsMorb, 'Morbiditas ICD-10');

  // 3. Sheet Buku Kas
  const flowHeaders = [
    'Tanggal Transaksi',
    'Jenis (Masuk/Keluar)',
    'Kategori Arus Kas',
    'Nominal Transaksi (Rp)',
    'Keterangan Transaksi',
  ];
  const flowRows = params.flows.map((f) => [
    f.tanggal,
    f.jenis,
    f.kategori,
    f.nominal,
    f.keterangan || '-',
  ]);
  const flowSheetData = [
    ...createMetadataHeader('MUTASI BUKU KAS OPERASIONAL', params.dateRange),
    flowHeaders,
    ...flowRows,
  ];
  const wsFlows = XLSX.utils.aoa_to_sheet(flowSheetData);
  wsFlows['!cols'] = calculateColumnWidths(flowSheetData);
  XLSX.utils.book_append_sheet(wb, wsFlows, 'Arus Kas Operasional');

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Lengkap_Klinik_Cikidang_${fileNameDate}.xlsx`);
}

export interface PublicHealthExportRow {
  program_type: string;
  nama: string;
  jenis_kelamin: string;
  ttl: string;
  alamat: string;
  no_nik: string;
  diagnosa: string;
  lab: string;
  terapi: string;
  hbsag: string;
  jenis_kb: string;
  tanggal_kembali: string;
}

const PUBLIC_HEALTH_SHEET_CONFIG: Record<
  string,
  { sheetName: string; title: string; headers: string[] }
> = {
  PTM: {
    sheetName: 'PTM',
    title: 'LAPORAN PTM (PENYAKIT TIDAK MENULAR)',
    headers: ['Nama', 'JK', 'TTL', 'Alamat', 'No NIK', 'Diagnosa', 'Lab'],
  },
  ANC: {
    sheetName: 'ANC',
    title: 'LAPORAN ANC (ANTENATAL CARE)',
    headers: ['Nama', 'JK', 'TTL', 'Alamat', 'No NIK', 'Diagnosa', 'Terapi', 'HbSAg'],
  },
  KB: {
    sheetName: 'KB',
    title: 'LAPORAN KB (KELUARGA BERENCANA)',
    headers: ['Nama', 'TTL', 'Alamat', 'No NIK', 'Jenis KB', 'Tanggal Kembali'],
  },
  ELIMINASI_3: {
    sheetName: '3 Eliminasi',
    title: 'LAPORAN 3 ELIMINASI',
    headers: ['Nama', 'JK', 'TTL', 'Alamat', 'No NIK', 'Diagnosa', 'Lab'],
  },
};

function buildPublicHealthRow(row: PublicHealthExportRow, program: string): (string | number)[] {
  if (program === 'KB') {
    return [row.nama, row.ttl, row.alamat, row.no_nik, row.jenis_kb, row.tanggal_kembali];
  }
  if (program === 'ANC') {
    return [
      row.nama,
      row.jenis_kelamin,
      row.ttl,
      row.alamat,
      row.no_nik,
      row.diagnosa,
      row.terapi,
      row.hbsag,
    ];
  }
  return [row.nama, row.jenis_kelamin, row.ttl, row.alamat, row.no_nik, row.diagnosa, row.lab];
}

export function exportPublicHealthToExcel(
  records: PublicHealthExportRow[],
  dateRange?: DateRange
) {
  const wb = XLSX.utils.book_new();

  Object.entries(PUBLIC_HEALTH_SHEET_CONFIG).forEach(([program, config]) => {
    const rows = records.filter((r) => r.program_type === program);
    if (rows.length === 0) return;

    const sheetData = [
      ...createMetadataHeader(config.title, dateRange),
      config.headers,
      ...rows.map((row) => buildPublicHealthRow(row, program)),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = calculateColumnWidths(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
  });

  if (wb.SheetNames.length === 0) {
    const sheetData = [
      ...createMetadataHeader('LAPORAN PROGRAM KESEHATAN', dateRange),
      ['Belum ada data program kesehatan pada periode ini'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = calculateColumnWidths(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Program Kesehatan');
  }

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Program_Kesehatan_Cikidang_${fileNameDate}.xlsx`);
}

export interface ReferralCommissionExportRow {
  tanggal: string;
  sumber_rujukan: string;
  nama_pasien: string;
  jenis_layanan: string;
  nominal_komisi: number;
  status_pembayaran: string;
  catatan: string;
}

export function exportReferralCommissionsToExcel(
  rows: ReferralCommissionExportRow[],
  year: number
) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Tanggal',
    'Sumber Rujukan (Bidan)',
    'Nama Pasien',
    'Jenis Layanan',
    'Nominal Komisi (Rp)',
    'Status Pembayaran',
    'Catatan',
  ];

  const dataRows = rows.map((r) => [
    r.tanggal,
    r.sumber_rujukan,
    r.nama_pasien,
    r.jenis_layanan,
    r.nominal_komisi,
    r.status_pembayaran,
    r.catatan || '-',
  ]);

  const totalKomisi = rows.reduce((sum, r) => sum + (r.nominal_komisi || 0), 0);

  const sheetData = [
    ...createMetadataHeader(
      `LAPORAN RUJUKAN & KOMISI BIDAN TAHUN ${year}`,
      { start: `${year}-01-01`, end: `${year}-12-31` }
    ),
    headers,
    ...dataRows,
    [],
    ['TOTAL KOMISI', '', '', '', totalKomisi, '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = calculateColumnWidths(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, `Komisi ${year}`);

  const fileNameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `Laporan_Komisi_Rujukan_Cikidang_${year}_${fileNameDate}.xlsx`);
}
