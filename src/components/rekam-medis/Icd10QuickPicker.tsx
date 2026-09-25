'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// 5 Rural Presentation Quick Suggestions
const RURAL_PRIMARY_SUGGESTIONS: Icd10Item[] = [
  { code: 'K30', name: 'Dispepsia / Sakit Maag', category: 'Pencernaan' },
  { code: 'I10', name: 'Hipertensi Esensial', category: 'Kardiovaskular' },
  { code: 'J02.9', name: 'Faringitis Akut', category: 'Respirasi' },
  { code: 'L23.9', name: 'Dermatitis Alergi', category: 'Kulit' },
  { code: 'E11', name: 'Diabetes Mellitus Tipe 2', category: 'Endokrin' },
];

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
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchResults = COMMON_ICD10_LIST.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        const topResult = searchResults[0];
        handleAddDiagnosis(topResult.code, topResult.name);
      } else if (searchQuery.trim().length > 2) {
        setShowManualForm(true);
        setManualName(searchQuery.trim());
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className={cn('bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card-double space-y-4', className)}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/80 shrink-0">
            <Tag className="w-4 h-4" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>2. Diagnosa Klinis ICD-10 (Bisa &gt; 1)</span>
              <span className="text-rose-500">*</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Ketik kode/nama penyakit atau pilih rekomendasi kasus umum klinik Cikidang
            </p>
          </div>
        </div>

        <span className={cn(
          'text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border',
          diagnoses.length > 0
            ? 'bg-teal-50 text-teal-900 border-teal-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        )}>
          {diagnoses.length > 0 ? `${diagnoses.length} Terpilih` : 'Wajib 1 Diagnosa'}
        </span>
      </div>

      {/* Autocomplete Search Bar */}
      <div ref={searchContainerRef} className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlass
            className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none"
            weight="bold"
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
            onKeyDown={handleKeyDown}
            placeholder="Cari nama penyakit atau kode ICD-10 (misal: Gastritis, Asma, Diabetes, K30)..."
            aria-label="Cari kode atau diagnosa ICD-10"
            className="w-full pl-10 pr-24 py-1.5 min-h-[36px] text-xs bg-slate-50/80 border border-slate-300 rounded-xl font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white transition-all outline-none"
          />
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            <span className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs font-semibold">
              Enter ↵
            </span>
          </div>
        </div>

        {/* Floating Popover Suggestions */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-popover z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-popover p-1">
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
                      'p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition select-none',
                      selected
                        ? 'bg-teal-50 text-teal-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-white bg-teal-600 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                        {item.code}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {selected ? (
                      <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" weight="bold" /> Sudah dipilih
                      </span>
                    ) : (
                      item.category && (
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.category}
                        </span>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                <p>Kode tidak ditemukan di katalog standar.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(true);
                    setIsDropdownOpen(false);
                    setManualName(searchQuery);
                  }}
                  className="px-3 py-1.5 min-h-[34px] bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition tactile-btn"
                >
                  Tambah Manual: &quot;{searchQuery}&quot;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Diagnostic Chips (Medical Sapphire Badges) */}
      <div className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Diagnosa Aktif Terpilih:
          </span>
          {diagnoses.length === 0 && (
            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              <WarningCircle className="w-3.5 h-3.5" weight="fill" />
              Pilih minimal 1 diagnosa
            </span>
          )}
        </div>

        {diagnoses.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">
            Belum ada diagnosa yang dipilih. Ketik pencarian di atas atau klik salah satu pilihan cepat di bawah.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {diagnoses.map((diag) => (
              <div
                key={diag.code}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-xs select-none',
                  diag.isPrimary
                    ? 'bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-btn-primary border-teal-700'
                    : 'bg-white text-slate-800 border-slate-300 shadow-btn-secondary'
                )}
              >
                <span className="font-mono text-[11px] font-extrabold tracking-tight">
                  [{diag.code}]
                </span>
                <span>{diag.name}</span>

                {diag.isPrimary ? (
                  <span className="px-1.5 py-0.2 bg-white/20 rounded text-[9px] font-bold text-white border border-white/30 uppercase">
                    Utama
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(diag.code)}
                    className="text-[10px] text-teal-600 hover:text-teal-800 font-bold underline px-1"
                    title="Jadikan diagnosa primer"
                  >
                    Jadikan Utama
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveDiagnosis(diag.code)}
                  className={cn(
                    'p-0.5 rounded-full hover:bg-black/10 transition font-bold text-sm ml-1',
                    diag.isPrimary ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                  )}
                  aria-label={`Hapus ${diag.code}`}
                >
                  <X className="w-3.5 h-3.5" weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5 Rural Primary Disease Quick Suggestions */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Pilihan Cepat Kasus Umum Cikidang:
        </span>
        <div className="flex flex-wrap gap-2">
          {RURAL_PRIMARY_SUGGESTIONS.map((item) => {
            const selected = isCodeSelected(item.code);
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleToggleChip(item)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition border shadow-btn-secondary tactile-btn flex items-center gap-1.5 min-h-[34px]',
                  selected
                    ? 'bg-teal-600 text-white border-teal-600 font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                )}
              >
                {selected && <span className="font-bold">✓</span>}
                <span>{item.name}</span>
                <span className={cn(
                  'font-mono text-[10px] font-bold px-1.5 py-0.2 rounded',
                  selected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                )}>
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fallback Manual Form Drawer */}
      {showManualForm && (
        <form
          onSubmit={handleAddManual}
          className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900">Input Kode ICD-10 Manual</span>
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
                placeholder="Kode (mis: K29)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <input
                type="text"
                placeholder="Nama Diagnosa Medis"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
              <Button type="submit" size="sm" className="text-xs shrink-0 font-bold bg-teal-600 text-white min-h-[34px]">
                Tambah
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Icd10QuickPicker;
