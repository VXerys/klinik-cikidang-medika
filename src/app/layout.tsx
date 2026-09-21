import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Klinik Cikidang Medika — SIM & Keuangan',
  description: 'Sistem Informasi Manajemen Pasien & Laporan Keuangan Klinik Cikidang Medika',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased text-slate-900 bg-slate-100 selection:bg-blue-100 selection:text-blue-900">
        <AppLayout>{children}</AppLayout>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
