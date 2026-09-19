'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Stethoscope, ChevronDown } from 'lucide-react';
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

  // Filter catalog based on search input
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
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Pilih cepat atau ketik kode/penyakit
        </span>
      </div>

      {/* 8 Quick-Pick Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
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
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition select-none flex items-center gap-1.5',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold px-1 rounded',
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {item.code}
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input for Other ICD-10 Codes */}
      <div className="relative">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
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
            placeholder="Ketik untuk mencari diagnosa lain (contoh: Hipertensi, Asma, TBC, Gigi)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                      {item.code}
                    </span>
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                  {item.category && (
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                <span>Tidak ditemukan di katalog dasar. Anda dapat mengetik kode manual di bawah.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Final Editable Fields (Code & Description) */}
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
