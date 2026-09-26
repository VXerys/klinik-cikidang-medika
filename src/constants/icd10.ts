/**
 * ICD-10 Disease Codes & Presets
 * Klinik Pratama Cikidang Medika
 */

export interface Icd10Item {
  code: string;
  name: string;
  category?: string;
}

/**
 * 8 Diagnosa Teratas Klinik Cikidang Medika
 * Berdasarkan frekuensi kunjungan historis tertinggi (> 4.000+ kasus)
 */
export const POPULAR_ICD10: readonly Icd10Item[] = [
  { code: 'J00', name: 'ISPA / Nasopharyngitis Akut', category: 'Respirasi' },
  { code: 'K30', name: 'Dispepsia / Sakit Lambung', category: 'Pencernaan' },
  { code: 'Z34', name: 'Pemeriksaan Kehamilan Normal (ANC)', category: 'Kebidanan' },
  { code: 'L23', name: 'Dermatitis Kontak Alergi', category: 'Kulit' },
  { code: 'R50', name: 'Demam / Observasi Febris', category: 'Gejala Umum' },
  { code: 'E11', name: 'Diabetes Mellitus (DM)', category: 'Endokrin' },
  { code: 'A09', name: 'Gastroenteritis / Diare Akut', category: 'Pencernaan' },
  { code: 'Z00', name: 'Pemeriksaan Kesehatan Umum', category: 'Pemeriksaan' },
] as const;

/**
 * Katalog Diagnosa Rawat Jalan Umum Faskes Primer (ICD-10)
 */
export const COMMON_ICD10_LIST: readonly Icd10Item[] = [
  ...POPULAR_ICD10,
  { code: 'I10', name: 'Hipertensi Esensial (Primer)', category: 'Kardiovaskular' },
  { code: 'J20', name: 'Bronkitis Akut', category: 'Respirasi' },
  { code: 'J45', name: 'Asma Bronkiale', category: 'Respirasi' },
  { code: 'J02', name: 'Faringitis Akut', category: 'Respirasi' },
  { code: 'J03', name: 'Tonsilitis Akut', category: 'Respirasi' },
  { code: 'K29', name: 'Gastritis & Duodenitis', category: 'Pencernaan' },
  { code: 'M79', name: 'Mialgia / Nyeri Otot & Sendi', category: 'Muskuloskeletal' },
  { code: 'M54', name: 'Nyeri Punggung Bawah / LBP', category: 'Muskuloskeletal' },
  { code: 'N39', name: 'Infeksi Saluran Kemih (ISK)', category: 'Urologi' },
  { code: 'R51', name: 'Sakit Kepala / Cephalgia', category: 'Saraf' },
  { code: 'G43', name: 'Migren', category: 'Saraf' },
  { code: 'H10', name: 'Konjungtivitis Akut', category: 'Mata' },
  { code: 'H66', name: 'Otitis Media Akut', category: 'THT' },
  { code: 'B35', name: 'Dermatofitosis / Jamur Kulit (Tinea)', category: 'Kulit' },
  { code: 'L02', name: 'Abses Kulit / Bisul / Furunkel', category: 'Kulit' },
  { code: 'L50', name: 'Urtikaria / Biduran', category: 'Kulit' },
  { code: 'A01', name: 'Demam Tifoid / Tifus', category: 'Infeksi' },
  { code: 'B01', name: 'Varisela / Cacar Air', category: 'Infeksi' },
  { code: 'B05', name: 'Campak / Morbili', category: 'Infeksi' },
  { code: 'A15', name: 'Tuberkulosis Paru (TBC)', category: 'Infeksi' },
  { code: 'T14', name: 'Luka Ringan / Trauma Terbuka', category: 'Cedera' },
  { code: 'K02', name: 'Karies Gigi / Pulpitis', category: 'Gigi & Mulut' },
  { code: 'R05', name: 'Batuk Tanpa Spesifikasi', category: 'Respirasi' },
  { code: 'R11', name: 'Mual dan Muntah', category: 'Pencernaan' },
  { code: 'R42', name: 'Pusing Berputar / Vertigo', category: 'Saraf' },
] as const;
