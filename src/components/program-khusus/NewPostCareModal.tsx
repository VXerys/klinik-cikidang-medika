'use client';

import React, { useState } from 'react';
import { CalendarCheck, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
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
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [kondisiTerakhir, setKondisiTerakhir] = useState('');
  const [keluhanLanjutan, setKeluhanLanjutan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg('Silakan cari dan pilih pasien terlebih dahulu');
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
      toast.error('Gagal menjadwalkan kontrol pos-rawat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jadwalkan Kontrol Pasien Pos-Rawat"
      description="Pemantauan paska rawat inap RS atau paska tindakan bedah minor"
      icon={
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <CalendarCheck weight="duotone" className="w-5 h-5" />
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <WarningCircle weight="duotone" className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cari Pasien */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Cari &amp; Pilih Pasien <span className="text-rose-500">*</span>
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
            placeholder="Contoh: Pasca opname Typhoid 4 hari di RSUD Sekarwangi, demam sudah turun..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Keluhan Lanjutan / Rencana Observasi
          </label>
          <textarea
            value={keluhanLanjutan}
            onChange={(e) => setKeluhanLanjutan(e.target.value)}
            placeholder="Contoh: Perlu evaluasi lab DL ulang, cek kebersihan bekas infus..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        </div>

        {/* Sticky Footer Actions */}
        <div className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:px-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10">
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
                <span>Menjadwalkan...</span>
              </>
            ) : (
              'Jadwalkan Kontrol'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
