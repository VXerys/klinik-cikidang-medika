# Database Migration Runbook

## Rules

1. All schema changes use versioned migration files.
2. Migrations must be deterministic and reviewable.
3. Existing data impact must be analyzed before deployment.
4. Destructive changes require explicit approval and a compatibility plan.
5. Dashboard or SQL-editor changes must be captured as migrations before release.
6. Never edit applied migrations.

## Create Migration

Create a new file in the `supabase/migrations/` directory with a timestamp prefix (e.g., `20260919_add_new_table.sql`). Write your DDL SQL in this file.

## Apply Locally and to Production

Test locally against your Supabase project (or local instance if configured) before production.
Apply to the production environment by running the SQL in the Supabase SQL Editor.

## Verification

- [ ] Schema matches the intended design.
- [ ] Existing data remains valid.
- [ ] Authorization policies remain enforced.
- [ ] Required indexes support expected queries.
- [ ] Application compatibility is tested.

## Backfill

- Strategy: Use `INSERT` or `UPDATE` statements with a `WHERE` clause. Never bulk overwrite.
- Batch size: Apply in controlled batches if operating on a large dataset.
- Observability: Verify row counts affected in the Supabase SQL Editor.
- Retry behavior: Re-runnable if designed idempotently, or use a new migration to correct errors.

## Rollback

Write a reverse migration (a new migration file that reverts the schema changes made by the faulty migration).

When rollback is unsafe, document the forward-fix strategy and obtain explicit risk acceptance.
