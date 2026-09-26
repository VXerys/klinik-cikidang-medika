# Tech Steering — SIM Klinik Pratama Cikidang Medika

## 1. Core Stack
- **Language / Runtime**: TypeScript 5.6, Node.js 20+
- **Framework**: Next.js App Router (Turbopack), React 19
- **Styling**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **Icons**: `@phosphor-icons/react` (duotone & bold weights)
- **Charts**: Recharts (with calibrated brand palettes and accessible SVGs)
- **Data Persistence**: Supabase Cloud PostgreSQL with Row-Level Security (RLS)
- **Client SDK**: `@supabase/ssr` (server), `@supabase/supabase-js` (client)
- **Spreadsheet Generation**: `xlsx` (SheetJS)

## 2. State & Data Flow
- **PostgreSQL Source of Truth**: All transactional records (patients, visits, cash flows) reside in PostgreSQL.
- **Client-Side Aggregations**: Dashboard metrics are calculated from structured date queries (`selectedPeriod`).
- **Tabular Precision**: Monetary values stored as `NUMERIC(15,2)` and displayed with `Rp` prefix, Indonesian dot thousand separators, and monospace rendering (`font-mono`).

## 3. Performance & Craft Budgets
- **LCP & FCP**: Page load < 1.5s on 4G mobile connections.
- **Layout Stability**: Cumulative Layout Shift (CLS) = 0. All cards utilize deterministic skeletons during loading.
- **Micro-interactions**: `:active { transform: scale(0.96); }` using `cubic-bezier(0.2, 0, 0, 1)`. Avoid `transition: all`.
