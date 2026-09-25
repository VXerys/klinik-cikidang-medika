# Requirements Specification — Dashboard Tab UI/UX Revamp

## 1. Executive Summary & Problem Context
The current dashboard of SIM Klinik Pratama Cikidang Medika exhibits severe visual clutter, uncalibrated visual hierarchy, oversized mismatched action buttons, truncated KPI labels (`Billing Kasir Pasien Um...`), and bulky charts with crude green progress bars. 

This specification defines the complete structural and visual overhaul of the **Dashboard Tab** (`src/app/page.tsx`), aligning it with the established Design System Source of Truth (`docs/design-system/01-DESIGN-FOUNDATION.md`, `02-COMPONENT-SPECIFICATIONS.md`, `component-showcase.html`).

---

## 2. RFC 2119 Acceptance Criteria

### Requirement 1: Integrated Executive Header & Period Filtering
- **1.1 Header Simplification**: The top header SHALL feature a single primary action button (`+ Pasien Baru / Kasir`) styled in Medical Sapphire gradient (`from-blue-600 to-blue-700`) with double-bezel tactile elevation.
- **1.2 Secondary Action Grouping**: The secondary shortcuts (`Program Khusus`, `Buku Kas`, `Laporan & Excel`) SHALL NOT render as competing oversized colored blocks; instead, they SHALL be grouped into compact, harmonious secondary action buttons or an icon group.
- **1.3 Period Selector Integration**: The `DashboardPeriodSelector` SHALL be integrated directly into the right side of the header toolbar. The redundant standalone card container spanning 100% width SHALL be removed to save vertical viewport real estate.
- **1.4 Live Refresh & Clock**: The live refresh trigger button and the Indonesian local time badge SHALL remain accessible in the header without shifting layout on trigger.

### Requirement 2: Slim Tactile Clinical Surveillance Alert Strip
- **2.1 Compact Height**: When active clinical warnings exist (e.g., TBC defaulters, overdue post-care), the `ClinicalAlertWidget` SHALL render as a slim, 1-line tactile notification strip (`max-height <= 56px` on desktop) rather than a bulky full-page banner.
- **2.2 Visual Restraint**: The alert strip SHALL use subtle tinted backgrounds (`bg-rose-50/80` or `bg-amber-50/80`) with crisp borders (`border-rose-200`) and a compact link button (`Tindak Lanjuti`) that preserves executive focus on core clinic metrics.
- **2.3 Zero-Alert Quiet State**: WHEN all special program patients are on schedule (`hasUrgentAlert === false`), the widget SHALL render a discreet, peaceful badge strip or remain collapsed to avoid visual noise.

### Requirement 3: 4+1 Tactile Executive KPI Cards
- **3.1 Double-Bezel Card Anatomy**: Each KPI card SHALL utilize concentric border radii (`rounded-2xl` inside `rounded-3xl` containers), subtle multi-layered elevation (`shadow-card-double`), and tactile hover physics (`transform: translateY(-2px)`).
- **3.2 Area Gradient Sparklines**: The primary metrics (`Total Kunjungan`, `Pendapatan Umum`, `Kapitasi BPJS`, `Total Pengeluaran`) SHALL include SVG Area Gradient sparklines with animated beacon dots at the latest point, matching the design system standard.
- **3.3 Percentage Delta Badges**: Each metric card SHALL display a calculated or contextual growth delta badge (e.g., `+14.2% vs bln lalu`) with appropriate semantic coloring (`emerald-700` for surplus/growth, `rose-700` for adverse variance).
- **3.4 Subtitle Copywriting & Zero Ellipsis**: Text truncation on subtitles (such as `Billing Kasir Pasien Um...` and `Obat & Operasional Kli...`) SHALL be eliminated. All subtitles SHALL use concise, professional Indonesian copy that fits comfortably without truncation.
- **3.5 Tabular Monospace Currency**: All monetary figures SHALL be rendered using JetBrains Mono (`font-mono`) with `Rp` prefix and Indonesian dot thousand separators.

### Requirement 4: High-Density Morbidity List & Refined Donut Chart
- **4.1 High-Density ICD-10 List**: The `TopDiseasesChart` component SHALL replace the clumsy full-width green progress bars with a high-density clinical list featuring:
  - JetBrains Mono ICD-10 code pill badges (`[K30]`, `[J06.9]`).
  - Clean diagnosis names formatted without bracket clutter.
  - Micro proportion indicator bars in Medical Sapphire gradient.
  - Case count badge and proportion percentage.
- **4.2 Calibrated Donut Visuals**: The `PaymentDistributionChart` Recharts Donut chart SHALL:
  - Standardize on calibrated Medical Sapphire (`#2563eb`) and BPJS Emerald (`#059669`) colors.
  - Display centered total patient/transaction count in tabular monospace.
  - Provide a compact toggle pill (`Penjamin` vs `Metode Bayar`) without layout shift.
  - Include an aligned legend showing both counts and total Rupiah contributions.

### Requirement 5: Logical 2-Column Dashboard Layout
- **5.1 Column Partitioning**: Below the KPI cards, the dashboard SHALL be organized into a 2-column grid (`grid-cols-1 xl:grid-cols-2 gap-6`):
  - **Left Column (Operasional & Klinis)**:
    1. Tren Kunjungan Pasien (`VisitTrendChart`)
    2. 10 Penyakit Terbanyak ICD-10 (`TopDiseasesChart`)
    3. Sebaran Wilayah / Desa Pasien (`VillageDistributionCard`)
  - **Right Column (Finansial & Kasir)**:
    1. Tren Arus Kas & Finansial (`FinancialTrendChart`)
    2. Distribusi Penjamin & Pembayaran (`PaymentDistributionChart`)
    3. Ringkasan Arus Kas & Likuiditas Riil (`CashLiquidityCard`)
- **5.2 Responsive Reflow**: ON mobile devices (< 768px), the layout SHALL seamlessly stack into a single column with minimum 44px tap targets and zero horizontal scroll.

---

## 3. Non-Functional Requirements & Governance

- **NFR-1 (Typography)**: Heading, body, and labels SHALL use **Plus Jakarta Sans**. Numerical metrics, ICD-10 codes, and currency SHALL use **JetBrains Mono**.
- **NFR-2 (No Em Dashes)**: In compliance with anti-slop rules, no em dashes (`—`) SHALL be used in UI text. Standard colons, dots (`•`), or parentheses SHALL be used.
- **NFR-3 (Motion Physics)**: Tactile buttons SHALL use `transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1)` and `active:scale-[0.96]`. Transitions SHALL NOT use `transition: all`.
- **NFR-4 (Accessibility)**: All interactive elements SHALL have visible focus indicators (`focus-visible:ring-2 focus-visible:ring-blue-600`) and meet WCAG AA contrast (minimum 4.5:1 for body text, 3:1 for large text).

---

## 4. Out of Scope
- Modifying backend PostgreSQL database schema or Supabase RPC procedures.
- Adding third-party chart libraries outside of existing `recharts` and inline SVG.
- Altering operational routes (`/pendaftaran`, `/rekam-medis`, `/buku-kas`, `/laporan`).
