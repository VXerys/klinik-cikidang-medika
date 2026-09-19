---
page: pendaftaran
---
A high-efficiency, dual-pane Patient Registration & Cashier Loket (Point of Sale) desktop web screen (1440px) for Klinik Pratama Cikidang Medika, designed to eliminate duplicate patient records, enable lightning-fast autocomplete across 4,238 registered patients, and handle rapid BPJS vs Pasien Umum billing transactions.

**DESIGN SYSTEM (REQUIRED):**
- **Atmosphere:** Clinical Sanctuary — clean, modern, calm, high-contrast, hygienic. Density: Balanced Daily App (6/10). No visual clutter.
- **Palette:**
  - Background Canvas: #F8FAFC (Slate-50)
  - Card & Container Fill: #FFFFFF
  - Primary Text: #0F172A (Slate-900)
  - Secondary Text / Muted: #475569 (Slate-600)
  - Structural Borders: #E2E8F0 (Slate-200)
  - Primary Accent: #0F766E (Clinical Teal-700) for primary buttons, active navigation, and key badges
  - BPJS Functional Badge: #0284C7 (Sky-600)
  - Umum Functional Badge: #D97706 (Amber-600)
- **Typography:**
  - Display / Headlines: Geist / Outfit, semibold/bold, track-tight (-0.02em)
  - Body & Labels: Geist / Satoshi, regular/medium
  - Numbers & Data: Geist Mono / JetBrains Mono for counts, dates, and rupiah currency
  - Banned: No Inter font, no generic serif fonts (Times New Roman, Georgia)
- **Component Styling:**
  - Buttons: Solid Clinical Teal (#0F766E) with white text, tactile click feel, rounded-lg (8px). Secondary button: white with 1px border (#CBD5E1).
  - Cards: Crisp white, 1px border (#E2E8F0), 12px rounded corners, subtle diffused shadow.
  - Data Tables: Compact, readable rows (48px height), clean borders, monospace numbers.
  - Anti-patterns strictly banned: No emojis anywhere, no AI purple/neon glow, no oversaturated gradients, no fake round numbers, no 3-equal-card marketing rows.

**Page Structure (Desktop 1440px):**
1. **Sidebar Navigation (Left, 240px):**
   - Clinic Brand: "KLINIK CIKIDANG MEDIKA" (Sistem Informasi Manajemen).
   - Navigation Links:
     - Dashboard
     - Pendaftaran & Loket (Active state: #F0FDFA background, #0F766E teal text & border indicator)
     - Rekam Medis (dr. Ovan / dr. Neneng)
     - Buku Kas & Keuangan
     - Laporan & Ekspor
   - User Profile Footer: "Rina S." (Petugas Loket / Kasir) • Status "Shift Pagi Aktif".
2. **Top Header Bar:**
   - Page Title: "Pendaftaran Pasien & Kasir Loket".
   - Search Bar: Centered prominent quick-search bar with keyboard shortcut badge ("Ctrl + K") and placeholder "Ketik No RM, NIK, atau Nama Pasien (Cth: Ny. Siti / 00-42-19)...".
   - Action: Button "Panggil Antrean Berikutnya (A-014)".
3. **Workspace (Dual-Pane Split):**
   - **Left Pane (45% - Formulir Pasien & Identitas Rekam Medis):**
     - Tab Selector: "Pasien Baru" | "Pasien Terdaftar (4.238 Database)".
     - Fields:
       - No. Rekam Medis: "RM-004239" (Auto-generated, Geist Mono).
       - Nama Lengkap Pasien & Gelar (Cth: Tn. Ahmad Suparman).
       - Tanggal Lahir / Usia: 14 Maret 1984 (42 Thn).
       - NIK KTP (16 Digit): 3202111403840002.
       - Alamat Domisili: RT 03 / RW 02, Desa Cikidang.
       - No. Telepon / WhatsApp.
       - Jenis Penjamin / Kunjungan: Toggle Button Group [BPJS Kesehatan] vs [Umum / Mandiri].
       - If BPJS: Input No. Kartu BPJS (13 Digit) with validation badge "Faskes Tingkat 1 Sesuai".
   - **Right Pane (55% - Billing Loket & Antrean Hari Ini):**
     - **Card 1: Billing & Kasir Transaksi:**
       - Tipe Pasien terpilih: "BPJS Kesehatan" -> Biaya Jasa Medis Periksa: "Rp 0" (Klaim Kapitasi Bulanan).
       - Item Tambahan / Tindakan Medis (jika ada): Dropdown tindakan & obat kasir.
       - Subtotal & Total Bayar: "Rp 0" (Pasien BPJS) atau "Rp 45.000" (Pasien Umum).
       - Metode Pembayaran: [Tunai] [Transfer QRIS / BCA / BRI].
       - Action Buttons:
         - Primary Button: "Simpan & Masukkan Antrean Dokter (Poli Umum)" (bg #0F766E).
         - Secondary Button: "Cetak Nota / Nomor Antrean (Thermal 58mm)".
     - **Card 2: Antrean Loket Hari Ini (Live Table):**
       - Table headers: No Antrean, Waktu, No RM, Nama Pasien, Penjamin, Tujuan Poli, Status.
       - Row entries:
         1. A-011 | 08:30 | RM-001042 | Ny. Aisyah Rahmawati | [BPJS] | dr. Ovan | Selesai
         2. A-012 | 08:45 | RM-003190 | Tn. Bambang Irawan | [Umum] | dr. Neneng | Diperiksa
         3. A-013 | 09:02 | RM-000418 | An. Rizky Pratama | [BPJS] | dr. Ovan | Menunggu
         4. A-014 | 09:15 | RM-004239 | Tn. Ahmad Suparman | [BPJS] | dr. Ovan | Baru Daftar
