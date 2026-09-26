---
id: F-005-TSK
feature: F-005
title: "Tasks: Migrasi 7.493 Data CSV ke Supabase"
status: implemented
owner: "Developer"
last_updated: "2026-09-23"
last_verified_commit: "9a59997"
related:
  - "requirements.md"
  - "design.md"
  - "verification.md"
---

# Tasks: F-005 Migrasi 7.493 Data CSV ke Supabase

- [x] **TASK-005-1**: Pembuatan parser CSV mandiri `scripts/migrate-data.mjs` dengan penanganan kutip ganda dan sanitasi format tanggal.
- [x] **TASK-005-2**: Ekstraksi dan penyisipan 4.238 master pasien unik ke tabel `public.patients`.
- [x] **TASK-005-3**: Penyisipan 7.493 data transaksi kunjungan ke tabel `public.visits` dengan validasi relasi foreign key.
- [x] **TASK-005-4**: Penyisipan 1.486 data mutasi keuangan ke tabel `public.cash_flows`.
- [x] **TASK-005-5**: Verifikasi rekonsiliasi total baris antara berkas CSV dengan data di Supabase Production.
