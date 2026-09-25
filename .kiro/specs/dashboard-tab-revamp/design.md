# Technical Design — Dashboard Tab Architectural & UI Overhaul

## 1. Architecture & Component Inventory

### Component Delta Matrix

| Component | Path | Status | Primary Changes |
|---|---|---|---|
| `DashboardPage` | `src/app/page.tsx` | Modified | Restructure layout into Integrated Header + Slim Alert + 4+1 KPI + 2-Column Logical Grid (Clinical left, Financial right). Remove standalone period card container. |
| `DashboardPeriodSelector` | `src/components/dashboard/DashboardPeriodSelector.tsx` | Modified | Compact inline segmented control suitable for embedding directly inside the header toolbar. |
| `ClinicalAlertWidget` | `src/components/dashboard/ClinicalAlertWidget.tsx` | Modified | Slimline tactile notification strip (`max-height <= 56px`), restrained tinted borders, compact action CTA. |
| `DashboardKpiCards` | `src/components/dashboard/DashboardKpiCards.tsx` | Modified | Double-bezel tactile cards (`shadow-card-double`), SVG Area Gradient sparklines with beacon dots, delta badges, fix truncated subtitles. |
| `TopDiseasesChart` | `src/components/dashboard/TopDiseasesChart.tsx` | Modified | High-density list with Medical Sapphire micro-bars, monospace ICD-10 code pills, clean disease names. |
| `PaymentDistributionChart`| `src/components/dashboard/PaymentDistributionChart.tsx`| Modified | Calibrated Medical Sapphire & BPJS Emerald donut chart, tabular center metrics, balanced legend with IDR revenue. |
| `VisitTrendChart` | `src/components/dashboard/VisitTrendChart.tsx` | Modified | Harmonized height, double-bezel card styling, cleaner toggle buttons. |
| `FinancialTrendChart` | `src/components/dashboard/FinancialTrendChart.tsx` | Modified | Harmonized height, double-bezel card styling, calibrated area gradients. |
| `VillageDistributionCard` | `src/components/dashboard/VillageDistributionCard.tsx` | Modified | Double-bezel card styling, high-density row layout. |
| `CashLiquidityCard` | `src/components/dashboard/CashLiquidityCard.tsx` | Modified | Double-bezel card styling, clean liquidity badge and cash drawer metrics. |

---

## 2. Layout Structure: Before vs After

### Before Layout (Fragmented & Overloaded)
```text
+-----------------------------------------------------------------------------------+
| Top Header: "Dashboard Eksekutif Klinik" + 4 Huge Mismatched Buttons (Blue/Red/etc) |
+-----------------------------------------------------------------------------------+
| Huge Clinical Warning Banner (Pink/Red dominating top of page)                     |
+-----------------------------------------------------------------------------------+
| Separate Full-Width Card Container for Period Selector (Bulan Ini/Bulan Lalu/etc)  |
+-----------------------------------------------------------------------------------+
| 5 KPI Cards (with truncated texts: "Billing Kasir Pasien Um...")                  |
+-----------------------------------------------------------------------------------+
| Row 1: Visit Trend Chart (left)          | Financial Trend Chart (right)           |
+------------------------------------------+----------------------------------------+
| Row 2: Top 10 Diseases (Bulky green bars)| Payment Donut (Bulky Recharts)         |
+------------------------------------------+----------------------------------------+
| Row 3: Village Demographics              | Cash Liquidity Card                    |
+-----------------------------------------------------------------------------------+
```

### After Layout (Harmonious, High-Density, Logical 2-Column Split)
```text
+-----------------------------------------------------------------------------------+
| Integrated Executive Header:                                                      |
| [Klinik Title + Subtitle]       [Integrated Period Tabs] [Refresh] [+ Pasien Baru] |
+-----------------------------------------------------------------------------------+
| Slimline Tactile Alert Strip (Discreet 1-line notification when attention needed) |
+-----------------------------------------------------------------------------------+
| 4+1 Executive KPI Grid (Concentric Double-Bezel, Sparklines, Delta Badges, Mono): |
| [Total Kunjungan] [Pendapatan Umum] [Kapitasi BPJS] [Total Beban] [Saldo Kas Bersih]|
+-----------------------------------------------------------------------------------+
| 2-Column Clinical vs Financial Analytical Grid:                                   |
|                                          |                                        |
| COLUMN 1: KLINIS & OPERASIONAL (LEFT)    | COLUMN 2: FINANSIAL & KASIR (RIGHT)    |
| 1. Tren Kunjungan Pasien (VisitTrend)    | 1. Tren Arus Kas & Finansial           |
| 2. 10 Morbiditas ICD-10 (High-Density)   | 2. Distribusi Penjamin & Pembayaran    |
| 3. Sebaran Desa Pasien (Demographics)    | 3. Ringkasan Kas & Likuiditas Riil     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Visual Styling Tokens & Specifications

### 1. Header Toolbar Component Structure
- Primary Action:
  ```html
  <Link href="/pendaftaran" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-btn-primary border border-blue-700/80 tactile-btn min-h-[40px]">
    <UserPlus class="w-4 h-4" weight="bold" />
    <span>+ Pasien Baru</span>
  </Link>
  ```
- Secondary Action Menu / Shortcuts:
  Grouped into a single sleek secondary pill dropdown or compact icon cluster (`Program Khusus`, `Buku Kas`, `Laporan`), removing the garish clash of green, red, and blue blocks.

### 2. Area Gradient Sparkline Recipe
Inline SVG area gradient following `component-showcase.html`:
```html
<svg class="w-full h-8" viewBox="0 0 120 32" fill="none" preserveAspectRatio="none">
  <defs>
    <linearGradient id="kpi-spark-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
    </linearGradient>
  </defs>
  <path d="..." fill="url(#kpi-spark-grad)" />
  <path d="..." stroke="#2563eb" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <circle cx="120" cy="8" r="3" fill="#2563eb" />
</svg>
```

### 3. Subtitle Copywriting Table (Zero Ellipsis)
| Metric | Previous Broken Subtitle | New Polished Subtitle |
|---|---|---|
| Total Kunjungan | `121 Pasien Terdaftar` | `Pasien terdaftar aktif` |
| Pendapatan Umum | `Billing Kasir Pasien Um...` | `Kasir poli rawat jalan` |
| Kapitasi BPJS | `Pencairan Klaim FKTP` | `Klaim bulanan FKTP` |
| Total Pengeluaran | `Obat & Operasional Kli...` | `Obat & biaya operasional` |
| Saldo Kas Bersih | `Surplus Arus Kas` | `Surplus arus kas bersih` |

---

## 4. State & Interaction Handling
- **Period Filter Reaction**: Switching periods triggers `fetchDashboardData()` with zero layout jump.
- **Skeleton Shimmer**: While loading, each section renders exact-dimension skeleton blocks with the CSS shimmer effect, preserving zero Cumulative Layout Shift (CLS = 0).
- **Responsive Stacking**: On tablet screens (< 1024px), the 2-column layout gracefully reflows into a single-column flow with consistent 16px (`gap-4`) spacing.
