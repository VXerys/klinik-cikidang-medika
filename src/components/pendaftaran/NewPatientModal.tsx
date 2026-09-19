'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/database';
import { DESA_OPTIONS, GELAR_OPTIONS, JENIS_KELAMIN_OPTIONS } from '@/constants/clinic';
import { Modal, Button, Input, Select } from '@/components/ui';

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

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRm, setIsGeneratingRm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
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
    setErrorMessage(null);

    // Generate next sequential No RM preview
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
        const fallback = `RM-${Date.now().toString().slice(-6)}`;
        setNoRm(fallback);
      } finally {
        setIsGeneratingRm(false);
      }
    };

    generateNextNoRm();
  }, [isOpen, initialQuery]);

  // Automatically calculate age when date of birth changes
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

    if (!nama.trim()) {
      setErrorMessage('Nama pasien wajib diisi.');
      return;
    }

    if (!desa) {
      setErrorMessage('Desa domisili wajib dipilih.');
      return;
    }

    if (!noRm.trim()) {
      setErrorMessage('Nomor Rekam Medis (No RM) wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const newRecord = {
        no_rm: noRm.trim(),
        gelar: gelar.trim(),
        nama: nama.trim(),
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir || null,
        usia: usia === '' ? null : Number(usia),
        desa: desa.trim(),
        alamat: alamat.trim() || null,
        no_ktp: noKtp.trim() || null,
        no_bpjs: noBpjs.trim() || null,
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('no_rm')) {
          throw new Error(`Nomor RM "${noRm}" sudah terdaftar dalam sistem. Silakan gunakan nomor lain.`);
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
          <UserPlus className="w-5 h-5" />
        </div>
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* No RM */}
          <Input
            label="No RM"
            requiredIndicator
            value={noRm}
            onChange={(e) => setNoRm(e.target.value)}
            placeholder={isGeneratingRm ? 'Membuat...' : 'RM-XXXX'}
            className="font-mono font-bold bg-slate-50"
            required
          />

          {/* Gelar */}
          <Select
            label="Gelar / Sapaan"
            value={gelar}
            onChange={(e) => setGelar(e.target.value)}
            options={GELAR_OPTIONS}
          />

          {/* Jenis Kelamin */}
          <Select
            label="Jenis Kelamin"
            requiredIndicator
            value={jenisKelamin}
            onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
            options={JENIS_KELAMIN_OPTIONS}
          />
        </div>

        {/* Nama Lengkap */}
        <Input
          label="Nama Pasien Lengkap"
          requiredIndicator
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Siti Aisyah"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal Lahir */}
          <Input
            type="date"
            label="Tanggal Lahir"
            value={tanggalLahir}
            onChange={handleDateOfBirthChange}
          />

          {/* Usia (Tahun) */}
          <Input
            type="number"
            min="0"
            max="130"
            label="Usia (Tahun)"
            value={usia}
            onChange={(e) => setUsia(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Contoh: 32"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Desa */}
          <Select
            label="Desa Domisili"
            requiredIndicator
            value={desa}
            onChange={(e) => setDesa(e.target.value)}
            options={DESA_OPTIONS}
          />

          {/* No BPJS */}
          <Input
            label="Nomor Kartu BPJS (Opsional)"
            value={noBpjs}
            onChange={(e) => setNoBpjs(e.target.value)}
            placeholder="Contoh: 0001234567890"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* No KTP / NIK */}
          <Input
            label="NIK KTP (Opsional)"
            value={noKtp}
            onChange={(e) => setNoKtp(e.target.value)}
            placeholder="16 digit NIK"
            maxLength={16}
          />

          {/* Alamat Lengkap */}
          <Input
            label="Alamat / Kampung / RT / RW"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Kp. Cigadog RT 02/01"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Simpan Pasien Baru
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NewPatientModal;
