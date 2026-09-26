# Requirements Specification — Program Khusus Medis Tab UI/UX Revamp

## 1. Executive Summary & Problem Context

The **Program Khusus Medis** (`/program-khusus`) module serves as the clinical surveillance hub for three high-impact medical workflows prioritized by dr. Ovan and the medical staff of Klinik Pratama Cikidang Medika:
1. **Kartu Kendali TBC 6 Bulan (DOTS)**: Cohort monitoring for tuberculosis medication compliance, sputum evaluation milestones, and early alert for defaulting patients.
2. **Layanan Sirkumsisi Modern & Foto Klinis**: Minor surgery documentation with high-security private clinical wound photography (WebP < 300KB) and visual healing evaluation.
3. **Agenda Pasien Pos-Rawat**: Scheduled post-hospitalization and post-operative follow-up visits.

### Current Structural & UI Deficiencies
1. **Lack of Operational KPI Summary**: The screen lacks high-level surveillance metrics (e.g., active TB cases, defaulted patients requiring immediate home visit, circumcision procedures this month, and follow-ups due today).
2. **Coarse TBC Visualizer**: The current 6-month progress bar is a simplistic row of uniform colored blocks that does not convey clinical stages (Intensive 4FDC vs. Continuation 2FDC), sputum (BTA) checkpoint dates, or days remaining until the next drug pickup.
3. **Flat Circumcision Presentation**: Procedure cards lack quick filters (by method: Laser, Klamp, Conventional), healing status tags, and side-by-side comparison of immediate post-op vs. day-7 follow-up wound condition.
4. **Static Post-Care Agenda**: Follow-up appointments are shown in a flat list without chronological date grouping (Today, Tomorrow, Upcoming, Overdue) or rapid clinic communication triggers (such as 1-click WhatsApp reminder to patient/family).
5. **Design System Non-Compliance**: Mismatched buttons, lack of double-bezel card shadows, absence of concentric radius formulas, and raw form styling inconsistent with the authoritative Design System (`docs/design-system/01-DESIGN-FOUNDATION.md`, `02-COMPONENT-SPECIFICATIONS.md`, `component-showcase.html`).

---

## 2. RFC 2119 Acceptance Criteria

### Requirement 1: Clinical Header, Segmented Sub-Tab Switcher & KPI Surveillance Surface
- **1.1 Adaptive Master Action Button**: The header SHALL render a prominent tactile primary button styled in Medical Sapphire gradient (`from-blue-600 to-blue-700`) with specular inset rim and `active:scale-[0.965]`. The button action and label SHALL dynamically adapt to the active sub-tab:
  - TBC Tab: `+ Pasien TBC Baru` (opens `NewTbcModal`)
  - Sirkumsisi Tab: `+ Catat Sirkumsisi` (opens `NewCircumcisionModal`)
  - Pos-Rawat Tab: `+ Jadwal Pos-Rawat` (opens `NewPostCareModal`)
- **1.2 Tactile Segmented Sub-Tab Control**: The three program tabs SHALL be presented in a recessed well track (`bg-slate-100/80 border border-slate-200/90 rounded-2xl p-1.5`) featuring:
  - Active tab with elevated double-bezel surface (`bg-white shadow-card-double text-slate-900 border border-slate-200/80`).
  - Tactile badge counter pills with semantic medical tinting (Purple for TB cohort, Medical Sapphire for Circumcision, Emerald for Post-Care).
  - Urgent alert counter badges (e.g., animated red badge for defaulted TB patients, emerald badge for today's post-care queue).
- **1.3 High-Density Program Surveillance KPIs**: The page SHALL feature 3 high-density clinical metric cards equipped with SVG sparklines and active beacon dots:
  - Card 1: `Kohort TBC Aktif` (Total active patients, intensive vs continuation breakdown, and defaulter alert).
  - Card 2: `Tindakan Sirkumsisi` (Procedures completed, top method used, revenue contribution).
  - Card 3: `Agenda Kontrol Pos-Rawat` (Patients scheduled today, completed visits, and overdue follow-ups).
- **1.4 Search & Instant Filter Bar**: Each sub-tab SHALL provide a dedicated search input (by Patient Name or No. RM) and rapid status filter pills without requiring full-page reload.

### Requirement 2: Structural Revamp of Kartu Kendali TBC 6 Bulan
- **2.1 Clinical Journey Progression Stepper**: `TbcControlCard` SHALL replace the crude 6-square grid with an annotated medical stepper:
  - Phase 1: **Fase Intensif** (Months 1-2, Regimen 4FDC, daily observed ingestion).
  - Phase 2: **Fase Lanjutan** (Months 3-6, Regimen 2FDC).
  - Milestone Badges: Dedicated indicators for Sputum Mikroskopis BTA checkpoints at Month 2, Month 5, and End of Treatment (Month 6).
- **2.2 Defaulter Surveillance & Mangkir Warning**:
  - WHEN a patient's expected control date exceeds 7 days without renewal, the card SHALL render a prominent high-contrast red alert badge (`Mangkir Kontrol - Segera Kunjungi / Hubungi PMO`) and highlight the card border with `border-rose-300 ring-2 ring-rose-500/10`.
- **2.3 Patient Clinical Metadata Grouping**: The card header SHALL cleanly display:
  - Patient Name, No. RM (in JetBrains Mono), Age, Village (Desa), Case Type (`Kasus Baru` / `Kambuh` / `Pindahan`), and Treatment Start Date.
- **2.4 Quick Actions & Print Integration**:
  - Each card SHALL include tactile buttons: `Perbarui Status & Sputum` (opens update modal) and `Cetak Kartu TB-01` (triggers `TbTreatmentCardPrint` formatted for print/PDF export).

### Requirement 3: Structural Revamp of Layanan Sirkumsisi Modern & Foto Klinis
- **3.1 High-Density Surgery Grid**: `CircumcisionList` SHALL present procedures in responsive tactile cards featuring:
  - Patient Identity (Child/Adult name, age, village, parent contact).
  - Operator Physician Name and Procedure Date.
  - Method Badge (Laser / Kauter, Klamp / Smart Klamp, Konvensional) with distinct semantic styling.
  - Procedure Fee formatted in tabular monospace (`font-mono text-slate-900 font-bold`).
- **3.2 Dual-Slot Clinical Wound Evaluation**:
  - The card SHALL display two dedicated photo slots: Slot 1 (`Paska Tindakan`) and Slot 2 (`Kontrol H+7 / Pelepasan Klamp`).
  - IF a photo exists: Render a secure thumbnail with signed URL, hover overlay, and privacy watermark indicator.
  - IF Slot 2 is empty: Render a tactile upload placeholder button (`+ Unggah Foto Kontrol`) allowing instant upload of follow-up evaluation photos directly from the card.
- **3.3 Interactive Clinical Lightbox HD Zoom Viewer**:
  - Clicking any wound thumbnail SHALL open a full-featured medical modal lightbox.
  - The lightbox SHALL feature zoom-in, zoom-out, 1:1 reset, image pan, patient clinical context banner (Name, No. RM, Date, Procedure Method), and medical confidentiality watermark.
  - All displayed images SHALL use private signed URLs with 1-hour expiration.

### Requirement 4: Structural Revamp of Agenda Pasien Pos-Rawat
- **4.1 Chronological Timeline Partitioning**: `PostCareAgenda` SHALL group appointments into 4 distinct operational categories:
  - Category A: `Hari Ini` (High priority queue for clinic reception today).
  - Category B: `Terlambat / Overdue` (Patients who missed their scheduled date, requiring active outreach).
  - Category C: `Mendatang` (Future scheduled appointments for planning).
  - Category D: `Riwayat Selesai` (Archived completed post-care visits).
- **4.2 1-Click WhatsApp Clinic Outreach**:
  - For each patient in `Hari Ini` or `Terlambat`, the card SHALL provide a direct `Ingatkan via WhatsApp` button.
  - Clicking the button SHALL format an empathetic, professional Indonesian reminder message pre-filled with patient name, clinic name, scheduled date, and doctor recommendation, opening the official `https://wa.me/{phone}` URL.
- **4.3 Quick Completion & Reschedule Ergonomics**:
  - Single-click action `Tandai Selesai Kontrol` with optimistic UI feedback and confirmation toast.
  - Tactile `Jadwalkan Ulang` action to adjust the next appointment date without deleting the record.

### Requirement 5: Tactile Form Modals & Patient Selection Ergonomics
- **5.1 Elimination of Native `<select>` Elements**: In compliance with `02-COMPONENT-SPECIFICATIONS.md`, all dropdowns in `NewTbcModal`, `NewCircumcisionModal`, and `NewPostCareModal` SHALL use custom floating popovers with `transform-origin: top`, rich option descriptions, and checkmark indicators.
- **5.2 Micro-Shake Validation Physics**: When required fields are missing or invalid, inputs SHALL trigger the tactile `@keyframes microShake` animation with soft red border and supportive Indonesian helper text.
- **5.3 2-Way Mobile-First Image Input**: `NewCircumcisionModal` SHALL maintain the dual-channel upload:
  - Option 1: `Ambil Foto (Kamera)` with `capture="environment"` for direct rear camera photography on clinic tablets and mobile phones.
  - Option 2: `Pilih dari Galeri / Berkas` for laptop and workstation file selection.
  - Automatic HTML5 Canvas compression to WebP (< 300KB) with real-time compression badge (`3.2 MB -> 175 KB WebP`).

---

## 3. Non-Functional Requirements & Anti-Slop Governance

- **NFR-1 (Clinical Modernism Palette)**: Primary elements SHALL use **Medical Sapphire** (`#2563EB`, `#1D4ED8`) paired with **Icy Azure** (`#EFF6FF`). TB Cohort uses **Muted Purple** (`#FAF5FF`, `#6B21A8`). Post-care uses **Emerald** (`#ECFDF5`, `#065F46`).
- **NFR-2 (Concentric Border Radius)**: Outer modal containers (`rounded-3xl` / 24px) with inner elements (`rounded-xl` / 12px or `rounded-2xl` / 16px) following $R_{inner} = R_{outer} - Padding$.
- **NFR-3 (Strict Anti-Slop Copywriting)**: Zero em dashes (`—`) in UI copy. Use bullet points (`•`), colons, or parentheses. Tone must be professional, warm, and clinical.
- **NFR-4 (WCAG AAA Medical Contrast)**: Form labels, vital texts, and status badges SHALL maintain $\ge 7:1$ contrast against card backgrounds (`text-slate-700` minimum).
- **NFR-5 (Mobile & Tablet Responsiveness)**: 100% responsive across viewports 360px–640px (smartphones), 768px–1024px (tablets), and 1024px+ (clinic desktops). Minimum 44×44px touch targets. Zero horizontal page scrolling.
- **NFR-6 (Explicit Motion & No Layout Thrashing)**: Transitions SHALL explicitly name animated properties (`transform`, `opacity`, `border-color`, `box-shadow`). The blanket `transition: all` is strictly prohibited.

---

## 4. Out of Scope

- Integrating with national external government APIs (such as Kemenkes SITB or BPJS P-Care).
- Modifying underlying PostgreSQL schema or Supabase table column names.
- Changes to other operational tabs (`/pendaftaran`, `/rekam-medis`, `/buku-kas`, `/laporan`).
