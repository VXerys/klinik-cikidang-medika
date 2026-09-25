# Technical & Visual Design — Pusat Laporan & Ekspor Excel Tab UI/UX Revamp

## 1. Visual Hierarchy & Architecture

```text
src/app/laporan/page.tsx
├── 1. Master Report Header & Export Action Ribbon
│    ├── Title, Subtitle & Engine Status Badge
│    ├── Reload Button (Tactile)
│    ├── Primary Export Button (Active Tab .xlsx)
│    └── Full Workbook Export Button (3-Sheet .xlsx)
│
├── 2. Report Summary KPI Cards (src/components/laporan/ReportKpis.tsx)
│    ├── Card 1: Volume Kunjungan & Pasien (Umum vs BPJS breakdown)
│    ├── Card 2: Akumulasi Billing Kasir (Poli + Pendapatan Lain)
│    └── Card 3: Arus Kas Bersih (Masuk vs Keluar + Net Surplus/Defisit)
│
├── 3. Filter Parameter Laporan Card (src/components/laporan/ReportFilterBar.tsx)
│    ├── Header: "Filter Parameter Laporan" + Recessed Segmented Preset Track
│    ├── Grid 4-Column Inputs:
│    │    ├── Tanggal Mulai (Date)
│    │    ├── Tanggal Selesai (Date)
│    │    ├── Custom Popover Select: Jenis Pasien (Semua / UMUM / BPJS)
│    │    └── Custom Popover Select: Dokter Pemeriksa
│    └── Action Row: Reset Filter (Secondary) & Terapkan Filter (Primary)
│
├── 4. Recessed Track Segmented Sub-Tab Switcher (src/components/laporan/ReportTabs.tsx)
│    ├── Tab 1: Rekap Kunjungan Pasien [Count Badge]
│    ├── Tab 2: 10 Besar Penyakit (ICD-10) [Count Badge]
│    └── Tab 3: Arus Kas Operasional [Count Badge]
│
└── 5. Consolidated Preview Table (src/components/laporan/ReportPreviewTable.tsx)
     ├── Top Toolbar: Universal Search Input + Page Size Selector (15/25/50/100)
     ├── Responsive Table Matrix:
     │    ├── Sticky Column Headers with [11px] uppercase tracking
     │    ├── Cell formatters (No. RM badge, ICD-10 badge, Jenis Pasien badge)
     │    └── Tabular JetBrains Mono Currency Alignment
     └── Footer Summary & Pagination:
          ├── Live Metric Chips (Total Baris, Umum, BPJS, Billing / Net Cash)
          └── Tactile Page Stepper Controls
```

---

## 2. Design Tokens & Styling Harmonization

| Token | Class Definition | Usage |
|---|---|---|
| **Card Container** | `bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card` | Filter Card, KPI Cards, Table Container |
| **Primary Action Button** | `bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-btn-primary border border-blue-700/80 rounded-xl px-3.5 py-2 min-h-[38px] text-xs font-bold tactile-btn transition` | Unduh Tab Ini, Terapkan Filter |
| **Emerald Workbook Button** | `bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-btn-primary border border-emerald-700/80 rounded-xl px-3.5 py-2 min-h-[38px] text-xs font-bold tactile-btn transition` | Unduh Rekap Lengkap (3 Sheet) |
| **Secondary Button** | `bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2 min-h-[38px] text-xs font-bold shadow-btn-secondary tactile-btn transition` | Reset Filter, Pagination Steppers |
| **Segmented Track Container** | `bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs` | Preset Filter Selector & Report Sub-Tabs |
| **Active Segmented Item** | `bg-white text-blue-700 font-bold shadow-xs border border-slate-200/70 rounded-lg text-xs` | Active tab & active period preset |
| **Inactive Segmented Item** | `text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-semibold` | Inactive tab & period preset |
| **Patient No. RM Badge** | `font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg` | Patient identifiers in table rows |
| **ICD-10 Badge** | `font-mono text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded-md` | Disease code representation |
| **Tabular Numbers** | `font-mono font-bold text-slate-900 text-xs` | Currency, transaction totals, row counts |

---

## 3. Responsive Layout Strategy

- **Mobile (< 640px)**:
  - Header actions stack gracefully (Reload button + Download buttons full width with min 44px tap area).
  - KPI cards stack 1 column with full-width clarity.
  - Filter card inputs stack 1 column with large, tactile touch targets.
  - Sub-tab switcher stacks or scrolls horizontally with recessed track.
  - Preview table wrapped in `overflow-x-auto` to prevent horizontal page break.
- **Tablet (640px–1024px)**:
  - Filter parameters form a clean 2x2 grid.
  - Sub-tabs show 3 equal columns with count badges.
  - Table shows full row data with compact column spacing.
- **Desktop (1024px+)**:
  - Full horizontal header action ribbon.
  - 4-column filter grid with instant dropdown popovers.
  - Generous table padding with sticky header rows and comprehensive summary footer.
