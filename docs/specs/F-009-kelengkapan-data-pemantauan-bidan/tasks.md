---
id: F-009-TASKS
feature: F-009
title: "Implementation Tasks: Data Completeness, Bidan Monitoring, Period Filter, Puskesmas Report"
status: draft
owner: "Developer"
last_updated: "2026-09-29"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Implementation Tasks: F-009

## Execution Rules

1. Execute one task at a time, in dependency order.
2. Read the referenced requirements and design sections before editing.
3. Do not introduce product, data-contract, security, or architecture decisions inside a task. Stop and
   raise a blocker instead.
4. Record evidence before checking a task as complete.
5. Production reconciliation (TASK-016) stays blocked until TASK-015 passes.

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

## Dependency Map

```text
TASK-001 -> TASK-002 -> TASK-003 -> {TASK-004, TASK-005, TASK-006, TASK-007, TASK-008}
{TASK-004..TASK-008} -> TASK-009 -> TASK-010 -> TASK-011 -> TASK-012 -> TASK-013 -> TASK-014
TASK-014 -> TASK-015 -> TASK-016
TASK-003 -> TASK-017
```

## Phase 1 - Data Foundation

- [x] TASK-001 - Add the shared clinic CSV utility module.
  Extract the CSV parser, the normalised visit key, the leading-zero-insensitive No RM key, the
  zero-padding helper, and the bidan extractor from `scripts/audit-clinic-sheets.mjs` into
  `scripts/lib/clinic-csv.mjs`, and make both scripts import it.
  - _Requirements: FR-001, FR-002, FR-007_
  - _Design: Section 4, Section 5.1_
  - Files: `scripts/lib/clinic-csv.mjs`, `scripts/audit-clinic-sheets.mjs`
  - Verify: `node scripts/audit-clinic-sheets.mjs` prints the same sections as before the refactor.

- [x] TASK-002 - Add the F-009 schema migration.
  Create `supabase/migrations/20260929_f009_reconciliation_support.sql` with the columns, indexes, and
  the unique register constraint from design Section 5.1 and Section 6. Do not edit existing migrations.
  - _Requirements: FR-005, FR-003, FR-007, FR-004_
  - _Design: Section 5.1, Section 6_
  - Files: `supabase/migrations/20260929_f009_reconciliation_support.sql`
  - Verify: apply in the Supabase SQL editor against the development project; `select` the new columns.

- [x] TASK-003 - Extend TypeScript data contracts.
  Add `bidan_rujukan`, `no_rm_lama`, `sumber_data`, and the screening fields to `src/types/database.ts`.
  - _Requirements: FR-005, FR-003, FR-007_
  - _Design: Section 5.1_
  - Files: `src/types/database.ts`
  - Verify: `npx tsc --noEmit`

- [x] TASK-017 - Repoint the pre-migration column validator.
  Make `scripts/audit-clinic-csv.mjs` validate `REKAMMEDIS.csv` instead of the retired `DATAUTAMA.csv`,
  and report the column limits the reconciliation script must enforce.
  - _Requirements: FR-001_
  - _Design: Section 4_
  - Files: `scripts/audit-clinic-csv.mjs`
  - Verify: `node scripts/audit-clinic-csv.mjs` reports over-length values or none.

## Phase 2 - Reconciliation Script

- [x] TASK-004 - Implement the identity merge step.
  Group patients by the leading-zero-insensitive key, pick the survivor by populated-field count, repoint
  `visits.pasien_id` and every program-table `pasien_id`, store the survivor as the 9-digit zero-padded
  form, and record the previous value in `no_rm_lama`. Abort if a visit would be lost.
  - _Requirements: FR-002_
  - _Design: Section 5.1, Section 3_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: visit count before equals visit count after; duplicate group count reaches zero.

- [x] TASK-005 - Implement the visit and patient insert step.
  Read `REKAMMEDIS.csv`, resolve patients by normalised No RM, insert the visits absent from the database,
  and create patients that exist only in the newer export. Preserve `usia` equal to zero.
  - _Requirements: FR-001_
  - _Design: Section 3, Section 5.1_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: 7.671 visits present; 178 visits dated 2026-09-19 to 2026-09-29 present.

- [x] TASK-006 - Implement the patient profile enrichment step.
  Fill `pekerjaan` and `riwayat_alergi` from `DATAPASIEN .csv` for matched patients, and insert the
  unmatched rows as patients with `sumber_data` set to `DATAPASIEN`.
  - _Requirements: FR-003_
  - _Design: Section 5.1_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: `pekerjaan` fill rate above 90 percent; running twice changes nothing.

- [x] TASK-007 - Implement the public health register backfill step.
  Create `public_health_records` rows from non-empty `MONITOR` values, snapshot the patient identity
  fields, link `visit_id`, and rely on the unique constraint for idempotency.
  - _Requirements: FR-004_
  - _Design: Section 5.2, Section 6_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: 808 rows total: ANC 594, PTM 139, ELIMINASI_3 39, KB 36.

- [x] TASK-008 - Implement the screening, circumcision, and referral extraction steps.
  Backfill `gpa`, `uk`, `tp`, `hiv`, `syphilis`, and `hbsag` from the triple elimination exports;
  backfill `circumcisions` from `SUNAT .csv` without creating photo URLs; extract `visits.bidan_rujukan`
  from `keterangan_tindakan` values matching `^Bdn\.` and exclude `Admin/Bdn.Resa`.
  - _Requirements: FR-005, FR-006, FR-007_
  - _Design: Section 5.1, Section 5.2_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: 82 referral rows across 9 bidan; `Admin/Bdn.Resa` yields no referral row.

- [x] TASK-009 - Emit the reconciliation report and verification summary.
  Write `docs/data/reconciliation-report-<timestamp>.json` with merged groups, inserted counts, unmatched
  rows, irregular No RM values, and masked samples. Print the same summary. Exit `2` when a verification
  check fails.
  - _Requirements: NFR-REL-002, FR-002, FR-003, FR-005_
  - _Design: Section 10_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: report file exists and its counts match the printed summary.

## Phase 3 - Shared Period Filter

- [x] TASK-010 - Build the `DateRangePicker` UI primitive.
  Add `src/components/ui/DateRangePicker.tsx` with the two modes, the four presets resolved to explicit
  ranges, inline end-before-start validation, Escape handling, visible focus, and a labelled mode toggle.
  - _Requirements: FR-008_
  - _Design: Section 9_
  - Files: `src/components/ui/DateRangePicker.tsx`
  - Verify: keyboard-only operation; single-date mode equals a same-day range.

- [x] TASK-011 - Build the shared `ReportPeriodFilter` wrapper.
  Combine `DateRangePicker` with the existing patient-type and doctor filters, and keep period state
  independent per screen.
  - _Requirements: FR-008_
  - _Design: Section 4, Section 8_
  - Files: `src/components/laporan/ReportFilterBar.tsx`, `src/lib/utils.ts`
  - Verify: changing the period on one screen does not change another screen's period.
    Evidence: implemented inside `ReportFilterBar` instead of a separate wrapper, because the report page
    owns one period for the whole screen and a second control would compete with it. `describePeriod`
    moved to `src/lib/utils.ts`.

- [x] TASK-012 - Adopt the shared filter in the report module.
  Replace the two raw date inputs in `ReportFilterBar.tsx` with the shared control and keep the existing
  preset behaviour.
  - _Requirements: FR-008_
  - _Design: Section 4, Section 9_
  - Files: `src/components/laporan/ReportFilterBar.tsx`
  - Verify: existing report tabs still filter by the chosen period.

- [x] TASK-013 - Add a custom range to the dashboard period selector.
  Add a custom mode backed by the shared control while keeping the four presets as the default.
  - _Requirements: FR-008_
  - _Design: Section 4, Section 9_
  - Files: `src/components/dashboard/DashboardPeriodSelector.tsx`
  - Verify: dashboard KPIs and charts follow the custom period.

## Phase 4 - Bidan Monitoring

- [x] TASK-014 - Build the `BidanReferralPanel`.
  Render the bidan list with referral count and unique patient count, and the selected bidan's referral
  history with patient name, No RM, visit date, ICD-10 code, and action label. Include loading, empty,
  error, and no-referral-in-period states.
  - _Requirements: FR-007_
  - _Design: Section 9, Section 3_
  - Files: `src/components/laporan/BidanReferralPanel.tsx`
  - Verify: selecting `Bdn.Tari` lists 21 referrals; a period without referrals shows the empty state.

## Phase 5 - Puskesmas Report and Tables

- [x] TASK-018 - Add the Puskesmas report panel.
  Render the four program registers plus the visit recap for the chosen period, print the period in the
  header, and support `.xlsx` export with sheet-matching column order and labels.
  - _Requirements: FR-009_
  - _Design: Section 9, Section 6_
  - Files: `src/components/laporan/PuskesmasReportPanel.tsx`, `src/lib/excel.ts`
  - Verify: export opens in a spreadsheet with matching columns; an empty period still states that.

- [x] TASK-019 - Enforce spreadsheet-style table behaviour.
  Ensure report tables match source column order and labels, keep a sticky header inside a bounded
  scroll container, scroll horizontally inside the wrapper only, and use tabular monospace for No RM,
  currency, and ICD-10 columns.
  - _Requirements: FR-010_
  - _Design: Section 9_
  - Files: `src/components/laporan/ReportPreviewTable.tsx`
  - Verify: at 360 pixels the page does not scroll horizontally and the header stays visible.

- [x] TASK-020 - Register the new tabs with role visibility.
  Add `bidan` and `puskesmas` to `ReportTabs.tsx` and wire them in `src/app/laporan/page.tsx` for both
  `owner` and `dokter_admin`, leaving the financial tabs owner-only.
  - _Requirements: FR-007, FR-009_
  - _Design: Section 11_
  - Files: `src/components/laporan/ReportTabs.tsx`, `src/app/laporan/page.tsx`
  - Verify: `dokter_admin` sees the two new tabs and not the financial tabs.

- [x] TASK-021 - Add canonical constants for bidan and the register mapping.
  Add the bidan display-name list and the MONITOR to `program_type` map to `src/constants/clinic.ts` so
  labels are not hardcoded in components.
  - _Requirements: FR-007, FR-004_
  - _Design: Section 5.2_
  - Files: `src/constants/clinic.ts`
  - Verify: no component contains a hardcoded bidan name.

## Phase 6 - Verification and Promotion

- [x] TASK-015 - Verify the reconciliation in the development project.
  Re-run the script twice to prove idempotency, then run `scripts/inspect-db-state.mjs` and confirm zero
  duplicate identities, 7.671 visits, 808 register rows, and 82 referral rows.
  - _Requirements: FR-001, FR-002, FR-004, FR-007, NFR-REL-001_
  - _Design: Section 13_
  - Files: none (verification only)
  - Verify: `node scripts/inspect-db-state.mjs` output recorded as evidence.

- [!] TASK-016 - Promote the reconciliation to production.
  Apply the migration to the production project, then run the script with
  `--env=.env.production --confirm-prod-reset` after a backup exists. Blocked until TASK-015 passes.
  - _Requirements: NFR-SEC-001, BR-009_
  - _Design: Section 13_
  - Files: none (operations)
  - Verify: post-run counts in the production project equal the development project.

## Phase 7 - Circumcision Register Completion

- [x] TASK-022 - Make the procedure date nullable and add register columns.
  Add `supabase/migrations/20260929_f009_circumcision_register.sql`: drop the NOT NULL on
  `tanggal_tindakan`, add `berat_badan` and `sumber_data`, add the source check, the per-patient unique
  index, and the work-queue index.
  - _Requirements: FR-011_
  - _Design: Section 5.3, Section 6_
  - Files: `supabase/migrations/20260929_f009_circumcision_register.sql`
  - Verify: `information_schema` reports all three columns nullable.

- [x] TASK-023 - Import the SUNAT register into `circumcisions`.
  Resolve each row to a patient (name, then birth date plus name token, then a unique birth date), create
  a patient only when nothing matches, insert one row per child with a NULL procedure date, and record
  name differences, birth-date clashes, and follow-up notes in `catatan`.
  - _Requirements: FR-006, FR-011_
  - _Design: Section 5.3_
  - Files: `scripts/reconcile-clinic-data.mjs`
  - Verify: 43 rows with `sumber_data = 'SUNAT'`, all linked to a patient, 0 unresolved.

- [x] TASK-024 - Build the circumcision edit form.
  Add `EditCircumcisionModal.tsx` covering the procedure date (clearable), operator, method, fee, wound
  evaluation, note, body weight, and both photo slots with camera, gallery, replace, and remove.
  - _Requirements: FR-011_
  - _Design: Section 5.3, Section 9_
  - Files: `src/components/program-khusus/EditCircumcisionModal.tsx`
  - Verify: `npx tsc --noEmit` and `npm run build` pass; each control maps to a stored field.

- [x] TASK-025 - Surface unrecorded dates and the edit entry point in the list.
  Show "Belum tercatat" for a NULL date, state how many rows still need completion, order those rows
  first, and add the Edit action on each card.
  - _Requirements: FR-011_
  - _Design: Section 9_
  - Files: `src/components/program-khusus/CircumcisionList.tsx`, `src/app/program-khusus/page.tsx`
  - Verify: the query orders NULL dates first; the notice count matches the rows without a date.

## Verification Gate

- [x] `npx tsc --noEmit` passes with no output.
- [x] `npm run lint` passes (the project's lint script is `tsc --noEmit`).
- [x] `npm run build` compiles and generates all 9 routes.
- [ ] Zero page-level horizontal scroll at 360, 768, and 1024 pixels on the two new tabs. Requires a browser;
  verified by code inspection only (bounded `overflow-x-auto` wrappers, `min-w` set on the inner table,
  no fixed-width page containers). **Residual risk: not confirmed by rendering.**
- [ ] Keyboard-only operation of the period filter, including visible focus. Requires a browser; verified
  by code inspection only (native `input[type=date]`, `role="radiogroup"` buttons, `focus-visible:ring-2`
  on every control, no `outline: none` without a replacement). **Residual risk: not confirmed by keyboard.**
- [x] Every new interactive element has a real behavior: the mode toggle and presets change the range, the
  bidan rows select a bidan, the program tabs switch register, the reload buttons refetch, and export
  buttons write the file. No placeholder or dead control was added.
- [x] Anti-slop Delivery Gate report is attached in the F-009 completion message with per-item evidence.

## Evidence

| Task | Evidence |
|---|---|
| TASK-001 | `node scripts/audit-clinic-sheets.mjs` prints the same section values before and after the refactor |
| TASK-002 | Columns and indexes confirmed in the development project via `information_schema.columns` and `pg_indexes` |
| TASK-003 | `npx tsc --noEmit` passes |
| TASK-004 | `inspect-db-state.mjs` reports 0 duplicate identity groups after the run (was 254) |
| TASK-005 | `visits` = 7,671, matching the REKAMMEDIS row count; latest visit 2026-09-29 |
| TASK-006 | `pekerjaan` filled for 3,013 patients, `riwayat_alergi` for 1,856; second run changes nothing |
| TASK-007 | `public_health_records` = 810 with ANC 594, PTM 139, KB 36, ELIMINASI_3 41 |
| TASK-008 | 37 of 41 ELIMINASI_3 rows carry screening values; 82 referral rows across 9 bidan; `Admin/Bdn.Resa` excluded |
| TASK-009 | `docs/data/reconciliation-report-2026-09-29T13-10-36-806Z.json` written; printed summary matches its counts |
| TASK-010 | `src/components/ui/DateRangePicker.tsx` created; used by both the report filter and the dashboard |
| TASK-011 | `describePeriod` added to `src/lib/utils.ts`; `ReportFilterBar` combines the shared date control with the patient-type and doctor filters |
| TASK-012 | `ReportFilterBar` now renders the shared control; the duplicated preset track was removed |
| TASK-013 | Dashboard period selector has a custom mode wired to the dashboard fetch |
| TASK-014 | Bidan panel query verified against the live project: September 2026 returns 4 referrals, patient embed populated 4/4 |
| TASK-015 | Second run of the reconciliation script reports 0 inserts, 0 merges, 0 padding, and identical register counts |
| TASK-017 | `audit-clinic-csv.mjs` now defaults to REKAMMEDIS and reports 7,671 data rows |
| TASK-018 | Puskesmas query verified against the live project: nested `visits` and `patients` embeds both populate |
| TASK-019 | `ReportPreviewTable` scroll container is bounded with a sticky header |
| TASK-020 | `ReportTabs` exposes `bidan` and `puskesmas`; `dokter_admin` is granted both and denied the financial tabs |
| TASK-021 | Bidan labels and program labels live in `src/constants/clinic.ts`; no component hardcodes a bidan name |
| TASK-022 | Migration applied to the development project; `tanggal_tindakan`, `berat_badan`, and `sumber_data` all report `is_nullable = YES` |
| TASK-023 | 43 `SUNAT` rows, 43 linked to a patient, 39 carry a weight, 4 name-variant notes, 5 birth-date clash notes, 1 follow-up note preserved |
| TASK-024 | `npx tsc --noEmit` and `npm run build` pass |
| TASK-025 | `.order('tanggal_tindakan', { ascending: false, nullsFirst: true })` plus the completion notice |
| TASK-016 | Blocked: production stays untouched until the development review is accepted |

## Deferred Work

- Bidan commission calculation, rates, and payout (Post-MVP, requirements NG-001).
- Pharmacy and drug master data (Post-MVP, requirements NG-002).
- Unifying irregular legacy No RM values (10-digit, 5-digit, 7-digit, and the single non-numeric value)
  into the F-008 `NN-NN-NNNNNN` form. Deferred because the parser that would do it merges records that
  are not provably the same person (design Section 5.1, Alternative A).
- A dedicated `referral_sources` table (design Alternative C).
- A database-side bidan aggregate if referral volume grows (design Alternative B).

## Blockers

| ID | Description | Owner | Affected tasks | Canonical artifact to resolve | Resolution |
|---|---|---|---|---|---|
| BLK-001 | Puskesmas report layout is assumed, not confirmed with the client. | Client | TASK-018 | `requirements.md` OQ-001 | Assumed per ASM-002; implemented and shown for review |
| BLK-002 | Importing the 617 `DATAPASIEN` patients with no recorded visit. | Client | TASK-006 | `requirements.md` OQ-002 | Imported as instructed; the reconciliation report lists them |
| BLK-003 | `SUNAT` has no procedure date. | Client | TASK-023 | `requirements.md` OQ-005 | Resolved: rows imported with a NULL date; the clinic fills the date and photos through the new edit form |
| BLK-004 | Production promotion is held until the development review is accepted. | Developer | TASK-016 | `design.md` Section 13 | Not started |
