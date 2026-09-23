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
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Visit, Doctor } from '@/types/database';
import { Button, Badge, Input } from '@/components/ui';
import { Icd10QuickPicker } from '@/components/rekam-medis/Icd10QuickPicker';
import { SuratSakitModal } from '@/components/rekam-medis/SuratSakitModal';
import { SuratRujukanModal } from '@/components/rekam-medis/SuratRujukanModal';
import { POPULAR_PRESCRIPTIONS, formatPrescriptionItem } from '@/constants/prescriptions';
import { cn, formatDateIndo } from '@/lib/utils';

export interface ExaminationFormProps {
  visit: Visit;
  onSaveSuccess?: (updatedVisit: Visit) => void;
  className?: string;
}

export function ExaminationForm({
  visit,
  onSaveSuccess,
  className,
}: ExaminationFormProps) {
  const [keluhan, setKeluhan] = useState('');
  const [kodeIcd10, setKodeIcd10] = useState('');
  const [diagnosaDeskripsi, setDiagnosaDeskripsi] = useState('');
  const [terapiObat, setTerapiObat] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [keteranganTindakan, setKeteranganTindakan] = useState('');
  const [lab, setLab] = useState('');
  const [labHasil, setLabHasil] = useState('');

  // Structured vital signs
  const [sistol, setSistol] = useState('');
  const [diastol, setDiastol] = useState('');
  const [nadi, setNadi] = useState('');
  const [suhu, setSuhu] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [tinggiBadan, setTinggiBadan] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal SKS & Rujukan
  const [isSuratSakitOpen, setIsSuratSakitOpen] = useState(false);
  const [isSuratRujukanOpen, setIsSuratRujukanOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);

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
    setKodeIcd10(visit.kode_icd10 || '');
    setDiagnosaDeskripsi(visit.diagnosa_deskripsi || '');
    setTerapiObat(visit.terapi_obat || '');
    setTindakan(visit.tindakan || '');
    setKeteranganTindakan(visit.keterangan_tindakan || '');
    setLab(visit.lab || '');
    setLabHasil(visit.lab_hasil || '');
    setErrorMessage(null);
  }, [visit.id]);

  // Evaluasi riwayat alergi obat
  const patientAllergy = visit.pasien?.riwayat_alergi;
  const hasAllergy = Boolean(
    patientAllergy &&
      patientAllergy.trim() !== '' &&
      patientAllergy.trim().toLowerCase() !== 'tidak ada' &&
      patientAllergy.trim().toLowerCase() !== '-'
  );

  // Deteksi pencocokan allergen reaktif saat meresepkan terapi
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

  const handleIcd10Change = (code: string, desc: string) => {
    setKodeIcd10(code);
    setDiagnosaDeskripsi(desc);
  };

  const handleAppendVitalSigns = () => {
    const parts: string[] = [];

    if (sistol.trim() && diastol.trim()) {
      const classification = bloodPressureClassification ? ` (${bloodPressureClassification.label})` : '';
      parts.push(`TD: ${sistol.trim()}/${diastol.trim()} mmHg${classification}`);
    } else if (sistol.trim()) {
      parts.push(`TD: ${sistol.trim()} mmHg`);
    }

    if (nadi.trim()) parts.push(`N: ${nadi.trim()} x/mnt`);
    if (suhu.trim()) parts.push(`S: ${suhu.trim()} °C`);
    if (beratBadan.trim()) parts.push(`BB: ${beratBadan.trim()} kg`);
    if (tinggiBadan.trim()) parts.push(`TB: ${tinggiBadan.trim()} cm`);
    if (bmiValue) parts.push(`IMT: ${bmiValue} kg/m²`);

    if (parts.length > 0) {
      const vitalsText = `[Tanda Vital: ${parts.join(', ')}]`;
      setKeluhan((prev) => (prev ? `${prev}\n${vitalsText}` : vitalsText));
      toast.info('Tanda vital berhasil disematkan ke catatan anamnesa.');
    }
  };

  const handleAppendPrescription = (preset: typeof POPULAR_PRESCRIPTIONS[number]) => {
    const itemString = formatPrescriptionItem(preset);
    setTerapiObat((prev) => {
      if (!prev || !prev.trim()) return itemString;
      return `${prev.trim()}\n${itemString}`;
    });
    toast.success(`Resep "${preset.name}" ditambahkan.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kodeIcd10.trim() || !diagnosaDeskripsi.trim()) {
      setErrorMessage('Diagnosa ICD-10 wajib diisi sebelum menyimpan rekam medis.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('visits')
        .update({
          keluhan_anamnesa: keluhan.trim() || null,
          kode_icd10: kodeIcd10.trim().toUpperCase(),
          diagnosa_deskripsi: diagnosaDeskripsi.trim(),
          terapi_obat: terapiObat.trim() || null,
          tindakan: tindakan.trim() || null,
          keterangan_tindakan: keteranganTindakan.trim() || null,
          lab: lab.trim() || null,
          lab_hasil: labHasil.trim() || null,
        })
        .eq('id', visit.id)
        .select(`
          *,
          pasien:patients(*),
          dokter:doctors(*)
        `)
        .single();

      if (error) throw error;

      toast.success('Rekam medis pasien berhasil disimpan!', {
        description: `${patient?.nama || 'Pasien'} • Diagnosa: ${kodeIcd10.toUpperCase()} (${diagnosaDeskripsi})`,
      });

      if (onSaveSuccess && data) {
        onSaveSuccess(data as Visit);
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
  const isFinished = Boolean(visit.kode_icd10 && visit.diagnosa_deskripsi);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn('bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden', className)}
      >
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800">
                Antrean #{visit.nomor_antrian || '-'}
              </span>
              <Badge variant={visit.jenis_pasien === 'BPJS' ? 'bpjs' : 'umum'}>
                {visit.jenis_pasien}
              </Badge>
              {isFinished ? (
                <Badge variant="lunas">
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
                  <span className="text-teal-800 font-mono bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[11px] font-medium">
                    BPJS: {patient.no_bpjs}
                  </span>
                </>
              )}
            </div>

            {hasAllergy && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                <WarningCircle className="h-4 w-4 shrink-0 text-red-600" weight="fill" />
                <span>PERINGATAN ALERGI OBAT: {patientAllergy}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="sm:text-right">
              <span className="text-[11px] text-slate-400 block">Tanggal Kunjungan</span>
              <span className="text-xs font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-slate-400" weight="duotone" />
                {formatDateIndo(visit.tanggal_periksa)}
              </span>
              {visit.jam_periksa && (
                <span className="text-[11px] text-slate-500 block">pukul {visit.jam_periksa} WIB</span>
              )}
            </div>

            {/* Tombol Terbitkan Surat Sakit & Rujukan */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSuratSakitOpen(true)}
                className="gap-1.5 text-xs text-teal-700 border-teal-300 bg-teal-50/50 hover:bg-teal-100 min-h-[36px]"
              >
                <FileText className="w-4 h-4 text-teal-600" weight="duotone" />
                <span>Surat Sakit</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSuratRujukanOpen(true)}
                className="gap-1.5 text-xs text-blue-700 border-blue-300 bg-blue-50/50 hover:bg-blue-100 min-h-[36px]"
              >
                <ShareNetwork className="w-4 h-4 text-blue-600" weight="duotone" />
                <span>Rujukan</span>
              </Button>
            </div>
          </div>
        </div>

        {visit.keluhan_anamnesa && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs flex items-start gap-2">
            <WarningCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" weight="duotone" />
            <div>
              <span className="font-bold text-amber-900">Keluhan Awal dari Loket Kasir: </span>
              <span className="text-amber-950 font-medium">{visit.keluhan_anamnesa}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <WarningCircle className="w-4 h-4 shrink-0 text-rose-600" weight="duotone" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Heartbeat className="w-4 h-4 text-rose-600" weight="duotone" />
              Anamnesa Lanjutan & Tanda Vital (TTV)
            </label>
            <span className="text-[11px] text-slate-500">Catatan subjektif dan objektif dokter</span>
          </div>

          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" weight="duotone" />
                Parameter Pemeriksaan Fisik & Tanda Vital:
              </span>
              {bloodPressureClassification && (
                <Badge variant={bloodPressureClassification.variant} size="sm">
                  {bloodPressureClassification.label} ({bloodPressureClassification.note})
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sistol (mmHg)
                </label>
                <Input
                  placeholder="120"
                  value={sistol}
                  onChange={(e) => setSistol(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diastol (mmHg)
                </label>
                <Input
                  placeholder="80"
                  value={diastol}
                  onChange={(e) => setDiastol(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nadi (x/mnt)
                </label>
                <Input
                  placeholder="80"
                  value={nadi}
                  onChange={(e) => setNadi(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Suhu (°C)
                </label>
                <Input
                  placeholder="36.5"
                  value={suhu}
                  onChange={(e) => setSuhu(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Berat (kg)
                </label>
                <Input
                  placeholder="65"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tinggi (cm)
                </label>
                <Input
                  placeholder="165"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  className="font-mono text-center text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <span className="text-[11px] text-slate-500">
                {bmiValue ? `Indeks Massa Tubuh (IMT): ${bmiValue} kg/m²` : 'Isi parameter di atas lalu klik terapkan ke anamnesa'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAppendVitalSigns}
                disabled={!sistol && !diastol && !nadi && !suhu && !beratBadan}
                leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
                className="min-h-[36px] text-xs font-semibold"
              >
                Terapkan ke Anamnesa
              </Button>
            </div>
          </div>

          <textarea
            rows={3}
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Ketik anamnesa klinis, hasil pemeriksaan fisik, atau riwayat alergi..."
            aria-label="Catatan anamnesa lanjutan"
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 leading-relaxed bg-white"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <Icd10QuickPicker
            selectedCode={kodeIcd10}
            selectedDescription={diagnosaDeskripsi}
            onSelectIcd10={handleIcd10Change}
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" weight="duotone" />
              Terapi Obat & Resep Medis
            </label>
            <span className="text-[11px] text-slate-500">Rincian dosis, aturan pakai, dan durasi</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Template Resep Cepat (Sekali Klik Tambah ke Terapi):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_PRESCRIPTIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAppendPrescription(preset)}
                  className="px-2.5 py-1 min-h-[32px] rounded-lg text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition select-none flex items-center gap-1"
                  title={`${preset.name} - ${preset.dosage} (${preset.instruction})`}
                >
                  <Plus className="w-3 h-3 text-emerald-700" weight="bold" />
                  <span>{preset.name}</span>
                  <span className="text-emerald-700 text-[10px]">({preset.dosage})</span>
                </button>
              ))}
            </div>
          </div>

          {matchedAllergen && (
            <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-900 text-xs flex items-start gap-2 animate-pulse">
              <WarningCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" weight="fill" />
              <div>
                <span className="font-extrabold uppercase tracking-wide block text-red-900">
                  PERINGATAN BAHAYA: ALERGI OBAT TERDETEKSI!
                </span>
                <span className="text-red-800">
                  Resep mengandung kata kunci: <strong className="underline decoration-red-600">{matchedAllergen}</strong>. Pasien tercatat memiliki riwayat alergi terhadap obat ini ({patientAllergy}). Mohon ganti dengan obat alternatif!
                </span>
              </div>
            </div>
          )}

          <textarea
            rows={3}
            value={terapiObat}
            onChange={(e) => setTerapiObat(e.target.value)}
            placeholder="Contoh: Paracetamol 500mg 3x1 tab prn demam, Amoxicillin 500mg 3x1 tab (habiskan), Antasida DOEN 3x1 cth ac"
            aria-label="Rincian terapi obat dan resep medis"
            className={cn(
              "w-full text-xs font-mono rounded-xl border p-3 focus:outline-none focus:ring-2 leading-relaxed",
              matchedAllergen
                ? "border-red-500 bg-red-50/40 text-red-950 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300 bg-emerald-50/20 text-slate-900 focus:ring-emerald-600 focus:border-emerald-600"
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
              Tindakan Medis / Prosedur
            </label>
            <Input
              placeholder="Contoh: Injeksi, Ganti Balut, Nebulizer, Sirkumsisi"
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

          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flask className="w-3.5 h-3.5 text-purple-600" weight="duotone" />
              Pemeriksaan Lab Sederhana (Point-of-Care)
            </label>
            <Input
              placeholder="Jenis Lab: GDS, Asam Urat, Kolesterol, Hb"
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              className="text-xs h-9 bg-white"
            />
            <Input
              placeholder="Hasil: Misal GDS 125 mg/dL / Kolesterol 190 mg/dL"
              value={labHasil}
              onChange={(e) => setLabHasil(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setKeluhan(visit.keluhan_anamnesa || '');
              setKodeIcd10(visit.kode_icd10 || '');
              setDiagnosaDeskripsi(visit.diagnosa_deskripsi || '');
              setTerapiObat(visit.terapi_obat || '');
              setTindakan(visit.tindakan || '');
              setKeteranganTindakan(visit.keterangan_tindakan || '');
              setLab(visit.lab || '');
              setLabHasil(visit.lab_hasil || '');
              setErrorMessage(null);
            }}
            disabled={isSaving}
            leftIcon={<ArrowCounterClockwise className="w-3.5 h-3.5" weight="bold" />}
            className="w-full sm:w-auto min-h-[44px] text-xs text-slate-600 justify-center"
          >
            Reset Perubahan
          </Button>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            leftIcon={
              isSaving ? (
                <CircleNotch className="w-4 h-4 animate-spin text-white" weight="bold" />
              ) : (
                <FloppyDisk className="w-4 h-4 text-white" weight="duotone" />
              )
            }
            className="w-full sm:w-auto min-h-[44px] text-xs font-bold px-6 py-2.5 justify-center"
          >
            {isSaving ? 'Menyimpan Rekam Medis...' : 'Simpan Rekam Medis'}
          </Button>
        </div>
      </div>
    </form>

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

    {/* Modal Cetak Surat Rujukan Pasien Eksternal */}
    {patient && (
      <SuratRujukanModal
        isOpen={isSuratRujukanOpen}
        onClose={() => setIsSuratRujukanOpen(false)}
        visit={visit}
        patient={patient}
        doctors={doctorsList}
        vitalSigns={{
          td: sistol && diastol ? `${sistol}/${diastol}` : undefined,
          nadi: nadi || undefined,
          suhu: suhu || undefined,
          beratBadan: beratBadan || undefined,
        }}
      />
    )}
  </>
);
}

export default ExaminationForm;
