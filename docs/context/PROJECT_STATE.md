<!-- GENERATED FILE — DO NOT EDIT.
Source: docs/context/state.yaml
Run the repository context sync command after state changes. -->

# Project State

_Context renderer has not been bootstrapped for this derived project._

## Bootstrap required

Ask the repository-integrated coding agent to implement or adapt the context system described in:

- `docs/context/CONTEXT_SYSTEM.md`
- `docs/context/state.yaml`

Until then, verify project state directly from approved specs, Git, and `docs/handoff/current.md`.

<!-- GENERATED:GIT_FACTS:START -->
## Generated Git Facts

- Refreshed at: 2026-09-29T18:15:29.407Z
- Branch: `main`
- HEAD: `bfd5cb2`
- Worktree:

```text
M docs/context/PROJECT_STATE.md
 M docs/context/state.yaml
 M docs/handoff/current.md
 M docs/specs/_index.md
 M scripts/audit-clinic-csv.mjs
 D scripts/migrate_csv_to_supabase.py
 M src/app/laporan/page.tsx
 M src/app/page.tsx
 M src/app/program-khusus/page.tsx
 M src/components/dashboard/DashboardPeriodSelector.tsx
 M src/components/laporan/ReportFilterBar.tsx
 M src/components/laporan/ReportPreviewTable.tsx
 M src/components/laporan/ReportTabs.tsx
 M src/components/program-khusus/CircumcisionList.tsx
 M src/constants/clinic.ts
 M src/lib/excel.ts
 M src/lib/utils.ts
 M src/types/database.ts
?? docs/product/Laporan_Pembaruan_Sistem_F009.pdf
?? docs/specs/F-009-kelengkapan-data-pemantauan-bidan/
?? scripts/apply-sql.mjs
?? scripts/audit-clinic-sheets.mjs
?? scripts/generate_f009_update_report_pdf.py
?? scripts/inspect-db-state.mjs
?? scripts/lib/
?? scripts/reconcile-clinic-data.mjs
?? src/components/laporan/BidanReferralPanel.tsx
?? src/components/laporan/PuskesmasReportPanel.tsx
?? src/components/program-khusus/EditCircumcisionModal.tsx
?? src/components/ui/DateRangePicker.tsx
?? supabase/migrations/20260929_f009_circumcision_register.sql
?? supabase/migrations/20260929_f009_reconciliation_support.sql
```

Recent commits:

- `bfd5cb2` Migrate clinic CSV data into dev and production
- `4b6687c` F-008: add RM format, dual roles, health registers
- `594fbbb` Switch numeric mono font to Inter
- `21ebb23` Match exam card height with queue panel
- `054f447` Align rekam medis panels to same height
<!-- GENERATED:GIT_FACTS:END -->
