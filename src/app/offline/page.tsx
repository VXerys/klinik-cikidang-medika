import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tidak Ada Koneksi - Klinik Cikidang Medika',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8 text-center">
        <div className="flex justify-center">
          <Image
            src="/assets/images/logo-full.png"
            alt="Klinik Pratama Cikidang Medika"
            width={220}
            height={49}
            className="w-auto h-12 object-contain"
            priority
          />
        </div>

        <h1 className="mt-6 text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Tidak Ada Koneksi Internet
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Aplikasi klinik membaca dan menyimpan data pasien langsung ke server, sehingga layar ini
          muncul saat koneksi terputus.
        </p>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Data yang sudah tersimpan tetap aman dan tidak hilang. Sambungkan kembali perangkat ke
          internet, lalu buka aplikasi lagi.
        </p>

        {/* A plain link instead of a client-side reload keeps this page working
            even when its scripts were never cached. */}
        <Link
          href="/"
          className="mt-6 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-b from-teal-700 to-teal-800 border border-teal-800/80 px-4 py-2.5 text-sm font-bold text-white shadow-btn-primary transition-colors hover:from-teal-800 hover:to-teal-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/20"
        >
          Muat Ulang Aplikasi
        </Link>

        <p className="mt-4 text-[11px] text-slate-500">
          Klinik Pratama Cikidang Medika, Jl. Raya Cikidang, Sukabumi
        </p>
      </div>
    </div>
  );
}
