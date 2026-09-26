---
id: F-006-DESIGN
feature: F-006
title: "Technical Design: Register Program Khusus & Ekosistem Foto Medis"
status: approved
owner: "Developer / dr. Ovan"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "../../architecture/overview.md"
  - "../../architecture/data-model.md"
  - "../../architecture/security.md"
  - "../../runbooks/staging-database-setup.md"
---

# Technical Design: F-006 Register Program Khusus Medis

## 1. Design Summary

Modul **Register Program Khusus Medis** (`/program-khusus`) mengimplementasikan pemantauan terstruktur untuk 3 program klinis prioritas dr. Ovan:
1. **Kartu Kendali TBC 6 Bulan**: Pemantauan kepatuhan minum OAT (Fase Intensif 4FDC dan Fase Lanjutan 2FDC), evaluasi dahak mikroskopis BTA, dan peringatan otomatis jika pasien mangkir > 7 hari.
2. **Layanan Sirkumsisi Modern & Ekosistem Foto Medis**: Pencatatan tindakan bedah minor (Laser/Kauter, Klamp, Konvensional), input foto medis fleksibel (kamera langsung smartphone `capture="environment"` atau galeri berkas), kompresi otomatis sisi klien ke WebP (< 300KB) dengan umpan balik visual, thumbnail visual pada kartu riwayat, dan penampil gambar **HD Lightbox Zoom Modal**.
3. **Agenda Pasien Pos-Rawat**: Pencatatan jadwal kontrol berkala pasien pasca rawat jalan/inap serta filter cepat (Hari Ini, Overdue, Riwayat Selesai).

---

## 2. Component Inventory & Responsibilities

| Component | Path | Responsibility |
|---|---|---|
| **ProgramKhususPage** | `src/app/program-khusus/page.tsx` | Kontainer utama tab switcher (`TBC 6 Bulan`, `Sirkumsisi / Sunat`, `Pasien Pos-Rawat`), filter status, dan ringkasan metrik cepat. |
| **NewCircumcisionModal** | `src/components/program-khusus/NewCircumcisionModal.tsx` | Modal input tindakan sirkumsisi dengan 2 opsi unggah foto (kamera langsung vs galeri), kompresi WebP instan dengan rasio ukuran, dan validasi data. |
| **CircumcisionList** | `src/components/program-khusus/CircumcisionList.tsx` | Kartu riwayat tindakan sirkumsisi menampilkan thumbnail visual foto luka, badge metode, status luka, dan pemicu HD Lightbox Zoom Modal. |
| **TbcControlCard** | `src/components/program-khusus/TbcControlCard.tsx` | Visualisasi 6 blok fase pengobatan (Bulan 1-6), status BTA, jadwal kontrol, dan lencana merah jika status Mangkir. |
| **NewTbcModal** | `src/components/program-khusus/NewTbcModal.tsx` | Formulir pendaftaran pasien ke kohort TBC dengan autocomplete master pasien. |
| **PostCareAgenda** | `src/components/program-khusus/PostCareAgenda.tsx` | Daftar agenda kontrol pos-rawat dengan tab Hari Ini, Overdue, dan Riwayat Selesai. |
| **NewPostCareModal** | `src/components/program-khusus/NewPostCareModal.tsx` | Formulir penjadwalan kontrol lanjutan pos-rawat. |

---

## 3. Architecture: Medical Photo Lifecycle & Privacy

```text
[Operator / Dokter]
       │
       ├──► Klik Opsi 1: "Ambil Foto (Kamera)" ──► input[capture="environment"] (HP/Tablet)
       │    atau
       ├──► Klik Opsi 2: "Pilih dari Galeri"   ──► input[type="file"] (Laptop/Desktop)
       │
       ▼
[Canvas HTML5 Client-Side Compression]
       │
       ├── Reduksi dimensi maksimal 1600px
       ├── Iteratif kompresi WebP (kualitas 0.85 -> 0.3) hingga ukuran < 300KB
       └── Render Badge Info: "Ukuran Asli: X MB -> Kompresi: Y KB (WebP)"
       │
       ▼
[Upload Hybrid Storage Adapter (src/lib/storage.ts)]
       │
       ├── Primary: Supabase Storage ('medical-photos' private bucket)
       └── Fallback: Cloudinary Free Tier (jika kuota storage Supabase penuh)
       │
       ▼
[Tersimpan di PostgreSQL (public.circumcisions)]
       │
       ▼
[Tampilan Daftar Riwayat (CircumcisionList)]
       │
       ├── Render Thumbnail Medis Privat (Signed URL 1 Jam)
       └── Klik Thumbnail ──► Buka HD Lightbox Zoom Modal
```

---

## 4. Keamanan & Staging Environment

1. **Privasi Rekam Medis (HIPAA / Permenkes 24/2022)**:
   - Seluruh foto disimpan pada bucket privat tanpa akses publik langsung.
   - Panggilan tampilan foto menggunakan `getSignedMedicalPhotoUrl` yang menghasilkan token kedaluwarsa 3600 detik (1 jam).
2. **Isolasi Database Staging**:
   - Pengujian fitur baru sirkumsisi dan foto dapat diarahkan ke instance staging terpisah mengacu pada [`docs/runbooks/staging-database-setup.md`](../../runbooks/staging-database-setup.md).
