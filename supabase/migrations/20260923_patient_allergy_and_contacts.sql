-- =============================================================================
-- MIGRATION: 20260923_patient_allergy_and_contacts.sql
-- Menambahkan kolom riwayat alergi, kontak telepon, dan pekerjaan pada tabel patients
-- =============================================================================

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS riwayat_alergi TEXT DEFAULT 'Tidak Ada',
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(30),
ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(100);

-- Index untuk pencarian atau filter riwayat alergi jika diperlukan
CREATE INDEX IF NOT EXISTS idx_patients_riwayat_alergi ON public.patients(riwayat_alergi);
