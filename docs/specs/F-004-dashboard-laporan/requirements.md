---
id: F-004-REQ
feature: F-004
title: "Requirements: Dashboard Eksekutif & Ekspor Excel"
status: draft
owner: "Developer / dr. Ovan"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "design.md"
  - "tasks.md"
  - "docs/product/prd.md"
---

# Requirements: F-004 Dashboard Eksekutif & Ekspor Excel

## 1. Executive Summary

Modul **Dashboard Eksekutif & Ekspor Excel** (`/` dan `/laporan`) adalah pusat analitik operasional, metrik keuangan *real-time*, dan sistem pelaporan berkala bagi pemilik klinik (dr. Ovan & dr. Neneng) serta tim manajemen Klinik Pratama Cikidang Medika. Modul ini menggantikan spreadsheet Google Sheets lama yang lambat dan berat dengan dashboard analitik berbasis web yang dapat dibuka secara instan di smartphone, tablet, maupun komputer desktop. Selain visualisasi metrik utama (total kunjungan, omzet umum, kapitasi BPJS, dan 10 besar penyakit ICD-10), modul ini menyediakan mesin ekspor spreadsheet 1-klik (`.xlsx` via SheetJS) tanpa membebani server backend.

---

## 2. Actors & Permissions

- **ACTOR-001: Pimpinan & Pemilik Klinik (`owner`)**: Memiliki akses penuh melihat seluruh ringkasan omzet kasir, penerimaan kapitasi BPJS, total pengeluaran operasional, saldo kas bersih, dan mengunduh seluruh jenis laporan Excel (kunjungan, keuangan, dan morbiditas penyakit) dari perangkat smartphone maupun komputer.
- **ACTOR-002: Dokter Pemeriksa (`dokter`)**: Mengakses dashboard tren penyakit 10 besar ICD-10 untuk analisis epidemiologi lokal dan mengekspor laporan morbiditas bulanan untuk pelaporan ke Puskesmas Cikidang / Dinas Kesehatan Sukabumi.
- **ACTOR-003: Kasir Loket (`kasir`)**: Melihat ringkasan kunjungan harian/bulanan dan mengekspor rekapitulasi data kunjungan serta pembayaran kasir loket untuk arsip administrasi.

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Menyajikan 5 kartu KPI eksekutif *real-time* (Total Kunjungan, Total Pasien Unik, Pendapatan Pasien Umum, Kapitasi BPJS, dan Total Pengeluaran) yang bersumber langsung dari Supabase (`public.visits`, `public.patients`, `public.cash_flows`).
- **G-002**: Menampilkan visualisasi analitik interaktif:
  1. *10 Besar Penyakit Terbanyak (ICD-10)* dengan jumlah kasus dan persentase distribusi.
  2. *Distribusi Asal Pasien per Desa/Wilayah* (Cikidang, Pangkalan, Cicareuh, Bumi Sari, Luar Daerah).
  3. *Rasio Pasien BPJS vs Umum*.
- **G-003**: Menyediakan filter periode waktu fleksibel pada dashboard (Bulan Ini, Bulan Lalu, Tahun Ini, dan Semua Data Historis 2024–2026).
- **G-004**: Membangun pusat pelaporan terpadu di `/laporan` dengan filter rentang tanggal (Start Date - End Date), filter jenis pasien, dan filter dokter pemeriksa.
- **G-005**: Menghasilkan file Microsoft Excel (`.xlsx`) berformat rapi, profesional, dengan *auto-fit column width*, header resmi klinik, dan angka numerik valid (bisa langsung dijumlahkan/SUM di Excel) dalam waktu < 1 detik di browser klien menggunakan SheetJS (`xlsx`).
- **G-006**: Menjamin 100% responsivitas tampilan di layar smartphone vertikal (360px–640px), tablet (768px–1024px), dan desktop (1024px+) dengan target sentuh minimal 44×44px dan nol *horizontal scroll* pada kontainer halaman.

### Non-Goals
- **NG-001**: Ekspor format PDF kustom via server headless Chromium/Puppeteer (format Excel `.xlsx` adalah format tunggal yang disepakati klien untuk rekapitulasi data).
- **NG-002**: Integrasi grafik eksternal yang membebani bundle (Recharts/Chart.js ukuran besar). Visualisasi menggunakan representasi berbasis Tailwind CSS bar-chart yang cepat, ringan, dan ramah koneksi internet minim klinik.
- **NG-003**: Pemrosesan laporan penjualan skincare Emerys Glow (resmi dikecualikan dari cakupan sistem).

---

## 4. Functional Requirements (EARS & RFC 2119)

### FR-001: Live Executive KPI Cards (`/`)
Sistem HARUS menghitung dan menampilkan ringkasan metrik eksekutif klinik secara *real-time* berdasarkan periode waktu yang dipilih.

- **AC-001.1**: WHEN pengguna membuka halaman Dashboard (`/`), THEN sistem HARUS menampilkan 5 kartu metrik:
  1. **Total Kunjungan**: Akumulasi kunjungan pada periode aktif, disertai informasi total pasien unik terdaftar.
  2. **Pendapatan Pasien Umum**: Total `biaya_periksa + pendapatan_lain` dari transaksi pasien `jenis_pasien = 'UMUM'`.
  3. **Penerimaan Kapitasi BPJS**: Total nominal transaksi masuk kategori `"Kapitasi BPJS"` dari tabel `cash_flows`.
  4. **Total Pengeluaran**: Total nominal kas keluar dari tabel `cash_flows` (`jenis = 'Keluar'`).
  5. **Saldo Kas Bersih Operasional**: Selisih total pemasukan (Umum + Kapitasi + Pendapatan Lain) dikurangi total pengeluaran operasional.
- **AC-001.2**: WHEN data sedang dimuat dari Supabase, THEN sistem HARUS menampilkan indikator skeleton loading yang tidak menggeser tata letak (*zero layout shift*).
- **AC-001.3**: IF terjadi kegagalan jaringan saat mengambil data metrik, THEN sistem HARUS menampilkan pesan galat yang informatif dalam Bahasa Indonesia disertai tombol *"Coba Lagi"*.

### FR-002: Dynamic Period Filter on Dashboard
Sistem HARUS memungkinkan pengguna menyaring data dashboard berdasarkan periode waktu yang ditentukan.

- **AC-002.1**: WHEN pengguna memilih opsi periode (misal: *"Bulan Ini"*, *"Bulan Lalu"*, *"Tahun Ini"*, atau *"Semua Data Historis"*), THEN sistem HARUS segera menghitung ulang seluruh kartu KPI dan grafik distribusi sesuai rentang tanggal yang dipilih.
- **AC-002.2**: Nilai *default* saat halaman pertama kali dibuka HARUS menyajikan data bulan berjalan (*Current Month*), dengan opsi beralih cepat ke *Semua Data* untuk meninjau 7.493 rekor historis.

### FR-003: 10 Besar Penyakit (Top 10 ICD-10 Morbidity Breakdown)
Sistem HARUS mengagregasi data diagnosa medis pasien untuk menyajikan peringkat 10 penyakit terbanyak.

- **AC-003.1**: WHEN data kunjungan dimuat, THEN sistem HARUS mengelompokkan data berdasarkan `kode_icd10` dan menghitung jumlah kasus masing-masing kode.
- **AC-003.2**: Sistem HARUS menampilkan maksimal 10 penyakit dengan frekuensi tertinggi, diurutkan dari kasus terbanyak ke terendah.
- **AC-003.3**: Setiap baris pada daftar 10 besar HARUS menampilkan kode ICD-10, nama diagnosa (Indonesia/medis), total kasus, persentase terhadap total diagnosa, dan indikator visual berupa *progress bar* proporsional.

### FR-004: Demografi Distribusi Pasien per Desa & Wilayah
Sistem HARUS menyajikan distribusi asal tempat tinggal pasien yang berobat ke klinik.

- **AC-004.1**: Sistem HARUS mengagregasi asal desa pasien (`public.patients.desa`) untuk kunjungan pada periode terpilih.
- **AC-004.2**: Sistem HARUS menampilkan persentase dan jumlah pasien dari desa-desa utama (Cikidang, Pangkalan, Cicareuh, Bumi Sari, Nangka Koneng, Sampora, Cijambe, Luar Daerah).

### FR-005: Pusat Laporan & Filter Rekapitulasi (`/laporan`)
Sistem HARUS menyediakan antarmuka khusus untuk meninjau dan memfilter data laporan sebelum diunduh.

- **AC-005.1**: WHEN pengguna membuka `/laporan`, THEN sistem HARUS menyediakan kontrol filter:
  1. `Tanggal Mulai` (*Start Date*) dan `Tanggal Selesai` (*End Date*).
  2. `Jenis Pasien`: Pilihan dropdown (Semua Pasien, Pasien Umum, Pasien BPJS).
  3. `Dokter Pemeriksa`: Pilihan dropdown (Semua Dokter, dr. Ovan, dr. Neneng, Bidan/Paramedis).
  4. `Tipe Laporan`: Tab pemisah antara *Laporan Kunjungan Pasien*, *Laporan Arus Kas Operasional*, dan *Laporan Morbiditas ICD-10*.
- **AC-005.2**: WHEN tombol *"Terapkan Filter"* ditekan, THEN sistem HARUS memuat data yang cocok ke dalam tabel pratinjau interaktif.
- **AC-005.3**: Tabel pratinjau HARUS menampilkan ringkasan agregat di bagian bawah (Total Baris, Total Pasien Umum, Total Pasien BPJS, Total Penerimaan Biaya Kasir).

### FR-006: Mesin Ekspor Microsoft Excel (.xlsx) Client-Side
Sistem HARUS mengonversi data yang difilter menjadi berkas spreadsheet `.xlsx` siap pakai.

- **AC-006.1**: WHEN pengguna menekan tombol *"Unduh File Excel (.xlsx)"*, THEN sistem HARUS membuat berkas Excel menggunakan library SheetJS (`xlsx`) langsung di memori browser tanpa melakukan request upload/generate ke server.
- **AC-006.2**: Berkas Excel yang dihasilkan HARUS memiliki struktur tata letak profesional:
  1. Baris 1: Judul Laporan (misal: `KLINIK PRATAMA CIKIDANG MEDIKA - LAPORAN REKAPITULASI KUNJUNGAN`).
  2. Baris 2: Periode Laporan (misal: `Periode: 01-09-2026 s/d 30-09-2026`).
  3. Baris 3: Tanggal Cetak / Unduh.
  4. Baris 5+: Baris header kolom tebal (*bold headers*).
  5. Seluruh kolom numerik (nominal biaya, jumlah kasus) HARUS disimpan sebagai tipe numerik murni sehingga formula `SUM` dapat berfungsi tanpa konversi manual.
  6. Lebar setiap kolom (*column width*) HARUS dihitung otomatis (*auto-fit*) agar teks tidak terpotong saat dibuka di Microsoft Excel.
- **AC-006.3**: WHEN diekspor dalam mode *Rekapitulasi Lengkap*, sistem HARUS dapat menyatukan 3 lembar kerja (*sheets*) dalam satu workbook:
  - Sheet 1: `Rekap Kunjungan`
  - Sheet 2: `Top 10 Morbiditas ICD-10`
  - Sheet 3: `Arus Kas Operasional`
- **AC-006.4**: Nama berkas unduhan HARUS mengikuti konvensi standar: `Laporan_Klinik_Cikidang_[Jenis]_[YYYYMMDD].xlsx`.

### FR-007: Strict Mobile & Tablet Responsiveness
Sistem HARUS memastikan tampilan halaman Dashboard (`/`) dan Laporan (`/laporan`) beroperasi sempurna pada seluruh ukuran layar.

- **AC-007.1**: Pada viewport smartphone (360px–640px), kartu KPI HARUS ditata dalam format 1 kolom vertikal atau 2 kolom ringkas, dan grafik batang ditata secara bertumpuk (*stacked*).
- **AC-007.2**: Seluruh tabel data pratinjau HARUS dibungkus dalam kontainer `overflow-x-auto w-full` agar tidak merusak tata letak layar (*zero horizontal page scroll*).
- **AC-007.3**: Seluruh tombol interaktif, input tanggal, dan pemilih dropdown HARUS memiliki tinggi minimum 44px dengan jarak antar-elemen minimal 8px (`gap-2`).

---

## 5. Non-Functional Requirements (NFR)

- **NFR-PERF-001 (Kalkulasi Klien Ringan)**: Waktu pemrosesan agregasi 1.000+ data kunjungan di memori browser tidak boleh melebihi 250ms.
- **NFR-PERF-002 (Kecepatan Ekspor Excel)**: Pembuatan dan trigger download file `.xlsx` berisi hingga 5.000 baris data harus selesai dalam tempo < 1.5 detik.
- **NFR-UX-001 (Anti-Slop Visual Standards)**: Tidak menggunakan chart library berat yang tidak terpakai, tidak menggunakan warna gradien neon murahan, font seragam menggunakan **Plus Jakarta Sans**, dan format angka menggunakan tabular font monospaced.
- **NFR-SEC-001 (Proteksi Data Sensitif)**: Ekspor Excel hanya memuat data operasional klinik; nomor NIK KTP dan nomor telepon pasien disamarkan atau diisi sesuai hak akses yang diizinkan.
