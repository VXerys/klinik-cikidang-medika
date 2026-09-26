-- =============================================================================
-- Penyelarasan Tipe Kolom Database Produksi
-- =============================================================================
-- Proyek produksi dibuat lebih awal dengan kolom bertipe TEXT yang longgar.
-- Tipe longgar itulah yang memungkinkan nilai seperti "UMUM" tersimpan pada
-- kolom jam dan teks bebas tersimpan pada kolom nomor BPJS.
--
-- Migrasi ini menyamakan tipe kolom produksi dengan skema kanonik yang dipakai
-- di `supabase/migrations/20260918_init_klinik_cikidang.sql`, sehingga batas
-- panjang dan tipe waktu ditegakkan oleh database, bukan hanya oleh aplikasi.
--
-- Prasyarat: data sudah dimigrasikan ulang dengan pembersihan nilai
-- (lihat `scripts/migrate-data.mjs`), sehingga seluruh nilai muat pada tipe baru.
-- Bila ada nilai yang tidak muat, ALTER akan gagal dan tidak mengubah apa pun.
-- =============================================================================

DO $$
BEGIN
  -- Tabel pasien
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'no_rm' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN no_rm TYPE VARCHAR(30);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'nama' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN nama TYPE VARCHAR(150);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'tanggal_lahir' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN tanggal_lahir TYPE VARCHAR(20);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'desa' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN desa TYPE VARCHAR(100);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'no_ktp' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN no_ktp TYPE VARCHAR(30);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients'
      AND column_name = 'no_bpjs' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.patients ALTER COLUMN no_bpjs TYPE VARCHAR(30);
  END IF;

  -- Tabel kunjungan
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visits'
      AND column_name = 'nomor_antrian' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.visits ALTER COLUMN nomor_antrian TYPE VARCHAR(20);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visits'
      AND column_name = 'jam_periksa' AND data_type = 'text'
  ) THEN
    -- Casting eksplisit diperlukan untuk text -> time. Data sudah divalidasi
    -- sehingga konversi ini akan gagal, bukan menghasilkan waktu palsu, bila
    -- masih ada nilai yang tidak sah.
    ALTER TABLE public.visits
      ALTER COLUMN jam_periksa TYPE TIME WITHOUT TIME ZONE
      USING jam_periksa::time without time zone;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visits'
      AND column_name = 'bulan' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.visits ALTER COLUMN bulan TYPE VARCHAR(30);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visits'
      AND column_name = 'kode_icd10' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.visits ALTER COLUMN kode_icd10 TYPE VARCHAR(20);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visits'
      AND column_name = 'lab_hasil' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.visits ALTER COLUMN lab_hasil TYPE VARCHAR(50);
  END IF;
END
$$;
