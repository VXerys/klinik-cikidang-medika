'use client';

import React, { useRef } from 'react';
import { Ticket, Printer, X } from '@phosphor-icons/react';
import { useReactToPrint } from 'react-to-print';
import type { Visit } from '@/types/database';
import { CLINIC_PROFILE } from '@/constants/clinic';
import { Modal, Button } from '@/components/ui';

export interface QueueTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
}

export function QueueTicketModal({ isOpen, onClose, visit }: QueueTicketModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const patientFullName = visit?.pasien
    ? [visit.pasien.gelar, visit.pasien.nama].filter(Boolean).join(' ')
    : 'Pasien';

  const doctorName = visit?.dokter?.nama || 'Dokter Jaga';
  const queueToken = visit?.nomor_antrian
    ? `A-${String(visit.nomor_antrian).padStart(3, '0')}`
    : 'A-001';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Antrean-${queueToken}-${patientFullName.replace(/\s+/g, '_')}`,
  });

  if (!isOpen || !visit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Karcis Antrean Pasien"
      icon={
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
          <Ticket className="w-5 h-5 text-blue-700" weight="duotone" />
        </div>
      }
      maxWidth="md"
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Printable Ticket Container */}
        <div
          ref={printRef}
          className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 max-w-xs mx-auto text-slate-900 font-sans print:border-none print:p-2 print:m-0 print:w-[72mm]"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-200 print:border-slate-800 space-y-0.5">
            <h1 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              {CLINIC_PROFILE.name}
            </h1>
            <p className="text-[10px] text-slate-500 leading-tight">
              {CLINIC_PROFILE.address}
            </p>
            <p className="text-[9px] text-slate-400 font-mono">
              Telp: {CLINIC_PROFILE.phone}
            </p>
          </div>

          {/* Ticket Title */}
          <div className="text-center py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
              NOMOR ANTREAN POLI
            </span>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-blue-700 py-1 print:text-black">
              {queueToken}
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
              {visit.jenis_pasien}
            </span>
          </div>

          {/* Visit & Patient Meta */}
          <div className="border-t border-b border-dashed border-slate-200 print:border-slate-800 py-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Pasien:</span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[140px]">
                {patientFullName}
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500 font-sans">No. RM:</span>
              <span className="font-bold text-slate-800">
                {visit.pasien?.no_rm || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dokter Tujuan:</span>
              <span className="font-medium text-slate-800 text-right truncate max-w-[140px]">
                {doctorName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Daftar:</span>
              <span className="font-mono text-slate-700">
                {visit.tanggal_periksa} {visit.jam_periksa || ''}
              </span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="pt-3 text-center text-[10px] text-slate-500 leading-tight space-y-1">
            <p>Silakan menunggu di ruang tunggu hingga nomor antrean Anda dipanggil petugas.</p>
            <p className="text-[9px] text-slate-400 italic">Semoga lekas sembuh.</p>
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
            Cetak Karcis
          </Button>
        </div>
      </div>
    </Modal>
  );
}
