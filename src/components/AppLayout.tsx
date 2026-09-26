'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { CommandMenu } from '@/components/CommandMenu';
import { useAuth, ROLE_LABELS } from '@/lib/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { Buildings } from '@phosphor-icons/react';
import { toast } from 'sonner';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, role, isLoading, canAccessRoute, getDefaultRoute } = useAuth();

  const isLoginPage = pathname === '/login';

  // Automatically close mobile drawer whenever route navigation occurs
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsDesktopCollapsed((prev) => !prev);
    } else {
      setIsMobileSidebarOpen((prev) => !prev);
    }
  }, []);

  // Close drawer on Escape key press, toggle sidebar on Ctrl+B / Cmd+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSidebar]);

  // Route Guard Effect: Handles unauthenticated users and role-restricted routes
  useEffect(() => {
    if (isLoading || isLoginPage) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!canAccessRoute(pathname)) {
      const targetRoute = getDefaultRoute(role);
      const roleLabel = role ? ROLE_LABELS[role]?.badge : 'Pengguna';
      toast.warning('Akses Terbatas', {
        description: `Modul tidak dapat diakses oleh peran ${roleLabel}. Mengalihkan ke menu utama Anda.`,
      });
      router.replace(targetRoute);
    }
  }, [isLoading, isLoginPage, user, pathname, canAccessRoute, getDefaultRoute, role, router]);

  // If on login page, render login page directly without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading Screen while session is validating
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white shadow-xl border border-slate-200/80 max-w-xs w-full text-center">
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
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Klinik Pratama</div>
            <div className="text-sm font-extrabold text-slate-900">Cikidang Medika</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
            <span>Memverifikasi otentikasi...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated or accessing unauthorized page, keep blank while redirecting
  if (!user || !canAccessRoute(pathname)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span>Mengalihkan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 min-w-0 w-full overflow-x-hidden">
      {/* Sidebar handles both desktop fixed sidebar and mobile/tablet slide-over drawer */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden overflow-x-hidden">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          isDesktopCollapsed={isDesktopCollapsed}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 min-w-0 w-full ambient-canvas">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandMenu />
    </div>
  );
}
