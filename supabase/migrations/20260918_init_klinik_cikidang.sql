-- =============================================================================
-- INISIALISASI DATABASE POSTGRESQL KLINIK CIKIDANG MEDIKA (PRODUCTION READY)
-- Sesuai rekomendasi Supabase Postgres Best Practices & Architecture Contract
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABEL DOKTER / PARAMEDIS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    spesialisasi VARCHAR(100) DEFAULT 'Dokter Umum',
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Dokter awal
INSERT INTO public.doctors (nama, spesialisasi) VALUES
('dr. Ovan', 'Dokter Umum'),
('dr. Neneng', 'Dokter Umum'),
('Admin/Bdn.Resa', 'Bidan / Paramedis')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. TABEL MASTER PASIEN
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_rm VARCHAR(30) UNIQUE NOT NULL,
    gelar VARCHAR(10) DEFAULT 'Tn',
    nama VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    tanggal_lahir VARCHAR(20),
    usia INT,
    desa VARCHAR(100) NOT NULL,
    alamat TEXT,
    no_ktp VARCHAR(30),
    no_bpjs VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_no_rm ON public.patients(no_rm);
CREATE INDEX IF NOT EXISTS idx_patients_nama ON public.patients(nama);
CREATE INDEX IF NOT EXISTS idx_patients_desa ON public.patients(desa);

-- -----------------------------------------------------------------------------
-- 3. TABEL KUNJUNGAN & REKAM MEDIS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_antrian VARCHAR(20),
    pasien_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dokter_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    tanggal_periksa DATE NOT NULL,
    jam_periksa TIME,
    bulan VARCHAR(30),
    kode_icd10 VARCHAR(20),
    diagnosa_deskripsi TEXT,
    keluhan_anamnesa TEXT,
    terapi_obat TEXT,
    tindakan VARCHAR(100),
    keterangan_tindakan TEXT,
    lab VARCHAR(100),
    lab_hasil VARCHAR(50),
    jenis_pasien VARCHAR(20) NOT NULL DEFAULT 'UMUM', -- BPJS / UMUM
    biaya_periksa NUMERIC(15,2) DEFAULT 0,
    pendapatan_lain NUMERIC(15,2) DEFAULT 0,
    keterangan_pendapatan TEXT,
    jenis_pembayaran VARCHAR(20) DEFAULT 'Tunai', -- Tunai / TF
    status_pembayaran VARCHAR(20) DEFAULT 'Lunas',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_tanggal ON public.visits(tanggal_periksa);
CREATE INDEX IF NOT EXISTS idx_visits_pasien_id ON public.visits(pasien_id);
CREATE INDEX IF NOT EXISTS idx_visits_dokter_id ON public.visits(dokter_id);
CREATE INDEX IF NOT EXISTS idx_visits_kode_icd10 ON public.visits(kode_icd10);
CREATE INDEX IF NOT EXISTS idx_visits_jenis_pasien ON public.visits(jenis_pasien);

-- -----------------------------------------------------------------------------
-- 4. TABEL BUKU KAS OPERASIONAL (CASH FLOW)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cash_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    jenis VARCHAR(10) NOT NULL, -- Masuk / Keluar
    kategori VARCHAR(50) NOT NULL, -- Kapitasi BPJS / Pengeluaran Obat / Operasional / Setor Tunai
    nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_flows_tanggal ON public.cash_flows(tanggal);
CREATE INDEX IF NOT EXISTS idx_cash_flows_jenis ON public.cash_flows(jenis);

-- -----------------------------------------------------------------------------
-- 5. TABEL PROGRAM KHUSUS (F-006)
-- -----------------------------------------------------------------------------

-- 5a. Register Kohort TBC (Pemantauan 6 Bulan)
CREATE TABLE IF NOT EXISTS public.tbc_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pasien_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    tanggal_mulai DATE NOT NULL,
    tipe_pasien VARCHAR(50) DEFAULT 'Kasus Baru', -- Baru / Kambuh / Pindahan
    kategori_oat VARCHAR(50) DEFAULT 'Kategori 1', -- Kategori 1 / Kategori 2
    fase_pengobatan VARCHAR(30) DEFAULT 'Intensif', -- Intensif / Lanjutan / Selesai / Putus
    bulan_ke INT DEFAULT 1, -- 1 s.d 6
    hasil_dahak_akhir VARCHAR(30), -- Positif / Negatif / Belum Periksa
    status_tbc VARCHAR(30) DEFAULT 'Dalam Pengobatan', -- Dalam Pengobatan / Sembuh / Pengobatan Lengkap / Mangkir
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tbc_pasien_id ON public.tbc_programs(pasien_id);
CREATE INDEX IF NOT EXISTS idx_tbc_status ON public.tbc_programs(status_tbc);

-- 5b. Register Tindakan Sirkumsisi (Sunat) + Dokumentasi Foto Medis
CREATE TABLE IF NOT EXISTS public.circumcisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pasien_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dokter_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    tanggal_tindakan DATE NOT NULL,
    metode VARCHAR(50) DEFAULT 'Manual / Laser', -- Manual / Laser / Cauter / Clamp
    kondisi_luka TEXT,
    foto_1_url TEXT, -- Path storage privat
    foto_2_url TEXT, -- Path storage privat
    storage_provider VARCHAR(20) DEFAULT 'supabase', -- supabase / cloudinary
    biaya NUMERIC(15,2) DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circumcisions_pasien_id ON public.circumcisions(pasien_id);
CREATE INDEX IF NOT EXISTS idx_circumcisions_tanggal ON public.circumcisions(tanggal_tindakan);

-- 5c. Monitoring Pasien Pos-Rawat Jalan
CREATE TABLE IF NOT EXISTS public.post_cares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pasien_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    tanggal_kontrol_berikutnya DATE NOT NULL,
    kondisi_terakhir TEXT,
    keluhan_lanjutan TEXT,
    status_kontrol VARCHAR(30) DEFAULT 'Menunggu', -- Menunggu / Sudah Kontrol / Mangkir
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_cares_pasien_id ON public.post_cares(pasien_id);
CREATE INDEX IF NOT EXISTS idx_post_cares_tgl_kontrol ON public.post_cares(tanggal_kontrol_berikutnya);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tbc_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circumcisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_cares ENABLE ROW LEVEL SECURITY;

-- Policy Akses Staff & Aplikasi (Menggunakan anon_key / service_role saat MVP)
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.doctors FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.patients FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.visits FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.cash_flows FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.tbc_programs FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.circumcisions FOR ALL USING (true);
CREATE POLICY "Akses penuh public untuk aplikasi klinik" ON public.post_cares FOR ALL USING (true);

-- -----------------------------------------------------------------------------
-- 7. SETUP STORAGE BUCKET UNTUK FOTO MEDIS (PRIVATE)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-photos', 'medical-photos', false)
ON CONFLICT (id) DO NOTHING;
