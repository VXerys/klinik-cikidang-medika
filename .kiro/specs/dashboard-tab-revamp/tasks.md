# Implementation Tasks — Dashboard Tab UI/UX Revamp

## Phase 1: Header & Period Selector Integration
- [x] **Task 1: Refactor DashboardPeriodSelector into Compact Toolbar Component**
  - Path: `src/components/dashboard/DashboardPeriodSelector.tsx`
  - Convert the component from a wide card block to a compact, inline segmented control with minimal padding and clear active states.
  - Remove redundant standalone labels that cause horizontal wrapping.
  - _Requirements: 1.3, NFR-3, NFR-4_

- [x] **Task 2: Restructure Dashboard Top Header Toolbar**
  - Path: `src/app/page.tsx`
  - Consolidate the header actions: replace the 4 disparate colored buttons with 1 Medical Sapphire primary button (`+ Pasien Baru`) and a grouped secondary shortcut menu.
  - Move `DashboardPeriodSelector` and the refresh trigger directly into the header right cluster.
  - Remove the standalone period card container.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

---

## Phase 2: Surveillance Alert Strip & Executive KPI Cards
- [x] **Task 3: Refactor ClinicalAlertWidget into Slimline Tactile Notification Strip**
  - Path: `src/components/dashboard/ClinicalAlertWidget.tsx`
  - Re-engineer the alert into a compact 1-line strip (`max-height <= 56px` on desktop) with subtle borders, muted alert badges, and a compact right-aligned action link.
  - Implement a discreet quiet state when no alerts exist.
  - _Requirements: 2.1, 2.2, 2.3_

- [x] **Task 4: Elevate DashboardKpiCards to 4+1 Tactile Double-Bezel Architecture**
  - Path: `src/components/dashboard/DashboardKpiCards.tsx`
  - Implement `shadow-card-double` elevation with concentric border radii (`rounded-2xl`).
  - Add inline SVG Area Gradient sparklines with beacon dots on the 4 primary cards.
  - Add percentage delta growth badges (`+8.4%`, `+14.2%`, etc.).
  - Fix subtitle truncation (replace truncated `...` with concise, full descriptions).
  - Enforce `font-mono` tabular numbers on all currency and patient count values.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

---

## Phase 3: Analytics Visualizations & 2-Column Logical Grid
- [x] **Task 5: Overhaul TopDiseasesChart into High-Density Clinical List**
  - Path: `src/components/dashboard/TopDiseasesChart.tsx`
  - Replace thick green bars with Medical Sapphire micro-bars and high-density typography.
  - Render ICD-10 codes in monospaced badge pills (`[K30]`, `[J06.9]`).
  - Align case counts and percentage breakdown neatly to the right.
  - _Requirements: 4.1, NFR-1, NFR-2_

- [x] **Task 6: Refine PaymentDistributionChart with Calibrated Donut & Legend**
  - Path: `src/components/dashboard/PaymentDistributionChart.tsx`
  - Update Recharts Pie colors to Medical Sapphire (`#2563eb`) and BPJS Emerald (`#059669`).
  - Format center metric in JetBrains Mono tabular numbers with clear subtext.
  - Align the legend cards with both transaction counts and formatted IDR totals.
  - _Requirements: 4.2, NFR-1, NFR-4_

- [x] **Task 7: Implement 2-Column Partitioned Layout in DashboardPage**
  - Path: `src/app/page.tsx`, `src/components/dashboard/VisitTrendChart.tsx`, `src/components/dashboard/FinancialTrendChart.tsx`, `src/components/dashboard/VillageDistributionCard.tsx`, `src/components/dashboard/CashLiquidityCard.tsx`
  - Re-order sections into Left Column (Operasional & Klinis) and Right Column (Finansial & Kasir).
  - Apply uniform double-bezel card styling and tactile physics across all child cards.
  - Ensure zero horizontal page overflow and seamless mobile/tablet stacking.
  - _Requirements: 5.1, 5.2, NFR-3_

---

## Phase 4: Quality & Verification Gates
- [x] **Task 8: Static Analysis & TypeScript Verification**
  - Run `npx tsc --noEmit` and confirm 0 errors.
  - Run `npm run lint` and confirm 0 lint warnings.
  - Verify Next.js production build (`npm run build`) succeeds across all 7 routes.
  - Verify WCAG AA contrast on all badge and text tokens.
  - Confirm zero em dashes in UI text.
  - _Requirements: NFR-1, NFR-2, NFR-3, NFR-4_
