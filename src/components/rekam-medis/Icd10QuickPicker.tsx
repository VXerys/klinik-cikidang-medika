'use client';

import React, { useState } from 'react';
import { MagnifyingGlass, Tag, CheckCircle } from '@phosphor-icons/react';
import { POPULAR_ICD10, COMMON_ICD10_LIST, type Icd10Item } from '@/constants/icd10';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface Icd10QuickPickerProps {
  selectedCode: string;
  selectedDescription: string;
  onSelectIcd10: (code: string, description: string) => void;
  className?: string;
}

export function Icd10QuickPicker({
  selectedCode,
  selectedDescription,
  onSelectIcd10,
  className,
}: Icd10QuickPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchResults = COMMON_ICD10_LIST.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });

  const handleSelect = (item: Icd10Item) => {
    onSelectIcd10(item.code, item.name);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Diagnosa Klinis (Standar ICD-10) <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
          Pilih cepat atau ketik nama/kode penyakit
        </span>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
          Pilihan Cepat (Diagnosa Terpopuler Klinik):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_ICD10.map((item) => {
            const isSelected = selectedCode.toUpperCase() === item.code.toUpperCase();

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  'px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-medium border transition select-none flex items-center gap-1.5',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold px-1.5 py-0.5 rounded',
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {item.code}
                </span>
                <span>{item.name}</span>
                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" weight="bold" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" weight="duotone" />
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
            placeholder="Cari diagnosa lain (contoh: Hipertensi, Asma, TBC, Gigi, Dispepsia)..."
            aria-label="Cari kode atau diagnosa ICD-10"
            className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                      {item.code}
                    </span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  {item.category && (
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                <span>Tidak ditemukan di katalog dasar. Anda dapat mengetik kode & deskripsi manual di bawah.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="sm:col-span-1">
          <Input
            label="Kode ICD-10"
            requiredIndicator
            value={selectedCode}
            onChange={(e) => onSelectIcd10(e.target.value.toUpperCase(), selectedDescription)}
            placeholder="J00"
            className="font-mono font-bold uppercase"
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Deskripsi Diagnosa Medis"
            requiredIndicator
            value={selectedDescription}
            onChange={(e) => onSelectIcd10(selectedCode, e.target.value)}
            placeholder="ISPA / Nasopharyngitis Akut"
          />
        </div>
      </div>
    </div>
  );
}


export default Icd10QuickPicker;
