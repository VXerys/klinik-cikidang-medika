'use client';

import React from 'react';
import { Buildings, MapPin, ShieldCheck, User } from '@phosphor-icons/react';

export interface VillageStat {
  village: string;
  count: number;
  percentage: number;
}

interface VillageDistributionCardProps {
  villages: VillageStat[];
  totalPatients: number;
  bpjsCount: number;
  umumCount: number;
  isLoading?: boolean;
}

export function VillageDistributionCard({
  villages,
  totalPatients,
  bpjsCount,
  umumCount,
  isLoading,
}: VillageDistributionCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 rounded"></div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-10 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalAssurance = bpjsCount + umumCount;
  const bpjsPct = totalAssurance > 0 ? (bpjsCount / totalAssurance) * 100 : 0;
  const umumPct = totalAssurance > 0 ? (umumCount / totalAssurance) * 100 : 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Buildings className="w-5 h-5 text-blue-600" weight="duotone" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Asal Pasien per Wilayah & Jaminan
              </h2>
              <p className="text-[11px] text-slate-500">
                Sebaran domisili desa dan proporsi penjamin
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
            {totalPatients.toLocaleString('id-ID')} pasien
          </span>
        </div>

        {/* Rasio Jaminan Pasien */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-teal-600" weight="duotone" />
              <span>BPJS: {bpjsCount.toLocaleString('id-ID')} ({bpjsPct.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <User className="w-4 h-4 text-blue-600" weight="duotone" />
              <span>Umum: {umumCount.toLocaleString('id-ID')} ({umumPct.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
            <div
              className="bg-teal-600 h-2 transition-all duration-300"
              style={{ width: `${bpjsPct}%` }}
              title={`BPJS ${bpjsPct.toFixed(1)}%`}
            />
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${umumPct}%` }}
              title={`Umum ${umumPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* List Wilayah Desa */}
        {villages.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <MapPin className="w-8 h-8 mx-auto text-slate-300" weight="duotone" />
            <p className="text-xs">Tidak ada data wilayah pada periode terpilih</p>
          </div>
        ) : (
          <div className="space-y-2">
            {villages.slice(0, 6).map((v) => (
              <div
                key={v.village}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" weight="duotone" />
                  <span className="font-semibold text-slate-700 truncate">
                    Desa {v.village}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 font-mono">
                  <span className="font-bold text-slate-900">
                    {v.count.toLocaleString('id-ID')}
                  </span>
                  <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-semibold text-[11px] w-12 text-center">
                    {v.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
