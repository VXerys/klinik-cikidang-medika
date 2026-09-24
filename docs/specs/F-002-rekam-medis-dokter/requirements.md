---
id: F-002-REQ
feature: F-002
title: "Requirements: Rekam Medis Ringkas Dokter & Tabbed Clinical Workspace"
status: approved
owner: "dr. Ovan / Developer"
last_updated: "2026-09-24"
last_verified_commit: unverified
related:
  - "design.md"
  - "tasks.md"
  - "docs/product/prd.md"
---

# Requirements: F-002 Rekam Medis Ringkas Dokter & Alur Pelayanan Klinik

## 1. Executive Summary

Modul **Rekam Medis Ringkas Dokter** (`/rekam-medis`) adalah ruang kerja klinis digital bagi dokter pemeriksa di Klinik Pratama Cikidang Medika. Modul ini menyajikan antrean pasien harian dari loket pendaftaran, menyediakan formulir input pemeriksaan klinis terpadu dengan arsitektur **Tabbed Clinical Workspace** (Anamnesa & TTV, Diagnosa ICD-10 & Tindakan, Resep Obat & Rincian Kasir, serta Riwayat Medis Lampau), dan menerapkan tombol transisi status eksplisit (*"Selesai Periksa & Kirim ke Kasir"*) untuk mengeliminasi redundansi kartu antrean antara ruang dokter dan loket kasir.

---

## 2. Actors & Permissions

- **ACTOR-001: Dokter Pemeriksa (`dokter`)**: Aktor klinis utama. Memanggil antrean, menginput anamnesa, tanda vital, diagnosa ICD-10, tindakan medis, dan terapi resep obat. Mengklik tombol *"Selesai Periksa & Kirim ke Kasir"* untuk menyerahkan pasien ke loket kasir dan apotek.
- **ACTOR-002: Kasir / Loket Pendaftaran (`kasir`)**: Mendaftarkan pasien ke antrean status `Menunggu Dokter`, memantau pasien yang selesai diperiksa pada tab `Menunggu Kasir`, dan menyelesaikan pelunasan/kuitansi (`Lunas`).
- **ACTOR-003: Pimpinan Klinik (`owner`)**: Memantau waktu tunggu pelayanan pasien dan rekapitulasi data rekam medis.

---

## 3. Problem Statement & Root Cause

### Masalah Saat Ini:
1. **Redundansi Status Antrean (Kartu Ganda di Tab Pendaftaran):**
   Pada versi sebelumnya, pasien yang baru didaftarkan langsung berstatus `Menunggu Pembayaran` meskipun belum diperiksa dokter. Akibatnya, filter `isWaitingDoctor` (`!kode_icd10`) dan `isWaitingPayment` (`status_pembayaran === 'Menunggu Pembayaran'`) sama-sama bernilai `true`. Pasien muncul ganda pada tab *"Menunggu Dokter"* dan tab *"Menunggu Pembayaran"*, serta tombol *"Bayar Kasir"* muncul terlalu dini sebelum dokter memeriksa pasien.
2. **Ketiadaan Tombol Handover / Claim Dokter:**
   Tidak ada penanda aksi eksplisit yang menandakan dokter telah selesai memeriksa pasien dan mengalihkan pasien ke kasir & apotek.
3. **UI Memanjang ke Bawah (Endless Scroll):**
   Formulir pemeriksaan saat ini menumpuk 7 seksi secara vertikal dalam satu card raksasa setinggi >1.500px, sehingga riwayat medis lampau pasien (*PatientHistoryTimeline*) tenggelam di bagian paling dasar dan dokter harus bolak-balik melakukan scrolling panjang.

---

## 4. Goals & Non-Goals

### Goals
- **G-001 (State Machine Linier & Eksklusif):** Kunjungan pasien memiliki 3 status yang saling lepas: `Menunggu Dokter` $\rightarrow$ `Menunggu Kasir` $\rightarrow$ `Lunas` (atau `Ditanggung BPJS`). Nol redundansi/kartu ganda pada tab filter antrean.
- **G-002 (Handover Button Dokter):** Dokter memiliki tombol aksi tegas *"Selesai Periksa & Kirim ke Kasir"* yang memvalidasi diagnosa, menyimpan rekam medis, dan otomatis memindahkan antrean pasien ke loket kasir & farmasi.
- **G-003 (Tabbed Clinical Workspace Ergonomis):** Form pemeriksaan dibagi menjadi 3 tab utama tanpa scroll panjang, pas dengan layar monitor desktop (1366x768 s/d 1920x1080) dan tablet.
- **G-004 (Akses Cepat Riwayat Pasien):** Riwayat kunjungan lampau pasien dapat diakses langsung melalui tab terintegrasi atau tombol laci riwayat tanpa perlu scroll ke dasar halaman.
- **G-005 (Diagnosa ICD-10 & Resep Cepat < 5 Detik):** Mempertahankan 8 chip ICD-10 terpopuler klinik dan chip template resep obat populer.

### Non-Goals
- **NG-001**: Pengurangan stok apotek per butir obat (obat dicatat sebagai teks terapi per PRD MVP).
- **NG-002**: Integrasi bridging API BPJS P-Care (seluruh pencatatan bersifat internal klinik).
- **NG-003**: Voice calling speaker otomatis atau display antrean TV ruang tunggu.

---

## 5. Functional Requirements (EARS & RFC 2119)

### FR-001: Linear Visit Lifecycle State Machine
Sistem HARUS memberlakukan mesin status kunjungan yang linier dan saling lepas:
1. `Menunggu Dokter`: Ditetapkan saat pendaftaran awal di loket.
2. `Menunggu Kasir`: Ditetapkan saat dokter menyelesaikan pemeriksaan.
3. `Lunas`: Ditetapkan saat kasir menerima pembayaran (atau `Ditanggung BPJS` untuk klaim kapitasi).

- **AC-001.1**: WHEN pasien didaftarkan di loket, THEN sistem HARUS menyetel `status_pembayaran = 'Menunggu Dokter'`.
- **AC-001.2**: WHILE kunjungan berstatus `'Menunggu Dokter'`, THEN di halaman `/pendaftaran` pasien HANYA muncul pada tab *"Menunggu Dokter"* dan sistem DILARANG menampilkan tombol *"Bayar Kasir"*.
- **AC-001.3**: WHEN dokter menekan tombol *"Selesai Periksa & Kirim ke Kasir"*, THEN sistem HARUS mengupdate `status_pembayaran = 'Menunggu Kasir'`.
- **AC-001.4**: WHILE kunjungan berstatus `'Menunggu Kasir'`, THEN di halaman `/pendaftaran` pasien HANYA muncul pada tab *"Menunggu Pembayaran"* dan sistem HARUS menampilkan tombol *"Bayar Kasir"*.
- **AC-001.5**: WHEN kasir menyelesaikan pelunasan, THEN sistem HARUS mengupdate `status_pembayaran = 'Lunas'` (atau `'Ditanggung BPJS'`) dan pasien HANYA muncul pada tab *"Selesai / Lunas"*.

### FR-002: Tabbed Clinical Workspace
Sistem HARUS menyajikan formulir pemeriksaan dokter dalam struktur Tab terbagi tanpa scroll vertikal tanpa akhir.

- **AC-002.1**: Antarmuka ruang periksa HARUS memiliki 3 tab navigasi utama:
  - **Tab 1: Anamnesa & TTV (Subjektif & Objektif)**: Keluhan awal loket, anamnesa lanjutan, tanda vital (Sistol, Diastol, Nadi, Suhu, BB, TB), dan peringatan alergi obat.
  - **Tab 2: Diagnosa & Tindakan (Assesmen)**: 8 Quick-pick chip ICD-10, pencarian autocomplete ICD-10, diagnosa deskripsi, tindakan medis, dan lab sederhana (GDS, Asam Urat, Kolesterol).
  - **Tab 3: Resep Obat & Kasir (Plan & Billing)**: Template resep obat cepat, aturan pakai obat, biaya periksa pokok, dan biaya tindakan tambahan untuk kasir.
- **AC-002.2**: Sistem DAPAT menyediakan **Tab 4: Riwayat Medis Lampau** (*Patient History*) atau tombol laci riwayat yang menampilkan rekam medis kunjungan sebelumnya dengan badge tanggal, diagnosa, dan terapi lampau.
- **AC-002.3**: Setiap tab HARUS memiliki penanda visual indikator status (misal: badge centang hijau kecil saat diagnosa ICD-10 pada Tab 2 telah terisi).

### FR-003: Sticky Bottom Action Bar & Claim Button
Sistem HARUS menyediakan bilah tombol aksi yang selalu menempel di bagian bawah layar (*docked / sticky footer*).

- **AC-003.1**: Bilah aksi HARUS menyediakan:
  - Tombol navigasi *"Sebelumnya"* dan *"Lanjut"* antar-tab.
  - Tombol *"Simpan Draft"* (menyimpan catatan tanpa memindahkan antrean pasien ke kasir).
  - Tombol primer utama: **"Selesai Periksa & Kirim ke Kasir"** (berwarna emerald/hijau, dengan ikon kirim/centang).
- **AC-003.2**: IF dokter menekan *"Selesai Periksa & Kirim ke Kasir"* saat `kode_icd10` atau `diagnosa_deskripsi` masih kosong, THEN sistem HARUS menolak penyimpanan, menampilkan pesan validasi *"Diagnosa ICD-10 wajib diisi sebelum mengirim pasien ke kasir"*, dan otomatis mengarahkan fokus ke Tab 2 (Diagnosa).
- **AC-003.3**: WHEN pemeriksaan berhasil diselesaikan, THEN kartu antrean pasien di kolom kiri HARUS berubah menjadi *"Selesai Diperiksa"* (centang hijau) dan sistem otomatis menawarkan atau memanggil pasien antrean berikutnya.

### FR-004: Akses Cepat Riwayat Medis Lampau
Sistem HARUS mempermudah dokter melihat riwayat penyakit pasien tanpa navigasi halaman terpisah.

- **AC-004.1**: Sistem HARUS memuat seluruh kunjungan lampau pasien (`pasien_id = activeVisit.pasien_id` AND `id != activeVisit.id`) diurutkan dari yang terbaru.
- **AC-004.2**: Pada setiap kunjungan lampau, sistem menampilkan: Tanggal Kunjungan, Dokter Pemeriksa, Kode & Deskripsi ICD-10, serta Terapi Obat yang pernah diberikan.

---

## 6. Non-Functional Requirements

- **Ergonomi Dokter & Anti-Fatigue**: Form tidak boleh melampaui batas layar normal laptop (tinggi konten per tab $\le 600\text{px}$), menghilangkan kelelahan scrolling vertikal.
- **Kecepatan Transisi Antar-Tab**: Perpindahan tab instan dalam waktu $< 16\text{ms}$ (60 FPS) menggunakan React state murni tanpa re-fetching jaringan.
- **Mobile & Tablet Adaptif**: Pada layar smartphone/tablet, tab navigation dapat di-swipe atau dibungkus secara rapi dengan touch target minimal 44x44px.
- **Anti-Slop Compliance**: Bebas em dashes (`—`), kontras warna WCAG AA, dan penamaan tombol dalam bahasa Indonesia profesional.
