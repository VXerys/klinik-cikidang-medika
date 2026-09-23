'use client';

import React, { useState } from 'react';
import {
  Warning,
  CheckCircle,
  CaretRight,
  User,
  Heartbeat,
  FileText,
} from '@phosphor-icons/react';
import { Lungs } from 'healthicons-react';
import { toast } from 'sonner';
import type { TbcProgram } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';

interface TbcControlCardProps {
  program: TbcProgram;
  onRefresh: () => void;
}

export function TbcControlCard({ program, onRefresh }: TbcControlCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(program.bulan_ke || 1);
  const [statusTbc, setStatusTbc] = useState(program.status_tbc);
  const [dahakResult, setDahakResult] = useState(program.hasil_dahak_akhir || 'Belum Periksa');
  const [notes, setNotes] = useState(program.catatan || '');

  // Cek apakah mangkir (>7 hari sejak ekspektasi kontrol bulan berjalan)
  const startDate = new Date(program.tanggal_mulai);
  const now = new Date();
  const expectedMonthsPassed =
    (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  const isMangkir =
    program.status_tbc === 'Mangkir' ||
    (program.status_tbc === 'Dalam Pengobatan' && expectedMonthsPassed > (program.bulan_ke || 1));

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const fase = currentMonth <= 2 ? 'Intensif' : currentMonth < 6 ? 'Lanjutan' : 'Selesai';
      const { error } = await supabase
        .from('tbc_programs')
        .update({
          bulan_ke: currentMonth,
          fase_pengobatan: fase,
          status_tbc: statusTbc,
          hasil_dahak_akhir: dahakResult,
          catatan: notes,
        })
        .eq('id', program.id);

      if (error) throw error;
      toast.success(`Kendali TBC ${program.pasien?.nama || ''} berhasil diperbarui`);
      setShowUpdateModal(false);
      onRefresh();
    } catch (err) {
      console.error('Error updating TBC program:', err);
      toast.error('Gagal memperbarui status kendali TBC');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition">
      {/* Header Info Pasien */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0">
            <Lungs className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {program.pasien?.nama || 'Pasien TBC'}
              </h3>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {program.pasien?.no_rm || '-'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Desa {program.pasien?.desa || '-'} • Usia {program.pasien?.usia || '-'} thn • {program.tipe_pasien}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMangkir ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
              <Warning className="w-3.5 h-3.5" weight="duotone" />
              Mangkir Kontrol
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" weight="duotone" />
              {program.status_tbc}
            </span>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {program.kategori_oat}
          </span>
        </div>
      </div>

      {/* 6-Month Visual Progression Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700">
            Fase Pengobatan: <span className="text-blue-600">{program.fase_pengobatan}</span> (Bulan ke-{program.bulan_ke || 1} dari 6)
          </span>
          <span className="text-slate-400 text-[11px]">
            Mulai: {new Date(program.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* 6 Stage Blocks */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6].map((month) => {
            const isCompleted = month < (program.bulan_ke || 1);
            const isCurrent = month === (program.bulan_ke || 1);
            const isIntensive = month <= 2;

            return (
              <div
                key={month}
                className={`p-2 rounded-xl text-center border transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/30'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  Bln {month}
                </div>
                <div className="text-[9px] mt-0.5 truncate font-medium">
                  {isIntensive ? '4FDC' : '2FDC'}
                </div>
                {/* Lab check point indicator at month 2, 5, 6 */}
                {(month === 2 || month === 5 || month === 6) && (
                  <div
                    className={`mt-1 text-[8px] font-bold px-1 py-0.2 rounded ${
                      isCurrent
                        ? 'bg-blue-800 text-blue-100'
                        : isCompleted
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    BTA
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lab Dahak & Catatan Tambahan */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Heartbeat className="w-4 h-4 text-slate-400 shrink-0" weight="duotone" />
          <span>
            Evaluasi BTA Terakhir: <strong className="text-slate-800">{program.hasil_dahak_akhir || 'Belum Periksa'}</strong>
          </span>
        </div>
        {program.catatan && (
          <div className="text-slate-500 italic text-[11px] truncate max-w-md">
            &ldquo;{program.catatan}&rdquo;
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowUpdateModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition self-end sm:self-auto focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        >
          <span>Update Status</span>
          <CaretRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal Update Status */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Perbarui Kendali TBC - ${program.pasien?.nama || 'Pasien'}`}
        description="Pembaruan progres kohort bulanan, hasil BTA, dan catatan klinis"
        maxWidth="md"
      >
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Progres Bulan Ke:
              </label>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
              >
                {[1, 2, 3, 4, 5, 6].map((m) => (
                  <option key={m} value={m}>
                    Bulan ke-{m} ({m <= 2 ? 'Fase Intensif 4FDC' : 'Fase Lanjutan 2FDC'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Pengobatan TBC:
              </label>
              <select
                value={statusTbc}
                onChange={(e) => setStatusTbc(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
              >
                <option value="Dalam Pengobatan">Dalam Pengobatan</option>
                <option value="Sembuh">Sembuh (BTA Negatif)</option>
                <option value="Pengobatan Lengkap">Pengobatan Lengkap</option>
                <option value="Mangkir">Mangkir (Drop Out)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hasil Uji Dahak BTA:
              </label>
              <select
                value={dahakResult}
                onChange={(e) => setDahakResult(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px]"
              >
                <option value="Belum Periksa">Belum Periksa</option>
                <option value="Negatif (-)">Negatif (-)</option>
                <option value="Positif (+)">Positif (+)</option>
                <option value="Positif (++)">Positif (++)</option>
                <option value="Positif (+++)">Positif (+++)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Klinis / Evaluasi:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pasien teratur minum OAT, keluhan batuk berkurang..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowUpdateModal(false)}
              disabled={isUpdating}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none shadow-xs"
            >
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
