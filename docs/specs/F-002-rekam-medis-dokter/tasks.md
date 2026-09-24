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
- **Objective:** Run full verification across the entire workspace:
  - TypeScript type check: `npx tsc --noEmit`
  - Context documentation check: `node scripts/context/validate-context.mjs`
  - Next.js production build: `npm run build`
  - Verify zero card redundancy in `/pendaftaran` and smooth tabbed UX in `/rekam-medis`.
- **Target:** All automated checks pass with 0 errors.
