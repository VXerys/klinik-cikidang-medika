'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Save,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CASH_FLOW_CATEGORIES } from '@/constants/clinic';
import { createClient } from '@/lib/supabase/client';
import type { CashFlow } from '@/types/database';
import { formatRupiah, cn } from '@/lib/utils';

export interface AddCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'Masuk' | 'Keluar';
  onSuccess?: (newFlow: CashFlow) => void;
}

export function AddCashFlowModal({
  isOpen,
  onClose,
  initialType = 'Masuk',
  onSuccess,
}: AddCashFlowModalProps) {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [jenis, setJenis] = useState<'Masuk' | 'Keluar'>(initialType);
  const [tanggal, setTanggal] = useState(getTodayString());
  const [kategori, setKategori] = useState('');
  const [nominalDisplay, setNominalDisplay] = useState('');
  const [nominalRaw, setNominalRaw] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial type whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setJenis(initialType);
      const defaultCategories =
        initialType === 'Masuk' ? CASH_FLOW_CATEGORIES.masuk : CASH_FLOW_CATEGORIES.keluar;
      setKategori(defaultCategories[0]);
      setTanggal(getTodayString());
      setNominalDisplay('');
      setNominalRaw(0);
      setKeterangan('');
      setErrorMessage(null);
    }
  }, [isOpen, initialType]);

  // When switching jenis, reset kategori to the first category of that type
  const handleJenisChange = (newJenis: 'Masuk' | 'Keluar') => {
    setJenis(newJenis);
    const options = newJenis === 'Masuk' ? CASH_FLOW_CATEGORIES.masuk : CASH_FLOW_CATEGORIES.keluar;
    setKategori(options[0]);
  };

  // Format currency display while typing
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setNominalDisplay('');
      setNominalRaw(0);
      return;
    }

    const num = parseInt(rawVal, 10);
    setNominalRaw(num);
    setNominalDisplay(new Intl.NumberFormat('id-ID').format(num));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nominalRaw || nominalRaw <= 0) {
      setErrorMessage('Nominal kas wajib diisi dan bernilai lebih dari Rp 0.');
      return;
    }

    if (!kategori) {
      setErrorMessage('Kategori mutasi kas wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('cash_flows')
        .insert({
          tanggal,
          jenis,
          kategori,
          nominal: nominalRaw,
          keterangan: keterangan.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (onSuccess && data) {
        onSuccess(data as CashFlow);
      }
      onClose();
    } catch (err) {
      console.error('Error inserting cash flow:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal menyimpan transaksi kas ke database.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = (
    jenis === 'Masuk' ? CASH_FLOW_CATEGORIES.masuk : CASH_FLOW_CATEGORIES.keluar
  ).map((cat) => ({ value: cat, label: cat }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jenis === 'Masuk' ? 'Tambah Kas Masuk (Pemasukan)' : 'Tambah Kas Keluar (Pengeluaran)'}
      description="Catat mutasi arus kas operasional klinik dengan akurat"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Transaction Type Toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Jenis Transaksi Mutasi <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleJenisChange('Masuk')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold border transition select-none',
                jenis === 'Masuk'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Kas Masuk (+)</span>
            </button>

            <button
              type="button"
              onClick={() => handleJenisChange('Keluar')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold border transition select-none',
                jenis === 'Keluar'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Kas Keluar (-)</span>
            </button>
          </div>
        </div>

        {/* 2. Tanggal Transaksi */}
        <div>
          <Input
            label="Tanggal Transaksi"
            type="date"
            requiredIndicator
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            leftElement={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* 3. Kategori Mutasi */}
        <div>
          <Select
            label="Kategori Kas"
            requiredIndicator
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            options={categoryOptions}
          />
        </div>

        {/* 4. Nominal Mutasi */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">
              Rp
            </span>
            <input
              type="text"
              required
              placeholder="0"
              value={nominalDisplay}
              onChange={handleNominalChange}
              className="w-full py-2.5 pl-10 pr-3 min-h-[44px] text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          {nominalRaw > 0 && (
            <p className="text-[11px] font-mono text-slate-500 pl-1">
              Terbaca: <span className="font-semibold text-slate-800">{formatRupiah(nominalRaw)}</span>
            </p>
          )}
        </div>

        {/* 5. Catatan Keterangan */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Keterangan / Rincian Transaksi
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Pencairan Dana Kapitasi BPJS September 2026 / Pembelian Paracetamol & Spuit 3cc..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* 6. Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className={cn(
              'w-full sm:w-auto font-bold text-white shadow-sm',
              jenis === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            )}
            leftIcon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddCashFlowModal;
