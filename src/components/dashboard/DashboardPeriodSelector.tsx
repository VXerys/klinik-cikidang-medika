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
  const periods: { id: DashboardPeriod; label: string; shortLabel: string }[] = [
    { id: 'this_month', label: 'Bulan Ini', shortLabel: 'Bln Ini' },
    { id: 'last_month', label: 'Bulan Lalu', shortLabel: 'Bln Lalu' },
    { id: 'this_year', label: 'Tahun 2026', shortLabel: '2026' },
    { id: 'all', label: 'Semua Periode', shortLabel: 'Semua' },
  ];

  return (
    <div className="w-full bg-slate-50/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="grid grid-cols-4 gap-0.5 w-full">
        {periods.map((p) => {
          const isActive = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={isLoading}
              onClick={() => onChangePeriod(p.id)}
              className={`h-8 px-1.5 sm:px-2.5 rounded-lg text-xs font-semibold transition-all tactile-btn whitespace-nowrap flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none disabled:opacity-50 ${
                isActive
                  ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
