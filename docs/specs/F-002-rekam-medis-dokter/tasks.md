---
id: F-002-TASKS
feature: F-002
status: implemented
owner: "Developer"
last_updated: "2026-09-24"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-002 Rekam Medis Ringkas Dokter & Tabbed Clinical Workspace

## Status Legend
- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

---

## Dependency Map

```text
TASK-001 (Linear State Machine & Database Types)
    │
    ├──► TASK-002 (Fix /pendaftaran Filter Tabs & Prevent Premature Payment Button)
    └──► TASK-003 (Revamp ExaminationForm to Tabbed Clinical Workspace)
             │
             ▼
         TASK-004 (Implement "Selesai Periksa & Kirim ke Kasir" Handover Button)
             │
             ▼
         TASK-005 (Integrate Patient History Timeline Tab/Drawer)
             │
             ▼
         TASK-006 (End-to-End Verification & Quality Gate)
```

---

## Task Checklist

### [x] TASK-001 — Linear State Machine & Database Types
- **Objective:** Update `status_pembayaran` in `src/types/database.ts` and set initial registration status to `'Menunggu Dokter'` in `RegisterVisitModal.tsx`.
- **Target Files:**
  - `src/types/database.ts`
  - `src/components/pendaftaran/RegisterVisitModal.tsx`
- **Requirement References:** FR-001, AC-001.1
- **Design Reference:** Section 1, Section 4.1

### [x] TASK-002 — Fix `/pendaftaran` Queue Filter Tabs (Eliminate Redundant Cards)
- **Objective:** Make all queue tab filters mutually exclusive based on `status_pembayaran`. Tab "Menunggu Dokter" ONLY shows `'Menunggu Dokter'`, tab "Menunggu Pembayaran" ONLY shows `'Menunggu Kasir'`, tab "Lunas" ONLY shows `'Lunas'` and `'Ditanggung BPJS'`. Ensure the "Bayar Kasir" button only appears for `'Menunggu Kasir'`.
- **Target File:**
  - `src/app/pendaftaran/page.tsx`
- **Requirement References:** FR-001, AC-001.2, AC-001.4, AC-001.5
- **Design Reference:** Section 1

### [x] TASK-003 — Revamp `ExaminationForm.tsx` to Tabbed Clinical Workspace
- **Objective:** Restructure the monolithic vertical examination form into 3 ergonomic tabs:
  1. *Tab 1: Anamnesa & TTV* (Keluhan awal loket, anamnesa lanjutan, Tekanan Darah/TTV, Peringatan Alergi).
  2. *Tab 2: Diagnosa & Tindakan* (8 Chip ICD-10 terpopuler, Search Autocomplete, Tindakan Medis, Lab Point-of-Care).
  3. *Tab 3: Resep Obat & Kasir* (Template resep cepat, aturan pakai, estimasi biaya tindakan kasir).
- **Target File:**
  - `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-002, AC-002.1, AC-002.3
- **Design Reference:** Section 3

### [x] TASK-004 — Implement Doctor Handover Button ("Selesai Periksa & Kirim ke Kasir")
- **Objective:** Add sticky bottom docked bar with navigation ("Sebelumnya", "Lanjut"), "Simpan Draft", and the primary handover button **"Selesai Periksa & Kirim ke Kasir"**. When clicked, validate ICD-10, update visit status to `'Menunggu Kasir'`, show toast notification, and advance the queue.
- **Target File:**
  - `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-003, AC-003.1, AC-003.2, AC-003.3
- **Design Reference:** Section 3, Section 4.2

### [x] TASK-005 — Integrate Patient History Timeline into Clinical Workspace
- **Objective:** Integrate `PatientHistoryTimeline.tsx` as a 4th tab or quick-access panel inside the examination form so doctors can view previous visit records without scrolling down.
- **Target Files:**
  - `src/components/rekam-medis/ExaminationForm.tsx`
  - `src/app/rekam-medis/page.tsx`
- **Requirement References:** FR-004, AC-004.1, AC-004.2
- **Design Reference:** Section 3

### [x] TASK-006 — End-to-End Verification & Quality Gate
- **Objective:** Run full verification across the entire workspace.
- **Status:** Completed.

### [x] TASK-007 — Multi-Diagnosis ICD-10 Selection & Fix Duplicate Inputs
- **Objective:** Support multiple ICD-10 diagnoses (primary + secondary) with removable badges, eliminate duplicated header and input boxes in Tab 2.
- **Target Files:**
  - `src/components/rekam-medis/Icd10QuickPicker.tsx`
  - `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-002, FR-005, AC-005.1-AC-005.4
- **Status:** Completed.

### [x] TASK-008 — Smart Drug Search & Quick Signa Chips
- **Objective:** Provide instant search across 50+ common outpatient clinic drugs with default signa, plus one-click signa chips for doctors.
- **Target Files:**
  - `src/constants/prescriptions.ts`
  - `src/components/rekam-medis/MedicineQuickSearch.tsx`
  - `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-006, AC-006.1-AC-006.4
- **Status:** Completed.

### [x] TASK-009 — Step-Scoped Action Bar (Handover Only on Final Tab)
- **Objective:** Restrict "Selesai Periksa & Kirim ke Kasir" to Tab 3 (Resep & Kasir). Earlier tabs only display navigation buttons to prevent accidental doctor clicks.
- **Target File:**
  - `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-003, AC-003.1-AC-003.3
- **Status:** Completed.

### [x] TASK-010 — Fix Workstation Completion State & Queue Auto-Advance
- **Objective:** Automatically advance to the next waiting patient upon handover, or cleanly close the workstation and show the standby empty state if no patients remain waiting.
- **Target File:**
  - `src/app/rekam-medis/page.tsx`
- **Requirement References:** FR-007, AC-007.1-AC-007.3
- **Status:** Completed.

### [x] TASK-011 — Kasir & Kuitansi Multi-Diagnosis Display
- **Objective:** Ensure all selected diagnoses are clearly rendered in the payment modal and printed official receipts.
- **Target Files:**
  - `src/components/pendaftaran/PaymentModal.tsx`
  - `src/components/pendaftaran/ReceiptModal.tsx`
- **Requirement References:** FR-005, AC-005.5
- **Status:** Completed.

### [x] TASK-012 — End-to-End Verification & Quality Gate
- **Objective:** Run type check, context validation, and Next.js production build.
- **Target Files:** Entire repository.
- **Status:** Completed (tsc 0 error, validate-context 0 error, build 9/9 routes passed).
