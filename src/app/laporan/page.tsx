'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { normalizeRupiah } from '@/lib/utils';
import {
  exportVisitsToExcel,
  exportCashFlowsToExcel,
  exportMorbidityToExcel,
  exportFullClinicWorkbook,
  type VisitExportRow,
  type CashFlowExportRow,
  type MorbidityExportRow,
} from '@/lib/excel';
import {
  ReportTabs,
  type ReportTabType,
} from '@/components/laporan/ReportTabs';
import { ReportFilterBar } from '@/components/laporan/ReportFilterBar';
import { ReportPreviewTable } from '@/components/laporan/ReportPreviewTable';

export default function LaporanPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const defaultStartDate = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split('T')[0];
  const defaultEndDate = new Date(currentYear, currentMonth + 1, 0)
    .toISOString()
    .split('T')[0];

  const [activeTab, setActiveTab] = useState<ReportTabType>('kunjungan');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [jenisPasien, setJenisPasien] = useState('Semua');
  const [dokterId, setDokterId] = useState('Semua');
  const [doctorsList, setDoctorsList] = useState<{ id: string; nama: string }[]>([]);

  const [visitsData, setVisitsData] = useState<VisitExportRow[]>([]);
  const [morbidityData, setMorbidityData] = useState<MorbidityExportRow[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowExportRow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch doctors list on mount
  useEffect(() => {
    async function loadDoctors() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('doctors').select('id, nama').eq('aktif', true);
        if (data) setDoctorsList(data);
      } catch (e) {
        console.error('Error loading doctors list:', e);
      }
    }
    loadDoctors();
  }, []);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const pageSize = 1000;

      // 1. Fetch Visits with joined patient & doctor info
      let allVisits: any[] = [];
      let visitPage = 0;

      while (true) {
        let query = supabase
          .from('visits')
          .select(
            'id, tanggal_periksa, jenis_pasien, biaya_periksa, pendapatan_lain, jenis_pembayaran, kode_icd10, diagnosa_deskripsi, dokter_id, doctors(nama), patients(nama, no_rm, jenis_kelamin, desa)'
          )
          .order('tanggal_periksa', { ascending: false })
          .range(visitPage * pageSize, (visitPage + 1) * pageSize - 1);

        if (startDate) query = query.gte('tanggal_periksa', startDate);
        if (endDate) query = query.lte('tanggal_periksa', endDate);
        if (jenisPasien !== 'Semua') query = query.eq('jenis_pasien', jenisPasien);
        if (dokterId !== 'Semua') query = query.eq('dokter_id', dokterId);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allVisits.push(...data);
        if (data.length < pageSize) break;
        visitPage++;
      }

      // 2. Fetch Cash Flows
      let allFlows: any[] = [];
      let flowPage = 0;

      while (true) {
        let flowQuery = supabase
          .from('cash_flows')
          .select('id, tanggal, jenis, kategori, nominal, keterangan')
          .order('tanggal', { ascending: false })
          .range(flowPage * pageSize, (flowPage + 1) * pageSize - 1);

        if (startDate) flowQuery = flowQuery.gte('tanggal', startDate);
        if (endDate) flowQuery = flowQuery.lte('tanggal', endDate);

        const { data, error } = await flowQuery;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allFlows.push(...data);
        if (data.length < pageSize) break;
        flowPage++;
      }

      // 3. Format Visits Export Rows
      const formattedVisits: VisitExportRow[] = allVisits.map((v) => {
        const biaya = normalizeRupiah(Number(v.biaya_periksa) || 0);
        const lain = normalizeRupiah(Number(v.pendapatan_lain) || 0);

        return {
          no_rm: v.patients?.no_rm || '-',
          nama_pasien: v.patients?.nama || 'Pasien',
          jenis_kelamin: v.patients?.jenis_kelamin || '-',
          desa: v.patients?.desa || 'Luar Daerah',
          tanggal_periksa: v.tanggal_periksa,
          nama_dokter: v.doctors?.nama || 'dr. Ovan',
          kode_icd10: v.kode_icd10 || '-',
          diagnosa_deskripsi: v.diagnosa_deskripsi || '-',
          jenis_pasien: v.jenis_pasien,
          biaya_periksa: biaya,
          pendapatan_lain: lain,
          total_biaya: biaya + lain,
          jenis_pembayaran: v.jenis_pembayaran || 'Tunai',
        };
      });

      // 4. Format Cash Flows Export Rows
      const formattedFlows: CashFlowExportRow[] = allFlows.map((f) => ({
        tanggal: f.tanggal,
        jenis: f.jenis,
        kategori: f.kategori,
        nominal: normalizeRupiah(Number(f.nominal) || 0),
        keterangan: f.keterangan || '-',
      }));

      // 5. Aggregate Morbidity ICD-10
      const morbMap: Record<string, { code: string; name: string; count: number }> = {};
      let validDiagCount = 0;

      allVisits.forEach((v) => {
        if (v.kode_icd10) {
          validDiagCount++;
          const code = v.kode_icd10.trim().toUpperCase();
          const name = v.diagnosa_deskripsi || code;
          if (!morbMap[code]) {
            morbMap[code] = { code, name, count: 0 };
          }
          morbMap[code].count++;
        }
      });

      const formattedMorbidity: MorbidityExportRow[] = Object.values(morbMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((m, idx) => ({
          rank: idx + 1,
          kode_icd10: m.code,
          diagnosa_deskripsi: m.name,
          jumlah_kasus: m.count,
          persentase: validDiagCount > 0 ? (m.count / validDiagCount) * 100 : 0,
        }));

      setVisitsData(formattedVisits);
      setCashFlowData(formattedFlows);
      setMorbidityData(formattedMorbidity);
    } catch (err) {
      console.error('Error loading report data:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memuat data laporan dari server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, jenisPasien, dokterId]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Preset Handler
  const handlePresetChange = (preset: 'today' | 'this_month' | 'last_month' | 'this_year' | 'all') => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth();

    if (preset === 'today') {
      const today = now.toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'this_month') {
      setStartDate(new Date(yr, mo, 1).toISOString().split('T')[0]);
      setEndDate(new Date(yr, mo + 1, 0).toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      setStartDate(new Date(yr, mo - 1, 1).toISOString().split('T')[0]);
      setEndDate(new Date(yr, mo, 0).toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      setStartDate(`${yr}-01-01`);
      setEndDate(`${yr}-12-31`);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleReset = () => {
    handlePresetChange('this_month');
    setJenisPasien('Semua');
    setDokterId('Semua');
  };

  // Export Handlers
  const handleExportActiveTab = () => {
    const dateRange = { start: startDate || 'Awal', end: endDate || 'Akhir' };

    if (activeTab === 'kunjungan') {
      exportVisitsToExcel(visitsData, dateRange);
    } else if (activeTab === 'morbiditas') {
      exportMorbidityToExcel(morbidityData, dateRange);
    } else if (activeTab === 'buku_kas') {
      exportCashFlowsToExcel(cashFlowData, dateRange);
    }
  };

  const handleExportFullWorkbook = () => {
    const dateRange = { start: startDate || 'Awal', end: endDate || 'Akhir' };
    exportFullClinicWorkbook({
      visits: visitsData,
      flows: cashFlowData,
      morbidity: morbidityData,
      dateRange,
    });
  };

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Header with Title and Download Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pusat Laporan & Ekspor Excel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Unduh rekapitulasi data kunjungan, morbiditas ICD-10, dan mutasi kas klinik format .xlsx
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Export Active Tab Button */}
          <button
            type="button"
            onClick={handleExportActiveTab}
            disabled={isLoading || (activeTab === 'kunjungan' && visitsData.length === 0)}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <Download className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Unduh Tab Ini (.xlsx)</span>
          </button>

          {/* Export Full 3-Sheet Workbook (Recommended) */}
          <button
            type="button"
            onClick={handleExportFullWorkbook}
            disabled={isLoading || (visitsData.length === 0 && cashFlowData.length === 0)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition w-full sm:w-auto disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Unduh Rekap Lengkap (3 Sheet)</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchReportData}
            className="font-semibold underline hover:no-underline shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Filter Parameters Bar */}
      <ReportFilterBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        jenisPasien={jenisPasien}
        onJenisPasienChange={setJenisPasien}
        dokterId={dokterId}
        onDokterIdChange={setDokterId}
        doctorsList={doctorsList}
        onApplyFilter={fetchReportData}
        onResetFilter={handleReset}
        onPresetChange={handlePresetChange}
        isLoading={isLoading}
      />

      {/* Report Tabs */}
      <ReportTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={{
          kunjungan: visitsData.length,
          morbiditas: morbidityData.length,
          buku_kas: cashFlowData.length,
        }}
      />

      {/* Interactive Preview Table */}
      <ReportPreviewTable
        activeTab={activeTab}
        visitsData={visitsData}
        morbidityData={morbidityData}
        cashFlowData={cashFlowData}
        isLoading={isLoading}
      />
    </div>
  );
}
