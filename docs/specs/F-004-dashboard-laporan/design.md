---
id: F-004-DESIGN
feature: F-004
status: draft
owner: "Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "tasks.md"
  - "docs/architecture/overview.md"
  - "docs/architecture/data-model.md"
---

# Design: F-004 Dashboard Eksekutif & Ekspor Excel

## 1. Design Summary

Modul F-004 mengimplementasikan dua halaman utama: **Dashboard Eksekutif** (`src/app/page.tsx`) dan **Pusat Laporan & Ekspor Excel** (`src/app/laporan/page.tsx`), didukung oleh utilitas ekspor spreadsheet independen (`src/lib/excel.ts`). Seluruh agregasi metrik (omzet, kapitasi, morbiditas ICD-10, demografi desa) diproses langsung dari database PostgreSQL Supabase yang telah terisi 7.493 rekor kunjungan dan 1.486 rekor arus kas historis. Ekspor Excel dilakukan 100% pada sisi klien (*client-side*) menggunakan SheetJS (`xlsx`) sehingga tidak menimbulkan beban komputasi ataupun memori pada server Vercel Free Tier.

---

## 2. Component Hierarchy & File Structure

```text
src/
├── app/
│   ├── page.tsx                           # Executive Dashboard (KPIs, Charts, Quick Actions)
│   └── laporan/
│       └── page.tsx                       # Unified Report Center & Excel Downloader
├── components/
│   └── dashboard/
│       ├── DashboardKpiCards.tsx          # 5 Responsive Executive KPI Cards
│       ├── TopDiseasesChart.tsx           # Top 10 ICD-10 Morbidity distribution bars
│       ├── VillageDistributionCard.tsx   # Top patient origin by village
│       └── DashboardPeriodSelector.tsx    # Period filter tabs (Bulan Ini, Tahun Ini, dll.)
│   └── laporan/
│       ├── ReportFilterBar.tsx            # Date range, patient type, doctor dropdowns
│       ├── ReportTabs.tsx                 # Kunjungan / Arus Kas / Morbiditas tabs
│       └── ReportPreviewTable.tsx         # Responsive preview table with summary footer
└── lib/
    └── excel.ts                           # Client-side SheetJS export engine with auto-fit widths
```

---

## 3. Data Flow Architecture

### 3.1 Dashboard Metric Aggregation Flow (`/`)

```text
User selects Period ("Bulan Ini" / "Semua Waktu")
       │
       ▼
DashboardPage.tsx triggers fetchDashboardData()
       │
       ├──► Supabase: visits table (filtered by tanggal_periksa range)
       │       └── Join: patients (desa, nama, no_rm)
       │
       ├──► Supabase: cash_flows table (filtered by tanggal range)
       │
       ▼
Client-Side High-Speed Aggregator (< 50ms):
       ├─► Total Visits Count & Unique Patients Set
       ├─► Umum Revenue = SUM(biaya_periksa + pendapatan_lain WHERE jenis_pasien = 'UMUM')
       ├─► BPJS Capitation = SUM(nominal WHERE kategori = 'Kapitasi BPJS')
       ├─► Total Expenses = SUM(nominal WHERE jenis = 'Keluar')
       ├─► Net Cash Flow = (Umum + BPJS + Pendapatan Lain) - Total Expenses
       ├─► ICD-10 Morbidity Map: Group by kode_icd10 -> Count -> Top 10 sorted
       └─► Village Distribution Map: Group by patients.desa -> Count -> Top 5 sorted
       │
       ▼
Render DashboardKpiCards, TopDiseasesChart, VillageDistributionCard
```

### 3.2 Report Generation & Excel Export Flow (`/laporan`)

```text
User filters: Date Range (Start - End) + Patient Type + Doctor + Report Type
       │
       ▼
fetchReportData() queries Supabase with parameterized PostgREST filters
       │
       ▼
ReportPreviewTable renders matching records (with pagination & aggregate footer)
       │
       ▼
User clicks "Unduh File Excel (.xlsx)"
       │
       ▼
src/lib/excel.ts creates Workbook via SheetJS:
       ├─► Sheet 1: Rekap Kunjungan (No RM, Nama, Tgl, Dokter, ICD-10, Biaya)
       ├─► Sheet 2: Morbiditas ICD-10 (Kode, Deskripsi, Jumlah Kasus, %)
       └─► Sheet 3: Arus Kas Operasional (Tanggal, Jenis, Kategori, Nominal)
       │
       ▼
Apply Title Headers, Auto-fit Column Widths & Raw Numeric Formatting
       │
       ▼
XLSX.writeFile() triggers immediate browser file download
```

---

## 4. Query Strategies & Performance Optimization

1. **Visits Querying with Selected Fields:**
   Untuk menghindari memuat teks keluhan dan resep obat yang sangat panjang ke dalam dashboard ringkasan, query dashboard hanya mengambil kolom agregasi:
   ```typescript
   const { data: visits } = await supabase
     .from('visits')
     .select('id, tanggal_periksa, jenis_pasien, biaya_periksa, pendapatan_lain, kode_icd10, diagnosa_deskripsi, dokter_id, pasien_id, patients(id, desa)')
     .gte('tanggal_periksa', startDate)
     .lte('tanggal_periksa', endDate);
   ```
2. **Cash Flows Querying:**
   ```typescript
   const { data: flows } = await supabase
     .from('cash_flows')
     .select('id, tanggal, jenis, kategori, nominal, keterangan')
     .gte('tanggal', startDate)
     .lte('tanggal', endDate);
   ```
3. **Indexing Check:**
   Tabel `public.visits` telah memiliki index pada `tanggal_periksa`, `jenis_pasien`, dan `kode_icd10`. Tabel `public.cash_flows` telah memiliki index pada `tanggal` dan `jenis`. Seluruh filter rentang waktu berjalan pada kecepatan sub-50ms di PostgreSQL.

---

## 5. Excel Export Engine Design (`src/lib/excel.ts`)

SheetJS (`xlsx`) menghasilkan workbook standar OpenXML (.xlsx). Desain struktur berkas:

### Header Metadata Structure
- Baris 1: `KLINIK PRATAMA CIKIDANG MEDIKA` (Font tebal)
- Baris 2: Nama Laporan (misal: `LAPORAN REKAPITULASI KUNJUNGAN & KEUANGAN`)
- Baris 3: `Periode: [Tgl Awal] s/d [Tgl Akhir] | Tanggal Cetak: [Tgl Hari Ini]`
- Baris 4: Baris kosong pemisah
- Baris 5: Header Kolom tabel
- Baris 6+: Data baris

### Auto-Fit Column Width Calculation
```typescript
function calculateColWidths(data: (string | number)[][]) {
  const colWidths: { wch: number }[] = [];
  data.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const cellLen = cell ? String(cell).length : 10;
      if (!colWidths[colIdx] || cellLen > colWidths[colIdx].wch) {
        colWidths[colIdx] = { wch: Math.min(Math.max(cellLen + 2, 10), 45) };
      }
    });
  });
  return colWidths;
}
```

### Numeric Preservation
Kolom nominal biaya (`biaya_periksa`, `nominal`) ditulis sebagai tipe number murni (`typeof val === 'number'`), bukan string dengan prefix `"Rp "`, agar pengguna (dr. Ovan / staf) dapat langsung menggunakan rumus `=SUM()` di Microsoft Excel tanpa error `#VALUE!`.

---

## 6. Mobile & Tablet Responsiveness Architecture

1. **Dashboard KPI Cards (`DashboardKpiCards.tsx`):**
   - Mobile (360px–640px): `grid-cols-1 sm:grid-cols-2`
   - Tablet (768px–1024px): `grid-cols-2 lg:grid-cols-3`
   - Desktop (1024px+): `grid-cols-5` (atau 4 kartu utama + 1 kartu saldo bersih)
2. **2-Column Analytics Breakdown:**
   - Mobile: `grid-cols-1 gap-4` (grafik 10 besar penyakit menumpuk vertikal di atas demografi desa)
   - Desktop: `grid-cols-1 lg:grid-cols-2 gap-6`
3. **Report Preview Table (`ReportPreviewTable.tsx`):**
   - Dibungkus dalam kontainer `overflow-x-auto w-full` dengan scrollbar halus.
   - Header tabel `whitespace-nowrap select-none`.
   - Tombol pagination dan ekspor memiliki target sentuh minimum 44×44px (`min-h-[44px]`).

---

## 7. Error Handling & State Resilience

- **Loading State:** Menggunakan skeleton shimmer berdimensi identik dengan kartu metrik untuk mencegah *cumulative layout shift* (CLS).
- **Empty State:** Jika periode yang dipilih tidak memiliki transaksi (misal: filter tanggal masa depan), sistem menampilkan kartu informatif: `"Tidak ada data kunjungan pada periode ini"` dengan saran kembali ke opsi *"Semua Data"*.
- **Offline / Network Error:** Menangkap galat Supabase dan menampilkan banner alert warna merah muda lembut dengan tombol ulangi (*Retry*).
