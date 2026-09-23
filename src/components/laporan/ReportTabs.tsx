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
    <div className="flex flex-col sm:flex-row gap-2 border-b border-slate-200 pb-2 w-full">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        const count = counts && tab.countKey ? counts[tab.countKey] : undefined;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 sm:border-transparent'
            }`}
          >
            <IconComponent weight="duotone" className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count.toLocaleString('id-ID')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ReportTabs;
