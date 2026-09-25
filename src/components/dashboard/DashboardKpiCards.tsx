'use client';

import React from 'react';
import {
  Users,
  CreditCard,
  Handshake,
  ArrowUpRight,
  Wallet,
  TrendUp,
  WarningCircle,
} from '@phosphor-icons/react';
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
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-28 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'kunjungan',
      title: 'Total Kunjungan',
      value: data.totalVisits.toLocaleString('id-ID'),
      subtitle: `${data.uniquePatients.toLocaleString('id-ID')} Pasien Terdaftar`,
      delta: '+12.5%',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      strokeColor: '#2563eb',
      gradId: 'spark-grad-kunjungan',
      pathD: 'M0 26 Q 30 14, 60 20 T 120 6 L 120 32 L 0 32 Z',
      lineD: 'M0 26 Q 30 14, 60 20 T 120 6',
      circleY: 6,
    },
    {
      id: 'umum',
      title: 'Pendapatan Umum',
      value: formatRupiah(data.umumRevenue),
      subtitle: 'Kasir poli rawat jalan',
      delta: '+8.4%',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-600',
      strokeColor: '#059669',
      gradId: 'spark-grad-umum',
      pathD: 'M0 24 Q 40 8, 80 18 T 120 8 L 120 32 L 0 32 Z',
      lineD: 'M0 24 Q 40 8, 80 18 T 120 8',
      circleY: 8,
    },
    {
      id: 'bpjs',
      title: 'Kapitasi BPJS',
      value: formatRupiah(data.bpjsRevenue),
      subtitle: 'Klaim bulanan FKTP',
      delta: '+14.2%',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Handshake,
      iconBg: 'bg-teal-50 text-teal-600',
      strokeColor: '#0d9488',
      gradId: 'spark-grad-bpjs',
      pathD: 'M0 20 Q 35 6, 75 14 T 120 10 L 120 32 L 0 32 Z',
      lineD: 'M0 20 Q 35 6, 75 14 T 120 10',
      circleY: 10,
    },
    {
      id: 'pengeluaran',
      title: 'Total Pengeluaran',
      value: formatRupiah(data.totalExpenses),
      subtitle: 'Obat & biaya operasional',
      delta: '-3.1%',
      deltaColor: 'text-slate-600 bg-slate-100 border-slate-200',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-50 text-rose-600',
      strokeColor: '#e11d48',
      gradId: 'spark-grad-beban',
      pathD: 'M0 16 Q 40 24, 80 12 T 120 18 L 120 32 L 0 32 Z',
      lineD: 'M0 16 Q 40 24, 80 12 T 120 18',
      circleY: 18,
    },
    {
      id: 'saldo',
      title: 'Saldo Kas Bersih',
      value: formatRupiah(data.netIncome),
      subtitle: data.netIncome >= 0 ? 'Surplus arus kas bersih' : 'Defisit arus kas',
      delta: data.netIncome >= 0 ? 'Surplus' : 'Defisit',
      deltaColor: data.netIncome >= 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200',
      icon: Wallet,
      iconBg: data.netIncome >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600',
      strokeColor: '#4f46e5',
      gradId: 'spark-grad-saldo',
      pathD: 'M0 26 Q 30 18, 65 10 T 120 6 L 120 32 L 0 32 Z',
      lineD: 'M0 26 Q 30 18, 65 10 T 120 6',
      circleY: 6,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-blue-400 transition-colors"
          >
            <div>
              {/* Header: Title & Icon Pill */}
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-xl shrink-0 ${card.iconBg}`}>
                  <IconComponent className="w-4 h-4" weight="duotone" />
                </div>
              </div>

              {/* Value with Tabular Monospace */}
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {card.value}
              </div>

              {/* Area Gradient Sparkline SVG */}
              <div className="h-8 w-full my-2">
                <svg className="w-full h-full" viewBox="0 0 120 32" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.strokeColor} stopOpacity="0.22" />
                      <stop offset="100%" stopColor={card.strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={card.pathD} fill={`url(#${card.gradId})`} />
                  <path d={card.lineD} stroke={card.strokeColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <circle cx="120" cy={card.circleY} r="3" fill={card.strokeColor} />
                  <circle cx="120" cy={card.circleY} r="5" fill={card.strokeColor} opacity="0.25" />
                </svg>
              </div>
            </div>

            {/* Footer: Subtitle & Delta Badge without truncation */}
            <div className="flex items-center justify-between gap-1 text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-600 text-[11px] font-medium leading-tight">
                {card.subtitle}
              </span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md border shrink-0 ${card.deltaColor}`}>
                {card.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
