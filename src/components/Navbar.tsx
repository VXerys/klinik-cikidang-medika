'use client';

import React from 'react';
import { Stethoscope, Calendar, Menu } from 'lucide-react';

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

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-2xs">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Button (min 44x44px touch target) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clinic Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600 shrink-0 border border-blue-100">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-800 text-xs sm:text-sm truncate leading-tight">
              Klinik Pratama Cikidang Medika
            </h1>
            <p className="text-[10px] text-blue-600 font-semibold block sm:hidden leading-tight">
              SIM & Rekam Medis
            </p>
          </div>
          <span className="hidden md:inline-flex text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 shrink-0">
            Web Edition
          </span>
        </div>
      </div>

      {/* Right Header Metadata */}
      <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-700">
            {today}
          </span>
        </div>
      </div>
    </header>
  );
}
