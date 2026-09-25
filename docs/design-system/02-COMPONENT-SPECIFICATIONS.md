# Spesifikasi Komponen SIM Klinik Pratama Cikidang Medika
*Dokumentasi Detail Aturan Komponen & Panduan Interaksi Taktil (High-Depth)*

---

## 1. Tombol Taktil "Berisi" (Tactile Hardware Buttons)

Semua tombol mengikuti standar `better-ui` dan `emil-design-eng`:
- **Top Specular Inset Rim**: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.28)`.
- **Fisika Tekan (Scale Physics)**: `active:scale-[0.965]` dengan transisi eksplisit `cubic-bezier(0.2, 0, 0, 1)` durasi 120ms (larangan `transition: all`).
- **Kedalaman Gradasi**: Permukaan tidak flat polos, menggunakan gradasi mikro vertikal lembut.

| Varian | Spesifikasi Visual & Tokens | Konteks Penggunaan |
|---|---|---|
| **Primary (Medical Sapphire Bevel)** | `bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-btn-primary border border-blue-700/80 active:scale-[0.965]` | Aksi utama: "Daftarkan Pasien", "Selesai Periksa & Kirim Kasir", "Cetak Kuitansi" |
| **Secondary (Tactile Beveled White)** | `bg-gradient-to-b from-white to-slate-50 hover:to-slate-100 text-slate-800 shadow-btn-secondary border border-slate-300 active:scale-[0.965]` | Aksi pendukung: "Filter", "Ekspor Berkas Excel", "Batal & Tutup" |
| **Dark Master Checkout** | `bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-btn-secondary border border-slate-800 active:scale-[0.965]` | Aksi pembayaran kasir & transaksi finansial penting |
| **Counter Pill Action** | `bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 rounded-xl active:scale-[0.965]` | Tab antrean & filter poli dengan counter numerik |

---

## 2. Dropdown Kustom (Custom Floating Popover Select)

> ⚠️ **ATURAN MUTLAK**: Dilarang menggunakan tag HTML native `<select>` polos karena memunculkan jendela popup persegi panjang biru kaku bawaan OS yang merusak estetika desain.

### Spesifikasi Dropdown Kustom:
1. **Trigger Button**:
   - Berupa tombol kustom dengan border `border-slate-300`, background putih bersih, badge inisial jaminan di sisi kiri, judul & sub-deskripsi, serta ikon chevron di kanan.
   - Chevron berputar 180° secara halus saat dropdown terbuka (`transition-transform duration-200`).
2. **Floating Popover (Anchored Trigger)**:
   - Melayang di atas elemen lain dengan `z-50`, radius `rounded-2xl`, background `bg-white/95 backdrop-blur-md`, border `border-slate-200`, dan bayangan `shadow-popover`.
   - **Transform Origin**: Wajib `transform-origin: top` dengan animasi masuk: skala vertikal mikro `scale(1)` dari `scale(0.96)` dan opacity `0` ke `1` durasi 150ms.
3. **Item Opsi Berisi (Rich Options)**:
   - Setiap pilihan memuat:
     - Badge warna penjamin (Emerald untuk BPJS, Biru untuk Umum, Ungu untuk TBC, Hijau untuk Sunat).
     - Nama Penjamin (teks tebal).
     - Sub-deskripsi penjelasan (misal: "Tercover Kapitasi & Rujukan Faskes 1").
     - Indikator centang (*checkmark*) pada opsi yang sedang aktif.
4. **Interaksi Menutup**:
   - Otomatis tertutup saat pengguna memilih opsi atau mengklik di luar area dropdown (*click outside*).

---

## 3. Kartu Metrik KPI dengan Grafik Mini (*Sparklines*)

Mengacu pada estetika *Chronyx*:
- **Latar & Kedalaman**: `bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card-double`.
- **Grafik Mini Sparkline**:
   - Menggunakan kurva SVG dinamis dengan gradasi area lembut di bawah garis.
   - Memberikan kesan dasbor yang hidup (*alive*), tidak sekadar kotak angka mati.
- **Hierarki Konten**:
   - Header: Label metrik huruf kapital `text-slate-600 font-bold text-[11px] uppercase tracking-wider` + ikon bersudut melengkung.
   - Angka Utama: Font monospaced tebal `tabular-nums` ukuran 24px-30px (`text-2xl` / `text-3xl`).
   - Tren: Kapsul delta hijau (`+12%`) atau status rekonsiliasi kasir.

---

## 4. Ergonomi Dokter: Tanda Vital & Diagnosa ICD-10 Cepat

### 4.1 Preset Tanda Vital Normal 1-Klik
- Untuk mempercepat kerja dokter senior dan meminimalkan beban ketik repetitif pada pasien rawat jalan rutin:
- Tombol taktil `⚡ Isi Normal Dewasa` di samping judul Tanda-Tanda Vital.
- Sekali klik otomatis mengisi 4 kotak tanda vital dengan nilai acuan fisiologis normal:
  - Tekanan Darah: `120/80` mmHg
  - Denyut Nadi: `78` bpm
  - Suhu Tubuh: `36.5` °C
  - Laju Nafas: `20` x/menit
- Kotak tanda vital memberikan efek *subtle border pulse* safir selama 300ms sebagai feedback konfirmasi visual.

### 4.2 Pencarian ICD-10 Cepat & Multi-Diagnosa Dinamis
- Input pencarian cepat diagnosa dengan icon kaca pembesar dan shortcut keyboard:
  - Dokter mengetik keluhan (misal: "lambung", "asma", "febris", "ispa").
  - Menampilkan dropdown autocomplete instan dengan kode ICD-10 resmi.
  - Menekan tombol `Enter` atau mengklik item langsung menyematkan diagnosa baru sebagai *chip* aktif berwarna safir dengan tombol silang hapus ($\times$).
  - Dokter dapat menyematkan lebih dari 1 diagnosa penyakit tanpa batas.

---

## 5. Ergonomi Kasir: Kalkulator Tender & Kembalian Cepat

- Untuk mempercepat antrean pembayaran kasir saat jam sibuk faskes:
- **Rincian Tagihan Terbuka**: Jasa Pemeriksaan Dokter + Biaya Tindakan + Total Resep Obat.
- **Tombol Uang Pas & Pecahan Cepat**:
  - Tombol pill cepat: `[Uang Pas]`, `[Rp 50.000]`, `[Rp 100.000]`, `[Rp 200.000]`.
  - Sekali klik langsung mengisi nominal uang yang diserahkan pasien (*cash tender*).
- **Kalkulasi Kembalian Otomatis**:
  - Menampilkan nominal kembalian dengan font monospaced besar berwarna hijau zamrud tegas di dalam *recessed well* kontras tinggi.
  - Mencegah kesalahan hitung manual kasir dan mempercepat cetak kuitansi.

---

## 6. Komponen Skeleton Loading Shimmer Taktil

- State saat sistem sedang memuat data pasien atau antrean poli dari database Supabase:
- Tidak menggunakan spinner muter generik yang membosankan.
- Menggunakan kotak kerangka abu-abu netral (`bg-slate-200/80`) dengan animasi sapuan cahaya shimmer (`bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer`).
- Menjaga stabilitas tata letak antarmuka sehingga tidak terjadi loncatan layout (*Cumulative Layout Shift* = 0).

---

## 7. Navigasi Responsif Tablet & Smartphone (44px Touch Target)

- Pada viewport $\le 1024\text{px}$:
  - Sidebar desktop disembunyikan secara rapi.
  - Navbar atas menampilkan tombol hamburger berukuran minimal 44x44px (`min-w-[44px] min-h-[44px]`).
  - Menekan tombol hamburger membuka *slide-over drawer* bersafir dengan animasi pegas halus dan lapisan *backdrop-blur* gelap (`bg-slate-900/40 backdrop-blur-xs`).
  - Seluruh menu dan item formulir ramah sentuhan jari dokter dan perawat di ruang periksa.
