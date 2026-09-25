'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarBlank,
  Funnel,
  ArrowCounterClockwise,
  UserCheck,
  Stethoscope,
  CaretDown,
  Check,
  MagnifyingGlass,
} from '@phosphor-icons/react';

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
  const [activeDropdown, setActiveDropdown] = useState<'jenis' | 'dokter' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getJenisLabel = (val: string) => {
    if (val === 'UMUM') return 'Pasien UMUM (Tunai / TF)';
    if (val === 'BPJS') return 'Pasien BPJS Kesehatan';
    return 'Semua Pasien (Umum & BPJS)';
  };

  const getDokterLabel = (id: string) => {
    if (id === 'Semua') return 'Semua Dokter';
    const found = doctorsList.find((d) => d.id === id);
    return found ? found.nama : 'Semua Dokter';
  };

  // Infer active preset based on current start and end date
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();
  const thisMonthStart = new Date(yr, mo, 1).toISOString().split('T')[0];
  const thisMonthEnd = new Date(yr, mo + 1, 0).toISOString().split('T')[0];
  const lastMonthStart = new Date(yr, mo - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(yr, mo, 0).toISOString().split('T')[0];
  const thisYearStart = `${yr}-01-01`;
  const thisYearEnd = `${yr}-12-31`;

  let activePreset: 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom' = 'custom';
  if (startDate === thisMonthStart && endDate === thisMonthEnd) {
    activePreset = 'this_month';
  } else if (startDate === lastMonthStart && endDate === lastMonthEnd) {
    activePreset = 'last_month';
  } else if (startDate === thisYearStart && endDate === thisYearEnd) {
    activePreset = 'this_year';
  } else if (!startDate && !endDate) {
    activePreset = 'all';
  }

  return (
    <div
      ref={dropdownRef}
      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card space-y-4"
    >
      {/* Header: Title and Active Filter Scope Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 shrink-0">
            <Funnel weight="duotone" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Filter Parameter Laporan
            </h3>
            <p className="text-[11px] text-slate-500">
              Saring rekapan kunjungan, morbiditas, dan arus kas berdasarkan parameter
            </p>
          </div>
        </div>

        {/* Active Range & Filter Scope Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {startDate && endDate
                ? `${startDate} s/d ${endDate}`
                : startDate
                ? `Mulai ${startDate}`
                : endDate
                ? `Sampai ${endDate}`
                : 'Semua Periode Data'}
            </span>
          </span>
          {(jenisPasien !== 'Semua' || dokterId !== 'Semua') && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700">
              Filter Khusus
            </span>
          )}
        </div>
      </div>

      {/* 4-Column Responsive Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Field 1: Tanggal Mulai */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Mulai</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition min-h-[36px]"
          />
        </div>

        {/* Field 2: Tanggal Selesai */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Selesai</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition min-h-[36px]"
          />
        </div>

        {/* Field 3: Jenis Pasien (Custom Floating Popover) */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <UserCheck weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
            <span>Jenis Pasien</span>
          </label>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'jenis' ? null : 'jenis')}
            className="w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-300 rounded-xl flex items-center justify-between text-left text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none min-h-[36px] transition"
          >
            <span className="truncate">{getJenisLabel(jenisPasien)}</span>
            <CaretDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                activeDropdown === 'jenis' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {activeDropdown === 'jenis' && (
            <div className="absolute top-full mt-1 inset-x-0 z-50 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-popover p-1.5 space-y-1 animate-popover">
              {[
                { id: 'Semua', label: 'Semua Pasien (Umum & BPJS)' },
                { id: 'UMUM', label: 'Pasien UMUM (Tunai / TF)' },
                { id: 'BPJS', label: 'Pasien BPJS Kesehatan' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onJenisPasienChange(opt.id);
                    setActiveDropdown(null);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition ${
                    jenisPasien === opt.id
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  {jenisPasien === opt.id && (
                    <Check className="w-3.5 h-3.5 text-teal-600" weight="bold" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Field 4: Dokter Pemeriksa (Custom Floating Popover) */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Stethoscope weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
            <span>Dokter Pemeriksa</span>
          </label>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'dokter' ? null : 'dokter')}
            className="w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-300 rounded-xl flex items-center justify-between text-left text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none min-h-[36px] transition"
          >
            <span className="truncate">{getDokterLabel(dokterId)}</span>
            <CaretDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                activeDropdown === 'dokter' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {activeDropdown === 'dokter' && (
            <div className="absolute top-full mt-1 inset-x-0 z-50 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-popover p-1.5 space-y-1 animate-popover max-h-56 overflow-y-auto">
              <div
                onClick={() => {
                  onDokterIdChange('Semua');
                  setActiveDropdown(null);
                }}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition ${
                  dokterId === 'Semua'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <span>Semua Dokter</span>
                {dokterId === 'Semua' && (
                  <Check className="w-3.5 h-3.5 text-teal-600" weight="bold" />
                )}
              </div>
              {doctorsList.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onDokterIdChange(doc.id);
                    setActiveDropdown(null);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition ${
                    dokterId === doc.id
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <span>{doc.nama}</span>
                  {dokterId === doc.id && (
                    <Check className="w-3.5 h-3.5 text-teal-600" weight="bold" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Segmented Preset Track on Left, Action Buttons on Right */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Left: Recessed Preset Segmented Track */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Preset:
          </span>
          <div className="bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs w-full sm:w-auto">
            <div className="grid grid-cols-4 gap-0.5">
              {[
                { id: 'this_month', label: 'Bulan Ini', shortLabel: 'Bln Ini' },
                { id: 'last_month', label: 'Bulan Lalu', shortLabel: 'Bln Lalu' },
                { id: 'this_year', label: `Tahun ${yr}`, shortLabel: `${yr}` },
                { id: 'all', label: 'Semua Data', shortLabel: 'Semua' },
              ].map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPresetChange(p.id as any)}
                    className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all tactile-btn whitespace-nowrap flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                      isActive
                        ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
                    }`}
                  >
                    <span className="hidden sm:inline">{p.label}</span>
                    <span className="sm:hidden">{p.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Filter Action Buttons */}
        <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={onResetFilter}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs tactile-btn transition flex-1 sm:flex-initial focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none disabled:opacity-50"
          >
            <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filter</span>
          </button>

          <button
            type="button"
            onClick={onApplyFilter}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[36px] rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 border border-teal-700/80 shadow-btn-primary tactile-btn transition flex-1 sm:flex-initial disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            <Funnel weight="bold" className="w-3.5 h-3.5" />
            <span>Terapkan Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportFilterBar;
