---
status: active
owner: "Developer"
session_date: "2026-10-01"
branch: "main"
base_commit: "bfd5cb2"
current_commit: "pending merge to main"
active_feature: "F-009"
active_task: null
expires_after: "2026-10-15"
---

# Session Handoff: F-009 delivered to production

## Session objective

Menutup sisa celah data antara Google Sheets dan aplikasi, menambahkan pemantauan rujukan bidan,
filter periode (satu tanggal atau rentang), dan laporan Puskesmas, lalu mempromosikan seluruhnya
ke produksi setelah hasil staging disetujui klien.

## Completed in this session

### Produksi sudah dimigrasikan (2026-10-01)

| Tahap | Hasil |
|---|---|
| Backup sebelum perubahan | `docs/data/prod-pref009-2026-10-01T09-31-10-869Z.json` (13.220 baris, 7,16 MB) |
| DDL F-009 | Dua migration diterapkan ke produksi, idempoten |
| Rekonsiliasi data | Lolos semua 9 pemeriksaan internal |
| Verifikasi ulang | Query langsung ke produksi, angka cocok dengan staging |
| Idempotensi | Dry-run ulang: 0 rencana perubahan di staging maupun produksi |

Baseline produksi sebelum: 4.238 pasien, 7.493 kunjungan, 1.486 kas, data sampai 18 September 2026.

Hasil produksi sesudah (diverifikasi lewat `scripts/apply-sql.mjs`):

| Metrik | Sebelum | Sesudah |
|---|---|---|
| Pasien | 4.238 | 4.703 |
| Identitas ganda | 254 kelompok | 0 |
| Kunjungan | 7.493 | 7.671 (sampai 29 September 2026) |
| Kas | 1.486 | 1.552 |
| Register program | 0 | 810 (ANC 594, PTM 139, KB 36, 3-Eliminasi 41) |
| Register sirkumsisi | 0 | 43 (semua tanpa tanggal, sesuai sumber) |
| Rujukan bidan | 0 | 82 baris, 9 bidan |

Skema produksi diverifikasi: seluruh kolom F-009 ada, 3 check constraint aktif, 5 index valid dan
ready (semuanya partial index), `tanggal_tindakan` nullable, dan RLS aktif pada keempat tabel.

### Bug yang ditemukan dan diperbaiki (commit `5a0e0ef`)

Rekonsiliasi sempat **tidak idempoten di produksi**. Pencocokan nama pada register sirkumsisi memakai
`patients.find()` atas daftar pasien yang dikembalikan PostgREST **tanpa `ORDER BY`**, sehingga urutan
baris fisik menentukan pasien mana yang dipilih. Produksi dan staging menghasilkan pilihan berbeda,
dan produksi merencanakan baris sirkumsisi ke-44 saat dijalankan ulang.

Perbaikan: kunci deterministik, yaitu pasien yang sudah punya baris register lebih dulu, lalu tanggal
lahir yang cocok, lalu No RM terkecil. Setelah perbaikan, staging dan produksi sama-sama melaporkan
0 rencana perubahan.

### Akar masalah token Supabase yang sering hilang

`scripts/prepare-env.mjs` menjalankan `fs.copyFileSync` dari `.env.staging`/`.env.production` ke
`.env.local`, sehingga `SUPABASE_ACCESS_TOKEN` yang ditambahkan manual ke `.env.local` selalu terhapus
setiap `npm run dev` atau pemanggilan `prepare-env`.

Solusi tanpa mengubah kode: token sekarang disimpan di `.env.staging` **dan** `.env.production`, jadi
`prepare-env` ikut membawanya. Semua berkas tersebut gitignored.

### Di staging saja, menunggu keputusan

- 3 baris `circumcisions` tanpa `sumber_data` (buatan 2026-09-26 17:02 dari pemulihan data program
  F-006, biaya dan metode identik). Produksi bersih dari baris ini.
- Identitas pasien tidak ditulis di dokumen repo karena PII.

## Changed files

| File | Change | State |
|---|---|---|
| `docs/specs/F-009-kelengkapan-data-pemantauan-bidan/*` | Spec: 12 FR, 50+ AC, design, tasks | Complete |
| `supabase/migrations/20260929_f009_*.sql` | Dua migration F-009 | Applied (staging dan produksi) |
| `scripts/reconcile-clinic-data.mjs`, `scripts/apply-sql.mjs` | Script operator | Complete |
| `scripts/lib/clinic-csv.mjs`, `scripts/lib/clinic-map.mjs` | Modul bersama | Complete |
| `scripts/audit-clinic-sheets.mjs`, `scripts/inspect-db-state.mjs`, `scripts/audit-clinic-csv.mjs` | Alat audit | Complete |
| `scripts/generate_f009_update_report_pdf.py` | Generator laporan klien | Complete |
| `docs/product/Laporan_Pembaruan_Sistem_F009.pdf` | Laporan pembaruan klien, 6 halaman | Complete |
| `src/components/ui/DateRangePicker.tsx` | Kontrol periode bersama | Complete |
| `src/components/laporan/BidanReferralPanel.tsx`, `PuskesmasReportPanel.tsx` | Dua tab baru | Complete |
| `src/components/program-khusus/EditCircumcisionModal.tsx`, `CircumcisionList.tsx` | Edit sirkumsisi + antrean data | Complete |
| `src/components/dashboard/DashboardPeriodSelector.tsx`, `src/components/laporan/ReportTabs.tsx`, `ReportFilterBar.tsx`, `ReportPreviewTable.tsx` | Mode Kustom, tab baru, header sticky | Complete |
| `src/app/laporan/page.tsx`, `src/app/page.tsx`, `src/app/program-khusus/page.tsx` | Wiring | Complete |
| `src/constants/clinic.ts`, `src/lib/excel.ts`, `src/lib/utils.ts`, `src/types/database.ts` | Konstanta, ekspor, tipe | Complete |
| `docs/context/state.yaml`, `docs/handoff/current.md`, `docs/specs/_index.md` | Status dan konteks | Complete |

## Exact next step

Kerja developer untuk F-009 sudah selesai. Yang tersisa adalah tindakan klinik:

1. Klinik melengkapi tanggal tindakan dan foto pada 43 baris register sirkumsisi
   (`/program-khusus` -> tab Sunat -> tombol Edit).
2. Klinik memutuskan pemulihan 12 tanggal tindakan dari log kunjungan (`F-009-OPEN-004`).
3. Klinik mengonfirmasi 287 nomor RM tidak beraturan dan nama pasien berisi kode ICD `J00`
   (`F-009-OPEN-002`); rekomendasi developer ada di `state.yaml` dan PDF Bagian 4.2.
4. Klinik memutuskan penggabungan pasien kembar pada register sirkumsisi (`F-009-OPEN-005`).

```bash
# Kalau ada perubahan data baru dari klinik, cukup jalankan ulang:
node scripts/reconcile-clinic-data.mjs --env=.env.production --dry-run   # lihat rencana
node scripts/reconcile-clinic-data.mjs --env=.env.production --confirm-prod-reset
```

## Residual risk

- Verifikasi responsif 360/768/1024 px dan navigasi keyboard pada tab baru dilakukan lewat inspeksi
  kode dan build, belum lewat peramban.
- Dua baris register 3-Eliminasi ditulis ulang setiap kali skrip dijalankan dengan nilai identik.
- `PROJECT_STATE.md` dan `PROGRESS.md` belum punya renderer otomatis; `state.yaml` tetap kanonik.
- Register sirkumsisi memuat nama ganda pada sumbernya. Satu baris punya dua pasien bernama sama dan
  bertanggal lahir identik, satu baris lain punya tiga pasien bernama sama. Baris register hanya
  tercatat pada satu pasien, sehingga pasien kembarnya tidak tercatat pernah sunat.
- Nilai `pekerjaan` berasal dari sumber apa adanya sehingga penulisannya belum seragam.
- `.gitattributes` belum ada, sehingga Git bisa memberi peringatan LF/CRLF pada berkas PDF. Hash blob
  sudah diverifikasi identik dengan berkas kerja, jadi belum ada korupsi.
