---
id: F-006-DESIGN
feature: F-006
status: approved
owner: Developer
last_updated: "2026-09-21"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "../../architecture/overview.md"
  - "../../architecture/data-model.md"
  - "../../architecture/security.md"
---

# Technical Design: F-006 Register Program Khusus Medis

## 1. Design Summary

Modul **Register Program Khusus Medis** (`/program-khusus`) mengimplementasikan pemantauan terstruktur untuk 3 program klinis prioritas dr. Ovan:
1. **Kartu Kendali TBC 6 Bulan**: Pemantauan kepatuhan minum OAT (Fase Intensif 4FDC dan Fase Lanjutan 2FDC), evaluasi dahak mikroskopis BTA, dan peringatan otomatis jika pasien mangkir > 7 hari.
2. **Layanan Sirkumsisi (Sunat) Modern**: Pencatatan tindakan bedah minor (metode Laser/Kauter, Klamp, Konvensional), jadwal kontrol H+3 dan H+7 lepas klamp, serta unggah dokumentasi foto evaluasi luka dengan kompresi otomatis sisi klien ke WebP (< 300KB) via hybrid storage adapter (`src/lib/storage.ts`).
3. **Agenda Pasien Pos-Rawat**: Pencatatan jadwal kontrol berkala pasien pasca opname atau tindakan medis serta pelacakan keluhan lanjutan.

Sistem juga menyediakan **Clinical Surveillance Alert Widget** yang terintegrasi langsung di Dashboard Eksekutif (`/`) untuk mendeteksi pasien berisiko tinggi tanpa mengharuskan dokter membuka sub-menu terlebih dahulu.

---

## 2. Component Inventory

| Component | Path | Responsibility |
|---|---|---|
| **ProgramKhususPage** | `src/app/program-khusus/page.tsx` | Main container page with tab switcher (`TBC 6 Bulan`, `Sirkumsisi / Sunat`, `Pasien Pos-Rawat`) and quick stats summary. |
| **TbcControlCard** | `src/components/program-khusus/TbcControlCard.tsx` | 6-month visual progression card (Bulan 1-6), BTA lab status, next appointment schedule, and defection alert flag. |
| **NewTbcModal** | `src/components/program-khusus/NewTbcModal.tsx` | Modal form to enroll a patient into the 6-month TBC program with patient search autocomplete. |
| **CircumcisionList** | `src/components/program-khusus/CircumcisionList.tsx` | Table and card view of circumcision records with operator, method, wound condition, and photo viewer. |
| **NewCircumcisionModal** | `src/components/program-khusus/NewCircumcisionModal.tsx` | Modal form to record circumcision procedure and upload pre/post evaluation photos (auto WebP compressed). |
| **PostCareAgenda** | `src/components/program-khusus/PostCareAgenda.tsx` | Schedule calendar/list of post-hospitalization and post-op follow-ups categorized into Today, Overdue, and Upcoming. |
| **NewPostCareModal** | `src/components/program-khusus/NewPostCareModal.tsx` | Modal form to schedule a post-care patient follow-up. |
| **ClinicalAlertWidget** | `src/components/dashboard/ClinicalAlertWidget.tsx` | Executive dashboard alert banner displaying count of defaulting TBC patients and pending wound checks. |

---

## 3. Data Flow Architecture

```text
[Dokter / Tim Medis]
        │
        ├──► Buka Tab TBC ──► Pilih Pasien ──► Tanggal Mulai & Regimen OAT
        │         │
        │         ▼
        │    [public.tbc_programs] ──► Auto Status: Mangkir jika Today > Tgl Kontrol + 7
        │
        ├──► Buka Tab Sirkumsisi ──► Form Tindakan ──► Ambil Foto Luka
        │         │
        │         ├──► [compressImageToWebP] (Canvas HTML5 < 300KB)
        │         └──► [uploadMedicalPhoto] ──► Supabase Storage ('medical-photos')
        │                   │
        │                   ▼
        │              [public.circumcisions] (Simpan URL/Path Privat)
        │
        └──► Buka Tab Pos-Rawat ──► Catat Tgl Kontrol Berikutnya
                  │
                  ▼
             [public.post_cares] ──► Status: Menunggu / Sudah Kontrol / Mangkir
```

---

## 4. Business Logic & Invariants

1. **Defection Detection (TBC Mangkir)**:
   - Pasien dinyatakan `Mangkir Kontrol` jika `status_tbc = 'Dalam Pengobatan'` DAN `tanggal_mulai + interval bulan` terlewati lebih dari 7 hari tanpa pembaruan catatan obat.
   - Peringatan warna merah berkedip ditampilkan di antarmuka.
2. **Circumcision Photo Privacy**:
   - Foto luka anak/dewasa tidak boleh disimpan di bucket publik.
   - Bucket `medical-photos` di Supabase Storage bertipe private; akses pembacaan dilakukan via `getSignedMedicalPhotoUrl` (berlaku 1 jam).
   - Ukuran unggah maksimum dibatasi 300KB (WebP) sisi klien sebelum transmisi jaringan untuk menghemat bandwidth faskes.
3. **Post-Care Classification**:
   - `Hari Ini`: Pasien yang harus kontrol pada tanggal kalender aktif.
   - `Terlewat (Overdue)`: Tanggal kontrol sudah lewat dan belum ditandai `Sudah Kontrol`.
   - `Mendatang`: Jadwal kontrol > besok.

---

## 5. Security & RBAC Enforcement

- **Pencatatan & Unggah Foto**: Terbuka untuk dokter pemeriksa dan paramedis bertugas.
- **Data PII & Foto Medis**: Foto medis diklasifikasikan sebagai data SENSITIF (R-10). Akses URL publik langsung dicegah.
