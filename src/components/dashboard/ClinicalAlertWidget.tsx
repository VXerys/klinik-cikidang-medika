'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Pill,
  Calendar,
  Scissors,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

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
      <div className="h-24 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse"></div>
    );
  }

  const hasUrgentAlert = alerts.mangkirTbc > 0 || alerts.overduePostCare > 0;
  const hasDailyAttention = alerts.todayPostCare > 0 || alerts.recentCircumcision > 0;

  if (!hasUrgentAlert && !hasDailyAttention) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">
              Surveilans Pasien Berisiko Terkendali
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Seluruh pasien program khusus terkontrol dengan baik (tidak ada pasien TBC mangkir atau jadwal kontrol terlewat).
            </p>
          </div>
        </div>
        <Link
          href="/program-khusus"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold shadow-2xs transition self-start sm:self-auto min-h-[44px]"
        >
          <span>Buka Program Khusus</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition ${
        hasUrgentAlert
          ? 'bg-rose-50/80 border-rose-200'
          : 'bg-amber-50/80 border-amber-200'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg text-white font-bold shrink-0 ${
              hasUrgentAlert ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`text-xs font-bold tracking-tight ${
                hasUrgentAlert ? 'text-rose-950' : 'text-amber-950'
              }`}
            >
              Peringatan Klinis & Pasien Berisiko Perlu Tindakan
            </h4>
            <p className="text-[11px] text-slate-600">
              Deteksi otomatis pasien mangkir obat dan jadwal kontrol luka rawat jalan
            </p>
          </div>
        </div>

        {/* Chips Alert Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {alerts.mangkirTbc > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-300 shadow-2xs">
              <Pill className="w-3.5 h-3.5 text-rose-600" />
              <span>{alerts.mangkirTbc} Pasien TBC Mangkir (&gt;7 hari)</span>
            </span>
          )}

          {alerts.overduePostCare > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>{alerts.overduePostCare} Kontrol Pos-Rawat Terlewat</span>
            </span>
          )}

          {alerts.todayPostCare > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-amber-800 border border-amber-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{alerts.todayPostCare} Pasien Kontrol Pos-Rawat Hari Ini</span>
            </span>
          )}

          {alerts.recentCircumcision > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-blue-800 border border-blue-200 shadow-2xs">
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              <span>{alerts.recentCircumcision} Sirkumsisi (Masa Kontrol Luka/Klamp)</span>
            </span>
          )}
        </div>
      </div>

      <Link
        href="/program-khusus"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start lg:self-auto shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
      >
        <span>Tindak Lanjuti di Program Khusus</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
