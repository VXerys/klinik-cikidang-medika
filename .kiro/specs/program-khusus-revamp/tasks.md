# Implementation Tasks — Program Khusus Medis Tab UI/UX Revamp

- [x] **Task 1: Build High-Density Clinical Surveillance KPI Component** `src/components/program-khusus/ProgramKhususKpis.tsx`
  - Implement 3 tactile double-bezel cards: `Kohort TBC Aktif`, `Tindakan Sirkumsisi`, and `Agenda Pos-Rawat`.
  - Add SVG Area Gradient sparklines with animated active beacon dots matching the design system standard.
  - Calculate real-time clinic surveillance stats without extra database roundtrips.
  - Apply concentric border radii (`rounded-2xl` within `rounded-3xl` container) and tactile hover physics (`translateY(-2px)`).
  - _Requirements: 1.3, NFR-1, NFR-2_

- [x] **Task 2: Revamp Program Khusus Master Page Layout & Sub-Tab Control** `src/app/program-khusus/page.tsx`
  - Reconstruct page header with Medical Sapphire branding, contextual clinic subtitle, and tactile live-refresh trigger.
  - Build adaptive primary action button (`+ Pasien TBC Baru` / `+ Catat Sirkumsisi` / `+ Jadwal Pos-Rawat`) with specular inset rim.
  - Implement recessed-track segmented control for sub-tabs with elevated double-bezel active state and counter badges.
  - Embed search bar (Nama / No. RM / Desa) and contextual status filter pills.
  - Wire smooth, interruptible tab crossfade transitions (duration <= 150ms).
  - _Requirements: 1.1, 1.2, 1.4, NFR-5, NFR-6_

- [x] **Task 3: Revamp Kartu Kendali TBC 6 Bulan Component** `src/components/program-khusus/TbcControlCard.tsx`
  - Replace simplistic 6-box row with an annotated 2-phase clinical journey stepper (Fase Intensif 4FDC vs Fase Lanjutan 2FDC).
  - Add Sputum Mikroskopis BTA checkpoint badges at Month 2, Month 5, and End of Treatment.
  - Add high-contrast defaulter banner (`Mangkir Kontrol`) with pulse animation when overdue > 7 days.
  - Implement patient metadata header with JetBrains Mono No. RM and case type tags.
  - Refactor action buttons to tactile bevels (`Perbarui Status & Sputum`, `Cetak Kartu TB-01`).
  - _Requirements: 2.1, 2.2, 2.3, 2.4, NFR-1, NFR-4_

- [x] **Task 4: Revamp Layanan Sirkumsisi Modern & Foto Klinis Component** `src/components/program-khusus/CircumcisionList.tsx`
  - Reconstruct procedure cards into responsive double-bezel containers with doctor name, procedure date, and monospace fee.
  - Implement dual-slot wound photography layout: Slot 1 (`Paska Tindakan`) and Slot 2 (`Kontrol H+7 / Pelepasan Klamp`).
  - Add inline tactile trigger button `+ Unggah Foto Kontrol` for cases where follow-up photo is still pending.
  - Upgrade HD Lightbox Zoom Modal with zoom controls (50% to 250%), confidentiality watermark, and patient context header.
  - Ensure private signed URLs with 1-hour expiration.
  - _Requirements: 3.1, 3.2, 3.3, NFR-2, NFR-5_

- [x] **Task 5: Revamp Agenda Pasien Pos-Rawat Component** `src/components/program-khusus/PostCareAgenda.tsx`
  - Reorganize appointments into 4 chronological categories: `Hari Ini`, `Terlambat / Overdue`, `Mendatang`, and `Riwayat Selesai`.
  - Add 1-click `Ingatkan via WhatsApp` button that opens `wa.me` with an empathetic, pre-filled Indonesian follow-up template.
  - Add tactile `Tandai Selesai Kontrol` button with instant feedback.
  - Add tactile `Jadwalkan Ulang` action to adjust the appointment date without record recreation.
  - _Requirements: 4.1, 4.2, 4.3, NFR-3, NFR-4_

- [x] **Task 6: Refactor Modal Dialogs with Custom Popovers & Micro-Shake Validation**
  - Refactor `NewTbcModal.tsx`: Replace native `<select>` with custom floating popover selects, add microShake validation.
  - Refactor `NewCircumcisionModal.tsx`: Replace native selects, refine 2-way mobile/tablet camera upload, maintain HTML5 Canvas WebP compression badge (< 300KB).
  - Refactor `NewPostCareModal.tsx`: Replace native selects, add formatted calendar input and patient selector.
  - _Requirements: 5.1, 5.2, 5.3, NFR-2, NFR-5_

- [x] **Task 7: Static Analysis, Build Verification & Anti-Slop Delivery Gate**
  - Run `npx tsc --noEmit` to verify 100% TypeScript type safety (PASSED, 0 errors).
  - Run `npm run build` to verify Next.js Turbopack build succeeds without compilation errors (PASSED).
  - Audit anti-slop rules: zero em dashes (`—`), WCAG AAA contrast, no `transition: all`, 44px minimum touch targets, and zero horizontal scroll across 360px, 768px, and 1024px+ viewports.
  - _Requirements: All, Delivery Gate_

- [x] **Task 8: Harmonize UI with Dashboard Utama Tokens & Visual Consistency**
  - Card container harmonization: Standardized all cards to `bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-card-double tactile-card`.
  - Typography harmonization: Aligned KPI headers to `text-[11px] font-bold uppercase tracking-wider text-slate-500`, fluid JetBrains Mono `font-mono tracking-tight font-extrabold text-slate-900`, patient titles to `text-sm font-bold text-slate-900 tracking-tight`, and helper subtitles to `text-xs text-slate-500`.
  - Button tokens: Standardized primary buttons to `shadow-btn-primary bg-gradient-to-b from-blue-600 to-blue-700 min-h-[38px] rounded-xl text-xs font-bold`, secondary buttons to `shadow-btn-secondary bg-white hover:bg-slate-100 min-h-[38px] rounded-xl text-xs font-bold`.
  - Recessed segmented control: Refactored sub-tab switchers and timeline categories into executive segmented tracks matching `DashboardPeriodSelector`.
  - Badges & Pills: Unified No. RM badges to `font-mono text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/80` and delta/status badges to `font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border`.
  - _Requirements: User feedback, Anti-slop UI, Better-UI, Emil Design Eng_

