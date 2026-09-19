'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserPlus, 
  Stethoscope, 
  Wallet, 
  FileSpreadsheet, 
  Building2,
  ChevronRight
} from 'lucide-react';

const menus = [
  { href: '/', label: 'Dashboard Ringkasan', icon: LayoutDashboard },
  { href: '/pendaftaran', label: 'Loket & Kasir', icon: UserPlus },
  { href: '/rekam-medis', label: 'Pemeriksaan Dokter', icon: Stethoscope },
  { href: '/buku-kas', label: 'Buku Kas Operasional', icon: Wallet },
  { href: '/laporan', label: 'Laporan & Ekspor Excel', icon: FileSpreadsheet },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white leading-tight">CIKIDANG MEDIKA</h1>
          <p className="text-xs text-blue-400 font-medium">Sistem Informasi Klinik</p>
        </div>
      </div>

      <nav className="p-3 flex-1 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300 font-medium">Klinik Beroperasi</span>
        </div>
        <p className="text-[11px] text-slate-400">dr. Ovan & dr. Neneng</p>
      </div>
    </aside>
  );
}
