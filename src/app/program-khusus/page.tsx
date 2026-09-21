'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Scissors,
  Calendar,
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { TbcProgram, Circumcision, PostCare } from '@/types/database';
import { TbcControlCard } from '@/components/program-khusus/TbcControlCard';
import { NewTbcModal } from '@/components/program-khusus/NewTbcModal';
import { CircumcisionList } from '@/components/program-khusus/CircumcisionList';
import { NewCircumcisionModal } from '@/components/program-khusus/NewCircumcisionModal';
import { PostCareAgenda } from '@/components/program-khusus/PostCareAgenda';
import { NewPostCareModal } from '@/components/program-khusus/NewPostCareModal';

type ProgramTab = 'tbc' | 'circumcision' | 'postcare';

export default function ProgramKhususPage() {
  const [activeTab, setActiveTab] = useState<ProgramTab>('tbc');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data states
  const [tbcList, setTbcList] = useState<TbcProgram[]>([]);
  const [circumcisionList, setCircumcisionList] = useState<Circumcision[]>([]);
  const [postCareList, setPostCareList] = useState<PostCare[]>([]);

  // Modal open states
  const [isTbcModalOpen, setIsTbcModalOpen] = useState(false);
  const [isCircumcisionModalOpen, setIsCircumcisionModalOpen] = useState(false);
  const [isPostCareModalOpen, setIsPostCareModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // 1. Fetch TBC programs
      const { data: tbcData, error: tbcErr } = await supabase
        .from('tbc_programs')
        .select('*, pasien:patients(id, no_rm, nama, desa, usia, jenis_kelamin)')
        .order('created_at', { ascending: false });
      if (tbcErr) throw tbcErr;
      setTbcList((tbcData as unknown as TbcProgram[]) || []);

      // 2. Fetch Circumcisions
      const { data: circData, error: circErr } = await supabase
        .from('circumcisions')
        .select('*, pasien:patients(id, no_rm, nama, desa, usia), dokter:doctors(id, nama)')
        .order('tanggal_tindakan', { ascending: false });
      if (circErr) throw circErr;
      setCircumcisionList((circData as unknown as Circumcision[]) || []);

      // 3. Fetch Post Cares
      const { data: postData, error: postErr } = await supabase
        .from('post_cares')
        .select('*, pasien:patients(id, no_rm, nama, desa, usia)')
        .order('tanggal_kontrol_berikutnya', { ascending: true });
      if (postErr) throw postErr;
      setPostCareList((postData as unknown as PostCare[]) || []);
    } catch (err) {
      console.error('Error fetching program khusus data:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memuat data program khusus medis.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Quick stats
  const mangkirTbcCount = tbcList.filter((t) => t.status_tbc === 'Mangkir').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPostCareCount = postCareList.filter(
    (p) => p.tanggal_kontrol_berikutnya === todayStr && p.status_kontrol !== 'Sudah Kontrol'
  ).length;

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Register Program Khusus Medis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kartu kendali TBC 6 bulan, dokumentasi sirkumsisi foto WebP, dan agenda kontrol pos-rawat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'tbc' && (
            <button
              type="button"
              onClick={() => setIsTbcModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>+ Pasien TBC Baru</span>
            </button>
          )}

          {activeTab === 'circumcision' && (
            <button
              type="button"
              onClick={() => setIsCircumcisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Sirkumsisi</span>
            </button>
          )}

          {activeTab === 'postcare' && (
            <button
              type="button"
              onClick={() => setIsPostCareModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>+ Jadwal Kontrol</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            title="Muat Ulang"
            className="p-2.5 min-h-[44px] min-w-[44px] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition disabled:opacity-50 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="font-semibold underline hover:no-underline shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 3 Main Program Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('tbc')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'tbc'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Kartu Kendali TBC ({tbcList.length})</span>
          {mangkirTbcCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
              {mangkirTbcCount} Mangkir
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('circumcision')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'circumcision'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Sirkumsisi & Foto Luka ({circumcisionList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('postcare')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'postcare'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda Pos-Rawat ({postCareList.length})</span>
          {todayPostCareCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {todayPostCareCount} Hari Ini
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'tbc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Menampilkan kohort pemantauan minum obat OAT selama 6 bulan</span>
            <span className="text-[11px] font-semibold text-slate-700">
              Total {tbcList.length} Pasien Terdaftar
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>
              ))}
            </div>
          ) : tbcList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
              <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">Belum ada pasien terdaftar di program TBC.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik tombol &quot;+ Pasien TBC Baru&quot; untuk memulai kartu kendali.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tbcList.map((prog) => (
                <TbcControlCard key={prog.id} program={prog} onRefresh={fetchData} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'circumcision' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dokumentasi bedah minor sunat, operator pelaksana, dan evaluasi foto luka</span>
            <span className="text-[11px] font-semibold text-slate-700">
              Total {circumcisionList.length} Tindakan
            </span>
          </div>
          <CircumcisionList
            records={circumcisionList}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeTab === 'postcare' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pemantauan jadwal kontrol berkala pasien paska rawat inap atau tindakan medis</span>
            <span className="text-[11px] font-semibold text-slate-700">
              Total {postCareList.length} Pasien
            </span>
          </div>
          <PostCareAgenda
            records={postCareList}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Modals */}
      <NewTbcModal
        isOpen={isTbcModalOpen}
        onClose={() => setIsTbcModalOpen(false)}
        onSuccess={fetchData}
      />
      <NewCircumcisionModal
        isOpen={isCircumcisionModalOpen}
        onClose={() => setIsCircumcisionModalOpen(false)}
        onSuccess={fetchData}
      />
      <NewPostCareModal
        isOpen={isPostCareModalOpen}
        onClose={() => setIsPostCareModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
