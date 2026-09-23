'use client';

import React, { useState } from 'react';
import { Pill, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Patient } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { PatientSearchAutocomplete } from '@/components/pendaftaran/PatientSearchAutocomplete';
import { createClient } from '@/lib/supabase/client';

interface NewTbcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewTbcModal({ isOpen, onClose, onSuccess }: NewTbcModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tipePasien, setTipePasien] = useState<'Kasus Baru' | 'Kambuh' | 'Pindahan'>('Kasus Baru');
  const [kategoriOat, setKategoriOat] = useState<'Kategori 1' | 'Kategori 2'>('Kategori 1');
  const [catatan, setCatatan] = useState('');
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
      const { error } = await supabase.from('tbc_programs').insert({
        pasien_id: selectedPatient.id,
        tanggal_mulai: tanggalMulai,
        tipe_pasien: tipePasien,
        kategori_oat: kategoriOat,
        fase_pengobatan: 'Intensif',
        bulan_ke: 1,
        hasil_dahak_akhir: 'Belum Periksa',
        status_tbc: 'Dalam Pengobatan',
        catatan: catatan.trim() || null,
      });

      if (error) throw error;
      toast.success(`Pasien ${selectedPatient.nama} berhasil didaftarkan ke Kartu Kendali TBC 6 Bulan`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating TBC program:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mendaftarkan pasien ke program TBC');
      toast.error('Gagal mendaftarkan pasien ke program TBC');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pendaftaran Kartu Kendali TBC 6 Bulan"
      description="Kohort pemantauan pengobatan OAT (Tuberkulosis) terstandar"
      icon={
        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
          <Pill weight="duotone" className="w-5 h-5" />
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
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
                  Desa {selectedPatient.desa} • {selectedPatient.jenis_kelamin} • Usia {selectedPatient.usia || '-'} thn
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
              Tanggal Mulai Minum OAT <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tipe Kasus Pasien
            </label>
            <select
              value={tipePasien}
              onChange={(e) => setTipePasien(e.target.value as 'Kasus Baru' | 'Kambuh' | 'Pindahan')}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
            >
              <option value="Kasus Baru">Kasus Baru</option>
              <option value="Kambuh">Kambuh (Relapse)</option>
              <option value="Pindahan">Pindahan (Transfer In)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Kategori Regimen OAT
          </label>
          <select
            value={kategoriOat}
            onChange={(e) => setKategoriOat(e.target.value as 'Kategori 1' | 'Kategori 2')}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
          >
            <option value="Kategori 1">Kategori 1 (2HRZE / 4H3R3 - Pasien Baru)</option>
            <option value="Kategori 2">Kategori 2 (2HRZES / 1HRZE / 5H3R3E3 - Pasien Ulang)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Catatan Klinis / Anamnesa Tambahan
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Batuk berdahak &gt; 2 minggu, penurunan berat badan, riwayat kontak erat..."
            rows={3}
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
            {isSubmitting ? (
              <>
                <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              'Daftarkan Pasien TBC'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
