'use client';

import React from 'react';
import { Calendar } from '@phosphor-icons/react';

export type DashboardPeriod = 'this_month' | 'last_month' | 'this_year' | 'all';

interface DashboardPeriodSelectorProps {
  selectedPeriod: DashboardPeriod;
  onChangePeriod: (period: DashboardPeriod) => void;
  isLoading?: boolean;
}

export function DashboardPeriodSelector({
  selectedPeriod,
  onChangePeriod,
  isLoading,
}: DashboardPeriodSelectorProps) {
  const periods: { id: DashboardPeriod; label: string }[] = [
    { id: 'this_month', label: 'Bulan Ini' },
    { id: 'last_month', label: 'Bulan Lalu' },
    { id: 'this_year', label: 'Tahun 2026' },
    { id: 'all', label: 'Semua Data (2024–2026)' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 text-xs text-slate-500 font-medium shrink-0">
        <Calendar className="w-4 h-4 text-slate-400" weight="duotone" />
        <span>Periode:</span>
      </div>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1.5 w-full sm:w-auto">
        {periods.map((p) => {
          const isActive = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={isLoading}
              onClick={() => onChangePeriod(p.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition text-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
