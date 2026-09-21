'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  BarChart2,
  Users,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export interface TrendPoint {
  date?: string;
  month?: string;
  label: string;
  bpjs: number;
  umum: number;
  total: number;
}

export type DailyTrendPoint = TrendPoint & { date: string };
export type MonthlyTrendPoint = TrendPoint & { month: string };

interface VisitTrendChartProps {
  dailyData: DailyTrendPoint[];
  monthlyData: MonthlyTrendPoint[];
  isLoading?: boolean;
}

export function VisitTrendChart({
  dailyData,
  monthlyData,
  isLoading,
}: VisitTrendChartProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentData: TrendPoint[] = viewMode === 'daily' ? dailyData : monthlyData;

  // Find peak point
  const peakPoint =
    currentData.length > 0
      ? currentData.reduce((max, p) => (p.total > max.total ? p : max), currentData[0])
      : null;

  const totalPeriodVisits = currentData.reduce((acc, curr) => acc + curr.total, 0);
  const totalBpjsVisits = currentData.reduce((acc, curr) => acc + curr.bpjs, 0);
  const totalUmumVisits = currentData.reduce((acc, curr) => acc + curr.umum, 0);

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-8 w-40 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tren Volume Kunjungan Pasien
            </h3>
            <p className="text-[11px] text-slate-500">
              Analisis beban kunjungan klinik dan perbandingan BPJS vs Pasien Umum
            </p>
          </div>
        </div>

        {/* Dual View Toggle Buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[36px] ${
              viewMode === 'daily'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            14 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[36px] ${
              viewMode === 'monthly'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            12 Bulan Berjalan
          </button>
        </div>
      </div>

      {/* Summary Micro-Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium block">Total Periode Ini</span>
          <span className="text-sm font-bold text-slate-900 font-mono">
            {totalPeriodVisits.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 block">kunjungan</span>
        </div>

        <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
          <span className="text-[10px] text-emerald-700 font-medium block">Pasien BPJS</span>
          <span className="text-sm font-bold text-emerald-800 font-mono">
            {totalBpjsVisits.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-emerald-600 block">
            {totalPeriodVisits > 0 ? ((totalBpjsVisits / totalPeriodVisits) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
          <span className="text-[10px] text-blue-700 font-medium block">Pasien Umum</span>
          <span className="text-sm font-bold text-blue-800 font-mono">
            {totalUmumVisits.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-blue-600 block">
            {totalPeriodVisits > 0 ? ((totalUmumVisits / totalPeriodVisits) * 100).toFixed(1) : 0}%
          </span>
        </div>

        {peakPoint && (
          <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
            <span className="text-[10px] text-amber-700 font-medium block">Puncak Pasien (Peak)</span>
            <span className="text-sm font-bold text-amber-900 font-mono">
              {peakPoint.total} Pasien
            </span>
            <span className="text-[10px] text-amber-700 block truncate">
              {peakPoint.label}
            </span>
          </div>
        )}
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full h-72 pt-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
                angle={viewMode === 'daily' ? -45 : 0}
                textAnchor={viewMode === 'daily' ? 'end' : 'middle'}
                height={viewMode === 'daily' ? 45 : 30}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const bpjsVal = (payload[0]?.value as number) || 0;
                    const umumVal = (payload[1]?.value as number) || 0;
                    const totVal = bpjsVal + umumVal;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {label}
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400">
                          <span>BPJS:</span>
                          <span className="font-mono font-bold">{bpjsVal} pasien</span>
                        </div>
                        <div className="flex justify-between gap-4 text-blue-400">
                          <span>Umum:</span>
                          <span className="font-mono font-bold">{umumVal} pasien</span>
                        </div>
                        <div className="flex justify-between gap-4 font-bold text-white border-t border-slate-700 pt-1">
                          <span>Total:</span>
                          <span className="font-mono">{totVal} pasien</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                dataKey="bpjs"
                name="Pasien BPJS"
                stackId="visits"
                fill="#10B981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="umum"
                name="Pasien Umum"
                stackId="visits"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            Menyiapkan grafik interaktif...
          </div>
        )}
      </div>
    </div>
  );
}
