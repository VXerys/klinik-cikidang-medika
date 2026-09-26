'use client';

import React from 'react';
import Link from 'next/link';
import {
  Warning,
  CalendarCheck,
  CaretRight,
  ShieldCheck,
  Scissors,
} from '@phosphor-icons/react';
import { Lungs, BandageAdhesive } from 'healthicons-react';

export interface ClinicalAlertCounts {
  mangkirTbc: number;
  todayPostCare: number;
  overduePostCare: number;
  recentCircumcision: number;
}

interface ClinicalAlertWidgetProps {
  alerts: ClinicalAlertCounts;
  isLoading?: boolean;
}

export function ClinicalAlertWidget({ alerts, isLoading }: ClinicalAlertWidgetProps) {
  if (isLoading) {
    return (
      <div className="h-12 bg-slate-100/80 rounded-2xl border border-slate-200/80 animate-pulse"></div>
    );
  }

  const hasUrgentAlert = alerts.mangkirTbc > 0 || alerts.overduePostCare > 0;
  const hasDailyAttention = alerts.todayPostCare > 0 || alerts.recentCircumcision > 0;
  const totalAlerts = alerts.mangkirTbc + alerts.overduePostCare + alerts.todayPostCare + alerts.recentCircumcision;

  if (!hasUrgentAlert && !hasDailyAttention) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" weight="bold" />
          </div>
          <span className="font-semibold text-emerald-950">
            Surveilans Pasien Terkendali
          </span>
          <span className="text-emerald-700 hidden sm:inline">&bull;</span>
          <span className="text-emerald-800 text-[11px] hidden sm:inline">
            Tidak ada pasien TBC mangkir atau jadwal kontrol luka terlewat
          </span>
        </div>
        <Link
          href="/program-khusus"
          className="text-emerald-800 hover:text-emerald-950 font-bold text-xs inline-flex items-center gap-1 shrink-0 transition"
        >
          <span>Buka Program Khusus</span>
          <CaretRight className="w-3.5 h-3.5" weight="bold" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs transition ${
        hasUrgentAlert
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center shrink-0 ${
            hasUrgentAlert ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
          }`}
        >
          <Warning className="w-3.5 h-3.5" weight="bold" />
        </div>
        <span className="text-xs font-bold tracking-tight">
          Perhatian Klinis ({totalAlerts}):
        </span>

        {alerts.mangkirTbc > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white text-rose-700 border border-rose-300 shadow-2xs">
            <Lungs className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{alerts.mangkirTbc} TBC Mangkir</span>
          </span>
        )}

        {alerts.overduePostCare > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white text-rose-700 border border-rose-300 shadow-2xs">
            <CalendarCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" weight="duotone" />
            <span>{alerts.overduePostCare} Kontrol Terlewat</span>
          </span>
        )}

        {alerts.todayPostCare > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-amber-800 border border-amber-300 shadow-2xs">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" weight="duotone" />
            <span>{alerts.todayPostCare} Kontrol Hari Ini</span>
          </span>
        )}

        {alerts.recentCircumcision > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-teal-800 border border-teal-200 shadow-2xs">
            <BandageAdhesive className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{alerts.recentCircumcision} Sirkumsisi Aktif</span>
          </span>
        )}
      </div>

      <Link
        href="/program-khusus"
        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-800 rounded-xl text-xs font-bold shadow-btn-secondary tactile-btn shrink-0 transition"
      >
        <span>Tindak Lanjuti</span>
        <CaretRight className="w-3.5 h-3.5 text-slate-500" weight="bold" />
      </Link>
    </div>
  );
}
