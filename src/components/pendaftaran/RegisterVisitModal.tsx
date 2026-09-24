'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  ClipboardText,
  WarningCircle,
  ShieldCheck,
  Stethoscope,
  User,
  MapPin,
  Ticket,
  Info,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Patient, Doctor, Visit } from '@/types/database';
import { DEFAULT_TARIFFS } from '@/constants/clinic';
import { Modal, Button, Select, Badge } from '@/components/ui';

const visitSchema = z.object({
  dokterId: z.string().trim().min(1, 'Pilih dokter pemeriksa terlebih dahulu.'),
  nomorAntrian: z.string().trim().min(1, 'Nomor antrean wajib ada.'),
  jenisPasien: z.enum(['BPJS', 'UMUM']),
  keluhan: z.string().trim().optional().nullable(),
});

export interface RegisterVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onVisitRegistered: (visit: Visit) => void;
}

export function RegisterVisitModal({
  isOpen,
  onClose,
  patient,
  onVisitRegistered,
}: RegisterVisitModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [nomorAntrian, setNomorAntrian] = useState<string>('1');
  const [keluhan, setKeluhan] = useState('');
  const [jenisPasien, setJenisPasien] = useState<'BPJS' | 'UMUM'>('UMUM');

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !patient) {
      setErrorMessage(null);
      setFieldErrors({});
      return;
    }

    setErrorMessage(null);
    setFieldErrors({});
    setKeluhan('');

    if (patient.no_bpjs && patient.no_bpjs.trim().length > 0) {
      setJenisPasien('BPJS');
    } else {
      setJenisPasien('UMUM');
    }

    const initData = async () => {
      setIsLoadingDoctors(true);
      try {
        const supabase = createClient();

        const { data: docData, error: docError } = await supabase
          .from('doctors')
          .select('id, nama, spesialisasi, aktif')
          .eq('aktif', true)
          .order('nama', { ascending: true });

        if (docError) throw docError;
        setDoctors(docData || []);
        if (docData && docData.length > 0) {
          setSelectedDoctorId(docData[0].id);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('tanggal_periksa', todayStr);

        if (countError) throw countError;
        setNomorAntrian(String((count || 0) + 1));
      } catch (err) {
        console.error('Error initializing visit modal:', err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    initData();
  }, [isOpen, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setErrorMessage(null);
    setFieldErrors({});

    const parseResult = visitSchema.safeParse({
      dokterId: selectedDoctorId,
      nomorAntrian,
      jenisPasien,
      keluhan: keluhan || null,
    });

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      setErrorMessage(parseResult.error.issues[0]?.message || 'Periksa kembali formulir pendaftaran.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const validData = parseResult.data;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const jamStr = now.toTimeString().split(' ')[0];
      const bulanStr = now.toLocaleString('id-ID', { month: 'long' });

      const statusAwal = 'Menunggu Dokter';
      const initialTariff = validData.jenisPasien === 'BPJS' ? 0 : DEFAULT_TARIFFS.umum;

      const newVisit = {
        nomor_antrian: validData.nomorAntrian,
        pasien_id: patient.id,
        dokter_id: validData.dokterId,
        tanggal_periksa: todayStr,
        jam_periksa: jamStr,
        bulan: bulanStr,
        keluhan_anamnesa: validData.keluhan || null,
        jenis_pasien: validData.jenisPasien,
        biaya_periksa: initialTariff,
        pendapatan_lain: 0,
        keterangan_pendapatan: null,
        jenis_pembayaran: null,
        status_pembayaran: statusAwal,
      };

      const { data, error } = await supabase
        .from('visits')
        .insert(newVisit)
        .select(`
          *,
          pasien:patients(*),
          dokter:doctors(*)
        `)
        .single();

      if (error) throw error;

      if (data) {
        onVisitRegistered(data as unknown as Visit);
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan kunjungan pasien.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !patient) return null;

  const patientFullName = [patient.gelar, patient.nama].filter(Boolean).join(' ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pendaftaran Kunjungan Poli"
      description={
        <span>
          Nomor Antrian Hari Ini: <span className="font-bold text-blue-600 font-mono">#{nomorAntrian}</span>
        </span>
      }
      icon={
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <ClipboardText className="w-5 h-5 text-emerald-700" weight="duotone" />
        </div>
      }
      maxWidth="lg"
    >
      <div className="shrink-0 px-4 sm:px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            <User className="w-4 h-4 text-white" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">{patientFullName}</span>
              <Badge variant="umum" className="font-mono">
                {patient.no_rm}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" weight="duotone" />
                {patient.desa}
              </span>
              <span>•</span>
              <span>{patient.jenis_kelamin}</span>
              {patient.usia !== undefined && patient.usia !== null && (
                <>
                  <span>•</span>
                  <span>{patient.usia} thn</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          {patient.no_bpjs ? (
            <Badge variant="bpjs" size="md">
              <ShieldCheck className="w-3.5 h-3.5" weight="duotone" />
              BPJS: {patient.no_bpjs}
            </Badge>
          ) : (
            <Badge variant="default" size="md">
              Pasien Umum
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" weight="duotone" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Dokter Pemeriksa"
                requiredIndicator
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  if (fieldErrors.dokterId) setFieldErrors((prev) => ({ ...prev, dokterId: '' }));
                }}
                disabled={isLoadingDoctors}
                required
                options={doctors.map((d) => ({
                  value: d.id,
                  label: `${d.nama} ${d.spesialisasi ? `(${d.spesialisasi})` : ''}`,
                }))}
              />
              {fieldErrors.dokterId && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.dokterId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Pasien <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJenisPasien('BPJS')}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                    jenisPasien === 'BPJS'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" weight="duotone" />
                  BPJS
                </button>
                <button
                  type="button"
                  onClick={() => setJenisPasien('UMUM')}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                    jenisPasien === 'UMUM'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" weight="duotone" />
                  UMUM
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keluhan Utama / Anamnesa Awal
            </label>
            <textarea
              rows={3}
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              placeholder="Contoh: Demam tinggi sejak 2 hari yang lalu disertai batuk kering dan pusing"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" weight="duotone" />
            <div>
              <p className="font-semibold text-blue-950">Alur Pelayanan Kunjungan:</p>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Setelah pendaftaran, nomor antrean poli akan diterbitkan untuk pasien. Rincian tindakan medis dan resep obat akan dicatat dokter di ruang periksa, kemudian pelunasan diselesaikan di loket kasir & farmasi.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:px-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Ticket className="w-4 h-4" weight="duotone" />}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Daftarkan & Ambil Antrean
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterVisitModal;
