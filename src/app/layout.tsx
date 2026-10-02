import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import PwaRegistration from '@/components/PwaRegistration';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#134e4a',
};

export const metadata: Metadata = {
  title: 'Klinik Cikidang Medika - SIM & Keuangan',
  description: 'Sistem Informasi Manajemen Pasien & Laporan Keuangan Klinik Pratama Cikidang Medika',
  applicationName: 'Klinik Cikidang Medika',
  appleWebApp: {
    capable: true,
    title: 'Cikidang Medika',
    statusBarStyle: 'default',
  },
  // Next emits the standard mobile-web-app-capable tag; iOS before 16.4 only
  // honours the Apple-prefixed one.
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-slate-100 selection:bg-teal-100 selection:text-teal-900">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
        <PwaRegistration />
      </body>
    </html>
  );
}
