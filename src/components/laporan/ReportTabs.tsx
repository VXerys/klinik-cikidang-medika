'use client';

import React from 'react';
import { Users, Heartbeat, Wallet } from '@phosphor-icons/react';

export type ReportTabType = 'kunjungan' | 'morbiditas' | 'buku_kas';

interface ReportTabsProps {
  activeTab: ReportTabType;
  onChangeTab: (tab: ReportTabType) => void;
  counts?: {
    kunjungan: number;
    morbiditas: number;
    buku_kas: number;
  };
}

export function ReportTabs({ activeTab, onChangeTab, counts }: ReportTabsProps) {
  const tabs: {
    id: ReportTabType;
    label: string;
    icon: React.ElementType;
    countKey?: keyof NonNullable<typeof counts>;
  }[] = [
    { id: 'kunjungan', label: 'Rekap Kunjungan Pasien', icon: Users, countKey: 'kunjungan' },
    { id: 'morbiditas', label: '10 Besar Penyakit (ICD-10)', icon: Heartbeat, countKey: 'morbiditas' },
    { id: 'buku_kas', label: 'Arus Kas Operasional', icon: Wallet, countKey: 'buku_kas' },
  ];

  return (
    <div className="w-full bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts && tab.countKey ? counts[tab.countKey] : undefined;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`h-9 px-3 rounded-lg text-xs font-semibold transition-all tactile-btn flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                isActive
                  ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <IconComponent
                weight="duotone"
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
              />
              <span className="truncate">{tab.label}</span>
              {count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count.toLocaleString('id-ID')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ReportTabs;
