'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  UserPlus,
  Stethoscope,
  Heartbeat,
  Wallet,
  FileXls,
  Buildings,
  CaretRight,
  X,
} from '@phosphor-icons/react';

const menus = [
  { href: '/', label: 'Dashboard Ringkasan', icon: House },
  { href: '/pendaftaran', label: 'Loket & Kasir', icon: UserPlus },
  { href: '/rekam-medis', label: 'Pemeriksaan Dokter', icon: Stethoscope },
  { href: '/program-khusus', label: 'Program Khusus Medis', icon: Heartbeat },
  { href: '/buku-kas', label: 'Buku Kas Operasional', icon: Wallet },
  { href: '/laporan', label: 'Laporan & Ekspor Excel', icon: FileXls },
];

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navigationContent = (
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
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                weight="duotone"
              />
              <span>{item.label}</span>
            </div>
            {isActive && <CaretRight className="w-4 h-4 text-blue-200 shrink-0" weight="bold" />}
          </Link>
        );
      })}
    </nav>
  );

  const footerContent = (
    <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-slate-200 font-semibold text-xs">Klinik Beroperasi</span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium">dr. Ovan & dr. Neneng</p>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-100 flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 shrink-0">
            <Buildings className="w-5 h-5 text-white" weight="duotone" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight truncate">
              CIKIDANG MEDIKA
            </h1>
            <p className="text-[11px] text-blue-400 font-medium truncate">Sistem Informasi Klinik</p>
          </div>
        </div>

        {navigationContent}
        {footerContent}
      </aside>

      {/* 2. Mobile & Tablet Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-100 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi Menu Klinik"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 shrink-0">
                  <Buildings className="w-5 h-5 text-white" weight="duotone" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm tracking-wide text-white leading-tight truncate">
                    CIKIDANG MEDIKA
                  </h2>
                  <p className="text-[10px] text-blue-400 font-medium truncate">Sistem Informasi Klinik</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup menu navigasi"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              {navigationContent}
            </div>

            {/* Footer */}
            {footerContent}
          </div>
        </div>
      )}
    </>
  );
}
