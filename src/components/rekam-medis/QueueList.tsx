'use client';

import React, { useState } from 'react';
import { Users, Search, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Visit } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface QueueListProps {
  visits: Visit[];
  selectedVisitId: string | null;
  onSelectVisit: (visit: Visit) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function QueueList({
  visits,
  selectedVisitId,
  onSelectVisit,
  isLoading,
  onRefresh,
}: QueueListProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'done'>('waiting');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to determine if a visit is completed
  const isVisitDone = (v: Visit) => Boolean(v.kode_icd10 || v.diagnosa_deskripsi || v.terapi_obat);

  // Filter visits
  const filteredVisits = visits.filter((v) => {
    // Status filter
    const done = isVisitDone(v);
    if (filterStatus === 'waiting' && done) return false;
    if (filterStatus === 'done' && !done) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = v.pasien?.nama?.toLowerCase().includes(q) || false;
      const rmMatch = v.pasien?.no_rm?.toLowerCase().includes(q) || false;
      const desaMatch = v.pasien?.desa?.toLowerCase().includes(q) || false;
      return nameMatch || rmMatch || desaMatch;
    }

    return true;
  });

  const waitingCount = visits.filter((v) => !isVisitDone(v)).length;
  const doneCount = visits.filter((v) => isVisitDone(v)).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Antrean Ruang Periksa
              </h2>
              <p className="text-[11px] text-slate-500">
                {visits.length} pasien terdaftar hari ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            title="Muat ulang antrean"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin text-blue-600')} />
          </button>
        </div>

        {/* Search in Queue */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau No RM..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setFilterStatus('waiting')}
            className={cn(
              'flex-1 py-1 text-center rounded-md transition flex items-center justify-center gap-1',
              filterStatus === 'waiting'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>Menunggu</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
              {waitingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('done')}
            className={cn(
              'flex-1 py-1 text-center rounded-md transition flex items-center justify-center gap-1',
              filterStatus === 'done'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>Selesai</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              {doneCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={cn(
              'flex-1 py-1 text-center rounded-md transition',
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Semua ({visits.length})
          </button>
        </div>
      </div>

      {/* Queue List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500" />
            <p className="text-xs">Memuat antrean pasien...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada pasien dalam antrean</p>
            <p className="text-[11px] text-slate-400">
              {filterStatus === 'waiting'
                ? 'Seluruh pasien yang terdaftar sudah selesai diperiksa.'
                : 'Belum ada pendaftaran pasien yang sesuai filter.'}
            </p>
          </div>
        ) : (
          filteredVisits.map((visit) => {
            const isSelected = selectedVisitId === visit.id;
            const done = isVisitDone(visit);
            const fullName = visit.pasien
              ? [visit.pasien.gelar, visit.pasien.nama].filter(Boolean).join(' ')
              : 'Pasien';

            return (
              <div
                key={visit.id}
                onClick={() => onSelectVisit(visit)}
                className={cn(
                  'p-3 rounded-xl border transition cursor-pointer select-none space-y-1.5',
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded shrink-0">
                      #{visit.nomor_antrian || '-'}
                    </span>
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {fullName}
                    </span>
                  </div>

                  {done ? (
                    <Badge variant="lunas" className="shrink-0 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Selesai
                    </Badge>
                  ) : (
                    <Badge variant="pending" className="shrink-0 text-[10px]">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Menunggu
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-blue-700 font-semibold text-[10px]">
                      {visit.pasien?.no_rm}
                    </span>
                    <span>•</span>
                    <span>{visit.pasien?.desa || '-'}</span>
                    {visit.pasien?.usia !== undefined && (
                      <>
                        <span>•</span>
                        <span>{visit.pasien.usia} th</span>
                      </>
                    )}
                  </div>

                  <Badge variant={visit.jenis_pasien === 'BPJS' ? 'bpjs' : 'umum'}>
                    {visit.jenis_pasien}
                  </Badge>
                </div>

                {/* Complaint preview */}
                {visit.keluhan_anamnesa && (
                  <p className="text-[10px] text-slate-600 line-clamp-1 bg-white/80 p-1 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">Keluhan: </span>
                    {visit.keluhan_anamnesa}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default QueueList;
