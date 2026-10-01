'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HandHeart, WarningCircle, ArrowClockwise, Users } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { bidanDisplayName } from '@/constants/clinic';
import { describePeriod, formatDateIndo } from '@/lib/utils';

interface ReferralRow {
  id: string;
  tanggal_periksa: string;
  kode_icd10: string | null;
  tindakan: string | null;
  bidan_rujukan: string;
  patients: { nama: string; no_rm: string; desa: string } | null;
}

interface BidanSummary {
  bidan: string;
  referrals: number;
  patients: number;
}

interface BidanReferralPanelProps {
  startDate: string;
  endDate: string;
  isLoading?: boolean;
}

const cellClass = 'px-3 py-2 text-xs text-slate-700 align-top';
const headerCellClass =
  'px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left bg-slate-50 border-b border-slate-200';

// Two clicks reach a midwife's history: open the tab, then pick the midwife. The period
// comes from the page filter so the whole report screen is scoped to one period.
export function BidanReferralPanel({ startDate, endDate, isLoading: externalLoading }: BidanReferralPanelProps) {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [selectedBidan, setSelectedBidan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      let query = supabase
        .from('visits')
        .select('id, tanggal_periksa, kode_icd10, tindakan, bidan_rujukan, patients(nama, no_rm, desa)')
        .not('bidan_rujukan', 'is', null)
        .order('tanggal_periksa', { ascending: false });

      if (startDate) query = query.gte('tanggal_periksa', startDate);
      if (endDate) query = query.lte('tanggal_periksa', endDate);

      const { data, error } = await query;
      if (error) throw error;

      setRows((data || []) as unknown as ReferralRow[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal memuat data rujukan bidan dari server.';
      setErrorMessage(message);
      setRows([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const summary = useMemo<BidanSummary[]>(() => {
    const byBidan = new Map<string, { referrals: number; patients: Set<string> }>();
    rows.forEach((row) => {
      if (!byBidan.has(row.bidan_rujukan)) {
        byBidan.set(row.bidan_rujukan, { referrals: 0, patients: new Set() });
      }
      const entry = byBidan.get(row.bidan_rujukan)!;
      entry.referrals += 1;
      entry.patients.add(row.patients?.no_rm || row.id);
    });

    return [...byBidan.entries()]
      .map(([bidan, entry]) => ({ bidan, referrals: entry.referrals, patients: entry.patients.size }))
      .sort((a, b) => b.referrals - a.referrals || a.bidan.localeCompare(b.bidan));
  }, [rows]);

  const selectedRows = useMemo(
    () => (selectedBidan ? rows.filter((row) => row.bidan_rujukan === selectedBidan) : []),
    [rows, selectedBidan]
  );

  const isBusy = isLoading || Boolean(externalLoading);
  const periodLabel = describePeriod(startDate, endDate);

  return (
    <div className="space-y-5 min-w-0 w-full">
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WarningCircle weight="duotone" className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={fetchReferrals}
            className="font-semibold underline hover:no-underline shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-4 min-w-0">
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-card-double tactile-card overflow-hidden min-w-0">
          <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HandHeart weight="duotone" className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-slate-900">Bidan Perujuk</h4>
            </div>
            <button
              type="button"
              onClick={fetchReferrals}
              disabled={isBusy}
              title="Muat ulang data rujukan"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 tactile-btn transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <ArrowClockwise className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin text-teal-600' : ''}`} weight="bold" />
            </button>
          </header>

          {isBusy && !hasLoaded ? (
            <div className="p-4 space-y-2">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : summary.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">
              Tidak ada rujukan bidan pada {periodLabel}. Catatan rujukan tersimpan pada kolom
              keterangan tindakan kunjungan.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.map((entry) => {
                const isActive = entry.bidan === selectedBidan;
                return (
                  <li key={entry.bidan}>
                    <button
                      type="button"
                      onClick={() => setSelectedBidan(isActive ? null : entry.bidan)}
                      aria-pressed={isActive}
                      className={`w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                        isActive ? 'bg-teal-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">
                          {bidanDisplayName(entry.bidan)}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {entry.patients} pasien
                        </span>
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          isActive
                            ? 'bg-white text-teal-700 border-teal-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Users weight="duotone" className="w-3 h-3" />
                        {entry.referrals}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-card-double tactile-card overflow-hidden min-w-0">
          <header className="px-4 py-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">
              {selectedBidan ? `Riwayat Rujukan ${bidanDisplayName(selectedBidan)}` : 'Riwayat Rujukan'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {selectedBidan ? `Periode ${periodLabel}` : 'Pilih nama bidan di sebelah kiri'}
            </p>
          </header>

          {!selectedBidan ? (
            <p className="p-4 text-xs text-slate-500">
              Pilih satu bidan untuk melihat daftar rujukan sebelumnya.
            </p>
          ) : isBusy && !hasLoaded ? (
            <div className="p-4 space-y-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : selectedRows.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">
              {bidanDisplayName(selectedBidan)} tidak memiliki rujukan pada {periodLabel}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr>
                    <th className={headerCellClass}>No RM</th>
                    <th className={headerCellClass}>Nama Pasien</th>
                    <th className={headerCellClass}>Tgl Periksa</th>
                    <th className={headerCellClass}>Kode ICD</th>
                    <th className={headerCellClass}>Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className={`${cellClass} font-mono tabular-nums text-slate-900`}>
                        {row.patients?.no_rm || '-'}
                      </td>
                      <td className={`${cellClass} font-medium text-slate-900`}>
                        {row.patients?.nama || 'Pasien'}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {row.patients?.desa || 'Luar Daerah'}
                        </span>
                      </td>
                      <td className={`${cellClass} whitespace-nowrap`}>
                        {formatDateIndo(row.tanggal_periksa)}
                      </td>
                      <td className={`${cellClass} font-mono tabular-nums`}>{row.kode_icd10 || '-'}</td>
                      <td className={cellClass}>{row.tindakan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BidanReferralPanel;
