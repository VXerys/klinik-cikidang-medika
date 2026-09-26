import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-card-double border border-slate-200/90 max-w-sm w-full text-center">
        <div className="w-full py-2 flex items-center justify-center">
          <Image
            src="/assets/images/logo-full.png"
            alt="Klinik Pratama Cikidang Medika"
            width={240}
            height={54}
            className="w-auto h-14 object-contain animate-pulse"
            priority
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
          <span>Memuat data modul...</span>
        </div>
      </div>
    </div>
  );
}
