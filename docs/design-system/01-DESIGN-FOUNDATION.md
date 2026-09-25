# Pondasi Desain SIM Klinik Pratama Cikidang Medika
*Dokumen Spesifikasi Visual, Desain Sistem, & Token Warna*

---

## 1. Filosofi Desain: Clinical Modernism

Berdasarkan analisis mendalam terhadap 3 referensi dashboard klinis modern (**Chronyx** & **Elera Health**), sistem antarmuka Klinik Pratama Cikidang Medika mengadopsi prinsip **Clinical Modernism**:

1. **Kejelasan Tinggi & Densitas Informasi Terukur**:
   - Klinik menangani data pasien, resep obat, dan keuangan. Tampilan tidak boleh kosong (sterile slop) dan tidak boleh penuh sesak (cluttered).
   - Setiap elemen memiliki fungsi hierarki visual yang jelas: dokter dapat memeriksa tanda vital dalam 2 detik, kasir dapat memproses pendaftaran dalam 30 detik.
2. **Karakter Visual yang Khas (Bukan Template AI Biasa)**:
   - Terinspirasi dari *Elera Health*, kita meninggalkan gradient biru-ungu generik AI dan beralih ke palet **Clinical Emerald / Mint** (`#059669` / `#10B981`) yang segar, profesional, dan menenangkan, dipadukan dengan permukaan kartu putih bersih (`#FFFFFF`) berlatar abu-abu sejuk (`#F8FAFC`).
   - Item aktif pada navigasi menggunakan kapsul hijau lembut dengan teks kontras tinggi, memberikan identitas instan pada aplikasi.
3. **Concentric Border Radius & Layered Depth** (*better-ui standard*):
   - Sudut luar dan dalam bersarang secara proporsional: `Radius Luar = Radius Dalam + Padding`.
   - Menggunakan bayangan bertingkat transparan (*layered transparent box-shadow*) untuk elevasi kartu, bukan bayangan gelap kotor.
4. **Respon Taktil (Tactile Micro-interactions)**:
   - Tombol dan kartu interaktif memiliki efek skala `active:scale-[0.98]` untuk memberikan umpan balik fisik yang nyata saat disentuh di tablet atau diklik di komputer.

---

## 2. Palet Warna & Token Semantik

### 2.1 Palet Utama (Brand & Clinical Accent)
| Nama Token | HEX | Tailwind Class | Penggunaan |
|---|---|---|---|
| **Primary 50** | `#ECFDF5` | `bg-emerald-50` | Background kapsul aktif, hover baris tabel |
| **Primary 100** | `#D1FAE5` | `bg-emerald-100` | Badge aktif, border aksen lembut |
| **Primary 500** | `#10B981` | `bg-emerald-500` | Indikator sukses, status stabil |
| **Primary 600** | `#059669` | `bg-emerald-600` | Tombol aksi utama, aksen navigasi |
| **Primary 700** | `#047857` | `bg-emerald-700` | Tombol aksi utama saat hover |
| **Primary Active Pill** | `#4ADE80` (Mint) | `bg-[#4ade80]` | Navigasi menu aktif khas Elera |

### 2.2 Palet Netral & Permukaan (Surfaces)
| Nama Token | HEX | Tailwind Class | Penggunaan |
|---|---|---|---|
| **Surface Background** | `#F8FAFC` | `bg-slate-50` | Latar belakang seluruh halaman aplikasi |
| **Surface Card** | `#FFFFFF` | `bg-white` | Latar kartu, modal, popover, dan panel |
| **Surface Secondary** | `#F1F5F9` | `bg-slate-100` | Kontainer sekunder, inner widget, header tabel |
| **Border Subtle** | `#E2E8F0` | `border-slate-200` | Border kartu, pemisah baris, divider |
| **Border Strong** | `#CBD5E1` | `border-slate-300` | Border form input, checkbox, radio |
| **Text Primary** | `#0F172A` | `text-slate-900` | Judul, angka KPI, nama pasien, label aktif |
| **Text Secondary** | `#475569` | `text-slate-600` | Teks pendukung, deskripsi, nilai sekunder |
| **Text Muted** | `#94A3B8` | `text-slate-400` | Placeholder, label unit (kg, mmHg, thn), timestamp |

### 2.3 Palet Kategori Pasien (Klinik Spesifik)
| Kategori | Background | Text | Border | Kegunaan |
|---|---|---|---|---|
| **Pasien BPJS** | `#F0FDFA` (`teal-50`) | `#0F766E` (`teal-700`) | `#99F6E4` (`teal-200`) | Identifikasi pasien BPJS Kesehatan |
| **Pasien UMUM** | `#EFF6FF` (`blue-50`) | `#1D4ED8` (`blue-700`) | `#BFDBFE` (`blue-200`) | Identifikasi pasien bayar mandiri |

### 2.4 Status Alur Pasien & Antrean
| Status | Badge Token | Arti & Konteks Alur |
|---|---|---|
| **Menunggu Dokter** | `bg-amber-50 text-amber-800 border-amber-200` | Pasien selesai daftar di kasir, menunggu panggilan dokter |
| **Sedang Diperiksa** | `bg-blue-50 text-blue-800 border-blue-200` | Pasien berada di dalam ruang dokter |
| **Menunggu Obat / Bayar** | `bg-purple-50 text-purple-800 border-purple-200` | Dokter selesai meriksa, resep diteruskan ke farmasi/kasir |
| **Selesai / Lunas** | `bg-emerald-50 text-emerald-800 border-emerald-200` | Pembayaran selesai, obat diterima, kunjungan tuntas |
| **Batal / Peringatan** | `bg-rose-50 text-rose-800 border-rose-200` | Pasien batal periksa atau stok obat menipis |

---

## 3. Tipografi: Plus Jakarta Sans

Aplikasi tetap mengoptimalkan **Plus Jakarta Sans** dengan hierarki skala tipe terkalibrasi:

| Level | Size | Weight | Line Height | Tracking | Penggunaan |
|---|---|---|---|---|---|
| **Display / H1** | `24px` (`text-2xl`) | Bold (`700`) | `32px` | `-0.02em` | Judul modul utama (Dashboard, Rekam Medis) |
| **Section / H2** | `18px` (`text-lg`) | Semibold (`600`) | `24px` | `-0.01em` | Judul kartu, nama grup antrean, header tabel |
| **Subhead / H3** | `15px` (`text-base`)| Semibold (`600`) | `20px` | `0` | Nama pasien, judul widget tanda vital |
| **Body Regular** | `14px` (`text-sm`) | Regular (`400`) | `20px` | `0` | Teks keterangan, deskripsi resep, isian form |
| **Body Medium** | `14px` (`text-sm`) | Medium (`500`) | `20px` | `0` | Label formulir, header kolom tabel, link menu |
| **Caption / Tiny**| `12px` (`text-xs`) | Medium (`500`) | `16px` | `+0.01em` | Tag status, counter antrean, No. RM |
| **Tabular Numbers**| `14px-28px` | Bold / Semibold | Normal | `tabular-nums font-mono` | Tarif Rupiah, ICD-10, No. RM, Vital Signs |

---

## 4. Elevasi, Border, & Radius (*Surfaces*)

### 4.1 Aturan Concentric Radius
Untuk menjaga konsistensi visual:
- Kartu Utama: `rounded-2xl` (`16px`) dengan padding `p-5` (`20px`).
- Elemen di Dalam Kartu (Inner Card / Widget / Baris): `rounded-xl` (`12px`) atau `rounded-lg` (`8px`).
- Input Formulir & Tombol: `rounded-xl` (`10px` - `12px`).
- Badge Status & Tag: `rounded-full` (`9999px`) dengan `px-2.5 py-0.5`.

### 4.2 Layered Box Shadows
```css
/* Elevasi Lembut Kartu (Resting) */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);

/* Elevasi Hover (Interactive Card) */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);

/* Elevasi Dialog / Popover */
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04);
```

---

## 5. Standar Aksesibilitas & Responsivitas Mobile
- **Target Sentuh Minimum**: Semua tombol dan opsi klik berukuran minimal `44 × 44px` dengan `gap-2` (8px).
- **Kontras WCAG AA**: Rasio kontras teks terhadap latar belakang minimal `4.5:1` untuk teks normal dan `3:1` untuk teks tebal/besar.
- **Bebas Horizontal Scroll**: Semua tabel dan grid membungkus konten secara adaptif atau menggunakan kontainer internal dengan overflow scrolling aman (`overflow-x-auto`).
