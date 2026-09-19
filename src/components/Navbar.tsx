'use client';

import React from 'react';
import { Stethoscope, Calendar } from 'lucide-react';

export default function Navbar() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-slate-800 text-sm">Klinik Pratama Cikidang Medika</span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-2">Web Edition</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
}
