---
id: F-006-REQ
feature: F-006
title: "Requirements: Register Program Khusus (TBC, Sunat + Foto Medis, Pos-Rawat)"
status: approved
owner: "Developer / dr. Ovan"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "docs/product/prd.md"
  - "docs/product/Proposal_Klinik_Cikidang_Medika.pdf"
  - "docs/runbooks/staging-database-setup.md"
  - "supabase/migrations/20260918_init_klinik_cikidang.sql"
---

# Requirements: F-006 Register Program Khusus Medis

## 1. Executive Summary

Modul **Register Program Khusus Medis** (`/program-khusus`) dirancang untuk memenuhi instruksi khusus dr. Ovan dan tim medis Klinik Pratama Cikidang Medika guna memantau tiga program klinis berdampak tinggi:
1. **Kartu Kendali TBC 6 Bulan**: Pemantauan kepatuhan minum obat anti tuberkulosis (OAT) dan deteksi dini pasien mangkir kontrol.
2. **Layanan Sunat (Sirkumsisi) Modern**: Dokumentasi tindakan bedah minor dan penyimpanan foto evaluasi luka pasca sunat secara privat dan aman dengan kompresi WebP < 300KB.
3. **Agenda Pasien Pos-Rawat**: Pemantauan jadwal kontrol berkala pasien pasca rawat inap rumah sakit atau paska tindakan operatif.

---

## 2. Actors & Permissions

- **ACTOR-001: Dokter Pemeriksa & Tim Medis (`dokter`, `owner`)**: Memiliki hak penuh membuka kartu kendali TBC, mencatat fase pengobatan, menjadwalkan kontrol pos-rawat, mencatat tindakan sirkumsisi, mengunggah serta meninjau foto luka pasca sunat.
- **ACTOR-002: Kasir / Petugas Resepsionis (`kasir`)**: Dapat melihat jadwal kedatangan pasien kontrol TBC/pos-rawat di antrean loket pendaftaran dan mencatat pembayaran tindakan sirkumsisi.

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Menyediakan kartu pemantauan pengobatan TBC 6 bulan yang secara otomatis membagi fase intensif (bulan 1–2) dan fase lanjutan (bulan 3–6).
- **G-002**: Menampilkan peringatan visual (*Mangkir Kontrol*) otomatis apabila pasien TBC atau Pos-Rawat belum kontrol lebih dari 7 hari dari tanggal yang dijadwalkan.
- **G-003**: Menyediakan sarana unggah hingga 2 foto luka kontrol pasca sunat per pasien dengan kompresi otomatis sisi klien ke WebP (< 300KB) yang tersimpan aman di cloud privat (`medical-photos`).
- **G-004**: Menyediakan 2 opsi pengambilan foto: kamera langsung (`capture="environment"`) pada perangkat mobile/tablet klinik, atau unggah dari galeri/berkas penyimpanan perangkat (ramah laptop dan komputer klinik).
- **G-005**: Menyajikan thumbnail visual foto luka langsung pada kartu riwayat pasien dan menyediakan Lightbox Modal HD Zoomable untuk inspeksi luka mendalam.
- **G-006**: Memastikan tampilan antarmuka 100% responsif di smartphone (360px–640px), tablet, dan desktop klinik tanpa pergeseran tata letak maupun *horizontal scroll*.

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
- **FR-001.3**: WHEN tanggal rencana kontrol berikutnya telah terlewat > 7 hari dan status belum diperbarui, THEN sistem HARUS menandai status pasien sebagai `Mangkir Kontrol` dengan warna merah mencolok dan mengekspos peringatan ke widget dashboard eksekutif.
- **FR-001.4**: Sistem HARUS menyediakan pencatatan hasil pemeriksaan dahak mikroskopis BTA pada Bulan ke-2, Bulan ke-5, dan Akhir Pengobatan (`Positif`, `Negatif`, `Belum Periksa`).
- **FR-001.5**: Dokter HARUS dapat menentukan status akhir pengobatan: `Dalam Pengobatan`, `Sembuh`, `Pengobatan Lengkap`, `Gagal`, `Mangkir (Drop-out)`, atau `Meninggal`.

### 4.2 Program 2: Layanan Sunat (Sirkumsisi) & Foto Kontrol

- **FR-002.1**: WHEN mencatat tindakan sunat, THEN sistem HARUS menyimpan nama pasien anak/dewasa, tanggal tindakan, nama dokter/operator pelaksana, metode sunat (`Laser / Kauter`, `Klamp / Smart Klamp`, `Konvensional`), biaya tindakan, dan evaluasi kondisi luka.
- **FR-002.2**: Sistem HARUS menyediakan 2 slot foto medis:
  - Slot 1: Foto paska tindakan langsung.
  - Slot 2: Foto evaluasi kontrol (misal: saat pelepasan klamp atau kontrol hari ke-7).
- **FR-002.3**: Pada setiap slot foto, sistem HARUS menyediakan 2 opsi tombol masukan:
  1. Tombol `Ambil Foto (Kamera)`: memicu input file dengan `capture="environment"` (kamera belakang smartphone/tablet). Pada perangkat laptop/desktop tanpa kamera belakang, input bertindak sebagai pemilih berkas sistem biasa.
  2. Tombol `Pilih dari Galeri / Berkas`: memicu input berkas gambar standar (`accept="image/*"`).
- **FR-002.4**: Sesaat setelah berkas gambar dipilih, sistem HARUS segera menjalankan kompresi di sisi klien via Canvas HTML5 ke format WebP dengan batas maksimal 300KB.
- **FR-002.5**: Sistem HARUS menampilkan lencana visual (*badge*) yang menginformasikan ukuran asli vs ukuran hasil kompresi (contoh: `3.2 MB -> 180 KB WebP`) beserta tombol hapus/ganti berkas sebelum data disimpan.
- **FR-002.6**: Pada daftar riwayat sirkumsisi (`CircumcisionList`), sistem HARUS menampilkan thumbnail foto luka secara langsung pada kartu pasien jika foto tersedia.
- **FR-002.7**: WHEN pengguna mengklik thumbnail foto pada kartu, THEN sistem HARUS membuka **Lightbox Modal HD Zoomable** yang menampilkan foto dalam resolusi tinggi, penanda kerahasiaan medis (*watermark* privasi), dan tombol perbesar/tutup.
- **FR-002.8**: Seluruh URL foto yang ditampilkan HARUS berupa *signed URL* privat sementara (masa berlaku 1 jam) dari bucket `medical-photos` guna menjamin keamanan rekam medis pasien.

### 4.3 Program 3: Monitoring Pasien Pos-Rawat

- **FR-003.1**: WHEN pasien pasca rawat inap atau tindakan medis didaftarkan ke pemantauan pos-rawat, THEN sistem HARUS mencatat tanggal kontrol berikutnya, diagnosa pasca rawat, dan kondisi terakhir pasien.
- **FR-003.2**: Sistem HARUS menyajikan daftar agenda pasien yang dibagi ke dalam tab/filter: Hari Ini, Terlambat (*Overdue*), dan Riwayat Selesai.
- **FR-003.3**: WHEN pasien datang kontrol, THEN dokter DAPAT memperbarui catatan keluhan lanjutan dan mengubah status menjadi `Sudah Kontrol` atau menetapkan jadwal kontrol lanjutan.

---

## 5. Non-Functional & Anti-Slop Requirements

- **NFR-001 (Privasi Rekam Medis)**: Foto luka sirkumsisi diklasifikasikan sebagai data SENSITIF (R-10 Security Architecture); wajib disimpan di bucket privat `medical-photos` dengan akses bertanda tangan (*signed URLs*).
- **NFR-002 (Efisiensi Bandwidth & Biaya Rp 0)**: Pemanfaatan hybrid storage adapter (`src/lib/storage.ts`) dengan batas 25GB Cloudinary gratis menjamin kapasitas penyimpanan hingga 80.000+ foto WebP tanpa biaya server tambahan.
- **NFR-003 (Responsivitas Mobile & Tablet)**: Tampilan formulir, kartu kendali TBC, kartu riwayat sirkumsisi, dan agenda pos-rawat wajib nyaman dioperasikan pada tablet dan smartphone vertikal (min-height tombol/input 44px, no horizontal scroll).
- **NFR-004 (Anti-Slop Copy & Visual)**: Larangan penggunaan karakter em dash (`—`) pada seluruh salinan UI, kontras teks memenuhi WCAG AA, dan ikonografi standar `@phosphor-icons/react` varian duotone.
