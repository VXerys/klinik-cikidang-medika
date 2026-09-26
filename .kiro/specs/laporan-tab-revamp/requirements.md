# Requirements Specification — Pusat Laporan & Ekspor Excel Tab UI/UX Revamp

## 1. Executive Summary & Objective

The "Pusat Laporan & Ekspor Excel" (`/laporan`) module serves as the primary consolidation engine for executive reporting, clinical morbidities (ICD-10), and financial balance summaries. It generates single-sheet and multi-sheet `.xlsx` workbooks for clinic owners (dr. Ovan & dr. Neneng) and accountants.

The objective of this revamp is to align the entire `/laporan` interface with the canonical design system (`docs/design-system/`) and ensure 100% visual, typographic, and physical consistency with the Dashboard Utama (`/`) and Program Khusus (`/program-khusus`).

---

## 2. Functional Requirements (FR)

### FR-1: Top Header & Dual Export Action Ribbon
- **FR-1.1**: The page header SHALL feature a standardized title (`Pusat Laporan & Ekspor Excel`), a contextual subtitle, and an engine status badge (`SheetJS XLSX Engine`).
- **FR-1.2**: The action toolbar SHALL provide an instant reload button (`ArrowClockwise`) with tactile feedback and animated spinning state during queries.
- **FR-1.3**: The toolbar SHALL provide two primary download triggers:
  1. `Unduh Tab Ini (.xlsx)`: Exports the active tab's dataset with `shadow-btn-primary` (Blue).
  2. `Unduh Rekap Lengkap (3 Sheet)`: Exports a consolidated 3-sheet workbook (`Kunjungan`, `Morbiditas`, `Buku Kas`) with emerald gradient styling (`bg-gradient-to-b from-emerald-600 to-emerald-700` and `shadow-btn-primary border-emerald-700/80`).

### FR-2: Executive Report Summary KPI Row (`ReportKpis.tsx`)
- **FR-2.1**: The module SHALL display a compact, high-density 3-card summary KPI row above the table preview.
- **FR-2.2**: The 3 cards SHALL compute dynamically from the active filtered dataset:
  1. **Volume Kunjungan & Pasien**: Total visits, count and ratio of UMUM vs BPJS.
  2. **Akumulasi Billing Kasir**: Total examination fees (`biaya_periksa`) + other revenues (`pendapatan_lain`).
  3. **Arus Kas Bersih (Net Cash Flow)**: Total cash in (`Masuk`) vs total cash out (`Keluar`) with surplus/defisit badges.
- **FR-2.3**: KPI cards SHALL consume the exact Dashboard double-bezel container (`rounded-2xl border border-slate-200/90 shadow-card-double tactile-card`) and fluid JetBrains Mono typography.

### FR-3: Filter Parameter Laporan (`ReportFilterBar.tsx`)
- **FR-3.1**: The filter card header SHALL integrate a recessed-track preset selector (`bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs`) offering: `Bulan Ini`, `Bulan Lalu`, `Tahun 2026`, and `Semua Data`.
- **FR-3.2**: Form fields SHALL be organized in a 4-column responsive layout (1 column mobile, 2 tablet, 4 desktop):
  - Field 1: Tanggal Mulai (Date picker with calendar icon).
  - Field 2: Tanggal Selesai (Date picker with calendar icon).
  - Field 3: Jenis Pasien (Custom floating popover select with options: Semua Pasien, Pasien UMUM, Pasien BPJS Kesehatan).
  - Field 4: Dokter Pemeriksa (Custom floating popover select with options: Semua Dokter, and active doctors).
- **FR-3.3**: Native browser `<select>` dropdowns SHALL NOT be used.
- **FR-3.4**: Filter action row SHALL present tactile buttons: `Reset Filter` (`shadow-btn-secondary`) and `Terapkan Filter` (`shadow-btn-primary`).

### FR-4: Segmented Sub-Tab Switcher (`ReportTabs.tsx`)
- **FR-4.1**: The sub-tab control SHALL use a recessed track segmented container (`bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs`).
- **FR-4.2**: The active tab SHALL feature an elevated white card (`bg-white text-blue-700 font-bold shadow-xs border border-slate-200/70`).
- **FR-4.3**: Each tab SHALL display an icon (`Users`, `Heartbeat`, `Wallet`), label, and count badge formatted with JetBrains Mono (`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md`).

### FR-5: Enhanced Preview Table (`ReportPreviewTable.tsx`)
- **FR-5.1**: The table wrapper SHALL utilize `rounded-2xl border border-slate-200/90 shadow-card-double overflow-hidden`.
- **FR-5.2**: The table toolbar SHALL provide a live search input with clear button and a sleek page-size selector (`15`, `25`, `50`, `100` rows).
- **FR-5.3**: Table headers SHALL feature `text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/90 py-3.5 px-3.5`.
- **FR-5.4**: Table data rows SHALL strictly format:
  - No. RM: `font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg`.
  - ICD-10: `font-mono text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded-md`.
  - Monetary values: `font-mono font-bold text-slate-900 text-xs text-right` with `Rp` prefix.
  - Dates: `font-mono text-[11px] text-slate-500`.
- **FR-5.5**: Table footer SHALL feature a dynamic summary banner with pill chips and tactile pagination buttons (`CaretLeft`, `CaretRight`).

---

## 3. Non-Functional Requirements (NFR)

- **NFR-1 (Design Consistency)**: All tokens (colors, typography, shadows, borders, radiuses) MUST strictly match the Dashboard Utama and `docs/design-system/01-DESIGN-FOUNDATION.md`.
- **NFR-2 (Anti-Slop Strict Enforcement)**: No generic AI gradients, no placeholder text, zero em dashes (`—`) in UI copy, and WCAG AA contrast for all text.
- **NFR-3 (Mobile & Tablet Responsiveness)**: The layout MUST Reflow seamlessly across viewports:
  - Mobile (360px–640px): Stacked filter inputs, horizontal scrolling table with internal wrapper, full-width touch targets (minimum 44×44px).
  - Tablet (768px–1024px): 2-column filter grid, segmented tabs, full table visibility.
  - Desktop (1024px+): 4-column filter grid, dual action ribbon.
- **NFR-4 (Performance & Client-Side Excel Export)**: Excel workbook creation via `xlsx` library MUST complete in under 500ms without freezing the UI thread, utilizing auto-calculated column widths and formatted currency numbers.
