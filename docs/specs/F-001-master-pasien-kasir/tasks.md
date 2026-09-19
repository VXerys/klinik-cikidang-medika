---
id: F-001-TASKS
feature: F-001
status: approved
owner: Developer
last_updated: 2026-09-19
last_verified_commit: initial-tasks
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-001 Master Pasien & Loket Kasir

## Execution Rules

1. Execute one task at a time.
2. Read referenced requirements before editing.
3. Verify type check and lint after each task.
4. Record progress in the SDD ledger and update checkboxes.

---

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

---

## Dependency Map

```text
TASK-001 (Autocomplete Search Component)
   ├──► TASK-002 (New Patient Modal)
   ├──► TASK-003 (Register Visit Modal)
   └──► TASK-004 (Receipt Modal)
            │
            ▼
TASK-005 (Integrate Pendaftaran & Kasir Page)
            │
            ▼
TASK-006 (End-to-End Verification & Quality Gate)
```

---

## Task Checklist

### [x] TASK-001 — Build PatientSearchAutocomplete Component
- **Objective:** Create a search component with 250ms debounced queries against `public.patients` by `no_rm`, `nama`, or `desa`.
- **Target File:** `src/components/pendaftaran/PatientSearchAutocomplete.tsx`
- **Requirement References:** FR-001, AC-001.1, AC-001.2, AC-001.3
- **Design Reference:** Section 4.1

### [x] TASK-002 — Build NewPatientModal Component
- **Objective:** Create a modal form to input a new patient, with automated unique No RM sequence computation and validation.
- **Target File:** `src/components/pendaftaran/NewPatientModal.tsx`
- **Requirement References:** FR-002, AC-002.1, AC-002.2, AC-002.3, AC-002.4
- **Design Reference:** Section 4.2, Section 4.3

### [x] TASK-003 — Build RegisterVisitModal Component
- **Objective:** Create a modal to register today's visit for a selected patient, choose doctor, set BPJS (Rp 0) vs Umum tariff, and choose payment method.
- **Target File:** `src/components/pendaftaran/RegisterVisitModal.tsx`
- **Requirement References:** FR-003, FR-004, AC-003.1, AC-003.2, AC-004.1, AC-004.2, AC-004.3, AC-004.4
- **Design Reference:** Section 4.4

### [x] TASK-004 — Build ReceiptModal Component
- **Objective:** Create a clean printable receipt modal with clinic branding, breakdown of charges, and print-optimized CSS.
- **Target File:** `src/components/pendaftaran/ReceiptModal.tsx`
- **Requirement References:** FR-005, AC-005.1, AC-005.2
- **Design Reference:** Section 2, Section 5

### [x] TASK-005 — Integrate Main Pendaftaran Page with Live Supabase Data
- **Objective:** Connect `src/app/pendaftaran/page.tsx` with live `visits` query for today's queue, wire search autocomplete, modals, and queue actions.
- **Target File:** `src/app/pendaftaran/page.tsx`
- **Requirement References:** FR-001 through FR-005
- **Design Reference:** Section 3, Section 4.5

### [x] TASK-006 — End-to-End Verification & Quality Gate
- **Objective:** Run static analysis, type checking (`npx tsc --noEmit`), and production build verification (`npm run build`) to ensure zero errors and seamless live execution.
- **Commands:** `npx tsc --noEmit`, `npm run build`, `npm run context:validate`
- **Requirement References:** All acceptance criteria
