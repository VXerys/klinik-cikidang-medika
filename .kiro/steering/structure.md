# Structure Steering — SIM Klinik Pratama Cikidang Medika

## 1. Codebase Architecture
The project is a Next.js 14/16 App Router application organized strictly around clinic domains and role boundaries:

```
src/
├── app/
│   ├── layout.tsx                     # Global html, typography (Plus Jakarta Sans), theme
│   ├── page.tsx                       # Dashboard Eksekutif (executive monitoring)
│   ├── pendaftaran/page.tsx           # Loket Pendaftaran & Kasir (reception & registration)
│   ├── rekam-medis/page.tsx           # Rekam Medis Dokter (clinical examination)
│   ├── program-khusus/page.tsx        # Program Khusus (TBC, Sirkumsisi, Pos-Rawat)
│   ├── buku-kas/page.tsx              # Buku Kas Operasional & Rekonsiliasi Kasir
│   └── laporan/page.tsx               # Laporan & Ekspor Excel (SheetJS)
├── components/
│   ├── ui/                            # Atomic reusable UI primitives (Button, Card, Badge, Modal, Input)
│   ├── dashboard/                     # Domain-specific components for the executive dashboard
│   ├── pendaftaran/                   # Domain-specific components for registration/cashier
│   ├── rekam-medis/                   # Domain-specific components for clinical exams
│   ├── program-khusus/                # Specialized clinical program components
│   ├── AppLayout.tsx                  # Responsive shell wrapper
│   ├── Navbar.tsx                     # Sticky top navigation bar
│   └── Sidebar.tsx                    # Collapsible / slide-over navigation drawer
├── constants/
│   ├── clinic.ts                      # Clinic profile, tariffs, villages, ICD-10 sets
│   └── theme.ts                       # Design tokens, color ramps, shadows
├── lib/
│   ├── supabase/                      # Browser and server PostgREST client wrappers
│   ├── storage.ts                     # Hybrid media storage adapter (Supabase + Cloudinary)
│   └── utils.ts                       # Formatter helpers (formatRupiah, cn, dates)
└── types/
    └── database.ts                    # Strongly-typed Supabase PostgreSQL schema interfaces
```

## 2. Specification Directory Conventions
Specifications are isolated per module to maintain strict scoping and prevent cross-tab regression:
- `.kiro/specs/dashboard-tab-revamp/`
  - `requirements.md` (Acceptance criteria, RFC 2119)
  - `design.md` (Component hierarchy, before vs after diffs, visual tokens)
  - `tasks.md` (Traceable checklist with verification checkpoints)
  - `spec.json` (Lifecycle state metadata)
