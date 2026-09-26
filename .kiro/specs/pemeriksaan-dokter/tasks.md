# Implementation Tasks Checklist — Tab Pemeriksaan Dokter UI/UX Revamp

## Phase 1: Shared Primitives & Styles Alignment

- [x] **Task 1.1**: Ensure design system CSS utilities (tactile buttons, pulse glow, double-bezel shadows, ambient canvas) are defined in `src/app/globals.css`.
  - _Files_: `src/app/globals.css`
  - _Requirements_: 6.1, 6.2, 6.3
  - _Details_: Added `.pulse-glow` and `.animate-popover` to `src/app/globals.css`. Verified `shadow-btn-primary`, `shadow-card-double`, `shadow-well`, `shadow-popover`, and `.tactile-btn`.

---

## Phase 2: High-Efficiency Queue Sidebar (`QueueList`)

- [x] **Task 2.1**: Refactor `QueueList.tsx` to match canonical patient queue styling from `component-showcase.html`.
  - _Files_: `src/components/rekam-medis/QueueList.tsx`
  - _Requirements_: 1.1, 1.2, 1.3, 1.4, 1.5, 7.2
  - _Details_:
    - Added token number box (`#01`, `#02`, `#05`) with amber/emerald styling.
    - Implemented direct `Panggil & Periksa` button with Medical Sapphire tactile styling.
    - Implemented recessed track tabs (`Semua`, `Menunggu`, `Selesai`) with JetBrains Mono counter badges.
    - Added polished empty-queue illustration with clinical reassurance copy.
    - Ensured minimum 44px tap targets for mobile/tablet.

---

## Phase 3: Ergonomic Vital Signs Component (`VitalsWidget`)

- [x] **Task 3.1**: Build extracted/enhanced `VitalsWidget.tsx` with 1-click normal adult preset and pulse glow feedback.
  - _Files_: `src/components/rekam-medis/VitalsWidget.tsx`
  - _Requirements_: 3.1, 3.2, 3.3, 3.4, 6.1, 6.2
  - _Details_:
    - Four recessed input wells: Tekanan Darah (mmHg), Denyut Nadi (bpm), Suhu Tubuh (°C), Laju Nafas (x/mnt).
    - `⚡ Isi Normal Dewasa (1-Klik)` tactile preset button triggering 600ms pulse glow feedback.
    - Real-time blood pressure classification badge (`Optimal`, `Pre-Hipertensi`, `Hipertensi`).
    - Body Mass Index (BMI) calculator with weight (kg) and height (cm).
    - `Salin ke Anamnesa` sync action button.

---

## Phase 4: Instant Multi-ICD-10 Diagnostic Picker (`Icd10QuickPicker`)

- [x] **Task 4.1**: Upgrade `Icd10QuickPicker.tsx` with high-speed autocomplete, keyboard navigation, and rural clinical quick-chips.
  - _Files_: `src/components/rekam-medis/Icd10QuickPicker.tsx`
  - _Requirements_: 4.1, 4.2, 4.3, 4.4, 4.5
  - _Details_:
    - Instant search input with `Enter ↵` keyboard support and floating popover suggestions (`transform-origin: top`).
    - Medical Sapphire active diagnostic chips (`from-blue-600 to-blue-700`) with removal cross (`×`).
    - Quick-add chips for common rural diseases: Dispepsia (K30), Hipertensi (I10), Faringitis (J02.9), Dermatitis (L23.9), Diabetes (E11).
    - Special program bridge alert for TBC and Circumcision detection.

---

## Phase 5: 1-Click Prescription Packages & Structured Apotek Table (`PrescriptionQuickPicker`)

- [x] **Task 5.1**: Build `PrescriptionQuickPicker.tsx` featuring 1-click clinical therapy presets and structured medication table.
  - _Files_: `src/components/rekam-medis/PrescriptionQuickPicker.tsx`
  - _Requirements_: 5.1, 5.2, 5.3, 5.4, 2.2
  - _Details_:
    - Three 1-click preset buttons: ISPA Dewasa, Maag / Gastritis, Alergi / Dermatitis.
    - Structured medication table with item counter badge and remove buttons.
    - Free-text textarea for custom dosage notes with monospace typography.
    - Allergy clash detector displaying bold warning if prescribed medication matches patient's recorded allergies.
    - Billing tariff summary with Rp 0 BPJS indicator and real-time total calculation.

---

## Phase 6: Unified Clinical Workstation Integration (`ExaminationForm`)

- [x] **Task 6.1**: Re-architect `ExaminationForm.tsx` into a unified high-speed clinical workstation.
  - _Files_: `src/components/rekam-medis/ExaminationForm.tsx`
  - _Requirements_: 2.1, 2.2, 2.3, 6.1, 6.2, 6.4, 6.5, 7.1, 7.3
  - _Details_:
    - Replaced fragmented 4-step pagination with a clean, cohesive clinical stream.
    - Header: Patient identity, No RM, BPJS/Umum badge, village, age, and administrative action toolbar (`Surat Sakit`, `Surat Rujukan`, `+ TBC`, `+ Sunat`).
    - Embedded `VitalsWidget`, `Icd10QuickPicker`, and `PrescriptionQuickPicker`.
    - Point-of-care laboratory (GDS, Asam Urat, Hb) and clinical procedures section.
    - Collapsible previous patient visits timeline (`PatientHistoryTimeline`).
    - Sticky bottom tactile action bar with `Simpan Draft` and `Selesai Periksa & Kirim ke Kasir` (Medical Sapphire gradient).

---

## Phase 7: Main Route Layout & Standby View Refinement (`page.tsx`)

- [x] **Task 7.1**: Polish `src/app/rekam-medis/page.tsx` with canonical header, date picker, and standby states.
  - _Files_: `src/app/rekam-medis/page.tsx`
  - _Requirements_: 1.5, 6.1, 7.1
  - _Details_:
    - Top header with Medical Sapphire stethoscope icon, date picker, today button, and live refresh spin indicator.
    - Polished empty standby states for: (a) all patients completed, and (b) no patient selected.
    - Mobile scroll-to-workstation anchor (`#exam-workstation`).

---

## Phase 8: Quality Gates & Verification

- [x] **Task 8.1**: Execute TypeScript typecheck and verify zero type errors.
  - _Command_: `npx tsc --noEmit`
  - _Requirements_: All (PASSED with code 0)

- [x] **Task 8.2**: Execute Next.js linter and code quality checks.
  - _Command_: `npm run lint`
  - _Requirements_: All (PASSED with code 0)

- [x] **Task 8.3**: Execute production build to verify zero bundling or hydration regressions.
  - _Command_: `npm run build`
  - _Requirements_: All (PASSED with code 0, 8/8 routes compiled)

- [x] **Task 8.4**: Mobile & Tablet viewport responsiveness verification (360px, 768px, 1024px) ensuring zero horizontal scroll and minimum 44px touch targets.
  - _Requirements_: 7.1, 7.2, 7.3
