'use client';

import React from 'react';
import { Stethoscope, Calendar, List, MagnifyingGlass } from '@phosphor-icons/react';

export interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleOpenCommand = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-2.5 sm:px-6 shrink-0 shadow-2xs min-w-0 w-full overflow-x-hidden">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Mobile Hamburger Button (min 44x44px touch target) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <List className="w-5 h-5" weight="bold" />
        </button>

        {/* Clinic Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0 border border-blue-100">
            <Stethoscope className="w-5 h-5 text-blue-600" weight="duotone" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-800 text-xs sm:text-sm truncate leading-tight">
              Klinik Pratama Cikidang Medika
            </h1>
            <p className="text-[10px] text-blue-600 font-semibold block sm:hidden leading-tight truncate">
              SIM & Rekam Medis
            </p>
          </div>
          <span className="hidden md:inline-flex text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 shrink-0">
            Web Edition
          </span>
        </div>
      </div>

      {/* Right Header: Search Shortcut + Date */}
      <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
        <button
          type="button"
          onClick={handleOpenCommand}
          className="hidden sm:inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs">Cari Pasien...</span>
          <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 max-w-[110px] xs:max-w-[140px] sm:max-w-none min-h-[40px]">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" weight="duotone" />
          <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">
            {today}
          </span>
        </div>
      </div>
    </header>
  );
}
