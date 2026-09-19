# SIM Klinik Pratama Cikidang Medika

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Auth-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Hybrid_Storage-3448c5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

Sistem Informasi Manajemen (SIM) dan Pelaporan Keuangan berbasis web untuk **Klinik Pratama Cikidang Medika** (Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat). Aplikasi ini menggantikan pencatatan manual Google Sheets ke database relasional terstruktur dengan pencarian instan sub-100ms, integrasi kasir, antrean periksa dokter, dan pembukuan kas operasional.

---

## Ringkasan Fitur

| Modul | Rute | Status | Deskripsi |
|---|---|---|---|
| **Loket Pendaftaran & Kasir** | `/pendaftaran` | Selesai (F-001) | Pencarian cepat dari 4.238+ pasien lama (autocomplete 250ms), pendaftaran pasien baru dengan penomoran RM otomatis, pemisahan tagihan BPJS (Rp 0) vs Umum, dan cetak kuitansi. |
| **Migrasi Data Historis** | Script ETL | Selesai (F-005) | Migrasi 7.493 baris transaksi kunjungan dan 4.238 pasien dari Google Sheets ke Supabase Cloud PostgreSQL. |
| **Rekam Medis Ringkas Dokter** | `/rekam-medis` | Tahap Specs (F-002) | Pemanggilan antrian periksa harian, pencatatan anamnesa/SOAP, diagnosa berbasis ICD-10, dan resep obat. |
| **Buku Kas Operasional** | `/buku-kas` | Rencana (F-003) | Pencatatan arus kas masuk (kapitasi BPJS, pendapatan umum) dan kas keluar (pembelian obat, operasional klinik, setor tunai). |
| **Dashboard & Laporan Keuangan** | `/`, `/laporan` | Rencana (F-004) | Metrik kunjungan, pendapatan bulanan, 10 besar penyakit ICD-10, dan ekspor data 1-klik ke Excel (`.xlsx`). |
| **Program Khusus & Foto Medis** | `/rekam-medis/*` | Rencana (F-006/F-007) | Monitoring kohort TBC, rekam sirkumsisi (sunat) dengan penyimpanan foto medis hasil kompresi WebP (< 300KB), dan kontrol pos-rawat. |

---

## Arsitektur & Teknologi

- **Frontend & Routing:** Next.js 14 (App Router), React 18, Tailwind CSS 3.4.
- **Komponen UI:** Atomic UI Primitives (`src/components/ui/`) terstandarisasi (Button, Badge, Modal, Input, Select, Card) tanpa dependensi runtime pihak ketiga yang berat.
- **Konstanta Terpusat:** `src/constants/clinic.ts` sebagai single source of truth untuk profil klinik, daftar 10 desa Cikidang, tarif, dan opsi gelar.
- **Database & Auth:** Supabase Cloud PostgreSQL dengan Row Level Security (RLS) dan autentikasi berbasis peran (`kasir`, `dokter`, `owner`).
- **Hybrid Media Storage:** Supabase Storage (kuota privat 1GB) sebagai penyimpanan primer foto medis + Cloudinary (kuota 25GB) sebagai fallback otomatis via adapter `src/lib/storage.ts`.
- **Ekspor Data:** Pemrosesan dokumen Excel di sisi peramban menggunakan SheetJS (`xlsx`).

---

## Struktur Direktori

```text
src/
├── app/                        # Next.js App Router (Halaman per rute modul)
│   ├── pendaftaran/page.tsx    # Halaman loket kasir & antrian hari ini
│   ├── rekam-medis/page.tsx    # Halaman pemeriksaan dokter
│   ├── buku-kas/page.tsx       # Pembukuan kas operasional
│   ├── laporan/page.tsx        # Rekap laporan & ekspor spreadsheet
│   └── page.tsx                # Dashboard eksekutif klinik
├── components/
│   ├── ui/                     # Komponen atomik reusable (Button, Badge, Modal, Input, Select, Card)
│   ├── pendaftaran/            # Komponen domain loket (Search, Modals, Receipt)
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── constants/
│   ├── clinic.ts               # Profil klinik, 10 desa Cikidang, tarif dasar, gelar
│   └── theme.ts                # Token warna, status pembayaran, palet BPJS vs Umum
├── lib/
│   ├── storage.ts              # Adapter kompresi WebP < 300KB & upload hybrid
│   ├── supabase/               # Factory client Supabase (browser & server)
│   └── utils.ts                # cn(), formatRupiah(), formatDateIndo()
└── types/
    └── database.ts             # Definisi TypeScript schema PostgreSQL
```

---

## Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- Node.js versi 20 atau lebih baru
- npm versi 10 atau lebih baru
- Akun Supabase & Cloudinary aktif

### 2. Clone Repositori
```bash
git clone https://github.com/VXerys/klinik-cikidang-medika.git
cd klinik-cikidang-medika
```

### 3. Pasang Dependencies
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel konfigurasi di `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 5. Jalankan Skema Database
Buka **SQL Editor** pada dashboard proyek Supabase Anda, lalu eksekusi berkas DDL:
`supabase/migrations/20260918_init_klinik_cikidang.sql`

### 6. Jalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui peramban di [http://localhost:3000](http://localhost:3000).

---

## Skrip & Verifikasi Kualitas

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server di port 3000. |
| `npm run build` | Menjalankan build produksi Next.js (prerender static routes). |
| `npx tsc --noEmit` | Menjalankan type-checking TypeScript mode strict (zero error). |
| `npm run context:validate` | Memverifikasi konsistensi dokumen spesifikasi SDD di `docs/`. |

---

## Keamanan Data & Privasi

- **Penyembunyian Data Pasien (PII):** Seluruh data rekam medis historis CSV berada di luar repositori publik (`docs/data/` masuk ke `.gitignore`).
- **Autentikasi & RLS:** Akses tabel pasien dan keuangan dilindungi oleh kebijakan PostgreSQL Row Level Security (RLS).
- **Foto Medis Privat:** File foto medis dikompresi di sisi klien ke format WebP < 300KB dan diakses menggunakan signed URL dengan batas waktu (TTL 3600 detik).
