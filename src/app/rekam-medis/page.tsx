'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope,
  CalendarBlank,
  ArrowClockwise,
  WarningCircle,
  PlusCircle,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Visit } from '@/types/database';
import { QueueList } from '@/components/rekam-medis/QueueList';
import { ExaminationForm } from '@/components/rekam-medis/ExaminationForm';
import { Button } from '@/components/ui';

export default function RekamMedisPage() {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          pasien:patients(*),
          dokter:doctors(*)
        `)
        .eq('tanggal_periksa', selectedDate)
        .order('nomor_antrian', { ascending: true });

      if (error) throw error;

      const visitList = (data as unknown as Visit[]) || [];
      setVisits(visitList);

      if (selectedVisit) {
        const found = visitList.find((v) => v.id === selectedVisit.id);
        if (found) {
          setSelectedVisit(found);
        } else if (visitList.length > 0) {
          setSelectedVisit(visitList[0]);
        } else {
          setSelectedVisit(null);
        }
      } else if (visitList.length > 0) {
        const firstWaiting = visitList.find(
          (v) => !v.kode_icd10 && !v.diagnosa_deskripsi && !v.terapi_obat
        );
        setSelectedVisit(firstWaiting || visitList[0]);
      } else {
        setSelectedVisit(null);
      }
    } catch (err) {
      console.error('Error fetching queue visits:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memuat antrean pasien dari database.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedVisit?.id]);

  useEffect(() => {
    fetchVisits();
  }, [selectedDate]);

  const handleSelectVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('exam-workstation')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSaveSuccess = (updatedVisit: Visit) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === updatedVisit.id ? updatedVisit : v))
    );
    setSelectedVisit(updatedVisit);
  };

  return (
    <div className="space-y-6 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl shrink-0">
            <Stethoscope className="w-6 h-6" weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Rekam Medis & Ruang Periksa Dokter
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemeriksaan klinis, diagnosa instan ICD-10, resep obat terstandarisasi, dan rekam medis lampau pasien
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs min-h-[44px] flex-1 sm:flex-initial">
            <CalendarBlank className="w-4 h-4 text-slate-400 shrink-0" weight="duotone" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Pilih tanggal periksa antrean"
              className="text-xs font-medium text-slate-800 outline-none bg-transparent cursor-pointer w-full"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(getTodayString())}
            className="text-xs font-semibold min-h-[44px]"
            disabled={selectedDate === getTodayString()}
          >
            Hari Ini
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchVisits}
            disabled={isLoading}
            className="text-xs min-h-[44px] min-w-[44px] p-2 flex items-center justify-center"
            title="Muat ulang antrean"
            aria-label="Muat ulang antrean pasien"
          >
            <ArrowClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} weight="bold" />
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WarningCircle className="w-4 h-4 shrink-0 text-rose-600" weight="duotone" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchVisits} className="text-xs">
            Coba Lagi
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 xl:col-span-4">
          <QueueList
            visits={visits}
            selectedVisitId={selectedVisit?.id || null}
            onSelectVisit={handleSelectVisit}
            isLoading={isLoading}
            onRefresh={fetchVisits}
          />
        </div>

        <div id="exam-workstation" className="lg:col-span-7 xl:col-span-8 space-y-6 scroll-mt-6">
          {selectedVisit ? (
            <ExaminationForm
              key={selectedVisit.id}
              visit={selectedVisit}
              onSaveSuccess={handleSaveSuccess}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Stethoscope className="w-8 h-8" weight="duotone" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Belum Ada Pasien yang Dipilih
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih salah satu pasien di daftar antrean sebelah kiri untuk membuka lembar pemeriksaan dokter, riwayat rekam medis terdahulu, dan penginputan diagnosa.
                </p>
              </div>

              {visits.length === 0 && !isLoading && (
                <div className="pt-2">
                  <Link href="/pendaftaran">
                    <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" weight="duotone" />} className="text-xs min-h-[44px]">
                      Daftarkan Pasien di Loket
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
