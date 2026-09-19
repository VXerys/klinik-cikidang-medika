# Sistem Informasi Manajemen & Laporan Keuangan Klinik Cikidang Medika

Aplikasi web modern berbasis **Next.js 14 (App Router)** dan **Supabase (PostgreSQL)** untuk mencatat pendaftaran pasien, antrean periksa dokter, rekam medis ringkas, pembukuan kas operasional, dan ekspor laporan keuangan ke Excel.

---

## 🚀 Panduan Cepat Menjalankan Proyek (Quickstart)

### 1. Masuk ke Direktori Proyek
```bash
cd D:\projects\klinik-cikidang-medika
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Setup Konfigurasi Supabase
1. Buat project baru gratis di [Supabase Dashboard](https://supabase.com).
2. Buka **SQL Editor** di Supabase, lalu jalankan seluruh isi berkas:
   `supabase/migrations/20260918_init_klinik_cikidang.sql`
3. Salin **Project URL** dan **Anon Key** ke berkas `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```

### 4. Jalankan Aplikasi di Mode Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Modul Aplikasi

- **Dashboard Ringkasan (`/`)**: Kartu metrik total pasien, pendapatan umum, estimasi dana kapitasi, dan 10 besar penyakit ICD-10.
- **Loket Pendaftaran & Kasir (`/pendaftaran`)**: Pencarian No RM cepat, pendaftaran pasien baru, dan pencatatan pembayaran kasir (Tunai/TF).
- **Pemeriksaan Dokter (`/rekam-medis`)**: Antrean periksa dokter, catatan keluhan anamnesa, dropdown ICD-10, dan resep obat.
- **Buku Kas Operasional (`/buku-kas`)**: Catat dana kapitasi masuk, beli obat, operasional non-klinik, dan setor tunai.
- **Laporan & Ekspor (`/laporan`)**: Filter rentang tanggal dan tombol 1-klik unduh rekap ke format Excel (`.xlsx`).
