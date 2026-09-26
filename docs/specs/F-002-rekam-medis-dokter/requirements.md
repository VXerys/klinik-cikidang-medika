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
Sistem HARUS menyajikan formulir pemeriksaan dokter dalam struktur Tab terbagi tanpa scroll vertikal tanpa akhir dan DILARANG menampilkan duplikasi field input/label.

- **AC-002.1**: Antarmuka ruang periksa HARUS memiliki 4 tab navigasi:
  - **Tab 1: Anamnesa & TTV (Subjektif & Objektif)**: Keluhan awal loket, anamnesa lanjutan, tanda vital (Sistol, Diastol, Nadi, Suhu, BB, TB), kalkulasi BMI otomatis, dan peringatan riwayat alergi obat.
  - **Tab 2: Diagnosa & Tindakan (Assesmen)**: Multi-diagnosa ICD-10 (chip cepat, search autocomplete, manual), tindakan medis, dan deteksi otomatis program khusus (TBC & Sunat). Input kode dan deskripsi ICD-10 TIDAK BOLEH diduplikasi di bawah komponen quick picker.
  - **Tab 3: Resep Obat & Kasir (Plan & Billing)**: Pencarian obat pintar (50+ obat katalog), preset obat populer, pintasan aturan pakai (signa) sekali-klik, rincian biaya tindakan kasir.
  - **Tab 4: Riwayat Pasien (History)**: Menampilkan linimasa rekam medis kunjungan lampau pasien secara terintegrasi.
- **AC-002.2**: Setiap tab HARUS memiliki penanda visual indikator status (centang hijau kecil saat data wajib terpenuhi).

### FR-003: Step-Scoped Bottom Action Bar (Pencegahan Salah Pencet Dokter)
Sistem HARUS menyediakan bilah navigasi bawah (*sticky bottom bar*) dengan visibilitas tombol aksi yang terkontrol sesuai tahapan pemeriksaan klinis:

- **AC-003.1**: Pada **Tab 1 (Anamnesa & TTV)** dan **Tab 2 (Diagnosa & Tindakan)**:
  - Bilah navigasi HANYA menampilkan tombol *"Sebelumnya"* (jika bukan tab pertama), tombol navigasi *"Lanjut >"*, dan *"Simpan Draft"*.
  - Sistem DILARANG menampilkan tombol *"Selesai Periksa & Kirim ke Kasir"* pada Tab 1 dan Tab 2 untuk mencegah dokter tidak sengaja menyelesaikan periksa sebelum tahapan resep.
- **AC-003.2**: Pada **Tab 3 (Resep Obat & Kasir)**:
  - Bilah navigasi menampilkan tombol *"Sebelumnya"*, *"Simpan Draft"*, dan tombol aksi primer utama: **"Selesai Periksa & Kirim ke Kasir"** (berwarna emerald/hijau dengan ikon kirim).
- **AC-003.3**: IF dokter menekan *"Selesai Periksa & Kirim ke Kasir"* saat daftar diagnosa ICD-10 masih kosong, THEN sistem HARUS menolak aksi, menampilkan pesan validasi *"Minimal satu diagnosa ICD-10 wajib diisi sebelum mengirim pasien ke kasir"*, dan otomatis mengalihkan tab ke Tab 2 (Diagnosa).

### FR-004: Akses Cepat Riwayat Medis Lampau
Sistem HARUS mempermudah dokter melihat riwayat penyakit pasien tanpa navigasi halaman terpisah.

- **AC-004.1**: Sistem HARUS memuat seluruh kunjungan lampau pasien (`pasien_id = activeVisit.pasien_id` AND `id != activeVisit.id`) diurutkan dari yang terbaru.
- **AC-004.2**: Pada setiap kunjungan lampau, sistem menampilkan: Tanggal Kunjungan, Dokter Pemeriksa, Kode & Deskripsi ICD-10, serta Terapi Obat yang pernah diberikan.

### FR-005: Multi-Diagnosa ICD-10 (Primer & Sekunder)
Sistem HARUS mendukung pemilihan lebih dari satu diagnosa ICD-10 untuk pasien dengan komorbiditas/keluhan majemuk:

- **AC-005.1**: Dokter DAPAT menambahkan beberapa diagnosa ICD-10 sekaligus melalui chip diagnosa populer atau pencarian kode/nama ICD-10.
- **AC-005.2**: Diagnosa pertama yang dipilih otomatis berstatus sebagai **Diagnosa Primer (Utama)**. Diagnosa tambahan berikutnya berstatus sebagai **Diagnosa Sekunder (Komorbid)**.
- **AC-005.3**: Setiap item diagnosa pada daftar memiliki tombol hapus `(x)` dan penanda badge visual yang jelas (`[Utama]` dan `[Sekunder]`).
- **AC-005.4**: Data multi-diagnosa disimpan ke database PostgreSQL:
  - `kode_icd10`: string kode dipisahkan koma (contoh: `"J00, K30, R50"`).
  - `diagnosa_deskripsi`: string deskripsi dipisahkan titik koma (contoh: `"ISPA / Nasopharyngitis Akut; Dispepsia / Sakit Lambung; Demam / Observasi Febris"`).
- **AC-005.5**: Modul kasir (`PaymentModal`) dan cetak kuitansi (`ReceiptModal`) HARUS menampilkan seluruh daftar diagnosa yang dicatat dokter.

### FR-006: Pencarian Obat Pintar & Pintasan Aturan Pakai (Signa Cepat)
Sistem HARUS memfasilitasi penulisan resep obat cepat tanpa mewajibkan pengetikan keyboard secara intensif:

- **AC-006.1**: Sistem menyediakan kotak pencarian autocomplete obat instan yang mencakup minimal 50 jenis obat umum klinik (analgesik, antibiotik, lambung, pernapasan, antihipertensi, vitamin, cairan oralit).
- **AC-006.2**: Memilih obat dari hasil pencarian otomatis menyisipkan item resep baru ke kolom terapi obat lengkap dengan dosis dan aturan pakai standar.
- **AC-006.3**: Sistem menyediakan baris chip aturan pakai (signa) sekali-klik:
  - `3x1 tab sesudah makan (pc)`
  - `2x1 tab sesudah makan (pc)`
  - `1x1 tab malam hari`
  - `3x1 tab sebelum makan (ac)`
  - `Bila demam / nyeri (prn)`
  - `Habiskan (antibiotik)`
  Mengklik chip signa langsung menyisipkan atau melengkapi aturan pakai pada resep.
- **AC-006.4**: Kolom terapi obat tetap berupa textarea yang dapat diedit secara bebas oleh dokter untuk kasus dosis khusus.

### FR-007: Otomasi Status Antrean & Penutupan Workstation
Sistem HARUS mengelola siklus hidup form ruang periksa dokter secara bersih saat pasien diserahkan ke kasir:

- **AC-007.1**: WHEN dokter menekan tombol *"Selesai Periksa & Kirim ke Kasir"*, status kunjungan diupdate menjadi `'Menunggu Kasir'`, kartu antrean di kolom kiri diperbarui, dan sistem mencari pasien berikutnya dalam antrean yang masih berstatus `'Menunggu Dokter'`.
- **AC-007.2**: IF masih ada pasien berikutnya yang menunggu dokter, THEN sistem otomatis memuat data pasien berikutnya ke workstation.
- **AC-007.3**: IF seluruh pasien dalam antrean dokter hari tersebut telah selesai diperiksa (antrean kosong), THEN sistem HARUS menutup formulir pemeriksaan aktif (`selectedVisit = null`) dan menampilkan tampilan layar siaga (*Standby Empty State*):
  *"Semua Pasien Hari Ini Selesai Diperiksa. Tidak ada antrean pasien yang menunggu ruang dokter saat ini."*
  Sistem DILARANG membiarkan form aktif macet (*stuck*) menampilkan data pasien lama yang sudah selesai diperiksa.

---

## 6. Non-Functional Requirements

- **Ergonomi Dokter & Anti-Fatigue**: Form tidak boleh melampaui batas layar normal laptop (tinggi konten per tab $\le 600\text{px}$), menghilangkan kelelahan scrolling vertikal.
- **Kecepatan Transisi Antar-Tab**: Perpindahan tab instan dalam waktu $< 16\text{ms}$ (60 FPS) menggunakan React state murni tanpa re-fetching jaringan.
- **Mobile & Tablet Adaptif**: Pada layar smartphone/tablet, tab navigation dapat di-swipe atau dibungkus secara rapi dengan touch target minimal 44x44px.
- **Anti-Slop Compliance**: Bebas em dashes (`—`), kontras warna WCAG AA, dan penamaan tombol dalam bahasa Indonesia profesional.
