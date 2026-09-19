'use client';

import React, { useState, useEffect } from 'react';
import { History, Calendar, Stethoscope, Pill, AlertCircle, Loader2, ChevronRight, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Visit } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDateIndo } from '@/lib/utils';

export interface PatientHistoryTimelineProps {
  patientId: string | null;
  currentVisitId: string | null;
  className?: string;
}

export function PatientHistoryTimeline({
  patientId,
  currentVisitId,
  className,
}: PatientHistoryTimelineProps) {
  const [history, setHistory] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const supabase = createClient();
        let query = supabase
          .from('visits')
          .select(`
            id,
            tanggal_periksa,
            jam_periksa,
            keluhan_anamnesa,
            kode_icd10,
            diagnosa_deskripsi,
            terapi_obat,
            tindakan,
            keterangan_tindakan,
            lab,
            lab_hasil,
            jenis_pasien,
            dokter:doctors(nama)
          `)
          .eq('pasien_id', patientId)
          .order('tanggal_periksa', { ascending: false })
          .limit(15);

        if (currentVisitId) {
          query = query.neq('id', currentVisitId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setHistory((data as unknown as Visit[]) || []);
      } catch (err) {
        console.error('Error fetching patient history:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat riwayat medis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [patientId, currentVisitId]);

  if (!patientId) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs', className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Kunjungan & Diagnosa Lampau
            </h3>
            <p className="text-[11px] text-slate-500">
              Catatan rekam medis pasien dari kunjungan sebelumnya
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          {history.length} Riwayat Ditemukan
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs">Memuat rekam medis lampau...</p>
        </div>
      ) : errorMessage ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
          <Activity className="w-6 h-6 mx-auto text-slate-400" />
          <p className="text-xs font-semibold text-slate-700">Kunjungan Pertama Pasien Baru</p>
          <p className="text-[11px] text-slate-400">
            Belum ada rekam medis sebelumnya untuk pasien ini di database klinik.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {history.map((visit) => (
            <div
              key={visit.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 text-xs"
            >
              {/* Visit Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateIndo(visit.tanggal_periksa)}
                  </span>
                  {visit.jam_periksa && (
                    <span className="text-[10px] text-slate-400">
                      pukul {visit.jam_periksa}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-600 font-medium">
                    Dokter: <span className="text-slate-800 font-semibold">{visit.dokter?.nama || '-'}</span>
                  </span>
                  <Badge variant={visit.jenis_pasien === 'BPJS' ? 'bpjs' : 'umum'}>
                    {visit.jenis_pasien}
                  </Badge>
                </div>
              </div>

              {/* Diagnosis */}
              {(visit.kode_icd10 || visit.diagnosa_deskripsi) && (
                <div className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-slate-100">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 text-[11px]">Diagnosa: </span>
                    {visit.kode_icd10 && (
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 mr-1.5 text-[10px]">
                        {visit.kode_icd10}
                      </span>
                    )}
                    <span className="text-slate-700 text-xs font-medium">
                      {visit.diagnosa_deskripsi || '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* Complaint */}
              {visit.keluhan_anamnesa && (
                <div className="text-[11px] text-slate-600 pl-1">
                  <span className="font-semibold text-slate-700">Anamnesa/Keluhan: </span>
                  {visit.keluhan_anamnesa}
                </div>
              )}

              {/* Medication Prescription */}
              {visit.terapi_obat && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900">Terapi Obat: </span>
                    <span className="font-mono text-emerald-800">{visit.terapi_obat}</span>
                  </div>
                </div>
              )}

              {/* Procedure / Lab if any */}
              {visit.tindakan && (
                <div className="text-[10px] text-slate-500 pl-1">
                  <span className="font-semibold text-slate-600">Tindakan: </span>
                  {visit.tindakan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientHistoryTimeline;
