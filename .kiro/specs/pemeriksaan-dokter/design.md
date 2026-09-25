# Technical Design Specification — Tab Pemeriksaan Dokter UI/UX Revamp

## 1. Architectural Overview & Design Philosophy

The revamp of Tab Pemeriksaan Dokter (*Doctor's Examination / EMR*) transforms a fragmented four-step form into a **high-speed unified clinical workstation**. Modeled directly after the clinic's canonical design system (`docs/design-system/01-DESIGN-FOUNDATION.md`, `02-COMPONENT-SPECIFICATIONS.md`) and the interactive showcase (`docs/design-system/component-showcase.html`), the design balances **clinical ergonomics**, **tactile hardware feedback**, and **strict mobile/tablet responsiveness**.

### Design Synthesis (Clinical Modernism)
- **Palette**: Medical Sapphire (`#2563EB` / `#1D4ED8`) primary brand accent, Icy Azure (`#F0F7FF`) ambient highlights, BPJS Emerald (`#059669`) for national insurance status, and warm Amber (`#D97706`) for queue waiting states.
- **Surface Elevation**: Concentric border radius ($R_{\text{inner}} = R_{\text{outer}} - \text{Padding}$), double-bezel card shadows (`shadow-card-double`), and tactile hardware button physics (`active:scale-[0.965]`, specular top highlight `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.28)`).
- **Zero AI Slop**: No em dashes in copy, no `transition: all`, explicit CSS cubic-beziers, WCAG AAA text contrast, and Plus Jakarta Sans paired with JetBrains Mono `tabular-nums`.

---

## 2. Before vs. After UI/UX Architecture

### 2.1 Current Implementation (Fragmented 4-Tab State)
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Rekam Medis (Date Picker, Refresh)                                  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Queue List (Left Column, lg:col-4)   │ Workstation (Right Column, lg:col-8) │
│ - Simple list items                  │ ┌──────────────────────────────────┐ │
│ - Uncalibrated badge styles          │ │ Patient Summary Header           │ │
│ - No instant call action             │ ├──────────────────────────────────┤ │
│                                      │ │ [Tab 1: Anamnesa & TTV]          │ │
│                                      │ │ [Tab 2: Diagnosa & Tindakan]     │ │
│                                      │ │ [Tab 3: Resep & Kasir]           │ │
│                                      │ │ [Tab 4: Riwayat Pasien]          │ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ Active Tab Form Content          │ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ Stepper Bottom Bar (Prev / Next) │ │
│                                      │ └──────────────────────────────────┘ │
└──────────────────────────────────────┴──────────────────────────────────────┘
* Defect: Doctors must step sequentially through 4 tabs just to diagnose and prescribe routine patients.
```

### 2.2 Revamped Implementation (Unified High-Speed Clinical Workstation)
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Rekam Medis & Ruang Periksa Dokter (Sapphire Pill, Date, Today Btn) │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Queue Panel (lg:col-span-4 / xl:3)   │ Clinical Workstation (lg:col-8 / xl:9│
│ ┌──────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ Header: Antrean Pasien Poli 1    │ │ │ Patient Identity & Status Banner │ │
│ │ - Track Tabs: Semua/Tunggu/Done  │ │ │ - No RM, BPJS/Umum, Desa, Usia   │ │
│ │ - Monospace Live Counter Pills   │ │ │ - [Surat Sakit] [Rujukan]        │ │
│ │ - Instant Patient Search Input   │ │ │ - [+ TBC] [+ Sunat] Actions      │ │
│ ├──────────────────────────────────┤ │ ├──────────────────────────────────┤ │
│ │ Queue Cards (#01, #02, #05):     │ │ │ Critical Allergy Warning Strip   │ │
│ │ - Bold Token Number Badge        │ │ │ (Pulse accent + clash indicator) │ │
│ │ - Patient Name + Jaminan Tag     │ │ ├──────────────────────────────────┤ │
│ │ - No RM • Keluhan Utama          │ │ │ 1. Tanda-Tanda Vital Pasien      │ │
│ │ - Tactile [Panggil & Periksa] Btn│ │ │ - [⚡ Isi Normal Dewasa (1-Klik)] │ │
│ └──────────────────────────────────┘ │ │ - 4 Recessed Wells: TD, N, S, RR │ │
│                                      │ │ - Realtime Blood Pressure & BMI  │ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ 2. Diagnosa ICD-10 Multi-Select  │ │
│                                      │ │ - Instant Autocomplete Input     │ │
│                                      │ │ - Medical Sapphire Active Chips  │ │
│                                      │ │ - 5 Rural Quick-Chips (Dispepsia)│ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ 3. Terapi Obat & Resep Apotek    │ │
│                                      │ │ - 1-Klik Presets: ISPA, Maag, DLL│ │
│                                      │ │ - Itemized Prescription Table    │ │
│                                      │ │ - Free-Text Dosage Customization │ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ 4. Prosedur & Lab Point-of-Care  │ │
│                                      │ │ - GDS, Asam Urat, Hb, Tindakan   │ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ 5. Riwayat Pasien (Collapsible)  │ │
│                                      │ │ - Instant Timeline of Past Visits│ │
│                                      │ ├──────────────────────────────────┤ │
│                                      │ │ Sticky Bottom Tactile Action Bar │ │
│                                      │ │ - [Tunda Periksa]                │ │
│                                      │ │ - [Simpan Draft]                 │ │
│                                      │ │ - [Selesai Periksa & Kirim Kasir]│ │
│                                      │ └──────────────────────────────────┘ │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Component Inventory & Modifications

| Component Path | Status | Revamp Description |
|---|---|---|
| `src/app/rekam-medis/page.tsx` | **Modified** | Main layout container, date selector, live Supabase subscription, workstation scroll anchor, and standby illustrations. |
| `src/components/rekam-medis/QueueList.tsx` | **Modified** | Polished queue list with token cards (`#01`), tactile call buttons (`Panggil & Periksa`), recessed status track, and empty-queue state. |
| `src/components/rekam-medis/ExaminationForm.tsx` | **Rewritten** | Unified clinical workstation integrating vitals, ICD-10, prescriptions, procedures, and sticky bottom bar without tedious tab friction. |
| `src/components/rekam-medis/VitalsWidget.tsx` | **New** | Extracted tactile vitals module with 1-click normal preset (`⚡ Isi Normal Dewasa`), pulse glow feedback, and BMI/BP classification. |
| `src/components/rekam-medis/Icd10QuickPicker.tsx` | **Modified** | Instant search dropdown with keyboard navigation, active sapphire chips, and rural clinical quick-add chips. |
| `src/components/rekam-medis/PrescriptionQuickPicker.tsx` | **New** | 1-click clinical therapy presets (ISPA, Gastritis, Alergi) + itemized prescription list + signa tags. |
| `src/components/rekam-medis/PatientHistoryTimeline.tsx` | **Modified** | Integrated collapsible timeline of previous patient visits with compact diagnosis and drug badges. |
| `src/components/rekam-medis/SuratSakitModal.tsx` | **Preserved / Polished** | Formal Medical Letterhead modal with tactile modal styling. |
| `src/components/rekam-medis/SuratRujukanModal.tsx` | **Preserved / Polished** | External Referral Letter modal with tactile modal styling. |

---

## 4. State Management & Data Contracts

### 4.1 Workstation Form State Interface
```typescript
interface ExaminationWorkstationState {
  // Anamnesis & Physical
  keluhan: string;
  
  // Vital Signs
  sistol: string;
  diastol: string;
  nadi: string;
  suhu: string;
  pernapasan: string;
  beratBadan: string;
  tinggiBadan: string;
  
  // Diagnoses
  diagnoses: DiagnosisItem[]; // { code: string; name: string; isPrimary: boolean }
  
  // Medication & Therapy
  prescriptionItems: PrescriptionItem[]; // { nama: string; dosis: string; aturan: string; jumlah: number }
  terapiObatFreeText: string;
  
  // Procedures & Point-of-Care Lab
  tindakan: string;
  keteranganTindakan: string;
  lab: string;
  labHasil: string;
  
  // Billing & Tariffs (Handover to Cashier)
  biayaPeriksa: number;
  pendapatanLain: number;
  keteranganPendapatan: string;
  
  // UI & Interaction Flags
  isSaving: boolean;
  pulseGlowVitals: boolean;
  activeHistoryOpen: boolean;
}
```

### 4.2 Database Serialization Mapping
```text
State Property                    Database Column (`visits`)
──────────────────────────────────────────────────────────────────
keluhan + [TTV: ...]          ──> keluhan_anamnesa
diagnoses[].code (joined ',') ──> kode_icd10
diagnoses[].name (joined ';') ──> diagnosa_deskripsi
terapiObatFreeText            ──> terapi_obat
tindakan                      ──> tindakan
keteranganTindakan            ──> keterangan_tindakan
lab                           ──> lab
labHasil                      ──> lab_hasil
biayaPeriksa (Rp 0 for BPJS)  ──> biaya_periksa
pendapatanLain                ──> pendapatan_lain
keteranganPendapatan          ──> keterangan_pendapatan
targetStatus ('Menunggu Kasir')─> status_pembayaran
```

---

## 5. Ergonomic Innovations & Interactive Details

### 5.1 1-Click Normal Vitals Preset (`fillNormalVitals`)
- Button: `inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold tactile-btn`.
- Behavior:
  - `sistol` $\leftarrow 120$
  - `diastol` $\leftarrow 80$
  - `nadi` $\leftarrow 78$
  - `suhu` $\leftarrow 36.5$
  - `pernapasan` $\leftarrow 20$
- Feedback: Triggers `pulseGlowVitals = true` for 600ms, applying `.pulse-glow` class with sapphire border ring animation.

### 5.2 1-Click Prescription Therapy Presets (`fillPresetResep`)
- Pre-configured regimens:
  1. **ISPA Dewasa**:
     - Amoxicillin 500 mg (3x1 tab pc - 10 tab)
     - Paracetamol 500 mg (3x1 tab prn - 10 tab)
     - CTM 4 mg (3x1 tab - 10 tab)
  2. **Maag / Gastritis**:
     - Antasida DOEN (3x1 tab kunyah ac - 10 tab)
     - Omeprazole 20 mg (2x1 kap ac - 10 kap)
     - Ranitidin 150 mg (2x1 tab ac - 10 tab)
  3. **Alergi / Dermatitis**:
     - Cetirizine 10 mg (1x1 tab malam - 10 tab)
     - Betametason Krim 0.1% (2x1 oles tipis - 1 tube)
- Clicking a preset automatically adds items to the prescription list and synchronizes with the editable free-text area.

### 5.3 Multi-Diagnosa ICD-10 Instant Autocomplete
- Dedicated search box with instantaneous matching across 200+ common ICD-10 entries.
- Quick rural disease pills: `+ Dispepsia (K30)`, `+ Hipertensi (I10)`, `+ Faringitis (J02.9)`, `+ Dermatitis (L23.9)`, `+ Diabetes (E11)`.
- Chips rendered with Medical Sapphire gradient (`from-blue-600 to-blue-700`), white typography, and tactile remove cross (`×`).

### 5.4 Tactile Press Physics & Emil Kowalski Standard
```css
/* Tactile Button Standards */
.tactile-btn {
  transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.12s ease, background-color 0.12s ease, border-color 0.12s ease;
}
.tactile-btn:active {
  transform: scale(0.965);
}

/* Card Depth */
.shadow-card-double {
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.02), 0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 1);
}
.shadow-btn-primary {
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.32), 0 2px 4px -1px rgba(37, 99, 235, 0.35), 0 4px 14px -2px rgba(37, 99, 235, 0.25);
}
```

---

## 6. Mobile & Tablet Responsiveness Architecture

1. **Stacking Behavior**:
   - On screens `< 1024px`, the Queue List and Workstation stack into a continuous vertical stream.
   - When a patient is clicked (`handleSelectVisit`), the view automatically smooth-scrolls to `#exam-workstation` with a 24px offset.
2. **Touch Targets**:
   - All buttons, queue cards, input fields, and chips have a minimum dimension of $44 \times 44\text{ px}$.
   - Minimum spacing of $8\text{ px}$ (`gap-2`) between adjacent interactive elements.
3. **No Horizontal Scroll**:
   - Prescription tables and vitals grid wrap dynamically or provide isolated horizontal overflow scrolling (`overflow-x-auto`) inside the container.
