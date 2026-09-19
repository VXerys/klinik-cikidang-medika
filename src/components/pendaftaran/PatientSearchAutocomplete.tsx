'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, UserPlus, X, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/database';
import { cn } from '@/lib/utils';

export interface PatientSearchAutocompleteProps {
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function PatientSearchAutocomplete({
  onSelectPatient,
  onAddNewPatient,
  className,
  placeholder = 'Cari pasien berdasarkan Nama, No RM, atau Desa...',
  autoFocus = false,
}: PatientSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query against public.patients
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    let isCurrent = true;

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        // Remove special PostgREST syntax characters to prevent query parsing errors
        const cleanQuery = trimmed.replace(/[,()]/g, '');

        const { data, error } = await supabase
          .from('patients')
          .select('id, no_rm, gelar, nama, jenis_kelamin, tanggal_lahir, usia, desa, alamat, no_ktp, no_bpjs, created_at')
          .or(`nama.ilike.%${cleanQuery}%,no_rm.ilike.%${cleanQuery}%,desa.ilike.%${cleanQuery}%`)
          .order('nama', { ascending: true })
          .limit(10);

        if (!isCurrent) return;

        if (error) {
          console.error('Error searching patients:', error.message);
          setResults([]);
        } else {
          setResults((data as unknown as Patient[]) || []);
        }
      } catch (err) {
        if (!isCurrent) return;
        console.error('Unexpected error searching patients:', err);
        setResults([]);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleAddNewPatient = () => {
    setIsOpen(false);
    onAddNewPatient();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen) return;

    if (results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectPatient(results[selectedIndex]);
        }
      }
    } else if (!isLoading && query.trim().length >= 2 && e.key === 'Enter') {
      e.preventDefault();
      handleAddNewPatient();
    }
  };

  const hasSearchQuery = query.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <div className="pl-3.5 pr-2 flex items-center justify-center text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hasSearchQuery) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-2.5 pr-8 text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none"
        />

        <div className="pr-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {query.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && hasSearchQuery && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
          {/* Results List */}
          {results.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                <span>Hasil Pencarian ({results.length} pasien)</span>
                <span className="text-[10px] text-slate-400 font-normal">Gunakan panah ↑↓ dan Enter</span>
              </div>

              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {results.map((patient, index) => {
                  const isSelected = selectedIndex === index;
                  const fullName = [patient.gelar, patient.nama].filter(Boolean).join(' ');

                  return (
                    <li
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition select-none',
                        isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600 pl-3' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {fullName}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            {patient.no_rm}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {patient.desa}
                          </span>
                          <span>•</span>
                          <span>{patient.jenis_kelamin}</span>
                          {patient.usia !== undefined && patient.usia !== null && (
                            <>
                              <span>•</span>
                              <span>{patient.usia} thn</span>
                            </>
                          )}
                          {patient.no_bpjs && (
                            <>
                              <span>•</span>
                              <span className="bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded font-medium border border-teal-200 text-[10px]">
                                BPJS: {patient.no_bpjs}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-medium text-blue-600 hover:underline">
                          Pilih
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Pasien tidak terdaftar di hasil?</span>
                <button
                  type="button"
                  onClick={handleAddNewPatient}
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  + Daftarkan Sebagai Pasien Baru
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            /* Empty State */
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">
                  Pasien &quot;{query}&quot; tidak ditemukan
                </p>
                <p className="text-[11px] text-slate-500">
                  Tidak ditemukan pasien yang sesuai dengan No RM, Nama, atau Desa tersebut.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNewPatient}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Daftarkan Sebagai Pasien Baru
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default PatientSearchAutocomplete;
