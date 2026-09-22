'use client';

import React, { useRef } from 'react';
import { Printer, CheckCircle } from '@phosphor-icons/react';
import { useReactToPrint } from 'react-to-print';
import type { Visit } from '@/types/database';
import { CLINIC_PROFILE } from '@/constants/clinic';
import { Modal, Button } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
}

export function ReceiptModal({ isOpen, onClose, visit }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const patientFullName = visit?.pasien
    ? [visit.pasien.gelar, visit.pasien.nama].filter(Boolean).join(' ')
    : 'Pasien';

  const doctorName = visit?.dokter?.nama || 'Dokter Jaga';
  const receiptNo = visit
    ? `KUI-${visit.tanggal_periksa.replace(/-/g, '')}-${String(visit.nomor_antrian || '1').padStart(3, '0')}`
    : 'KUI-000';
  const totalAmount = Number(visit?.biaya_periksa || 0) + Number(visit?.pendapatan_lain || 0);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${receiptNo}-${patientFullName.replace(/\s+/g, '_')}`,
  });

  if (!isOpen || !visit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kuitansi Pembayaran Pasien"
      icon={
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
          <Printer className="w-5 h-5 text-blue-700" weight="duotone" />
        </div>
      }
      maxWidth="lg"
    >
      {/* Printable Receipt Content */}
      <div ref={printRef} className="p-4 sm:p-6 overflow-y-auto space-y-4 print:p-4 text-slate-900">
        {/* Clinic Header */}
        <div className="text-center pb-3 border-b-2 border-slate-900 space-y-0.5">
          <h1 className="text-base font-extrabold tracking-wide uppercase">
            {CLINIC_PROFILE.name}
          </h1>
          <p className="text-[11px] text-slate-600">
            {CLINIC_PROFILE.address}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Telp: {CLINIC_PROFILE.phone} | Izin: {CLINIC_PROFILE.license}
          </p>
        </div>

        {/* Receipt Meta */}
        <div className="flex justify-between items-center text-xs py-1 border-b border-dashed border-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">No. Kuitansi</span>
            <span className="font-mono font-bold text-slate-900">{receiptNo}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Tanggal & Waktu</span>
            <span className="font-medium text-slate-800">
              {visit.tanggal_periksa} {visit.jam_periksa ? `• ${visit.jam_periksa}` : ''}
            </span>
          </div>
        </div>

        {/* Patient & Doctor Data */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent print:p-1 print:border-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Nama Pasien</span>
            <span className="font-bold text-slate-900 text-xs">{patientFullName}</span>
            <span className="text-[11px] text-slate-600 block">
              {visit.pasien?.desa || '-'} {visit.pasien?.usia ? `(${visit.pasien.usia} th)` : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">No. Rekam Medis</span>
            <span className="font-mono font-bold text-blue-700 text-xs">
              {visit.pasien?.no_rm || '-'}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 block">
              {visit.jenis_pasien}
              {visit.pasien?.no_bpjs ? ` (${visit.pasien.no_bpjs})` : ''}
            </span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200 print:border-slate-300 flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Dokter Pemeriksa:</span>
            <span className="font-semibold text-slate-800">{doctorName}</span>
          </div>
        </div>

        {/* Itemized Billing Breakdown */}
        <div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-600">
                <th className="text-left py-1.5 font-bold">Rincian Layanan</th>
                <th className="text-right py-1.5 font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2">
                  <span className="font-semibold block text-slate-900">
                    Pemeriksaan & Konsultasi Dokter
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {visit.jenis_pasien === 'BPJS'
                      ? 'Layanan Pasien BPJS (Klaim Kapitasi)'
                      : 'Pemeriksaan Dokter Umum & Tindakan Standar'}
                  </span>
                </td>
                <td className="py-2 text-right font-mono font-medium">
                  {visit.jenis_pasien === 'BPJS' ? (
                    <span className="text-teal-700 font-bold">Rp 0 (BPJS)</span>
                  ) : (
                    formatRupiah(Number(visit.biaya_periksa || 0))
                  )}
                </td>
              </tr>

              {Number(visit.pendapatan_lain || 0) > 0 && (
                <tr>
                  <td className="py-2">
                    <span className="font-semibold block text-slate-900">
                      {visit.keterangan_pendapatan || 'Tindakan Tambahan / Lainnya'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Layanan tambahan di luar paket pokok
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono font-medium">
                    {formatRupiah(Number(visit.pendapatan_lain))}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-xs">
                <td className="py-2.5 uppercase">Total Pembayaran</td>
                <td className="py-2.5 text-right font-mono text-sm text-slate-900">
                  {formatRupiah(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Status & Method */}
        <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs print:bg-transparent print:border-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600 print:hidden" weight="duotone" />
            <span>STATUS: LUNAS</span>
          </div>
          <div className="text-slate-700 text-[11px]">
            Metode: <span className="font-semibold">{visit.jenis_pembayaran || 'Tunai'}</span>
          </div>
        </div>

        {/* Signature Lines */}
        <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs">
          <div className="space-y-12">
            <p className="text-[10px] text-slate-500 uppercase">Pasien / Keluarga</p>
            <div className="pt-8 border-t border-slate-300 mx-4 font-semibold text-[11px]">
              ( {patientFullName} )
            </div>
          </div>
          <div className="space-y-12">
            <p className="text-[10px] text-slate-500 uppercase">Petugas Kasir</p>
            <div className="pt-8 border-t border-slate-300 mx-4 font-semibold text-[11px]">
              ( Kasir Loket )
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Terima kasih atas kunjungan Anda. Semoga lekas sembuh dan sehat selalu.
        </div>
      </div>

      {/* Modal Footer Actions (Hidden on print) */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 print:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px]"
        >
          Tutup
        </Button>
        <Button
          type="button"
          variant="primary"
          leftIcon={<Printer className="w-4 h-4" weight="duotone" />}
          onClick={handlePrint}
          className="w-full sm:w-auto min-h-[44px]"
        >
          Cetak Kuitansi (Print)
        </Button>
      </div>
    </Modal>
  );
}

export default ReceiptModal;
