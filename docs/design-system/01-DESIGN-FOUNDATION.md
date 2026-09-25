# Pondasi Desain SIM Klinik Pratama Cikidang Medika
*Dokumen Spesifikasi Visual, Desain Sistem, & Token Warna Medis (Medical Sapphire & Trust Blue)*

---

## 1. Filosofi Desain: Clinical Precision & Trust

Berdasarkan arahan terbaru dan analisis mendalam terhadap referensi dashboard klinis modern (**Chronyx** & **Elera Health**), sistem antarmuka Klinik Pratama Cikidang Medika mengadopsi palet **Medical Sapphire & Trust Blue**:

1. **Warna Biru Medis Presisi (Bukan Biru AI Generik)**:
   - Warna biru adalah standar global industri medis dan kesehatan yang merepresentasikan **kepercayaan (trust), higienitas, ketenangan, dan ketelitian klinis**.
   - Kita menggunakan **Medical Sapphire** (`#2563EB` / `#1D4ED8`) yang dipadukan dengan aksen langit es (*Icy Azure* `#F0F7FF`), bukan biru jenuh yang melelahkan mata.
   - Menu aktif di sidebar menggunakan pil kobalt beveled yang berwibawa dan kontras, menggantikan warna hijau neon cerah yang kurang formal.
2. **Keseimbangan Harmonis dengan BPJS & Status Klinis**:
   - Karena warna utama kini beralih ke **Medical Blue**, identitas **BPJS Kesehatan** kini menggunakan warna hijau zamrud resminya (**BPJS Emerald / Teal** `#059669` / `#0D9488`).
   - Kontras antara Biru (Sistem Klinik) dan Hijau (BPJS Kesehatan) menjadi sangat natural, jelas, dan tidak lagi tumpang tindih.
3. **Concentric Border Radius & Layered Depth** (*better-ui standard*):
   - Sudut luar dan dalam bersarang secara proporsional: `Radius Luar = Radius Dalam + Padding`.
   - Menggunakan bayangan bertingkat transparan (*layered transparent box-shadow*) dan *inner top highlight* untuk elevasi kartu.
4. **Respon Taktil (Tactile Micro-interactions)**:
   - Tombol dan kartu interaktif memiliki efek skala `active:scale-[0.965]` untuk memberikan umpan balik fisik yang nyata saat disentuh di tablet atau diklik di komputer dokter/kasir.

---

## 2. Palet Warna & Token Semantik Medis

### 2.1 Palet Utama (Brand & Clinical Accent: Medical Sapphire)
| Nama Token | HEX | Tailwind Class | Penggunaan |
|---|---|---|---|
| **Primary 50** | `#EFF6FF` | `bg-blue-50` | Latar kapsul aktif lembut, hover baris tabel |
| **Primary 100** | `#DBEAFE` | `bg-blue-100` | Badge aktif sekunder, border aksen lembut |
| **Primary 200** | `#BFDBFE` | `border-blue-200` | Border kotak aktif, ring input fokus |
| **Primary 500** | `#3B82F6` | `text-blue-500` | Ikon aktif, titik status live |
| **Primary 600** | `#2563EB` | `bg-blue-600` | Tombol aksi utama, kapsul aktif sidebar beveled |
| **Primary 700** | `#1D4ED8` | `bg-blue-700` | Hover tombol utama, teks judul aksen |
| **Primary 900** | `#1E3A8A` | `text-blue-900` | Teks tombol aktif bernuansa es |

### 2.2 Palet Netral & Permukaan (Surfaces)
| Nama Token | HEX | Tailwind Class | Penggunaan |
|---|---|---|---|
| **Surface Canvas** | `#F8FAFC` | `bg-slate-50` | Latar belakang kanvas sejuk dengan gradasi ambient |
| **Surface Card** | `#FFFFFF` | `bg-white` | Permukaan kartu dengan *double-bezel shadow* |
| **Surface Inset / Well**| `#F1F5F9` | `bg-slate-100/80` | Kontainer tanda vital, input grup, track tabs |
| **Border Subtle** | `#E2E8F0` | `border-slate-200` | Border kartu, pemisah baris, divider |
| **Border Strong** | `#CBD5E1` | `border-slate-300` | Border form input, tombol beveled sekunder |
| **Text Primary** | `#0F172A` | `text-slate-900` | Judul, angka KPI, nama pasien, label aktif |
| **Text Secondary** | `#475569` | `text-slate-600` | Teks pendukung, deskripsi, nilai sekunder |
| **Text Muted** | `#94A3B8` | `text-slate-400` | Placeholder, label unit (kg, mmHg, thn), timestamp |

### 2.3 Palet Kategori Pasien (Harmonisasi dengan Medical Blue)
| Kategori | Background | Text | Border | Kegunaan |
|---|---|---|---|---|
| **Pasien BPJS** | `#ECFDF5` (`emerald-50`) | `#065F46` (`emerald-800`) | `#A7F3D0` (`emerald-200`) | Identifikasi resmi pasien BPJS Kesehatan (Hijau BPJS) |
| **Pasien UMUM** | `#EFF6FF` (`blue-50`) | `#1E40AF` (`blue-800`) | `#BFDBFE` (`blue-200`) | Identifikasi pasien bayar mandiri (Biru Mandiri) |
| **Program TBC** | `#FAF5FF` (`purple-50`) | `#6B21A8` (`purple-800`) | `#E9D5FF` (`purple-200`) | Kohort OAT & Program Bebas Biaya DOTS |
| **Sirkumsisi** | `#F0FDF4` (`green-50`) | `#166534` (`green-800`) | `#BBF7D0` (`green-200`) | Paket tindakan sunat & foto klinis pemulihan |

### 2.4 Status Alur Pasien & Antrean
| Status | Badge Token | Arti & Konteks Alur |
|---|---|---|
| **Menunggu Dokter** | `bg-amber-50 text-amber-900 border-amber-200` | Pasien selesai daftar di kasir, menunggu panggilan dokter |
| **Sedang Diperiksa** | `bg-blue-50 text-blue-900 border-blue-200` | Pasien berada di dalam ruang dokter |
| **Menunggu Obat / Bayar** | `bg-purple-50 text-purple-900 border-purple-200` | Dokter selesai meriksa, resep diteruskan ke farmasi/kasir |
| **Selesai / Lunas** | `bg-emerald-50 text-emerald-900 border-emerald-200` | Pembayaran selesai, obat diterima, kunjungan tuntas |
| **Batal / Peringatan** | `bg-rose-50 text-rose-900 border-rose-200` | Pasien batal periksa atau stok obat menipis |

---

## 3. Tipografi: Plus Jakarta Sans & Tabular Numbers

Hierarki tipografi tetap mengoptimalkan **Plus Jakarta Sans**:
- Heading & Title: Plus Jakarta Sans Semibold/Bold (`font-bold`).
- Angka Finansial, Vital Signs, No. RM, ICD-10: JetBrains Mono / font-mono `tabular-nums` untuk akurasi pembacaan dokter.
