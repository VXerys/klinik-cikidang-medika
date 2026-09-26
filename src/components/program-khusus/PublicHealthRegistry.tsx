'use client';

import React, { useMemo, useState } from 'react';
import {
  DownloadSimple,
  WarningCircle,
  Heartbeat,
  Baby,
  ShieldCheck,
  FirstAid,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDateIndo } from '@/lib/utils';
import {
  exportPublicHealthToExcel,
  type PublicHealthExportRow,
} from '@/lib/excel';
import type { PublicHealthProgramType, PublicHealthRecord } from '@/types/database';

interface PublicHealthRegistryProps {
  records: PublicHealthRecord[];
  isLoading?: boolean;
}

const PROGRAM_META: Record<
  PublicHealthProgramType,
  { label: string; icon: React.ElementType; accent: string }
> = {
  PTM: { label: 'PTM', icon: FirstAid, accent: 'text-rose-600 bg-rose-50 border-rose-200' },
  ANC: { label: 'ANC', icon: Baby, accent: 'text-teal-600 bg-teal-50 border-teal-200' },
  KB: { label: 'KB', icon: ShieldCheck, accent: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ELIMINASI_3: {
    label: '3 Eliminasi',
    icon: Heartbeat,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
};

const FILTERS: { id: PublicHealthProgramType | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Semua Program' },
  { id: 'PTM', label: 'PTM' },
  { id: 'ANC', label: 'ANC' },
  { id: 'KB', label: 'KB' },
  { id: 'ELIMINASI_3', label: '3 Eliminasi' },
];

export function PublicHealthRegistry({ records, isLoading }: PublicHealthRegistryProps) {
  const [programFilter, setProgramFilter] = useState<PublicHealthProgramType | 'ALL'>('ALL');

  const filteredRecords = useMemo(() => {
    if (programFilter === 'ALL') return records;
    return records.filter((r) => r.program_type === programFilter);
  }, [records, programFilter]);

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      toast.error('Belum ada data program kesehatan untuk diunduh.');
      return;
    }

    try {
      const exportRows: PublicHealthExportRow[] = filteredRecords.map((r) => ({
        program_type: r.program_type,
        nama: r.nama || '-',
        jenis_kelamin: r.jenis_kelamin || '-',
        ttl: r.ttl || '-',
        alamat: r.alamat || '-',
        no_nik: r.no_nik || '-',
        diagnosa: r.diagnosa || '-',
        lab: r.lab || '-',
        terapi: r.terapi || '-',
        hbsag: r.hbsag || '-',
        jenis_kb: r.jenis_kb || '-',
        tanggal_kembali: r.tanggal_kembali || '-',
      }));

      exportPublicHealthToExcel(exportRows);
      toast.success(`Laporan program kesehatan (${filteredRecords.length} data) berhasil diunduh.`);
    } catch (err) {
      console.error('Error exporting public health records:', err);
      toast.error('Gagal mengunduh laporan program kesehatan.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setProgramFilter(f.id)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold tactile-btn transition ${
                programFilter === f.id
                  ? 'bg-teal-600 text-white shadow-btn-primary border border-teal-700 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading || filteredRecords.length === 0}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-b from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold shadow-btn-primary border border-teal-700/80 tactile-btn transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
        >
          <DownloadSimple weight="bold" className="w-3.5 h-3.5" />
          <span>Unduh Laporan Puskesmas (.xlsx)</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card-double p-6 space-y-3 animate-pulse">
          <div className="h-6 w-52 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-600 shadow-card-double">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl w-fit mx-auto mb-3 border border-rose-200">
            <Heartbeat className="w-8 h-8" weight="duotone" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Belum ada data program kesehatan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Klik tombol Program Kesehatan Baru untuk mencatat data PTM, ANC, KB, atau 3 Eliminasi
            yang akan dilaporkan ke Puskesmas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card-double overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Daftar Program Kesehatan
            </span>
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              {filteredRecords.length} data
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/90 whitespace-nowrap">
                <tr>
                  <th className="py-3 px-3.5">Program</th>
                  <th className="py-3 px-3.5">Nama</th>
                  <th className="py-3 px-3.5">JK</th>
                  <th className="py-3 px-3.5">TTL</th>
                  <th className="py-3 px-3.5">Alamat</th>
                  <th className="py-3 px-3.5">No NIK</th>
                  <th className="py-3 px-3.5">Diagnosa</th>
                  <th className="py-3 px-3.5">Lab / Terapi</th>
                  <th className="py-3 px-3.5">KB / Kembali</th>
                  <th className="py-3 px-3.5">Tanggal Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {filteredRecords.map((row) => {
                  const meta = PROGRAM_META[row.program_type];
                  const Icon = meta.icon;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${meta.accent}`}
                        >
                          <Icon className="w-3.5 h-3.5" weight="duotone" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900">{row.nama}</td>
                      <td className="py-3 px-3.5 text-slate-500">{row.jenis_kelamin || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-500">{row.ttl || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-600">{row.alamat || '-'}</td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600">
                        {row.no_nik || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">{row.diagnosa || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-700">
                        {row.program_type === 'ANC' ? (
                          <span className="flex flex-col gap-0.5">
                            {row.terapi && <span>{row.terapi}</span>}
                            {row.hbsag && (
                              <span className="text-[10px] font-mono text-slate-500">
                                HbSAg: {row.hbsag}
                              </span>
                            )}
                            {!row.terapi && !row.hbsag && <span>-</span>}
                          </span>
                        ) : (
                          row.lab || '-'
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">
                        {row.program_type === 'KB' ? (
                          <span className="flex flex-col gap-0.5">
                            <span className="font-semibold">{row.jenis_kb || '-'}</span>
                            {row.tanggal_kembali && (
                              <span className="text-[10px] font-mono text-slate-500">
                                {formatDateIndo(row.tanggal_kembali)}
                              </span>
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                        {row.created_at ? formatDateIndo(row.created_at) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl flex items-start gap-2.5 text-[11px] text-teal-900">
        <WarningCircle weight="duotone" className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
        <span className="leading-relaxed">
          Data NIK dan hasil lab pada halaman ini bersifat sensitif. Gunakan hanya untuk keperluan
          pelaporan resmi Puskesmas dan jaga kerahasiaan rekam medis pasien.
        </span>
      </div>
    </div>
  );
}

export default PublicHealthRegistry;
