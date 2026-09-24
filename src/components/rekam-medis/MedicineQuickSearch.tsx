'use client';

import React, { useState } from 'react';
import { MagnifyingGlass, Pill, Plus, Sparkle } from '@phosphor-icons/react';
import {
  CLINIC_DRUG_CATALOG,
  FAST_SIGNA_CHIPS,
  POPULAR_PRESCRIPTIONS,
  type PrescriptionPreset,
} from '@/constants/prescriptions';
import { cn } from '@/lib/utils';

export interface MedicineQuickSearchProps {
  onAppendPrescription: (text: string) => void;
  className?: string;
}

export function MedicineQuickSearch({
  onAppendPrescription,
  className,
}: MedicineQuickSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchResults = CLINIC_DRUG_CATALOG.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.dosage.toLowerCase().includes(q) ||
      item.instruction.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelectDrug = (drug: PrescriptionPreset) => {
    const formatted = `${drug.name} - ${drug.dosage} (${drug.instruction})`;
    onAppendPrescription(formatted);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSelectSigna = (signa: string) => {
    onAppendPrescription(`[Signa: ${signa}]`);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Autocomplete Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlass
            className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none"
            weight="duotone"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setIsDropdownOpen(true);
            }}
            placeholder="Cari katalog obat (contoh: Amox, Parac, Antasida, Omep, Amlodipine, Cetirizine)..."
            aria-label="Cari obat dan resep apotek"
            className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>

        {/* Dropdown Results */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectDrug(item)}
                  className="p-2.5 flex items-center justify-between text-xs hover:bg-blue-50/70 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-blue-600 shrink-0" weight="duotone" />
                    <div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-slate-500 ml-2">
                        {item.dosage} ({item.instruction})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    {item.category}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                <span>Obat tidak ditemukan di katalog standar. Silakan ketik langsung di kolom resep di bawah.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular Drugs Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
          Pintasan Obat Populer Klinik (Klik untuk Menambahkan):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_PRESCRIPTIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectDrug(preset)}
              className="px-2.5 py-1.5 min-h-[34px] rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition flex items-center gap-1 select-none"
            >
              <Plus className="w-3 h-3 text-blue-600" weight="bold" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fast Signa Chips */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <Sparkle className="w-3 h-3 text-amber-500" weight="fill" />
          <span>Pintasan Aturan Pakai (Signa Cepat Sekali-Klik):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FAST_SIGNA_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleSelectSigna(chip.signa)}
              className="px-2.5 py-1 min-h-[30px] rounded-lg text-[11px] font-semibold border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 transition flex items-center gap-1 select-none"
              title={`Sisipkan aturan pakai: ${chip.signa}`}
            >
              <span>+ {chip.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MedicineQuickSearch;
