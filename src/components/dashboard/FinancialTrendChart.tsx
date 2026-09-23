'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendUp,
  CalendarBlank,
  ChartLineUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Scales,
} from '@phosphor-icons/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatRupiah } from '@/lib/utils';

export interface FinancialPoint {
  date?: string;
  month?: string;
  label: string;
  cashIn: number;
  cashOut: number;
  netIncome: number;
}

export type DailyFinancialPoint = FinancialPoint & { date: string };
export type MonthlyFinancialPoint = FinancialPoint & { month: string };

interface FinancialTrendChartProps {
  dailyData: DailyFinancialPoint[];
  monthlyData: MonthlyFinancialPoint[];
  isLoading?: boolean;
}

function formatCompactRupiah(num: number): string {
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}jt`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(0)}rb`;
  }
  return String(num);
}

export function FinancialTrendChart({
  dailyData,
  monthlyData,
  isLoading,
}: FinancialTrendChartProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentData: FinancialPoint[] = viewMode === 'daily' ? dailyData : monthlyData;

  const totalIn = currentData.reduce((acc, curr) => acc + curr.cashIn, 0);
  const totalOut = currentData.reduce((acc, curr) => acc + curr.cashOut, 0);
  const netTotal = totalIn - totalOut;

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
            <ChartLineUp weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tren Arus Kas &amp; Finansial Klinik
            </h3>
            <p className="text-[11px] text-slate-500">
              Perbandingan pendapatan kasir &amp; kapitasi vs pengeluaran operasional
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition min-h-[44px] flex items-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarBlank weight="duotone" className="w-4 h-4" />
            <span>Harian (14 Hari)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition min-h-[44px] flex items-center gap-1.5 ${
              viewMode === 'monthly'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendUp weight="duotone" className="w-4 h-4" />
            <span>Bulanan (12 Bulan)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
              <ArrowUpRight weight="bold" className="w-3.5 h-3.5 text-emerald-600" />
              Kas Masuk (Omzet + Kapitasi)
            </span>
            <div className="text-sm font-bold font-mono text-emerald-900 mt-0.5">
              {formatRupiah(totalIn)}
            </div>
          </div>
        </div>

        <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-rose-800 flex items-center gap-1">
              <ArrowDownRight weight="bold" className="w-3.5 h-3.5 text-rose-600" />
              Beban &amp; Pengeluaran
            </span>
            <div className="text-sm font-bold font-mono text-rose-900 mt-0.5">
              {formatRupiah(totalOut)}
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-blue-800 flex items-center gap-1">
              <Scales weight="duotone" className="w-3.5 h-3.5 text-blue-600" />
              Surplus Arus Kas Bersih
            </span>
            <div
              className={`text-sm font-bold font-mono mt-0.5 ${
                netTotal >= 0 ? 'text-blue-900' : 'text-rose-700'
              }`}
            >
              {formatRupiah(netTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Spline Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-1">
        {isMounted && currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompactRupiah}
              />
              <Tooltip content={<CustomFinancialTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'cashIn') return 'Kas Masuk (Omzet & Kapitasi)';
                  if (value === 'cashOut') return 'Pengeluaran (Operasional & Obat)';
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="cashIn"
                name="cashIn"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCashIn)"
              />
              <Area
                type="monotone"
                dataKey="cashOut"
                name="cashOut"
                stroke="#e11d48"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCashOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Belum ada catatan transaksi arus kas pada periode ini
          </div>
        )}
      </div>
    </div>
  );
}

function CustomFinancialTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const cashIn = payload.find((p: any) => p.dataKey === 'cashIn')?.value || 0;
    const cashOut = payload.find((p: any) => p.dataKey === 'cashOut')?.value || 0;
    const net = cashIn - cashOut;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[200px]">
        <div className="font-bold border-b border-slate-800 pb-1.5 text-slate-200">
          Periode: {label}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-emerald-400">
            <span>Kas Masuk:</span>
            <span className="font-mono font-bold">{formatRupiah(cashIn)}</span>
          </div>
          <div className="flex justify-between items-center text-rose-400">
            <span>Kas Keluar:</span>
            <span className="font-mono font-bold">{formatRupiah(cashOut)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 font-semibold text-slate-300">
            <span>Selisih Bersih:</span>
            <span
              className={`font-mono font-bold ${
                net >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {formatRupiah(net)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
