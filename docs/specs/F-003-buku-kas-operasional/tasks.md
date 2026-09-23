---
id: F-003-TASKS
feature: F-003
status: approved
owner: "Developer"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-003 Buku Kas Operasional & Kapitasi BPJS

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
TASK-001 (Cash Flow Constants & Categories)
    │
    ├──► TASK-002 (CashFlowSummaryCards Component)
    ├──► TASK-003 (AddCashFlowModal Component)
    ├──► TASK-004 (CashFlowTable Component)
    └──► TASK-005 (CashReconciliationCard Component)
             │
             ▼
TASK-006 (Integrate /buku-kas Main Page)
             │
             ▼
TASK-007 (End-to-End Verification & Quality Gate)
```

---

## Task Checklist

### [x] TASK-001 — Extend Clinic Constants with Cash Flow Categories
- **Objective:** Define `CASH_FLOW_CATEGORIES` in `src/constants/clinic.ts` covering both `Masuk` (Kapitasi BPJS, Setor Tunai, Pendapatan Lain) and `Keluar` (Pengeluaran Obat/Operasional, Pengeluaran Non Klinik, dll.).
- **Target File:** `src/constants/clinic.ts`
- **Requirement References:** FR-001, FR-002, AC-001.1, AC-002.1
- **Design Reference:** Section 1, Section 2.2

### [x] TASK-002 — Build CashFlowSummaryCards Component
- **Objective:** Create `src/components/buku-kas/CashFlowSummaryCards.tsx` rendering 4 responsive KPI cards: Total Pemasukan, Total Pengeluaran, Saldo Kas Bersih, dan Akumulasi Setor Tunai.
- **Target File:** `src/components/buku-kas/CashFlowSummaryCards.tsx`
- **Requirement References:** FR-003, AC-003.1, AC-003.2
- **Design Reference:** Section 2.1

### [x] TASK-003 — Build AddCashFlowModal Component
- **Objective:** Create `src/components/buku-kas/AddCashFlowModal.tsx` modal form for recording Kas Masuk and Kas Keluar with dynamic categories and Rupiah input formatting.
- **Target File:** `src/components/buku-kas/AddCashFlowModal.tsx`
- **Requirement References:** FR-001, FR-002, AC-001.1, AC-001.2, AC-002.1, AC-002.2
- **Design Reference:** Section 2.2, Section 3.2

### [x] TASK-004 — Build CashFlowTable Component
- **Objective:** Create `src/components/buku-kas/CashFlowTable.tsx` presenting cash flow mutation records with type filter tabs, category filter dropdown, live search, and deletion dialog.
- **Target File:** `src/components/buku-kas/CashFlowTable.tsx`
- **Requirement References:** FR-004, FR-006, AC-004.1, AC-004.2, AC-004.3, AC-006.1
- **Design Reference:** Section 2.3, Section 3.3

### [x] TASK-005 — Build CashReconciliationCard Component
- **Objective:** Create `src/components/buku-kas/CashReconciliationCard.tsx` reconciling today's cash payments from `public.visits` with recorded cash deposits to the bank.
- **Target File:** `src/components/buku-kas/CashReconciliationCard.tsx`
- **Requirement References:** FR-005, AC-005.1
- **Design Reference:** Section 2.4, Section 3.4

### [x] TASK-006 — Integrate /buku-kas Main Page
- **Objective:** Connect `src/app/buku-kas/page.tsx` with live Supabase queries, month/year selector, modal controllers, and optimistic UI updates.
- **Target File:** `src/app/buku-kas/page.tsx`
- **Requirement References:** All functional requirements FR-001 through FR-006
- **Design Reference:** Section 1, Section 3

### [x] TASK-007 — End-to-End Verification & Quality Gate
- **Objective:** Run static analysis, type checking (`npx tsc --noEmit`), production build verification (`npm run build`), and context validation (`npm run context:validate`).
- **Commands:** `npx tsc --noEmit`, `npm run build`, `npm run context:validate`
- **Requirement References:** All acceptance criteria

### [x] TASK-008 — Financial UI & Zod Validation Standardization (Phosphor Duotone, Toast, Anti-Slop)
- **Objective:** Upgrade all `/buku-kas` UI components and forms with Zod validation schema, inline field error states, Phosphor Duotone icons, Sonner toast notifications, responsive touch targets (min 44x44px), and antislop-code hygiene.
- **Target Files:**
  - `src/components/buku-kas/AddCashFlowModal.tsx`
  - `src/components/buku-kas/CashFlowSummaryCards.tsx`
  - `src/components/buku-kas/CashFlowTable.tsx`
  - `src/components/buku-kas/CashReconciliationCard.tsx`
  - `src/app/buku-kas/page.tsx`
- **Requirement References:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, AC-001.1, AC-002.1, AC-004.1
