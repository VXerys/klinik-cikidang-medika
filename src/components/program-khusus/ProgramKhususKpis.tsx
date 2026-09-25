'use client';

import React from 'react';
import {
  CalendarCheck,
  Scissors,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react';
import { Lungs, BandageAdhesive } from 'healthicons-react';
import { formatRupiah } from '@/lib/utils';

export interface ProgramKhususKpiData {
  // TBC stats
  totalTbc: number;
  mangkirTbc: number;
  intensifTbc: number;
  lanjutanTbc: number;

  // Circumcision stats
  totalCircumcisions: number;
  totalCircumcisionRevenue: number;
  pendingFollowUpPhotos: number;

  // Post care stats
  postCareTodayCount: number;
  postCareOverdueCount: number;
  postCareCompletedCount: number;
}

interface ProgramKhususKpisProps {
  data: ProgramKhususKpiData;
  isLoading?: boolean;
}

export function ProgramKhususKpis({ data, isLoading }: ProgramKhususKpisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-7 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-32 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'kpi-tbc',
      title: 'Kohort TBC (DOTS)',
      value: `${data.totalTbc} Pasien`,
      subtitle: `${data.intensifTbc} Intensif • ${data.lanjutanTbc} Lanjutan`,
      delta:
        data.mangkirTbc > 0
          ? `${data.mangkirTbc} Mangkir`
          : '100% Taat',
      deltaColor:
        data.mangkirTbc > 0
          ? 'text-rose-700 bg-rose-50 border-rose-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Lungs,
      iconBg: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      strokeColor: '#7c3aed',
      gradId: 'spark-grad-tbc',
      pathD: 'M0 24 Q 30 16, 60 20 T 120 8 L 120 32 L 0 32 Z',
      lineD: 'M0 24 Q 30 16, 60 20 T 120 8',
      circleY: 8,
    },
    {
      id: 'kpi-sirkumsisi',
      title: 'Sirkumsisi & Foto Medis',
      value: `${data.totalCircumcisions} Tindakan`,
      subtitle: `Omzet ${formatRupiah(data.totalCircumcisionRevenue)}`,
      delta:
        data.pendingFollowUpPhotos > 0
          ? `${data.pendingFollowUpPhotos} Tunggu Foto`
          : 'Foto Lengkap',
      deltaColor:
        data.pendingFollowUpPhotos > 0
          ? 'text-teal-700 bg-teal-50 border-teal-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: BandageAdhesive,
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200/80',
      strokeColor: '#2563eb',
      gradId: 'spark-grad-circ',
      pathD: 'M0 22 Q 40 12, 80 18 T 120 6 L 120 32 L 0 32 Z',
      lineD: 'M0 22 Q 40 12, 80 18 T 120 6',
      circleY: 6,
    },
    {
      id: 'kpi-posrawat',
      title: 'Agenda Pasien Pos-Rawat',
      value: `${data.postCareTodayCount} Hari Ini`,
      subtitle: `${data.postCareCompletedCount} Selesai • ${data.postCareOverdueCount} Lewat`,
      delta:
        data.postCareOverdueCount > 0
          ? `${data.postCareOverdueCount} Overdue`
          : 'Terjadwal',
      deltaColor:
        data.postCareOverdueCount > 0
          ? 'text-rose-700 bg-rose-50 border-rose-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      strokeColor: '#059669',
      gradId: 'spark-grad-postcare',
      pathD: 'M0 20 Q 35 10, 75 16 T 120 10 L 120 32 L 0 32 Z',
      lineD: 'M0 20 Q 35 10, 75 16 T 120 10',
      circleY: 10,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-teal-400 transition-colors"
          >
            <div>
              {/* Header: Title & Icon Pill */}
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-xl shrink-0 ${card.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              {/* Value with Tabular Monospace & Responsive Fluid Scaling */}
              <div className="flex items-baseline gap-1 font-mono tracking-tight min-w-0">
                <span
                  className="text-lg sm:text-xl lg:text-lg xl:text-[1.18rem] 2xl:text-2xl font-extrabold text-slate-900 truncate"
                  title={card.value}
                >
                  {card.value}
                </span>
              </div>

              {/* Area Gradient Sparkline SVG */}
              <div className="h-8 w-full my-2">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 120 32"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.strokeColor} stopOpacity="0.22" />
                      <stop offset="100%" stopColor={card.strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={card.pathD} fill={`url(#${card.gradId})`} />
                  <path
                    d={card.lineD}
                    stroke={card.strokeColor}
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="120" cy={card.circleY} r="3" fill={card.strokeColor} />
                  <circle
                    cx="120"
                    cy={card.circleY}
                    r="5"
                    fill={card.strokeColor}
                    opacity="0.25"
                  />
                </svg>
              </div>
            </div>

            {/* Footer: Subtitle & Delta Badge without truncation */}
            <div className="flex items-center justify-between gap-1 text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-600 text-[11px] font-medium leading-tight truncate">
                {card.subtitle}
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md border shrink-0 ${card.deltaColor}`}
              >
                {card.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
