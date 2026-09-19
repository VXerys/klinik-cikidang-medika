---
status: approved
owner: "Pengembang Sistem & Pimpinan Klinik Cikidang Medika"
created: "2026-09-18"
last_updated: "2026-09-18"
last_verified_commit: initial-scaffold
source_of_truth_for:
  - product-intent
  - product-scope
  - functional-spec
---

# Product Requirements Document (PRD)
## Sistem Informasi Manajemen (SIM) Klinik Pratama Cikidang Medika

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Klinik Pratama Cikidang Medika saat ini mengelola seluruh data operasional pasien dan keuangannya melalui spreadsheet Google Sheets manual. Volume data telah melonjak drastis dari 595 kunjungan di 2023 menjadi **7.493 catatan kunjungan dan 4.238 pasien unik** per September 2026. 

Kondisi spreadsheet ini menimbulkan 3 risiko operasional kritis:
1. **Redundansi dan Double Input:** Staf loket harus mengetik ulang nama dan identitas pasien setiap kali kontrol. Akibatnya, terjadi inkonsistensi data parah (57,6% data NIK KTP kosong dan 64,7% nomor BPJS kosong).
2. **Kerapuhan Integritas Data:** Tidak ada proteksi sel atau validasi form. Kesalahan ketik kasir dapat menimpa formula pivot omzet, merusak kalkulasi kas, dan tidak memiliki rekam jejak (*audit trail*).
3. **Ketidakmampuan Akses Mobile Pemilik:** Dokter/pemilik klinik (dr. Ovan & dr. Neneng) kesulitan memantau arus kas dan tren pasien saat berada di luar klinik karena file spreadsheet 7.500 baris sangat lambat dan patah-patah jika dibuka via smartphone.

### 1.2 Goal & Value Proposition
Membangun aplikasi **Sistem Informasi Manajemen Klinik Berbasis Web** yang ringan, aman, dan responsif dengan biaya pemeliharaan **Rp 0 / Bulan (Cloud Database & Hosting Gratis)**, menyelamatkan 100% data historis (7.493 kunjungan), dan menyelesaikan pencatatan kasir loket dalam waktu kurang dari 30 detik per pasien.

---

## 2. User Personas & User Stories

### Persona 1: Kasir & Staf Loket Pendaftaran (Rina)
- *Tugas Utama:* Mendaftarkan pasien datang, memverifikasi status BPJS vs Umum, dan mencetak nota kasir.
- **US-01:** *Sebagai staf loket, saya ingin mencari nama atau No RM pasien lama secara instan, sehingga saya tidak perlu mengetik ulang data identitas pasien yang sudah pernah berobat.*
  - **Kriteria Penerimaan (Acceptance Criteria):**
    - **Given:** Staf berada di form pendaftaran dan mengetik minimal 2 huruf nama atau digit No RM.
    - **When:** Sistem mencari ke database pasien (4.238 data).
    - **Then:** Daftar sugesti muncul dalam tempo < 100ms dengan rincian Nama, No RM, Tgl Lahir, dan Desa; saat diklik, seluruh formulir terisi otomatis.
- **US-02:** *Sebagai staf loket, saya ingin status pasien BPJS otomatis mencatat tarif periksa Rp 0, sehingga kasir tidak keliru menagihkan biaya ke pasien BPJS yang ditanggung kapitasi bulanan.*
  - **Kriteria Penerimaan:**
    - **Given:** Pasien memilih tipe kunjungan "BPJS Kesehatan".
    - **When:** Sistem menghitung total billing.
    - **Then:** Biaya periksa otomatis diset Rp 0, nomor kartu BPJS divalidasi, dan transaksi dicatat ke buku rekap klaim kapitasi.

### Persona 2: Dokter Pemeriksa (dr. Ovan & dr. Neneng)
- *Tugas Utama:* Memeriksa pasien, mencatat diagnosa ICD-10 ringkas, dan meresepkan terapi obat.
- **US-03:** *Sebagai dokter pemeriksa, saya ingin melihat antrean pasien hari ini dan memilih diagnosa penyakit standar ICD-10 dengan sekali klik, agar proses input tidak menghambat waktu konsultasi pasien.*
  - **Kriteria Penerimaan:**
    - **Given:** Dokter membuka modul Rekam Medis di meja praktik.
    - **When:** Dokter memanggil pasien berikutnya.
    - **Then:** Rekam medis pasien terbuka, dokter dapat memilih chip diagnosa favorit (J00 ISPA, K30 Dispepsia, I10 Hipertensi, Z34 Hamil) atau mengetik kode ICD-10, mengisi resep obat, lalu menekan "Selesai Periksa".

### Persona 3: Pimpinan & Pemilik Klinik (dr. Ovan / dr. Neneng)
- *Tugas Utama:* Memantau omzet harian, pencairan kapitasi BPJS bulanan, pengeluaran klinik, dan tren kesehatan masyarakat.
- **US-04:** *Sebagai pemilik klinik, saya ingin memantau dashboard omzet dan buku kas klinik secara realtime dari ponsel di luar klinik, agar saya tahu berapa uang kas fisik di klinik dan berapa yang sudah disetor ke rekening bank.*
  - **Kriteria Penerimaan:**
    - **Given:** Pemilik login via smartphone dari luar klinik.
    - **When:** Halaman Dashboard terbuka.
    - **Then:** Tampilan otomatis adaptif (mobile layout), menyajikan 4 kartu metrik (Total Kunjungan, Kasir Tunai/Transfer, Dana Kapitasi, Pengeluaran), serta tombol unduh rekap Excel (.xlsx).

---

## 3. Functional Requirements & Scope

### 3.1 In-Scope (Fitur Inti Rilis MVP)

| ID | Modul | Deskripsi Fungsional |
|---|---|---|
| **F-01** | **Pendaftaran & Pasien** | Autocomplete pencarian 4.238 pasien; input pasien baru (No RM unik, Nama, Gelar, Tgl Lahir, Alamat Desa, NIK KTP, No BPJS); antrean pendaftaran harian. |
| **F-02** | **Billing & Kasir** | Pemisahan alur BPJS (Rp 0) vs Umum (biaya periksa/tindakan); metode pembayaran Tunai dan Transfer Bank; cetak nota kuitansi kasir standar (thermal/A5). |
| **F-03** | **Rekam Medis Ringkas** | Antrean ruang periksa dokter; anamnesa keluhan; tanda vital (TD, BB, Suhu); pemilihan diagnosa ICD-10; catatan terapi/resep obat; riwayat kunjungan terdahulu. |
| **F-04** | **Buku Kas Operasional** | Pencatatan Kas Masuk (Kapitasi BPJS ~Rp 28 Jt/bln, Rujukan USG/Lab); Kas Keluar (Beli Obat/Alkes, Listrik, Operasional); Rekap Setor Tunai kasir ke bank. |
| **F-05** | **Dashboard & Laporan** | Metrik omzet, total kunjungan harian/bulanan; grafik 10 besar penyakit ICD-10; grafik distribusi desa pasien; ekspor 1-klik ke Microsoft Excel (.xlsx). |
| **F-06** | **Migrasi Data Historis** | Script migrasi ETL otomatis untuk menyalin 7.493 data kunjungan dan 4.238 pasien dari 4 file CSV lama (`DATAUTAMA`, `QUERY`, `ANALISA`, `DASHBOARD`) ke Supabase. |
| **F-07** | **Register Program Khusus** | 1) Kartu kendali kohort TBC 6 bulan & deteksi pasien mangkir; 2) Tindakan sirkumsisi/sunat & upload foto luka pasca sunat (maks. 2 foto kompresi <300KB/pasien); 3) Monitoring jadwal kontrol pasien pos-rawat. |

### 3.2 Out-of-Scope (Dikecualikan pada Fase Ini)
- ❌ **Stok Penjualan Retail Skincare (Emerys Glow):** Resmi ditunda/dikeluarkan dari rilis sistem sesuai konfirmasi dr. Ovan.
- ❌ **Bridging API P-Care BPJS Kesehatan:** Sesuai permintaan klien, sistem klinik hanya mencatat data internal dan keuangan, tidak perlu integrasi API langsung ke server BPJS.
- ❌ **Manajemen Stok Obat Apotek Per Butir (Inventory Lot & Batch):** Klinik telah menggunakan sistem RME terpisah untuk manajemen stok obat harian.
- ❌ **Display Antrean TV / Mesin Tiket Suara:** Cukup antrean digital di layar kasir dan dokter.
- ❌ **Rawat Inap:** Klinik berstatus rawat jalan murni.

---

## 4. Technical & Architectural Decisions

- **Client / Web Application:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React Icons.
- **Database & Storage:** Supabase Cloud PostgreSQL & Supabase Storage Private Bucket (dengan kompresi foto sisi klien ke format WebP < 300KB untuk foto sirkumsisi).
- **Authentication & Authorization:** Supabase Auth dengan Role-Based Access Control (RBAC):
  - `kasir`: Akses modul Pendaftaran, Billing Kasir, dan Rekap Setor Tunai.
  - `dokter`: Akses modul Rekam Medis, Antrean Konsultasi, dan Register Program Khusus (TBC, Sunat, Pos-Rawat).
  - `owner` (dr. Ovan): Akses penuh ke seluruh modul, Dashboard Keuangan, Buku Kas, dan Ekspor Excel.
- **Reporting Engine:** Library `xlsx` (SheetJS) untuk ekspor rekapitulasi data langsung di browser tanpa membebani server.
- **Hosting & Domain Target:** Vercel (Free Tier) dengan Custom Domain resmi klinik yang dibeli pihak klinik (misal: `klinikcikidangmedika.com`).

---

## 5. Non-Functional Requirements & UX Standards

1. **Responsiveness:** Desain adaptif penuh — nyaman dibuka di monitor desktop kasir (1080p/1440p) dan layar smartphone vertikal (iPhone/Android) dokter di luar klinik.
2. **Performa UI:** Waktu respon pencarian pasien < 100ms; waktu muat halaman awal < 1.5 detik (Lighthouse score > 90).
3. **Anti-Slop UI & Ergonomi:** 
   - Font sans-serif modern (`Geist` / `Satoshi` / `Outfit`).
   - Warna aksen medis tenang: *Clinical Teal* (`#0F766E`) dan dasar Slate netral.
   - Tanpa emoji, tanpa efek neon/glow ungu murahan.
   - Angka monospaced (`Geist Mono`) untuk No RM, nominal rupiah, dan NIK KTP.
4. **Data Durability:** Seluruh data tersimpan terenkripsi di cloud PostgreSQL dengan backup otomatis harian.
