import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-card-double border border-slate-200/90 max-w-xs w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-teal-200/90 shadow-well p-2 flex items-center justify-center relative">
          <Image
            src="/assets/images/logo-square.png"
            alt="Logo Klinik Cikidang Medika"
            width={56}
            height={56}
            className="w-full h-full object-contain animate-pulse"
            priority
          />
        </div>
        <div>
          <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Klinik Pratama</div>
          <div className="text-sm font-extrabold text-slate-900">Cikidang Medika</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
          <span>Memuat data modul...</span>
        </div>
      </div>
    </div>
  );
}
