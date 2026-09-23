---
id: F-007-DESIGN
feature: F-007
title: "Technical Design: Fitur Klinis & Administrasi Pasien"
status: approved
owner: "dr. Ovan / Developer"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "tasks.md"
---

# Technical Design: F-007 Fitur Klinis & Administrasi Pasien

## 1. Architecture & Component Inventory

### New Components
1. `src/components/rekam-medis/SuratSakitModal.tsx`:
   - Modal interaktif untuk preview & cetak Surat Keterangan Istirahat Sakit (SKS).
   - Mendukung cetak langsung via window.print() dengan CSS `@media print` terisolasi.
2. `src/components/rekam-medis/SuratRujukanModal.tsx`:
   - Modal interaktif untuk rujukan faskes eksternal dengan pre-fill data rekam medis.
3. `src/components/pendaftaran/EditPatientModal.tsx`:
   - Modal formulir untuk mengedit master data pasien lama.

### Modified Components
1. `src/components/rekam-medis/ExaminationForm.tsx`:
   - Integrasi tombol Cetak SKS dan Cetak Rujukan.
   - Peringatan Alergi Obat (`riwayat_alergi`) dinamis dan real-time allergen check saat mengetik resep.
2. `src/components/pendaftaran/NewPatientModal.tsx`:
   - Penambahan input `riwayat_alergi`, `no_telepon`, `pekerjaan`.
3. `src/components/pendaftaran/PatientSearchAutocomplete.tsx`:
   - Penampilan badge Alergi Obat pada kartu pasien terpilih.
   - Tombol trigger pembuka `EditPatientModal`.
4. `src/constants/clinic.ts`:
   - Pengayaan konstanta profil klinik untuk kop surat resmi (SIP dokter, kontak resmi, alamat lengkap).

---

## 2. Database Schema Delta

```sql
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS riwayat_alergi TEXT DEFAULT 'Tidak Ada',
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(30),
ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_patients_riwayat_alergi ON public.patients(riwayat_alergi);
```

---

## 3. UI/UX & Print Layout Standards

### Kop Surat Resmi Klinik Cikidang Medika
```
=============================================================================
                     KLINIK PRATAMA CIKIDANG MEDIKA
          Jl. Raya Cikidang KM. 01, Kec. Cikidang, Kab. Sukabumi
              Telp: 0857-2090-0012 | Izin: 503/012/K-PRATAMA/2024
=============================================================================
```

### Print Stylesheet Strategy
- Menggunakan class Tailwind khusus cetak (`print:block`, `print:hidden`, `print:p-0`).
- Saat modal cetak dibuka, elemen latar belakang (navbar, sidebar, tombol aksi) otomatis disembunyikan dalam mode print.
- Margin standar halaman A5/A4 yang ramah printer inkjet dan laserjet klinik.
