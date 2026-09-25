# Spesifikasi Komponen SIM Klinik Pratama Cikidang Medika
*Dokumentasi Detail Aturan Komponen & Panduan Interaksi Taktil (High-Depth)*

---

## 1. Tombol Taktil "Berisi" (Tactile Hardware Buttons)

Semua tombol mengikuti standar `better-ui` dan `emil-design-eng`:
- **Top Specular Inset Rim**: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.28)`.
- **Fisika Tekan (Scale Physics)**: `active:scale-[0.965]` dengan transisi `cubic-bezier(0.2, 0, 0, 1)` durasi 120ms.
- **Kedalaman Gradasi**: Permukaan tidak flat polos, menggunakan gradasi mikro vertikal lembut.

| Varian | Spesifikasi Visual & Tokens | Konteks Penggunaan |
|---|---|---|
| **Primary (Emerald Bevel)** | `bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-btn-primary border border-emerald-600/90 active:scale-[0.965]` | Aksi utama: "Daftarkan Pasien", "Simpan & Kirim Kasir", "Cetak Kuitansi" |
| **Secondary (Tactile Beveled White)** | `bg-gradient-to-b from-white to-slate-50 hover:to-slate-100 text-slate-800 shadow-btn-secondary border border-slate-300 active:scale-[0.965]` | Aksi pendukung: "Filter", "Ekspor Berkas Excel", "Batal & Tutup" |
| **Dark Master Checkout** | `bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-md border border-slate-800 active:scale-[0.965]` | Aksi pembayaran kasir & transaksi finansial penting |
| **Counter Pill Action** | `bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 rounded-xl active:scale-[0.965]` | Tab antrean & filter poli dengan counter numerik |

---

## 2. Dropdown Kustom (Custom Floating Popover Select)

> ⚠️ **ATURAN MUTLAK**: Dilarang menggunakan tag HTML native `<select>` polos karena memunculkan jendela popup persegi panjang biru kaku bawaan OS yang merusak estetika desain (seperti pada screenshot pengujian user).

### Spesifikasi Dropdown Kustom:
1. **Trigger Button**:
   - Berupa tombol kustom dengan border `border-slate-300`, background putih bersih, badge inisial jaminan di sisi kiri, judul & sub-deskripsi, serta ikon chevron di kanan.
   - Chevron berputar 180° secara halus saat dropdown terbuka (`transition-transform duration-200`).
2. **Floating Popover**:
   - Melayang di atas elemen lain dengan `z-50`, radius `rounded-2xl`, background `bg-white/95 backdrop-blur-md`, border `border-slate-200`, dan bayangan `shadow-popover`.
   - Animasi masuk: skala mikro dari `0.96` ke `1` dan opacity `0` ke `1` durasi 150ms.
3. **Item Opsi Berisi (Rich Options)**:
   - Setiap pilihan memuat:
     - Badge warna penjamin (Teal untuk BPJS, Biru untuk Umum, Ungu untuk TBC, Hijau untuk Sunat).
     - Nama Penjamin (teks tebal).
     - Sub-deskripsi penjelasan (misal: "Tercover Kapitasi & Rujukan Faskes 1").
     - Indikator centang (*checkmark*) pada opsi yang sedang aktif.
4. **Interaksi Menutup**:
   - Otomatis tertutup saat pengguna memilih opsi atau mengklik di luar area dropdown (*click outside*).

---

## 3. Kartu Metrik KPI dengan Grafik Mini (*Sparklines*)

Mengacu pada estetika *Chronyx*:
- **Latar & Kedalaman**: `bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card-layered`.
- **Grafik Mini Sparkline**:
  - Menggunakan kurva SVG dinamis dengan gradasi area lembut di bawah garis.
  - Memberikan kesan dasbor yang hidup (*alive*), tidak sekadar kotak angka mati.
- **Hierarki Konten**:
  - Header: Label metrik huruf kapital abu-abu netral + ikon bersudut melengkung.
  - Angka Utama: Font monospaced tebal `tabular-nums` ukuran 30px (`text-3xl`).
  - Tren: Kapsul delta hijau (`+12%`) atau status poli dokter.

---

## 4. Widget Pemeriksaan Poli Dokter (Recessed Surface Depth)

Mengadopsi pola *recessed wells* dari *Chronyx*:
- **Tanda-Tanda Vital**:
  - Kotak 4 kolom (Tekanan Darah, Nadi, Suhu, Nafas) berada dalam kontainer yang sedikit menjorok ke dalam (*recessed well*): `bg-slate-50/90 border border-slate-200 shadow-well rounded-xl p-3.5`.
  - Teks angka tanda vital berukuran besar `text-xl font-bold font-mono text-slate-900`.
  - Saat input difokuskan, muncul cincin fokus lembut `focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500`.
- **Multi-Diagnosa Sekali Klik**:
  - Chip diagnosa penyakit (ISPA, Dispepsia, Hipertensi, dll.) menggunakan gaya tombol taktil.
  - Chip terpilih berwarna hijau zamrud tegas dengan tanda silang untuk membatalkan; chip belum terpilih berupa tombol putih beveled yang dapat diklik untuk menambahkan.

---

## 5. Tabel Pasien & Menu Aksi

- **Avatar Inisial Pasien**: Lingkaran inisial dua huruf bergradasi mikro (misal `DD`, `SR`) dengan border tipis dan bayangan lembut.
- **Badge Kategori**: Kapsul melengkung penuh (`rounded-full`) dengan border warna senada.
- **Tombol Aksi Baris**: Tombol taktil beveled putih atau hijau yang mengundang interaksi.
