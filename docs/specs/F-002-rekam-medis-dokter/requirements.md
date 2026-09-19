---
id: F-002-REQ
feature: F-002
title: "Requirements: Rekam Medis Ringkas Dokter"
status: approved
owner: "dr. Ovan / Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "design.md"
  - "tasks.md"
  - "docs/product/prd.md"
---

# Requirements: F-002 Rekam Medis Ringkas Dokter

## 1. Executive Summary

Modul **Rekam Medis Ringkas Dokter** (`/rekam-medis`) adalah antarmuka ruang periksa bagi dokter jaga di Klinik Pratama Cikidang Medika. Modul ini menyajikan antrean pasien harian yang telah didaftarkan oleh loket kasir, menyediakan formulir input pemeriksaan klinis terpadu (anamnesa, diagnosa ICD-10 instan, terapi obat, tindakan), dan menampilkan riwayat kunjungan terdahulu pasien secara otomatis dari 7.493 data historis untuk mempermudah kontinuitas perawatan.

---

## 2. Actors & Permissions

- **ACTOR-001: Dokter Pemeriksa (`dokter`)**: Aktor utama. Memanggil antrean, mencatat anamnesa, memilih diagnosa ICD-10, meresepkan terapi obat/tindakan, dan melihat riwayat medis pasien sebelumnya.
- **ACTOR-002: Kasir / Loket (`kasir`)**: Mendaftarkan pasien ke antrian harian (F-001) yang menjadi sumber data masuk ke ruang dokter.
- **ACTOR-003: Pimpinan Klinik (`owner`)**: Memantau tren diagnosa penyakit dan efisiensi pelayanan dokter.

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Dokter dapat melihat antrean pasien hari ini secara *real-time* dengan penanda status yang jelas (Menunggu, Sedang Diperiksa, Selesai).
- **G-002**: Penginputan diagnosa ICD-10 selesai dalam waktu < 5 detik menggunakan *Quick-Pick Chips* untuk 8 penyakit teratas klinik serta autocomplete pencarian kode/deskripsi ICD-10.
- **G-003**: Riwayat kunjungan medis pasien terdahulu (diagnosa lampau, obat sebelumnya) langsung tampil saat pasien dipilih tanpa perlu membuka halaman baru.
- **G-004**: Penyimpanan hasil pemeriksaan meng-update baris kunjungan di tabel `public.visits` secara instan.

### Non-Goals
- **NG-001**: Pengurangan stok apotek per butir (obat dicatat sebagai teks resep/terapi, inventori dikelola oleh sistem farmasi terpisah per PRD).
- **NG-002**: Bridging API P-Care BPJS Kesehatan (pencatatan bersifat internal klinik).
- **NG-003**: Integrasi perangkat tanda vital digital via Bluetooth/IoT.

---

## 4. Functional Requirements (EARS & RFC 2119)

### FR-001: Antrean Pasien Hari Ini (Queue Panel)
Sistem HARUS menampilkan daftar antrean pasien terdaftar untuk hari ini (`tanggal_periksa = CURRENT_DATE`) pada kolom samping kiri.

- **AC-001.1**: WHEN dokter membuka halaman `/rekam-medis`, THEN sistem HARUS memuat seluruh kunjungan hari ini dari `public.visits` diurutkan berdasarkan `nomor_antrian` secara teratur.
- **AC-001.2**: Sistem HARUS menampilkan nomor antrian, nama pasien, No RM, kategori (BPJS / UMUM), dan status periksa pasien pada setiap kartu antrean.
- **AC-001.3**: WHEN dokter mengklik salah satu kartu antrean pasien, THEN sistem HARUS memuat data pasien tersebut ke panel ruang periksa kanan dan menandai pasien tersebut sebagai aktif (`activeVisit`).

### FR-002: Header Identitas & Anamnesa Loket
Sistem HARUS menampilkan ringkasan identitas pasien dan keluhan awal dari loket pendaftaran.

- **AC-002.1**: WHEN seorang pasien dipilih, THEN sistem HARUS menampilkan: Nama Lengkap, No RM, Usia, Jenis Kelamin, Desa Domisili, Kategori BPJS/Umum, serta keluhan awal (`keluhan_anamnesa`) yang diinput kasir loket.
- **AC-002.2**: IF pasien belum memiliki rekam medis terdahulu, THEN sistem HARUS menampilkan label *"Kunjungan Pertama Pasien Baru"*.

### FR-003: Input Diagnosa ICD-10 Cepat
Sistem HARUS menyediakan mekanisme pemilihan diagnosa penyakit berbasis standar ICD-10 dengan kecepatan tinggi.

- **AC-003.1**: Sistem HARUS menampilkan 8 tombol pintas (*Quick-Pick Chips*) untuk diagnosa terbanyak di Klinik Cikidang:
  1. `J00` - ISPA / Nasopharyngitis Akut
  2. `K30` - Dispepsia / Sakit Lambung
  3. `Z34` - Pemeriksaan Kehamilan Normal (ANC)
  4. `L23` - Dermatitis Alergi
  5. `R50` - Demam / Observasi Febris
  6. `E11` - Diabetes Mellitus (DM)
  7. `A09` - Gastroenteritis / Diare Akut
  8. `Z00` - Pemeriksaan Kesehatan Umum (Medical Check)
- **AC-003.2**: WHEN dokter mengklik salah satu chip diagnosa, THEN sistem HARUS secara otomatis mengisi kolom `kode_icd10` dan `diagnosa_deskripsi`.
- **AC-003.3**: Dokter DAPAT mencari kode atau deskripsi ICD-10 lainnya melalui input autocomplete jika diagnosa tidak termasuk dalam 8 chip terpopuler.

### FR-004: Terapi Obat & Tindakan Medis
Sistem HARUS menyediakan kolom catatan terapi obat, tindakan medis dokter, dan pemeriksaan lab sederhana.

- **AC-004.1**: Dokter DAPAT menginput teks resep terapi obat (`terapi_obat`), rincian tindakan medis (`tindakan`), dan catatan lab sederhana (`lab`, `lab_hasil`, e.g. GDS, Asam Urat, Kolesterol).
- **AC-004.2**: Dokter DAPAT menambahkan anamnesa lanjutan pada keluhan pasien.

### FR-005: Simpan & Selesaikan Pemeriksaan
Sistem HARUS memperbarui record kunjungan di database saat dokter menekan tombol *"Simpan Pemeriksaan"*.

- **AC-005.1**: WHEN dokter menekan tombol *"Simpan Pemeriksaan"*, THEN sistem HARUS memperbarui tabel `public.visits` untuk ID kunjungan terkait dengan field: `kode_icd10`, `diagnosa_deskripsi`, `keluhan_anamnesa`, `terapi_obat`, `tindakan`, `keterangan_tindakan`, `lab`, dan `lab_hasil`.
- **AC-005.2**: WHEN update berhasil, THEN kartu antrean pasien tersebut di kolom kiri HARUS berubah status menjadi *"Selesai Diperiksa"* dan sistem menampilkan notifikasi sukses singkat.

### FR-006: Riwayat Medis Lampau Pasien (Historical Medical Records)
Sistem HARUS menampilkan riwayat pemeriksaan masa lalu pasien bersangkutan di bagian bawah panel periksa.

- **AC-006.1**: WHEN pasien aktif dipilih, THEN sistem HARUS memuat kunjungan terdahulu (`pasien_id = activeVisit.pasien_id` AND `id != activeVisit.id`) diurutkan dari yang paling baru.
- **AC-006.2**: Untuk setiap kunjungan lampau, sistem HARUS menampilkan: Tanggal Periksa, Dokter Pemeriksa, Diagnosa ICD-10, Keluhan, dan Terapi Obat yang pernah diberikan.

---

## 5. Non-Functional Requirements

- **Responsiveness**: Berjalan mulus pada layar monitor meja dokter (resolusi 1366x768 hingga 1920x1080) serta tablet/smartphone dokter.
- **Performance**: Pemuatan riwayat pasien < 100ms berkat indeks pada kolom `visits.pasien_id`.
- **Design Cleanliness**: Mematuhi panduan Anti-Slop (tanpa warna norak, kontras teks memadai, tipografi hierarkis, teks bahasa Indonesia yang santun).
