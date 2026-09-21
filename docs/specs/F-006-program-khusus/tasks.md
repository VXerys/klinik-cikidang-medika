---
id: F-006-TASKS
feature: F-006
status: approved
owner: Developer
last_updated: "2026-09-21"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-006 Register Program Khusus Medis

## Task Breakdown

- [x] **TASK-001**: Install and configure `recharts` package for dynamic data visualization.
- [x] **TASK-002**: Add `/program-khusus` navigation entry in `src/components/Sidebar.tsx` and mobile drawer.
- [x] **TASK-003**: Implement Program Khusus UI components:
  - [x] `TbcControlCard.tsx` and `NewTbcModal.tsx` for 6-month TB monitoring.
  - [x] `CircumcisionList.tsx` and `NewCircumcisionModal.tsx` with photo compression WebP < 300KB and Supabase Storage upload.
  - [x] `PostCareAgenda.tsx` and `NewPostCareModal.tsx` for follow-up scheduling.
- [x] **TASK-004**: Implement `src/app/program-khusus/page.tsx` integrating all three programs with live Supabase database queries.
- [x] **TASK-005**: Build `ClinicalAlertWidget.tsx` and integrate it into the Executive Dashboard (`src/app/page.tsx`).
- [x] **TASK-006**: Implement Recharts-based Visit Trend Chart (`VisitTrendChart.tsx`) with 14-day daily vs 12-month views and BPJS vs Umum breakdown.
- [x] **TASK-007**: Refactor Cash Liquidity card (Kas Laci Tunai vs Rekening Bank BRI).
- [x] **TASK-008**: Run typecheck (`npx tsc --noEmit`), build check (`npm run build`), and verify mobile/tablet responsiveness.
