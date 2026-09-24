'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Camera,
  Images,
  Trash,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  FileImage,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { PatientSearchAutocomplete } from '@/components/pendaftaran/PatientSearchAutocomplete';
import { createClient } from '@/lib/supabase/client';
import { compressImageToWebP, uploadMedicalPhoto } from '@/lib/storage';

interface NewCircumcisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPatient?: Patient | null;
}

interface PhotoSlotState {
  file: File | null;
  previewUrl: string | null;
  compressedBlob: Blob | null;
  originalSizeKb: number | null;
  compressedSizeKb: number | null;
  isCompressing: boolean;
}

const initialSlotState: PhotoSlotState = {
  file: null,
  previewUrl: null,
  compressedBlob: null,
  originalSizeKb: null,
  compressedSizeKb: null,
  isCompressing: false,
};

export function NewCircumcisionModal({ isOpen, onClose, onSuccess, initialPatient }: NewCircumcisionModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient || null);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient, isOpen]);

  const [tanggalTindakan, setTanggalTindakan] = useState(new Date().toISOString().split('T')[0]);
  const [dokterNama, setDokterNama] = useState('dr. Ovan');
  const [metode, setMetode] = useState('Laser / Kauter');
  const [biaya, setBiaya] = useState(750000);
  const [kondisiLuka, setKondisiLuka] = useState('Luka bersih, perdarahan terkontrol');
  const [catatan, setCatatan] = useState('');

  const [slot1, setSlot1] = useState<PhotoSlotState>(initialSlotState);
  const [slot2, setSlot2] = useState<PhotoSlotState>(initialSlotState);

  const slot1CameraRef = useRef<HTMLInputElement>(null);
  const slot1GalleryRef = useRef<HTMLInputElement>(null);
  const slot2CameraRef = useRef<HTMLInputElement>(null);
  const slot2GalleryRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProcessFile = async (file: File | undefined, slotNumber: 1 | 2) => {
    if (!file) return;

    const origKb = Math.round(file.size / 1024);
    const preview = URL.createObjectURL(file);

    const updateState = slotNumber === 1 ? setSlot1 : setSlot2;

    updateState({
      file,
      previewUrl: preview,
      compressedBlob: null,
      originalSizeKb: origKb,
      compressedSizeKb: null,
      isCompressing: true,
    });

    try {
      const blob = await compressImageToWebP(file);
      const compKb = Math.round(blob.size / 1024);
      updateState((prev) => ({
        ...prev,
        compressedBlob: blob,
        compressedSizeKb: compKb,
        isCompressing: false,
      }));
    } catch (err) {
      console.error('Error compressing medical photo:', err);
      updateState((prev) => ({
        ...prev,
        isCompressing: false,
      }));
      toast.error('Gagal mengompres gambar, format file tidak didukung.');
    }
  };

  const handleClearSlot = (slotNumber: 1 | 2) => {
    if (slotNumber === 1) {
      if (slot1.previewUrl) URL.revokeObjectURL(slot1.previewUrl);
      setSlot1(initialSlotState);
      if (slot1CameraRef.current) slot1CameraRef.current.value = '';
      if (slot1GalleryRef.current) slot1GalleryRef.current.value = '';
    } else {
      if (slot2.previewUrl) URL.revokeObjectURL(slot2.previewUrl);
      setSlot2(initialSlotState);
      if (slot2CameraRef.current) slot2CameraRef.current.value = '';
      if (slot2GalleryRef.current) slot2GalleryRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg('Silakan cari dan pilih pasien terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setUploadProgress('Menyimpan data tindakan...');

    try {
      const supabase = createClient();
      const tindakanTempId = `sirkum_${Date.now()}`;

      let foto1Url: string | null = null;
      let foto2Url: string | null = null;
      let usedProvider: 'supabase' | 'cloudinary' = 'supabase';

      if (slot1.compressedBlob || slot1.file) {
        setUploadProgress('Mengunggah Foto 1 ke penyimpanan privat...');
        const payload1 = slot1.compressedBlob || slot1.file!;
        const res1 = await uploadMedicalPhoto(payload1, selectedPatient.id, `${tindakanTempId}_1`);
        foto1Url = res1.path;
        usedProvider = res1.provider;
      }

      if (slot2.compressedBlob || slot2.file) {
        setUploadProgress('Mengunggah Foto 2 ke penyimpanan privat...');
        const payload2 = slot2.compressedBlob || slot2.file!;
        const res2 = await uploadMedicalPhoto(payload2, selectedPatient.id, `${tindakanTempId}_2`);
        foto2Url = res2.path;
        usedProvider = res2.provider;
      }

      setUploadProgress('Menyimpan rekam medis sirkumsisi ke database...');

      const { data: doctors } = await supabase
        .from('doctors')
        .select('id')
        .ilike('nama', `%${dokterNama}%`)
        .limit(1);
      const dokterId = doctors && doctors.length > 0 ? doctors[0].id : null;

      const { error } = await supabase.from('circumcisions').insert({
        pasien_id: selectedPatient.id,
        dokter_id: dokterId,
        tanggal_tindakan: tanggalTindakan,
        metode,
        kondisi_luka: kondisiLuka.trim() || null,
        foto_1_url: foto1Url,
        foto_2_url: foto2Url,
        storage_provider: usedProvider,
        biaya,
        catatan: catatan.trim() || null,
      });

      if (error) throw error;

      toast.success(`Tindakan sirkumsisi untuk ${selectedPatient.nama} berhasil didokumentasikan`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error recording circumcision:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan rekam medis sirkumsisi');
      toast.error('Gagal mendokumentasikan tindakan sirkumsisi');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const renderPhotoSlot = (slotNumber: 1 | 2, label: string, sublabel: string) => {
    const slot = slotNumber === 1 ? slot1 : slot2;
    const cameraRef = slotNumber === 1 ? slot1CameraRef : slot2CameraRef;
    const galleryRef = slotNumber === 1 ? slot1GalleryRef : slot2GalleryRef;

    return (
      <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-bold text-slate-800 text-xs">{label}</span>
            <span className="text-[10px] text-slate-500">{sublabel}</span>
          </div>

          {slot.previewUrl ? (
            <div className="space-y-2 mt-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                <img
                  src={slot.previewUrl}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleClearSlot(slotNumber)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center shadow-xs"
                  aria-label="Hapus foto"
                  title="Hapus foto"
                >
                  <Trash weight="duotone" className="w-4 h-4" />
                </button>
              </div>

              {slot.isCompressing ? (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                  <CircleNotch weight="bold" className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengompresi ke WebP &lt; 300KB...</span>
                </div>
              ) : slot.compressedSizeKb ? (
                <div className="flex items-center justify-between text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                    WebP Teroptimasi
                  </span>
                  <span className="font-mono text-emerald-800">
                    {slot.originalSizeKb} KB &rarr; {slot.compressedSizeKb} KB
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 text-center border border-dashed border-slate-300 rounded-xl p-3 bg-white">
              <FileImage weight="duotone" className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-[11px] font-medium text-slate-600 mb-2">
                Dokumentasi luka paska tindakan
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition min-h-[44px]"
                >
                  <Camera weight="duotone" className="w-4 h-4 shrink-0" />
                  <span>Kamera</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition min-h-[44px]"
                >
                  <Images weight="duotone" className="w-4 h-4 shrink-0" />
                  <span>Galeri</span>
                </button>
              </div>

              {/* Kamera langsung untuk tablet/ponsel */}
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleProcessFile(e.target.files?.[0], slotNumber)}
                className="hidden"
              />

              {/* Pemilih file standar untuk laptop/desktop */}
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleProcessFile(e.target.files?.[0], slotNumber)}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pencatatan Tindakan Sunat (Sirkumsisi) Modern"
      description="Dokumentasi metode, operator medis, dan evaluasi foto luka WebP privat"
      icon={
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Scissors weight="duotone" className="w-5 h-5" />
        </div>
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <WarningCircle weight="duotone" className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cari & Pilih Pasien */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Cari & Pilih Pasien <span className="text-rose-500">*</span>
          </label>
          {selectedPatient ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900">
                  {selectedPatient.nama} ({selectedPatient.no_rm})
                </div>
                <div className="text-[11px] text-blue-700">
                  Desa {selectedPatient.desa} • Usia {selectedPatient.usia || '-'} thn
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-xs text-blue-700 font-semibold underline hover:no-underline p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Ganti
              </button>
            </div>
          ) : (
            <PatientSearchAutocomplete
              onSelectPatient={(p) => setSelectedPatient(p)}
              onAddNewPatient={() => toast.info('Silakan daftarkan pasien baru pada modul Pendaftaran')}
              placeholder="Ketik Nama, No RM, atau Desa..."
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tanggal Tindakan <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalTindakan}
              onChange={(e) => setTanggalTindakan(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Dokter / Operator Pelaksana
            </label>
            <select
              value={dokterNama}
              onChange={(e) => setDokterNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            >
              <option value="dr. Ovan">dr. Ovan (Dokter Umum)</option>
              <option value="dr. Neneng">dr. Neneng (Dokter Umum)</option>
              <option value="Admin/Bdn.Resa">Admin / Bdn. Resa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Metode Sirkumsisi
            </label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            >
              <option value="Laser / Kauter">Laser / Kauter (Flash Cutter)</option>
              <option value="Klamp / Smart Klamp">Klamp / Smart Klamp (Tanpa Jahit)</option>
              <option value="Konvensional / Bedah Minor">Konvensional / Bedah Minor</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Biaya Tindakan (Rp)
            </label>
            <input
              type="number"
              value={biaya}
              onChange={(e) => setBiaya(Number(e.target.value))}
              step="10000"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Evaluasi Kondisi Luka / Observasi Klinis
          </label>
          <input
            type="text"
            value={kondisiLuka}
            onChange={(e) => setKondisiLuka(e.target.value)}
            placeholder="Contoh: Luka bersih, tidak ada perdarahan aktif, edema minimal"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
          />
        </div>

        {/* Upload Foto Luka Medis (Maksimal 2 Foto, WebP < 300KB) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700">
              Dokumentasi Foto Medis (Privat &amp; Terenkripsi)
            </label>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Otomatis WebP &lt; 300KB
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Pilih kamera langsung pada tablet/ponsel klinik atau pilih dari berkas penyimpanan di laptop/komputer.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderPhotoSlot(1, 'Foto 1: Paska Tindakan', 'Saat tindakan selesai')}
            {renderPhotoSlot(2, 'Foto 2: Evaluasi / Kontrol', 'Kunjungan kontrol berikutnya')}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Catatan Tambahan &amp; Terapi Pulang
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Instruksi perawatan luka di rumah, obat pulang (antibiotik & analgetik)..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        </div>

        {/* Sticky Footer Actions */}
        <div className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10">
          <div className="text-[11px] text-slate-500">
            {uploadProgress && (
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <CircleNotch weight="bold" className="w-3.5 h-3.5 animate-spin" />
                {uploadProgress}
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition min-h-[44px] w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition min-h-[44px] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none shadow-xs w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Rekam Sirkumsisi'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
