---
id: F-005-DES
feature: F-005
title: "Design: Migrasi 7.493 Data CSV ke Supabase"
status: implemented
owner: "Developer"
last_updated: "2026-09-23"
last_verified_commit: "9a59997"
related:
  - "requirements.md"
  - "tasks.md"
  - "scripts/migrate-data.mjs"
---

# Design: F-005 Migrasi 7.493 Data CSV ke Supabase

## 1. Arsitektur ETL Script

Proses migrasi dieksekusi menggunakan script mandiri Node.js di `scripts/migrate-data.mjs`.

```text
CSV Files (docs/data/)
  ├── DASHBOARD - DATAUTAMA.csv (7.493 baris)
  └── DASHBOARD - DASHBOARD.csv (1.486 kas)
          │
          ▼
   [migrate-data.mjs] (Batch Chunk Ingestion 500 rows)
          │
          ▼
   Supabase PostgreSQL
     ├── public.doctors
     ├── public.patients (4.238 baris)
     ├── public.visits (7.493 baris)
     └── public.cash_flows (1.486 baris)
```

## 2. Strategi Batching
Untuk mencegah timeout koneksi HTTP REST Supabase:
- Data pasien disisipkan dalam batch 500 baris.
- Data kunjungan disisipkan dalam batch 500 baris dengan pemetaan ID pasien via lookup cache di memori.
- Data arus kas disisipkan dalam batch 200 baris.
