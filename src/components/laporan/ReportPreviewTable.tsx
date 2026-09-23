'use client';

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  FileText,
  WarningCircle,
} from '@phosphor-icons/react';
import { formatRupiah } from '@/lib/utils';
import type {
  VisitExportRow,
  CashFlowExportRow,
  MorbidityExportRow,
} from '@/lib/excel';
import type { ReportTabType } from './ReportTabs';

interface ReportPreviewTableProps {
  activeTab: ReportTabType;
  visitsData: VisitExportRow[];
  morbidityData: MorbidityExportRow[];
  cashFlowData: CashFlowExportRow[];
  isLoading?: boolean;
}

export function ReportPreviewTable({
  activeTab,
  visitsData,
  morbidityData,
  cashFlowData,
  isLoading,
}: ReportPreviewTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (activeTab === 'kunjungan') {
      if (!q) return visitsData;
      return visitsData.filter(
        (v) =>
          v.nama_pasien.toLowerCase().includes(q) ||
          v.no_rm.toLowerCase().includes(q) ||
          v.desa.toLowerCase().includes(q) ||
          v.kode_icd10.toLowerCase().includes(q) ||
          v.diagnosa_deskripsi.toLowerCase().includes(q) ||
          v.nama_dokter.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'morbiditas') {
      if (!q) return morbidityData;
      return morbidityData.filter(
        (m) =>
          m.kode_icd10.toLowerCase().includes(q) ||
          m.diagnosa_deskripsi.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'buku_kas') {
      if (!q) return cashFlowData;
      return cashFlowData.filter(
        (c) =>
          c.kategori.toLowerCase().includes(q) ||
          c.keterangan.toLowerCase().includes(q) ||
          c.jenis.toLowerCase().includes(q)
      );
    }

    return [];
  }, [activeTab, visitsData, morbidityData, cashFlowData, searchQuery]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageRows = filteredData.slice(startIndex, startIndex + pageSize);

  const visitsSummary = useMemo(() => {
    let totalBiaya = 0;
    let umumCount = 0;
    let bpjsCount = 0;

    visitsData.forEach((v) => {
      totalBiaya += v.total_biaya || 0;
      if (v.jenis_pasien === 'BPJS') bpjsCount++;
      else umumCount++;
    });

    return { totalBiaya, umumCount, bpjsCount };
  }, [visitsData]);

  const cashFlowSummary = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;

    cashFlowData.forEach((c) => {
      if (c.jenis === 'Masuk') totalMasuk += c.nominal || 0;
      if (c.jenis === 'Keluar') totalKeluar += c.nominal || 0;
    });

    return { totalMasuk, totalKeluar, net: totalMasuk - totalKeluar };
  }, [cashFlowData]);

  const morbiditySummary = useMemo(() => {
    let totalCases = 0;
    morbidityData.forEach((m) => {
      totalCases += m.jumlah_kasus || 0;
    });
    return { totalCases };
  }, [morbidityData]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="h-6 w-56 bg-slate-200 rounded"></div>
        <div className="h-10 bg-slate-100 rounded-xl"></div>
        <div className="space-y-2 pt-2">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-10 bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass
            weight="duotone"
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari data pada tabel..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 min-h-[44px] text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus-visible:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
          <span>Tampilkan per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs font-semibold focus-visible:outline-none"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        {pageRows.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <WarningCircle weight="duotone" className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada data ditemukan</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cobalah mengatur ulang parameter filter tanggal atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            {activeTab === 'kunjungan' && (
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-3">No RM</th>
                  <th className="py-3.5 px-3">Nama Pasien</th>
                  <th className="py-3.5 px-3">L/P</th>
                  <th className="py-3.5 px-3">Desa</th>
                  <th className="py-3.5 px-3">Tanggal</th>
                  <th className="py-3.5 px-3">Dokter</th>
                  <th className="py-3.5 px-3">Diagnosa ICD-10</th>
                  <th className="py-3.5 px-3">Jenis Pasien</th>
                  <th className="py-3.5 px-3 text-right">Biaya Kasir</th>
                </tr>
              </thead>
            )}

            {activeTab === 'morbiditas' && (
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-3 w-16 text-center">Peringkat</th>
                  <th className="py-3.5 px-3">Kode ICD-10</th>
                  <th className="py-3.5 px-3">Nama Diagnosa Medis</th>
                  <th className="py-3.5 px-3 text-right">Jumlah Kasus</th>
                  <th className="py-3.5 px-3 text-right">Persentase</th>
                </tr>
              </thead>
            )}

            {activeTab === 'buku_kas' && (
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-3">Tanggal</th>
                  <th className="py-3.5 px-3">Jenis</th>
                  <th className="py-3.5 px-3">Kategori Arus Kas</th>
                  <th className="py-3.5 px-3">Keterangan</th>
                  <th className="py-3.5 px-3 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
              {activeTab === 'kunjungan' &&
                (pageRows as VisitExportRow[]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {row.no_rm}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {row.nama_pasien}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{row.jenis_kelamin}</td>
                    <td className="py-3 px-3">{row.desa}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {row.tanggal_periksa}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {row.nama_dokter}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                        {row.kode_icd10 || '-'}
                      </span>
                      <span className="truncate inline-block max-w-xs align-bottom">
                        {row.diagnosa_deskripsi || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          row.jenis_pasien === 'BPJS'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {row.jenis_pasien}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      {formatRupiah(row.total_biaya)}
                    </td>
                  </tr>
                ))}

              {activeTab === 'morbiditas' &&
                (pageRows as MorbidityExportRow[]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      #{row.rank}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">
                      {row.kode_icd10}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {row.diagnosa_deskripsi}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {row.jumlah_kasus.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                      {row.persentase.toFixed(2)}%
                    </td>
                  </tr>
                ))}

              {activeTab === 'buku_kas' &&
                (pageRows as CashFlowExportRow[]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {row.tanggal}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          row.jenis === 'Masuk'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {row.jenis}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {row.kategori}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">
                      {row.keterangan || '-'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        row.jenis === 'Masuk' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.jenis === 'Masuk' ? '+' : '-'} {formatRupiah(row.nominal)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
          <span>
            Total Data Terpilih: <strong className="text-slate-900 font-mono">{totalRows.toLocaleString('id-ID')}</strong> baris
          </span>

          {activeTab === 'kunjungan' && (
            <>
              <span>•</span>
              <span>
                Umum: <strong className="text-blue-700 font-mono">{visitsSummary.umumCount}</strong>
              </span>
              <span>•</span>
              <span>
                BPJS: <strong className="text-teal-700 font-mono">{visitsSummary.bpjsCount}</strong>
              </span>
              <span>•</span>
              <span>
                Total Omzet: <strong className="text-emerald-700 font-mono">{formatRupiah(visitsSummary.totalBiaya)}</strong>
              </span>
            </>
          )}

          {activeTab === 'morbiditas' && (
            <>
              <span>•</span>
              <span>
                Total Kasus Morbiditas: <strong className="text-teal-700 font-mono">{morbiditySummary.totalCases.toLocaleString('id-ID')}</strong>
              </span>
            </>
          )}

          {activeTab === 'buku_kas' && (
            <>
              <span>•</span>
              <span>
                Total Masuk: <strong className="text-emerald-700 font-mono">{formatRupiah(cashFlowSummary.totalMasuk)}</strong>
              </span>
              <span>•</span>
              <span>
                Total Keluar: <strong className="text-rose-700 font-mono">{formatRupiah(cashFlowSummary.totalKeluar)}</strong>
              </span>
              <span>•</span>
              <span>
                Saldo Bersih: <strong className="text-slate-900 font-mono">{formatRupiah(cashFlowSummary.net)}</strong>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-slate-500 text-[11px]">
            Halaman {safePage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage <= 1}
            aria-label="Halaman sebelumnya"
            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <CaretLeft weight="bold" className="w-4 h-4 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage >= totalPages}
            aria-label="Halaman selanjutnya"
            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <CaretRight weight="bold" className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportPreviewTable;
