# Requirements Specification — Tab Pemeriksaan Dokter UI/UX Revamp

## 1. Executive Summary & Problem Context

The current Doctor Examination module (`src/app/rekam-medis/page.tsx` and `src/components/rekam-medis/`) serves as the primary clinical workstation for doctors at Klinik Pratama Cikidang Medika. While functional, the existing user interface suffers from significant ergonomic, architectural, and visual shortcomings:

1. **Fragmented Horizontal Sub-Tabs**: The clinical workflow is split into four disjointed tabs (`1. Anamnesa & TTV`, `2. Diagnosa & Tindakan`, `3. Resep & Kasir`, `4. Riwayat Pasien`), forcing doctors to click back and forth between screens to correlate symptoms, past medical history, and prescription drugs.
2. **Repetitive Manual Typing for Routine Cases**: Standard outpatient visits require manual typing for all four vital sign metrics, common ICD-10 diagnostic codes, and standard multi-drug therapy regimens.
3. **Cluttered Patient Header & Scattered Actions**: Administrative actions (`Surat Sakit`, `Surat Rujukan`, `+ TBC`, `+ Sunat`) compete for visual hierarchy with critical patient clinical data (Allergy warnings, BPJS verification, vital trends).
4. **Sub-optimal Queue List Ergonomics**: The queue list lacks prominent token numbering (`#01`, `#02`), quick status categorization, and direct tactile calling actions (`Panggil & Periksa`).
5. **Non-alignment with Canonical Design System**: The current styling uses generic Tailwind shadows, raw native inputs, uncalibrated border radii, and lacks the tactile hardware physics defined in `docs/design-system/01-DESIGN-FOUNDATION.md` and demonstrated in `docs/design-system/component-showcase.html`.

This specification defines the complete structural, ergonomic, and aesthetic overhaul of the **Pemeriksaan Dokter (Doctor Examination)** tab, establishing a unified high-speed clinical workstation.

---

## 2. User Personas & Workflows

### Primary Persona: Dokter Pemeriksa (dr. Ovan / dr. Neneng)
- **Goal**: Rapidly examine 30 to 60 patients per shift, verify past medical history, enter clinical observations with minimal typing friction, select ICD-10 codes, generate prescriptions, and forward completed visits to the cashier/pharmacy.
- **Pain Point**: Repetitive data entry, slow navigation between tabs, cognitive fatigue from uncalibrated UI contrast.

---

## 3. RFC 2119 Acceptance Criteria

### Requirement 1: High-Efficiency Clinical Queue Sidebar (`QueueList`)
- **1.1 Visual Token Numbering**: Each queue card SHALL display a distinct, high-contrast queue token badge (e.g., `#01`, `#05`) styled with monospace typography and status-aware background tints (`amber-100` for waiting, `emerald-100` for completed).
- **1.2 Patient Category Harmonization**: Each patient card SHALL display a canonical jaminan badge (`BPJS` in `emerald-50 text-emerald-800 border-emerald-200`, `Umum` in `blue-50 text-blue-800 border-blue-200`).
- **1.3 Direct Call Action (`Panggil & Periksa`)**: For unexamined patients, each queue card SHALL provide a direct tactile button (`Panggil & Periksa`) with Medical Sapphire styling that activates the patient's record in the workstation immediately without requiring multiple clicks.
- **1.4 Filter Tabs with Tabular Counters**: The queue filter SHALL feature recessed track tabs (`Semua`, `Menunggu`, `Selesai`) with real-time numeric badges in JetBrains Mono.
- **1.5 Empty-Queue Clinical Standby State**: WHEN all patients have been examined or no patients are registered, the queue container SHALL render a polished empty state with clinical icon and contextual reassurance matching `component-showcase.html`.

### Requirement 2: Unified Ergonomic Workstation Layout (`ExaminationForm`)
- **2.1 Consolidated Clinical Flow**: The workstation SHALL organize the primary examination flow into a cohesive, vertically harmonized single-workspace view (or streamlined accordion/view) where:
  - Section 1: Patient Clinical Identity & Allergy Warning Strip
  - Section 2: Vital Signs (TTV) with 1-Click Normal Preset
  - Section 3: Diagnostic ICD-10 Multi-Selection with Instant Autocomplete
  - Section 4: Fast Prescription Packs & Itemized Drug Table
  - Section 5: Point-of-Care Lab & Clinical Procedures
  - Section 6: Integrated Past Medical History Drawer/View
- **2.2 Critical Allergy Safety Banner**: WHEN a patient has a recorded drug allergy, the workstation SHALL render a high-visibility clinical safety banner (`bg-rose-50 border-rose-300 text-rose-900`) with bold allergen highlighting and interactive clash detection with prescribed medications.
- **2.3 Administrative Quick Actions Toolbar**: Specialized clinical actions (`Surat Sakit`, `Surat Rujukan`, `+ Register TBC`, `+ Register Sunat`) SHALL be positioned in a structured secondary action strip with consistent icon sizing (16px) and tactile hover feedback.

### Requirement 3: 1-Click Normal Vitals Preset & Micro-Pulse Feedback
- **3.1 One-Click Normal Adult Preset (`⚡ Isi Normal Dewasa`)**: The vital signs card SHALL include a dedicated tactile preset button that instantly populates physiological baseline metrics:
  - Tekanan Darah (TD): `120/80` mmHg
  - Denyut Nadi (N): `78` bpm
  - Suhu Tubuh (S): `36.5` °C
  - Laju Nafas (RR): `20` x/menit
- **3.2 Pulse Glow Visual Confirmation**: WHEN the normal preset button is clicked, the four vital sign input wells SHALL trigger a subtle 600ms sapphire border pulse (`pulse-glow`) to confirm automated population.
- **3.3 Automated Classification & BMI**: The workstation SHALL calculate and display:
  - Real-time blood pressure classification badge (`Optimal`, `Pre-Hipertensi`, `Hipertensi`) based on systolic/diastolic values.
  - Body Mass Index (BMI) badge with standard clinical categorization based on weight and height inputs.
- **3.4 Sync to Anamnesis Notes**: The workstation SHALL provide a single-click action (`Salin ke Anamnesa`) to append formatted vital sign strings into the chief complaint notes without manual retyping.

### Requirement 4: Instant Multi-ICD-10 Search & Quick-Select Disease Chips
- **4.1 Instant Autocomplete Search**: The diagnostic input SHALL support instant, responsive search querying both Indonesian disease descriptions and international ICD-10 codes with keyboard navigation (`Enter ↵` to select, `ArrowUp`/`ArrowDown` to navigate, `Escape` to dismiss).
- **4.2 Removable Medical Sapphire Diagnostic Chips**: Selected diagnoses SHALL be rendered as distinct pill badges styled with Medical Sapphire gradient (`from-blue-600 to-blue-700`), white text, and an explicit removal cross (`×`).
- **4.3 Multi-Diagnosis Support**: The system SHALL permit multiple diagnoses per visit without limit, designating the first selected diagnosis as primary.
- **4.4 Cikidang Common Disease Quick-Chips**: The workstation SHALL provide 1-click suggestion chips for top rural clinical presentations:
  - `+ Dispepsia (K30)`
  - `+ Hipertensi (I10)`
  - `+ Faringitis (J02.9)`
  - `+ Dermatitis (L23.9)`
  - `+ Diabetes (E11)`
- **4.5 Clinical Program Intelligence**: WHEN selected diagnoses or procedures include tuberculosis codes (`A15`, `A16`, `TBC`) or circumcision terms (`Sunat`, `Sirkum`, `N47`), an intelligent bridge alert SHALL dynamically appear offering 1-click registration to the corresponding special program.

### Requirement 5: 1-Click Prescription Packages & Structured Apotek Table
- **1-Click Clinical Treatment Presets**: The prescription module SHALL feature 1-click preset buttons for standard outpatient regimens:
  - **ISPA Dewasa**: Amoxicillin 500mg (3x1) + Paracetamol 500mg (3x1) + CTM 4mg (3x1)
  - **Maag / Gastritis**: Antasida DOEN (3x1 ac) + Omeprazole 20mg (2x1 ac) + Ranitidin 150mg (2x1 ac)
  - **Alergi / Dermatitis**: Cetirizine 10mg (1x1 malam) + Betametason Krim (2x1 oles)
- **5.2 Structured Medication Table & Custom Search**: The workstation SHALL display an itemized prescription table with item count badges, frequency/dosage indicators, and a clean remove button per item.
- **5.3 Free-Text Dosage Customization**: Doctors SHALL retain the ability to fine-tune dosage, frequency, and instructions in a dedicated monospace text area before submission.
- **5.4 Live Tariff Synchronization**: The billing summary widget SHALL calculate the estimated total bill in real-time, enforcing Rp 0 for BPJS capitation visits and displaying procedural add-on fees transparently.

### Requirement 6: Tactile Hardware Physics & Anti-Slop Visual Standards
- **6.1 Tactile Button Styling**: All primary action buttons SHALL implement `shadow-btn-primary`, specular top inset rim (`inset 0 1px 0 0 rgba(255, 255, 255, 0.28)`), and active compression `active:scale-[0.965]` with explicit bezier timing `cubic-bezier(0.2, 0, 0, 1)`.
- **6.2 Concentric Border Radius**: All nested containers SHALL satisfy $R_{\text{inner}} = R_{\text{outer}} - \text{Padding}$. Card containers (`rounded-3xl` / 24px) with 24px padding SHALL enclose elements with `rounded-xl` (12px) or `rounded-2xl` (16px).
- **6.3 Zero `transition: all`**: The codebase SHALL NOT contain `transition-all` on cards, buttons, or input wells. All transitions SHALL explicitly designate animated properties (`transform`, `box-shadow`, `border-color`, `background-color`).
- **6.4 Typography Discipline**: Headings and labels SHALL use **Plus Jakarta Sans**. Queue numbers, No RM, ICD-10 codes, and monetary values SHALL use **JetBrains Mono** with `tabular-nums`.
- **6.5 Zero AI Slop / Zero Em Dashes**: UI text SHALL NOT use em dashes (`—`). Clear bullet points (`•`), colons, or parentheses SHALL be used exclusively. Code comments SHALL NOT contain decorative ASCII banners (`// ======`) or redundant signature echoes.

### Requirement 7: Mobile & Tablet Responsiveness Mandate
- **7.1 Responsive Reflow**: On mobile viewports (360px–640px) and tablet viewports (768px–1024px), the layout SHALL stack gracefully with smooth auto-scroll to the active workstation upon patient selection.
- **7.2 Touch Target Area**: All interactive triggers, queue cards, and preset buttons SHALL provide a minimum touch target area of 44×44px with at least 8px (`gap-2`) spacing.
- **7.3 Zero Horizontal Page Scroll**: Data tables, prescription lists, and diagnosis chips SHALL wrap cleanly or provide internal overflow scroll containers, preventing any horizontal page scroll on viewports down to 360px.

---

## 4. Non-Functional Requirements & Non-Regression Invariants

- **Invariant 1 (Database Contract)**: Schema in `supabase/migrations/` SHALL NOT be modified. All updates to `visits` SHALL map to existing columns (`keluhan_anamnesa`, `kode_icd10`, `diagnosa_deskripsi`, `terapi_obat`, `tindakan`, `keterangan_tindakan`, `lab`, `lab_hasil`, `biaya_periksa`, `pendapatan_lain`, `keterangan_pendapatan`, `status_pembayaran`).
- **Invariant 2 (Handover Status Flow)**: Clicking `Selesai Periksa & Kirim ke Kasir` SHALL transition `status_pembayaran` to `Menunggu Kasir`, emit real-time state change, and immediately queue the next waiting patient.
- **Invariant 3 (Letter Generation)**: Modals for `SuratSakitModal` and `SuratRujukanModal` SHALL remain fully functional with exact clinic letterheads, doctor signatures, and PDF/print outputs intact.
