'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  UserPlus,
  Stethoscope,
  Heartbeat,
  Wallet,
  FileXls,
  Calendar,
  SidebarSimple,
  MagnifyingGlass,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth, ROLE_LABELS } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  isDesktopCollapsed?: boolean;
}

export default function Navbar({
  onToggleSidebar,
  isDesktopCollapsed = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar dari sistem klinik.');
    router.replace('/login');
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleOpenCommand = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  const getModuleBreadcrumb = () => {
    if (pathname === '/') {
      return { category: 'Operasional', title: 'Dashboard Ringkasan', icon: House };
    }
    if (pathname.startsWith('/pendaftaran')) {
      return { category: 'Operasional', title: 'Loket & Kasir', icon: UserPlus };
    }
    if (pathname.startsWith('/rekam-medis')) {
      return { category: 'Klinis & Medis', title: 'Pemeriksaan Dokter', icon: Stethoscope };
    }
    if (pathname.startsWith('/program-khusus')) {
      return { category: 'Klinis & Medis', title: 'Program Khusus Medis', icon: Heartbeat };
    }
    if (pathname.startsWith('/buku-kas')) {
      return { category: 'Finansial & Laporan', title: 'Buku Kas Operasional', icon: Wallet };
    }
    if (pathname.startsWith('/laporan')) {
      return { category: 'Finansial & Laporan', title: 'Laporan & Ekspor Excel', icon: FileXls };
    }
    return { category: 'SIM', title: 'Sistem Informasi Manajemen', icon: Stethoscope };
  };

  const breadcrumb = getModuleBreadcrumb();
  const ModuleIcon = breadcrumb.icon;
  const roleInfo = role ? ROLE_LABELS[role] : null;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] shrink-0 min-w-0 w-full overflow-x-hidden">
      {/* Left: Sidebar Toggle & Contextual Module Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-1">
        {/* Modern Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isDesktopCollapsed ? 'Buka menu navigasi (Ctrl+B)' : 'Sembunyikan menu navigasi (Ctrl+B)'}
          title={isDesktopCollapsed ? 'Buka Menu Navigasi (Ctrl+B)' : 'Sembunyikan Menu Navigasi (Ctrl+B)'}
          className={`h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl flex items-center justify-center tactile-btn shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 active:scale-[0.96] cursor-pointer ${
            isDesktopCollapsed
              ? 'bg-teal-50 hover:bg-teal-100/90 text-teal-700 border border-teal-200/90 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300/80'
          }`}
        >
          <SidebarSimple
            className={`w-4.5 h-4.5 transition-transform duration-200 ${
              isDesktopCollapsed ? 'rotate-180 text-teal-600' : 'text-slate-600'
            }`}
            weight="duotone"
          />
        </button>

        <div className="h-4 w-px bg-slate-200/80 shrink-0 hidden sm:block" />

        {/* Dynamic Context Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Clinic Brand Mark (only displayed when sidebar is collapsed on desktop) */}
          {isDesktopCollapsed && (
            <div className="hidden lg:flex items-center gap-2 shrink-0 animate-fadeIn pr-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-teal-600 to-teal-700 text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs border border-teal-600">
                CM
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
                Cikidang Medika
              </span>
              <span className="text-slate-300 font-light">/</span>
            </div>
          )}

          {/* Module Icon + Category + Active Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 shrink-0">
              <ModuleIcon className="w-3.5 h-3.5" weight="duotone" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden xl:inline shrink-0">
                {breadcrumb.category}
              </span>
              <span className="text-slate-300 hidden xl:inline shrink-0">/</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                {breadcrumb.title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Universal Quick Search (Ctrl+K) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2">
        <button
          type="button"
          onClick={handleOpenCommand}
          className="w-full relative flex items-center justify-between pl-9 pr-2.5 py-1.5 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/90 hover:border-slate-300/80 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 tactile-btn group text-left min-h-[36px] cursor-pointer"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-teal-600 transition-colors">
            <MagnifyingGlass className="w-4 h-4" weight="bold" />
          </div>
          <span className="truncate text-slate-500 font-medium">Cari pasien, No. RM, atau menu...</span>
          <kbd className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200/90 rounded-md px-1.5 py-0.5 shadow-2xs shrink-0 ml-2">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Role Badge + User Info + Date + Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-slate-600 shrink-0">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={handleOpenCommand}
          aria-label="Cari Pasien (Ctrl+K)"
          title="Cari Pasien (Ctrl+K)"
          className="md:hidden h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 flex items-center justify-center tactile-btn shrink-0 active:scale-[0.96] transition-all cursor-pointer"
        >
          <MagnifyingGlass className="w-4 h-4" weight="bold" />
        </button>

        {/* Live Date Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50/90 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 min-h-[36px]">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" weight="duotone" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
            {today}
          </span>
        </div>

        {/* User Role Badge */}
        {roleInfo && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-bold text-[11px] min-h-[36px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
            <span className="truncate max-w-[120px] sm:max-w-[160px]">
              {profile?.name ? profile.name.split(' ')[0] : roleInfo.badge}
            </span>
            <span
              className={`hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider border ml-1 ${roleInfo.color}`}
            >
              {role}
            </span>
          </div>
        )}

        {/* Sign Out Action Button */}
        <button
          type="button"
          onClick={handleSignOut}
          title="Keluar dari Sistem Klinik"
          aria-label="Keluar dari Sistem Klinik"
          className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 flex items-center justify-center tactile-btn shrink-0 active:scale-[0.96] transition-all cursor-pointer"
        >
          <SignOut className="w-4 h-4" weight="bold" />
        </button>
      </div>
    </header>
  );
}
