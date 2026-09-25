'use client';

import React from 'react';
import { Heartbeat, Stethoscope } from '@phosphor-icons/react';

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
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card-double flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Heartbeat className="w-4 h-4 text-blue-700" weight="duotone" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                10 Morbiditas Terbanyak (ICD-10)
              </h2>
              <p className="text-[11px] text-slate-500">
                Penyakit paling sering didiagnosa pada rekam medis
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
            {totalDiagnoses.toLocaleString('id-ID')} kasus
          </span>
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Stethoscope className="w-8 h-8 mx-auto text-slate-300" weight="duotone" />
            <p className="text-xs">Tidak ada data diagnosa pada periode terpilih</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.slice(0, 10).map((item, index) => {
              const barWidth = Math.min(Math.round((item.count / maxCount) * 100), 100);

              return (
                <div key={item.code || index} className="group p-2 rounded-xl hover:bg-slate-50/80 transition-colors space-y-1.5 border border-transparent hover:border-slate-200/60">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 font-bold text-[10px] shrink-0 font-mono">
                        {index + 1}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.2 rounded-md shrink-0">
                        {item.code}
                      </span>
                      <span
                        className="font-semibold text-slate-800 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.count.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-slate-500 w-11 text-right font-medium">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Proportion Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
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
