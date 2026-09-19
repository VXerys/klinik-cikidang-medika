'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Stethoscope,
  Pill,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  HeartPulse,
  FlaskConical,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Visit } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Icd10QuickPicker } from '@/components/rekam-medis/Icd10QuickPicker';
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
  // Form states initialized from active visit
  const [keluhan, setKeluhan] = useState('');
  const [kodeIcd10, setKodeIcd10] = useState('');
  const [diagnosaDeskripsi, setDiagnosaDeskripsi] = useState('');
  const [terapiObat, setTerapiObat] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [keteranganTindakan, setKeteranganTindakan] = useState('');
  const [lab, setLab] = useState('');
  const [labHasil, setLabHasil] = useState('');

  // Vital signs helper state (optional quick inputs)
  const [tensi, setTensi] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [suhu, setSuhu] = useState('');

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever visit changes
  useEffect(() => {
    setKeluhan(visit.keluhan_anamnesa || '');
    setKodeIcd10(visit.kode_icd10 || '');
    setDiagnosaDeskripsi(visit.diagnosa_deskripsi || '');
    setTerapiObat(visit.terapi_obat || '');
    setTindakan(visit.tindakan || '');
    setKeteranganTindakan(visit.keterangan_tindakan || '');
    setLab(visit.lab || '');
    setLabHasil(visit.lab_hasil || '');
    setSaveSuccess(false);
    setErrorMessage(null);
  }, [visit.id]);

  const handleIcd10Change = (code: string, desc: string) => {
    setKodeIcd10(code);
    setDiagnosaDeskripsi(desc);
  };

  const handleAppendVitalSigns = () => {
    const parts: string[] = [];
    if (tensi.trim()) parts.push(`TD: ${tensi.trim()} mmHg`);
    if (beratBadan.trim()) parts.push(`BB: ${beratBadan.trim()} kg`);
    if (suhu.trim()) parts.push(`Suhu: ${suhu.trim()}°C`);

    if (parts.length > 0) {
      const vitalsText = `[Tanda Vital: ${parts.join(', ')}]`;
      setKeluhan((prev) => (prev ? `${prev}\n${vitalsText}` : vitalsText));
      setTensi('');
      setBeratBadan('');
      setSuhu('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kodeIcd10.trim() || !diagnosaDeskripsi.trim()) {
      setErrorMessage('Diagnosa ICD-10 wajib diisi sebelum menyimpan rekam medis.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

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

      setSaveSuccess(true);
      if (onSaveSuccess && data) {
        onSaveSuccess(data as Visit);
      }
    } catch (err) {
      console.error('Error saving examination record:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal menyimpan hasil pemeriksaan ke database.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const patient = visit.pasien;
  const isFinished = Boolean(visit.kode_icd10 && visit.diagnosa_deskripsi);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden', className)}
    >
      {/* 1. Header: Patient Demographics & Current Status */}
      <div className="p-5 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                Antrean #{visit.nomor_antrian || '-'}
              </span>
              <Badge variant={visit.jenis_pasien === 'BPJS' ? 'bpjs' : 'umum'}>
                {visit.jenis_pasien}
              </Badge>
              {isFinished ? (
                <Badge variant="success">Selesai Diperiksa</Badge>
              ) : (
                <Badge variant="warning">Menunggu Pemeriksaan</Badge>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 pt-1">
              {patient ? `${patient.gelar ? patient.gelar + ' ' : ''}${patient.nama}` : 'Pasien Tidak Diketahui'}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
              <span className="font-mono font-medium text-slate-700">
                No. RM: {patient?.no_rm || '-'}
              </span>
              <span>•</span>
              <span>
                {patient?.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}, {patient?.usia || '-'} th
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Desa {patient?.desa || '-'}
              </span>
              {patient?.no_bpjs && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-mono">
                    BPJS: {patient.no_bpjs}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Tanggal Kunjungan</span>
            <span className="text-xs font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDateIndo(visit.tanggal_periksa)}
            </span>
            {visit.jam_periksa && (
              <span className="text-[11px] text-slate-500 block">pukul {visit.jam_periksa}</span>
            )}
          </div>
        </div>

        {/* Initial complaint from Loket */}
        {visit.keluhan_anamnesa && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900">Keluhan Awal dari Loket: </span>
              <span className="text-amber-800">{visit.keluhan_anamnesa}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Clinical Body Form */}
      <div className="p-5 space-y-6">
        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Hasil pemeriksaan medis berhasil disimpan ke rekam medis dan status kunjungan telah diperbarui!
            </span>
          </div>
        )}

        {/* Section A: Anamnesa & Tanda Vital */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              Anamnesa Lanjutan & Tanda Vital
            </label>
            <span className="text-[11px] text-slate-400">Catatan subjektif/objektif dokter</span>
          </div>

          {/* Quick Vital Sign Helper */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              Input Cepat Tanda Vital (Opsional):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <Input
                placeholder="Tensi: 120/80"
                value={tensi}
                onChange={(e) => setTensi(e.target.value)}
                className="text-xs min-h-[40px]"
              />
              <Input
                placeholder="BB: 65 kg"
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                className="text-xs min-h-[40px]"
              />
              <Input
                placeholder="Suhu: 36.5 °C"
                value={suhu}
                onChange={(e) => setSuhu(e.target.value)}
                className="text-xs min-h-[40px]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAppendVitalSigns}
                disabled={!tensi && !beratBadan && !suhu}
                className="min-h-[40px] text-xs font-medium w-full"
              >
                + Tambah ke Catatan
              </Button>
            </div>
          </div>

          <textarea
            rows={3}
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Ketik anamnesa klinis, hasil pemeriksaan fisik, atau riwayat alergi..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Section B: ICD-10 Diagnosa (Quick-Pick + Search) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              Diagnosa Penyakit (ICD-10) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Pilih dari 8 penyakit teratas atau cari kode</span>
          </div>

          <Icd10QuickPicker
            selectedCode={kodeIcd10}
            selectedDescription={diagnosaDeskripsi}
            onSelectIcd10={handleIcd10Change}
          />
        </div>

        {/* Section C: Terapi Obat / Resep */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" />
              Terapi Obat & Resep Medis
            </label>
            <span className="text-[11px] text-slate-400">Rincian dosis dan aturan pakai</span>
          </div>
          <textarea
            rows={3}
            value={terapiObat}
            onChange={(e) => setTerapiObat(e.target.value)}
            placeholder="Contoh: Paracetamol 500mg 3x1 tab prn demam, Amoxicillin 500mg 3x1 tab (habiskan), Antasida DOEN 3x1 cth ac"
            className="w-full text-xs font-mono rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 leading-relaxed bg-emerald-50/20"
          />
        </div>

        {/* Section D: Tindakan Medis & Laboratorium (Side-by-side grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Tindakan Medis */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Tindakan Medis / Prosedur
            </label>
            <Input
              placeholder="Contoh: Injeksi, Ganti Balut, Nebulizer, Sirkumsisi"
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              className="text-xs h-8 bg-white"
            />
            <Input
              placeholder="Catatan tambahan tindakan medis..."
              value={keteranganTindakan}
              onChange={(e) => setKeteranganTindakan(e.target.value)}
              className="text-xs h-8 bg-white"
            />
          </div>

          {/* Pemeriksaan Laboratorium Sederhana */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              Pemeriksaan Lab Sederhana
            </label>
            <Input
              placeholder="Jenis Lab: GDS, Asam Urat, Kolesterol, Hb"
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              className="text-xs h-8 bg-white"
            />
            <Input
              placeholder="Hasil: Misal 125 mg/dL / Negatif"
              value={labHasil}
              onChange={(e) => setLabHasil(e.target.value)}
              className="text-xs h-8 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Sticky Action Footer */}
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
            className="w-full sm:w-auto min-h-[44px] text-xs text-slate-600 gap-1.5 justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Perubahan
          </Button>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[44px] text-xs font-bold px-5 py-2.5 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Rekam Medis
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ExaminationForm;
