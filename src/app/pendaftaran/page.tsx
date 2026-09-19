'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Receipt,
  CheckCircle2,
  RefreshCw,
  Users,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Patient, Visit } from '@/types/database';
import { PatientSearchAutocomplete } from '@/components/pendaftaran/PatientSearchAutocomplete';
import { NewPatientModal } from '@/components/pendaftaran/NewPatientModal';
import { RegisterVisitModal } from '@/components/pendaftaran/RegisterVisitModal';
import { ReceiptModal } from '@/components/pendaftaran/ReceiptModal';
import { Button, Badge, Card } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';

export default function PendaftaranKasirPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // View Filter: 'today' | 'recent'
  const [viewMode, setViewMode] = useState<'today' | 'recent'>('today');

  // Modal State Management
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isRegisterVisitOpen, setIsRegisterVisitOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Active Selections
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeReceiptVisit, setActiveReceiptVisit] = useState<Visit | null>(null);

  // Fetch Visits from Supabase
  const fetchVisits = useCallback(async () => {
    setIsLoadingVisits(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const todayStr = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('visits')
        .select(`
          id,
          nomor_antrian,
          tanggal_periksa,
          jam_periksa,
          bulan,
          keluhan_anamnesa,
          jenis_pasien,
          biaya_periksa,
          pendapatan_lain,
          keterangan_pendapatan,
          jenis_pembayaran,
          status_pembayaran,
          created_at,
          pasien:patients(*),
          dokter:doctors(*)
        `);

      if (viewMode === 'today') {
        query = query.eq('tanggal_periksa', todayStr).order('nomor_antrian', { ascending: false });
      } else {
        query = query.order('tanggal_periksa', { ascending: false }).order('created_at', { ascending: false }).limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVisits((data as unknown as Visit[]) || []);
    } catch (err) {
      console.error('Error fetching visits:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data kunjungan.');
    } finally {
      setIsLoadingVisits(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Handler: When patient selected from Autocomplete
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsRegisterVisitOpen(true);
  };

  // Handler: When "+ Daftarkan Sebagai Pasien Baru" clicked
  const handleAddNewPatient = () => {
    setIsNewPatientOpen(true);
  };

  // Handler: After new patient is created in modal
  const handlePatientCreated = (newPatient: Patient) => {
    // Immediately open visit registration for the newly created patient
    setSelectedPatient(newPatient);
    setIsRegisterVisitOpen(true);
  };

  // Handler: After visit is successfully registered
  const handleVisitRegistered = (newVisit: Visit) => {
    fetchVisits();
    setActiveReceiptVisit(newVisit);
    setIsReceiptOpen(true);
  };

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Loket Pendaftaran & Kasir
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cari data dari 4.238+ pasien lama, daftarkan pasien baru, dan kelola kasir real-time.
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsNewPatientOpen(true)}
          >
            + Pasien Baru
          </Button>
        </div>
      </div>

      {/* Instant Autocomplete Search Section */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Pencarian Cepat Pasien (Autocomplete)
          </label>
          <span className="text-[11px] text-slate-400">
            Ketik Nama, No RM, atau Desa Domisili
          </span>
        </div>

        <PatientSearchAutocomplete
          onSelectPatient={handleSelectPatient}
          onAddNewPatient={handleAddNewPatient}
          placeholder="Cari pasien lama (contoh: Siti, 020103545, atau Pangkalan)..."
        />
      </Card>

      {/* Daftar Kunjungan Pasien Table */}
      <Card>
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Daftar Kunjungan Pasien</span>
                <span className="text-xs font-normal text-slate-500">
                  ({todayFormatted})
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {viewMode === 'today' ? 'Menampilkan antrian kunjungan hari ini' : 'Menampilkan 50 riwayat kunjungan terbaru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('today')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'today'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setViewMode('recent')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'recent'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Riwayat
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchVisits}
              disabled={isLoadingVisits}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingVisits ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Antrian</th>
                <th className="py-3 px-4">No RM & Pasien</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Dokter</th>
                <th className="py-3 px-4">Jenis Pasien</th>
                <th className="py-3 px-4">Keluhan Anamnesa</th>
                <th className="py-3 px-4 text-right">Total Biaya</th>
                <th className="py-3 px-4 text-center">Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingVisits ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Memuat data kunjungan dari database...</span>
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {viewMode === 'today'
                        ? 'Belum ada kunjungan pasien terdaftar hari ini'
                        : 'Tidak ada data kunjungan ditemukan'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Gunakan kotak pencarian di atas untuk mendaftarkan kunjungan pasien lama atau klik tombol &quot;+ Pasien Baru&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                visits.map((visit) => {
                  const patientName = visit.pasien
                    ? [visit.pasien.gelar, visit.pasien.nama].filter(Boolean).join(' ')
                    : 'Pasien Tidak Diketahui';

                  const totalBayar = Number(visit.biaya_periksa || 0) + Number(visit.pendapatan_lain || 0);

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition">
                      {/* Antrian */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                          #{visit.nomor_antrian || '-'}
                        </span>
                      </td>

                      {/* No RM & Pasien */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="umum" className="font-mono">
                            {visit.pasien?.no_rm || '-'}
                          </Badge>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {patientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {visit.pasien?.desa || '-'}
                          </span>
                          {visit.pasien?.usia !== undefined && visit.pasien?.usia !== null && (
                            <>
                              <span>•</span>
                              <span>{visit.pasien.usia} th</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Waktu Periksa */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{visit.jam_periksa || '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {visit.tanggal_periksa}
                        </div>
                      </td>

                      {/* Dokter Pemeriksa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-800 text-xs font-medium">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{visit.dokter?.nama || 'Dokter Jaga'}</span>
                        </div>
                      </td>

                      {/* Jenis Pasien */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {visit.jenis_pasien === 'BPJS' ? (
                          <Badge variant="bpjs">
                            <ShieldCheck className="w-3 h-3" />
                            BPJS
                          </Badge>
                        ) : (
                          <Badge variant="umum">
                            UMUM
                          </Badge>
                        )}
                      </td>

                      {/* Keluhan */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-600 line-clamp-2" title={visit.keluhan_anamnesa || '-'}>
                          {visit.keluhan_anamnesa || '-'}
                        </span>
                      </td>

                      {/* Total Biaya */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {formatRupiah(totalBayar)}
                        </span>
                        {visit.jenis_pasien === 'BPJS' && totalBayar === 0 && (
                          <span className="block text-[9px] text-teal-700 font-medium">
                            Kapitasi BPJS
                          </span>
                        )}
                      </td>

                      {/* Pembayaran */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge variant="lunas">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {visit.jenis_pembayaran || 'Tunai'}
                        </Badge>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={<Receipt className="w-3 h-3 text-blue-600" />}
                          onClick={() => {
                            setActiveReceiptVisit(visit);
                            setIsReceiptOpen(true);
                          }}
                        >
                          Kuitansi
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      <RegisterVisitModal
        isOpen={isRegisterVisitOpen}
        onClose={() => {
          setIsRegisterVisitOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onVisitRegistered={handleVisitRegistered}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceiptVisit(null);
        }}
        visit={activeReceiptVisit}
      />
    </div>
  );
}
