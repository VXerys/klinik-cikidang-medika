---
id: F-009
title: "Data Completeness, Bidan Referral Monitoring, Period Filter, and Puskesmas Report"
status: draft
owner: "Developer / Klinik Cikidang Medika"
created: "2026-09-29"
last_updated: "2026-09-29"
last_verified_commit: unverified
source_of_truth_for:
  - "Clinic data completeness guarantees"
  - "Bidan referral monitoring behavior"
  - "Period filter behavior"
  - "Puskesmas report output"
related:
  - "../../product/prd.md"
  - "../F-001-master-pasien-kasir/requirements.md"
  - "../F-004-dashboard-laporan/requirements.md"
  - "../F-005-migrasi-data-lama/requirements.md"
  - "../F-006-program-khusus/requirements.md"
  - "../F-008-rm-rbac-kesehatan-piutang/requirements.md"
supersedes: null
superseded_by: null
---

# Requirements: F-009 Data Completeness, Bidan Referral Monitoring, Period Filter, and Puskesmas Report

## 1. Summary

F-009 closes the remaining gap between the clinic's Google Sheets and the application so the
clinic can stop opening Sheets entirely. It delivers four connected capabilities:

1. Complete and reconcile the migrated data set against the most recent Sheets export.
2. Surface midwife (bidan) referral history that already exists inside visit records.
3. Provide one reusable period filter that accepts either a single date or a date range.
4. Produce a Puskesmas-facing report that mirrors the clinic's DPP register sheets.

This feature is a client Change Request and is registered the same way F-008 was.

## 2. Problem

Current behavior, verified against the working tree on 2026-09-29:

- The database was seeded from `DASHBOARD - DATAUTAMA.csv` (exported 2026-09-18):
  7.493 visits, 4.238 raw No RM values, latest visit 2026-09-18.
- A newer and strictly larger export exists: `[DATA] Klinik Cikidang Medika  - REKAMMEDIS.csv`
  (exported 2026-09-29): 7.671 visits, 4.315 raw No RM values.
  178 visits and 77 patients are therefore absent from the database, covering 2026-09-19 to 2026-09-29.
- Google Sheets stored No RM as a number, so the leading zero was silently dropped.
  The `patients` table holds 4.238 rows but only 3.984 distinct identities: 254 identities exist
  as two separate patient rows (for example `020200002` and `20200002`), and their visits are split.
- The `MONITOR` column of the visit log tags 808 clinic visits as program register entries
  (ANC 594, PTM 139, 3 ELIMINASI 39, KB 36). `public_health_records` currently holds 0 rows.
- Midwife referrals are already stored: `visits.keterangan_tindakan` holds values such as
  `Bdn.Tari` (20 rows), `Bdn.Ulfah` (19), `Bdn.Novi` (17), `Bdn.Dewi` (8), `Bdn.Nida` (7),
  `Bdn.Trie` (3), `Bdn.Ai` (3), `Bdn.Rila` (2), `Bdn.Desi` (1). There is no screen that lets the
  owner open one bidan and read her referral history.
- The visit log has no `jam_periksa` values, and `patients.pekerjaan` is empty while
  `patients.riwayat_alergi` is filled only by its column default (`Tidak Ada`), not by real data.
  `[DATA] Klinik Cikidang Medika  - DATAPASIEN .csv` carries real `Pekerjaan` (98 percent filled)
  and `Alergi Obat` (54 percent filled) for 3.051 patients that also appear in the visit log.
- `circumcisions` holds 3 rows while `[DATA] Klinik Cikidang Medika  - SUNAT .csv` lists 43 children.
- Sexually transmitted infection screening values (HIV, SYPHILIS, HbSAg, GPA, UK, TP) exist only in
  `TRIPLE ELIMINASI.csv` and `DATA H_S_HbSAg.csv`; the schema has no columns for most of them.
- The dashboard offers only four fixed period presets. The Sheets export that the client references,
  `DASHBOARD - QUERY.csv`, carries an explicit `Tgl Pmrksan : 1-9-2026 - 30-9-2026` filter range.

Expected outcome:

- Every patient, visit, register entry, allergy, occupation, and circumcision record present in the
  latest Sheets export is present in the application, with no duplicated patient identity.
- The owner can open a bidan and read that bidan's referral history.
- Any report or dashboard view can be scoped to one date or to a date range.
- The clinic can hand a Puskesmas-format report to the Puskesmas without rebuilding it in Sheets.

## 3. Goals

- G-001: `patients` contains no two rows that share the same normalized No RM.
- G-002: `visits` contains every visit present in `REKAMMEDIS.csv`, and none of its rows is lost.
- G-003: `public_health_records` contains one row per `MONITOR`-tagged visit (808 expected).
- G-004: The owner can navigate from a bidan name to that bidan's referral list in at most two clicks.
- G-005: One shared period filter component is used by the dashboard, the report module, the bidan
  monitoring view, and the Puskesmas report, and it accepts a single date or a range.
- G-006: A Puskesmas report can be produced as `.xlsx` for a chosen period.
- G-007: The reconciliation is reproducible: re-running the reconciliation script on unchanged input
  produces no further changes.

## 4. Non-Goals

- NG-001: Bidan commission calculation, commission rates, and commission payouts. The existing
  `referral_commissions` ledger and `ReferralCommissionPanel` are out of scope for this slice and
  remain unchanged. Commission work is deferred to Post-MVP.
- NG-002: Pharmacy and drug master data (`Master.csv`, `LAPORANOBAT.csv`, `HARGA OBAT NURANI.csv`).
  No drug table exists and no pharmacy module is in MVP scope.
- NG-003: BPJS P-Care API integration.
- NG-004: Importing the pivot-only sheets (`DASHBOARD - ANALISA.csv`, `DASHBOARD - DASHBOARD.csv`,
  `[DATA] Klinik Cikidang Medika  - C1.csv`). These are derived pivot views with no named columns.
- NG-005: Migrating the `LAPORAN DPP` and `QUERY` exports as independent data sources. They are
  verified views of the visit log and are used only as reconciliation references.
- NG-006: Changing the No RM pattern introduced by F-008 (`NN-NN-NNNNNN`) for new patients.

## 5. Actors

### ACTOR-001 - Owner

Full access. Runs the reconciliation, reviews the reconciliation report, reads bidan referral
history, chooses periods, and produces the Puskesmas report.

### ACTOR-002 - Dokter / Admin (`dokter_admin`)

Clinical access. May read the bidan referral monitoring view and the Puskesmas report. Per F-008
AC-002.3 and AC-002.5, `dokter_admin` must not reach `/`, `/pendaftaran`, `/buku-kas`, or the
financial report tabs.

### ACTOR-003 - Reconciliation script (operator-invoked, server-side)

A developer-run script. It is not reachable from the application UI and requires explicit
confirmation flags before it writes.

## 6. Preconditions

- PRE-001: `docs/data/[DATA] Klinik Cikidang Medika  - REKAMMEDIS.csv` exists and is unmodified.
- PRE-002: A row-count backup of `patients`, `visits`, `cash_flows`, `public_health_records`,
  `referral_commissions`, `tbc_programs`, `circumcisions`, and `post_cares` exists in `docs/data/`.
- PRE-003: The development project (`jpqmnbtowvfctxciuktj`) is reconciled and verified before the
  production project (`aszjzvdmxudmoomdxttx`) is touched.
- PRE-004: The reconciliation script guards require `--confirm-dev-reset` for the development project
  and `--env=.env.production --confirm-prod-reset` for the production project.

## 7. Functional Requirements

### FR-001 - Reconciliation of the Visit Log

The system shall reconcile `patients`, `visits`, and `cash_flows` against `REKAMMEDIS.csv`.

Acceptance criteria:

- AC-001.1: Given `REKAMMEDIS.csv` is the input, when reconciliation runs, then `visits` shall contain
  every visit row from the file, including the 178 rows dated 2026-09-19 to 2026-09-29.
- AC-001.2: Given reconciliation runs, when it completes, then `visits` shall contain no visit that is
  absent from `REKAMMEDIS.csv`.
- AC-001.3: Given the previous export is a strict subset, when reconciliation runs, then no visit that
  existed before reconciliation shall disappear.
- AC-001.4: Given a field value exceeds its target column limit, when reconciliation runs, then the
  value shall be reported and set to null rather than truncated, and the run shall record it.
- AC-001.5: Given `usia` equals 0, when reconciliation runs, then the age shall be stored as 0 and
  shall not be treated as missing.

### FR-002 - Patient Identity Reconciliation

The system shall ensure that one person is represented by exactly one `patients` row.

Acceptance criteria:

- AC-002.1: Given two patient rows whose No RM values differ only by leading zeros or non-digit
  separators, when reconciliation runs, then those rows shall be merged into one surviving row.
- AC-002.2: Given a merge is required, when the surviving row is chosen, then the row holding the most
  populated identity fields (KTP, BPJS, address, birth date) shall survive.
- AC-002.3: Given a merge is required, when it completes, then every `visits.pasien_id` and every
  program-table `pasien_id` that referenced a merged-away row shall point to the surviving row.
- AC-002.4: Given a merge is required, when it completes, then the surviving row's `no_rm` shall be
  stored in the zero-padded 9-digit form (`DDDDDDDDD`), and the value it replaced shall be kept in
  `patients.no_rm_lama`.
- AC-002.5: Given reconciliation runs, when it completes, then the distinct identities derived from the
  visit log shall number 4.061, and no two patient rows shall share a leading-zero-insensitive key.
- AC-002.6: Given a value cannot be read as a medical record number without guessing (a 10-digit value, a
  short value, or a non-numeric value), when reconciliation runs, then the value shall NOT be rewritten
  and shall be listed in the reconciliation report for clinic review.
- AC-002.7: Given a merge would reduce the number of visits, when reconciliation runs, then the run shall
  abort and report the conflict instead of deleting visits.
- AC-002.8: Given a patient row is padded but not merged, when reconciliation runs, then its previous
  value shall be recorded in `patients.no_rm_lama` and its visit count shall not change.

### FR-003 - Patient Profile Enrichment

The system shall enrich patient profiles from `DATAPASIEN .csv`.

Acceptance criteria:

- AC-003.1: Given a patient in the database matches a `DATAPASIEN` row by normalized No RM, when
  enrichment runs, then `patients.pekerjaan` shall be filled from the `Pekerjaan` column.
- AC-003.2: Given the matched `DATAPASIEN` row has a non-empty `Alergi Obat` value, when enrichment
  runs, then `patients.riwayat_alergi` shall be replaced with that value.
- AC-003.3: Given a patient's `riwayat_alergi` is still the column default `Tidak Ada` after
  enrichment, when the profile is displayed, then the field shall read as not recorded rather than as
  a confirmed "no allergy" finding.
- AC-003.4: Given a `DATAPASIEN` row has no matching patient by normalized No RM, when enrichment
  runs, then that row shall be inserted as a patient with `sumber_data` set to `DATAPASIEN` and no
  recorded visit in the migrated period. 617 such rows are expected.
- AC-003.5: Given enrichment runs, when it completes, then the `patients` table shall hold 4.678 rows:
  4.061 identities from the visit log plus 617 patients known only from the patient master.
- AC-003.6: Given enrichment runs twice on unchanged input, when the second run completes, then no
  additional patient row shall be created and no field shall change.

### FR-004 - Public Health Register Backfill

The system shall populate `public_health_records` from the `MONITOR` column of the visit log.

Acceptance criteria:

- AC-004.1: Given a visit has `MONITOR` equal to `ANC`, when backfill runs, then a
  `public_health_records` row with `program_type` `ANC` shall be created and linked to that visit.
- AC-004.2: Given a visit has `MONITOR` equal to `PTM`, `KB`, or `3 ELIMINASI`, when backfill runs,
  then the row shall be created with `program_type` `PTM`, `KB`, or `ELIMINASI_3` respectively.
- AC-004.3: Given a visit has an empty `MONITOR` value, when backfill runs, then no
  `public_health_records` row shall be created for it.
- AC-004.4: Given backfill runs against the reconciled data set, when it completes, then the register
  shall hold 808 rows: ANC 594, PTM 139, ELIMINASI_3 39, and KB 36.
- AC-004.5: Given each created row, when it is stored, then identity fields (name, gender, birth date,
  address, NIK) shall be snapshotted from the patient so the register stays readable if the patient
  record later changes.
- AC-004.6: Given backfill runs twice on unchanged input, when the second run completes, then no
  duplicate register row shall be created.

### FR-005 - Triple Elimination Screening Fields

The system shall persist the screening values that currently exist only in the Sheets register exports.

Acceptance criteria:

- AC-005.1: Given the schema is migrated, when the change is applied, then
  `public_health_records` shall provide columns for `gpa`, `uk`, `tp`, `hiv`, `syphilis`, and `hbsag`.
- AC-005.2: Given `LAPORAN DPP DR. ADE SOFYAN - TRIPLE ELIMINASI.csv` and
  `[DATA] Klinik Cikidang Medika  - DATA H_S_HbSAg.csv` are inputs, when backfill runs, then the
  screening values shall be written to the matching register row.
- AC-005.3: Given a screening value is absent in the source, when backfill runs, then the column shall
  remain null and shall not be defaulted to a negative result.
- AC-005.4: Given a screening row cannot be matched to an existing register row by patient and visit
  date, when backfill runs, then the row shall be reported for manual review rather than silently
  dropped.

### FR-006 - Circumcision Register Backfill

The system shall populate `circumcisions` from `[DATA] Klinik Cikidang Medika  - SUNAT .csv`.

Acceptance criteria:

- AC-006.1: Given the `SUNAT` file lists 43 children, when backfill runs, then the identity and contact
  fields available in the file (name, birth date, gender, village, address, phone) shall be applied to
  the patient record. Body weight has no destination column and is reported instead.
- AC-006.2: Given the `SUNAT` photo columns (0, 3, 7, 14, 22 days) are empty in the source, when
  backfill runs, then no photo URL shall be created and no placeholder image shall be stored.
- AC-006.3: Given a `SUNAT` row has no matching patient, when backfill runs, then a patient record shall
  be created with a new medical record number in the F-008 `NN-NN-NNNNNN` form.
- AC-006.4: Given two children share a birth date but their names do not match, when backfill runs, then
  no existing patient shall be reused on that evidence alone; a patient shall be created and the clash
  recorded (see FR-011).
- AC-006.5: Given the `SUNAT` file has no procedure date column, when backfill runs, then the
  circumcision row shall be stored with a NULL procedure date instead of an invented one (see FR-011).

### FR-007 - Bidan Referral Monitoring

The system shall let a user open one bidan and read that bidan's referral history.

Acceptance criteria:

- AC-007.1: Given a visit's `keterangan_tindakan` begins with `Bdn.`, when the referral is recorded,
  then the bidan identifier shall be stored in a dedicated `visits.bidan_rujukan` column.
- AC-007.2: Given `keterangan_tindakan` holds a bidan value, when the value is stored, then the
  original `keterangan_tindakan` text shall remain unmodified.
- AC-007.3: Given `keterangan_tindakan` holds `Admin/Bdn.Resa`, when referral extraction runs, then it
  shall NOT be recorded as a referral source because it names an internal staff member.
- AC-007.4: Given the reconciled data set, when referral extraction completes, then 82 visits shall
  carry a `bidan_rujukan` value across 9 distinct bidan.
- AC-007.5: Given the monitoring view is open, when it renders, then it shall list every distinct bidan
  with that bidan's referral count and distinct patient count.
- AC-007.6: Given a bidan is selected, when the detail opens, then that bidan's referrals shall be
  listed with patient name, medical record number, visit date, ICD-10 code, and action label.
- AC-007.7: Given the detail is open, when the user applies a period filter, then only referrals inside
  the chosen period shall be listed.
- AC-007.8: Given a bidan has no referral in the chosen period, when the view renders, then an empty
  state shall explain that no referral exists for that period.

### FR-008 - Period Filter (Single Date or Range)

The system shall provide one reusable period filter that accepts a single date or a date range.

Acceptance criteria:

- AC-008.1: Given the filter is open, when the user selects the single-date mode, then choosing one
  date shall scope every dependent view to that date only.
- AC-008.2: Given the filter is open, when the user selects the range mode, then choosing a start date
  and an end date shall scope every dependent view to that inclusive range.
- AC-008.3: Given the user picks an end date earlier than the start date, when the selection is
  confirmed, then the filter shall reject the selection and show a readable message instead of
  producing an empty result.
- AC-008.4: Given the filter is applied, when the user clears it, then every dependent view shall return
  to its documented default period.
- AC-008.5: Given the existing presets are present, when the user picks a preset, then the filter shall
  represent that preset as an equivalent explicit date range.
- AC-008.6: Given the same component is used on the dashboard, the report module, the bidan monitoring
  view, and the Puskesmas report, when the period changes on one screen, then the other screens shall
  keep their own independent period state and shall not be silently overwritten.
- AC-008.7: Given the selected period contains no data, when a dependent view renders, then it shall
  show an empty state naming the period and shall offer a clear-filter action.
- AC-008.8: Given the range mode and only one of the two dates is filled, when the user changes the
  selection, then no query shall run and no dependent view shall enter a loading state. The component
  shall state which date is still needed instead.
- AC-008.9: Given a dependent view is already showing data, when a new period is fetched, then the
  previous data shall stay visible with a loading indicator, and skeleton placeholders shall be reserved
  for the first load of that view.
- AC-008.10: Given the user moves between a preset and an equivalent custom range, when the resolved date
  bounds are unchanged, then no query shall run.

### FR-009 - Puskesmas Report

The system shall produce a Puskesmas-facing report for a chosen period.

Acceptance criteria:

- AC-009.1: Given a period is chosen, when the Puskesmas report is generated, then it shall present the
  program registers (`PTM`, `ANC`, `KB`, `ELIMINASI_3`) for that period.
- AC-009.2: Given the report is exported, when the export completes, then the file shall be `.xlsx` and
  its column order and column labels shall match the corresponding `LAPORAN DPP` sheet.
- AC-009.3: Given the report is displayed on screen, when it renders, then it shall show the chosen
  period explicitly so a printed copy is self-describing.
- AC-009.4: Given the period contains no register row, when the report is generated, then it shall state
  that the period has no records and shall still allow the export.

### FR-010 - Spreadsheet-Style Data Tables

The system shall render report tables so that they read like the source spreadsheets.

Acceptance criteria:

- AC-010.1: Given a report table is rendered, when it is compared with its source sheet, then the column
  order and column labels shall match the sheet.
- AC-010.2: Given a report table is rendered, when the viewport is 360 pixels wide, then the table shall
  scroll horizontally inside its own wrapper and the page shall not scroll horizontally.
- AC-010.3: Given a report table is rendered, when the header scrolls out of view, then the header row
  shall remain visible while the body scrolls.
- AC-010.4: Given a column holds No RM, currency, or an ICD-10 code, when it is rendered, then it shall
  use a tabular monospace treatment so digits align vertically.

### FR-011 - Circumcision Register and Editing

The system shall store the clinic's circumcision register even though the source carries no procedure
date, and shall let clinic staff complete it afterwards.

Acceptance criteria:

- AC-011.1: Given the register carries no procedure date, when a row is imported, then
  `tanggal_tindakan` shall be stored as NULL and shall NOT be set to a placeholder date.
- AC-011.2: Given the register lists 43 children, when the import runs, then 43 `circumcisions` rows
  shall exist with `sumber_data` equal to `SUNAT`, and each shall reference a patient.
- AC-011.3: Given a row has a NULL procedure date, when the circumcision list renders, then the card
  shall state that the date is not recorded instead of displaying a date.
- AC-011.4: Given rows have no recorded date, when the list renders, then it shall state how many rows
  still need completion and those rows shall be ordered first.
- AC-011.5: Given clinic staff open a row for editing, then they shall be able to set the procedure date,
  the operator, the method, the fee, the wound evaluation, the note, the body weight, and both medical
  photos.
- AC-011.6: Given a photo is replaced or removed in the edit form, when the change is saved, then the
  stored photo reference shall be updated to the new upload or cleared.
- AC-011.7: Given new photos are chosen, when they are saved, then each shall be compressed on the client
  to WebP under 300 KB before upload.
- AC-011.8: Given a register row's patient could only be matched on birth date, when the row is imported,
  then the name difference shall be recorded in the row's note for clinic verification.
- AC-011.9: Given a register row shares a birth date with a patient whose name does not match, when it is
  imported, then a separate patient shall be created and the clash recorded in the note. Reusing an
  unverified patient would attach a procedure to the wrong child, which is worse than a duplicate that
  can be merged later.
- AC-011.10: Given a register row carries a note in a follow-up column, when it is imported, then that
  note shall be preserved in the row's note rather than discarded.

### FR-012 - Medical Record Number Values That Cannot Be Read

The system shall not rewrite a medical record number it cannot interpret.

Acceptance criteria:

- AC-012.1: Given a value is not 8 or 9 digits after removing separators, when reconciliation runs, then
  the value shall be left unchanged.
- AC-012.2: Given such values exist, when reconciliation completes, then their count and the affected
  patients shall be listed in the reconciliation report and in the client update report, so the clinic
  can decide on each one rather than having the system guess.

## 8. Business Rules

- BR-001: `REKAMMEDIS.csv` is the authoritative visit source; `DATAUTAMA.csv` is retired as a source.
- BR-002: `DATAPASIEN .csv` is the authoritative source for patient occupation and recorded drug allergy.
- BR-003: A bidan referral source is identified only by a `Bdn.` prefix in the action note column.
- BR-004: `Admin/Bdn.Resa` is internal clinic staff and is never a referral source.
- BR-005: Bidan commission and payout are not part of this feature.
- BR-006: The derivation exports (`LAPORAN DPP`, `QUERY`, `USG`, `DATA H_S_HbSAg`, `pendataan USG`) are
  reconciliation references, not migration inputs, except where FR-005 and FR-006 name them.
- BR-007: Money is stored as `NUMERIC(15,2)` and displayed with the `Rp` prefix and Indonesian
  thousand separators.
- BR-008: Existing applied migrations are never edited; every schema change is a new timestamped file.
- BR-009: The production reconciliation happens only after the development reconciliation is verified.
- BR-010: A NULL `circumcisions.tanggal_tindakan` means the clinic has not recorded the date yet. It is
  never filled with a placeholder, and the list treats those rows as a work queue.
- BR-011: A medical record number that cannot be read without guessing is left untouched and reported;
  the system does not invent an identity.

## 9. Validation Rules

| ID | Input | Rule | Error behavior |
|---|---|---|---|
| VAL-001 | Period start | Must be a valid date | Reject and show a readable message |
| VAL-002 | Period end | Must be a valid date and must not precede the start date | Reject and show a readable message |
| VAL-003 | No RM (merge output) | Must be unique in `patients.no_rm` | Abort the merge and report the conflicting pair |
| VAL-004 | Bidan name | Must match `^Bdn\.` after trimming | Excluded from referral extraction |

## 10. States and Transitions

| State | Meaning | Allowed transitions |
|---|---|---|
| `unreconciled` | The database holds the previous export | `reconciled` |
| `reconciled` | `visits` and `patients` match `REKAMMEDIS.csv` with unique identities | `verified` |
| `verified` | Reconciliation counts and uniqueness checks pass in development | `promoted` |
| `promoted` | Production holds the reconciled data set | terminal |

Invalid transitions must be rejected explicitly. In particular, the `verified` to `promoted`
transition requires an explicit operator confirmation flag.

## 11. Error and Empty States

- ERR-001: When a source CSV is missing, the system shall abort and name the missing file.
- ERR-002: When no data exists for the chosen period, the system shall show an empty state naming the
  period and offering a clear-filter action.
- ERR-003: When a Supabase call fails, the system shall surface a Bahasa Indonesia message and shall not
  render a partial success as a success.
- ERR-004: When a merge would delete a visit, the system shall abort and report the conflict.

## 12. Non-Functional Requirements

- NFR-PERF-001: The bidan monitoring list shall render within 2 seconds at the current data volume
  (7.671 visits, 9 bidan).
- NFR-PERF-002: The Puskesmas export shall complete within 10 seconds at the current data volume.
- NFR-SEC-001: `SUPABASE_SERVICE_ROLE_KEY` shall be used only inside operator scripts, never in
  client-side code.
- NFR-SEC-002: NIK, BPJS number, and diagnoses shall not be written to logs.
- NFR-SEC-003: Row Level Security shall remain enabled on every table holding patient or financial data.
- NFR-REL-001: Reconciliation shall be idempotent; a second run on unchanged input shall make no change.
- NFR-REL-002: A reconciliation run shall produce a machine-readable report of merged identities,
  inserted visits, inserted patients, and unmatched rows.
- NFR-A11Y-001: The period filter shall be fully keyboard operable, shall expose a visible focus
  indicator, and shall not rely on colour alone to convey the selected range.
- NFR-A11Y-002: Contrast shall meet WCAG AA (4.5:1 for body text, 3:1 for large text).
- NFR-RESP-001: Every new screen shall work at 360 pixels, 768 pixels, and 1024 pixels and above with
  no page-level horizontal scroll and with touch targets of at least 44 by 44 pixels.

## 13. Dependencies

- DEP-001: F-005 migration tooling (`scripts/migrate-data.mjs`) and its safety guards.
- DEP-002: F-008 schema (`public_health_records`, `referral_commissions`, visit payment columns).
- DEP-003: F-008 route guards for `dokter_admin`.
- DEP-004: `xlsx` (SheetJS) for `.xlsx` export.
- DEP-005: The `docs/data` Sheets exports, which are gitignored because they contain PII.

## 14. Assumptions

- ASM-001: The client intends to stop using Google Sheets, so completeness outranks the cost of a
  slightly larger patient master. A patient with no recorded visit in the migrated period is still
  imported.
- ASM-002: The Puskesmas report means the DPP-style program register plus the visit recap for the
  chosen period. CONFIRMED by the client on 2026-09-30: the layout that follows `LAPORAN DPP` is
  correct as implemented.
- ASM-003: The midwife referral source is the action-note column only. No other column holds it.
- ASM-004: Photo columns in the circumcision source are empty, so no image migration is required.
  The source also carries no procedure date, so the circumcision event register cannot be rebuilt from
  it (see AC-006.5).
- ASM-005: Clinic staff names (`dr. Ovan`, `dr. Neneng`, `Admin/Bdn.Resa`) are already stored in the
  officer column and require no change.

## 15. Open Questions

| ID | Question | Owner | Blocking? | Resolution |
|---|---|---|---|---|
| OQ-001 | Is the Puskesmas report the DPP-style register plus visit recap, or a different fixed layout? | Client | No | Resolved 2026-09-30: the client confirmed the DPP-style layout as implemented is correct |
| OQ-002 | Should the 617 `DATAPASIEN` patients with no recorded visit in the migrated period be imported? | Client | No | Defaulted to yes per ASM-001, flagged in the reconciliation report so the client can review the list |
| OQ-003 | Is the bidan referral monitoring view needed for the MVP, given commissions are Post-MVP? | Client | No | Defaulted to yes, because the request was explicit and the data already exists |
| OQ-004 | Should the commission ledger's nominal rates be confirmed now? | Client | No | Post-MVP per NG-001 |
| OQ-005 | The `SUNAT` register has no procedure date. Should the clinic supply the dates, or fill them in through the edit form? | Client | No | Resolved: the register is imported with a NULL date, the list surfaces the rows that still need one, and clinic staff fill the date and photos through the edit form (FR-011) |
| OQ-006 | One patient record has the literal name `J00` (an ICD-10 code in the name column) and another shares a birth date with an imported register row. | Client | No | Left as found and reported; the affected circumcision rows carry a verification note. The clinic decides whether to rename or merge. |
| OQ-007 | The `SUNAT` register has no procedure date, but the visit log carries visits whose diagnosis or complaint names a circumcision. Should those dates be used to fill the register? | Developer then Client | No | Open. An audit on 2026-09-30 found 13 of the 43 register children each have exactly one such visit, so the date is recoverable without inventing one. One of the 13 is a day-3 follow-up visit, not the procedure itself. Recovery is offered to the clinic as an optional prefill (see `next_tasks` F-009-OPEN-004); it is not applied automatically. |

## 16. Approval

- Product owner: Client (Klinik Pratama Cikidang Medika), through the developer
- Status: DRAFT
- Approved date: Pending
- Notes: The developer approved every recommendation in the 2026-09-29 audit. Bidan commission
  (payment) is explicitly deferred to Post-MVP. The client confirmed the Puskesmas report layout on
  2026-09-30 (ASM-002, OQ-001 resolved). The remaining open items are the circumcision procedure
  dates (OQ-005, OQ-007), the unreadable No RM values (FR-012), and the `J00` patient name (OQ-006).
