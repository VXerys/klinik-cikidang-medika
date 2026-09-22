'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  House,
  UserPlus,
  Stethoscope,
  Heartbeat,
  Wallet,
  FileXls,
  MagnifyingGlass,
  Scissors,
  Pill,
  User,
  ArrowRight,
} from '@phosphor-icons/react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/database';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search patients
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const clean = trimmed.replace(/[,()]/g, '');
        const { data } = await supabase
          .from('patients')
          .select('id, no_rm, nama, desa, usia, jenis_kelamin')
          .or(`nama.ilike.%${clean}%,no_rm.ilike.%${clean}%,desa.ilike.%${clean}%`)
          .limit(5);

        setPatients((data as unknown as Patient[]) || []);
      } catch (err) {
        console.error('Error in cmdk patient search:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Cari pasien (Nama, No RM), menu klinik, atau tindakan... (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? 'Mencari rekam medis...' : 'Tidak ada hasil yang ditemukan.'}
        </CommandEmpty>

        {/* Pasien Terkait */}
        {patients.length > 0 && (
          <CommandGroup heading="Hasil Rekam Medis Pasien">
            {patients.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() =>
                  handleSelect(() => router.push(`/rekam-medis?search=${encodeURIComponent(p.no_rm)}`))
                }
              >
                <User className="w-4 h-4 text-blue-600 shrink-0" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    {p.nama}{' '}
                    <span className="font-mono text-[10px] text-slate-500 font-normal">
                      ({p.no_rm})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Desa {p.desa} • Usia {p.usia || '-'} thn
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Navigasi Cepat Modul */}
        <CommandGroup heading="Navigasi Menu Utama">
          <CommandItem onSelect={() => handleSelect(() => router.push('/'))}>
            <House className="w-4 h-4 text-slate-600" weight="duotone" />
            <span>Dashboard Eksekutif & Ringkasan</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/pendaftaran'))}>
            <UserPlus className="w-4 h-4 text-blue-600" weight="duotone" />
            <span>Loket Pendaftaran & Kasir Pasien</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/rekam-medis'))}>
            <Stethoscope className="w-4 h-4 text-emerald-600" weight="duotone" />
            <span>Pemeriksaan Dokter (E-Rekam Medis)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/program-khusus'))}>
            <Heartbeat className="w-4 h-4 text-rose-600" weight="duotone" />
            <span>Program Khusus Medis (TBC, Sunat, Pos-Rawat)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/buku-kas'))}>
            <Wallet className="w-4 h-4 text-amber-600" weight="duotone" />
            <span>Buku Kas Operasional & Likuiditas</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/laporan'))}>
            <FileXls className="w-4 h-4 text-emerald-600" weight="duotone" />
            <span>Pusat Laporan & Ekspor Excel</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Tindakan Cepat */}
        <CommandGroup heading="Aksi Tindakan Cepat">
          <CommandItem onSelect={() => handleSelect(() => router.push('/pendaftaran?action=new'))}>
            <UserPlus className="w-4 h-4 text-blue-600" weight="duotone" />
            <span>+ Daftarkan Pasien Baru</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/program-khusus?tab=circumcision&action=new'))}>
            <Scissors className="w-4 h-4 text-blue-600" weight="duotone" />
            <span>+ Catat Tindakan Sunat (Sirkumsisi)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push('/program-khusus?tab=tbc&action=new'))}>
            <Pill className="w-4 h-4 text-rose-600" weight="duotone" />
            <span>+ Buka Kartu Kendali TBC 6 Bulan</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
