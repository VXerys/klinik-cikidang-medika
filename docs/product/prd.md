---
status: approved
owner: "Pengembang Sistem & Pimpinan Klinik Cikidang Medika (dr. Ovan / dr. Neneng)"
created: "2026-09-18"
last_updated: "2026-09-21"
last_verified_commit: "proposal-aligned"
source_of_truth_for:
  - product-intent
  - product-scope
  - functional-spec
  - ui-visual-contract
related:
  - "Proposal_Klinik_Cikidang_Medika.pdf"
  - "AGENTS.md"
  - "docs/architecture/overview.md"
---

# Product Requirements Document (PRD)
## Sistem Informasi Manajemen (SIM) Klinik Pratama Cikidang Medika

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Klinik Pratama Cikidang Medika (Klinik Rawat Jalan di Jl. Raya Cikidang, Sukabumi) sebelumnya mengelola seluruh data operasional pasien dan pembukuan keuangannya melalui Google Sheets manual. Volume data telah membengkak mencapai **7.493 catatan riwayat kunjungan dan 4.238 pasien unik** (periode Agustus 2023 – September 2026).

Kondisi spreadsheet ini menimbulkan 5 risiko operasional kritis bagi klinik:
1. **Redundansi dan Double Input:** Staf loket harus mengetik ulang nama dan identitas pasien setiap kali kontrol. Akibatnya timbul inkonsistensi parah (57,6% NIK KTP kosong dan 64,7% nomor BPJS kosong).
2. **Kerapuhan Integritas Data & Salah Input:** Tidak ada proteksi sel atau validasi form. Kesalahan ketik kasir dapat menimpa formula omzet dan merusak pembukuan kas fisik.
3. **Ketidakmampuan Akses Fleksibel di Luar Klinik:** Dokter penanggung jawab sekaligus pemilik klinik (dr. Ovan & dr. Neneng) kesulitan memantau omzet kasir dan tren pasien saat berada di luar klinik karena file spreadsheet 7.500 baris sangat berat dibuka via ponsel.
4. **Program Khusus Tidak Terkontrol:** Pasien pengobatan TBC 6 bulan, tindakan sunat (sirkumsisi), dan pasien kontrol pasca-rawat inap belum memiliki kartu kendali digital dan arsip foto luka yang terstruktur.
5. **Keterbatasan Anggaran IT:** Sebagai klinik pratama swasta mandiri, klinik membutuhkan sistem modern yang **Rp 0 / Bulan Biaya Pemeliharaan Server (Bebas Biaya Langganan Selamanya)**.

### 1.2 Sasaran Utama Klien (Client Success Metrics)
Berdasarkan dokumen resmi **Proposal Penawaran SIM Klinik Pratama Cikidang Medika** (19 September 2026), sistem memenuhi 6 sasaran utama klien:

| Sasaran Utama Klien | Solusi & Deliverables Sistem Informasi Web |
|---|---|
| **Data Terkumpul Terpusat** | 100% data riwayat kunjungan (7.493) dan master pasien (4.238) tersimpan aman di database cloud PostgreSQL terpusat. |
| **Cegah Salah Penginputan** | Formulir terstandarisasi dengan menu pilihan (dropdown) untuk nama dokter, diagnosis ICD-10, metode bayar, dan nominal Rupiah otomatis. |
| **Cegah Input Ganda (Double Input)** | Pencarian cerdas autocomplete berdasarkan Nama atau No RM (<100ms). Pasien lama langsung terpanggil tanpa perlu diketik ulang. |
| **Akses Fleksibel Luar Klinik** | Sistem berbasis web responsif modern; dr. Ovan dapat memantau rekapan pemasukan kasir dan rekam medis langsung dari smartphone di luar klinik. |
| **Hemat Biaya Berkelanjutan (Rp 0/Bln)** | Memanfaatkan arsitektur *Zero-Cost Serverless Cloud* (Vercel Free Tier + Supabase PostgreSQL + Cloudinary Fallback), bebas biaya langganan bulanan. |
| **Data Minimal Sesuai Alur Nyata** | Fitur ramping dan fokus pada kebutuhan klinik nyata (tanpa kerumitan bridging BPJS P-Care dan tanpa stok butir apotek yang sudah ditangani RME dokter). |

### 1.3 Matriks Batasan Ruang Lingkup (Scope Boundaries Matrix)
Berdasarkan kesepakatan penawaran resmi dan transkrip persetujuan dr. Ovan (Total Deal Rp 2.500.000 bersih), batasan ruang lingkup didefinisikan secara tegas guna mencegah penyimpangan fitur (*scope creep*):

| Modul / Komponen | In-Scope Core MVP (Deal Rp 2.500.000) | Out-of-Scope / Post-MVP Extension |
|---|---|---|
| **Pendaftaran & Loket** | Autocomplete pasien, input pasien baru, billing kasir (BPJS vs Umum), cetak nota kuitansi, cetak karcis antrean loket | Panggilan suara mesin antrean (hardware queue speaker) |
| **Rekam Medis Dokter** | Antrean harian, SOAP ringkas, Quick ICD-10 chips + search, resep teks, riwayat lampau, jembatan 1-klik ke Program Khusus | Surat Keterangan Sakit (SKS), Surat Rujukan Luar (Fase 2 Post-MVP) |
| **Buku Kas Operasional** | Kas masuk (Kapitasi BPJS, setor kasir), kas keluar (obat, operasional, prive), rekonsiliasi kas laci vs BRI | Integrasi Open Banking API / BI-Fast otomatis |
| **Dashboard & Laporan** | 4 KPI utama, 10 besar ICD-10, sebaran wilayah desa, panel likuiditas, grafik visual, ekspor 3-sheet Excel `.xlsx` | Pembuatan laporan PDF server-side headless Chromium |
| **Migrasi Data Historis** | Migrasi 4.238 pasien, 7.493 visits, 1.486 arus kas dari Google Sheets ke PostgreSQL | Pemulihan data NIK/BPJS yang kosong pada arsip lama |
| **Program Khusus Medis** | Kartu TBC 6 bulan (deteksi mangkir >7 hr, cetak kartu TB 01), Layanan Sunat (+2 foto WebP <300KB via kamera/galeri, lightbox HD), Agenda Pos-Rawat | Bot pengingat WhatsApp otomatis (WA Gateway), API SITB Kemenkes |
| **Lain-lain / Pihak Ketiga** | Internal clinic database only | Integrasi BPJS P-Care, retail skincare Emerys Glow |

---


## 2. Hak Akses & Peran Pengguna (Role-Based Access Control)

Sistem memberlakukan otentikasi berbasis peran (RBAC) via Supabase Auth:

1. **Peran `kasir` (Petugas Resepsionis / Loket Kasir)**:
   - Akses Modul: Pendaftaran Pasien, Input Pasien Baru, Billing Kasir (Umum & BPJS), Cetak Nota/Kuitansi Kasir, Buku Kas (Menu Kasir: Setor Tunai ke Bank & Kas Kecil Harian).
   - Batasan: Tidak dapat mengedit rekam medis dokter, diagnosa ICD-10, atau mengubah saldo buku kas induk.
2. **Peran `dokter` (dr. Ovan, dr. Neneng, Bidan/Paramedis)**:
   - Akses Modul: Rekam Medis Ringkas Dokter, Antrean Pasien Hari Berjalan, Anamnesa & Tanda Vital, Pemilihan ICD-10, Terapi Obat, dan Program Khusus (Kartu TBC 6 Bulan, Layanan Sunat + Unggah Foto Luka, Monitoring Pos-Rawat).
   - Batasan: Tidak menangani penerimaan uang fisik kasir loket.
3. **Peran `owner` (dr. Ovan & Pimpinan Klinik)**:
   - Akses Modul: Hak akses penuh ke seluruh modul, Dashboard Eksekutif & Keuangan Realtime, Buku Kas Rekonsiliasi Bank vs Laci Kasir, Pusat Laporan & Ekspor Excel (.xlsx).

---

## 3. Spesifikasi Fungsional 5 Modul Utama Sistem

### 3.1 Modul 1: Pendaftaran & Loket Kasir (`/pendaftaran`)
- **Cari Pasien Cepat (Instant Autocomplete)**: Pencarian pasien berdasarkan Nama, No RM, atau Desa dengan waktu respon < 100ms terhadap 4.238+ data master. Saat dipilih, formulir identitas terisi otomatis.
- **Pencegahan Input Ganda**: Sistem memeriksa duplikasi No RM, NIK KTP, serta kesamaan Nama + Tanggal Lahir saat registrasi pasien baru.
- **Registrasi Pasien Baru**: Input ringkas No RM unik otomatis, Nama Lengkap, Gelar (Tn/Ny/An/By), Jenis Kelamin, Tanggal Lahir/Usia, Alamat Desa (8 desa utama Cikidang), NIK KTP, dan Nomor Kartu BPJS.
- **Pemisahan Billing Kasir (BPJS vs Umum)**:
  - *Pasien BPJS*: Biaya periksa otomatis diset **Rp 0** (ditanggung dana kapitasi bulanan klinik), nomor kartu BPJS divalidasi, otomatis masuk rekapan klaim kapitasi.
  - *Pasien Umum*: Kasir menginput biaya periksa dokter dan tindakan/obat penunjang, memilih metode bayar (**Tunai** atau **Transfer Bank BRI**), status pembayaran otomatis *Lunas*.
- **Cetak Bukti Pembayaran**: Cetak nota kuitansi kasir standar (format cetak struk thermal / format ringkas A5).

### 3.2 Modul 2: Rekam Medis Ringkas Dokter (`/rekam-medis`)
- **Antrean Pasien Hari Berjalan**: Dokter melihat daftar antrean pasien yang telah mendaftar di loket kasir pada hari tersebut secara *real-time*.
- **Pemeriksaan Klinis (SOAP Ringkas)**:
  - *Anamnesa*: Keluhan utama pasien dan riwayat penyakit.
  - *Tanda Vital*: Tekanan Darah (mmHg), Berat Badan (kg), Suhu Tubuh (°C), Denyut Nadi (bpm).
  - *Diagnosa ICD-10 Cepat*: Pemilihan diagnosa menggunakan chip favorit satu-klik (J00 ISPA, K30 Dispepsia, I10 Hipertensi, Z34 Kehamilan, L23 Dermatitis, A09 Diare) atau pencarian cepat seluruh kode ICD-10.
  - *Terapi Obat & Tindakan Medis*: Input resep obat yang diberikan dokter dan tindakan medis (jahit luka, nebulizer, injeksi, dll.).
- **Riwayat Berobat Terdahulu (Medical Timeline)**: Dokter dapat membuka riwayat kunjungan pasien terdahulu secara kronologis untuk mengevaluasi perkembangan penyakit dan terapi sebelumnya.

### 3.3 Modul 3: Buku Kas Operasional & Kapitasi BPJS (`/buku-kas`)
- **Pencatatan Kas Masuk**:
  - Pencairan dana bulanan Kapitasi BPJS Kesehatan (~Rp 28.540.000/bulan).
  - Rekapitulasi uang setoran kasir loket (`Setor Tunai`).
  - Pendapatan penunjang (rujukan USG, lab luar, sewa/lain-lain).
- **Pencatatan Kas Keluar**:
  - Pembelian obat-obatan klinik dan bahan medis habis pakai (BMHP).
  - Pengeluaran operasional harian (listrik PLN, internet, konsumsi dokter/staf, ATK).
  - Pengeluaran non-klinik / prive.
- **Rekonsiliasi Kas Laci vs Bank BRI**: Membantu staf dan pimpinan membandingkan total penerimaan uang tunai kasir harian di loket (`visits`) dengan pencatatan uang yang telah disetor ke rekening bank pemilik.

### 3.4 Modul 4: Dashboard Eksekutif & Ekspor Excel (`/` & `/laporan`)
Mengacu secara presisi pada **Halaman 2 Proposal Penawaran SIM Klinik Cikidang Medika**:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD EKSEKUTIF & KEUANGAN                                                                       │
│ Klinik Pratama Cikidang Medika • Ikhtisar operasional harian, data morbiditas ICD-10 & arus kas      │
│ [ Cari Pasien, No RM... ⌘K ]  [🟢 PostgreSQL Realtime | 24ms]  [ Bulan Ini: Sep 2026 ▼ ] [Ekspor ▼] │
├──────────────────────────┬──────────────────────────┬──────────────────────┬─────────────────────────┤
│ TOTAL KUNJUNGAN PASIEN   │ PASIEN UNIK TERDAFTAR    │ DANA KAPITASI BPJS   │ OMZET KASIR UMUM        │
│ 7.493                    │ 4.238 Pasien             │ Rp 28.540.000        │ Rp 14.850.000           │
│ [+24% vs 2025] 2.882 thn │ Rekam medis aktif cloud  │ [Pencairan Bulanan]  │ [Pasien Umum]           │
│ berjalan                 │                          │ Rp 0/pasien periksa  │ Tunai 10.2M • Trf 4.65M │
├──────────────────────────┴──────────────────────────┴──────────────────────┼─────────────────────────┤
│ 10 BESAR DIAGNOSA ICD-10 (September 2026)      [Semua Poli (Umum & KIA) ▼] │ RINGKASAN ARUS KAS      │
│ Distribusi morbiditas rawat jalan terkonfirmasi oleh tim dokter            │ Saldo riil operasional  │
│ [J00] ISPA (Infeksi Saluran Pernapasan Akut)   867 kasus (28%) [█████████] │ 💵 Kas Tunai Laci Kasir │
│ [K30] Dispepsia / Gastritis                    634 kasus (22%) [███████  ] │    Rp 3.420.000         │
│ [I10] Hipertensi Esensial                      518 kasus (18%) [██████   ] │ 🏛️ Kas Bank (BRI)       │
│ [Z34] Pengawasan Kehamilan Normal (ANC)        403 kasus (14%) [█████    ] │    Rp 32.180.000        │
│ [L23] Dermatitis Kontak Alergi                 288 kasus (10%) [████     ] ├─────────────────────────┤
│ [A09] Gastroenteritis Akut (Diare)             232 kasus  (8%) [███      ] │ MUTASI KAS TERKINI      │
│ ✓ Data terintegrasi otomatis dari resume medis E-Rekam Medis               │ [MASUK] Kapitasi BPJS   │
├────────────────────────────────────────────────────────────────────────────┤ [KELUAR] Obat Kimia Far │
│ SEBARAN ASAL WILAYAH DESA PASIEN                                           │ [KELUAR] Alkes Habis    │
│ Jangkauan geografis kunjungan fasilitas kesehatan tingkat pertama          │ [SETOR] Setor ke BRI    │
│ [████████████████████][███████████][████████][███████]                     │                         │
│ 🟢 Desa Cikidang 42% (1.219)  🔵 Desa Pangkalan 24% (692)                 │ [ Lihat Rekap Kas > ]   │
│ 🟣 Desa Sampora 18% (519)     ⚪ Luar Wilayah 16% (461)                    │                         │
└────────────────────────────────────────────────────────────────────────────┴─────────────────────────┘
```

- **Top Bar Utility**:
  - Global Search Input (`Cari pasien, no RM... ⌘K`).
  - Indikator Status Latensi Database (`🟢 PostgreSQL Realtime | 24ms`).
  - Dropdown Filter Periode Cepat (`Bulan Ini: Sep 2026`, `Bulan Lalu`, `Tahun 2026`, `Semua Waktu`).
  - Tombol Aksi Cepat Ekspor Laporan (`Ekspor Laporan ▼`).
- **4 Kartu Metrik Utama**:
  1. *Total Kunjungan Pasien*: Menampilkan 7.493 akumulasi kunjungan, badge pertumbuhan tahunan (`+24% vs 2025`), dan subteks 2.882 kunjungan tahun berjalan.
  2. *Pasien Unik Terdaftar*: Menampilkan 4.238 pasien terdaftar dengan subteks rekam medis aktif migrasi cloud.
  3. *Dana Kapitasi BPJS*: Menampilkan nominal pencairan bulanan BPJS (Rp 28.540.000) dengan badge status dan keterangan Rp 0 / pasien periksa.
  4. *Omzet Kasir Umum*: Menampilkan total omzet penerimaan kasir pasien umum (Rp 14.850.000) dengan rincian rasio Tunai vs Transfer Bank.
- **Chart 1: 10 Besar Diagnosa ICD-10 (Morbiditas Rawat Jalan)**:
  - Dropdown pemilih poli: `Semua Poli (Umum & KIA)`, `Poli Umum`, `Poli KIA/Kebidanan`.
  - Daftar diagnosa berperingkat dengan badge kode warna-warni (`J00`, `K30`, `I10`, `Z34`, `L23`, `A09`), nama penyakit medis Indonesia, jumlah kasus, persentase, dan diagram batang proporsional Tailwind CSS murni.
- **Chart 2: Sebaran Asal Wilayah Desa Pasien**:
  - Diagram batang horizontal multi-segmen (*segmented horizontal stacked bar*) yang menampilkan proporsi jangkauan desa: Desa Cikidang (42%), Desa Pangkalan (24%), Desa Sampora (18%), dan Luar Wilayah (16%).
- **Panel Finansial: Ringkasan Arus Kas (Hari Ini)**:
  - Kartu saldo Kas Tunai Laci Kasir (`Rp 3.420.000`, badge `Tersedia`).
  - Kartu saldo Kas Rekening Bank BRI (`Rp 32.180.000`, badge `Komersial`).
  - Log 4 Mutasi Kas Terkini hari berjalan (Masuk, Keluar, Setor Tunai) dilengkapi jam WIB dan metode bayar.
- **Pusat Laporan & Ekspor Excel (`/laporan`)**:
  - Filter tanggal mulai s/d tanggal selesai, filter jenis pasien, filter dokter.
  - Tabel pratinjau dengan pagination dan rekapitulasi total nominal.
  - Ekspor 1-klik format Microsoft Excel (`.xlsx` via SheetJS) mencakup 3 Sheet: `Rekap Kunjungan`, `Top 10 Morbiditas ICD-10`, dan `Arus Kas Operasional`.

### 3.5 Modul 5: Program Khusus Medis (`/program-khusus`)
Program pemantauan khusus yang dipersyaratkan oleh dr. Ovan untuk menjamin mutu pelayanan klinis:

#### A. Kartu Kendali TBC (Tuberkulosis 6 Bulan)
- **Tujuan**: Memantau kepatuhan minum obat (OAT) pasien TBC selama 6 bulan berturut-turut dan mendeteksi pasien mangkir minum obat.
- **Alur & Fitur**:
  - Pendaftaran pasien TBC (No Register TBC, Kategori Kasus: Baru / Kambuh / Pindahan).
  - Kartu kendali 6 fase bulanan:
    - *Tahap Intensif (Bulan 1 - 2)*: Regimen 4FDC harian.
    - *Tahap Lanjutan (Bulan 3 - 6)*: Regimen 2FDC.
  - Tanggal rencana pengambilan obat berikutnya.
  - **Deteksi Otomatis Pasien Mangkir**: Jika pasien belum datang mengambil obat > 7 hari dari tanggal jadwal kontrol, sistem otomatis memberi penanda visual merah: `⚠️ Pasien Mangkir Kontrol (Perlu Pelacakan)`.
  - Evaluasi dahak BTA mikroskopis pada akhir bulan ke-2, bulan ke-5, dan akhir pengobatan.
  - Status akhir: *Sembuh*, *Pengobatan Lengkap*, *Gagal*, *Mangkir (Drop-out)*, *Meninggal*, atau *Dirujuk ke RS*.

#### B. Layanan Sunat / Sirkumsisi Modern (+ Unggah Foto Luka)
- **Tujuan**: Pencatatan tindakan sunat anak/dewasa dan pemantauan penyembuhan luka secara berkala.
- **Alur & Fitur**:
  - Pencatatan identitas pasien sunat, tanggal tindakan, operator/dokter pelaksana, dan anestesi yang digunakan.
  - Pilihan metode sunat: *Laser / Kauter*, *Klamp / Smart Klamp*, atau *Konvensional / Bedah Minor*.
  - Riwayat kontrol evaluasi luka (Kontrol Hari ke-3, Kontrol Hari ke-7 / Lepas Klamp).
  - **Penyimpanan Foto Luka Pasca Sunat**:
    - Unggah maksimal 2 foto luka kontrol per pasien.
    - Kompresi sisi klien otomatis ke format WebP (< 300KB) untuk menghemat ruang dan kuota internet.
    - Disimpan di cloud privat aman (Cloudinary Free Tier 25GB / Supabase Storage Private Bucket) dengan proteksi akses dokter.
    - Catatan evaluasi kondisi luka (kering, edema minimal, tidak ada infeksi).

#### C. Pemantauan Pasien Pos-Rawat (Pasca Rawat Inap / Bedah)
- **Tujuan**: Mengontrol kepatuhan kontrol pasien yang baru pulang dari rawat inap rumah sakit (RSUD Sekarwangi, dll.) atau paska tindakan bedah di klinik.
- **Alur & Fitur**:
  - Input asal rujukan rawat inap (nama RS / tanggal keluar RS).
  - Diagnosa pasca rawat dan riwayat tindakan.
  - Agenda jadwal rencana tanggal kontrol di klinik.
  - Riwayat kunjungan kontrol: evaluasi tanda vital, kondisi balutan luka jahitan, pelepasan benang (aff hecting), dan penyesuaian terapi obat pulang.

---

## 4. Arsitektur Teknis & Kebijakan Biaya Rp 0 (Zero-Cost Infrastructure)

Untuk memenuhi instruksi klien: *"Minim budget baik maintenance ataupun awal pembuatan (Rp 0 / Bulan Biaya Server)"*, arsitektur dirancang dengan memanfaatkan batas gratis (*Free Tier*) layanan cloud kelas dunia:

| Komponen Sistem | Teknologi Terpilih | Kapasitas Free Tier | Biaya Bulanan |
|---|---|---|---|
| **Aplikasi Web Frontend** | Next.js 14 App Router di Vercel | Unlimited bandwidth w/ fair use | **Rp 0 / Bulan** |
| **Database Cloud** | Supabase Managed PostgreSQL | 500 MB data (cukup untuk 100.000+ kunjungan) | **Rp 0 / Bulan** |
| **Otentikasi & Keamanan** | Supabase Auth (RBAC) | 50.000 Monthly Active Users | **Rp 0 / Bulan** |
| **Penyimpanan Foto Medis** | Cloudinary Free + Supabase Storage | 25 GB Cloudinary + 1 GB Supabase (80.000+ foto WebP) | **Rp 0 / Bulan** |
| **Mesin Ekspor Excel** | SheetJS (`xlsx`) di browser klien | Client-side memory (0 server compute) | **Rp 0 / Bulan** |
| **Domain Resmi Klinik** | Domain `.com` (contoh: klinikcikidangmedika.com) | Dibeli langsung pihak klinik (~Rp 150-250rb/tahun) | Rp 0 pemeliharaan pengembang |

---

## 5. Non-Functional Requirements & Standar Anti-Slop

1. **Responsivitas Mutlak (Mobile, Tablet, Desktop)**:
   - Wajib 100% responsif pada layar smartphone (360px–640px) agar dr. Ovan dapat memantau klinik saat mobile di luar.
   - Drawer slide-over untuk navigasi mobile, target sentuh minimal 44×44px dengan jarak 8px, dan nol *horizontal scroll*.
2. **Standar Tipografi & Desain Higienis (Anti-Slop UI)**:
   - Font resmi: **Plus Jakarta Sans** (bersih, modern, berwibawa medis).
   - Angka monospaced tabular figures untuk No RM, nominal Rupiah, dan kode ICD-10.
   - Warna tema: *Clinical Teal* (`#0F766E`), *Medical Blue* (`#2563EB`), dan dasar *Slate* netral. Tanpa efek neon ungu murahan, tanpa emoji dekoratif di judul.
3. **Integritas & Kecepatan Data**:
   - Pencarian pasien autocomplete < 100ms.
   - Ekspor Excel 7.493 data selesai dalam waktu < 1.5 detik.
   - Seluruh angka dihitung dari database riil Supabase (R-17 & R-38 Anti-Slop: Tidak ada angka fiktif).
