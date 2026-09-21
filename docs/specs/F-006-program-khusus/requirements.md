---
id: F-006-REQ
feature: F-006
title: "Requirements: Register Program Khusus (TBC, Sunat + Foto, Pos-Rawat)"
status: approved
owner: "Developer / dr. Ovan"
last_updated: "2026-09-21"
last_verified_commit: unverified
related:
  - "docs/product/prd.md"
  - "docs/product/Proposal_Klinik_Cikidang_Medika.pdf"
  - "supabase/migrations/20260918_init_klinik_cikidang.sql"
---

# Requirements: F-006 Register Program Khusus Medis

## 1. Executive Summary

Modul **Register Program Khusus Medis** (`/program-khusus`) dirancang untuk memenuhi instruksi khusus dr. Ovan dan tim medis Klinik Pratama Cikidang Medika guna memantau tiga program klinis berdampak tinggi:
1. **Kartu Kendali TBC 6 Bulan**: Pemantauan kepatuhan minum obat anti tuberkulosis (OAT) dan deteksi dini pasien mangkir.
2. **Layanan Sunat (Sirkumsisi) Modern**: Dokumentasi tindakan bedah minor dan penyimpanan foto evaluasi luka pasca sunat secara privat dan aman.
3. **Agenda Pasien Pos-Rawat**: Pemantauan jadwal kontrol berkala pasien pasca rawat inap rumah sakit atau paska tindakan operatif.

---

## 2. Actors & Permissions

- **ACTOR-001: Dokter Pemeriksa & Tim Medis (`dokter`, `owner`)**: Memiliki hak penuh membuka kartu kendali TBC, mencatat fase pengobatan, menjadwalkan kontrol pos-rawat, mencatat tindakan sirkumsisi, mengunggah serta meninjau foto luka pasca sunat.
- **ACTOR-002: Kasir / Petugas Resepsionis (`kasir`)**: Dapat melihat jadwal kedatangan pasien kontrol TBC/pos-rawat di antrean loket pendaftaran dan mencatat pembayaran tindakan sirkumsisi.

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Menyediakan kartu pemantauan pengobatan TBC 6 bulan yang secara otomatis menghitung fase intensif (bulan 1–2) dan fase lanjutan (bulan 3–6).
- **G-002**: Menampilkan peringatan visual (*Mangkir Kontrol*) otomatis apabila pasien TBC atau Pos-Rawat belum kontrol lebih dari 7 hari dari tanggal yang dijadwalkan.
- **G-003**: Menyediakan sarana unggah hingga 2 foto luka kontrol pasca sunat per pasien dengan kompresi otomatis sisi klien ke WebP (< 300KB) yang tersimpan aman di cloud privat (Cloudinary Free Tier 25GB / Supabase Storage).
- **G-004**: Memastikan tampilan antarmuka 100% responsif di smartphone dan komputer desktop pemeriksa.

### Non-Goals
- **NG-001**: Integrasi API SITB (Sistem Informasi Tuberkulosis) Kemenkes secara online (pencatatan internal klinik untuk kartu kendali kohort).
- **NG-002**: Penyimpanan foto luka tanpa kompresi (seluruh foto wajib dikompresi di browser menjadi WebP < 300KB sebelum diunggah).

---

## 4. Functional Requirements (EARS & RFC 2119)

### 4.1 Program 1: Kartu Kendali TBC 6 Bulan

- **FR-001.1**: WHEN dokter mendaftarkan pasien ke program TBC, THEN sistem HARUS meminta pemilihan pasien (dari master `patients`), tanggal mulai minum obat, tipe pasien (`Kasus Baru`, `Kambuh`, `Pindahan`), dan kategori OAT (`Kategori 1`, `Kategori 2`).
- **FR-001.2**: Sistem HARUS menampilkan kartu kendali 6 blok bulan:
  - Bulan 1 & 2: Fase Intensif (Regimen 4FDC).
  - Bulan 3, 4, 5, 6: Fase Lanjutan (Regimen 2FDC).
- **FR-001.3**: WHEN tanggal rencana kontrol berikutnya telah terlewat > 7 hari dan status belum diperbarui, THEN sistem HARUS menandai status pasien sebagai `Mangkir Kontrol` dengan warna merah mencolok.
- **FR-001.4**: Sistem HARUS menyediakan pencatatan hasil pemeriksaan dahak mikroskopis BTA pada Bulan ke-2, Bulan ke-5, dan Akhir Pengobatan (`Positif`, `Negatif`, `Belum Periksa`).
- **FR-001.5**: Dokter HARUS dapat menentukan status akhir pengobatan: `Dalam Pengobatan`, `Sembuh`, `Pengobatan Lengkap`, `Gagal`, `Mangkir (Drop-out)`, atau `Meninggal`.

### 4.2 Program 2: Layanan Sunat (Sirkumsisi) & Foto Kontrol

- **FR-002.1**: WHEN mencatat tindakan sunat, THEN sistem HARUS menyimpan nama pasien anak/dewasa, tanggal tindakan, nama dokter/operator pelaksana, metode sunat (`Laser / Kauter`, `Klamp / Smart Klamp`, `Konvensional`), biaya tindakan, dan catatan tindakan.
- **FR-002.2**: WHEN pasien datang untuk kontrol pasca sunat (Hari ke-3 atau Hari ke-7), THEN dokter DAPAT mengunggah maksimal 2 foto evaluasi luka.
- **FR-002.3**: Setiap foto yang diunggah HARUS dikompresi di sisi klien menjadi format WebP dengan ukuran berkas < 300KB sebelum dikirim ke media storage (`src/lib/storage.ts`).
- **FR-002.4**: Tampilan foto medis HANYA boleh diakses oleh pengguna terautentikasi (dokter & pemilik) dengan URL bertanda tangan aman (*signed URLs*) atau token privat.

### 4.3 Program 3: Monitoring Pasien Pos-Rawat

- **FR-003.1**: WHEN pasien pasca rawat inap atau tindakan medis didaftarkan ke pemantauan pos-rawat, THEN sistem HARUS mencatat tanggal kontrol berikutnya, diagnosa pasca rawat, dan kondisi terakhir pasien.
- **FR-003.2**: Sistem HARUS menyajikan daftar agenda pasien yang harus kontrol hari ini, besok, dan yang telah lewat jatuh tempo (*overdue*).
- **FR-003.3**: WHEN pasien datang kontrol, THEN dokter dapat memperbarui catatan keluhan lanjutan dan mengubah status menjadi `Sudah Kontrol` atau menetapkan jadwal kontrol lanjutan.

---

## 5. Non-Functional & Anti-Slop Requirements

- **NFR-001 (Privasi Data Medis)**: Foto luka sirkumsisi diklasifikasikan sebagai data SENSITIF (R-10 Security Architecture); tidak boleh disimpan di bucket publik yang terbuka tanpa autentikasi.
- **NFR-002 (Efisiensi Bandwidth & Biaya Rp 0)**: Pemanfaatan hybrid storage adapter (`src/lib/storage.ts`) dengan batas 25GB Cloudinary gratis menjamin kapasitas penyimpanan hingga 80.000+ foto WebP tanpa biaya server tambahan.
- **NFR-003 (Responsivitas Mobile)**: Tampilan formulir dan kartu kendali TBC wajib nyaman dioperasikan pada tablet dan smartphone vertikal (min-height 44px, no horizontal scroll).
