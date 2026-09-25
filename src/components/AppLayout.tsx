'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { CommandMenu } from '@/components/CommandMenu';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

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
