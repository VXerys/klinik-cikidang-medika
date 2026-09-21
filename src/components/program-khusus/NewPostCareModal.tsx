'use client';

import React, { useState } from 'react';
import { X, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Patient } from '@/types/database';
import { PatientSearchAutocomplete } from '@/components/pendaftaran/PatientSearchAutocomplete';
import { createClient } from '@/lib/supabase/client';

interface NewPostCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewPostCareModal({ isOpen, onClose, onSuccess }: NewPostCareModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tglKontrol, setTglKontrol] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] // default 3 days from now
  );
  const [kondisiTerakhir, setKondisiTerakhir] = useState('');
  const [keluhanLanjutan, setKeluhanLanjutan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg('Silakan pilih pasien terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('post_cares').insert({
        pasien_id: selectedPatient.id,
        tanggal_kontrol_berikutnya: tglKontrol,
        kondisi_terakhir: kondisiTerakhir.trim() || null,
        keluhan_lanjutan: keluhanLanjutan.trim() || null,
        status_kontrol: 'Menunggu',
      });

      if (error) throw error;
      toast.success(`Jadwal kontrol pos-rawat untuk ${selectedPatient.nama} berhasil disimpan`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating post care entry:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menjadwalkan kontrol pos-rawat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Jadwalkan Kontrol Pasien Pos-Rawat
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemantauan paska rawat inap RS atau paska tindakan bedah minor
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tanggal Kontrol Berikutnya <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={tglKontrol}
              onChange={(e) => setTglKontrol(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Diagnosa / Kondisi Terakhir Saat Pulang
            </label>
            <input
              type="text"
              value={kondisiTerakhir}
              onChange={(e) => setKondisiTerakhir(e.target.value)}
              placeholder="Misal: Pasca opname Typhoid 4 hari di RSUD Sekarwangi, demam sudah turun..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Keluhan Lanjutan / Catatan Observasi
            </label>
            <textarea
              value={keluhanLanjutan}
              onChange={(e) => setKeluhanLanjutan(e.target.value)}
              placeholder="Misal: Perlu evaluasi lab DL ulang, cek bekas luka infus..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
              {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan Kontrol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
