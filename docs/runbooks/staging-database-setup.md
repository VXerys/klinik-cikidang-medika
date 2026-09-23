# Panduan Setup Database Staging Supabase

Panduan praktis bagi pimpinan dan pengembang Klinik Pratama Cikidang Medika untuk menyiapkan dan mengisolasi lingkungan **Database Staging (Uji Coba)** dan **Database Production (Live)** di Supabase Cloud.

---

## 1. Tujuan Arsitektur

Memisahkan data operasional pasien sebenarnya (*Production*) dari data pengujian fitur baru (*Staging*) agar:
1. Pengujian fitur baru (seperti unggah foto sirkumsisi, pengujian alert TBC, atau perubahan skema) tidak mengotori atau merusak riwayat medis pasien asli.
2. Tim pengembang dapat melakukan simulasi data dan verifikasi error tanpa mengganggu aktivitas loket kasir atau rekam medis harian klinik.

---

## 2. Langkah Pembuatan Database Staging di Supabase

### Langkah 1: Buat Project Baru di Supabase
1. Masuk ke dashboard [Supabase](https://supabase.com/dashboard).
2. Klik tombol **New Project**.
3. Isi parameter project:
   - **Name**: `klinik-cikidang-staging`
   - **Database Password**: Buat password yang kuat dan simpan di pengelola kata sandi aman.
   - **Region**: Pilih `Singapore (ap-southeast-1)` (sama dengan production untuk latensi terendah dari Indonesia).
   - **Pricing Plan**: Free Tier.
4. Klik **Create new project** dan tunggu proses provisi database selesai (sekitar 1–2 menit).

### Langkah 2: Eksekusi Migrasi Skema (DDL SQL)
1. Buka project `klinik-cikidang-staging` di dashboard Supabase.
2. Buka menu **SQL Editor** pada navigasi sisi kiri.
3. Klik **New query**.
4. Salin seluruh isi berkas skema database dari repositori lokal:
   `supabase/migrations/20260918_init_klinik_cikidang.sql`
5. Tempelkan (*paste*) kode SQL tersebut ke SQL Editor, lalu klik tombol **Run**.
6. Verifikasi pesan: `Success. No rows returned`. Seluruh 7 tabel (`doctors`, `patients`, `visits`, `cash_flows`, `tbc_programs`, `circumcisions`, `post_cares`) serta bucket storage privat `medical-photos` kini telah siap di database staging.

### Langkah 3: Ambil Kredensial API Staging
1. Di dashboard project staging, buka menu **Project Settings** (ikon gerigi di kiri bawah) > **API**.
2. Salin 2 nilai berikut:
   - **Project URL** (contoh: `https://xyzstaging.supabase.co`)
   - **Project API Keys** -> `anon` / `public` (kunci publik)
   - *(Opsional untuk migrasi CLI)*: `service_role` / `secret` (jangan pernah dipublikasikan ke sisi klien).

---

## 3. Konfigurasi Lingkungan Lokal (.env)

Pada lingkungan lokal komputer pengembang atau komputer uji klinik:

### Mode Pengujian Staging
Buka berkas `.env.local` di folder root repositori, lalu arahkan URL dan Anon Key ke project staging:
```env
# Koneksi Staging Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyzstaging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mode Produksi Live
Bila pengujian fitur di staging telah selesai dan disetujui untuk rilis operasional, arahkan kembali `.env.local` atau environment variables di Vercel Dashboard ke kredensial Production klinik.

---

## 4. Alur Kerja Promosi Fitur (Staging ke Production)

```text
[Fitur Baru / Update]
        │
        ├──► Uji Coba di Staging DB (Data Dummy)
        │         │
        │         ├── Verifikasi input form, upload foto WebP, visual chart
        │         └── Pastikan build & typecheck 100% lulus
        │
        ▼
[Persetujuan Rilis]
        │
        ├──► Terapkan DDL baru ke Production DB (bila ada tabel/kolom baru)
        └──► Deploy kode web ke Vercel Production
```

Dengan alur ini, database operasional klinik tetap aman, bersih, dan bebas dari resiko data korup akibat uji coba fitur baru.
