---
id: F-006-TASKS
feature: F-006
status: implemented
owner: Developer
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "design.md"
---

# Tasks: F-006 Register Program Khusus Medis & Dashboard Charts Expansion

## Task Breakdown

### Phase 1: Specifications & Runbooks
- [x] **TASK-001**: Document staging database setup guide in `docs/runbooks/staging-database-setup.md`.
- [x] **TASK-002**: Update detailed RFC 2119 specifications for camera/gallery photo input, WebP compression feedback, and HD Lightbox in `requirements.md`.
- [x] **TASK-003**: Update technical design architecture for medical photo lifecycle and security in `design.md`.

### Phase 2: Program Khusus UI & Photo Ecosystem
- [x] **TASK-004**: Refactor `NewCircumcisionModal.tsx` to use reusable `Modal`, `@phosphor-icons/react` duotone, two photo input modes (camera vs gallery), real-time WebP compression badge, and thumbnail preview.
- [x] **TASK-005**: Upgrade `CircumcisionList.tsx` with inline thumbnail previews, duotone iconography, and an interactive **HD Lightbox Zoom Modal**.
- [x] **TASK-006**: Standardize `NewTbcModal.tsx` and `TbcControlCard.tsx` with `@phosphor-icons/react` and clean anti-slop copy.
- [x] **TASK-007**: Standardize `NewPostCareModal.tsx` and `PostCareAgenda.tsx` with `@phosphor-icons/react` and clean anti-slop copy.

### Phase 3: Dashboard Visual Charts Expansion
- [x] **TASK-008**: Build `FinancialTrendChart.tsx` (Spline AreaChart with gradient fill for Cash In vs Cash Out with Daily/Monthly toggle).
- [x] **TASK-009**: Build `PaymentDistributionChart.tsx` (Donut / PieChart for BPJS vs Umum and Tunai vs Transfer).
- [x] **TASK-010**: Enhance `VisitTrendChart.tsx` with visualization type switcher (Stacked Bar vs Smooth Spline Area).
- [x] **TASK-011**: Integrate new chart components into Executive Dashboard (`src/app/page.tsx`).

### Phase 4: Verification & Anti-Slop Delivery Gate
- [x] **TASK-012**: Run TypeScript typecheck (`npx tsc --noEmit`), context validation (`npm run context:validate`), and production build (`npm run build`).
- [x] **TASK-013**: Verify anti-slop rules (no em dashes `—`, WCAG AA contrast, touch targets >= 44x44px, zero horizontal overflow).
