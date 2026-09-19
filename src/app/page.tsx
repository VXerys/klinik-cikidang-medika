'use client';

import React from 'react';
import { 
  Users, 
  CreditCard, 
  HeartHandshake, 
  TrendingUp, 
  ArrowUpRight, 
  FileText,
  UserCheck,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan Klinik</h1>
          <p className="text-xs text-slate-500 mt-1">Ringkasan operasional dan keuangan Klinik Cikidang Medika</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/pendaftaran"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <UserCheck className="w-4 h-4" />
            + Pasien Baru / Kasir
          </Link>
          <Link 
            href="/laporan"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            Unduh Excel
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Kunjungan</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">7.493</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4.238 Pasien Terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pendapatan Pasien Umum</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">Rp 699,69 Jt</div>
          <div className="text-xs text-slate-500 mt-2">
            3.958 kunjungan pasien umum
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Kapitasi BPJS Bulanan</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">~Rp 28,2 Jt</div>
          <div className="text-xs text-slate-500 mt-2">
            ~3.300 peserta terdaftar FKTP
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">Rp 196,28 Jt</div>
          <div className="text-xs text-slate-500 mt-2">
            Obat & Operasional Klinik
          </div>
        </div>
      </div>

      {/* 2 Column Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Penyakit ICD-10 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>5 Penyakit Terbanyak (ICD-10)</span>
          </h2>
          <div className="space-y-3">
            {[
              { code: 'J00', name: 'Acute nasopharyngitis (ISPA / Batuk Pilek)', count: 1731, pct: 23 },
              { code: 'K30', name: 'Dyspepsia (Sakit Maag)', count: 1304, pct: 17 },
              { code: 'Z34', name: 'Pemeriksaan Kehamilan Normal (ANC)', count: 657, pct: 9 },
              { code: 'L23', name: 'Allergic Contact Dermatitis (Gatal Kulit)', count: 305, pct: 4 },
              { code: 'Z00', name: 'Pemeriksaan Kesehatan Umum', count: 282, pct: 4 },
            ].map((d) => (
              <div key={d.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">[{d.code}] {d.name}</span>
                  <span className="font-bold text-slate-900">{d.count} kasus</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${d.pct * 3}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demografi Pasien per Wilayah */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Asal Pasien per Desa / Wilayah</span>
          </h2>
          <div className="space-y-2.5">
            {[
              { village: 'Cikidang', count: 2811, pct: '37,5%' },
              { village: 'Pangkalan', count: 1955, pct: '26,1%' },
              { village: 'Cicareuh', count: 696, pct: '9,3%' },
              { village: 'Bumi Sari', count: 584, pct: '7,8%' },
              { village: 'Luar Daerah', count: 374, pct: '5,0%' },
            ].map((v) => (
              <div key={v.village} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700">Desa {v.village}</span>
                <div className="flex items-center gap-3 font-semibold text-slate-900">
                  <span>{v.count} pasien</span>
                  <span className="text-blue-600 text-[11px] bg-blue-50 px-2 py-0.5 rounded-md">{v.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
