# Design System: Sistem Informasi Manajemen Klinik Cikidang Medika

## 1. Visual Theme & Atmosphere
A clean, reassuring clinical interface designed with utmost clarity and operational speed. The mood is professional medical sanctuary — calm, high-contrast, hygienic, and dignified, balancing the fast-paced nature of a clinic loket with the clinical precision required by doctors (dr. Ovan & dr. Neneng). Density is "Daily App Balanced" (6/10) with generous tabular clarity, zero visual clutter, and strict spatial separation.

- **Density:** 6/10 (Balanced clinical workflow, readable from arm's length at reception desk or doctor's tablet)
- **Variance:** 5/10 (Structured dual-column layouts, clean information hierarchy, asymmetric metric cards)
- **Motion:** 4/10 (Subtle, responsive spring feedback on active buttons and table row hover)

## 2. Color Palette & Roles
- **Canvas White** (`#F8FAFC`, Slate-50) — Primary background surface across all pages.
- **Pure Surface** (`#FFFFFF`) — High-elevation cards, table containers, and consultation panels.
- **Charcoal Slate** (`#0F172A`, Slate-900) — Primary text, patient names, critical medical diagnoses, and financial totals.
- **Muted Slate** (`#475569`, Slate-600) — Secondary text, labels, ICD-10 codes, timestamps, and table headers.
- **Subtle Border** (`#E2E8F0`, Slate-200) — 1px crisp structural division lines, card outlines, and table row dividers.
- **Clinical Emerald / Teal** (`#0F766E`, Teal-700) — Sole primary accent color for active navigation, primary action buttons ("Simpan Kunjungan", "Cetak Nota"), and key metrics.
- **BPJS Blue Badge** (`#0284C7`, Sky-600) — Designated functional color badge for BPJS patient status tag (contrast-compliant).
- **Umum Amber Badge** (`#D97706`, Amber-600) — Designated functional color badge for Pasien Umum status tag.
- **Soft Muted Red** (`#DC2626`, Red-600) — Reserved strictly for critical validation errors and cancellation alerts.

*(Strict Ban: No AI purple/neon glows, no oversaturated accents, no pure black `#000000`)*.

## 3. Typography Rules
- **Display / Headlines:** `Geist` or `Outfit` — Weight: Semibold (600) & Bold (700). Track-tight (`-0.02em`), controlled scale. No screaming uppercase.
- **Body & Labels:** `Geist` or `Satoshi` — Weight: Regular (400) & Medium (500). Relaxed leading (`1.5`), 65ch max-width on descriptive text.
- **Data & Numbers:** `Geist Mono` or `JetBrains Mono` — For patient Medical Record Number (`No RM`), NIK KTP, monetary amounts (`Rp 28.500.000`), ICD-10 codes (`J00`, `K30`), and timestamps.
- **Banned:** `Inter`, `Times New Roman`, `Georgia`, generic system serifs. Serif is strictly prohibited in software/dashboard interfaces.

## 4. Component Stylings
- **Buttons:**
  - Primary: Solid Clinical Teal (`#0F766E`) background, crisp white text, tactile `-1px` vertical translate on click (`active:translate-y-0.5`), rounded-lg (`8px`).
  - Secondary / Outline: 1px border (`#CBD5E1`), background white, text Slate-700, subtle hover `#F1F5F9`.
  - No neon dropshadows or radial glows.
- **Metric Cards (KPI):**
  - Crisp white background, 1px `#E2E8F0` border, `12px` rounded corners (`rounded-xl`).
  - Subtle diffused shadow (`box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05)`).
  - Title in uppercase tracking-wider Muted Slate (`11px`), value in Geist Mono Semibold (`28px`).
- **Data Tables (Patient Records & Queue):**
  - High-readability compact rows (height `48px`).
  - Alternating subtle hover states (`#F8FAFC`).
  - Clear column alignment: text left-aligned, numbers right-aligned, status badges centered.
- **Form Inputs:**
  - Label placed strictly above input with medium weight.
  - Border `#CBD5E1`, focus border `#0F766E` with 2px offset ring (`rgba(15, 118, 110, 0.15)`).
  - No floating labels. Clear placeholder examples (e.g., `Cth: Ny. Siti Rahmawati`).
- **Status Badges:**
  - Pill-shaped (`rounded-full`), padding `2px 10px`, font size `12px` medium weight.

## 5. Layout Principles
- **Grid Architecture:** Desktop layout utilizes a fixed left sidebar (`240px`) for clinic module navigation, paired with a dynamic fluid content area (max-width `1440px` centered).
- **Responsive Collapse (< 768px):** Left sidebar transforms into an off-canvas drawer / bottom navigation bar for mobile smartphones (dr. Ovan/dr. Neneng accessing outside clinic).
- **Dual-Pane Workspaces:** Registration and Consultation views use split-pane layouts (Left: Search/Queue, Right: Active Patient Profile & Form).
- **No Overlapping:** Absolute positioning overlays are banned except for dialog modals.

## 6. Motion & Interaction
- **Feedback:** Spring physics transition for modals and dropdown drawers (`transition-all duration-150 ease-out`).
- **Table Loading:** Skeletal pulse shimmers matching exact row height and column widths. No generic circular spinners.
- **Performance:** Hardware-accelerated transforms (`transform: translate3d`) and opacity only.

## 7. Anti-Patterns (Explicitly Banned)
- No emojis anywhere in the UI.
- No `Inter` or generic serif typography.
- No pure black (`#000000`) text or surfaces.
- No generic AI marketing buzzwords ("Elevate", "Next-Gen", "Seamless Experience").
- No fake round numbers (`99.9%`, `50%`) — use real clinic context (e.g., `7.493 Total Kunjungan`, `4.238 Pasien Terdaftar`).
- No broken Unsplash URLs; use clean SVG icons (Lucide icons: `Stethoscope`, `Users`, `Receipt`, `Wallet`, `FileSpreadsheet`).
- No 3-column identical marketing card rows.
