'use client';

import React, { useState } from 'react';
import { X, Scissors, Upload, Camera, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Patient } from '@/types/database';
import { PatientSearchAutocomplete } from '@/components/pendaftaran/PatientSearchAutocomplete';
import { createClient } from '@/lib/supabase/client';
import { uploadMedicalPhoto } from '@/lib/storage';

interface NewCircumcisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewCircumcisionModal({ isOpen, onClose, onSuccess }: NewCircumcisionModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tanggalTindakan, setTanggalTindakan] = useState(new Date().toISOString().split('T')[0]);
  const [dokterNama, setDokterNama] = useState('dr. Ovan');
  const [metode, setMetode] = useState('Laser / Kauter');
  const [biaya, setBiaya] = useState(750000);
  const [kondisiLuka, setKondisiLuka] = useState('Luka bersih, perdarahan terkontrol');
  const [catatan, setCatatan] = useState('');

  // Image files & preview
  const [photo1File, setPhoto1File] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (file: File | undefined, slot: 1 | 2) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (slot === 1) {
      setPhoto1File(file);
      setPhoto1Preview(previewUrl);
    } else {
      setPhoto2File(file);
      setPhoto2Preview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg('Silakan pilih pasien terlebih dahulu');
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

      // 1. Upload photo 1 if present
      if (photo1File) {
        setUploadProgress('Mengompres & mengunggah Foto 1 (WebP < 300KB)...');
        const res1 = await uploadMedicalPhoto(photo1File, selectedPatient.id, `${tindakanTempId}_1`);
        foto1Url = res1.path;
        usedProvider = res1.provider;
      }

      // 2. Upload photo 2 if present
      if (photo2File) {
        setUploadProgress('Mengompres & mengunggah Foto 2 (WebP < 300KB)...');
        const res2 = await uploadMedicalPhoto(photo2File, selectedPatient.id, `${tindakanTempId}_2`);
        foto2Url = res2.path;
        usedProvider = res2.provider;
      }

      setUploadProgress('Menyimpan rekam medis sirkumsisi...');

      // 3. Find doctor ID if possible
      const { data: doctors } = await supabase
        .from('doctors')
        .select('id')
        .ilike('nama', `%${dokterNama}%`)
        .limit(1);
      const dokterId = doctors && doctors.length > 0 ? doctors[0].id : null;

      // 4. Insert into circumcisions table
      const { error } = await supabase.from('circumcisions').insert({
        pasien_id: selectedPatient.id,
        dokter_id: dokterId,
        tanggal_tindakan: tanggalTindakan,
        metode,
        kondisi_luka: kondisiLuka,
        foto_1_url: foto1Url,
        foto_2_url: foto2Url,
        storage_provider: usedProvider,
        biaya,
        catatan: catatan.trim() || null,
      });

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error recording circumcision:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan rekam medis sirkumsisi');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencatatan Tindakan Sunat (Sirkumsisi) Modern
              </h3>
              <p className="text-[11px] text-slate-500">
                Dokumentasi metode, operator, dan evaluasi foto luka WebP privat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cari Pasien */}
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
                  className="text-xs text-blue-600 font-semibold underline hover:no-underline p-1"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <PatientSearchAutocomplete
                onSelectPatient={(p) => setSelectedPatient(p)}
                onAddNewPatient={() => alert('Silakan daftarkan pasien di menu Pendaftaran')}
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Evaluasi Kondisi Luka / Observasi
            </label>
            <input
              type="text"
              value={kondisiLuka}
              onChange={(e) => setKondisiLuka(e.target.value)}
              placeholder="Misal: Luka bersih, tidak ada perdarahan aktif, edema minimal"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Upload Foto Luka (Maksimal 2 Foto, Otomatis Kompres WebP < 300KB) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Dokumentasi Foto Medis (Privat & Terenkripsi)
              </label>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Otomatis WebP &lt; 300KB
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Foto disimpan di cloud privat aman, hanya dokter dan tim berwenang yang dapat melihat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Slot Foto 1 */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-3 text-center hover:border-blue-400 transition bg-slate-50/50">
                {photo1Preview ? (
                  <div className="space-y-2">
                    <img
                      src={photo1Preview}
                      alt="Preview Foto 1"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto1File(null);
                        setPhoto1Preview(null);
                      }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus Foto 1
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="font-semibold text-slate-700 block">Unggah Foto Luka 1</span>
                    <span className="text-[10px] text-slate-400">Paska tindakan</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e.target.files?.[0], 1)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Slot Foto 2 */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-3 text-center hover:border-blue-400 transition bg-slate-50/50">
                {photo2Preview ? (
                  <div className="space-y-2">
                    <img
                      src={photo2Preview}
                      alt="Preview Foto 2"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto2File(null);
                        setPhoto2Preview(null);
                      }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus Foto 2
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="font-semibold text-slate-700 block">Unggah Foto Luka 2</span>
                    <span className="text-[10px] text-slate-400">Kontrol / evaluasi</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e.target.files?.[0], 2)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Catatan Tindakan Tambahan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Instruksi perawatan luka di rumah, obat pulang (antibiotik & analgetik)..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              {uploadProgress && (
                <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {uploadProgress}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition min-h-[44px] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none shadow-xs"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Rekam Sirkumsisi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
