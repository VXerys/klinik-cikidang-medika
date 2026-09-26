---
id: F-007-TASKS
feature: F-007
title: "Implementation Tasks: Fitur Klinis & Administrasi Pasien"
status: implemented
owner: "dr. Ovan / Developer"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-007 Fitur Klinis & Administrasi Pasien

- [x] **TASK-001: Skema Database & Migrasi Alergi Pasien** `_Requirements: FR-003, FR-004_`
  - Buat migration file `supabase/migrations/20260923_patient_allergy_and_contacts.sql`.
  - Eksekusi SQL di database Staging & Production.
  - Perbarui interface TypeScript di `src/types/database.ts`.

- [x] **TASK-002: Pembuatan Komponen Surat Keterangan Sakit (SKS)** `_Requirements: FR-001_`
  - Buat `src/components/rekam-medis/SuratSakitModal.tsx`.
  - Dukung kop surat resmi, generator nomor surat otomatis, penyesuaian rentang hari istirahat, dan tata letak print-ready A5.

- [x] **TASK-003: Pembuatan Komponen Surat Rujukan Eksternal** `_Requirements: FR-002_`
  - Buat `src/components/rekam-medis/SuratRujukanModal.tsx`.
  - Integrasi pre-fill otomatis data pasien, tanda vital TTV, kode ICD-10, terapi sementara, dan tujuan rumah sakit rujukan.

- [x] **TASK-004: Integrasi Form Rekam Medis & Peringatan Alergi Reaktif** `_Requirements: FR-001, FR-002, FR-003_`
  - Perbarui `src/components/rekam-medis/ExaminationForm.tsx`.
  - Tambahkan tombol cetak SKS dan Rujukan.
  - Implementasikan deteksi alergi obat real-time dan badge bahaya merah.

- [x] **TASK-005: Pembuatan Komponen Edit Biodata Pasien & Update Pendaftaran** `_Requirements: FR-003, FR-004_`
  - Buat `src/components/pendaftaran/EditPatientModal.tsx`.
  - Perbarui `src/components/pendaftaran/PatientSearchAutocomplete.tsx` dengan trigger edit dan badge alergi.
  - Perbarui `src/components/pendaftaran/NewPatientModal.tsx` dengan input alergi dan telepon.

- [x] **TASK-006: Migrasi Data Sampel ke Lingkungan Staging** `_Requirements: G-004_`
  - Buat script dan jalankan injeksi 120 baris data riil dari `docs/data/DASHBOARD - DATAUTAMA.csv` ke database Staging.

- [x] **TASK-007: Verifikasi Kualitas & Delivery Gate** `_Requirements: AC-001 s/d AC-004_`
  - Validasi typecheck TypeScript (`npx tsc --noEmit`).
  - Validasi lint dan context (`node scripts/context/validate-context.mjs`).
  - Verifikasi build produksi (`npm run build`).
