'use client';

import React, { useRef } from 'react';
import { Printer, X } from '@phosphor-icons/react';
import { Lungs } from 'healthicons-react';
import { useReactToPrint } from 'react-to-print';
import type { TbcProgram } from '@/types/database';
import { CLINIC_PROFILE } from '@/constants/clinic';
import { Modal, Button } from '@/components/ui';
import { formatDateIndo } from '@/lib/utils';

export interface TbTreatmentCardPrintProps {
  isOpen: boolean;
  onClose: () => void;
  program: TbcProgram | null;
}

export function TbTreatmentCardPrint({ isOpen, onClose, program }: TbTreatmentCardPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const patientFullName = program?.pasien
    ? [program.pasien.gelar, program.pasien.nama].filter(Boolean).join(' ')
    : 'Pasien TBC';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Kartu-TB01-${program?.pasien?.no_rm || 'TBC'}-${patientFullName.replace(/\s+/g, '_')}`,
  });

  if (!isOpen || !program) return null;

  // Hitung perkiraan tanggal jadwal kontrol per bulan
  const startDate = new Date(program.tanggal_mulai);
  const getMonthDateStr = (monthIndex: number) => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + (monthIndex - 1));
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Kartu Berobat TBC (Formulir TB 01)"
      icon={
        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
          <Lungs className="w-5 h-5 text-rose-700" />
        </div>
      }
      maxWidth="xl"
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Printable Card Area */}
        <div
          ref={printRef}
          className="bg-white border border-slate-300 rounded-xl p-5 text-slate-900 font-sans print:border-none print:p-2 text-xs space-y-3"
        >
          {/* Header Kartu */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
            <div>
              <h1 className="text-sm font-extrabold uppercase tracking-wide">
                {CLINIC_PROFILE.name}
              </h1>
              <p className="text-[10px] text-slate-600">
                {CLINIC_PROFILE.address} • Telp: {CLINIC_PROFILE.phone}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                FORMULIR TB 01 SAKU
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                No RM: {program.pasien?.no_rm || '-'}
              </p>
            </div>
          </div>

          <div className="text-center py-1 bg-slate-50 rounded border border-slate-200 print:bg-transparent">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              KARTU KONTROL PENGOBATAN OAT 6 BULAN
            </h2>
          </div>

          {/* Biodata Pasien */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 print:bg-transparent print:border-slate-300 text-[11px]">
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">Nama Pasien</span>
              <span className="font-bold text-slate-900">{patientFullName}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">Desa & Usia</span>
              <span className="text-slate-800">
                Desa {program.pasien?.desa || '-'} ({program.pasien?.usia || '-'} th)
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">Tipe Pasien & OAT</span>
              <span className="font-semibold text-slate-800">
                {program.tipe_pasien} • {program.kategori_oat}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">Tanggal Mulai</span>
              <span className="font-semibold text-slate-800">
                {formatDateIndo(program.tanggal_mulai)}
              </span>
            </div>
          </div>

          {/* Tabel Kendali 6 Bulan Pengambilan Obat */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 print:bg-slate-200">
                  <th className="border border-slate-300 py-1 px-2 text-center w-12">Bulan</th>
                  <th className="border border-slate-300 py-1 px-2">Fase & Regimen</th>
                  <th className="border border-slate-300 py-1 px-2">Jadwal Ambil Obat</th>
                  <th className="border border-slate-300 py-1 px-2">Evaluasi Dahak BTA</th>
                  <th className="border border-slate-300 py-1 px-2 text-center w-16">Status</th>
                  <th className="border border-slate-300 py-1 px-2 text-center w-16">Paraf</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 1, fase: 'Intensif (4FDC harian)', bta: 'Awal Pengobatan: Positif', checkBta: false },
                  { m: 2, fase: 'Intensif (4FDC harian)', bta: 'Wajib Periksa Dahak Akhir Bln 2', checkBta: true },
                  { m: 3, fase: 'Lanjutan (2FDC)', bta: '-', checkBta: false },
                  { m: 4, fase: 'Lanjutan (2FDC)', bta: '-', checkBta: false },
                  { m: 5, fase: 'Lanjutan (2FDC)', bta: 'Wajib Periksa Dahak Akhir Bln 5', checkBta: true },
                  { m: 6, fase: 'Lanjutan (2FDC)', bta: 'Periksa Dahak Akhir Pengobatan', checkBta: true },
                ].map((row) => {
                  const isPastOrCurrent = (program.bulan_ke || 1) >= row.m;
                  return (
                    <tr
                      key={row.m}
                      className={row.m === program.bulan_ke ? 'bg-rose-50/70 font-semibold' : ''}
                    >
                      <td className="border border-slate-300 py-1 px-2 text-center font-bold">
                        Bln {row.m}
                      </td>
                      <td className="border border-slate-300 py-1 px-2">{row.fase}</td>
                      <td className="border border-slate-300 py-1 px-2 font-mono">
                        {getMonthDateStr(row.m)}
                      </td>
                      <td className="border border-slate-300 py-1 px-2">
                        {row.checkBta ? (
                          <span className="font-semibold text-rose-700">{row.bta}</span>
                        ) : (
                          <span className="text-slate-500">{row.bta}</span>
                        )}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center">
                        {isPastOrCurrent ? 'Sudah' : 'Belum'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center">
                        {isPastOrCurrent ? '✓' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Status & Petunjuk Minum Obat */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] leading-relaxed">
            <div className="p-2 border border-slate-200 rounded-lg">
              <span className="font-bold block text-slate-800 mb-1">Petunjuk Penting Pasien:</span>
              <ul className="list-disc pl-3.5 space-y-0.5 text-slate-600">
                <li>Minumlah obat OAT setiap hari di jam yang sama tanpa terputus.</li>
                <li>Wajib membawa kartu ini setiap kontrol bulanan ke klinik.</li>
                <li>Pemeriksaan dahak BTA diulang pada akhir bulan ke-2, 5, dan 6.</li>
                <li>Konsultasikan segera bila timbul mata/kulit kuning atau gatal hebat.</li>
              </ul>
            </div>

            <div className="p-2 border border-slate-200 rounded-lg flex flex-col justify-between text-right">
              <div>
                <span className="text-slate-500 block">Status Terakhir:</span>
                <span className="font-bold text-slate-900 text-xs">
                  {program.status_tbc} (Bulan ke-{program.bulan_ke || 1})
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  BTA Terakhir: {program.hasil_dahak_akhir || 'Belum Periksa'}
                </span>
              </div>
              <div className="pt-4">
                <span className="text-[9px] text-slate-400 block">Dokter Penanggung Jawab TB</span>
                <span className="font-bold text-slate-800 text-[11px] block mt-4">
                  ( dr. Ovan / dr. Neneng )
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => handlePrint()}
            leftIcon={<Printer className="w-4 h-4" weight="bold" />}
            className="min-h-[44px]"
          >
            Cetak Kartu TB 01
          </Button>
        </div>
      </div>
    </Modal>
  );
}
