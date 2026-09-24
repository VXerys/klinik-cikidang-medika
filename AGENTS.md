# Repository Operating Contract — klinik-cikidang-medika

## 1. Project Identity

`klinik-cikidang-medika` is a web-based clinic management information system (SIM) for the staff and owners of Klinik Pratama Cikidang Medika that replaces manual Google Sheets with a structured database, real-time dashboard, and role-based access for patient registration, medical records, billing, and financial reporting.

- Lifecycle stage: MVP
- Primary repository purpose: Full-stack clinic management web application
- Production sensitivity: HIGH (patient medical records, financial data, PII including NIK KTP and BPJS numbers)
- Primary owner/team: Solo developer (commissioned by dr. Ovan and dr. Neneng via intermediary)

## 2. Source of Truth

Use these sources in priority according to the question being answered:

| Question | Canonical source |
|---|---|
| Product goals/scope | `docs/product/prd.md` |
| Engineering governance | `AGENTS.md` (this file) |
| Shared architecture | `docs/architecture/overview.md` |
| Significant technical decisions | `docs/adr/` |
| Feature behavior | `docs/product/prd.md`, `docs/specs/` |
| Feature/module system architecture | N/A (single monolith, no module-level architecture needed at MVP) |
| Feature implementation design | `docs/specs/{feature-id}/design.md` |
| API/data contracts | `docs/architecture/api-contracts.md` |
| Database schema/migrations | `supabase/migrations/` |
| Current implemented behavior | code, tests, schemas, migrations, configuration |
| Execution/task state | `docs/context/state.yaml` |
| Operations/runbooks | `docs/runbooks/` |
| Client communication history | `docs/context/CHAT_TRANSCRIPT.md` |
| Client agreement & UI prototype | `docs/product/Proposal_Klinik_Cikidang_Medika.pdf` |
| Clinic operational data (CSV) | `docs/data/DASHBOARD - *.csv` (excludes Emerys Glow files) |

### Conflict Rule

If authoritative documentation and implementation disagree:

1. stop the affected work;
2. identify the exact conflicting sources;
3. determine which artifact owns the question;
4. inspect code/tests/schema/Git evidence;
5. do not silently rewrite requirements or architecture to match convenient implementation;
6. obtain required approval for product/architecture/security/data changes;
7. update the canonical source before continuing affected work.

Conversation history and provider memory are never the sole source of truth.

## 3. Technology Stack

- Language/runtime: TypeScript 5.6, Node.js
- Client/application framework: Next.js 14 App Router, React 18, Tailwind CSS 3.4
- Backend/API: Next.js API Routes (server components) + Supabase client SDK
- Database/persistence: Supabase Cloud PostgreSQL + Hybrid Storage (Supabase Storage 1GB primary + Cloudinary 25GB fallback for medical photos)
- Auth: Supabase Auth with RBAC (roles: `kasir`, `dokter`, `owner`)
- State management: React component state (no external state library)
- Package/build tooling: npm, PostCSS, Autoprefixer
- Testing: Not yet configured (planned: Vitest + React Testing Library)
- Deployment/runtime: Vercel Free Tier, custom domain via client's DNS

Do not add or replace major dependencies without following the dependency policy and obtaining approval where required.

## 4. Architecture

### System Shape

Monolithic Next.js 14 App Router application. The browser client renders server components and client components. Data flows through the Supabase JS client SDK (`@supabase/ssr` for server, `@supabase/supabase-js` for client) to a managed PostgreSQL database on Supabase Cloud. Medical photos (circumcision post-op) are managed through a hybrid storage adapter (`src/lib/storage.ts`) using Supabase Storage (1GB private bucket) as primary and Cloudinary (25GB free tier) as fallback, with client-side compression to WebP < 300KB. Excel export happens entirely in the browser via the `xlsx` (SheetJS) library.

### Primary Components / Modules

| Component | Responsibility | May depend on | Must not depend on |
|---|---|---|---|
| `src/app/` | Next.js App Router pages (dashboard, pendaftaran, rekam-medis, buku-kas, laporan) | `src/components`, `src/constants`, `src/lib`, `src/types` | `supabase/migrations` |
| `src/components/ui/` | Reusable atomic UI primitives (Button, Badge, Modal, Input, Select, Card) | `src/lib/utils.ts` | Domain logic, Supabase SDK |
| `src/components/` | Domain and feature UI components | `src/components/ui`, `src/constants`, `src/lib`, `src/types` | `src/app` route-private logic |
| `src/constants/` | Canonical clinic configuration and design tokens (`clinic.ts`, `theme.ts`) | TypeScript primitives | React, Supabase |
| `src/lib/storage.ts` | Hybrid media storage adapter (Supabase Storage + Cloudinary fallback) | `@supabase/supabase-js`, Cloudinary API | UI components |
| `src/lib/supabase/` | Supabase client instances (browser + server) | `@supabase/ssr`, `@supabase/supabase-js` | `src/app`, `src/components` |
| `src/lib/utils.ts` | Utility functions (clsx, tailwind-merge, formatRupiah) | `clsx`, `tailwind-merge` | Supabase, React |
| `src/types/` | TypeScript type definitions (`database.ts`) | None | None |
| `supabase/migrations/` | PostgreSQL DDL schema | None | `src/` |

### Dependency Direction

```text
src/app/ (pages)
  └── src/components/{feature}/ (feature components)
       └── src/components/ui/ (reusable primitives)
            └── src/constants/ (clinic constants & design tokens)
                 └── src/types/ (type definitions)
                      └── src/lib/ (supabase, storage adapter, utils)

supabase/migrations/ (independent, no src/ imports)
```

### Permanent Architecture Rules

1. All database access goes through the Supabase client SDK. No raw `pg` connections or direct PostgreSQL drivers.
2. Server-side Supabase client (`src/lib/supabase/server.ts`) for server components and API routes. Browser client (`src/lib/supabase/client.ts`) for client components.
3. Medical photo uploads must be compressed client-side to WebP < 300KB via `compressImageToWebP` before upload to the hybrid storage adapter (`src/lib/storage.ts`).
4. Reusable UI mandate: All UI pages and feature components MUST consume atomic primitives from `src/components/ui/` (Button, Badge, Modal, Input, Select, Card) and constants from `src/constants/clinic.ts`. Direct ad-hoc styling of raw modal backdrops or inline duplicated form elements is prohibited.
5. Canonical Typography (Plus Jakarta Sans): The application standardizes on **Plus Jakarta Sans** via Next.js Font Optimization (`next/font/google`). All headings, labels, and body text use Plus Jakarta Sans. Monospace / tabular numbers are mandatory for currency values, ICD-10 codes, No RM, and queue tokens.
6. Mobile & Tablet Responsiveness Mandate (UI/UX Pro Max): The application must be 100% responsive across mobile smartphones (viewport 360px–640px), tablets (768px–1024px), and desktop monitors (1024px+). Navigation on mobile/tablet must use the responsive slide-over drawer triggered by the hamburger button in `Navbar.tsx`. All interactive touch targets (buttons, inputs, menu links) must have a minimum area of 44×44px with at least 8px (`gap-2`) spacing. Zero horizontal page scroll: all data tables and master-detail grids must stack gracefully or contain horizontal scrolling inside dedicated overflow wrappers.

Detailed architecture: `docs/architecture/overview.md`.

## 5. Directory Responsibilities

| Path | Responsibility | Rules |
|---|---|---|
| `src/app/` | Next.js App Router pages, one route per clinic module | Each route folder contains its own `page.tsx` |
| `src/components/ui/` | Atomic, highly reusable UI primitives | No business logic or direct database calls |
| `src/components/` | Domain-specific feature components (e.g. `pendaftaran/`) | Receive data via props, use UI primitives |
| `src/constants/` | Canonical domain constants (clinic profile, villages, tariffs, theme tokens) | Single source of truth for fixed clinic attributes |
| `src/lib/storage.ts` | Hybrid image compression and storage adapter | Handles Supabase 1GB + Cloudinary 25GB fallback |
| `src/lib/supabase/` | Supabase client factory (server + browser) | Single instance pattern per request lifecycle |
| `src/types/` | TypeScript interfaces for database rows | Must match `supabase/migrations/` schema |
| `supabase/migrations/` | PostgreSQL DDL, append-only | Never edit an already-applied migration |
| `docs/` | Canonical project documentation | Source of truth hierarchy per Section 2 |
| `docs/data/DASHBOARD - *.csv` | Original clinic operational data from Google Sheets | Read-only reference; source of truth for data migration |
| `docs/data/Emerys Glow*` | Skincare retail data (out of scope) | Do not process, migrate, or build features for these files |
| `.stitch/` | Design system and generated UI mockups | Generated artifacts; do not treat as implementation spec |
| `scripts/` | Utility scripts (PDF generation, context automation) | Not part of the production application |

### Directory Rules

- One Next.js route folder per clinic module (pendaftaran, rekam-medis, buku-kas, laporan).
- Shared components in `src/components/ui/`; feature-specific components co-located in `src/components/{module}/`.
- All constant clinic data (villages, honorifics, default tariffs) must be defined in `src/constants/` and never hardcoded in component files.
- All documentation changes go through `docs/`; raw chat and session notes do not belong in permanent docs.

## 6. Engineering Rules

### General

- Follow existing project patterns before introducing new abstractions.
- Keep changes scoped to the approved task.
- Do not perform unrelated refactors.
- Do not fabricate files, APIs, schema, commands, or framework behavior; inspect the repository.
- Preserve backward compatibility unless the approved specification explicitly changes it.
- Treat generated files according to their generator workflow.
- All monetary values stored as `NUMERIC(15,2)` in PostgreSQL and displayed with `Rp` prefix and Indonesian thousand separators.
- Strict Mobile & Tablet Responsiveness Mandate: Every UI component, modal, table, card, and page MUST be 100% responsive across mobile smartphones (360px–640px), tablets (768px–1024px), and desktop monitors (1024px+). Interactive touch targets must be at least 44×44px with minimum 8px (`gap-2`) spacing. Zero horizontal page overflow is permitted on any viewport.
- Anti-Slop Skills Enforcement Mandate: For every user prompt and coding task, the agent MUST strictly apply and adhere to `/antislop`, `/antislop-ui`, `/antislop-code`, and `/antislop-human`. No fabricated numbers or stats (R-17, R-38), no generic AI slop comments (antislop-code), no em dashes in UI copy (R-02), no generic AI gradients or template layouts (R-01, R-05), WCAG AA contrast (R-25), full keyboard navigation with visible focus indicators (R-32), and delivery gate compliance before completion.

### Error Handling

- Surface Supabase errors to the UI with user-readable messages in Bahasa Indonesia.
- Do not swallow errors merely to make flows appear successful.
- Preserve domain/API error semantics unless an approved change says otherwise.

### Dependency Policy

Before adding a dependency, document when applicable:

- problem it solves;
- existing/native alternatives;
- maintenance health;
- runtime/bundle impact;
- security/license impact;
- reason existing dependencies are insufficient.

Project rule: No new dependencies without developer approval. The bundle must stay small for clinic computers with limited bandwidth.

## 7. State and Data Rules

- Primary state owners: Supabase PostgreSQL is the single source of truth for all persistent data.
- Server/persistent state source of truth: All patient, visit, billing, and cash flow data lives in PostgreSQL. No localStorage persistence for business data.
- Cache invalidation/synchronization: Next.js `revalidatePath()` after mutations. No external cache layer.
- Serialization/validation boundary: Validate at the form component level before Supabase insert/update. Database constraints (NOT NULL, UNIQUE, FK) are the last line of defense.
- Concurrency/idempotency rule: N/A at MVP scale (single clinic, low concurrent users).
- CSV data files in `docs/data/DASHBOARD - *.csv` are the historical source of truth for the ETL migration script (F-005). After migration, PostgreSQL becomes the sole source.

Do not introduce a second writable source of truth without explicit reconciliation rules.

## 8. API Rules

This project uses Supabase client SDK instead of custom REST APIs. The SDK calls go directly to the managed PostgREST layer.

- API ownership: Supabase manages the PostgREST API layer. Custom business logic lives in Next.js server components and server actions.
- Request validation: Validate in React components before SDK calls. PostgreSQL constraints as fallback.
- Authentication: Supabase Auth handles session management. JWT tokens passed automatically by the SDK.
- Authorization: Row Level Security (RLS) policies on PostgreSQL tables enforce role-based access (kasir, dokter, owner).
- Error contract: Supabase SDK returns `{ data, error }` objects. Always check `error` before using `data`.
- Versioning/backward compatibility: N/A (no public API).
- Retry/timeout ownership: Supabase SDK handles retries internally.
- Generated clients/contracts: `src/types/database.ts` must stay in sync with the migration schema.

## 9. Database Rules

- Schema source: `supabase/migrations/` (append-only SQL files)
- Migration path: Create new timestamped `.sql` files in `supabase/migrations/`
- Migration command: Copy SQL content and execute in Supabase SQL Editor (no CLI migration tool configured yet)
- Access boundary: All application access through Supabase client SDK with RLS policies
- Authorization/RLS/policy rule: RLS must be enabled on all tables containing patient or financial data. Policies enforce role-based access.
- Transaction rule: Use Supabase RPC functions for multi-table operations that require atomicity.
- Seed/fixture rule: Doctor seed data is included in the init migration. Patient/visit data migrated via ETL script from CSV.

### Prohibited Data Operations Without Explicit Approval

- destructive production migration;
- dropping/removing production data structures;
- database reset on non-disposable environments;
- mass delete/backfill with unknown impact;
- bypassing RLS policies;
- editing already-applied migrations.

## 10. Security Rules

- Never commit secrets or real credentials. Use `.env.local` (gitignored) for Supabase keys.
- Use least privilege for service credentials. Prefer `anon` key for client-side, `service_role` key only in trusted server contexts.
- Enforce authorization at the database boundary via RLS. UI hiding is not authorization.
- Validate untrusted input (patient names, NIK KTP, BPJS numbers) at the form level.
- Do not log secrets, auth headers, tokens, or patient PII (NIK, BPJS number, medical diagnoses).
- Security-sensitive changes require explicit verification.
- Project-specific: Medical photos in Supabase Storage must use a private bucket with signed URLs. No public bucket for patient images.

Detailed security architecture: `docs/architecture/security.md`.

## 11. Project Commands

### Install / Bootstrap

```bash
npm install
```

### Development

```bash
npm run dev
```

### Format

```bash
# No dedicated formatter configured yet. Tailwind handles class ordering.
```

### Lint / Static Analysis

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Unit Tests

```bash
# Not yet configured. Planned: npx vitest
```

### Integration / Component / E2E Tests

```bash
# Not yet configured.
```

### Build / Compile

```bash
npm run build
```

### Database / Migration Checks

```bash
# Manual: copy SQL from supabase/migrations/ and execute in Supabase SQL Editor.
# Context validation:
npm run context:validate
```

## 12. Task Execution Protocol

### Before Coding

1. Read this file and applicable nested instructions.
2. Read the exact task and relevant requirements.
3. Read the relevant module `system-architecture.md` constraints when present and implicated by the task; do not load unrelated sections by default.
4. Read the relevant implementation design.
5. Inspect relevant code, tests, schema, and call sites.
6. Confirm the objective, scope, constraints, and verification.
7. Identify blocking ambiguity or source conflicts.
8. Create a concise plan for non-trivial work.

### During Coding

1. Make the smallest complete change.
2. Follow existing global architecture, approved module architecture, and repository patterns.
3. Do not introduce unrelated refactors/features.
4. Add/update tests for changed behavior.
5. Do not silently change data ownership, consistency, communication, caching, security, resilience, or other approved module-architecture decisions inside an implementation task.
6. Stop if a new product/architecture/security/data decision is required.

### After Coding

1. Inspect the complete diff.
2. Run applicable verification.
3. Map acceptance criteria to evidence.
4. Verify architecture-sensitive claims proportional to risk when the task changed or exercised them.
5. Report unrun checks and residual risk.
6. Update durable docs only when truth changed.
7. Perform context refresh when a significant shared truth changed.

## 13. Git Rules

- Keep commits/PRs coherent and scoped.
- Inspect diffs before commit/merge.
- Do not commit secrets, generated junk, debug artifacts, or unrelated changes.
- Branch naming: `feature/{feature-id}-{short-description}` or `fix/{description}`.
- Commit messages: imperative mood, reference feature ID when applicable (e.g., "F-001: add patient search autocomplete").

### Destructive Git Operations

Do not perform force push, history rewrite, `reset --hard` that can destroy work, or mass deletion without explicit approval.

## 14. Prohibited Actions

Without the required explicit approval, do not:

- change public API/data contracts;
- perform destructive schema/data operations;
- replace major framework/provider/dependency;
- make a breaking architecture change;
- change production infrastructure or credentials;
- bypass authentication/authorization or RLS policies;
- disable tests to make CI pass;
- modify unrelated code for cleanup;
- edit generated files manually when a generator owns them;
- add distributed-system mechanisms without a requirement/workload justification;
- rewrite Git history.

Project-specific prohibitions:

- Do not build features for Emerys Glow skincare data. That scope is explicitly excluded per client instruction.
- Do not integrate with BPJS P-Care API. The system records BPJS data internally only, per client confirmation.
- Strict MVP Scope Control: Dilarang menambahkan, mengimplementasikan, atau merekomendasikan fitur baru yang di luar lingkup resmi MVP (F-001 s/d F-006). Jika agen memiliki saran atau rekomendasi di luar MVP, agen hanya boleh menyampaikannya sebagai opsi Post-MVP dan DILARANG KERAS mengimplementasikannya kecuali setelah pengguna secara eksplisit menyatakan SETUJU.


## 15. Definition of Done

A task is complete when applicable:

- requirements/acceptance criteria are satisfied;
- implementation follows approved global architecture, module system architecture, and implementation design;
- required format/lint/typecheck/tests/build pass;
- runtime/regression verification is complete for changed risk;
- architecture-sensitive claims have evidence proportional to risk;
- security/data constraints are satisfied;
- no unrelated changes remain;
- diff is reviewed;
- documentation is current when durable truth changed;
- known limitations/residual risk are recorded.

Project-specific additional gates:

- Monetary calculations verified with real clinic data samples from CSV.
- Mobile and tablet responsiveness verification is strictly mandatory for every UI code task (checked across 360px, 768px, and 1024px+ viewports with no text truncation or horizontal page scroll).

## 16. Important References

- Product: `docs/product/prd.md`
- Proposal: `docs/product/Proposal_Klinik_Cikidang_Medika.pdf`
- Architecture: `docs/architecture/overview.md`
- Module architecture guide: `docs/architecture/MODULE_ARCHITECTURE_GUIDE.md`
- Feature index: `docs/specs/_index.md`
- Decisions: `docs/adr/`
- Operations: `docs/runbooks/`
- Security: `docs/architecture/security.md`
- Client communication: `docs/context/CHAT_TRANSCRIPT.md`
- Clinic CSV data: `docs/data/DASHBOARD - *.csv`
- Execution state: `docs/context/state.yaml`
- Design mockups: `.stitch/designs/`

## 17. Maintenance Note

Update this contract only when a permanent, frequently relevant repository rule changes. Feature-local behavior, transient task status, debugging notes, and raw chat do not belong here.

<!-- antislop:start -->
## Mandatory Anti-Slop Standards
For UI, visual, copywriting, accessibility, mobile layout, and code comment work, the agent MUST read and apply:
- Core Anti-Slop Filter: `antislop` (Rules R-01 through R-38, Delivery Gate)
- UI / Visual Craft: `antislop-ui`
- Code Comment Hygiene: `antislop-code`
- Accessibility & Human: `antislop-human`
Mode: DURING implementation (zero AI slop from the start).
<!-- antislop:end -->
