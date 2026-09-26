---
id: F-008-REQ
feature: F-008
title: "Requirements: RM Pattern, Dual RBAC, Public Health Registers, and Payment Debt"
status: draft
owner: "Developer / Klinik Cikidang Medika"
last_updated: "2026-09-26"
related:
  - "docs/product/prd.md"
  - "docs/specs/F-001-master-pasien-kasir/requirements.md"
  - "docs/specs/F-004-dashboard-laporan/requirements.md"
  - "docs/specs/F-006-program-khusus/requirements.md"
---

# Requirements: F-008 RM Pattern, Dual RBAC, Public Health Registers, and Payment Debt

## 1. Scope Summary

F-008 introduces four connected capabilities requested by clinic stakeholders:

1. New No RM numbering format based on gender code + village code + sequence (`00-00-000000`).
2. Access model simplification from three roles to two active roles (`owner`, `dokter_admin`).
3. Public health recording and reporting MVP for Puskesmas needs (`PTM`, `ANC`, `KB`, `3 Eliminasi`).
4. Cashier payment state enhancement to support debt / unpaid flow with owner authority.

## 2. Confirmed Product Decisions

- RM format: `JK-DESA-URUT` with fixed width `NN-NN-NNNNNN`.
- Gender code:
  - `01` = `Laki-laki`
  - `02` = `Perempuan`
- Village code mapping:
  - `Cikidang=01`, `Pangkalan=02`, `Cicareuh=03`, `Cijambe=04`, `Mekar Nangka=05`, `Cikiray=06`, `Sampora=07`, `Nangka Koneng=08`, `Bumisari=09`, `Taman Sari=10`, `Gunung Malang=11`, `Cikaray Toyibah=12`, `Luar Daerah=13`.
- Legacy RM conversion policy: gradual migration with compatibility mode (legacy RM remains searchable).
- `dokter_admin` route restrictions: CANNOT access `/pendaftaran` and `/buku-kas` and dashboard `/`.
- Puskesmas reporting MVP output: Excel (`.xlsx`) first.
- Debt approval authority: `owner` final authority.

## 3. Functional Requirements

### FR-001: No RM Format and Generation
- **AC-001.1**: WHEN a new patient is created, THEN the system SHALL auto-generate No RM with format `NN-NN-NNNNNN`.
- **AC-001.2**: The first segment SHALL encode patient gender (`01` male, `02` female).
- **AC-001.3**: The second segment SHALL encode village code according to the canonical mapping table in Section 2.
- **AC-001.4**: The third segment SHALL be zero-padded 6-digit sequence number.
- **AC-001.5**: The generated No RM SHALL be unique in `public.patients.no_rm`.
- **AC-001.6**: IF generation fails because of collision, THEN the system SHALL retry safely and return user-readable error when retries are exhausted.

### FR-002: Dual-Role RBAC Simplification
- **AC-002.1**: The active role model SHALL contain `owner` and `dokter_admin`.
- **AC-002.2**: Legacy roles (`dokter`, `kasir`) SHALL be mapped to `dokter_admin` for runtime compatibility.
- **AC-002.3**: `dokter_admin` SHALL NOT access `/`, `/pendaftaran`, `/buku-kas`.
- **AC-002.4**: `dokter_admin` SHALL access `/rekam-medis`, `/program-khusus` (including the public health registry), and the morbidity-only report view in `/laporan`.
- **AC-002.5**: `dokter_admin` SHALL NOT see financial report tabs (`Arus Kas Operasional`, `Komisi Rujukan Bidan`) nor the visit billing recap in `/laporan`.
- **AC-002.6**: `owner` SHALL retain full access to all modules.

### FR-003: Public Health Program Registry (MVP)
- **AC-003.1**: The system SHALL provide data entry for `PTM`, `ANC`, `KB`, and `ELIMINASI_3` records.
- **AC-003.2**: PTM fields SHALL include `nama`, `jenis_kelamin`, `ttl`, `alamat`, `no_nik`, `diagnosa`, `lab`.
- **AC-003.3**: ANC fields SHALL include `nama`, `jenis_kelamin`, `ttl`, `alamat`, `no_nik`, `diagnosa`, `terapi`, and ANC lab marker (`HbSAg`).
- **AC-003.4**: KB fields SHALL include `nama`, `ttl`, `alamat`, `no_nik`, `jenis_kb`, `tanggal_kembali`.
- **AC-003.5**: ELIMINASI_3 fields SHALL include `nama`, `jenis_kelamin`, `ttl`, `alamat`, `no_nik`, `diagnosa`, `lab`.
- **AC-003.6**: Health records SHALL be filterable by date and program type.
- **AC-003.7**: Health records SHALL be exportable to `.xlsx`.

### FR-004: Referral and Commission Tracking (MVP Baseline)
- **AC-004.1**: The system SHALL record referral source (bidan) per relevant patient case.
- **AC-004.2**: The system SHALL tag commission-eligible service categories (`infus`, `usg`, `lab`).
- **AC-004.3**: The system SHALL provide yearly aggregation per referral source.
- **AC-004.4**: Commission formula in MVP SHALL default to fixed nominal per eligible service and remain configurable in constants.

### FR-005: Payment States, Debt, and Owner Approval
- **AC-005.1**: Visit payment state SHALL support `Lunas`, `Ditanggung BPJS`, `Belum Bayar`, and `Piutang`.
- **AC-005.2**: IF payment state is `Piutang`, THEN the system SHALL store debt amount and payment notes.
- **AC-005.3**: Partial or deferred payment transitions SHALL require owner approval for final closure.
- **AC-005.4**: Currency input UI SHALL accept and display Indonesian Rupiah format (`Rp 200.000`) consistently.

## 4. Non-Functional Requirements

- **NFR-001 (Security)**: NIK and health program data SHALL respect role-based visibility and must not be logged in plain text.
- **NFR-002 (Data Integrity)**: No RM uniqueness and numeric accuracy SHALL be enforced at database and UI boundaries.
- **NFR-003 (Responsiveness)**: New forms and tables SHALL remain mobile/tablet responsive with no page horizontal overflow.
- **NFR-004 (Backward Compatibility)**: Existing patient search and visit history SHALL remain functional for legacy No RM values.

## 5. Out of Scope (This MVP Slice)

- BPJS P-Care integration.
- Automated WhatsApp reminders.
- Final legal compensation contract automation.
- PDF-first reporting (Excel-first only in this slice).
