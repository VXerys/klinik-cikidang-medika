'use client';

import React from 'react';
import {
  Users,
  CreditCard,
  HeartHandshake,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export interface DashboardKpiData {
  totalVisits: number;
  uniquePatients: number;
  umumRevenue: number;
  bpjsRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface DashboardKpiCardsProps {
  data: DashboardKpiData;
  isLoading?: boolean;
}

export function DashboardKpiCards({ data, isLoading }: DashboardKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded"></div>
            <div className="h-3 w-20 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Kunjungan',
      value: data.totalVisits.toLocaleString('id-ID'),
      subtitle: `${data.uniquePatients.toLocaleString('id-ID')} Pasien Terdaftar`,
      subIcon: TrendingUp,
      subColor: 'text-emerald-600',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pendapatan Pasien Umum',
      value: formatRupiah(data.umumRevenue),
      subtitle: 'Billing Kasir Pasien Umum',
      subColor: 'text-slate-500',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Kapitasi BPJS',
      value: formatRupiah(data.bpjsRevenue),
      subtitle: 'Pencairan Klaim FKTP',
      subColor: 'text-slate-500',
      icon: HeartHandshake,
      iconBg: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Total Pengeluaran',
      value: formatRupiah(data.totalExpenses),
      subtitle: 'Obat & Operasional Klinik',
      subColor: 'text-slate-500',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Saldo Kas Bersih',
      value: formatRupiah(data.netIncome),
      subtitle: data.netIncome >= 0 ? 'Surplus Arus Kas' : 'Defisit Arus Kas',
      subIcon: data.netIncome >= 0 ? TrendingUp : AlertCircle,
      subColor: data.netIncome >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium',
      icon: Wallet,
      iconBg: data.netIncome >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        const SubIconComponent = card.subIcon;

        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl shrink-0 ${card.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {card.value}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs mt-3.5 ${card.subColor}`}>
              {SubIconComponent && <SubIconComponent className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
