# Technical Design — Program Khusus Medis Tab UI/UX Revamp

## 1. High-Level Architecture & Layout Structure

The revamped `/program-khusus` page follows a hierarchical 4-tier clinical architecture:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. Master Clinical Header                                                       │
│    - Title & Contextual Medical Subtitle                                        │
│    - Global Live Refresh Trigger (tactile button)                              │
│    - Adaptive Primary Action Button (+ Pasien TBC / + Sirkumsisi / + Pos-Rawat) │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 2. Clinical Surveillance KPI Row (3 Tactile Double-Bezel Cards with Sparklines) │
│    [ Card 1: Kohort TBC ]    [ Card 2: Sirkumsisi Modern ]   [ Card 3: Pos-Rawat ] │
│    - Active Cases & Phase    - Total & Revenue               - Today Queue & Due│
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 3. Recessed Track Segmented Tab Control + Universal Sub-Tab Filter Bar          │
│    [ 🫁 Kartu Kendali TBC (8) ]  [ ✂️ Sirkumsisi (14) ]  [ 📅 Agenda Pos-Rawat (5) ]│
│    - Instant Search (Nama / No. RM)                                             │
│    - Contextual Status Filter Pills (Semua, Aktif, Mangkir, Selesai)            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 4. Active Tab Clinical Workspace (Responsive Stack / Grid)                      │
│                                                                                 │
│  [IF Tab === 'tbc']:                                                            │
│   └── Annotated Medical Stepper Cards (Intensive 4FDC vs Continuation 2FDC)     │
│       ├── Sputum (BTA) Checkpoints (Bln 2, 5, 6) with Lab Results               │
│       ├── High-Contrast Defaulter Banner if Overdue > 7 Days                    │
│       └── Quick Update & Printable TB-01 Card Modals                            │
│                                                                                 │
│  [IF Tab === 'circumcision']:                                                   │
│   └── Procedure Cards with Dual-Slot Clinical Wound Evaluation                  │
│       ├── Slot 1: Paska Tindakan (Signed URL WebP Thumbnail)                    │
│       ├── Slot 2: Kontrol H+7 / Pelepasan Klamp (Photo or + Upload Trigger)     │
│       ├── Method Badge (Laser, Klamp, Konvensional) & Monospace Fee             │
│       └── HD Medical Lightbox Zoom Modal with Privacy Watermark                 │
│                                                                                 │
│  [IF Tab === 'postcare']:                                                       │
│   └── Chronological Timeline Partitioning                                      │
│       ├── Hari Ini (Reception Queue) with 1-Click WhatsApp Outreach             │
│       ├── Terlambat / Overdue with Urgent Action Badges                         │
│       └── Quick Completion Toggle & Reschedule Ergonomics                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Inventory & Structural Changes

| Component | Path | Status | Structural Responsibility & Enhancements |
|---|---|---|---|
| `ProgramKhususPage` | `src/app/program-khusus/page.tsx` | Modified | Top header, dynamic action button dispatch, active tab state, KPI metrics derivation, search & filter query coordination. |
| `ProgramKhususKpis` | `src/components/program-khusus/ProgramKhususKpis.tsx` | New | 3 high-density metric cards with SVG sparklines, beacon dots, and clinical status badges. |
| `TbcControlCard` | `src/components/program-khusus/TbcControlCard.tsx` | Modified | Upgrades from raw 6-box row to an annotated 2-phase clinical journey stepper with BTA lab badges, high-contrast defaulter alert, and print trigger. |
| `NewTbcModal` | `src/components/program-khusus/NewTbcModal.tsx` | Modified | Upgraded with custom popover selects (replaces native `<select>`), micro-shake validation, and autocomplete patient picker. |
| `CircumcisionList` | `src/components/program-khusus/CircumcisionList.tsx` | Modified | High-density procedure cards, method pills, fee in tabular mono, dual photo slots with inline "+ Upload Kontrol H+7", and HD Lightbox. |
| `NewCircumcisionModal` | `src/components/program-khusus/NewCircumcisionModal.tsx` | Modified | Custom popover selects, dual camera/gallery upload, instant HTML5 Canvas WebP compression with real-time compression badge. |
| `PostCareAgenda` | `src/components/program-khusus/PostCareAgenda.tsx` | Modified | Chronological tab grouping (Hari Ini, Terlambat, Mendatang), 1-click WhatsApp message trigger, quick completion and reschedule. |
| `NewPostCareModal` | `src/components/program-khusus/NewPostCareModal.tsx` | Modified | Custom floating popover select, date picker ergonomics, patient selector. |
| `TbTreatmentCardPrint` | `src/components/program-khusus/TbTreatmentCardPrint.tsx` | Maintained | Standardized official TB-01 clinical form print preview and export. |

---

## 3. Design System Token Mapping (Clinical Modernism)

| Element | Specification & Tailwind Classes | Source of Truth Reference |
|---|---|---|
| **Canvas Background** | `bg-slate-50 min-h-screen` with ambient radial gradients (`from-blue-600/3` to `from-sky-500/3`) | `01-DESIGN-FOUNDATION.md` §2.2 |
| **Card Surface** | `bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-card-double` | `02-COMPONENT-SPECIFICATIONS.md` §3 |
| **Primary Action Button** | `bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-btn-primary border border-blue-700/80 active:scale-[0.965] min-h-[44px]` | `02-COMPONENT-SPECIFICATIONS.md` §1 |
| **Secondary Button** | `bg-gradient-to-b from-white to-slate-50 hover:to-slate-100 text-slate-800 shadow-btn-secondary border border-slate-300 active:scale-[0.965] min-h-[44px]` | `02-COMPONENT-SPECIFICATIONS.md` §1 |
| **Urgent Mangkir Badge** | `bg-rose-50 text-rose-900 border border-rose-300 font-bold px-2.5 py-1 rounded-xl` | `01-DESIGN-FOUNDATION.md` §2.4 |
| **TB Cohort Badge** | `bg-purple-50 text-purple-800 border border-purple-200 font-bold font-mono px-2 py-0.5 rounded-lg` | `01-DESIGN-FOUNDATION.md` §2.3 |
| **Post-Care Badge** | `bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-lg` | `01-DESIGN-FOUNDATION.md` §2.3 |
| **Custom Popover** | `bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-popover z-50 transform-origin-top animate-popover` | `02-COMPONENT-SPECIFICATIONS.md` §2 |
| **Touch Targets** | All interactive items maintain `min-h-[44px] min-w-[44px]` for mobile/tablet ergonomics | `02-COMPONENT-SPECIFICATIONS.md` §7 |

---

## 4. State & Data Flow Architecture

### 4.1 Master State Management in `ProgramKhususPage`
- `activeTab`: `'tbc' | 'circumcision' | 'postcare'`
- `searchQuery`: `string` (filters patient name, No. RM, or village)
- `statusFilter`: contextual to active tab (e.g. `all | active | defaulter | completed`)
- `tbcList`: array of `TbcProgram` with joined patient relation
- `circumcisionList`: array of `Circumcision` with joined patient and doctor relations
- `postCareList`: array of `PostCare` with joined patient and visit relations

### 4.2 KPI Derivation Pipeline
```typescript
// Computed on the fly without extra server roundtrips:
const tbcActiveCount = tbcList.filter(t => t.status_tbc === 'Dalam Pengobatan').length;
const tbcDefaulterCount = tbcList.filter(t => t.status_tbc === 'Mangkir').length;
const tbcIntensiveCount = tbcList.filter(t => t.fase_pengobatan === 'Intensif').length;

const circumcisionTotal = circumcisionList.length;
const circumcisionTotalRevenue = circumcisionList.reduce((sum, c) => sum + (c.biaya || 0), 0);
const circumcisionFollowUpPending = circumcisionList.filter(c => !c.foto_2_url).length;

const todayStr = new Date().toISOString().split('T')[0];
const postCareTodayCount = postCareList.filter(p => p.tanggal_kontrol_berikutnya === todayStr && p.status_kontrol !== 'Sudah Kontrol').length;
const postCareOverdueCount = postCareList.filter(p => p.tanggal_kontrol_berikutnya < todayStr && p.status_kontrol !== 'Sudah Kontrol').length;
```

---

## 5. Mobile & Tablet Responsiveness Matrix

| Viewport | Layout Reflow Strategy |
|---|---|
| **Mobile (360px–640px)** | - Header actions stack vertically; primary button full width.<br>- KPI cards reflow to 1 column or horizontal scroll snap.<br>- Segmented tabs stack or use scrollable pill row.<br>- Procedure cards stack photo slots vertically.<br>- Minimum 44px touch targets on all interactive items.<br>- Zero horizontal page overflow. |
| **Tablet (768px–1024px)** | - KPI cards render in a 3-column compact grid.<br>- Search and filter pills display inline beside segmented tabs.<br>- Circumcision cards display dual photo thumbnails side-by-side.<br>- TBC clinical stepper displays in 2 clean phase blocks (2+4 columns). |
| **Desktop (1024px+)** | - Full 3-card KPI row with SVG sparklines.<br>- 2-column or high-density table view for surgery and agenda.<br>- Modals center-aligned with double-bezel backdrop blur. |
