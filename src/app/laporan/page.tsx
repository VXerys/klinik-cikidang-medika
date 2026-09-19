'use client';

import React from 'react';
import { FileSpreadsheet, Download, Filter, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LaporanPage() {
  const handleExportExcel = () => {
    // Generate dummy sheet data from clinic records
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['LAPORAN REKAPITULASI KUNJUNGAN & KEUANGAN KLINIK CIKIDANG MEDIKA'],
      ['Tanggal Unduh:', new Date().toLocaleDateString('id-ID')],
      [],
      ['No RM', 'Nama Pasien', 'Jenis Kelamin', 'Desa', 'Tanggal Periksa', 'Dokter', 'Diagnosa ICD-10', 'Jenis Pasien', 'Biaya'],
      ['021303596', 'An. Agaisha Pinka', 'Perempuan', 'Luar Daerah', '18-09-2026', 'dr. Ovan', 'J00 - Common cold', 'UMUM', 150000],
      ['010101231', 'Tn. Umar', 'Laki-laki', 'Cikidang', '18-09-2026', 'dr. Ovan', 'J00 - Common cold', 'UMUM', 200000],
      ['010400529', 'An. Faizan', 'Laki-laki', 'Cijambe', '18-09-2026', 'dr. Ovan', 'A09 - Gastroenteritis', 'UMUM', 120000],
      ['010400093', 'Tn. Aziz Supriatman', 'Laki-laki', 'Cijambe', '18-09-2026', 'dr. Ovan', 'K35 - Appendicitis', 'BPJS', 0],
      ['020102094', 'Ny. Lilis Lisnawati', 'Perempuan', 'Cikidang', '18-09-2026', 'dr. Ovan', 'R20 - Kebas', 'BPJS', 0],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kunjungan');
    XLSX.writeFile(wb, 'Laporan_Klinik_Cikidang_Medika.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan & Ekspor Excel</h1>
          <p className="text-xs text-slate-500 mt-1">Unduh laporan rekapitulasi data kunjungan dan pembukuan keuangan klinik</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          Unduh File Excel (.xlsx)
        </button>
      </div>

      {/* Filter Tanggal */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Periode Laporan:</span>
        </div>
        <input type="date" defaultValue="2026-09-01" className="p-2 border border-slate-300 rounded-lg outline-none" />
        <span>s/d</span>
        <input type="date" defaultValue="2026-09-30" className="p-2 border border-slate-300 rounded-lg outline-none" />
        <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold">
          <Filter className="w-3.5 h-3.5" />
          Terapkan Filter
        </button>
      </div>

      {/* Kartu Informasi Ekspor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Format Laporan Siap Pakai</h2>
            <p className="text-xs text-slate-500">File Excel yang diunduh langsung diformat rapi dengan kolom identitas pasien, diagnosa medis, dan nominal pembayaran kasir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
