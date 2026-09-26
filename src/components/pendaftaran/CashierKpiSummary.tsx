'use client';

import React from 'react';
import {
  Users,
  Stethoscope,
  CreditCard,
  Wallet,
} from '@phosphor-icons/react';
import { formatRupiah } from '@/lib/utils';

export interface CashierKpiSummaryProps {
  totalToday: number;
  waitingDoctor: number;
  waitingPayment: number;
  todayRevenue: number;
  isLoading?: boolean;
}

export function CashierKpiSummary({
  totalToday,
  waitingDoctor,
  waitingPayment,
  todayRevenue,
  isLoading,
}: CashierKpiSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs animate-pulse space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="w-7 h-7 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-6 w-24 bg-slate-200 rounded"></div>
            <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formattedRevenue = formatRupiah(todayRevenue);
  const revenueNumberPart = formattedRevenue.replace(/^Rp\s*/, '');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Antrian Hari Ini */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-teal-400 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Pasien
            </span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <Users className="w-4 h-4" weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 font-mono tracking-tight">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalToday.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-semibold text-slate-500">pasien</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-600 font-medium mt-2 block">
          Registrasi kunjungan hari ini
        </span>
      </div>

      {/* 2. Menunggu Dokter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-teal-400 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
              Antrean Poli
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Stethoscope className="w-4 h-4" weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 font-mono tracking-tight">
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-700 tabular-nums">
              {waitingDoctor.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-semibold text-indigo-500">antrean</span>
          </div>
        </div>
        <span className="text-[11px] text-indigo-700 font-medium mt-2 block">
          Menunggu panggilan dokter
        </span>
      </div>

      {/* 3. Menunggu Kasir */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-amber-400 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              Menunggu Kasir
            </span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
              <CreditCard className="w-4 h-4" weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 font-mono tracking-tight">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-800 tabular-nums">
              {waitingPayment.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-semibold text-amber-600">pasien</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {waitingPayment > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          )}
          <span className="text-[11px] text-amber-800 font-medium">
            {waitingPayment > 0 ? 'Perlu proses tagihan' : 'Antrean tagihan bersih'}
          </span>
        </div>
      </div>

      {/* 4. Kas Masuk Hari Ini */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card flex flex-col justify-between hover:border-emerald-400 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Penerimaan Kasir
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <Wallet className="w-4 h-4" weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 font-mono tracking-tight">
            <span className="text-xs font-bold text-emerald-700 select-none shrink-0">
              Rp
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 truncate tabular-nums" title={formattedRevenue}>
              {revenueNumberPart}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-800 font-medium mt-2 block">
          Penerimaan tunai &amp; transfer selesai
        </span>
      </div>
    </div>
  );
}
