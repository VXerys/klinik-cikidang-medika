'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  IdentificationCard,
  Calendar,
  MapPin,
  ClockCounterClockwise,
  Stethoscope,
  WarningCircle,
  CheckCircle,
  X,
  ShieldCheck,
  Pill,
  ArrowRight,
  Phone,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Patient, Visit } from '@/types/database';

export interface PatientQuickProfileModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterVisit?: (patient: Patient) => void;
}

export function PatientQuickProfileModal({
  patient,
  isOpen,
  onClose,
  onRegisterVisit,
}: PatientQuickProfileModalProps) {
  const router = useRouter();
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);

  useEffect(() => {
    if (!isOpen || !patient) {
      setRecentVisits([]);
      return;
    }

    let isMounted = true;
    const fetchRecentVisits = async () => {
      setLoadingVisits(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('visits')
          .select(`
            *,
            dokter:doctors(nama)
          `)
          .eq('pasien_id', patient.id)
          .order('tanggal_periksa', { ascending: false })
          .limit(3);

        if (!error && data && isMounted) {
          setRecentVisits(data as unknown as Visit[]);
        }
      } catch (err) {
        console.error('Error fetching patient visits:', err);
      } finally {
        if (isMounted) setLoadingVisits(false);
      }
    };

    fetchRecentVisits();

    return () => {
      isMounted = false;
    };
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const isBpjs = Boolean(patient.no_bpjs && patient.no_bpjs.trim().length > 0);
  const hasAllergy =
    patient.riwayat_alergi &&
    patient.riwayat_alergi.trim() !== '' &&
    patient.riwayat_alergi.toLowerCase() !== 'tidak ada' &&
    patient.riwayat_alergi.toLowerCase() !== 'tidak' &&
    patient.riwayat_alergi.toLowerCase() !== '-';

  const handleGoToRegister = () => {
    onClose();
    if (onRegisterVisit) {
      onRegisterVisit(patient);
    } else {
      router.push(`/pendaftaran?pasien_id=${patient.id}&action=register`);
    }
  };

  const handleGoToMedicalRecord = () => {
    onClose();
    router.push(`/rekam-medis?pasien_id=${patient.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-dialog border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-popover"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Patient Identity */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-teal-50/70 to-slate-50/50 border-b border-slate-200/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-teal-600 to-teal-700 text-white font-extrabold text-base flex items-center justify-center shadow-btn-primary border border-teal-600 shrink-0">
              {patient.nama.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {patient.gelar ? `${patient.gelar} ` : ''}
                  {patient.nama}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 shrink-0">
                  {patient.no_rm}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isBpjs
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  {isBpjs ? 'BPJS Kesehatan' : 'Pasien Umum'}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-1 flex-wrap">
                <span>{patient.jenis_kelamin}</span>
                <span>•</span>
                <span>Usia {patient.usia || '-'} thn</span>
                <span>•</span>
                <span>Desa {patient.desa}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup ringkasan pasien"
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 tactile-btn shrink-0"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Modal Body: Demographics & Visits */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Key Demographic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-well">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                NIK KTP
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs block truncate mt-0.5">
                {patient.no_ktp || 'Belum Tercatat'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-well">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Nomor BPJS
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs block truncate mt-0.5">
                {patient.no_bpjs || 'Non-BPJS'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-well">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tanggal Lahir
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs block truncate mt-0.5">
                {patient.tanggal_lahir || '-'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-well">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                No. Telepon
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs block truncate mt-0.5">
                {patient.no_telepon || '-'}
              </span>
            </div>
          </div>

          {/* Alamat & Alergi Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" weight="duotone" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Domisili & Alamat
                </span>
                <p className="text-slate-700 font-medium text-xs mt-0.5 leading-snug">
                  {patient.alamat ? `${patient.alamat}, ` : ''}Desa {patient.desa}
                </p>
              </div>
            </div>

            <div
              className={`p-3 border rounded-2xl shadow-2xs flex items-start gap-2.5 ${
                hasAllergy
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              {hasAllergy ? (
                <WarningCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" weight="fill" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" weight="fill" />
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {hasAllergy ? 'Riwayat Alergi (Peringatan)' : 'Riwayat Alergi Obat'}
                </span>
                <p className="font-bold text-xs mt-0.5 truncate">
                  {patient.riwayat_alergi || 'Tidak Ada Alergi'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Medical Encounters (Riwayat Kunjungan Terakhir) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ClockCounterClockwise className="w-3.5 h-3.5 text-teal-600" weight="bold" />
                Riwayat Kunjungan Terakhir
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Maksimal 3 kunjungan terbaru
              </span>
            </div>

            {loadingVisits ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
                Memuat riwayat rekam medis...
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
                Belum ada riwayat kunjungan tercatat untuk pasien ini.
              </div>
            ) : (
              <div className="space-y-2">
                {recentVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-teal-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {v.tanggal_periksa}
                        </span>
                        {v.dokter?.nama && (
                          <span className="text-[11px] text-slate-600 font-medium">
                            • dr. {v.dokter.nama}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {v.kode_icd10 && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            ICD-10: {v.kode_icd10}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            v.status_pembayaran === 'Lunas' ||
                            v.status_pembayaran === 'Ditanggung BPJS'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {v.status_pembayaran}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      {v.diagnosa_deskripsi && (
                        <p className="font-bold text-slate-900">
                          Diagnosa: <span className="font-normal">{v.diagnosa_deskripsi}</span>
                        </p>
                      )}
                      {v.keluhan_anamnesa && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-700">Anamnesa:</span>{' '}
                          {v.keluhan_anamnesa}
                        </p>
                      )}
                      {v.terapi_obat && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-700">Terapi:</span>{' '}
                          {v.terapi_obat}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Action CTAs */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition tactile-btn min-h-[40px]"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGoToMedicalRecord}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-teal-700 hover:bg-teal-50 border border-teal-200 shadow-btn-secondary transition tactile-btn flex items-center gap-1.5 min-h-[40px]"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" weight="duotone" />
              <span>Buka ke Rekam Medis</span>
            </button>

            <button
              type="button"
              onClick={handleGoToRegister}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-b from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-btn-primary border border-teal-700/80 transition tactile-btn flex items-center gap-1.5 min-h-[40px]"
            >
              <span>+ Daftarkan Kunjungan</span>
              <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
