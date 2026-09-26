# Implementation Tasks — Pusat Laporan & Ekspor Excel Tab UI/UX Revamp

- [x] **Task 1: Build Executive Report Summary KPI Component** `src/components/laporan/ReportKpis.tsx`
  - Implement 3 tactile double-bezel cards: `Volume Kunjungan & Pasien`, `Akumulasi Billing Kasir`, and `Arus Kas Bersih (Net Cash Flow)`.
  - Add SVG Area Gradient sparklines with active beacon dots matching Dashboard KPI standard.
  - Compute dynamic stats from the active filtered report data without additional database roundtrips.
  - _Requirements: FR-2.1, FR-2.2, FR-2.3, NFR-1_

- [x] **Task 2: Revamp Filter Parameter Laporan Component** `src/components/laporan/ReportFilterBar.tsx`
  - Reconstruct card container with `p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card`.
  - Embed recessed-track preset selector (`Bulan Ini`, `Bulan Lalu`, `Tahun 2026`, `Semua Data`) in the card header.
  - Replace native browser `<select>` dropdowns with custom floating popover selects for `Jenis Pasien` and `Dokter Pemeriksa`.
  - Format `Tanggal Mulai` and `Tanggal Selesai` modern date inputs.
  - Refactor filter action buttons (`Reset Filter` secondary + `Terapkan Filter` primary).
  - _Requirements: FR-3.1, FR-3.2, FR-3.3, FR-3.4, NFR-1_

- [x] **Task 3: Revamp Segmented Sub-Tab Switcher** `src/components/laporan/ReportTabs.tsx`
  - Rebuild sub-tabs using an executive recessed track segmented control (`bg-slate-100/90 p-1 rounded-xl shadow-2xs`).
  - Style active tab with elevated white card (`bg-white text-blue-700 font-bold shadow-xs border border-slate-200/70`).
  - Add JetBrains Mono count badges (`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md`).
  - _Requirements: FR-4.1, FR-4.2, FR-4.3, NFR-1_

- [x] **Task 4: Revamp Report Preview Table Component** `src/components/laporan/ReportPreviewTable.tsx`
  - Reconstruct table wrapper with double-bezel styling and smooth overflow scroll boundaries.
  - Upgrade table toolbar with sleek search input and page-size selector dropdown.
  - Apply strict typography tokens: `text-[11px] uppercase tracking-wider` for headers, `font-mono text-[11px]` for No. RM, ICD-10, and dates.
  - Apply tabular numbers for billing and cash flow values with proper green/rose indicators.
  - Refactor footer summary banner with live metric chips and tactile pagination buttons.
  - _Requirements: FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, NFR-1_

- [x] **Task 5: Revamp Master Page Header & Action Ribbon** `src/app/laporan/page.tsx`
  - Reconstruct top page header with Medical Sapphire branding, subtitle, and engine status badge.
  - Implement tactile action ribbon with reload button and dual download buttons (`Unduh Tab Ini` primary blue, `Unduh Rekap Lengkap` emerald gradient).
  - Integrate `ReportKpis.tsx` above filter and table preview.
  - Ensure zero layout shift and smooth crossfade transitions.
  - _Requirements: FR-1.1, FR-1.2, FR-1.3, NFR-1, NFR-3_

- [x] **Task 6: Verification & Anti-Slop Audit**
  - Verify strict zero em dashes (`—`), WCAG AA contrast, and 100% Plus Jakarta Sans + JetBrains Mono typography.
  - Verify mobile & tablet responsiveness (min 44px touch targets on mobile, no horizontal page break).
  - Ensure client-side Excel export works seamlessly with SheetJS.
  - _Requirements: All, NFR-2, NFR-3, NFR-4_
