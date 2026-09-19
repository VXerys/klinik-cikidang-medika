# Klinik Pratama Cikidang Medika
### Sistem Informasi Manajemen (SIM) Pelayanan Pasien & Keuangan Klinik

[![Status](https://img.shields.io/badge/Status-Live_Development-blue?style=for-the-badge)]()
[![Platform](https://img.shields.io/badge/Platform-Web_Application-emerald?style=for-the-badge)]()
[![Location](https://img.shields.io/badge/Lokasi-Cikidang%2C_Sukabumi-orange?style=for-the-badge)]()

**Klinik Pratama Cikidang Medika** adalah platform sistem informasi manajemen klinik modern yang dirancang khusus untuk mempermudah operasional harian staf medis, dokter, dan pimpinan klinik di Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat.

Aplikasi ini mentransformasikan proses administrasi manual dari ribuan baris spreadsheet Google Sheets menjadi sistem digital terintegrasi yang cepat, rapi, dan dapat diakses dengan aman baik dari meja resepsionis maupun dari perangkat mobile pimpinan klinik.

---

## 🎯 Masalah yang Diselesaikan

Sebelum sistem ini dibangun, operasional klinik mencatat seluruh pendaftaran dan keuangan melalui Google Sheets yang telah menampung lebih dari **7.400+ baris transaksi kunjungan** dan **4.200+ pasien**. Hal ini menimbulkan berbagai kendala:
- **Pencarian Data Lambat:** Membuka ribuan baris di spreadsheet memerlukan waktu lama saat pasien mengantre di loket.
- **Risiko Data Tertimpa / Terhapus:** Sel formula dan riwayat data pasien rentan terubah tanpa sengaja.
- **Pemisahan Pasien BPJS vs Umum:** Perhitungan tagihan dan pencatatan klaim kapitasi BPJS rentan tertukar dengan pembayaran umum.
- **Keterbatasan Rekam Medis:** Dokter kesulitan melihat riwayat diagnosa dan obat pasien sebelumnya dalam satu tampilan ringkas.

Sistem Informasi Klinik Cikidang Medika hadir sebagai solusi menyeluruh untuk menjamin kecepatan layanan loket di bawah 30 detik per pasien serta akurasi pelaporan keuangan 100%.

---

## ✨ Fitur-Fitur Utama

### 1. 📋 Loket Pendaftaran & Billing Kasir
- **Pencarian Cepat Autocomplete:** Menemukan data dari 4.238+ pasien lama hanya dengan mengetik 2 huruf (berdasarkan Nama, Nomor Rekam Medis, atau Desa domisili).
- **Registrasi Pasien Baru:** Pembuatan nomor rekam medis otomatis berurutan dengan opsi desa lokal Cikidang (*Cikidang, Pangkalan, Nangerang, Cikiray, Sampora, dll.*).
- **Penomoran Antrean Harian:** Antrean urut harian otomatis (#1, #2, dst.) yang langsung tersambung ke ruang periksa dokter.
- **Pemisahan Billing Otomatis:**
  - **Pasien BPJS:** Tarif pemeriksaan otomatis diset Rp 0 (Klaim Kapitasi BPJS).
  - **Pasien UMUM:** Tarif pemeriksaan standar dengan opsi biaya tindakan tambahan.
- **Cetak Kuitansi Resmi:** Cetak bukti pembayaran instan berformat nota klinik resmi dalam satu klik.

### 2. 🩺 Rekam Medis Ringkas Dokter
- **Ruang Periksa Digital:** Dokter melihat daftar antrean pasien hari ini secara *real-time*.
- **Quick-Pick Diagnosa ICD-10:** Pilihan instan 1-klik untuk 8 penyakit teratas klinik (ISPA, Dispepsia/Lambung, Pemeriksaan Kehamilan/ANC, Dermatitis Alergi, Demam, Diabetes Mellitus, Diare Akut).
- **Resep & Terapi Obat:** Pencatatan terapi obat dan instruksi tindakan dokter.
- **Linimasa Riwayat Pasien:** Dokter dapat langsung melihat seluruh riwayat kunjungan lampau pasien bersangkutan beserta obat yang pernah diberikan.

### 3. 💼 Pembukuan Kas Operasional
- **Pencatatan Arus Kas Masuk:** Penerimaan kasir harian (Tunai & Transfer) serta dana klaim kapitasi BPJS bulanan.
- **Pencatatan Arus Kas Keluar:** Pengeluaran belanja obat/alkes, operasional klinik, serta rekap setor tunai kasir ke bank.
- **Audit Finansial Rapi:** Setiap transaksi tercatat dengan tanggal, kategori, nominal, dan penanggung jawab.

### 4. 📊 Dashboard Eksekutif & Laporan Excel
- **Pantauan Kunjungan Harian & Bulanan:** Grafik tren pasien baru vs pasien lama.
- **Statistik 10 Besar Penyakit:** Pemetaan sebaran diagnosa penyakit terbanyak di wilayah Cikidang.
- **Ekspor Excel 1-Klik:** Unduh rekapitulasi data pendaftaran, kunjungan, dan keuangan kasir ke format Microsoft Excel (`.xlsx`) tanpa batasan baris.

---

## 👥 Pengguna Sistem (User Roles)

| Peran | Tanggung Jawab Utama |
|---|---|
| **Petugas Loket / Kasir** | Melayani pendaftaran pasien lama/baru, mengatur antrean harian, menerima pembayaran, dan mencetak kuitansi. |
| **Dokter Pemeriksa** | Memanggil antrean pasien, mencatat anamnesa, menetapkan diagnosa ICD-10, meresepkan terapi obat, dan memantau riwayat medis. |
| **Pimpinan / Pemilik Klinik** | Memantau omzet harian/bulanan, arus kas operasional, tren kunjungan, serta mengunduh laporan eksekutif dari mana saja melalui smartphone. |

---

## 🏛️ Profil Faskes

- **Nama Faskes:** Klinik Pratama Cikidang Medika
- **Lokasi:** Jl. Raya Cikidang KM. 01, Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat
- **Izin Operasional:** 503/012/K-PRATAMA/DPMPTSP
- **Layanan:** Rawat Jalan Umum, Pemeriksaan Ibu Hamil (ANC), Sirkumsisi (Sunat Medis), dan Program Pengobatan Kohort.

---

*Hak Cipta © 2026 Klinik Pratama Cikidang Medika. Dikembangkan khusus untuk peningkatan mutu pelayanan kesehatan masyarakat Cikidang.*
