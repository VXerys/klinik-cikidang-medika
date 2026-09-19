'use client';

import React from 'react';
import { Calendar, Filter, RotateCcw, UserCheck, Stethoscope } from 'lucide-react';

interface DoctorOption {
  id: string;
  nama: string;
}

interface ReportFilterBarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  jenisPasien: string;
  onJenisPasienChange: (val: string) => void;
  dokterId: string;
  onDokterIdChange: (val: string) => void;
  doctorsList: DoctorOption[];
  onApplyFilter: () => void;
  onResetFilter: () => void;
  onPresetChange: (preset: 'today' | 'this_month' | 'last_month' | 'this_year' | 'all') => void;
  isLoading?: boolean;
}

export function ReportFilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  jenisPasien,
  onJenisPasienChange,
  dokterId,
  onDokterIdChange,
  doctorsList,
  onApplyFilter,
  onResetFilter,
  onPresetChange,
  isLoading,
}: ReportFilterBarProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Parameter Laporan</span>
        </div>
        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Preset:</span>
          <button
            type="button"
            onClick={() => onPresetChange('this_month')}
            className="px-2.5 py-1 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-[11px]"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => onPresetChange('last_month')}
            className="px-2.5 py-1 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-[11px]"
          >
            Bulan Lalu
          </button>
          <button
            type="button"
            onClick={() => onPresetChange('this_year')}
            className="px-2.5 py-1 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-[11px]"
          >
            Tahun 2026
          </button>
          <button
            type="button"
            onClick={() => onPresetChange('all')}
            className="px-2.5 py-1 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-[11px]"
          >
            Semua Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rentang Tanggal Mulai */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Mulai</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus-visible:outline-none transition"
          />
        </div>

        {/* Rentang Tanggal Selesai */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Selesai</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus-visible:outline-none transition"
          />
        </div>

        {/* Jenis Penjamin Pasien */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Jenis Pasien</span>
          </label>
          <select
            value={jenisPasien}
            onChange={(e) => onJenisPasienChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus-visible:outline-none transition"
          >
            <option value="Semua">Semua Pasien (Umum & BPJS)</option>
            <option value="UMUM">Pasien UMUM (Tunai / TF)</option>
            <option value="BPJS">Pasien BPJS Kesehatan</option>
          </select>
        </div>

        {/* Dokter Pemeriksa */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
            <span>Dokter Pemeriksa</span>
          </label>
          <select
            value={dokterId}
            onChange={(e) => onDokterIdChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus-visible:outline-none transition"
          >
            <option value="Semua">Semua Dokter</option>
            {doctorsList.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tombol Terapkan & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onResetFilter}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition w-full sm:w-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>

        <button
          type="button"
          onClick={onApplyFilter}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50"
        >
          <Filter className="w-4 h-4" />
          <span>{isLoading ? 'Memuat Data...' : 'Terapkan Filter'}</span>
        </button>
      </div>
    </div>
  );
}
