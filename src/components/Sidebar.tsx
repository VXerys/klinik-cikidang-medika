'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  SignOut,
} from '@phosphor-icons/react';
import { useAuth, ROLE_LABELS } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface MenuGroup {
  category: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    category: 'Operasional',
    items: [
      { href: '/', label: 'Dashboard Ringkasan', icon: House },
      { href: '/pendaftaran', label: 'Loket & Kasir', icon: UserPlus },
    ],
  },
  {
    category: 'Klinis & Medis',
    items: [
      { href: '/rekam-medis', label: 'Pemeriksaan Dokter', icon: Stethoscope },
      { href: '/program-khusus', label: 'Program Khusus Medis', icon: Heartbeat },
    ],
  },
  {
    category: 'Finansial & Laporan',
    items: [
      { href: '/buku-kas', label: 'Buku Kas Operasional', icon: Wallet },
      { href: '/laporan', label: 'Laporan & Ekspor Excel', icon: FileXls },
    ],
  },
];

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  isDesktopCollapsed = false,
  onToggleDesktop,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, signOut, canAccessRoute } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar dari sistem klinik.');
    router.replace('/login');
  };

  // Filter menu groups based on role permissions
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoute(item.href)),
    }))
    .filter((group) => group.items.length > 0);

  const activeRoleInfo = role ? ROLE_LABELS[role] : null;

  const navigationContent = (
    <nav className="p-3 flex-1 space-y-4 overflow-y-auto">
      {filteredGroups.map((group) => (
        <div key={group.category}>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 mb-1.5 block">
            {group.category}
          </span>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs min-h-[44px] transition-colors tactile-btn text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white font-extrabold shadow-sidebar-active border border-teal-600/90'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                      weight="duotone"
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <CaretRight className="w-3.5 h-3.5 text-teal-100 shrink-0" weight="bold" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footerContent = (
    <div className="p-3 border-t border-slate-200/80 space-y-2">
      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 rounded-2xl shadow-well">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-teal-600 to-teal-800 text-white font-mono font-extrabold text-xs flex items-center justify-center shadow-btn-primary border border-teal-600 shrink-0 uppercase">
          {role ? role.slice(0, 2) : 'CM'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-xs text-slate-900 truncate">
            {profile?.name || 'Staf Klinik'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {activeRoleInfo && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border truncate ${activeRoleInfo.color}`}
              >
                {activeRoleInfo.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200/90 text-xs font-bold transition-all tactile-btn active:scale-[0.96] min-h-[38px] cursor-pointer"
      >
        <SignOut className="w-4 h-4" weight="bold" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Medical Turkish Teal Light Theme) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 min-h-screen bg-white/95 backdrop-blur-md text-slate-800 border-r border-slate-200/90 select-none transition-all duration-300 ease-in-out shadow-[0_2px_12px_rgba(15,23,42,0.03)] ${
          isDesktopCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64'
        }`}
      >
        {/* Clinic Branding Container */}
        <div className="p-3.5 border-b border-slate-200/80">
          <div className="p-3 bg-gradient-to-b from-teal-50/70 to-slate-50 border border-teal-100/80 rounded-2xl shadow-well flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 text-white font-extrabold flex items-center justify-center shadow-btn-primary shrink-0 border border-teal-600">
              <Buildings className="w-5 h-5 text-white" weight="duotone" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Klinik Pratama</div>
              <div className="text-xs font-extrabold text-slate-900 truncate">Cikidang Medika</div>
              <div className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate">Live Operasional</span>
              </div>
            </div>
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
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white text-slate-900 shadow-dialog flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-slate-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi Menu Klinik"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 text-white font-extrabold flex items-center justify-center shadow-btn-primary shrink-0 border border-teal-600">
                  <Buildings className="w-5 h-5 text-white" weight="duotone" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Klinik Pratama</div>
                  <div className="text-xs font-extrabold text-slate-900 truncate">Cikidang Medika</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup menu navigasi"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" weight="bold" />
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
