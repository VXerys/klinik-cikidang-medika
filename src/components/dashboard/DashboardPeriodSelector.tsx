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
    { id: 'all', label: 'Semua (2024–2026)', shortLabel: 'Semua' },
  ];

  return (
    <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-well overflow-x-auto max-w-full">
      <div className="flex items-center gap-1">
        {periods.map((p) => {
          const isActive = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={isLoading}
              onClick={() => onChangePeriod(p.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all tactile-btn whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50 ${
                isActive
                  ? 'bg-white text-blue-700 font-bold shadow-btn-secondary'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
