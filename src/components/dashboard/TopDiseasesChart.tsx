'use client';

import React from 'react';
import { Activity, Stethoscope } from 'lucide-react';

export interface DiseaseStat {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

interface TopDiseasesChartProps {
  data: DiseaseStat[];
  totalDiagnoses: number;
  isLoading?: boolean;
}

export function TopDiseasesChart({
  data,
  totalDiagnoses,
  isLoading,
}: TopDiseasesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 rounded"></div>
        <div className="space-y-3 pt-2">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-40 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                10 Penyakit Terbanyak (ICD-10)
              </h2>
              <p className="text-[11px] text-slate-500">
                Morbiditas penyakit berdasar rekam medis pasien
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
            {totalDiagnoses.toLocaleString('id-ID')} kasus
          </span>
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Tidak ada data diagnosa pada periode terpilih</p>
          </div>
        ) : (
          <div className="space-y-3.5 pt-1">
            {data.slice(0, 10).map((item, index) => {
              const barWidth = Math.min(Math.round((item.count / maxCount) * 100), 100);

              return (
                <div key={item.code || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] shrink-0 font-mono">
                        {index + 1}
                      </span>
                      <span
                        className="font-medium text-slate-800 truncate"
                        title={`[${item.code}] ${item.name}`}
                      >
                        <span className="font-mono font-bold text-teal-700">[{item.code}]</span>{' '}
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-bold text-slate-900">
                        {item.count.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-slate-400 w-11 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
