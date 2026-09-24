'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { UserPlus, WarningCircle, IdentificationCard } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/database';
import { DESA_OPTIONS, GELAR_OPTIONS, JENIS_KELAMIN_OPTIONS } from '@/constants/clinic';
import { Modal, Button, Input, Select } from '@/components/ui';

const patientSchema = z.object({
  noRm: z.string().trim().min(1, 'Nomor Rekam Medis (No RM) wajib diisi.'),
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

export interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
  initialQuery?: string;
}

export function NewPatientModal({
  isOpen,
  onClose,
  onPatientCreated,
  initialQuery = '',
}: NewPatientModalProps) {
  const [noRm, setNoRm] = useState('');
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
  const [isGeneratingRm, setIsGeneratingRm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setFieldErrors({});
      return;
    }

    setNama(initialQuery.trim());
    setGelar('Tn.');
    setJenisKelamin('Laki-laki');
    setTanggalLahir('');
    setUsia('');
    setDesa(DESA_OPTIONS[0]);
    setAlamat('');
    setNoKtp('');
    setNoBpjs('');
    setNoTelepon('');
    setPekerjaan('');
    setRiwayatAlergi('Tidak Ada');
    setErrorMessage(null);
    setFieldErrors({});

    const generateNextNoRm = async () => {
      setIsGeneratingRm(true);
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;

        const nextNum = (count || 0) + 1;
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const formatted = `RM-${yyyy}${mm}-${String(nextNum).padStart(4, '0')}`;
        setNoRm(formatted);
      } catch (err) {
        console.error('Failed to generate No RM:', err);
        setNoRm(`RM-${Date.now().toString().slice(-6)}`);
      } finally {
        setIsGeneratingRm(false);
      }
    };

    generateNextNoRm();
  }, [isOpen, initialQuery]);

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setTanggalLahir(dob);

    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      if (calculatedAge >= 0) {
        setUsia(calculatedAge);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const parseResult = patientSchema.safeParse({
      noRm,
      gelar,
      nama,
      jenisKelamin,
      tanggalLahir: tanggalLahir || null,
      usia: usia === '' ? null : Number(usia),
      desa,
      alamat: alamat || null,
      noKtp: noKtp || null,
      noBpjs: noBpjs || null,
      noTelepon: noTelepon.trim() || null,
      pekerjaan: pekerjaan.trim() || null,
      riwayatAlergi: riwayatAlergi.trim() || 'Tidak Ada',
    });

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      setErrorMessage(parseResult.error.issues[0]?.message || 'Periksa kembali kelengkapan formulir.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const validData = parseResult.data;

      const newRecord = {
        no_rm: validData.noRm,
        gelar: validData.gelar,
        nama: validData.nama,
        jenis_kelamin: validData.jenisKelamin,
        tanggal_lahir: validData.tanggalLahir || null,
        usia: validData.usia === '' || validData.usia === null || validData.usia === undefined ? null : validData.usia,
        desa: validData.desa,
        alamat: validData.alamat || null,
        no_ktp: validData.noKtp || null,
        no_bpjs: validData.noBpjs || null,
        no_telepon: validData.noTelepon || null,
        pekerjaan: validData.pekerjaan || null,
        riwayat_alergi: validData.riwayatAlergi || 'Tidak Ada',
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('no_rm')) {
          throw new Error(`Nomor RM "${validData.noRm}" sudah terdaftar dalam sistem. Silakan gunakan nomor lain.`);
        }
        throw new Error(error.message);
      }

      if (data) {
        onPatientCreated(data as Patient);
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data pasien.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pendaftaran Pasien Baru"
      description="Isi data rekam medis dasar untuk pasien baru di Klinik Cikidang Medika"
      icon={
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
          <UserPlus className="w-5 h-5 text-blue-700" weight="duotone" />
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
            <WarningCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" weight="duotone" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="No RM"
              requiredIndicator
              value={noRm}
              onChange={(e) => {
                setNoRm(e.target.value);
                if (fieldErrors.noRm) setFieldErrors((prev) => ({ ...prev, noRm: '' }));
              }}
              placeholder={isGeneratingRm ? 'Membuat...' : 'RM-XXXX'}
              className="font-mono font-bold bg-slate-50"
              required
            />
            {fieldErrors.noRm && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.noRm}</p>
            )}
          </div>

          <Select
            label="Gelar / Sapaan"
            value={gelar}
            onChange={(e) => setGelar(e.target.value)}
            options={GELAR_OPTIONS}
          />

          <Select
            label="Jenis Kelamin"
            requiredIndicator
            value={jenisKelamin}
            onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
            options={JENIS_KELAMIN_OPTIONS}
          />
        </div>

        <div>
          <Input
            label="Nama Pasien Lengkap"
            requiredIndicator
            value={nama}
            onChange={(e) => {
              setNama(e.target.value);
              if (fieldErrors.nama) setFieldErrors((prev) => ({ ...prev, nama: '' }));
            }}
            placeholder="Contoh: Siti Aisyah"
            required
          />
          {fieldErrors.nama && (
            <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.nama}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Tanggal Lahir"
            value={tanggalLahir}
            onChange={handleDateOfBirthChange}
          />

          <div>
            <Input
              type="number"
              min="0"
              max="130"
              label="Usia (Tahun)"
              value={usia}
              onChange={(e) => {
                setUsia(e.target.value === '' ? '' : Number(e.target.value));
                if (fieldErrors.usia) setFieldErrors((prev) => ({ ...prev, usia: '' }));
              }}
              placeholder="Contoh: 32"
            />
            {fieldErrors.usia && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.usia}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Desa Domisili"
              requiredIndicator
              value={desa}
              onChange={(e) => {
                setDesa(e.target.value);
                if (fieldErrors.desa) setFieldErrors((prev) => ({ ...prev, desa: '' }));
              }}
              options={DESA_OPTIONS}
            />
            {fieldErrors.desa && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.desa}</p>
            )}
          </div>

          <div>
            <Input
              label="Nomor Kartu BPJS (Opsional)"
              value={noBpjs}
              onChange={(e) => {
                setNoBpjs(e.target.value);
                if (fieldErrors.noBpjs) setFieldErrors((prev) => ({ ...prev, noBpjs: '' }));
              }}
              placeholder="13 digit angka kartu BPJS"
              maxLength={13}
            />
            {fieldErrors.noBpjs && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.noBpjs}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="NIK KTP (Opsional)"
              value={noKtp}
              onChange={(e) => {
                setNoKtp(e.target.value);
                if (fieldErrors.noKtp) setFieldErrors((prev) => ({ ...prev, noKtp: '' }));
              }}
              placeholder="16 digit NIK KTP"
              maxLength={16}
            />
            {fieldErrors.noKtp && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.noKtp}</p>
            )}
          </div>

          <Input
            label="Alamat / Kampung / RT / RW"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Kp. Cigadog RT 02/01"
          />
        </div>

        {/* Telepon & Pekerjaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nomor Telepon / WA (Opsional)"
            type="tel"
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            placeholder="Contoh: 0812-3456-7890"
          />
          <Input
            label="Pekerjaan Pasien (Opsional)"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            placeholder="Contoh: Karyawan Pabrik / Petani"
          />
        </div>

        {/* Riwayat Alergi Obat */}
        <div className="pt-2 border-t border-slate-100">
          <Input
            label="Riwayat Alergi Obat (Patient Drug Safety)"
            value={riwayatAlergi}
            onChange={(e) => setRiwayatAlergi(e.target.value)}
            placeholder="Contoh: Amoxicillin, Paracetamol, Penicillin (Default: Tidak Ada)"
            helperText="Diisi 'Tidak Ada' jika pasien tidak memiliki riwayat alergi obat."
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
            leftIcon={<IdentificationCard className="w-4 h-4" weight="duotone" />}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Simpan Pasien Baru
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NewPatientModal;
