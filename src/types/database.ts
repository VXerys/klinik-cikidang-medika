export type Patient = {
  id: string;
  no_rm: string;
  gelar: string;
  nama: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  usia?: number;
  desa: string;
  alamat?: string;
  no_ktp?: string;
  no_bpjs?: string;
  riwayat_alergi?: string;
  no_telepon?: string;
  pekerjaan?: string;
  created_at: string;
};

export type Doctor = {
  id: string;
  nama: string;
  spesialisasi?: string;
  aktif: boolean;
  created_at?: string;
};

export type Visit = {
  id: string;
  nomor_antrian?: string;
  pasien_id: string;
  dokter_id?: string;
  tanggal_periksa: string;
  jam_periksa?: string;
  bulan: string;
  kode_icd10?: string;
  diagnosa_deskripsi?: string;
  keluhan_anamnesa?: string;
  terapi_obat?: string;
  tindakan?: string;
  keterangan_tindakan?: string;
  lab?: string;
  lab_hasil?: string;
  jenis_pasien: 'BPJS' | 'UMUM';
  biaya_periksa: number;
  pendapatan_lain: number;
  keterangan_pendapatan?: string;
  jenis_pembayaran?: 'Tunai' | 'TF';
  status_pembayaran: 'Lunas' | 'Pending';
  pasien?: Patient;
  dokter?: Doctor;
  created_at: string;
};

export type CashFlow = {
  id: string;
  tanggal: string;
  jenis: 'Masuk' | 'Keluar';
  kategori: 'Kapitasi BPJS' | 'Pendapatan Lain' | 'Pengeluaran Obat' | 'Pengeluaran Non Klinik' | 'Operasional' | 'Setor Tunai';
  nominal: number;
  keterangan?: string;
  created_at: string;
};

export type TbcProgram = {
  id: string;
  pasien_id: string;
  tanggal_mulai: string;
  tipe_pasien: 'Kasus Baru' | 'Kambuh' | 'Pindahan';
  kategori_oat: 'Kategori 1' | 'Kategori 2';
  fase_pengobatan: 'Intensif' | 'Lanjutan' | 'Selesai' | 'Putus';
  bulan_ke: number;
  hasil_dahak_akhir?: string;
  status_tbc: 'Dalam Pengobatan' | 'Sembuh' | 'Pengobatan Lengkap' | 'Mangkir';
  catatan?: string;
  pasien?: Patient;
  created_at: string;
};

export type Circumcision = {
  id: string;
  pasien_id: string;
  dokter_id?: string;
  tanggal_tindakan: string;
  metode: string;
  kondisi_luka?: string;
  foto_1_url?: string;
  foto_2_url?: string;
  storage_provider: 'supabase' | 'cloudinary';
  biaya: number;
  catatan?: string;
  pasien?: Patient;
  dokter?: Doctor;
  created_at: string;
};

export type PostCare = {
  id: string;
  pasien_id: string;
  visit_id?: string;
  tanggal_kontrol_berikutnya: string;
  kondisi_terakhir?: string;
  keluhan_lanjutan?: string;
  status_kontrol: 'Menunggu' | 'Sudah Kontrol' | 'Mangkir';
  pasien?: Patient;
  visit?: Visit;
  created_at: string;
};
