-- =============================================================================
-- F-009: Reconciliation support
--
-- Adds the structure the reconciliation script needs so it can be re-run safely:
--   - the bidan referral source on visits
--   - patient identity provenance for linked legacy numbers and patient-master rows
--   - triple elimination screening fields on the public health registry
--   - a uniqueness guarantee that makes the register backfill idempotent
--
-- This migration adds structure only. It does not move data; the backfill is done
-- by scripts/reconcile-clinic-data.mjs so it stays auditable and repeatable.
--
-- Idempotent: safe to run more than once.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bidan referral source on visits
-- -----------------------------------------------------------------------------

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS bidan_rujukan VARCHAR(100);

-- Only "Bdn.<name>" values are referral sources. "Admin/Bdn.Resa" is internal staff
-- and must never be stored here, so the constraint keeps that distinction enforced
-- at the database boundary rather than only in application code.
ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS chk_visits_bidan_rujukan;

ALTER TABLE public.visits
  ADD CONSTRAINT chk_visits_bidan_rujukan
  CHECK (bidan_rujukan IS NULL OR bidan_rujukan ~ '^Bdn\.[A-Za-z ]+$');

CREATE INDEX IF NOT EXISTS idx_visits_bidan_rujukan
  ON public.visits (bidan_rujukan)
  WHERE bidan_rujukan IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. Patient identity provenance
-- -----------------------------------------------------------------------------

-- no_rm_lama keeps the previous value whenever reconciliation pads a medical record
-- number, so F-008's promise that a legacy number stays searchable still holds.
-- sumber_data records where a patient row came from, including the patients that
-- exist in the patient master but have no visit in the migrated period.
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS no_rm_lama VARCHAR(30),
  ADD COLUMN IF NOT EXISTS sumber_data VARCHAR(30);

ALTER TABLE public.patients
  DROP CONSTRAINT IF EXISTS chk_patients_sumber_data;

ALTER TABLE public.patients
  ADD CONSTRAINT chk_patients_sumber_data
  CHECK (sumber_data IS NULL OR sumber_data IN ('REKAMMEDIS', 'DATAPASIEN'));

CREATE INDEX IF NOT EXISTS idx_patients_no_rm_lama
  ON public.patients (no_rm_lama)
  WHERE no_rm_lama IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Triple elimination screening fields on the public health registry
-- -----------------------------------------------------------------------------

-- hbsag already exists on this table and is reused, not duplicated.
ALTER TABLE public.public_health_records
  ADD COLUMN IF NOT EXISTS gpa VARCHAR(30),
  ADD COLUMN IF NOT EXISTS uk VARCHAR(30),
  ADD COLUMN IF NOT EXISTS tp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS hiv VARCHAR(30),
  ADD COLUMN IF NOT EXISTS syphilis VARCHAR(30);

-- -----------------------------------------------------------------------------
-- 4. One register row per visit per program
-- -----------------------------------------------------------------------------

-- Makes the MONITOR backfill idempotent: a second run cannot create a duplicate
-- register row for the same visit and program (F-009 AC-004.6).
CREATE UNIQUE INDEX IF NOT EXISTS uq_public_health_visit_program
  ON public.public_health_records (visit_id, program_type)
  WHERE visit_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. Row Level Security
-- -----------------------------------------------------------------------------

-- New columns inherit the tables' existing policies. Re-asserting RLS here is a
-- guard, not a change: enabling an already-enabled table is a no-op.
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_health_records ENABLE ROW LEVEL SECURITY;
