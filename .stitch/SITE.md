# Site Architecture: SIM Klinik Pratama Cikidang Medika

## 1. Vision & Purpose
Sistem Informasi Manajemen (SIM) Klinik berbasis web modern, cepat, dan terpusat untuk Klinik Pratama Cikidang Medika. Dibangun untuk menggantikan sistem pencatatan spreadsheet Google Sheets manual (yang telah menampung 7.493 transaksi kunjungan dan 4.238 pasien). Solusi ini menjamin data tersimpan aman tanpa resiko formula tertimpa, mencegah duplikasi pendaftaran pasien, mempermudah dokter (dr. Ovan & dr. Neneng) mencatat diagnosis ICD-10 ringkas, mengelola buku kas operasional & dana kapitasi BPJS (~Rp 28 Jt/bulan), dan menyediakan dashboard eksekutif yang dapat diakses dari laptop kasir maupun smartphone dokter di luar klinik.

## 2. Project Metadata
- **Project Name:** SIM Klinik Cikidang Medika
- **Stitch Project ID:** `13074078228953025446`
- **Design System Asset ID:** `assets/95293427f01641f6925061b5f17253da`
- **Primary Target Users:** Kasir/Staf Loket, Dokter Pemeriksa (dr. Ovan & dr. Neneng), Pemilik/Pimpinan Klinik
- **Tech Stack:** Next.js 14 App Router, Tailwind CSS, Supabase PostgreSQL, Lucide React

## 3. Screen Specifications

### Page 1: `dashboard` (Executive & Financial Dashboard)
- **Device:** Desktop (1440px) & Mobile Responsive
- **Primary Outcome:** Memberikan gambaran real-time performa klinik kepada dr. Ovan dan pimpinan.
- **Key Sections:**
  - Header: Nama klinik "Klinik Pratama Cikidang Medika", tanggal hari ini, status sinkronisasi cloud.
  - KPI Metrics (4 Cards):
    1. Total Kunjungan: `7.493` (+24% YoY)
    2. Pasien Terdaftar: `4.238` Pasien Unik
    3. Dana Kapitasi BPJS Bulan Ini: `Rp 28.540.000` (Pencairan tgl 15)
    4. Omzet Kasir Umum Bulan Ini: `Rp 14.850.000` (Tunai & Transfer)
  - Split Visual:
    - Left (60%): Grafik Tren Kunjungan Harian & 10 Besar Diagnosa ICD-10 (ISPA J00, Dispepsia K30, Hipertensi I10, Dermatitis L23).
    - Right (40%): Ringkasan Arus Kas Operasional Terakhir (Masuk vs Keluar vs Setor Bank) & Tombol Aksi Cepat "Ekspor Laporan Excel (.xlsx)".

### Page 2: `pendaftaran` (Patient Registration & Cashier/POS)
- **Device:** Desktop (1440px)
- **Primary Outcome:** Loket pendaftaran secepat kilat tanpa salah ketik atau double input.
- **Key Sections:**
  - Top Bar: Instant Search Bar (Cari No RM / Nama Pasien / NIK).
  - Left Pane (40%): Formulir Pendaftaran Pasien Baru (No RM auto-generated, Nama Lengkap, Gelar, Tgl Lahir, Alamat Desa, NIK, No Kartu BPJS).
  - Right Pane (60%): Billing Loket & Pembayaran:
    - Switch Tipe Pasien: `BPJS Kesehatan` (Biaya otomatis Rp 0) vs `Umum / Mandiri`.
    - Input Tindakan Medis / Obat Kasir.
    - Metode Pembayaran: Tunai vs Transfer Bank (BCA / Mandiri).
    - Tombol Aksi: "Simpan & Masuk Antrean Dokter" & "Cetak Nota / Kuitansi".

### Page 3: `rekam-medis` (Doctor's Consultation & EHR Queue)
- **Device:** Desktop & Tablet (Optimized for dr. Ovan & dr. Neneng)
- **Primary Outcome:** Pencatatan anamnesa, diagnosa ICD-10, dan resep obat dalam kurang dari 2 menit per pasien.
- **Key Sections:**
  - Left Queue List: Daftar antrean pasien hari ini dengan badge status (Menunggu, Sedang Diperiksa, Selesai).
  - Center Medical Sheet:
    - Identitas Pasien aktif (No RM, Nama, Usia, Riwayat Alergi Obat).
    - Form Pemeriksaan: Keluhan Utama (Anamnesa), Tanda Vital (Tekanan Darah, Nadi, Suhu).
    - Tag Diagnosa ICD-10 Cepat (Chips: J00 ISPA, K30 Dispepsia, Z34 Kontrol Hamil, A09 Diare, dll).
    - Catatan Tindakan Medis & Terapi Resep Obat.
  - History Tab: Riwayat kunjungan kontrol masa lalu pasien tersebut.

### Page 4: `buku-kas` (Operational Cashflow & Bank Deposit)
- **Device:** Desktop & Mobile
- **Primary Outcome:** Menjaga transparansi kas fisik klinik dan rekening bank tetap seimbang.
- **Key Sections:**
  - Summary Balances: Saldo Kas Tunai di Laci Kasir vs Saldo Kas Bank Operasional.
  - Form Entri Kas Cepat: Masuk (Kapitasi BPJS, Rujukan USG/Lab) vs Keluar (Beli Obat/Alkes Habis Pakai, Operasional Harian, Listrik).
  - Rekap Setor Tunai: Kasir mencatat bukti setor tunai harian ke rekening bank klinik.
  - Riwayat Tabel Mutasi Kas dengan filter tanggal dan kategori pengeluaran.

## 4. Sitemap
- [x] `dashboard` (Executive Dashboard & Analytics — Generated via Stitch MCP)
- [ ] `pendaftaran` (Registration & Cashier Loket)
- [ ] `rekam-medis` (Doctor's Consultation Room)
- [ ] `buku-kas` (Cashflow & BPJS Capitation Ledger)
- [ ] `program-khusus` (Special Programs: TBC Cohort, Circumcision & Photo Storage, Post-Care)

## 5. Roadmap
- **Iteration 1:** Generate `dashboard` (the primary high-impact screen for client proposal approval).
- **Iteration 2:** Generate `pendaftaran` (the front-office operational workhorse).
- **Iteration 3:** Generate `program-khusus` (TBC 6-month tracking, circumcision photo gallery, post-care follow-up).
- **Iteration 4:** Generate `rekam-medis` (the clinical consultation interface for dr. Ovan & dr. Neneng).
- **Iteration 5:** Generate `buku-kas` (financial reconciliation & ledger).

## 6. Creative Freedom & Future Enhancements
- Mobile Viewport specific variants for dr. Ovan to check daily cashflow from phone.
- Print-friendly layout template for thermal receipt / invoice kasir (`58mm` / `80mm`).
- Quick export preview modal for Microsoft Excel format (`.xlsx`).
