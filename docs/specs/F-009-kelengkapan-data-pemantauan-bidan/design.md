---
id: F-009-DESIGN
feature: F-009
title: "Design: Data Completeness, Bidan Referral Monitoring, Period Filter, and Puskesmas Report"
status: draft
owner: "Developer / Klinik Cikidang Medika"
last_updated: "2026-09-29"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "../../architecture/overview.md"
---

# Design: F-009 Data Completeness, Bidan Referral Monitoring, Period Filter, and Puskesmas Report

> This document maps the approved requirements into the real repository. It does not repeat
> architecture owned by `docs/architecture/overview.md`.

## 1. Design Summary

F-009 has two halves that deliberately do not touch each other.

The data half is **script-first, verify-then-promote**. Reconciliation is an operator-invoked Node
script, not an application screen. It reuses the existing safety pattern in
`scripts/migrate-data.mjs`: credentials come from an env file, the target project is derived from the
URL, the development project needs `--confirm-dev-reset`, and the production project needs
`--env=.env.production --confirm-prod-reset` plus a ten second cancel window. The script writes a
machine-readable report so every merge and insertion is auditable before production is touched.

The UI half is **read-only against reconciled data plus one new column**. Bidan monitoring, the period
filter, the Puskesmas report, and the spreadsheet-style tables are presentation concerns over data that
already exists or that reconciliation has just written. No new application write path is introduced
except the existing program-registry forms.

Architecture inputs:

- `AGENTS.md` sections 4 (dependency direction), 5 (directory responsibilities), 9 (database rules),
  10 (security rules), 14 (prohibited actions).
- `docs/architecture/overview.md` for the storage adapter and client factory boundaries.
- Related ADRs: none.

Design Read for the UI half: an internal clinic application for clinic staff and the owner, in a clean
clinical-teal utilitarian language, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**. Direction is the existing
system in `src/constants/theme.ts` and the established component vocabulary
(`shadow-card-double`, `tactile-card`, `tactile-btn`), not a new visual language.

## 2. Existing Context

Relevant modules:

- `scripts/migrate-data.mjs`: current destructive-but-safe migration with the confirmation guards. It
  reads `DASHBOARD - DATAUTAMA.csv` and maps patient columns by index.
- `scripts/audit-clinic-sheets.mjs`: read-only audit of the 19 Sheets exports. It already implements
  the CSV parser, the visit key, the derived-report verification, and the bidan extraction used by the
  reconciliation checks.
- `scripts/inspect-db-state.mjs`: read-only database snapshot, including leading-zero duplicate
  detection by normalized No RM.
- `src/components/laporan/ReportFilterBar.tsx`: the existing report period filter. It already supports a
  start date, an end date, a patient-type filter, a doctor filter, and four presets. Its date fields and
  preset track are replaced by the shared control so the presets are not duplicated.
- `src/components/dashboard/DashboardPeriodSelector.tsx`: four fixed presets, no custom range.
- `src/components/laporan/ReportTabs.tsx`: role-aware tabs. `komisi` is owner-only today.
- `src/components/laporan/ReferralCommissionPanel.tsx`: manual commission ledger. Untouched by F-009.
- `src/lib/excel.ts`: SheetJS export helpers.
- `src/components/laporan/ReportPreviewTable.tsx`: report table with a text search filter.
- `src/constants/clinic.ts`: `DESA_OPTIONS` and `DESA_RM_CODE`.
- `supabase/migrations/`: append-only DDL.

Patterns to preserve:

- One reusable `ui/` primitive per control. New controls go to `src/components/ui/`.
- Money as `NUMERIC(15,2)`, displayed through `formatRupiah`.
- Errors surfaced in Bahasa Indonesia with `sonner` toasts.
- `revalidatePath()` after mutations; no external cache layer.
- Tables and forms must not overflow the page on mobile.

Constraints:

- `docs/data/` is gitignored and contains PII; generated reports must not be committed.
- Applied migrations are never edited.
- No new dependency is introduced for this feature. `xlsx` already covers export.

Architecture invariants that implementation must preserve:

- All database access goes through the Supabase client SDK.
- The service-role key is used only by operator scripts, never by client code.
- Every table holding patient or financial data keeps Row Level Security enabled.

## 3. Proposed Implementation Flow

Reconciliation (operator-invoked, no UI):

```text
operator
  -> node scripts/reconcile-clinic-data.mjs --confirm-dev-reset
  -> read env file + guard target project
  -> backup program tables and existing patient/visit counts
  -> parse REKAMMEDIS.csv and DATAPASIEN.csv
  -> build patient identity groups by leading-zero-insensitive key
  -> merge duplicate patients (repoint visits and program rows)
  -> insert the 178 visits and 77 patients missing from the previous export
  -> enrich pekerjaan / riwayat_alergi from DATAPASIEN.csv
  -> backfill public_health_records from the MONITOR column
  -> backfill triple-elimination screening fields
  -> backfill circumcisions from SUNAT.csv
  -> extract visits.bidan_rujukan from keterangan_tindakan
  -> write docs/data/reconciliation-report-<timestamp>.json
  -> print a verification summary (counts, duplicates, unmatched rows)
```

Bidan referral read path (UI):

```text
/laporan (tab "Pemantauan Rujukan Bidan")
  -> ReportPeriodFilter (shared component)
  -> supabase.from('visits').select(...).not('bidan_rujukan','is',null).gte/lte
  -> aggregate per bidan in the client (82 rows at current volume)
  -> render bidan list
  -> select one bidan -> render that bidan's referral rows in ReportPreviewTable style
```

Sequence:

1. Read the env file and resolve the target project. Abort when the confirmation flag does not match
   the target class.
2. Back up dependent program tables and record pre-run counts.
3. Parse sources; abort and name the file when an input is missing.
4. Reconcile identity, then insert missing rows, then backfill derived data, then extract referrals.
5. Write the report and print the summary. Never report success when a step aborted.

## 4. Component Changes

| Component or path | Change | Responsibility |
|---|---|---|
| `scripts/reconcile-clinic-data.mjs` | Create | Script-first reconciliation with guards, backup, and report |
| `scripts/lib/clinic-csv.mjs` | Create | Shared CSV parsing, visit-key, and identity canonicalisation used by scripts |
| `supabase/migrations/20260929_f009_reconciliation_support.sql` | Create | New columns, indexes, and uniqueness guarantees |
| `supabase/migrations/20260929_f009_circumcision_register.sql` | Create | Makes the procedure date nullable, adds body weight and source columns, and adds the register indexes |
| `src/components/program-khusus/EditCircumcisionModal.tsx` | Create | Full edit of a circumcision record, including both medical photo slots |
| `src/components/program-khusus/CircumcisionList.tsx` | Modify | Edit entry point, unrecorded-date rendering, and the completion count |
| `src/types/database.ts` | Modify | Add `bidan_rujukan`, `no_rm_lama`, `sumber_data`, screening fields |
| `src/components/ui/DateRangePicker.tsx` | Create | Single date or inclusive range, keyboard operability, presets |
| `src/lib/utils.ts` | Modify | Add `describePeriod`, the shared period label used by the report header and the bidan panel |
| `src/components/laporan/BidanReferralPanel.tsx` | Create | Bidan list plus that bidan's referral history |
| `src/components/laporan/PuskesmasReportPanel.tsx` | Create | Program registers plus visit recap for a chosen period |
| `src/components/laporan/ReportTabs.tsx` | Modify | Add `bidan` and `puskesmas` tabs with role visibility |
| `src/components/laporan/ReportFilterBar.tsx` | Modify | Replace the two raw date inputs with `DateRangePicker` |
| `src/components/dashboard/DashboardPeriodSelector.tsx` | Modify | Add a custom-range mode backed by `DateRangePicker` |
| `src/app/laporan/page.tsx` | Modify | Wire the two new tabs and the shared period state |
| `src/lib/excel.ts` | Modify | Add the Puskesmas register export writers |
| `src/constants/clinic.ts` | Modify | Add the canonical bidan name list and the MONITOR to program map |
| `scripts/audit-clinic-csv.mjs` | Modify | Point the pre-migration column validator at `REKAMMEDIS.csv` |

Marked uncertain: the exact column order of the Puskesmas export depends on OQ-001. Implementation
reads the order from `LAPORAN DPP DR. ADE SOFYAN - PTM.csv` and `... - KB.csv`, which are available and
unambiguous for those two registers.

## 5. Data Model Implementation

### 5.1 Patient identity canonicalisation

The Sheets export wrote one person under several strings (`20200002`, `020200002`, `0102939`). A
gender-and-village informed parser was prototyped against the live development project and rejected as
the merge rule: it produced 93 unreadable rows and 412 merged rows, meaning it would merge records that
are not provably the same person. Merging two different patients' medical histories is unacceptable, so
the rule is narrowed to a provable one.

- **Merge rule (applied):** two patient rows are the same person when their No RM values are equal after
  removing non-digit characters and leading zeros. This yields exactly 254 duplicate groups in the
  current data, with 254 surplus rows.
- **Storage rule (applied):** the surviving row stores the zero-padded 9-digit form. Standalone 8-digit
  values are padded to 9 digits for the same reason. Padding cannot create a collision, because two
  values that pad to the same string are, by definition, in the same merge group.
- **No rule for irregular values (deferred):** the 10-digit values, the 5- and 7-digit values, and the
  single non-numeric value (`gatal gatal`) are left unchanged and listed in the reconciliation report
  for clinic review. Bulk rewriting them would require the rejected parser.

The original value is retained in `patients.no_rm_lama` whenever the stored `no_rm` changes, which keeps
F-008's promise that a legacy medical record number remains searchable.

| Field | Type | Required | Rules |
|---|---|---|---|
| `patients.no_rm_lama` | `VARCHAR(30)` | No | Original value before padding. Indexed for search. |
| `patients.sumber_data` | `VARCHAR(30)` | No | `REKAMMEDIS` or `DATAPASIEN`. Records provenance, including the 617 patients with no visit. |
| `visits.bidan_rujukan` | `VARCHAR(100)` | No | Raw `Bdn.` value from `keterangan_tindakan`, left unmodified there. |
| `public_health_records.gpa` | `VARCHAR(30)` | No | From the triple elimination register. |
| `public_health_records.uk` | `VARCHAR(30)` | No | From the triple elimination register. |
| `public_health_records.tp` | `VARCHAR(30)` | No | From the triple elimination register. |
| `public_health_records.hiv` | `VARCHAR(30)` | No | From the triple elimination register. |
| `public_health_records.syphilis` | `VARCHAR(30)` | No | From the triple elimination register. |

`hbsag` already exists on `public_health_records` and is reused, not duplicated.

Invariants:

- INV-001: No two `patients` rows share a leading-zero-insensitive No RM key.
- INV-002: `patients.no_rm_lama`, when present, differs from `patients.no_rm`.
- INV-003: Every `public_health_records` row created by backfill has a non-null `visit_id`.
- INV-004: `visits.bidan_rujukan` is null or matches `^Bdn\.`.
- INV-005: The register count equals the non-empty `MONITOR` count of the reconciled visit log.

### 5.2 Register mapping

| MONITOR value | `program_type` |
|---|---|
| `ANC` | `ANC` |
| `PTM` | `PTM` |
| `KB` | `KB` |
| `3 ELIMINASI` | `ELIMINASI_3` |

Any other non-empty `MONITOR` value is reported, not guessed.

### 5.3 Circumcision source

The `SUNAT` sheet holds a name, birth date, address, village, age, gender, weight, phone, and five
follow-up columns. It holds no procedure date, and the follow-up columns are empty except for one
`H+3` note reading `OP`.

`tanggal_tindakan` was made nullable instead of inventing a date. A NULL means "not recorded yet",
which is honest and actionable: the list states how many rows still need a date, shows them first, and
the edit form is where clinic staff set the date, the operator, the fee, and both photos.

Reconciliation created 43 rows from the register (all linked to a patient), filled 6 patient profiles,
created 1 patient whose register row shared a birth date with a differently named patient, and attached
4 rows to a patient matched on birth date with a differing name. Those 9 rows carry a verification note
in `catatan` so the clinic can confirm or merge them.

## 6. Database Changes

- Migration required: yes.
- Create: `supabase/migrations/20260929_f009_reconciliation_support.sql`.
- Modify: add the columns in Section 5.1 to `patients`, `visits`, and `public_health_records`.
- Backfill: performed by `scripts/reconcile-clinic-data.mjs`, not by the migration. The migration only
  adds structure so the script can be re-run safely.
- Destructive operation: yes, the identity merge deletes 254 surplus `patients` rows after repointing
  their dependent rows. No visit row is deleted.
- Rollback / roll-forward: restore from the backup written to `docs/data/` before the run. The new
  columns are additive, so rolling back the migration is not required to restore application behavior.
- Authorization or RLS impact: none. The new columns inherit the table's existing policies. RLS stays
  enabled on `patients`, `visits`, and `public_health_records`.
- Index/query implementation:

| Index | Purpose |
|---|---|
| `idx_visits_bidan_rujukan` (partial, `WHERE bidan_rujukan IS NOT NULL`) | Bidan list and bidan detail filtering |
| `uq_public_health_visit_program` (unique, `visit_id`, `program_type`, `WHERE visit_id IS NOT NULL`) | Makes register backfill idempotent per AC-004.6 |
| `idx_patients_no_rm_lama` | Legacy number search |

Indexes are chosen narrowly and deliberately. The referral index is partial because only the
referral rows are ever queried by `bidan_rujukan`, which keeps it small; a composite
`(tanggal_periksa, bidan_rujukan)` index was considered and rejected because the existing
`idx_visits_tanggal` already serves the date predicate at this volume.

## 7. API / Integration Contract

No custom REST API. The application uses the Supabase client SDK.

### Read: bidan referral list and detail

Input:

```json
{
  "start_date": "2026-09-01",
  "end_date": "2026-09-30",
  "bidan_rujukan": null
}
```

Output shape, aggregated in the client from the returned rows:

```json
{
  "bidan": "Bdn.Tari",
  "referral_count": 21,
  "unique_patients": 20
}
```

| Error code / event failure | Condition | Client / consumer behavior |
|---|---|---|
| `42P01` | Table missing because the migration was not applied | Show a Bahasa Indonesia error, do not render an empty list |
| `PGRST301` | Session expired | Redirect to `/login` |

- Backward compatible: yes. The column is additive and nullable.
- Affected clients/consumers: `/laporan` only.
- Timeout/retry implementation owner: Supabase SDK.
- Idempotency implementation: not applicable, this is a read.
- Realtime/replay implementation: not applicable.

### Operator script: `reconcile-clinic-data.mjs`

Exit codes: `0` success, `1` guard or precondition failure, `2` verification failure. The script never
reports success when a verification check fails.

## 8. State Management

State owner: React component state on the page, matching the existing pattern. No external store.

```text
initial -> loading -> success | empty | error
```

- Side effects are triggered from event handlers and `useEffect` fetch helpers, never from render.
- The dashboard derives one resolved `{ start, end }` range from the preset or the custom range, and the
  fetch depends on those bounds rather than on the preset name. Switching preset to an equivalent range
  ("Semua Periode" to an empty custom range) therefore does not refetch, so opening the custom picker
  does not flash the dashboard.
- Residual risk: two period changes in quick succession could resolve out of order. Accepted at
  single-clinic volume, where each query returns in well under a second; a request sequence guard is the
  fix if it ever becomes visible.
- Local/remote source-of-truth rule: the database is the only source of truth. No business data in
  `localStorage`.

## 9. UI and UX Behavior

### Period filter

- Two modes on one control: `Satu Tanggal` and `Rentang Tanggal`. Both are the same component; a single
  date is stored as a range whose start and end are the same day, so every consumer reads one shape.
- **A period applies only when it is complete.** In range mode the component holds the selection in local
  draft state and emits nothing while only one of the two dates is filled. A half range is not a period,
  so no query runs and the screen does not flash on the first click. The component states what is missing
  ("pick the end date to apply the period") instead of reloading. This rule applies to every date-range
  surface: the dashboard, the report filter, the bidan view, and the Puskesmas report.
- A reversed range is rejected with an inline message and never becomes the applied period.
- Presets apply immediately, because a preset is always a complete range.
- **A reload keeps the previous data on screen.** Skeleton placeholders render only for the first load of
  a panel. While a new period is being fetched, the existing table stays visible and the reload control
  shows a spinner, so the user keeps their context instead of watching the page blank out.
- The control renders inline rather than in a popover. F-008 recorded that dropdown popovers get clipped
  inside scrolling modal containers; an inline control cannot be clipped, and it needs no Escape handler.
- Presets (`Bulan Ini`, `Bulan Lalu`, `Tahun Ini`, `Semua Data`) resolve to an explicit range so the
  control always states the period it is actually filtering by.
- The report page owns one period for the whole screen, so the bidan and Puskesmas views read the same
  filter as the other report tabs instead of showing a second, competing period control.
- Loading: dependent views keep the previous data visible and mark themselves as busy.
- Empty: each dependent view states the period it searched, so an empty result is never ambiguous.
- Validation error: an end date before the start date shows an inline message and does not apply.
- Accessibility: the mode toggle is a labelled radio group; both date inputs are labelled; every control
  is keyboard reachable with a visible focus ring; the selected period is stated as text as well.
- Responsive: the control stacks to full width below 640 pixels; touch targets are at least 44 by 44
  pixels on small screens.

### Bidan referral monitoring

- Master-detail. The bidan list is a set of selectable rows showing name, referral count, and unique
  patient count. Selecting a row reveals that bidan's referrals below on mobile and beside the list on
  large screens. One click reaches the history, satisfying G-004.
- Empty state names the selected period. When no bidan has a referral at all, the panel explains that
  the visit log contains no referral note for the period.
- The panel is read-only. It never writes to `visits`.

### Puskesmas report

- Sub-tabs per program plus a visit recap, each rendered by the shared table.
- The chosen period is printed in the report header so a printed or exported copy is self-describing.
- Export is `.xlsx` through the existing SheetJS dependency.

### Spreadsheet-style tables

- Column order and labels are copied from the corresponding source sheet, not invented.
- The header row is sticky inside a bounded scroll container.
- The container scrolls horizontally; the page does not (AC-010.2).
- No RM, currency, and ICD-10 columns use tabular monospace.

## 10. Error Handling and Observability Implementation

| Failure | Detection | User behavior | Logging / metric / trace |
|---|---|---|---|
| Source CSV missing | `fs.existsSync` | Script aborts naming the file | Printed to stdout and recorded in the report |
| Unreadable No RM value | Parser returns null | Value listed in the report for review | Recorded with row number, value excluded from logs |
| Merge would drop a visit | Post-merge count check | Script aborts | Counts recorded in the report |
| Register row cannot be matched | Lookup miss | Row listed in the report | Patient identifier not logged |
| Supabase read error | `error` object | Bahasa Indonesia message, no partial success | Error code only, no PII |

Sensitive data that must not be logged:

- NIK, BPJS number, diagnoses, and full No RM values. The report uses counts and masked samples.

Concrete instrumentation changes: the reconciliation report is the primary signal. No new logging
framework is introduced.

## 11. Security Implementation

- Authentication integration: unchanged, Supabase Auth.
- Authorization enforcement point: route guards from F-008 plus RLS at the database boundary. The two
  new tabs are clinical, so both `owner` and `dokter_admin` may read them; the financial tabs stay
  `owner`-only.
- Data isolation / RLS / policy: RLS remains enabled. New columns require no new policy.
- Input validation implementation: period dates validated in the component; the merge key validated in
  the script with an abort on ambiguity.
- Sensitive-data handling: `SUPABASE_SERVICE_ROLE_KEY` is read from an env file inside the script only.
- Rate-limit / abuse control implementation: not applicable at single-clinic volume.
- File/media validation: not applicable, no upload in this feature.

## 12. Testing Strategy

### Unit

- Merge-key function: equal after leading-zero removal, not equal otherwise.
- Zero-padding function: padding is collision-safe for a known pair set.
- MONITOR to `program_type` mapping, including the rejected unknown value.
- Bidan extraction: `Bdn.Tari` accepted, `Admin/Bdn.Resa` rejected, `-20` rejected.
- Period validation: end before start is rejected.
- Single-date mode equals a range whose start and end are the same date.

### Integration / contract

- Reconciliation idempotency: a second run on unchanged input changes nothing.
- Register backfill idempotency: enforced by `uq_public_health_visit_program`.
- RLS smoke check: an anonymous client cannot read `public_health_records`.

### Architecture-sensitive tests

- Consistency: post-merge visit count equals pre-merge visit count.
- Consistency: post-reconciliation visit count equals the row count of `REKAMMEDIS.csv`.
- Authorization: `dokter_admin` reaches the two new tabs and not the financial tabs.

### UI

- Empty, loading, and error states for the bidan panel and the Puskesmas report.
- Keyboard-only operation of the period filter, including Escape and visible focus.
- 360 pixel, 768 pixel, and 1024 pixel layouts with no page-level horizontal scroll.

### Manual / runtime

- Run the reconciliation against the development project, verify the counts, then promote to production.
- Open the Puskesmas report for a period with data and for a period without data, and export both.

## 13. Rollout and Rollback

- Feature flag: no. The migration is additive and the new tabs are new surfaces.
- Rollout steps:

  1. Apply the migration to the development project.
  2. Run reconciliation against development with `--confirm-dev-reset`.
  3. Verify counts, duplicates, and idempotency.
  4. Apply the migration to the production project.
  5. Run reconciliation against production with `--env=.env.production --confirm-prod-reset`.
  6. Deploy the UI changes.

- Rollback / roll-forward steps: restore `patients`, `visits`, and the program tables from the backup
  written before the run. The UI can be reverted independently because it only reads.
- Data compatibility after rollback: `no_rm_lama` retains the prior value, so a rollback of the merge
  can be reconstructed from the report.
- Operational signals to watch: post-run row counts, duplicate group count, and any abort exit code.

## 14. Local Implementation Alternatives

### Alternative A: gender-and-village informed No RM parser

Normalise every legacy value to the F-008 `NN-NN-NNNNNN` form using the stored gender and village to
disambiguate the segments.

Advantages:

- One uniform medical record number across the clinic.
- Merges 412 rows instead of 254.

Disadvantages:

- Prototyped against live data: 93 rows are unreadable by the parser because the number's own gender or
  village digit disagrees with the stored patient. Resolving those needs clinic judgement.
- Merges records that are not provably the same person, which risks combining two patients' histories.
- Contradicts F-008, which selected gradual migration with legacy numbers retained.

Selected / rejected because: the risk of silently merging different patients outweighs the formatting
benefit. The safe subset is merged and the remainder is reported.

### Alternative B: database view or RPC for the bidan aggregate

Aggregate referrals per bidan in PostgreSQL instead of in the client.

Advantages:

- Constant payload regardless of referral volume.

Disadvantages:

- Adds a database object to maintain and to keep in the migration history, for 82 rows today.

Selected / rejected because: the client-side aggregate is simpler and well inside the performance
requirement at this volume. Revisit if referral volume grows by orders of magnitude.

### Alternative C: dedicated `referral_sources` table

Store bidan as rows with a foreign key instead of a text column.

Advantages:

- Enforces a canonical bidan list and supports the Post-MVP commission feature.

Disadvantages:

- Adds a table, a foreign key, and a lookup path for nine known values.
- The Post-MVP commission shape is not yet decided, so the table would be designed on speculation.

Selected / rejected because: a nullable text column plus a constant list is the smallest complete
change. The table is recorded as a Post-MVP candidate.

## 15. Architecture / ADR Impact Check

- System architecture still valid: yes.
- Architecture update required: no.
- Global architecture impact: additive columns and indexes only, within the existing Supabase storage
  and SDK boundary.
- ADR required: no. The RM canonicalisation decision is recorded in Section 5.1 and in Alternative A.
- Related ADR: none.

## 16. Approval

- Technical owner: Developer
- Status: DRAFT
- Approved date: Pending
- Conditions: production reconciliation stays blocked until the development run passes verification.
