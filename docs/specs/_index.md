---
id: FEATURE-REGISTRY
title: Feature Registry
status: active
owner: Developer
last_updated: 2026-09-18
---

# Feature Registry

This file is the durable navigation registry for feature specifications.

Mutable execution status, active task, blockers, and commits belong in `docs/context/state.yaml`.

| Feature ID | Feature | Spec path | Product priority | Lifecycle gate | Related milestone |
|---|---|---|---|---|---|
| `F-001` | Master Pasien & Kasir | `docs/specs/F-001-master-pasien-kasir/` | P1 | implemented | MVP |
| `F-002` | Rekam Medis Dokter | `docs/specs/F-002-rekam-medis-dokter/` | P1 | implemented | MVP |
| `F-003` | Buku Kas & Kapitasi BPJS | `docs/specs/F-003-buku-kas-operasional/` | P1 | approved | MVP |
| `F-004` | Dashboard & Ekspor Excel | `docs/specs/F-004-dashboard-laporan/` | P1 | pending | MVP |
| `F-005` | Migrasi 7,493 Data CSV | `docs/specs/F-005-migrasi-data-lama/` | P2 | implemented | MVP |
| `F-006` | Register Program Khusus | `docs/specs/F-006-program-khusus/` | P2 | requirements | MVP |

## Lifecycle gate meaning

- `draft`: specification is being written;
- `review`: awaiting product or architecture review;
- `approved`: contract is approved and may enter execution planning;
- `requirements`: requirements gathered;
- `pending`: waiting for prerequisites;
- `in_progress`: development active;
- `implemented`: accepted implementation exists;
- `superseded`: replaced by another feature contract.

Do not update this file for every task transition. The context system owns mutable progress.
