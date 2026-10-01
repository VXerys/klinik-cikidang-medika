-- =============================================================================
-- F-009: Circumcision register support
--
-- The clinic's SUNAT sheet lists 43 children with their birth date, address,
-- village, age, gender, weight, and phone, but it carries no procedure date, and
-- the five follow-up photo columns are empty.
--
-- A placeholder date would be invented clinical data, so the procedure date becomes
-- nullable: NULL means "not recorded yet". The clinic fills it in later through the
-- edit form, which is also where the before/after photos get attached.
--
-- Nothing is dropped: tanggal_tindakan stays, it just stops being mandatory.
--
-- Idempotent: safe to run more than once.
-- =============================================================================

ALTER TABLE public.circumcisions
  ALTER COLUMN tanggal_tindakan DROP NOT NULL;

ALTER TABLE public.circumcisions
  ADD COLUMN IF NOT EXISTS berat_badan VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sumber_data VARCHAR(30);

-- Records where the register is the source, so an import can be re-run without
-- duplicating and so the clinic can tell imported rows from freshly entered ones.
ALTER TABLE public.circumcisions
  DROP CONSTRAINT IF EXISTS chk_circumcisions_sumber_data;

ALTER TABLE public.circumcisions
  ADD CONSTRAINT chk_circumcisions_sumber_data
  CHECK (sumber_data IS NULL OR sumber_data IN ('SUNAT'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_circumcisions_pasien_sumber
  ON public.circumcisions (pasien_id, sumber_data)
  WHERE sumber_data IS NOT NULL;

-- The work queue for clinic admin: rows still missing their procedure date.
CREATE INDEX IF NOT EXISTS idx_circumcisions_tanpa_tanggal
  ON public.circumcisions (created_at)
  WHERE tanggal_tindakan IS NULL;

ALTER TABLE public.circumcisions ENABLE ROW LEVEL SECURITY;
