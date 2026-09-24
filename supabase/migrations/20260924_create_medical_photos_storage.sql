-- =============================================================================
-- SETUP STORAGE BUCKET & ROW LEVEL SECURITY POLICIES: medical-photos
-- Sesuai arsitektur ADR-002: Supabase Storage Private Bucket untuk Foto Medis
-- =============================================================================

-- 1. Pastikan bucket 'medical-photos' terdaftar sebagai private bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-photos',
  'medical-photos',
  false,
  5242880, -- 5 MB batas maksimal
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 2. Hapus policy lama jika ada untuk mencegah duplikasi/konflik
DROP POLICY IF EXISTS "Allow public insert to medical-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select from medical-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to medical-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from medical-photos" ON storage.objects;

-- 3. Buat RLS Policies pada tabel storage.objects untuk bucket 'medical-photos'
-- Mengizinkan role public/anon/authenticated untuk mengunggah foto sirkumsisi
CREATE POLICY "Allow public insert to medical-photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'medical-photos');

-- Mengizinkan pembuatan signed URL dan pembacaan foto medis
CREATE POLICY "Allow public select from medical-photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'medical-photos');

-- Mengizinkan perbaruan foto medis jika diperlukan
CREATE POLICY "Allow public update to medical-photos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'medical-photos')
WITH CHECK (bucket_id = 'medical-photos');

-- Mengizinkan penghapusan foto medis jika diperlukan
CREATE POLICY "Allow public delete from medical-photos"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'medical-photos');
