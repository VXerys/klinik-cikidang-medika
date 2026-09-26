'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, ROLE_DEFAULT_ROUTES } from '@/lib/auth/AuthContext';
import {
  Buildings,
  LockKey,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  UserGear,
  Stethoscope,
  CashRegister,
} from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuickAccount {
  role: 'owner' | 'dokter' | 'kasir';
  title: string;
  name: string;
  email: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    role: 'owner',
    title: 'Owner / Pimpinan',
    name: 'dr. Ovan & dr. Neneng',
    email: 'owner@cikidangmedika.com',
    badge: 'Akses Penuh',
    icon: UserGear,
    description: 'Dashboard Eksekutif, Keuangan, & Laporan',
  },
  {
    role: 'dokter',
    title: 'Dokter Pemeriksa',
    name: 'dr. Ovan / Dokter Jaga',
    email: 'dokter@cikidangmedika.com',
    badge: 'Klinis & Medis',
    icon: Stethoscope,
    description: 'Antrean Periksa & Program Khusus',
  },
  {
    role: 'kasir',
    title: 'Loket & Kasir',
    name: 'Petugas Front Office',
    email: 'kasir@cikidangmedika.com',
    badge: 'Operasional',
    icon: CashRegister,
    description: 'Registrasi Pasien & Pembayaran',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedQuickRole, setSelectedQuickRole] = useState<string | null>(null);

  // If already logged in, redirect to the user's role landing page
  useEffect(() => {
    if (!authLoading && user && profile) {
      const targetRoute = ROLE_DEFAULT_ROUTES[profile.role] || '/';
      router.replace(targetRoute);
    }
  }, [user, profile, authLoading, router]);

  const handleSelectQuickAccount = (acc: QuickAccount) => {
    setEmail(acc.email);
    setPassword('CikidangMedika2026!');
    setSelectedQuickRole(acc.role);
    setErrorMessage(null);
    toast.info(`Akun ${acc.title} dipilih. Klik "Masuk ke Sistem" untuk melanjutkan.`, {
      duration: 2500,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success && result.role) {
      const targetRoute = ROLE_DEFAULT_ROUTES[result.role] || '/';
      toast.success('Berhasil masuk ke sistem klinik.', {
        description: `Selamat datang, ${email}`,
      });
      router.replace(targetRoute);
    } else {
      const msg = result.error || 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.';
      setErrorMessage(msg);
      toast.error('Gagal masuk', {
        description: msg,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-100 font-sans selection:bg-teal-100 selection:text-teal-900">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* SISI KIRI: Branding Medis Klinik Cikidang Medika (Desktop & Tablet) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle medical pattern background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Brand Block */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex max-w-[280px] sm:max-w-[320px]">
              <Image
                src="/assets/images/logo-white.png"
                alt="Klinik Pratama Cikidang Medika"
                width={420}
                height={88}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-800/80 border border-teal-600/50 text-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-300" weight="fill" />
                Sistem Informasi Terpadu (SIM)
              </span>
              <p className="text-sm text-teal-100/90 leading-relaxed font-normal">
                Platform manajemen klinik rawat jalan, rekam medis digital, dan akuntansi kasir terintegrasi untuk melayani masyarakat Cikidang & sekitarnya.
              </p>
            </div>

            {/* Key Advantages Checklist */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-teal-100">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" weight="fill" />
                <span>Otentikasi aman berbasis peran (Kasir, Dokter, & Owner)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-teal-100">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" weight="fill" />
                <span>Pencatatan rekam medis SOAP & ICD-10 terstandarisasi</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-teal-100">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" weight="fill" />
                <span>Pembukuan kasir transparan & rekonsiliasi kas riil</span>
              </div>
            </div>
          </div>

          {/* Bottom Clinic Address & Security Badge */}
          <div className="relative z-10 pt-8 border-t border-teal-700/50 space-y-2">
            <p className="text-[11px] text-teal-200/80 font-medium">
              Jl. Raya Cikidang, Kec. Cikidang, Kab. Sukabumi, Jawa Barat
            </p>
            <div className="flex items-center justify-between text-[10px] text-teal-300/70 font-mono">
              <span>dr. Ovan & dr. Neneng</span>
              <span>Enkripsi TLS 1.3</span>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Form Login & Quick Role Switcher */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mobile-only Clinic Logo Header */}
            <div className="flex items-center justify-start lg:hidden pb-3 border-b border-slate-100">
              <Image
                src="/assets/images/logo-full.png"
                alt="Logo Klinik Pratama Cikidang Medika"
                width={200}
                height={46}
                className="w-auto h-11 object-contain"
              />
            </div>

            {/* Header Form */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Masuk ke Sistem
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pilih peran tugas Anda atau masukkan email & kata sandi resmi.
              </p>
            </div>

            {/* Quick-Role Switcher Chips */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Pilih Cepat Berdasarkan Peran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {QUICK_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = selectedQuickRole === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`p-2.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[78px] tactile-btn active:scale-[0.96] ${
                        isSelected
                          ? 'bg-teal-50/90 border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon
                          className={`w-4 h-4 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`}
                          weight="duotone"
                        />
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {acc.badge}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div
                          className={`text-xs font-bold leading-tight truncate ${
                            isSelected ? 'text-teal-900' : 'text-slate-900'
                          }`}
                        >
                          {acc.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {acc.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <WarningCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" weight="fill" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <EnvelopeSimple className="w-4 h-4" weight="bold" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedQuickRole(null);
                      setErrorMessage(null);
                    }}
                    placeholder="nama@cikidangmedika.com"
                    autoComplete="email"
                    required
                    className="w-full py-2.5 pl-10 pr-3.5 text-xs sm:text-sm min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Default: CikidangMedika2026!</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <LockKey className="w-4 h-4" weight="bold" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedQuickRole(null);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full py-2.5 pl-10 pr-11 text-xs sm:text-sm min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? (
                      <EyeSlash className="w-4 h-4" weight="bold" />
                    ) : (
                      <Eye className="w-4 h-4" weight="bold" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-btn-primary border border-teal-700/80 flex items-center justify-center gap-2 transition-all duration-150 tactile-btn active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Klinik Pratama Cikidang Medika &copy; {new Date().getFullYear()} • Akses terbatas hanya untuk staf & dokter berwenang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
