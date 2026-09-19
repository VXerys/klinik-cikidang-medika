'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertCircle, ShieldCheck, Stethoscope, User, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Patient, Doctor, Visit } from '@/types/database';
import { DEFAULT_TARIFFS, METODE_PEMBAYARAN_OPTIONS } from '@/constants/clinic';
import { Modal, Button, Input, Select, Badge } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';

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
  const [biayaPeriksa, setBiayaPeriksa] = useState<number>(DEFAULT_TARIFFS.umum);
  const [pendapatanLain, setPendapatanLain] = useState<number>(0);
  const [keteranganPendapatan, setKeteranganPendapatan] = useState('');
  const [jenisPembayaran, setJenisPembayaran] = useState<'Tunai' | 'TF'>('Tunai');
  const [statusPembayaran] = useState<'Lunas' | 'Pending'>('Lunas');

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form when modal opens with a patient
  useEffect(() => {
    if (!isOpen || !patient) {
      setErrorMessage(null);
      return;
    }

    setErrorMessage(null);
    setKeluhan('');
    setPendapatanLain(0);
    setKeteranganPendapatan('');
    setJenisPembayaran('Tunai');

    // Default to BPJS if patient already has BPJS number, otherwise UMUM
    if (patient.no_bpjs && patient.no_bpjs.trim().length > 0) {
      setJenisPasien('BPJS');
      setBiayaPeriksa(DEFAULT_TARIFFS.bpjs);
    } else {
      setJenisPasien('UMUM');
      setBiayaPeriksa(DEFAULT_TARIFFS.umum);
    }

    const initData = async () => {
      setIsLoadingDoctors(true);
      try {
        const supabase = createClient();

        // 1. Fetch active doctors
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

        // 2. Fetch today's count to compute next queue number
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

  // Handle change of patient type (BPJS vs UMUM)
  const handleJenisPasienChange = (type: 'BPJS' | 'UMUM') => {
    setJenisPasien(type);
    if (type === 'BPJS') {
      setBiayaPeriksa(DEFAULT_TARIFFS.bpjs);
    } else {
      setBiayaPeriksa(DEFAULT_TARIFFS.umum);
    }
  };

  const totalBiaya = (jenisPasien === 'BPJS' ? 0 : Number(biayaPeriksa || 0)) + Number(pendapatanLain || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setErrorMessage(null);

    if (!selectedDoctorId) {
      setErrorMessage('Pilih dokter pemeriksa terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const bulanStr = now.toLocaleString('id-ID', { month: 'long' });

      const newVisit = {
        nomor_antrian: nomorAntrian,
        pasien_id: patient.id,
        dokter_id: selectedDoctorId,
        tanggal_periksa: todayStr,
        jam_periksa: jamStr,
        bulan: bulanStr,
        keluhan_anamnesa: keluhan.trim() || null,
        jenis_pasien: jenisPasien,
        biaya_periksa: jenisPasien === 'BPJS' ? 0 : Number(biayaPeriksa),
        pendapatan_lain: Number(pendapatanLain || 0),
        keterangan_pendapatan: keteranganPendapatan.trim() || null,
        jenis_pembayaran: jenisPembayaran,
        status_pembayaran: statusPembayaran,
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
      title="Pendaftaran Kunjungan & Kasir"
      description={
        <span>
          Nomor Antrian Hari Ini: <span className="font-bold text-blue-600">#{nomorAntrian}</span>
        </span>
      }
      icon={
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <ClipboardCheck className="w-5 h-5" />
        </div>
      }
      maxWidth="lg"
    >
      {/* Selected Patient Identity Banner */}
      <div className="px-4 sm:px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            <User className="w-4 h-4" />
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
                <MapPin className="w-3 h-3 text-slate-400" />
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
              <ShieldCheck className="w-3.5 h-3.5" />
              BPJS: {patient.no_bpjs}
            </Badge>
          ) : (
            <Badge variant="default" size="md">
              Pasien Umum
            </Badge>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dokter Pemeriksa */}
          <Select
            label="Dokter Pemeriksa"
            requiredIndicator
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            disabled={isLoadingDoctors}
            required
            options={doctors.map((d) => ({
              value: d.id,
              label: `${d.nama} ${d.spesialisasi ? `(${d.spesialisasi})` : ''}`,
            }))}
          />

          {/* Jenis Pasien (BPJS vs UMUM) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Pasien <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleJenisPasienChange('BPJS')}
                className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  jenisPasien === 'BPJS'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                BPJS
              </button>
              <button
                type="button"
                onClick={() => handleJenisPasienChange('UMUM')}
                className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  jenisPasien === 'UMUM'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                UMUM
              </button>
            </div>
          </div>
        </div>

        {/* Keluhan / Anamnesa Awal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keluhan Utama / Anamnesa Awal
          </label>
          <textarea
            rows={2}
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Contoh: Demam tinggi sejak 2 hari yang lalu disertai batuk kering"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Billing & Kasir Section */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rincian Pembayaran & Kasir
            </h3>
            {jenisPasien === 'BPJS' && (
              <Badge variant="bpjs">Ditanggung Kapitasi BPJS (Rp 0)</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Biaya Pemeriksaan */}
            <Input
              type="number"
              min="0"
              step="1000"
              label="Biaya Pemeriksaan Pokok"
              leftElement={<span className="font-bold text-xs text-slate-500">Rp</span>}
              value={biayaPeriksa}
              onChange={(e) => setBiayaPeriksa(Number(e.target.value))}
              disabled={jenisPasien === 'BPJS'}
              className="font-mono font-bold"
            />

            {/* Pendapatan Lain */}
            <Input
              type="number"
              min="0"
              step="1000"
              label="Biaya Tambahan / Tindakan Lain (Opsional)"
              leftElement={<span className="font-bold text-xs text-slate-500">Rp</span>}
              value={pendapatanLain}
              onChange={(e) => setPendapatanLain(Number(e.target.value))}
              placeholder="0"
              className="font-mono font-bold"
            />
          </div>

          {pendapatanLain > 0 && (
            <Input
              label="Keterangan Biaya Tambahan"
              requiredIndicator
              value={keteranganPendapatan}
              onChange={(e) => setKeteranganPendapatan(e.target.value)}
              placeholder="Contoh: Nebulizer / Perawatan Luka Ringan / Cek Gula Darah"
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Metode Pembayaran */}
            <Select
              label="Metode Pembayaran"
              value={jenisPembayaran}
              onChange={(e) => setJenisPembayaran(e.target.value as 'Tunai' | 'TF')}
              options={METODE_PEMBAYARAN_OPTIONS.map((m) => ({
                value: m,
                label: m === 'Tunai' ? 'Tunai (Cash)' : 'Transfer Bank (TF)',
              }))}
            />

            {/* Total Tagihan */}
            <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-bold text-blue-700">
                  Total Yang Harus Dibayar
                </span>
                <span className="text-base font-extrabold text-blue-900 font-mono">
                  {formatRupiah(totalBiaya)}
                </span>
              </div>
              <div className="text-right">
                <Badge variant="lunas">{statusPembayaran}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
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
            className="w-full sm:w-auto min-h-[44px]"
          >
            Daftarkan ke Antrian Pasien
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterVisitModal;
