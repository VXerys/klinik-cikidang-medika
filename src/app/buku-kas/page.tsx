'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  CalendarBlank,
  ArrowClockwise,
  WarningCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { CashFlow } from '@/types/database';
import { MONTH_NAMES_ID } from '@/constants/clinic';
import { CashFlowSummaryCards } from '@/components/buku-kas/CashFlowSummaryCards';
import { CashReconciliationCard } from '@/components/buku-kas/CashReconciliationCard';
import { CashFlowTable } from '@/components/buku-kas/CashFlowTable';
import { AddCashFlowModal } from '@/components/buku-kas/AddCashFlowModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function BukuKasPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const todayStr = currentDate.toISOString().split('T')[0];

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [todayCashVisitsTotal, setTodayCashVisitsTotal] = useState(0);
  const [todayCashVisitsCount, setTodayCashVisitsCount] = useState(0);
  const [todayCashDepositsTotal, setTodayCashDepositsTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Masuk' | 'Keluar'>('Masuk');

  const fetchCashFlows = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const startOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      const endOfMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .gte('tanggal', startOfMonth)
        .lt('tanggal', endOfMonth)
        .order('tanggal', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCashFlows((data as unknown as CashFlow[]) || []);
    } catch (err) {
      console.error('Error fetching cash flows:', err);
      const msg =
        err instanceof Error ? err.message : 'Gagal memuat mutasi buku kas dari database.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchReconciliation = useCallback(async () => {
    try {
      const supabase = createClient();

      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('biaya_periksa, pendapatan_lain')
        .eq('tanggal_periksa', todayStr)
        .eq('jenis_pembayaran', 'Tunai')
        .eq('status_pembayaran', 'Lunas');

      if (!visitsError && visitsData) {
        const totalVisitsCash = visitsData.reduce((acc, v) => {
          const biaya = Number(v.biaya_periksa) || 0;
          const lain = Number(v.pendapatan_lain) || 0;
          return acc + biaya + lain;
        }, 0);
        setTodayCashVisitsTotal(totalVisitsCash);
        setTodayCashVisitsCount(visitsData.length);
      }

      const { data: flowData, error: flowError } = await supabase
        .from('cash_flows')
        .select('nominal')
        .eq('tanggal', todayStr)
        .eq('kategori', 'Setor Tunai');

      if (!flowError && flowData) {
        const totalDeposits = flowData.reduce((acc, f) => acc + (Number(f.nominal) || 0), 0);
        setTodayCashDepositsTotal(totalDeposits);
      }
    } catch (err) {
      console.error('Error fetching cashier reconciliation:', err);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchCashFlows();
  }, [fetchCashFlows]);

  useEffect(() => {
    fetchReconciliation();
  }, [fetchReconciliation]);

  const totalMasuk = cashFlows
    .filter((cf) => cf.jenis === 'Masuk')
    .reduce((acc, cf) => acc + (Number(cf.nominal) || 0), 0);

  const totalKeluar = cashFlows
    .filter((cf) => cf.jenis === 'Keluar')
    .reduce((acc, cf) => acc + (Number(cf.nominal) || 0), 0);

  const saldoBersih = totalMasuk - totalKeluar;

  const totalSetorTunai = cashFlows
    .filter((cf) => cf.kategori === 'Setor Tunai')
    .reduce((acc, cf) => acc + (Number(cf.nominal) || 0), 0);

  const handleOpenModal = (type: 'Masuk' | 'Keluar') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCashFlowAdded = (newFlow: CashFlow) => {
    const [flowYear, flowMonth] = newFlow.tanggal.split('-').map(Number);
    if (flowYear === selectedYear && flowMonth === selectedMonth) {
      setCashFlows((prev) => [newFlow, ...prev]);
    }
    if (newFlow.tanggal === todayStr) {
      fetchReconciliation();
    }
  };

  const handleDeleteCashFlow = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('cash_flows').delete().eq('id', id);

      if (error) {
        toast.error(`Gagal menghapus transaksi: ${error.message}`);
        return;
      }

      setCashFlows((prev) => prev.filter((cf) => cf.id !== id));
      fetchReconciliation();
    } catch {
      toast.error('Terjadi kesalahan saat menghapus transaksi kas.');
    }
  };

  const handleManualRefresh = () => {
    fetchCashFlows();
    fetchReconciliation();
    toast.info('Memperbarui data mutasi kas...');
  };

  const selectedMonthName = MONTH_NAMES_ID[selectedMonth - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Wallet weight="duotone" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Buku Kas Operasional & Kapitasi BPJS
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan dana kapitasi BPJS, pembelian obat, operasional non-klinik, dan setor tunai
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleOpenModal('Masuk')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[44px]"
            leftIcon={<ArrowDownLeft weight="bold" className="w-4 h-4" />}
          >
            + Kas Masuk (Pemasukan)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleOpenModal('Keluar')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold min-h-[44px]"
            leftIcon={<ArrowUpRight weight="bold" className="w-4 h-4" />}
          >
            + Kas Keluar (Pengeluaran)
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CalendarBlank weight="duotone" className="w-4 h-4 text-blue-600" />
            Periode Laporan:
          </span>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 min-h-[44px] text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_NAMES_ID.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 min-h-[44px] text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMonth(currentMonth);
              setSelectedYear(currentYear);
            }}
            disabled={selectedMonth === currentMonth && selectedYear === currentYear}
            className="text-xs font-semibold min-h-[44px]"
          >
            Bulan Ini
          </Button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="text-xs min-h-[44px] min-w-[44px]"
            title="Muat ulang mutasi kas"
          >
            <ArrowClockwise
              weight="bold"
              className={cn('w-4 h-4', isLoading && 'animate-spin')}
            />
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WarningCircle weight="duotone" className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCashFlows}
            className="text-xs min-h-[38px]"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      <CashFlowSummaryCards
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
        saldoBersih={saldoBersih}
        totalSetorTunai={totalSetorTunai}
        monthName={`${selectedMonthName} ${selectedYear}`}
        isLoading={isLoading}
      />

      <CashReconciliationCard
        todayCashVisitsTotal={todayCashVisitsTotal}
        todayCashVisitsCount={todayCashVisitsCount}
        todayCashDepositsTotal={todayCashDepositsTotal}
        onOpenSetorTunai={() => handleOpenModal('Masuk')}
      />

      <CashFlowTable
        cashFlows={cashFlows}
        isLoading={isLoading}
        onDelete={handleDeleteCashFlow}
      />

      <AddCashFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        onSuccess={handleCashFlowAdded}
      />
    </div>
  );
}
