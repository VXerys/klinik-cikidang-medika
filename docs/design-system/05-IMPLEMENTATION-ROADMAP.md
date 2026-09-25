# Rencana Eksekusi Revamp UI (Implementation Roadmap)
*Klinik Pratama Cikidang Medika*

---

## 1. Prinsip Keamanan Kode (Safety Guarantee)

Perubahan ini bersifat **100% Visual & Presentasi (Design Layer Only)**:
- **DILARANG** mengubah struktur database di Supabase (`patients`, `doctors`, `visits`, `cash_flows`).
- **DILARANG** mengubah RPC functions, RLS policies, atau logika query SDK di client.
- **FOKUS** sepenuhnya pada penggantian token warna, styling Tailwind CSS, micro-interactions, layout padding, tipografi, dan perbaikan copywriting.

---

## 2. Tahapan Eksekusi Step-by-Step

```
Tahap 1: Centralized Design Tokens (src/constants/theme.ts)
   │
   ▼
Tahap 2: Atomic UI Primitives (src/components/ui/*)
   │     ├─ Button.tsx (Emerald primary, secondary outline, scale on press)
   │     ├─ Badge.tsx (BPJS teal, Umum blue, Antrean status pills)
   │     ├─ Card.tsx (Layered shadows, concentric 16px radius, header)
   │     ├─ Input.tsx & Select.tsx (Clean borders, focus ring emerald)
   │     ├─ Modal.tsx (Responsive dialog, smooth backdrop)
   │     └─ Table.tsx (Clean padding, sticky header, row hover)
   │
   ▼
Tahap 3: Navigasi & Shell Aplikasi (Sidebar, Navbar, AppLayout)
   │     ├─ Sidebar.tsx (Elera mint active pill, clinic status, role switcher)
   │     └─ Navbar.tsx (Breadcrumbs, date pill, quick search trigger)
   │
   ▼
Tahap 4: Modul Fitur Klinis (Pendaftaran & Rekam Medis)
   │     ├─ Pendaftaran (Patient search autocomplete, quick register)
   │     └─ Rekam Medis (Chronyx vital signs grid, multi-ICD10 chips, queue list)
   │
   ▼
Tahap 5: Modul Finansial & Dashboard (Buku Kas & Dashboard)
   │     ├─ Dashboard (KPI cards with delta tags, visit trend)
   │     └─ Buku Kas (Cashflow summary, transaction badges, Excel export)
   │
   ▼
Tahap 6: Verifikasi Akhir & Quality Gates
         ├─ npx tsc --noEmit (0 error)
         ├─ npm run build (0 error)
         └─ Mobile & Tablet Responsive Audit (360px, 768px, 1024px+)
```
