'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, User, ChevronRight } from 'lucide-react';
import type { PostCare } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface PostCareAgendaProps {
  records: PostCare[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function PostCareAgenda({ records, onRefresh, isLoading }: PostCareAgendaProps) {
  const [filterTab, setFilterTab] = useState<'today' | 'overdue' | 'upcoming'>('today');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayList = records.filter(
    (r) => r.tanggal_kontrol_berikutnya === todayStr && r.status_kontrol !== 'Sudah Kontrol'
  );
  const overdueList = records.filter(
    (r) => r.tanggal_kontrol_berikutnya < todayStr && r.status_kontrol !== 'Sudah Kontrol'
  );
  const upcomingList = records.filter(
    (r) => r.tanggal_kontrol_berikutnya > todayStr && r.status_kontrol !== 'Sudah Kontrol'
  );
  const completedList = records.filter((r) => r.status_kontrol === 'Sudah Kontrol');

  const handleMarkComplete = async (id: string) => {
    setUpdatingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('post_cares')
        .update({ status_kontrol: 'Sudah Kontrol' })
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error updating post-care status:', err);
      alert('Gagal memperbarui status kontrol');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeList =
    filterTab === 'today'
      ? todayList
      : filterTab === 'overdue'
      ? overdueList
      : upcomingList;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilterTab('today')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[44px] transition ${
            filterTab === 'today'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Jadwal Hari Ini ({todayList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('overdue')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[44px] transition ${
            filterTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Terlewat / Overdue ({overdueList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('upcoming')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[44px] transition ${
            filterTab === 'upcoming'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Mendatang ({upcomingList.length})</span>
        </button>
      </div>

      {/* List Items */}
      {activeList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
          <p className="text-xs font-semibold">Tidak ada agenda kontrol pada kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.pasien?.nama || 'Pasien Pos-Rawat'}
                  </h4>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    RM: {item.pasien?.no_rm}
                  </span>
                  <span className="text-[11px] text-slate-500">Desa {item.pasien?.desa}</span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Jadwal Kontrol: </span>
                  <strong
                    className={
                      filterTab === 'overdue'
                        ? 'text-rose-600'
                        : filterTab === 'today'
                        ? 'text-blue-600'
                        : 'text-slate-800'
                    }
                  >
                    {new Date(item.tanggal_kontrol_berikutnya).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>

                {item.kondisi_terakhir && (
                  <p className="text-[11px] text-slate-500 italic">
                    Kondisi: {item.kondisi_terakhir}
                  </p>
                )}
                {item.keluhan_lanjutan && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                    Keluhan: {item.keluhan_lanjutan}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleMarkComplete(item.id)}
                  disabled={updatingId === item.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updatingId === item.id ? 'Memproses...' : 'Tandai Sudah Kontrol'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
