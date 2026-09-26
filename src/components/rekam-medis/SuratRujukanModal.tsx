'use client';

import React, { useState } from 'react';
import { Printer, X, ShareNetwork, Hospital, User, Stethoscope } from '@phosphor-icons/react';
import { CLINIC_PROFILE } from '@/constants/clinic';
import { Patient, Visit, Doctor } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface SuratRujukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  patient: Patient;
  doctors: Doctor[];
  vitalSigns?: {
    td?: string;
    nadi?: string;
    suhu?: string;
    beratBadan?: string;
  };
}

const FASKES_RUJUKAN_DEFAULT = [
  'RSUD Palabuhanratu Kab. Sukabumi',
  'RSUD Sekarwangi Cibadak',
  'RS Betha Medika Cisaat',
  'RS Hermina Sukabumi',
  'RS Kartika Kasih Sukabumi',
  'Faskes Rujukan Lainnya...',
];

const POLI_SPESIALIS_DEFAULT = [
  'Poli Penyakit Dalam (Sp.PD)',
  'Poli Bedah (Sp.B)',
  'Poli Kesehatan Anak (Sp.A)',
  'Poli Kebidanan & Kandungan (Sp.OG)',
  'Poli Saraf (Sp.S)',
  'Poli Mata (Sp.M)',
  'Poli THT-KL (Sp.THT)',
  'Poli Jantung & Pembuluh Darah (Sp.JP)',
  'Poli Paru (Sp.P)',
  'Instalasi Gawat Darurat (IGD)',
];

export function SuratRujukanModal({
  isOpen,
  onClose,
  visit,
  patient,
  doctors,
  vitalSigns,
}: SuratRujukanModalProps) {
  const [faskesTujuan, setFaskesTujuan] = useState<string>(FASKES_RUJUKAN_DEFAULT[0]);
  const [customFaskes, setCustomFaskes] = useState<string>('');
  const [poliTujuan, setPoliTujuan] = useState<string>(POLI_SPESIALIS_DEFAULT[0]);
  const [alasanRujukan, setAlasanRujukan] = useState<string>(
    'Pemeriksaan diagnostik penunjang dan penatalaksanaan spesialistik lebih lanjut.'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    visit.dokter_id || (doctors[0]?.id ?? '')
  );

  if (!isOpen) return null;

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || {
    nama: 'dr. Ovan',
    spesialisasi: 'Dokter Umum',
  };

  const destinationHospital =
    faskesTujuan === 'Faskes Rujukan Lainnya...' ? customFaskes || 'Rumah Sakit Rujukan' : faskesTujuan;

  const formatTanggalIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getRomawiBulan = (monthIdx: number) => {
    const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romawi[monthIdx] || 'IX';
  };

  const visitDate = visit.tanggal_periksa || new Date().toISOString().split('T')[0];
  const currentMonthRomawi = getRomawiBulan(new Date(visitDate).getMonth());
  const currentYear = new Date(visitDate).getFullYear();
  const nomorSurat = `RUJ/CKM/${currentMonthRomawi}/${currentYear}/${patient.no_rm.slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:fixed print:inset-0 print:m-0 print:bg-white print:p-0">
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl print:max-h-none print:w-full print:rounded-none print:shadow-none">
        {/* Header Kontrol (Hanya Tampil di Layar) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <ShareNetwork weight="duotone" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Surat Rujukan Pasien Eksternal (Faskes Lanjutan)
              </h2>
              <p className="text-xs text-slate-500">
                No. RM: {patient.no_rm} • {patient.nama}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 border-teal-600 text-teal-700 hover:bg-teal-50"
            >
              <Printer weight="duotone" className="h-4 w-4" />
              <span>Cetak Surat Rujukan (A4)</span>
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Pengaturan Cepat Rujukan (Hanya Layar) */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3 sm:grid-cols-3 print:hidden">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Rumah Sakit / Faskes Tujuan
            </label>
            <Select
              value={faskesTujuan}
              onChange={(e) => setFaskesTujuan(e.target.value)}
              size="sm"
              searchable
              headerTitle="Faskes Tujuan"
              options={FASKES_RUJUKAN_DEFAULT.map((faskes) => ({
                value: faskes,
                label: faskes,
              }))}
            />
            {faskesTujuan === 'Faskes Rujukan Lainnya...' && (
              <input
                type="text"
                placeholder="Ketik nama rumah sakit tujuan..."
                value={customFaskes}
                onChange={(e) => setCustomFaskes(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Poli Spesialis / Unit Tujuan
            </label>
            <Select
              value={poliTujuan}
              onChange={(e) => setPoliTujuan(e.target.value)}
              size="sm"
              searchable
              headerTitle="Poli Spesialis"
              options={POLI_SPESIALIS_DEFAULT.map((poli) => ({ value: poli, label: poli }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Dokter Perujuk
            </label>
            <Select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              size="sm"
              searchable={false}
              headerTitle="Dokter Perujuk"
              options={doctors.map((d) => ({ value: d.id, label: d.nama }))}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Alasan Rujukan Medis
            </label>
            <input
              type="text"
              value={alasanRujukan}
              onChange={(e) => setAlasanRujukan(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Lembar Surat Rujukan (Format Cetak A4 / Print Preview) */}
        <div className="overflow-y-auto p-8 print:overflow-visible print:p-0">
          <div className="mx-auto max-w-[190mm] rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:border-none print:p-0 print:shadow-none">
            {/* KOP SURAT RESMI */}
            <div className="border-b-2 border-double border-slate-800 pb-3 text-center">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                {CLINIC_PROFILE.name}
              </h1>
              <p className="text-[11px] leading-snug text-slate-600">
                {CLINIC_PROFILE.address}
              </p>
              <p className="text-[10px] text-slate-500">
                Telp: {CLINIC_PROFILE.phone} • Email: {CLINIC_PROFILE.email} • Izin:{' '}
                {CLINIC_PROFILE.license} • Kode Faskes: {CLINIC_PROFILE.faskesCode}
              </p>
            </div>

            {/* JUDUL SURAT */}
            <div className="mt-4 text-center">
              <h2 className="text-xs font-bold tracking-wider text-slate-900 underline uppercase">
                SURAT RUJUKAN EKSTERNAL
              </h2>
              <p className="text-[11px] font-medium text-slate-600">Nomor: {nomorSurat}</p>
            </div>

            {/* TUJUAN RUJUKAN */}
            <div className="mt-4 text-[12px] text-slate-800">
              <p>Kepada Yth.</p>
              <p className="font-bold text-slate-900">
                Teman Sejawat Dokter Spesialis di {poliTujuan}
              </p>
              <p className="font-medium text-slate-700">{destinationHospital}</p>
              <p className="mt-2 text-slate-700">Di tempat,</p>
            </div>

            {/* ISI RUJUKAN */}
            <div className="mt-3 text-[12px] leading-relaxed text-slate-800">
              <p>
                Dengan hormat, bersama ini kami mohon pemeriksaan, evaluasi, serta penanganan lebih
                lanjut terhadap pasien kami dengan data sebagai berikut:
              </p>

              {/* IDENTITAS PASIEN */}
              <div className="my-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3 print:border-none print:bg-transparent print:p-0">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-3 text-slate-600">Nama Pasien</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 font-bold text-slate-900">
                    {patient.gelar} {patient.nama}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-3 text-slate-600">Nomor Rekam Medis</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 font-mono font-medium">{patient.no_rm}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-3 text-slate-600">Umur / Jenis Kelamin</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8">
                    {patient.usia ? `${patient.usia} Tahun` : '-'} / {patient.jenis_kelamin}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-3 text-slate-600">Jenis Jaminan / No. BPJS</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8">
                    {visit.jenis_pasien} {patient.no_bpjs ? `(No: ${patient.no_bpjs})` : ''}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-3 text-slate-600">Alamat Domisili</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8">
                    {patient.alamat ? `${patient.alamat}, ` : ''}Desa {patient.desa}
                  </span>
                </div>
                {patient.riwayat_alergi && patient.riwayat_alergi !== 'Tidak Ada' && (
                  <div className="grid grid-cols-12 gap-1 text-red-700 font-semibold">
                    <span className="col-span-3">Riwayat Alergi Obat</span>
                    <span className="col-span-1">:</span>
                    <span className="col-span-8">{patient.riwayat_alergi}</span>
                  </div>
                )}
              </div>

              {/* RESUME MEDIS */}
              <div className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3 print:border-slate-400">
                <h3 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  Resume Pemeriksaan Klinis
                </h3>

                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-3 text-slate-600">Keluhan / Anamnesa</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 text-slate-900">
                    {visit.keluhan_anamnesa || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-3 text-slate-600">Tanda Vital (TTV)</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 font-mono text-slate-900">
                    TD: {vitalSigns?.td || '-'} mmHg • Nadi: {vitalSigns?.nadi || '-'} bpm •
                    Suhu: {vitalSigns?.suhu || '-'} °C • BB: {vitalSigns?.beratBadan || '-'} kg
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-3 text-slate-600 font-semibold">Diagnosa Kerja</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 font-bold text-slate-900">
                    {visit.kode_icd10 ? `[${visit.kode_icd10}] ` : ''}
                    {visit.diagnosa_deskripsi || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-3 text-slate-600">Terapi Sementara</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 italic text-slate-800">
                    {visit.terapi_obat || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-3 text-slate-600">Alasan Rujukan</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-8 text-slate-900">{alasanRujukan}</span>
                </div>
              </div>

              <p className="mt-3">
                Demikian surat rujukan ini kami sertakan untuk mendapatkan penanganan lebih lanjut.
                Atas kerja sama dan bantuan teman sejawat, kami sampaikan terima kasih.
              </p>
            </div>

            {/* TANDA TANGAN */}
            <div className="mt-8 flex justify-end text-[11px] text-slate-800">
              <div className="text-center">
                <p className="text-slate-600">
                  Cikidang, {formatTanggalIndo(visitDate)}
                </p>
                <p className="font-semibold text-slate-900">Dokter Perujuk,</p>
                <div className="relative flex h-14 items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic print:hidden">
                    [Tanda Tangan & Cap Klinik]
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline">{selectedDoctor.nama}</p>
                <p className="text-[10px] text-slate-500">SIP: 446.1/021/SIP.DOKTER/2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
