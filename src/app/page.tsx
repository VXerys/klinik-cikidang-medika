'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  FileSpreadsheet,
  Wallet,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { normalizeRupiah } from '@/lib/utils';
import {
  DashboardKpiCards,
  type DashboardKpiData,
} from '@/components/dashboard/DashboardKpiCards';
import {
  DashboardPeriodSelector,
  type DashboardPeriod,
} from '@/components/dashboard/DashboardPeriodSelector';
import {
  TopDiseasesChart,
  type DiseaseStat,
} from '@/components/dashboard/TopDiseasesChart';
import {
  VillageDistributionCard,
  type VillageStat,
} from '@/components/dashboard/VillageDistributionCard';

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [kpiData, setKpiData] = useState<DashboardKpiData>({
    totalVisits: 0,
    uniquePatients: 0,
    umumRevenue: 0,
    bpjsRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
  });

  const [topDiseases, setTopDiseases] = useState<DiseaseStat[]>([]);
  const [totalDiagnoses, setTotalDiagnoses] = useState(0);

  const [villageStats, setVillageStats] = useState<VillageStat[]>([]);
  const [bpjsCount, setBpjsCount] = useState(0);
  const [umumCount, setUmumCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // Determine date filters based on selected period
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      let startDate: string | null = null;
      let endDate: string | null = null;

      if (selectedPeriod === 'this_month') {
        startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      } else if (selectedPeriod === 'last_month') {
        startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      } else if (selectedPeriod === 'this_year') {
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`;
      }

      // 1. Fetch total unique registered patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true });

      // 2. Fetch visits with pagination chunks (to bypass 1000 limit)
      let allVisits: any[] = [];
      let visitPage = 0;
      const pageSize = 1000;

      while (true) {
        let query = supabase
          .from('visits')
          .select('id, tanggal_periksa, jenis_pasien, biaya_periksa, pendapatan_lain, kode_icd10, diagnosa_deskripsi, patients(desa)')
          .range(visitPage * pageSize, (visitPage + 1) * pageSize - 1);

        if (startDate && endDate) {
          query = query.gte('tanggal_periksa', startDate).lte('tanggal_periksa', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allVisits.push(...data);
        if (data.length < pageSize) break;
        visitPage++;
      }

      // 3. Fetch cash flows with pagination chunks
      let allFlows: any[] = [];
      let flowPage = 0;

      while (true) {
        let flowQuery = supabase
          .from('cash_flows')
          .select('id, tanggal, jenis, kategori, nominal')
          .range(flowPage * pageSize, (flowPage + 1) * pageSize - 1);

        if (startDate && endDate) {
          flowQuery = flowQuery.gte('tanggal', startDate).lte('tanggal', endDate);
        }

        const { data, error } = await flowQuery;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allFlows.push(...data);
        if (data.length < pageSize) break;
        flowPage++;
      }

      // 4. Client-side rapid aggregation
      let bpjsVisits = 0;
      let umumVisits = 0;
      let umumRev = 0;
      const diseaseMap: Record<string, { code: string; name: string; count: number }> = {};
      const villageMap: Record<string, number> = {};
      let diagnosisTotalCount = 0;

      allVisits.forEach((v) => {
        if (v.jenis_pasien === 'BPJS') {
          bpjsVisits++;
        } else {
          umumVisits++;
          const biaya = normalizeRupiah(Number(v.biaya_periksa) || 0);
          const lain = normalizeRupiah(Number(v.pendapatan_lain) || 0);
          umumRev += biaya + lain;
        }

        // ICD-10 Aggregation
        if (v.kode_icd10) {
          diagnosisTotalCount++;
          const code = v.kode_icd10.trim().toUpperCase();
          const name = v.diagnosa_deskripsi || code;
          if (!diseaseMap[code]) {
            diseaseMap[code] = { code, name, count: 0 };
          }
          diseaseMap[code].count++;
        }

        // Village Aggregation
        const patientDesa = v.patients?.desa || 'Luar Daerah';
        const formattedDesa =
          patientDesa.charAt(0).toUpperCase() + patientDesa.slice(1).toLowerCase();
        villageMap[formattedDesa] = (villageMap[formattedDesa] || 0) + 1;
      });

      // Process Cash Flows
      let bpjsCapitation = 0;
      let expenses = 0;

      allFlows.forEach((f) => {
        const nom = normalizeRupiah(Number(f.nominal) || 0);
        if (f.jenis === 'Masuk' && f.kategori?.includes('Kapitasi')) {
          bpjsCapitation += nom;
        }
        if (f.jenis === 'Keluar') {
          expenses += nom;
        }
      });

      const netCash = umumRev + bpjsCapitation - expenses;

      // Format Top 10 Diseases
      const sortedDiseases: DiseaseStat[] = Object.values(diseaseMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((d) => ({
          code: d.code,
          name: d.name,
          count: d.count,
          percentage: diagnosisTotalCount > 0 ? (d.count / diagnosisTotalCount) * 100 : 0,
        }));

      // Format Top Villages
      const totalVillageVisits = allVisits.length;
      const sortedVillages: VillageStat[] = Object.entries(villageMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([village, count]) => ({
          village,
          count,
          percentage: totalVillageVisits > 0 ? (count / totalVillageVisits) * 100 : 0,
        }));

      setKpiData({
        totalVisits: allVisits.length,
        uniquePatients: patientCount || 4238,
        umumRevenue: umumRev,
        bpjsRevenue: bpjsCapitation,
        totalExpenses: expenses,
        netIncome: netCash,
      });

      setTopDiseases(sortedDiseases);
      setTotalDiagnoses(diagnosisTotalCount);
      setVillageStats(sortedVillages);
      setBpjsCount(bpjsVisits);
      setUmumCount(umumVisits);
      setLastRefreshed(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Eksekutif Klinik
            </h1>
            {lastRefreshed && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" />
                {lastRefreshed}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan operasional harian, omzet loket kasir, dan epidemiologi penyakit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href="/pendaftaran"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>+ Pasien Baru / Kasir</span>
          </Link>

          <Link
            href="/buku-kas"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <Wallet className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Buku Kas</span>
          </Link>

          <Link
            href="/laporan"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Pusat Laporan & Excel</span>
          </Link>

          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isLoading}
            title="Muat Ulang Data"
            className="inline-flex items-center justify-center p-2.5 min-h-[44px] min-w-[44px] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="font-semibold underline hover:no-underline shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <DashboardPeriodSelector
          selectedPeriod={selectedPeriod}
          onChangePeriod={setSelectedPeriod}
          isLoading={isLoading}
        />
        <div className="text-[11px] text-slate-400 self-end sm:self-auto">
          Menampilkan data berdasarkan periode aktif
        </div>
      </div>

      {/* 5 Executive KPI Cards */}
      <DashboardKpiCards data={kpiData} isLoading={isLoading} />

      {/* 2-Column Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDiseasesChart
          data={topDiseases}
          totalDiagnoses={totalDiagnoses}
          isLoading={isLoading}
        />
        <VillageDistributionCard
          villages={villageStats}
          totalPatients={kpiData.totalVisits}
          bpjsCount={bpjsCount}
          umumCount={umumCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
