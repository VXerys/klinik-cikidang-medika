# Adaptasi Antarmuka Berdasarkan Peran (RBAC UI Adaptation)
*Klinik Pratama Cikidang Medika*

---

## 1. Peran 1: Kasir / Petugas Pendaftaran (Front Office)

### 1.1 Kebutuhan Utama
- Kecepatan input pasien (kurang dari 1 menit per pendaftaran).
- Kejelasan status pembayaran (Lunas vs Belum Lunas).
- Kemudahan cetak struk/nota pembayaran dan kuitansi pasien.

### 1.2 Adaptasi Visual & Komponen
1. **Highlight Pencarian Cepat**:
   - Kolom pencarian otomatis fokus saat membuka halaman pendaftaran.
   - Deteksi otomatis pasien lama vs baru.
2. **Badge Tagihan & Status Kas**:
   - Total tarif langsung dihitung secara transparan di kasir setelah dokter menyelesaikan pemeriksaan obat/tindakan.
   - Badge "Menunggu Pembayaran" berwarna oranye terang yang mencolok agar kasir segera memanggil pasien untuk pelunasan dan penyerahan obat.
3. **Aksi 1-Klik**:
   - Tombol "Cetak Kuitansi" dan "Konfirmasi Lunas" berada di baris teratas dengan kontras tinggi.

---

## 2. Peran 2: Dokter / Tenaga Medis (Clinical Office)

### 2.1 Kebutuhan Utama
- Ergonomi pengetikan: Dokter tidak ingin terlalu banyak mengetik hal yang repetitif (malas ngetik).
- Visual tanda vital pasien yang mudah dibaca dalam 1 detik.
- Multi-diagnosa cepat dengan tombol chip (ICD-10 autocomplete) dan template resep obat standar klinik.

### 2.2 Adaptasi Visual & Komponen
1. **Daftar Antrean Ringkas**:
   - Kartu antrean pasien menunggu diurutkan berdasarkan jam kedatangan.
   - Pasien prioritas (anak kecil, lansia, atau gawat darurat) memiliki pin badge khusus.
2. **Widget Tanda Vital (Chronyx Style)**:
   - 4 kotak input angka kompak (Tekanan Darah, Nadi, Suhu, Nafas) dengan format tabular.
3. **Chip Pintasan Diagnosa & Obat**:
   - Diagnosa populer (ISPA, Dispepsia, Hipertensi, GEA, Faringitis) tersedia sebagai chip yang bisa diklik 1 kali.
   - Kolom pencarian ICD-10 dengan autocomplete instan.
4. **Tombol Konfirmasi Terakhir**:
   - Tombol "Selesai Periksa & Kirim ke Kasir" hanya aktif setelah diagnosa diisi, mencegah dokter salah klik sebelum selesai memeriksa.

---

## 3. Peran 3: Pimpinan Klinik / Pemilik (dr. Ovan & dr. Neneng)

### 3.1 Kebutuhan Utama
- Ringkasan eksekutif pendapatan klinik harian, mingguan, dan bulanan.
- Komparasi pendapatan Pasien Umum vs Pasien BPJS (Kapitasi + Non-Kapitasi).
- Ekspor data bersih ke Excel untuk akuntansi dan arsip dinas kesehatan.

### 3.2 Adaptasi Visual & Komponen
1. **Kartu KPI Finansial Bersih**:
   - Kartu Saldo Kasir, Kas Masuk Hari Ini, Kas Keluar, dan Estimasi Kapitasi BPJS Bulanan dengan angka monospaced tebal ber-format Rupiah standar Indonesia.
2. **Grafik Tren Pasien**:
   - Tren kunjungan 30 hari terakhir dengan visual modern dan tooltip interaktif.
3. **Buku Kas & Rekonsiliasi**:
   - Tabel kas keluar masuk dengan filter kategori (Operasional, Honor Dokter, Obat, dll.) dan tombol ekspor Excel cepat.
