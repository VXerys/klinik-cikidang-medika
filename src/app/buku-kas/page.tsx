'use client';

import React from 'react';
import { PlusCircle, ArrowDownLeft, ArrowUpRight, Banknote } from 'lucide-react';

export default function BukuKasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buku Kas Operasional Klinik</h1>
          <p className="text-xs text-slate-500 mt-1">Pencatatan dana kapitasi BPJS, pembelian obat, operasional non-klinik, dan setor tunai</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
            <PlusCircle className="w-4 h-4" />
            + Kas Masuk (Kapitasi/Lainnya)
          </button>
          <button className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
            <PlusCircle className="w-4 h-4" />
            + Kas Keluar (Obat/Operasional)
          </button>
        </div>
      </div>

      {/* Ringkasan Kas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium">Total Pemasukan Bulan Ini</span>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <ArrowDownLeft className="w-5 h-5" />
            Rp 52.345.000
          </div>
          <span className="text-[11px] text-slate-400">Kapitasi BPJS + Pasien Umum</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium">Total Pengeluaran Bulan Ini</span>
          <div className="text-xl font-bold text-rose-600 mt-1 flex items-center gap-1.5">
            <ArrowUpRight className="w-5 h-5" />
            Rp 18.459.000
          </div>
          <span className="text-[11px] text-slate-400">Beli Obat & Operasional</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium">Setor Tunai ke Bank</span>
          <div className="text-xl font-bold text-blue-600 mt-1 flex items-center gap-1.5">
            <Banknote className="w-5 h-5" />
            Rp 9.952.000
          </div>
          <span className="text-[11px] text-slate-400">Rekap setor tunai kasir</span>
        </div>
      </div>

      {/* Mutasi Kas Terakhir */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">Daftar Mutasi Kas Operasional</h2>
        </div>
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { tgl: '18-09-2026', kat: 'Setor Tunai', ket: 'Setor tunai penerimaan kasir hari ini ke rekening klinik', tipe: 'Masuk', nom: 'Rp 2.870.000' },
              { tgl: '17-09-2026', kat: 'Pengeluaran Non Klinik', ket: 'Nasi padang makan siang dokter jaga', tipe: 'Keluar', nom: 'Rp 19.000' },
              { tgl: '17-09-2026', kat: 'Pengeluaran Klinik', ket: 'Beli obat sirup zinc', tipe: 'Keluar', nom: 'Rp 16.000' },
              { tgl: '15-09-2026', kat: 'Kapitasi BPJS', ket: 'Pencairan Dana Kapitasi BPJS Kesehatan September 2026', tipe: 'Masuk', nom: 'Rp 28.203.005' },
              { tgl: '16-09-2026', kat: 'Setor Tunai', ket: 'Setor tunai kasir ke bank', tipe: 'Masuk', nom: 'Rp 2.650.000' },
            ].map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-3 font-mono">{row.tgl}</td>
                <td className="p-3 font-semibold text-slate-800">{row.kat}</td>
                <td className="p-3">{row.ket}</td>
                <td className={`p-3 text-right font-bold ${
                  row.tipe === 'Masuk' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {row.tipe === 'Masuk' ? '+' : '-'} {row.nom}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
