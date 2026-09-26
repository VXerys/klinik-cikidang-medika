-- =============================================================================
-- F-008: Public Health Registry + Referral Commission + Payment Debt Extension
-- =============================================================================

-- 1) Public Health Unified Registry (PTM, ANC, KB, 3 Eliminasi)
CREATE TABLE IF NOT EXISTS public.public_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type VARCHAR(20) NOT NULL, -- PTM / ANC / KB / ELIMINASI_3
  pasien_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,

  -- Snapshot identity fields for durable reporting
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(20),
  ttl VARCHAR(120),
  alamat TEXT,
  no_nik VARCHAR(30),

  -- Program-specific clinical fields
  diagnosa TEXT,
  lab TEXT,
  terapi TEXT,
  hbsag VARCHAR(50),
  jenis_kb VARCHAR(100),
  tanggal_kembali DATE,

  -- Linkage and metadata
  dokter_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  created_by_role VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_public_health_program_type
    CHECK (program_type IN ('PTM', 'ANC', 'KB', 'ELIMINASI_3'))
);

CREATE INDEX IF NOT EXISTS idx_public_health_program_type ON public.public_health_records(program_type);
CREATE INDEX IF NOT EXISTS idx_public_health_created_at ON public.public_health_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_health_nama ON public.public_health_records(nama);
CREATE INDEX IF NOT EXISTS idx_public_health_no_nik ON public.public_health_records(no_nik);

-- 2) Referral + commission baseline
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasien_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,

  sumber_rujukan VARCHAR(150) NOT NULL, -- bidan/paramedis/source label
  jenis_layanan VARCHAR(30) NOT NULL, -- infus / usg / lab
  nominal_komisi NUMERIC(15,2) NOT NULL DEFAULT 0,

  tahun_komisi INT NOT NULL,
  status_pembayaran VARCHAR(20) NOT NULL DEFAULT 'Belum Dibayar', -- Belum Dibayar / Dibayar
  catatan TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_referral_jenis_layanan
    CHECK (jenis_layanan IN ('infus', 'usg', 'lab')),
  CONSTRAINT chk_referral_status_pembayaran
    CHECK (status_pembayaran IN ('Belum Dibayar', 'Dibayar'))
);

CREATE INDEX IF NOT EXISTS idx_referral_tahun ON public.referral_commissions(tahun_komisi);
CREATE INDEX IF NOT EXISTS idx_referral_sumber ON public.referral_commissions(sumber_rujukan);
CREATE INDEX IF NOT EXISTS idx_referral_jenis_layanan ON public.referral_commissions(jenis_layanan);

-- 3) Visits debt/payment-state extension (non-breaking)
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS payment_state VARCHAR(20) DEFAULT 'Menunggu Pembayaran',
  ADD COLUMN IF NOT EXISTS piutang_nominal NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS piutang_note TEXT,
  ADD COLUMN IF NOT EXISTS piutang_approved_by_owner_at TIMESTAMPTZ;

ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS chk_visits_payment_state;

ALTER TABLE public.visits
  ADD CONSTRAINT chk_visits_payment_state
  CHECK (payment_state IN ('Menunggu Pembayaran', 'Lunas', 'Ditanggung BPJS', 'Belum Bayar', 'Piutang'));

CREATE INDEX IF NOT EXISTS idx_visits_payment_state ON public.visits(payment_state);
CREATE INDEX IF NOT EXISTS idx_visits_piutang_nominal ON public.visits(piutang_nominal);

-- 4) RLS enable + baseline policy alignment with current project policy style
ALTER TABLE public.public_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'public_health_records'
      AND policyname = 'Akses penuh public untuk aplikasi klinik - public_health_records'
  ) THEN
    CREATE POLICY "Akses penuh public untuk aplikasi klinik - public_health_records"
      ON public.public_health_records FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'referral_commissions'
      AND policyname = 'Akses penuh public untuk aplikasi klinik - referral_commissions'
  ) THEN
    CREATE POLICY "Akses penuh public untuk aplikasi klinik - referral_commissions"
      ON public.referral_commissions FOR ALL USING (true);
  END IF;
END
$$;
