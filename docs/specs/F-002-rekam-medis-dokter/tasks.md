---
id: F-002-TASKS
feature: F-002
status: approved
owner: "Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-002 Rekam Medis Ringkas Dokter

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
TASK-001 (ICD-10 Constants & Presets)
    │
    ├──► TASK-002 (QueueList Component)
    ├──► TASK-003 (Icd10QuickPicker Component)
    └──► TASK-004 (PatientHistoryTimeline Component)
             │
             ▼
TASK-005 (ExaminationForm Component)
             │
             ▼
TASK-006 (Integrate /rekam-medis Master-Detail Page)
             │
             ▼
TASK-007 (End-to-End Verification & Quality Gate)
```

---

## Task Checklist

### [x] TASK-001 — Create ICD-10 Constants & Popular Codes Dictionary
- **Objective:** Create `src/constants/icd10.ts` with top 8 clinic ICD-10 presets and a searchable catalog of common outpatient diagnoses.
- **Target File:** `src/constants/icd10.ts`
- **Requirement References:** FR-003, AC-003.1, AC-003.3
- **Design Reference:** Section 2

### [x] TASK-002 — Build QueueList Component
- **Objective:** Create `src/components/rekam-medis/QueueList.tsx` displaying today's patient queue with status filters (Semua, Menunggu, Selesai) and selection callback.
- **Target File:** `src/components/rekam-medis/QueueList.tsx`
- **Requirement References:** FR-001, AC-001.1, AC-001.2, AC-001.3
- **Design Reference:** Section 1, Section 3.1

### [x] TASK-003 — Build Icd10QuickPicker Component
- **Objective:** Create `src/components/rekam-medis/Icd10QuickPicker.tsx` rendering quick-pick chips for the 8 top diagnoses and an instant search input for other ICD-10 codes.
- **Target File:** `src/components/rekam-medis/Icd10QuickPicker.tsx`
- **Requirement References:** FR-003, AC-003.1, AC-003.2, AC-003.3
- **Design Reference:** Section 2

### [x] TASK-004 — Build PatientHistoryTimeline Component
- **Objective:** Create `src/components/rekam-medis/PatientHistoryTimeline.tsx` displaying past medical visits for the selected patient with past diagnoses, doctors, and medications.
- **Target File:** `src/components/rekam-medis/PatientHistoryTimeline.tsx`
- **Requirement References:** FR-006, AC-006.1, AC-006.2
- **Design Reference:** Section 3.2

### [x] TASK-005 — Build ExaminationForm Component
- **Objective:** Create `src/components/rekam-medis/ExaminationForm.tsx` containing patient identity header, anamnesis, vital signs, ICD-10 picker, prescription, and procedure inputs.
- **Target File:** `src/components/rekam-medis/ExaminationForm.tsx`
- **Requirement References:** FR-002, FR-004, FR-005, AC-005.1, AC-005.2
- **Design Reference:** Section 1, Section 3.3

### [x] TASK-006 — Integrate Master-Detail Rekam Medis Page
- **Objective:** Connect `src/app/rekam-medis/page.tsx` with live Supabase queries, real-time queue management, and examination submission.
- **Target File:** `src/app/rekam-medis/page.tsx`
- **Requirement References:** All functional requirements FR-001 through FR-006
- **Design Reference:** Section 1, Section 3

### [x] TASK-007 — End-to-End Verification & Quality Gate
- **Objective:** Run static analysis, type checking (`npx tsc --noEmit`), production build verification (`npm run build`), and context validation (`npm run context:validate`).
- **Commands:** `npx tsc --noEmit`, `npm run build`, `npm run context:validate`
- **Requirement References:** All acceptance criteria

### [x] TASK-008 — Medical UI & Clinical Standardization (Phosphor Duotone, Vital Signs, Quick Presets, Toast)
- **Objective:** Standardize `QueueList.tsx`, `ExaminationForm.tsx`, `Icd10QuickPicker.tsx`, and `PatientHistoryTimeline.tsx` with Phosphor Duotone + Health Icons, structured vital signs classification, popular prescription preset chips, Sonner toast feedback, and antislop-code hygiene.
- **Target Files:** `src/components/rekam-medis/*`, `src/app/rekam-medis/page.tsx`
- **Requirement References:** FR-001 through FR-006, Quality Locks, Anti-Slop Delivery Gate


