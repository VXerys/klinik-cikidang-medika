'use client';

import React from 'react';
import { FileSpreadsheet, Download, Filter, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LaporanPage() {
  const previewRows = [
    { rm: '021303596', nama: 'An. Agaisha Pinka', jk: 'Perempuan', desa: 'Luar Daerah', tgl: '18-09-2026', dokter: 'dr. Ovan', icd: 'J00 - Common cold', tipe: 'UMUM', biaya: 150000 },
    { rm: '010101231', nama: 'Tn. Umar', jk: 'Laki-laki', desa: 'Cikidang', tgl: '18-09-2026', dokter: 'dr. Ovan', icd: 'J00 - Common cold', tipe: 'UMUM', biaya: 200000 },
    { rm: '010400529', nama: 'An. Faizan', jk: 'Laki-laki', desa: 'Cijambe', tgl: '18-09-2026', dokter: 'dr. Ovan', icd: 'A09 - Gastroenteritis', tipe: 'UMUM', biaya: 120000 },
    { rm: '010400093', nama: 'Tn. Aziz Supriatman', jk: 'Laki-laki', desa: 'Cijambe', tgl: '18-09-2026', dokter: 'dr. Ovan', icd: 'K35 - Appendicitis', tipe: 'BPJS', biaya: 0 },
    { rm: '020102094', nama: 'Ny. Lilis Lisnawati', jk: 'Perempuan', desa: 'Cikidang', tgl: '18-09-2026', dokter: 'dr. Ovan', icd: 'R20 - Kebas', tipe: 'BPJS', biaya: 0 },
  ];

  const handleExportExcel = () => {
    // Generate sheet data from clinic records
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['LAPORAN REKAPITULASI KUNJUNGAN & KEUANGAN KLINIK CIKIDANG MEDIKA'],
      ['Tanggal Unduh:', new Date().toLocaleDateString('id-ID')],
      [],
      ['No RM', 'Nama Pasien', 'Jenis Kelamin', 'Desa', 'Tanggal Periksa', 'Dokter', 'Diagnosa ICD-10', 'Jenis Pasien', 'Biaya'],
      ...previewRows.map((r) => [r.rm, r.nama, r.jk, r.desa, r.tgl, r.dokter, r.icd, r.tipe, r.biaya]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kunjungan');
    XLSX.writeFile(wb, 'Laporan_Klinik_Cikidang_Medika.xlsx');
  };

  return (
    <div className="space-y-6 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Laporan & Ekspor Excel</h1>
          <p className="text-xs text-slate-500 mt-1">Unduh laporan rekapitulasi data kunjungan dan pembukuan keuangan klinik</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Unduh File Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter Tanggal */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Periode Laporan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input type="date" defaultValue="2026-09-01" className="p-2 min-h-[44px] border border-slate-300 rounded-xl outline-none text-xs flex-1 sm:flex-initial" />
          <span className="text-slate-500">s/d</span>
          <input type="date" defaultValue="2026-09-30" className="p-2 min-h-[44px] border border-slate-300 rounded-xl outline-none text-xs flex-1 sm:flex-initial" />
        </div>
        <button className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl font-semibold w-full sm:w-auto transition">
          <Filter className="w-3.5 h-3.5 shrink-0" />
          <span>Terapkan Filter</span>
        </button>
      </div>

      {/* Kartu Informasi Ekspor */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Format Laporan Siap Pakai</h2>
            <p className="text-xs text-slate-500">File Excel yang diunduh langsung diformat rapi dengan kolom identitas pasien, diagnosa medis, dan nominal pembayaran kasir.</p>
          </div>
        </div>

        {/* Preview Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Pratinjau Data Rekapitulasi (5 Data Teratas)
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 select-none whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3">No RM</th>
                  <th className="py-2.5 px-3">Nama Pasien</th>
                  <th className="py-2.5 px-3">Jenis Kelamin</th>
                  <th className="py-2.5 px-3">Desa</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Dokter</th>
                  <th className="py-2.5 px-3">Diagnosa ICD-10</th>
                  <th className="py-2.5 px-3">Jenis Pasien</th>
                  <th className="py-2.5 px-3 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {previewRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{r.rm}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{r.nama}</td>
                    <td className="py-2.5 px-3">{r.jk}</td>
                    <td className="py-2.5 px-3">{r.desa}</td>
                    <td className="py-2.5 px-3">{r.tgl}</td>
                    <td className="py-2.5 px-3">{r.dokter}</td>
                    <td className="py-2.5 px-3 font-medium">{r.icd}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        r.tipe === 'BPJS' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {r.tipe}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {r.biaya === 0 ? 'Rp 0 (BPJS)' : `Rp ${r.biaya.toLocaleString('id-ID')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
