---
id: F-008-DESIGN
feature: F-008
title: "Technical Design: RM Pattern, Dual RBAC, Public Health Registers, and Payment Debt"
status: draft
owner: "Developer"
last_updated: "2026-09-26"
related:
  - "requirements.md"
---

# Technical Design: F-008

## 1. Component and Module Delta

### Modified
1. `src/constants/clinic.ts`
   - Canonical village option + code table for RM generation.
2. `src/components/pendaftaran/NewPatientModal.tsx`
   - RM generator logic (`JK-DESA-URUT`) and format validation.
3. `src/lib/auth/AuthContext.tsx`
   - Dual-role runtime model + route permissions.
4. `src/types/database.ts`
   - User role union update and new health/debt types.
5. `src/app/login/page.tsx`
   - Quick account cards aligned to two-role model.
6. `src/app/laporan/page.tsx` and `src/components/laporan/*`
   - Role-aware report visibility and financial masking for `dokter_admin`.
7. `src/components/pendaftaran/CashierPosPanel.tsx`
   - Rupiah-friendly tender input + debt state transitions.

### New
1. `supabase/migrations/<timestamp>_f008_public_health_and_payment_states.sql`
   - Public health registry and referral commission tables.
   - Payment/debt extension columns on `visits`.
2. `src/components/program-khusus/PublicHealthRegistry.tsx` (MVP scope)
   - PTM/ANC/KB/ELIMINASI_3 input + list.

## 2. Data Model Additions

### 2.1 `public.public_health_records`
- Unified table to reduce repeated schema for 4 programs.
- `program_type` constrained to `PTM | ANC | KB | ELIMINASI_3`.
- Snapshot fields retained (`nama`, `jk`, `ttl`, `alamat`, `no_nik`) to preserve reporting history.
- Program-specific optional fields: `diagnosa`, `lab`, `terapi`, `jenis_kb`, `tanggal_kembali`, `hbsag`.

### 2.2 `public.referral_commissions`
- Captures referral source and eligible service categories.
- Stores fixed nominal amount in MVP and paid/unpaid status.

### 2.3 `public.visits` payment extensions
- New columns: `payment_state`, `piutang_nominal`, `piutang_note`, `piutang_approved_by_owner_at`.
- Preserve existing columns for backward compatibility.

## 3. No RM Generation Algorithm

1. Derive `jkCode` from selected gender.
2. Derive `desaCode` from canonical village mapping.
3. Build prefix `${jkCode}-${desaCode}`.
4. Query latest `no_rm` with prefix pattern `${prefix}-%`.
5. Parse last 6-digit sequence, increment by 1.
6. Pad sequence to 6 digits and compose final RM.

Fallback behavior:
- If parsing fails, restart from `000001`.
- Server uniqueness remains last-line protection.

## 4. Role and Access Model

- Canonical active roles: `owner`, `dokter_admin`.
- Legacy metadata mapping at auth parsing layer:
  - `dokter` => `dokter_admin`
  - `kasir` => `dokter_admin`
- Route guard remains centralized in `AppLayout` + `canAccessRoute`.

## 5. Reporting Visibility Rules

- `owner`: full tabs (`kunjungan`, `morbiditas`, `buku_kas`, health reports).
- `dokter_admin`: only health and clinical report slices; financial tabs hidden.
- Export actions follow visible tabs only.

## 6. Payment/Debt Flow

Before:
`Menunggu Dokter -> Menunggu Kasir -> Lunas`

After:
`Menunggu Dokter -> Menunggu Kasir -> {Lunas | Ditanggung BPJS | Belum Bayar | Piutang}`

Owner action:
`Piutang -> (Owner Approve Settlement) -> Lunas`

## 7. Error Handling

- RM generation conflict: show `Nomor RM sudah dipakai, sistem mencoba ulang...`.
- Invalid village mapping: block submit with explicit message.
- Unauthorized route/module access: keep existing route guard warning.
- Piutang approval by non-owner: reject with role-aware message.

## 8. Dropdown Consistency Standard (UI Contract)

All selection controls that are not native browser chrome SHALL use the shared custom `Select` component (`src/components/ui/Select.tsx`) rather than a raw `<select>` element. This guarantees one visual language (white rounded popover, teal hover, check-mark on the active option) across every form and filter.

Adopted in:

- `src/components/pendaftaran/NewPatientModal.tsx` (gelar, jenis kelamin, desa)
- `src/components/pendaftaran/EditPatientModal.tsx` (same fields, with legacy village preserved as a selectable option)
- `src/components/pendaftaran/RegisterVisitModal.tsx` (dokter pemeriksa)
- `src/components/program-khusus/NewPublicHealthModal.tsx` (jenis kelamin, HbSAg, jenis KB)
- `src/components/laporan/NewReferralCommissionModal.tsx` (tahun komisi)
- `src/components/laporan/ReferralCommissionPanel.tsx` (filter tahun)
- `src/components/laporan/ReportPreviewTable.tsx` (jumlah baris)
- `src/components/rekam-medis/SuratSakitModal.tsx` (dokter pemeriksa)
- `src/components/rekam-medis/SuratRujukanModal.tsx` (faskes, poli, dokter perujuk)

Layout rule for paired fields: each label SHALL stay on a single line, and any accompanying hint SHALL be placed below its control as helper text. This keeps side-by-side controls vertically aligned.

Known limitation: inside modal containers that scroll, the popover is clipped by the scroll area and may require scrolling to reveal all options. Acceptable for MVP; a portal-based popover is the follow-up fix if it becomes disruptive.
