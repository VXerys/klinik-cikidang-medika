'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { NotePencil, WarningCircle, IdentificationCard, ShieldWarning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/database';
import { DESA_OPTIONS, GELAR_OPTIONS, JENIS_KELAMIN_OPTIONS } from '@/constants/clinic';
import { Modal, Button, Input, Select } from '@/components/ui';

const editPatientSchema = z.object({
  gelar: z.string().trim().default('Tn.'),
  nama: z.string().trim().min(2, 'Nama pasien minimal 2 karakter.'),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']),
  tanggalLahir: z.string().optional().nullable(),
  usia: z
    .union([
      z.number().int().min(0, 'Usia tidak boleh negatif.').max(130, 'Usia maksimal 130 tahun.'),
      z.literal(''),
    ])
    .optional()
    .nullable(),
  desa: z.string().trim().min(1, 'Desa domisili wajib dipilih.'),
  alamat: z.string().trim().optional().nullable(),
  noKtp: z
    .string()
    .trim()
    .refine((val) => !val || /^\d{16}$/.test(val), {
      message: 'NIK KTP harus tepat 16 digit angka jika diisi.',
    })
    .optional()
    .nullable(),
  noBpjs: z
    .string()
    .trim()
    .refine((val) => !val || /^\d{13}$/.test(val), {
      message: 'Nomor Kartu BPJS harus tepat 13 digit angka jika diisi.',
    })
    .optional()
    .nullable(),
  noTelepon: z.string().trim().optional().nullable(),
  pekerjaan: z.string().trim().optional().nullable(),
  riwayatAlergi: z.string().trim().default('Tidak Ada'),
});

export interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onPatientUpdated: (patient: Patient) => void;
}

export function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onPatientUpdated,
}: EditPatientModalProps) {
  const [gelar, setGelar] = useState('Tn.');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [usia, setUsia] = useState<number | ''>('');
  const [desa, setDesa] = useState<string>(DESA_OPTIONS[0]);
  const [alamat, setAlamat] = useState('');
  const [noKtp, setNoKtp] = useState('');
  const [noBpjs, setNoBpjs] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [riwayatAlergi, setRiwayatAlergi] = useState('Tidak Ada');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !patient) {
      setErrorMessage(null);
      setFieldErrors({});
      return;
    }

    setGelar(patient.gelar || 'Tn.');
    setNama(patient.nama || '');
    setJenisKelamin(patient.jenis_kelamin || 'Laki-laki');
    setTanggalLahir(patient.tanggal_lahir || '');
    setUsia(patient.usia ?? '');
    setDesa(patient.desa || DESA_OPTIONS[0]);
    setAlamat(patient.alamat || '');
    setNoKtp(patient.no_ktp || '');
    setNoBpjs(patient.no_bpjs || '');
    setNoTelepon(patient.no_telepon || '');
    setPekerjaan(patient.pekerjaan || '');
    setRiwayatAlergi(patient.riwayat_alergi || 'Tidak Ada');
    setErrorMessage(null);
    setFieldErrors({});
  }, [isOpen, patient]);

  // Hitung perkiraan usia saat tanggal lahir berubah
  const handleDateChange = (val: string) => {
    setTanggalLahir(val);
    if (!val) return;

    try {
      const birth = new Date(val);
      const today = new Date();
      if (!isNaN(birth.getTime()) && birth <= today) {
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        setUsia(calculatedAge >= 0 ? calculatedAge : '');
      }
    } catch {
      // Ignored
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setErrorMessage(null);
    setFieldErrors({});

    const formData = {
      gelar,
      nama,
      jenisKelamin,
      tanggalLahir: tanggalLahir || null,
      usia: usia === '' ? null : Number(usia),
      desa,
      alamat: alamat || null,
      noKtp: noKtp.replace(/\s+/g, '') || null,
      noBpjs: noBpjs.replace(/\s+/g, '') || null,
      noTelepon: noTelepon.trim() || null,
      pekerjaan: pekerjaan.trim() || null,
      riwayatAlergi: riwayatAlergi.trim() || 'Tidak Ada',
    };

    const parseResult = editPatientSchema.safeParse(formData);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      setErrorMessage('Mohon perbaiki isian data yang belum valid di formulir.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .update({
          gelar: formData.gelar,
          nama: formData.nama.trim(),
          jenis_kelamin: formData.jenisKelamin,
          tanggal_lahir: formData.tanggalLahir,
          usia: formData.usia,
          desa: formData.desa,
          alamat: formData.alamat,
          no_ktp: formData.noKtp,
          no_bpjs: formData.noBpjs,
          no_telepon: formData.noTelepon,
          pekerjaan: formData.pekerjaan,
          riwayat_alergi: formData.riwayatAlergi,
        })
        .eq('id', patient.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Biodata pasien berhasil diperbarui!', {
        description: `No. RM: ${patient.no_rm} • ${formData.nama}`,
      });

      if (data) {
        onPatientUpdated(data as Patient);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Error updating patient:', err);
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui data pasien ke database.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Biodata Pasien"
      description={`Perbarui informasi identitas master pasien [${patient.no_rm}].`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <WarningCircle className="w-4 h-4 shrink-0 text-rose-600" weight="duotone" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Baris No RM & Gelar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <Input
              label="Nomor Rekam Medis (Terkunci)"
              value={patient.no_rm}
              disabled
              leftElement={<IdentificationCard className="w-4 h-4 text-slate-400" weight="duotone" />}
              helperText="Nomor RM bersifat unik dan permanen."
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              label="Gelar / Sapaan"
              options={GELAR_OPTIONS.map((g) => ({ label: g, value: g }))}
              value={gelar}
              onChange={(e) => setGelar(e.target.value)}
            />
          </div>

          <div className="sm:col-span-4">
            <Select
              label="Jenis Kelamin *"
              options={JENIS_KELAMIN_OPTIONS.map((jk) => ({ label: jk, value: jk }))}
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
              error={fieldErrors.jenisKelamin}
            />
          </div>
        </div>

        {/* Nama Pasien */}
        <div>
          <Input
            label="Nama Lengkap Pasien *"
            placeholder="Contoh: Siti Aisyah"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            error={fieldErrors.nama}
            required
          />
        </div>

        {/* Tanggal Lahir & Usia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tanggal Lahir"
            type="date"
            value={tanggalLahir}
            onChange={(e) => handleDateChange(e.target.value)}
            error={fieldErrors.tanggalLahir}
            helperText="Pilih tanggal lahir untuk menghitung usia otomatis."
          />
          <Input
            label="Usia (Tahun)"
            type="number"
            min={0}
            max={130}
            placeholder="Contoh: 35"
            value={usia}
            onChange={(e) => setUsia(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            error={fieldErrors.usia}
          />
        </div>

        {/* Kontak Telepon & Pekerjaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nomor Telepon / WhatsApp"
            type="tel"
            placeholder="Contoh: 0812-3456-7890"
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            error={fieldErrors.noTelepon}
          />
          <Input
            label="Pekerjaan Pasien"
            placeholder="Contoh: Karyawan Pabrik / Petani / IRT"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            error={fieldErrors.pekerjaan}
          />
        </div>

        {/* Wilayah Desa & Alamat Spesifik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Select
              label="Desa Wilayah Cikidang *"
              options={DESA_OPTIONS.map((d) => ({ label: `Desa ${d}`, value: d }))}
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              error={fieldErrors.desa}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Alamat Detail (Kampung / RT / RW)"
              placeholder="Contoh: Kp. Pasir Kupa RT 02/04"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              error={fieldErrors.alamat}
            />
          </div>
        </div>

        {/* NIK KTP & BPJS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <Input
            label="Nomor Induk Kependudukan (NIK KTP)"
            placeholder="16 digit angka (opsional)"
            maxLength={16}
            value={noKtp}
            onChange={(e) => setNoKtp(e.target.value)}
            error={fieldErrors.noKtp}
            helperText="Isi jika pasien membawa KTP asli."
          />
          <Input
            label="Nomor Kartu BPJS Kesehatan"
            placeholder="13 digit angka (opsional)"
            maxLength={13}
            value={noBpjs}
            onChange={(e) => setNoBpjs(e.target.value)}
            error={fieldErrors.noBpjs}
            helperText="Wajib diisi jika pasien berobat memakai jaminan BPJS."
          />
        </div>

        {/* Riwayat Alergi Obat */}
        <div className="pt-2 border-t border-slate-100">
          <Input
            label="Riwayat Alergi Obat (Patient Drug Safety)"
            placeholder="Contoh: Amoxicillin, Paracetamol, Golongan Sulfa, Penicillin (Default: Tidak Ada)"
            value={riwayatAlergi}
            onChange={(e) => setRiwayatAlergi(e.target.value)}
            leftElement={<ShieldWarning className="w-4 h-4 text-amber-600" weight="duotone" />}
            error={fieldErrors.riwayatAlergi}
            helperText="Sistem akan memberi alarm merah otomatis di ruang dokter jika obat yang diresepkan memicu alergi ini."
          />
        </div>

        </div>

        {/* Sticky Footer Actions */}
        <div className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:px-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<NotePencil className="w-4 h-4" weight="bold" />}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
