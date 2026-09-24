'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlass,
  Tag,
  CheckCircle,
  X,
  Plus,
  Star,
  WarningCircle,
} from '@phosphor-icons/react';
import { POPULAR_ICD10, COMMON_ICD10_LIST, type Icd10Item } from '@/constants/icd10';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface DiagnosisItem {
  code: string;
  name: string;
  isPrimary: boolean;
}

export interface Icd10QuickPickerProps {
  diagnoses: DiagnosisItem[];
  onChangeDiagnoses: (diagnoses: DiagnosisItem[]) => void;
  className?: string;
}

export function Icd10QuickPicker({
  diagnoses,
  onChangeDiagnoses,
  className,
}: Icd10QuickPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');

  const searchResults = COMMON_ICD10_LIST.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  const isCodeSelected = (code: string) => {
    return diagnoses.some((d) => d.code.toUpperCase() === code.toUpperCase());
  };

  const handleToggleChip = (item: Icd10Item) => {
    if (isCodeSelected(item.code)) {
      handleRemoveDiagnosis(item.code);
    } else {
      handleAddDiagnosis(item.code, item.name);
    }
  };

  const handleAddDiagnosis = (code: string, name: string) => {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    if (!cleanCode || !cleanName) return;

    if (isCodeSelected(cleanCode)) return;

    const isFirst = diagnoses.length === 0;
    const newDiagnoses: DiagnosisItem[] = [
      ...diagnoses,
      { code: cleanCode, name: cleanName, isPrimary: isFirst },
    ];
    onChangeDiagnoses(newDiagnoses);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemoveDiagnosis = (code: string) => {
    const filtered = diagnoses.filter((d) => d.code.toUpperCase() !== code.toUpperCase());
    // If the removed item was primary, make the first remaining item primary
    if (filtered.length > 0 && !filtered.some((d) => d.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChangeDiagnoses(filtered);
  };

  const handleSetPrimary = (code: string) => {
    const updated = diagnoses.map((d) => ({
      ...d,
      isPrimary: d.code.toUpperCase() === code.toUpperCase(),
    }));
    onChangeDiagnoses(updated);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || !manualName.trim()) return;
    handleAddDiagnosis(manualCode, manualName);
    setManualCode('');
    setManualName('');
    setShowManualForm(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          Diagnosa Klinis (Standar ICD-10) <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
          Dapat memilih lebih dari 1 diagnosa (komorbid)
        </span>
      </div>

      {/* Selected Diagnoses List */}
      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Diagnosa Terpilih ({diagnoses.length})
          </span>
          {diagnoses.length === 0 && (
            <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
              <WarningCircle className="w-3.5 h-3.5" weight="bold" />
              Wajib minimal 1 diagnosa
            </span>
          )}
        </div>

        {diagnoses.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            Belum ada diagnosa yang dipilih. Silakan klik chip pilihan cepat di bawah atau cari kode ICD-10.
          </p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {diagnoses.map((diag) => (
              <div
                key={diag.code}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs',
                  diag.isPrimary
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-800'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0',
                      diag.isPrimary
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    )}
                  >
                    {diag.code}
                  </span>
                  <span className="font-semibold truncate">{diag.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {diag.isPrimary ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      <Star className="w-3 h-3 text-blue-600" weight="fill" />
                      Utama
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(diag.code)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition"
                      title="Jadikan sebagai diagnosa primer / utama"
                    >
                      Jadikan Utama
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveDiagnosis(diag.code)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    aria-label={`Hapus diagnosa ${diag.code}`}
                    title="Hapus diagnosa ini"
                  >
                    <X className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Pick Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
          Pilihan Cepat (Diagnosa Terpopuler Klinik):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_ICD10.map((item) => {
            const isSelected = isCodeSelected(item.code);

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleToggleChip(item)}
                className={cn(
                  'px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-medium border transition select-none flex items-center gap-1.5',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
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
                {isSelected ? (
                  <CheckCircle className="w-3.5 h-3.5 text-white" weight="bold" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" weight="bold" />
                )}
              </button>
            );
          })}
        </div>
      </div>

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
            placeholder="Cari kode atau nama diagnosa lain (contoh: Hipertensi, Asma, TBC, Gigi, Dispepsia)..."
            aria-label="Cari kode atau diagnosa ICD-10"
            className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Dropdown Hasil Pencarian */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
            {searchResults.length > 0 ? (
              searchResults.map((item) => {
                const selected = isCodeSelected(item.code);
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      if (!selected) {
                        handleAddDiagnosis(item.code, item.name);
                      }
                    }}
                    className={cn(
                      'p-2.5 flex items-center justify-between text-xs cursor-pointer transition',
                      selected
                        ? 'bg-blue-50 text-blue-800'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        {item.code}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {selected ? (
                      <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" weight="bold" /> Sudah dipilih
                      </span>
                    ) : (
                      item.category && (
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 space-y-2">
                <p>Tidak ditemukan di katalog standar.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowManualForm(true);
                    setIsDropdownOpen(false);
                    setManualName(searchQuery);
                  }}
                  className="text-xs"
                >
                  + Input Diagnosa Manual
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fallback Manual Form */}
      {showManualForm && (
        <form
          onSubmit={handleAddManual}
          className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Input Diagnosa Manual</span>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Batal
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="Kode ICD-10 (mis: K29)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <input
                type="text"
                placeholder="Nama Diagnosa Medis"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <Button type="submit" size="sm" className="text-xs shrink-0">
                + Tambah
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Icd10QuickPicker;
