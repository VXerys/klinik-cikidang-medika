---
id: F-001
title: Master Pasien & Loket Kasir
status: approved
owner: Developer
created: 2026-09-19
last_updated: 2026-09-19
last_verified_commit: initial-spec
source_of_truth_for:
  - F-001 behavior
  - Patient registration rules
  - Cashier billing rules
related:
  - "../../product/prd.md"
  - "../../architecture/overview.md"
  - "../../architecture/data-model.md"
supersedes: null
superseded_by: null
---

# Requirements: F-001 Master Pasien & Loket Kasir

## 1. Summary

The Master Pasien & Loket Kasir module manages the clinic registration desk and cashier operations. It enables front-desk staff to instantly search and autocomplete existing patient records from the historical database of 4,238 patients, register new patients with automatically generated unique Medical Record Numbers (No RM), record daily clinic visits into doctor queues, and process cashier billing distinguishing between BPJS capitation visits (Rp 0 fee) and General self-pay visits with printable receipts.

---

## 2. Problem Statement

### Current Behavior:
Clinic staff previously typed patient identities manually into Google Sheets on each visit. This caused data duplication, high rates of missing identity numbers (57.6% missing NIK, 64.7% missing BPJS), and human calculation errors during busy morning queue peaks.

### Expected Outcome:
Front-desk registration and cashier billing completed in under 30 seconds per patient, with sub-100ms autocomplete search across all 4,238 existing patients, zero duplicate No RM generation, and automatic Rp 0 billing enforcement for BPJS patients.

---

## 3. Goals

- **G-001**: Sub-100ms autocomplete search across 4,238 patients by No RM, Name, or Village (Desa).
- **G-002**: Atomic registration of new patients with sequential unique No RM numbers.
- **G-003**: Automatic visit dispatch into daily doctor queues with sequential daily queue numbers.
- **G-004**: Enforced billing separation: BPJS visits automatically set examination fee to Rp 0; General visits default to standard clinic tariff with Cash/Transfer payment methods.
- **G-005**: Instant printable/downloadable receipt kuitansi for patients.

---

## 4. Non-Goals (Out of Scope)

- **NG-001**: Integration with BPJS P-Care API (client confirmed all BPJS records remain internal).
- **NG-002**: Pharmacy drug inventory subtraction per pill during registration (managed in separate RME).
- **NG-003**: Hardware token queue printing machines or automated voice calling speakers.
- **NG-004**: Skincare retail sales (Emerys Glow) processing.

---

## 5. Actors & Permissions

### ACTOR-001: Kasir / Loket Staff (`kasir`)
Primary operator. Has full access to search patients, create patient records, register daily visits, collect payments, and print receipts.

### ACTOR-002: Dokter Pemeriksa (`dokter`)
Observer. Can view registered patient details and queue position, but does not perform billing transactions.

### ACTOR-003: Pimpinan Klinik (`owner`)
Auditor. Has read access to all registered visits and cashier revenue totals.

---

## 6. Preconditions

- **PRE-001**: Supabase PostgreSQL database contains active `patients`, `doctors`, and `visits` tables.
- **PRE-002**: Front-desk workstation has active network connection to Supabase Cloud API.

---

## 7. Functional Requirements

### FR-001: Instant Patient Autocomplete Search
The system SHALL provide an instant autocomplete search input on the registration desk.

- **AC-001.1**: WHEN staff types 2 or more characters into the search bar, THEN the system SHALL query `public.patients` by matching `no_rm` (exact or prefix), `nama` (case-insensitive ILIKE), or `desa` (case-insensitive ILIKE) with a response latency under 100ms.
- **AC-001.2**: WHEN staff selects a patient from the suggestion list, THEN the system SHALL populate the visit registration form with the patient's existing `no_rm`, `nama`, `gelar`, `tanggal_lahir`, `desa`, `no_ktp`, and `no_bpjs`.
- **AC-001.3**: WHEN no matching records are found, THEN the system SHALL display an empty state banner with an immediate button: "+ Daftarkan Sebagai Pasien Baru".

### FR-002: New Patient Registration
The system SHALL support creating a new patient record with automatic No RM assignment.

- **AC-002.1**: WHEN staff submits a new patient form, THEN the system SHALL validate that `nama`, `jenis_kelamin`, and `desa` are not empty.
- **AC-002.2**: The system SHALL automatically generate the next sequential `no_rm` if not manually specified, following the clinic format.
- **AC-002.3**: IF the submitted `no_rm` already exists in `public.patients`, THEN the system SHALL reject the insert with a user-friendly error message in Bahasa Indonesia: "Nomor RM sudah terdaftar".
- **AC-002.4**: WHEN insertion succeeds, THEN the new patient record SHALL be immediately saved to `public.patients` and selected for visit registration.

### FR-003: Daily Visit & Queue Registration
The system SHALL register patient visits into today's examination queue.

- **AC-003.1**: WHEN staff registers a visit for a selected patient, THEN the system SHALL record a row in `public.visits` with `tanggal_periksa = CURRENT_DATE`, the selected `dokter_id`, `nomor_antrian`, and primary complaint (`keluhan_anamnesa`).
- **AC-003.2**: The system SHALL automatically compute the sequential `nomor_antrian` for today based on the count of visits already registered for the current date plus one.

### FR-004: Billing & Cashier Enforcement
The system SHALL enforce billing rules based on visit patient type.

- **AC-004.1**: WHEN `jenis_pasien` is selected as 'BPJS', THEN the system SHALL automatically set `biaya_periksa` to `0.00`, display "Ditanggung Kapitasi BPJS", and require `no_bpjs` to be filled or confirmed.
- **AC-004.2**: WHEN `jenis_pasien` is selected as 'UMUM', THEN the system SHALL enable the examination fee input with a default value of `150000.00` (Rp 150.000) and allow optional additional procedure fees (`pendapatan_lain`).
- **AC-004.3**: Staff SHALL select payment method: 'Tunai' (Cash) or 'TF' (Bank Transfer).
- **AC-004.4**: WHEN payment is confirmed, THEN the system SHALL mark `status_pembayaran` as 'Lunas'.

### FR-005: Thermal / A5 Printable Receipt
The system SHALL generate an instant receipt view for any completed visit.

- **AC-005.1**: WHEN staff clicks "Kuitansi", THEN a modal SHALL display the official clinic receipt containing: Clinic Header (Klinik Pratama Cikidang Medika), Receipt Number, Date, No RM, Patient Name, Examining Doctor, Itemized Fees, Total Paid, Payment Method, and Cashier signature line.
- **AC-005.2**: WHEN staff clicks "Cetak Kuitansi", THEN the browser print dialog SHALL be triggered with print-optimized CSS (hiding sidebar and navbar).

---

## 8. Business Rules

- **BR-001**: Every visit MUST be linked to a valid `pasien_id` in `public.patients`.
- **BR-002**: BPJS visits CANNOT have a non-zero `biaya_periksa`. Any additional fee must be explicitly recorded under `pendapatan_lain` with an explanation.
- **BR-003**: Currency calculations must store exact decimal values (`NUMERIC(15,2)`) and display with `Rp` prefix and Indonesian thousand separators (e.g. `Rp 150.000`).

---

## 9. Validation Rules

| ID | Input | Rule | Error Behavior |
|---|---|---|---|
| VAL-001 | `nama` | Required, 2-150 characters | "Nama pasien wajib diisi minimal 2 karakter" |
| VAL-002 | `no_rm` | Required, unique, max 30 characters | "Nomor RM wajib diisi dan belum terdaftar" |
| VAL-003 | `desa` | Required | "Desa / alamat domisili wajib dipilih" |
| VAL-004 | `jenis_kelamin` | Must be 'Laki-laki' or 'Perempuan' | "Pilih jenis kelamin valid" |
| VAL-005 | `biaya_periksa` | Must be >= 0 | "Biaya tidak boleh bernilai negatif" |

---

## 10. States and Transitions

### Visit Payment Lifecycle:
`[Baru Didaftarkan] -> [Lunas (Default Kasir)] -> [Selesai Periksa]`

---

## 11. Performance & Non-Functional Requirements

- **NFR-PERF-001**: Autocomplete query latency < 100ms across 4,238 records using PostgreSQL B-tree index on `public.patients(nama)`.
- **NFR-SEC-001**: Input sanitization on all patient text fields to prevent XSS.
- **NFR-RESP-001**: Responsive on desktop (1440px) and tablet viewports for clinic registration counter monitors.

---

## 12. Approval

- Author: Developer
- Status: APPROVED
- Date: 2026-09-19
