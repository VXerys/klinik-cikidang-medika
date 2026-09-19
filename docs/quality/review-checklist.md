---
id: QUALITY-REVIEW
title: Review Checklist
status: approved
owner: "Technical Lead"
last_updated: "2026-09-19"
---

# Review Checklist

## Scope and Traceability

- [ ] The scope of the change matches the intended task.
- [ ] No out-of-scope behavior is included.
- [ ] No fabricated data, claims, or statistics are introduced.

## Implementation and Security

- [ ] Supabase calls explicitly check for errors before using or returning data.
- [ ] Row Level Security (RLS) considerations are documented and enforced for all new tables.
- [ ] Monetary values and financial data use `NUMERIC(15,2)` in the database schema.
- [ ] The Indonesian locale (`id-ID`) is used consistently for displaying dates and currencies.
- [ ] No secrets or sensitive keys are hardcoded in the codebase.
- [ ] No `console.log` statements are left in production code.

## User Experience & Reusability

- [ ] The user interface is mobile responsive (as required by PRD NFRs).
- [ ] UI components MUST use atomic primitives from `src/components/ui/` (Button, Badge, Modal, Input, Select, Card).
- [ ] Constant clinic attributes (villages, honorifics, default tariffs) MUST be imported from `src/constants/clinic.ts` and never hardcoded.
- [ ] Error, loading, and empty states are implemented for the feature.
