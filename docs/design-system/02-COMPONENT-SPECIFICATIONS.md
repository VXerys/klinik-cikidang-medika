# Spesifikasi Komponen SIM Klinik Pratama Cikidang Medika
*Dokumentasi Detail Aturan Komponen & Panduan Interaksi*

---

## 1. Tombol (Buttons)

Semua tombol mengikuti standar `better-ui` dengan efek skala tekan `active:scale-[0.98]`, transisi seimbang `transition-all duration-150`, dan radius `rounded-xl`.

| Varian | Visual Classes | Konteks Penggunaan |
|---|---|---|
| **Primary (Solid Emerald)** | `bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]` | Aksi utama: "Daftarkan Pasien", "Selesai Periksa & Kirim ke Kasir", "Simpan Data" |
| **Secondary (Outline)** | `border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 active:scale-[0.98]` | Aksi pendukung: "Filter", "Ekspor Excel", "Batal", "Cetak Resep" |
| **Soft Neutral** | `bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98]` | Aksi navigasi cepat: "+ Tambah Tindakan", "+ Tambah Obat" |
| **Danger (Solid Rose)** | `bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]` | Aksi destruktif: "Hapus Pasien", "Batalkan Kunjungan" |
| **Ghost / Icon Button** | `text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-2` | Tombol ikon tutup modal, refresh antrean, pagination |
| **Button with Counter** | `flex items-center gap-2 ... badge inside: bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-xs` | Segmented tab button: "Menunggu Dokter (4)", "Menunggu Obat (2)" |

---

## 2. Kartu & Widget Metrik (Cards & Metrics)

Mengacu pada gaya kartu metrik di *Chronyx* dan *Elera*:
- **Latar & Border**: `bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm`.
- **Hierarki Kartu Metrik**:
  - Header: Label metrik berwarna netral (`text-slate-500 font-medium text-xs tracking-wide uppercase`) bersanding dengan ikon persegi ber-border halus (`w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center`).
  - Nilai Utama: Angka besar `text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums`.
  - Delta / Keterangan: Kapsul hijau/merah lembut (`bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold`) untuk tren hari ini vs kemarin.

---

## 3. Bilah Pencarian & Autocomplete (Search Bar)

Pencarian adalah fitur paling vital untuk dokter dan kasir:
- **Universal Quick Search (`⌘K` / `Ctrl+K`)**:
  - Input field modern dengan ikon pencarian kaca pembesar di sisi kiri dan badge tombol pintasan keyboard `Ctrl+K` di sisi kanan (`bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded border border-slate-200 font-mono`).
- **Patient Search Autocomplete**:
  - Dropdown melayang (`bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden z-50`).
  - Setiap hasil menampilkan:
    - Inisial pasien dalam lingkaran warna.
    - Nama lengkap pasien (`font-semibold text-slate-900`).
    - Tag No. RM (`font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded`).
    - Desa / Alamat dan Jenis Pasien (BPJS / Umum).
  - Footer dropdown menyediakan tombol instan: `+ Daftarkan Sebagai Pasien Baru`.

---

## 4. Bilah Navigasi Samping (Sidebar Navigation)

Terinspirasi kuat dari *Elera Health*:
- **Area Klinik**: Logo Cikidang Medika + teks "Klinik Pratama Cikidang Medika" + status sistem live (titik hijau berkedip).
- **Pengelompokan Menu**:
  1. *Operasional*: Dashboard, Pendaftaran Pasien, Alur Antrean.
  2. *Layanan Medis*: Pemeriksaan Dokter, Rekam Medis, Program Khusus (TBC/Sunat).
  3. *Kasir & Finansial*: Buku Kas, Tagihan & Pembayaran, Laporan Keuangan.
- **Item Menu Aktif (Khas Elera)**:
  - Menggunakan kapsul hijau mint cerah (`bg-[#4ade80] text-slate-900 font-semibold shadow-sm`).
  - Badge counter numerik di sebelah kanan untuk item antrean (`bg-white/80 text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold`).
- **Footer Sidebar (Profil & Role)**:
  - Kartu profil petugas dengan avatar foto/inisial, nama user aktif, dan tag role RBAC (`Dokter Umum`, `Kasir / Admin`, atau `Pimpinan / Owner`).

---

## 5. Avatar Inisial Pasien (Patient Chips & Avatars)

Mempermudah staf mengenali pasien secara cepat tanpa harus membaca teks kecil:
- Lingkaran avatar `w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs`.
- Variasi warna otomatis berdasarkan inisial/id pasien:
  - Hijau: `bg-emerald-100 text-emerald-800`
  - Biru: `bg-blue-100 text-blue-800`
  - Ungu: `bg-purple-100 text-purple-800`
  - Oranye: `bg-amber-100 text-amber-800`
  - Merah muda: `bg-rose-100 text-rose-800`

---

## 6. Widget Tanda Vital Pemeriksaan Dokter (Vital Signs Grid)

Terinspirasi dari *Chronyx*:
- Grid 4 kotak ringkas (`grid grid-cols-2 sm:grid-cols-4 gap-3`):
  1. **Tekanan Darah**: Input angka + satuan `mmHg` (misal `120/80`).
  2. **Nadi / Heart Rate**: Input angka + satuan `bpm` (misal `78`).
  3. **Suhu Tubuh**: Input angka + satuan `°C` (misal `36.5`).
  4. **Laju Nafas**: Input angka + satuan `x/mnt` (misal `20`).
- Setiap kotak memiliki ikon medis halus, background lembut `bg-slate-50`, border `border-slate-200`, dan teks satuan abu-abu pudar.

---

## 7. Tabel Data Pasien & Riwayat Kunjungan

- **Header Tabel**: `bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase border-b border-slate-200 px-4 py-3`.
- **Baris Tabel**: `hover:bg-slate-50/80 transition-colors border-b border-slate-100 px-4 py-3.5`.
- **Struktur Kolom**:
  - Kolom 1: Pasien (Avatar Inisial + Nama Lengkap + No RM).
  - Kolom 2: Kategori & Desa (Badge BPJS/Umum + Nama Desa).
  - Kolom 3: Dokter Pemeriksa & Keluhan.
  - Kolom 4: Status Alur / Pembayaran (Badge Status Berwarna).
  - Kolom 5: Aksi Cepat (Tombol "Buka Rekam Medis" atau "Proses Bayar").

---

## 8. Banner Wawasan Klinis (Insight Callout Banner)

Sesuai pola kartu informasi bawah di *Elera*:
- Desain kapsul lembut: `bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3`.
- Ikon informasi biru di kiri: `w-5 h-5 text-blue-600 shrink-0 mt-0.5`.
- Teks ringkas dan berorientasi aksi: Memberikan ringkasan penting seperti "Ada 4 pasien BPJS menunggu konfirmasi resep di kasir" atau "Setoran kas hari ini belum direkonsiliasi".
