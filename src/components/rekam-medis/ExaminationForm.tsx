'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  Heartbeat,
  Pill,
  FloppyDisk,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  CalendarBlank,
  MapPin,
  Flask,
  FileText,
  ArrowCounterClockwise,
  Thermometer,
  Plus,
  ShareNetwork,
  Scissors,
  Receipt,
  PaperPlaneTilt,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  ShieldCheck,
  User,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Visit, Doctor } from '@/types/database';
import { DEFAULT_TARIFFS } from '@/constants/clinic';
import { Button, Badge, Input } from '@/components/ui';
import { Icd10QuickPicker, type DiagnosisItem } from '@/components/rekam-medis/Icd10QuickPicker';
import { MedicineQuickSearch } from '@/components/rekam-medis/MedicineQuickSearch';
import { SuratSakitModal } from '@/components/rekam-medis/SuratSakitModal';
import { SuratRujukanModal } from '@/components/rekam-medis/SuratRujukanModal';
import { NewTbcModal } from '@/components/program-khusus/NewTbcModal';
import { NewCircumcisionModal } from '@/components/program-khusus/NewCircumcisionModal';
import { PatientHistoryTimeline } from '@/components/rekam-medis/PatientHistoryTimeline';
import { cn, formatDateIndo, formatRupiah } from '@/lib/utils';

export interface ExaminationFormProps {
  visit: Visit;
  onSaveSuccess?: (updatedVisit: Visit, isHandover?: boolean) => void;
  className?: string;
}

type ClinicalTab = 'anamnesa' | 'diagnosa' | 'resep' | 'riwayat';

function parseInitialDiagnoses(codesStr?: string | null, descStr?: string | null): DiagnosisItem[] {
  if (!codesStr || !codesStr.trim()) return [];
  const codes = codesStr.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  const descs = descStr ? descStr.split(';').map((d) => d.trim()).filter(Boolean) : [];
  return codes.map((code, idx) => ({
    code,
    name: descs[idx] || descs[0] || code,
    isPrimary: idx === 0,
  }));
}

export function ExaminationForm({
  visit,
  onSaveSuccess,
  className,
}: ExaminationFormProps) {
  const [activeTab, setActiveTab] = useState<ClinicalTab>('anamnesa');

  const [keluhan, setKeluhan] = useState('');
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>(() =>
    parseInitialDiagnoses(visit.kode_icd10, visit.diagnosa_deskripsi)
  );
  const [terapiObat, setTerapiObat] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [keteranganTindakan, setKeteranganTindakan] = useState('');
  const [lab, setLab] = useState('');
  const [labHasil, setLabHasil] = useState('');

  // Billing and procedure fees
  const [biayaPeriksa, setBiayaPeriksa] = useState<number>(() => {
    if (visit.biaya_periksa !== undefined && visit.biaya_periksa !== null) {
      return Number(visit.biaya_periksa);
    }
    return visit.jenis_pasien === 'BPJS' ? 0 : DEFAULT_TARIFFS.umum;
  });
  const [pendapatanLain, setPendapatanLain] = useState<number>(Number(visit.pendapatan_lain || 0));
  const [keteranganPendapatan, setKeteranganPendapatan] = useState(visit.keterangan_pendapatan || '');

  // Vital signs
  const [sistol, setSistol] = useState('');
  const [diastol, setDiastol] = useState('');
  const [nadi, setNadi] = useState('');
  const [suhu, setSuhu] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [tinggiBadan, setTinggiBadan] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Administrative & Program Modals
  const [isSuratSakitOpen, setIsSuratSakitOpen] = useState(false);
  const [isSuratRujukanOpen, setIsSuratRujukanOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [isTbcModalOpen, setIsTbcModalOpen] = useState(false);
  const [isCircumcisionModalOpen, setIsCircumcisionModalOpen] = useState(false);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('doctors').select('*').eq('aktif', true);
        if (data) setDoctorsList(data as Doctor[]);
      } catch (e) {
        console.error('Failed to load doctors list:', e);
      }
    }
    loadDoctors();
  }, []);

  useEffect(() => {
    setKeluhan(visit.keluhan_anamnesa || '');
    setDiagnoses(parseInitialDiagnoses(visit.kode_icd10, visit.diagnosa_deskripsi));
    setTerapiObat(visit.terapi_obat || '');
    setTindakan(visit.tindakan || '');
    setKeteranganTindakan(visit.keterangan_tindakan || '');
    setLab(visit.lab || '');
    setLabHasil(visit.lab_hasil || '');
    setBiayaPeriksa(
      visit.biaya_periksa !== undefined && visit.biaya_periksa !== null
        ? Number(visit.biaya_periksa)
        : visit.jenis_pasien === 'BPJS' ? 0 : DEFAULT_TARIFFS.umum
    );
    setPendapatanLain(Number(visit.pendapatan_lain || 0));
    setKeteranganPendapatan(visit.keterangan_pendapatan || '');
    setErrorMessage(null);
    setActiveTab('anamnesa');
  }, [visit.id, visit.biaya_periksa, visit.pendapatan_lain, visit.keterangan_pendapatan, visit.jenis_pasien]);

  const patientAllergy = visit.pasien?.riwayat_alergi;
  const hasAllergy = Boolean(
    patientAllergy &&
      patientAllergy.trim() !== '' &&
      patientAllergy.trim().toLowerCase() !== 'tidak ada' &&
      patientAllergy.trim().toLowerCase() !== '-'
  );

  const matchedAllergen = useMemo(() => {
    if (!hasAllergy || !patientAllergy || !terapiObat.trim()) return null;
    const allergenWords = patientAllergy
      .toLowerCase()
      .split(/[,;\/\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 3);

    const lowerTherapy = terapiObat.toLowerCase();
    for (const allergen of allergenWords) {
      if (lowerTherapy.includes(allergen)) {
        return allergen;
      }
    }
    return null;
  }, [hasAllergy, patientAllergy, terapiObat]);

  const bloodPressureClassification = useMemo(() => {
    const s = parseInt(sistol, 10);
    const d = parseInt(diastol, 10);
    if (isNaN(s) || isNaN(d)) return null;

    if (s < 120 && d < 80) {
      return { label: 'Tensi Normal', variant: 'success' as const, note: 'Optimal' };
    }
    if ((s >= 120 && s <= 139) || (d >= 80 && d <= 89)) {
      return { label: 'Pre-Hipertensi', variant: 'warning' as const, note: 'Perlu Monitoring' };
    }
    if (s >= 140 || d >= 90) {
      return { label: 'Hipertensi', variant: 'danger' as const, note: 'Perlu Terapi Antihipertensi' };
    }
    return null;
  }, [sistol, diastol]);

  const bmiValue = useMemo(() => {
    const bb = parseFloat(beratBadan);
    const tb = parseFloat(tinggiBadan);
    if (!bb || !tb || tb <= 0) return null;
    const tbMeter = tb / 100;
    const bmi = bb / (tbMeter * tbMeter);
    return bmi.toFixed(1);
  }, [beratBadan, tinggiBadan]);

  // Serialized representations for PostgreSQL storage
  const serializedCodes = useMemo(() => {
    const sorted = [...diagnoses].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return sorted.map((d) => d.code).join(', ');
  }, [diagnoses]);

  const serializedDescriptions = useMemo(() => {
    const sorted = [...diagnoses].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return sorted.map((d) => d.name).join('; ');
  }, [diagnoses]);

  const isTbDiagnosis = useMemo(() => {
    const text = `${serializedCodes} ${serializedDescriptions}`.toLowerCase();
    return text.includes('a15') || text.includes('a16') || text.includes('tbc') || text.includes('tuberkulosis');
  }, [serializedCodes, serializedDescriptions]);

  const isCircumcisionDiagnosis = useMemo(() => {
    const text = `${tindakan} ${serializedDescriptions} ${keteranganTindakan}`.toLowerCase();
    return text.includes('sunat') || text.includes('sirkum') || text.includes('khitan') || text.includes('fimosis') || text.includes('n47');
  }, [tindakan, serializedDescriptions, keteranganTindakan]);

  const handleAppendVitalSigns = () => {
    const parts: string[] = [];

    if (sistol.trim() && diastol.trim()) {
      const classification = bloodPressureClassification ? ` (${bloodPressureClassification.label})` : '';
      parts.push(`TD: ${sistol.trim()}/${diastol.trim()} mmHg${classification}`);
    } else if (sistol.trim()) {
      parts.push(`Sistol: ${sistol.trim()} mmHg`);
    }

    if (nadi.trim()) parts.push(`N: ${nadi.trim()} x/mnt`);
    if (suhu.trim()) parts.push(`S: ${suhu.trim()} °C`);
    if (beratBadan.trim()) parts.push(`BB: ${beratBadan.trim()} kg`);
    if (tinggiBadan.trim()) parts.push(`TB: ${tinggiBadan.trim()} cm`);
    if (bmiValue) parts.push(`BMI: ${bmiValue}`);

    if (parts.length === 0) return;

    const ttvString = `[TTV: ${parts.join(', ')}]`;
    setKeluhan((prev) => {
      if (!prev || !prev.trim()) return ttvString;
      if (prev.includes('[TTV:')) {
        return prev.replace(/\[TTV:.*?\]/, ttvString);
      }
      return `${prev.trim()}\n${ttvString}`;
    });
    toast.success('Hasil TTV disalin ke catatan anamnesa.');
  };

  const handleSave = async (isCompleteHandover: boolean) => {
    if (isCompleteHandover && diagnoses.length === 0) {
      setErrorMessage('Minimal satu diagnosa ICD-10 wajib dipilih sebelum mengirim pasien ke kasir.');
      setActiveTab('diagnosa');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const targetStatus = isCompleteHandover ? 'Menunggu Kasir' : visit.status_pembayaran;

      const { data, error } = await supabase
        .from('visits')
        .update({
          keluhan_anamnesa: keluhan.trim() || null,
          kode_icd10: serializedCodes || null,
          diagnosa_deskripsi: serializedDescriptions || null,
          terapi_obat: terapiObat.trim() || null,
          tindakan: tindakan.trim() || null,
          keterangan_tindakan: keteranganTindakan.trim() || null,
          lab: lab.trim() || null,
          lab_hasil: labHasil.trim() || null,
          biaya_periksa: visit.jenis_pasien === 'BPJS' ? 0 : Number(biayaPeriksa || 0),
          pendapatan_lain: Number(pendapatanLain || 0),
          keterangan_pendapatan: keteranganPendapatan.trim() || null,
          status_pembayaran: targetStatus,
        })
        .eq('id', visit.id)
        .select(`*, pasien:patients(*), dokter:doctors(*)`)
        .single();

      if (error) throw error;

      toast.success(
        isCompleteHandover
          ? 'Pemeriksaan selesai. Pasien berhasil dikirim ke antrean kasir & farmasi.'
          : 'Draft rekam medis berhasil disimpan.'
      );

      if (onSaveSuccess && data) {
        onSaveSuccess(data as unknown as Visit, isCompleteHandover);
      }
    } catch (err) {
      console.error('Error saving examination record:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan hasil pemeriksaan ke database.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const patient = visit.pasien;
  const isFinished = visit.status_pembayaran !== 'Menunggu Dokter';

  const tabsConfig = [
    {
      id: 'anamnesa' as ClinicalTab,
      label: '1. Anamnesa & TTV',
      icon: Heartbeat,
      isComplete: Boolean(keluhan.trim() || sistol || suhu),
    },
    {
      id: 'diagnosa' as ClinicalTab,
      label: '2. Diagnosa & Tindakan',
      icon: Stethoscope,
      isComplete: diagnoses.length > 0,
      required: true,
    },
    {
      id: 'resep' as ClinicalTab,
      label: '3. Resep & Kasir',
      icon: Pill,
      isComplete: Boolean(terapiObat.trim()),
    },
    {
      id: 'riwayat' as ClinicalTab,
      label: '4. Riwayat Pasien',
      icon: ClockCounterClockwise,
      isComplete: true,
    },
  ];

  return (
    <>
      <div className={cn('bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col', className)}>
        {/* Banner Status Kunjungan Lampau / Sudah Selesai */}
        {isFinished && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
              <span>
                Pasien ini sudah selesai diperiksa dan diteruskan ke loket kasir / apotek. Status: <strong>{visit.status_pembayaran}</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {visit.status_pembayaran}
            </span>
          </div>
        )}

        {/* Header Pasien & Ringkasan Klinis */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
                  Antrean #{visit.nomor_antrian || '-'}
                </span>
                <Badge variant={visit.jenis_pasien === 'BPJS' ? 'bpjs' : 'umum'}>
                  {visit.jenis_pasien}
                </Badge>
                {isFinished ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" weight="duotone" />
                    Selesai Diperiksa
                  </Badge>
                ) : (
                  <Badge variant="warning">Menunggu Pemeriksaan</Badge>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 pt-1">
                {patient ? `${patient.gelar ? patient.gelar + ' ' : ''}${patient.nama}` : 'Pasien Tidak Diketahui'}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  No RM: {patient?.no_rm || '-'}
                </span>
                <span>•</span>
                <span>
                  {patient?.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}, {patient?.usia || '-'} tahun
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" weight="duotone" />
                  Desa {patient?.desa || '-'}
                </span>
                {patient?.no_bpjs && (
                  <>
                    <span>•</span>
                    <span className="text-teal-700 font-medium">BPJS: {patient.no_bpjs}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTbcModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5 text-rose-600" weight="bold" />}
                className="text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50 min-h-[36px]"
              >
                + TBC
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCircumcisionModalOpen(true)}
                leftIcon={<Scissors className="w-3.5 h-3.5 text-indigo-600" weight="duotone" />}
                className="text-[11px] text-indigo-700 border-indigo-200 hover:bg-indigo-50 min-h-[36px]"
              >
                + Sunat
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSuratSakitOpen(true)}
                leftIcon={<FileText className="w-3.5 h-3.5 text-teal-600" weight="duotone" />}
                className="text-[11px] text-teal-700 border-teal-200 hover:bg-teal-50 min-h-[36px]"
              >
                Surat Sakit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSuratRujukanOpen(true)}
                leftIcon={<ShareNetwork className="w-3.5 h-3.5 text-blue-600" weight="duotone" />}
                className="text-[11px] text-blue-700 border-blue-200 hover:bg-blue-50 min-h-[36px]"
              >
                Rujukan
              </Button>
            </div>
          </div>

          {/* Peringatan Alergi Obat */}
          {hasAllergy && (
            <div className="mt-3 p-2.5 rounded-xl border border-rose-300 bg-rose-50 flex items-start gap-2.5 text-xs text-rose-900">
              <WarningCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" weight="fill" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 block">
                  Peringatan Riwayat Alergi Obat Pasien:
                </span>
                <span className="font-semibold text-rose-950">{patientAllergy}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="bg-slate-100/80 p-1.5 border-b border-slate-200 flex items-center gap-1 overflow-x-auto shrink-0">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMessage(null);
                }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition min-h-[40px]',
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')} weight={isActive ? 'duotone' : 'regular'} />
                <span>{tab.label}</span>
                {tab.required && !tab.isComplete && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Wajib diisi" />
                )}
                {tab.isComplete && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" weight="fill" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content (Scrollable dengan batas tinggi ergonomis) */}
        <div className="p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" weight="duotone" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: ANAMNESA & TTV */}
          {activeTab === 'anamnesa' && (
            <div className="space-y-4">
              {visit.keluhan_anamnesa && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block mb-0.5">
                    Keluhan Awal dari Loket Pendaftaran:
                  </span>
                  <p className="font-medium text-slate-800">{visit.keluhan_anamnesa}</p>
                </div>
              )}

              {/* Anamnesa Dokter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Catatan Anamnesa & Pemeriksaan Fisik</span>
                  <span className="text-[11px] font-normal text-slate-500">Keluhan utama, riwayat penyakit sekarang</span>
                </label>
                <textarea
                  rows={4}
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  placeholder="Ketik catatan anamnesa lanjutan atau hasil periksa fisik dokter di sini..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y leading-relaxed"
                />
              </div>

              {/* Tanda Vital (TTV) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Heartbeat className="w-4 h-4 text-rose-600" weight="duotone" />
                    <span>Pemeriksaan Tanda Vital (TTV)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {bloodPressureClassification && (
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        bloodPressureClassification.variant === 'success' && 'bg-emerald-100 text-emerald-800',
                        bloodPressureClassification.variant === 'warning' && 'bg-amber-100 text-amber-800',
                        bloodPressureClassification.variant === 'danger' && 'bg-rose-100 text-rose-800'
                      )}>
                        {bloodPressureClassification.label}
                      </span>
                    )}
                    {bmiValue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                        BMI: {bmiValue}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleAppendVitalSigns}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline"
                    >
                      Salin ke Anamnesa
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <Input
                    type="number"
                    placeholder="120"
                    label="Sistol (mmHg)"
                    value={sistol}
                    onChange={(e) => setSistol(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                  <Input
                    type="number"
                    placeholder="80"
                    label="Diastol (mmHg)"
                    value={diastol}
                    onChange={(e) => setDiastol(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                  <Input
                    type="number"
                    placeholder="80"
                    label="Nadi (x/mnt)"
                    value={nadi}
                    onChange={(e) => setNadi(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    label="Suhu (°C)"
                    value={suhu}
                    onChange={(e) => setSuhu(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="60"
                    label="BB (kg)"
                    value={beratBadan}
                    onChange={(e) => setBeratBadan(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                  <Input
                    type="number"
                    placeholder="165"
                    label="TB (cm)"
                    value={tinggiBadan}
                    onChange={(e) => setTinggiBadan(e.target.value)}
                    className="text-xs h-9 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Lab Point of Care Sederhana */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flask className="w-3.5 h-3.5 text-purple-600" weight="duotone" />
                  Pemeriksaan Lab Cepat (Point-of-Care)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Jenis Lab: GDS, Asam Urat, Kolesterol, Hb"
                    value={lab}
                    onChange={(e) => setLab(e.target.value)}
                    className="text-xs h-9 bg-white"
                  />
                  <Input
                    placeholder="Hasil Lab (contoh: 110 mg/dL, 6.2 mg/dL)"
                    value={labHasil}
                    onChange={(e) => setLabHasil(e.target.value)}
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIAGNOSA & TINDAKAN */}
          {activeTab === 'diagnosa' && (
            <div className="space-y-4">
              {/* Komponen Multi-Diagnosa ICD-10 (Tanpa Duplikasi Input) */}
              <Icd10QuickPicker
                diagnoses={diagnoses}
                onChangeDiagnoses={setDiagnoses}
              />

              {/* Jembatan Cerdas Program Khusus */}
              {isTbDiagnosis && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <WarningCircle className="w-4 h-4 text-rose-600" weight="fill" />
                    <span>Terdeteksi indikasi diagnosa TBC pada pasien ini.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTbcModalOpen(true)}
                    className="text-[11px] text-rose-700 border-rose-300 hover:bg-rose-100 min-h-[32px]"
                  >
                    + Buka Register TBC
                  </Button>
                </div>
              )}

              {isCircumcisionDiagnosis && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-indigo-600" weight="duotone" />
                    <span>Terdeteksi tindakan Sirkumsisi / Sunat pada kunjungan ini.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCircumcisionModalOpen(true)}
                    className="text-[11px] text-indigo-700 border-indigo-300 hover:bg-indigo-100 min-h-[32px]"
                  >
                    + Buka Register Sirkumsisi
                  </Button>
                </div>
              )}

              {/* Tindakan Medis / Prosedur */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
                  Tindakan Medis / Prosedur Klinis
                </label>
                <Input
                  placeholder="Contoh: Injeksi, Ganti Balut, Nebulizer, Jahit Luka"
                  value={tindakan}
                  onChange={(e) => setTindakan(e.target.value)}
                  className="text-xs h-9 bg-white"
                />
                <Input
                  placeholder="Catatan rincian tindakan medis..."
                  value={keteranganTindakan}
                  onChange={(e) => setKeteranganTindakan(e.target.value)}
                  className="text-xs h-9 bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: RESEP & KASIR */}
          {activeTab === 'resep' && (
            <div className="space-y-4">
              {matchedAllergen && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
                  <WarningCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" weight="fill" />
                  <div>
                    <span className="font-bold block">Peringatan Interaksi Alergi!</span>
                    <span>Resep yang Anda ketik mengandung zat <strong>&quot;{matchedAllergen}&quot;</strong> yang tercatat sebagai riwayat alergi pasien.</span>
                  </div>
                </div>
              )}

              {/* Pencarian Obat Cerdas & Pintasan Signa Sekali-Klik */}
              <MedicineQuickSearch
                onAppendPrescription={(itemText) => {
                  setTerapiObat((prev) => {
                    if (!prev || !prev.trim()) return itemText;
                    return `${prev.trim()}\n${itemText}`;
                  });
                  toast.success('Ditambahkan ke resep.');
                }}
              />

              {/* Textarea Resep */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Terapi Obat & Aturan Pakai (Resep Apotek)</span>
                  <span className="text-[11px] font-normal text-slate-500">Dapat diedit bebas untuk dosis khusus</span>
                </label>
                <textarea
                  rows={4}
                  value={terapiObat}
                  onChange={(e) => setTerapiObat(e.target.value)}
                  placeholder="Contoh:&#10;Amoxicillin 500 mg - 3x1 tab (pc wajib dihabiskan)&#10;Paracetamol 500 mg - 3x1 tab (pc prn bila demam/nyeri)"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y leading-relaxed"
                />
              </div>

              {/* Rincian Tarif & Tindakan Medis untuk Kasir */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <Receipt className="w-4 h-4" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Rincian Biaya & Tindakan Medis (Diteruskan ke Kasir)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Ditagihkan dan dilunasi di loket kasir & farmasi.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Estimasi Total Tagihan</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {formatRupiah(Number(biayaPeriksa || 0) + Number(pendapatanLain || 0))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Biaya Periksa Pokok Dokter (Rp)
                    </label>
                    <input
                      type="number"
                      value={biayaPeriksa}
                      onChange={(e) => setBiayaPeriksa(Number(e.target.value))}
                      disabled={visit.jenis_pasien === 'BPJS'}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    {visit.jenis_pasien === 'BPJS' && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        Gratis ditanggung Kapitasi BPJS
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Biaya Tindakan / Pendapatan Lain (Rp)
                    </label>
                    <input
                      type="number"
                      value={pendapatanLain}
                      onChange={(e) => setPendapatanLain(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Keterangan Biaya Tindakan */}
                <div className="pt-1">
                  <Input
                    label="Keterangan Tindakan / Tagihan Tambahan"
                    placeholder="Contoh: Jahit Luka 3 simpul, Nebulizer 1x, Perban luka"
                    value={keteranganPendapatan}
                    onChange={(e) => setKeteranganPendapatan(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RIWAYAT PASIEN */}
          {activeTab === 'riwayat' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ClockCounterClockwise className="w-4 h-4 text-blue-600" weight="duotone" />
                  Riwayat Rekam Medis Kunjungan Lampau Pasien
                </span>
                <span className="text-[11px] text-slate-500">
                  Data kunjungan sebelumnya dari database klinik
                </span>
              </div>

              <PatientHistoryTimeline
                patientId={visit.pasien_id}
                currentVisitId={visit.id}
              />
            </div>
          )}
        </div>

        {/* Step-Scoped Bottom Action Bar */}
        <div className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            {activeTab !== 'anamnesa' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'riwayat') setActiveTab('resep');
                  else if (activeTab === 'resep') setActiveTab('diagnosa');
                  else if (activeTab === 'diagnosa') setActiveTab('anamnesa');
                }}
                leftIcon={<CaretLeft className="w-4 h-4" weight="bold" />}
                className="min-h-[44px] text-xs"
              >
                Sebelumnya
              </Button>
            )}

            {activeTab === 'anamnesa' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('diagnosa')}
                rightIcon={<CaretRight className="w-4 h-4" weight="bold" />}
                className="min-h-[44px] text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                Lanjut ke Diagnosa & Tindakan
              </Button>
            )}

            {activeTab === 'diagnosa' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('resep')}
                rightIcon={<CaretRight className="w-4 h-4" weight="bold" />}
                className="min-h-[44px] text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                Lanjut ke Resep Obat & Kasir
              </Button>
            )}

            {activeTab === 'riwayat' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('resep')}
                leftIcon={<CaretLeft className="w-4 h-4" weight="bold" />}
                className="min-h-[44px] text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                Kembali ke Form Periksa
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              leftIcon={<FloppyDisk className="w-4 h-4 text-slate-500" weight="duotone" />}
              className="w-full sm:w-auto min-h-[44px] text-xs text-slate-700"
              title="Simpan sementara tanpa mengalihkan antrean"
            >
              Simpan Draft
            </Button>

            {/* Tombol Utama Kirim ke Kasir HANYA Aktif di Tab 3 (Resep & Kasir) */}
            {activeTab === 'resep' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                leftIcon={
                  isSaving ? (
                    <CircleNotch className="w-4 h-4 animate-spin text-white" weight="bold" />
                  ) : (
                    <PaperPlaneTilt className="w-4 h-4 text-white" weight="bold" />
                  )
                }
                className="w-full sm:w-auto min-h-[44px] text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-5"
                title="Kirim ke loket kasir & farmasi"
              >
                {isSaving ? 'Menyimpan...' : 'Selesai Periksa & Kirim ke Kasir'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cetak Surat Keterangan Sakit (SKS) */}
      {patient && (
        <SuratSakitModal
          isOpen={isSuratSakitOpen}
          onClose={() => setIsSuratSakitOpen(false)}
          visit={visit}
          patient={patient}
          doctors={doctorsList}
        />
      )}

      {/* Modal Cetak Surat Rujukan Eksternal */}
      {patient && (
        <SuratRujukanModal
          isOpen={isSuratRujukanOpen}
          onClose={() => setIsSuratRujukanOpen(false)}
          visit={visit}
          patient={patient}
          doctors={doctorsList}
        />
      )}

      {/* Modal Pendaftaran Khusus TBC */}
      {patient && (
        <NewTbcModal
          isOpen={isTbcModalOpen}
          onClose={() => setIsTbcModalOpen(false)}
          initialPatient={patient}
          onSuccess={() => {
            setIsTbcModalOpen(false);
            toast.success('Pasien berhasil didaftarkan ke Program Khusus TBC.');
          }}
        />
      )}

      {/* Modal Pendaftaran Khusus Sirkumsisi / Sunat */}
      {patient && (
        <NewCircumcisionModal
          isOpen={isCircumcisionModalOpen}
          onClose={() => setIsCircumcisionModalOpen(false)}
          initialPatient={patient}
          onSuccess={() => {
            setIsCircumcisionModalOpen(false);
            toast.success('Tindakan Sirkumsisi berhasil dicatat.');
          }}
        />
      )}
    </>
  );
}

export default ExaminationForm;
