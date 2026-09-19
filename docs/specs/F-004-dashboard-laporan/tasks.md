---
id: F-004-TASKS
feature: F-004
status: draft
owner: "Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-004 Dashboard Eksekutif & Ekspor Excel

## Execution Rules

1. Execute one task at a time.
2. Read referenced requirements before editing.
3. Verify type check and lint after each task.
4. Record progress and update checkboxes as each step completes.
5. Strictly adhere to UI/UX Pro Max mobile (360px–640px) and tablet (768px–1024px) responsiveness rules.

---

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

---

## Dependency Map

```text
TASK-001 (Excel Export Utility: src/lib/excel.ts)
    │
    ├──► TASK-002 (Dashboard KPI & Period Selector Components)
    ├──► TASK-003 (TopDiseasesChart & VillageDistributionCard)
    │        │
    │        ▼
    │    TASK-004 (Integrate /page.tsx Executive Dashboard)
    │
    ├──► TASK-005 (Report Center Components: Filter, Tabs, Table)
    │        │
    │        ▼
    └──► TASK-006 (Integrate /laporan/page.tsx & 1-Click Excel Export)
             │
             ▼
         TASK-007 (End-to-End Verification & Quality Gate)
```

---

## Task Checklist

### [x] TASK-001 — Create Client-Side Excel Export Engine
- **Objective:** Create `src/lib/excel.ts` providing export utilities using SheetJS (`xlsx`) for generating well-formatted workbooks (Kunjungan, Arus Kas, Morbiditas ICD-10, and Full Consolidated Workbook) with auto-fit column widths, metadata headers, and numeric cell formatting.
- **Target File:** `src/lib/excel.ts`
- **Requirement References:** FR-006, AC-006.1, AC-006.2, AC-006.3, AC-006.4
- **Design Reference:** Section 5

### [x] TASK-002 — Build Dashboard KPI & Period Selector Components
- **Objective:** Create `src/components/dashboard/DashboardKpiCards.tsx` and `src/components/dashboard/DashboardPeriodSelector.tsx` for displaying 5 responsive executive cards and switching time horizons (Bulan Ini, Bulan Lalu, Tahun Ini, Semua Waktu).
- **Target Files:**
  - `src/components/dashboard/DashboardKpiCards.tsx`
  - `src/components/dashboard/DashboardPeriodSelector.tsx`
- **Requirement References:** FR-001, FR-002, AC-001.1, AC-001.2, AC-002.1, AC-002.2
- **Design Reference:** Section 2, Section 3.1, Section 6

### [x] TASK-003 — Build Visual Analytics Components (ICD-10 & Village Demographics)
- **Objective:** Create `src/components/dashboard/TopDiseasesChart.tsx` (Top 10 ICD-10 morbidity bars) and `src/components/dashboard/VillageDistributionCard.tsx` (patient origin by village) using lightweight, pure Tailwind CSS UI primitives.
- **Target Files:**
  - `src/components/dashboard/TopDiseasesChart.tsx`
  - `src/components/dashboard/VillageDistributionCard.tsx`
- **Requirement References:** FR-003, FR-004, AC-003.1, AC-003.2, AC-003.3, AC-004.1, AC-004.2
- **Design Reference:** Section 2, Section 3.1

### [x] TASK-004 — Integrate Executive Dashboard Main Page
- **Objective:** Refactor `src/app/page.tsx` to connect with live Supabase data (`visits`, `patients`, `cash_flows`), period selectors, skeleton loading states, empty states, and quick actions.
- **Target File:** `src/app/page.tsx`
- **Requirement References:** FR-001 through FR-004, FR-007
- **Design Reference:** Section 2, Section 3.1, Section 6, Section 7

### [x] TASK-005 — Build Unified Report Center Components
- **Objective:** Create `src/components/laporan/ReportFilterBar.tsx`, `src/components/laporan/ReportTabs.tsx`, and `src/components/laporan/ReportPreviewTable.tsx` for filtering by date, patient type, and doctor, tab switching, and displaying paginated previews with summary totals.
- **Target Files:**
  - `src/components/laporan/ReportFilterBar.tsx`
  - `src/components/laporan/ReportTabs.tsx`
  - `src/components/laporan/ReportPreviewTable.tsx`
- **Requirement References:** FR-005, AC-005.1, AC-005.2, AC-005.3, FR-007
- **Design Reference:** Section 2, Section 3.2, Section 6

### [x] TASK-006 — Integrate Report Center & 1-Click Excel Downloader
- **Objective:** Refactor `src/app/laporan/page.tsx` to bind filters with live Supabase queries and connect SheetJS export buttons for single report views and full 3-sheet clinic workbooks.
- **Target File:** `src/app/laporan/page.tsx`
- **Requirement References:** FR-005, FR-006, FR-007
- **Design Reference:** Section 3.2, Section 5, Section 6

### [x] TASK-007 — End-to-End Verification & Quality Gate
- **Objective:** Run static analysis, type checking (`npx tsc --noEmit`), production build (`npm run build`), context validation (`npm run context:validate`), and verify mobile & tablet responsiveness across 360px, 768px, and 1024px+ viewports.
- **Commands:**
  - `npx tsc --noEmit`
  - `npm run build`
  - `npm run context:validate`
- **Requirement References:** All functional and non-functional requirements
