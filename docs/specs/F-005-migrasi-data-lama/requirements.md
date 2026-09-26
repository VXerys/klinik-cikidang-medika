---
id: F-005-REQ
feature: F-005
title: "Requirements: Migrasi 7.493 Data CSV ke Supabase"
status: implemented
owner: "Developer"
last_updated: "2026-09-23"
last_verified_commit: "9a59997"
related:
  - "design.md"
  - "tasks.md"
  - "docs/product/prd.md"
  - "scripts/migrate-data.mjs"
---

# Requirements: F-005 Migrasi 7.493 Data CSV ke Supabase

## 1. Executive Summary

Fitur F-005 menangani ekstraksi, transformasi, pembersihan data (*data cleansing*), dan pemuatan (*loading*) dari 4 file CSV historis Google Sheets klinik (periode Agustus 2023 hingga September 2026) ke dalam skema basis data PostgreSQL Supabase Cloud. Proses ini berhasil memindahkan 4.238 data master pasien unik, 7.493 catatan riwayat kunjungan rawat jalan, dan 1.486 transaksi buku kas operasional.

---

## 2. Source Data Artifacts

Data bersumber dari berkas CSV di `docs/data/`:
1. `DASHBOARD - DATAUTAMA.csv`: 7.493 baris data transaksi kunjungan pasien lengkap dengan diagnosa, biaya, dan dokter pemeriksa.
2. `DASHBOARD - QUERY.csv`: Data agregat pendukung.
3. `DASHBOARD - ANALISA.csv`: Rekapitulasi tren klinis dan asal desa.
4. `DASHBOARD - DASHBOARD.csv`: Formula awal metrik keuangan dan kas.

*Catatan: Berkas `docs/data/Emerys Glow*` adalah data retail skincare yang resmi dikecualikan (Out-of-Scope) sesuai kesepakatan dengan dr. Ovan.*

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Memindahkan 100% dari 7.493 baris riwayat kunjungan tanpa ada transaksi yang hilang.
- **G-002**: Menghasilkan 4.238 entitas master pasien unik di tabel `public.patients` dengan nomor RM unik.
- **G-003**: Menormalkan tanggal dari format Indonesia (`DD/MM/YYYY`) menjadi standar ISO PostgreSQL (`YYYY-MM-DD`).
- **G-004**: Memindahkan 1.486 data mutasi kas ke tabel `public.cash_flows` dengan nominal numerik valid.
- **G-005**: Memastikan integritas Foreign Key antara `visits.pasien_id` ke `patients.id` dan `visits.dokter_id` ke `doctors.id`.

### Non-Goals
- **NG-001**: Migrasi data skincare Emerys Glow.
- **NG-002**: Pemulihan otomatis data NIK atau BPJS yang memang kosong dari sumber spreadsheet asli.

---

## 4. Functional Requirements

### FR-001: Data Ingestion & Sanitization
Sistem HARUS membaca data CSV dan membersihkan format teks.
- **AC-001.1**: Penanganan kutip ganda dan karakter koma di dalam teks (nama pasien, alamat).
- **AC-001.2**: Konversi string kosong menjadi NULL pada kolom opsional (`no_ktp`, `no_bpjs`).
- **AC-001.3**: Konversi format nominal uang teks (menghilangkan Rp, titik ribuan) menjadi tipe data numerik.

### FR-002: Relational Mapping & Normalization
Sistem HARUS memetakan data spreadsheet flat ke skema relasional Supabase.
- **AC-002.1**: Master dokter dipetakan ke `public.doctors` (dr. Ovan, dr. Neneng, Bidan/Paramedis).
- **AC-002.2**: Setiap pasien unik dibuatkan record di `public.patients` dengan pencegahan duplikasi No RM.
- **AC-002.3**: Setiap kunjungan dihubungkan dengan relasi Foreign Key yang valid.

---

## 5. Status Verifikasi Data Produksi
- **Tabel `public.patients`**: 4.238 baris terverifikasi di Supabase Production (`aszjzvdmxudmoomdxttx`).
- **Tabel `public.visits`**: 7.493 baris terverifikasi di Supabase Production.
- **Tabel `public.cash_flows`**: 1.486 baris terverifikasi di Supabase Production.
