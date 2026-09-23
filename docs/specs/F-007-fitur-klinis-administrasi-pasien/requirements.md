---
id: F-007-REQ
feature: F-007
title: "Requirements: Fitur Klinis & Administrasi Pasien"
status: approved
owner: "dr. Ovan / Developer"
last_updated: "2026-09-23"
last_verified_commit: unverified
related:
  - "design.md"
  - "tasks.md"
  - "docs/product/prd.md"
---

# Requirements: F-007 Fitur Klinis & Administrasi Pasien

## 1. Executive Summary

Feature F-007 ("Fitur Klinis & Administrasi Pasien") melengkapi modul pelayanan dokter dan loket pendaftaran di Klinik Pratama Cikidang Medika dengan tiga kapabilitas esensial:
1. **Surat Keterangan Sakit (SKS) Generator**: Pembuatan dan pencetakan surat keterangan istirahat sakit berstandar resmi (kop klinik, nomor surat otomatis, rentang hari istirahat, tanda tangan dokter).
2. **Surat Rujukan Pasien Generator**: Pembuatan dan pencetakan surat rujukan pasien eksternal ke fasilitas kesehatan tingkat lanjut (RSUD Palabuhanratu / RS Sekarwangi).
3. **Sistem Proteksi Alergi Obat (Patient Drug Safety Alert)**: Peringatan visual merah jika pasien memiliki riwayat alergi obat serta deteksi reaktif saat dokter meresepkan terapi obat.
4. **Edit Biodata Pasien Lama**: Pembaruan data pasien (kontak telepon, alamat, nomor KTP/BPJS, riwayat alergi) langsung dari antarmuka loket pendaftaran.

---

## 2. Actors & Permissions

- **Dokter Pemeriksa (`dokter`)**: Menerbitkan Surat Sakit (SKS), menerbitkan Surat Rujukan, menerima peringatan alergi obat saat meresepkan terapi.
- **Petugas Loket Kasir (`kasir`)**: Menginput riwayat alergi dan kontak telepon saat registrasi pasien, mengedit biodata pasien lama yang memerlukan pembaruan.
- **Pimpinan Klinik (`owner`)**: Memantau keselamatan pelayanan medis dan kelengkapan arsip administratif.

---

## 3. Goals & Non-Goals

### Goals
- **G-001**: Dokter dapat mencetak Surat Keterangan Sakit resmi dalam < 10 detik langsung dari form rekam medis pasien tanpa keluar halaman.
- **G-002**: Dokter dapat mencetak Surat Rujukan eksternal lengkap dengan resume klinis dan tanda vital terisi otomatis.
- **G-003**: Sistem secara aktif menampilkan badge peringatan merah kontras tinggi jika pasien memiliki riwayat alergi obat, dan memberi alarm visual bila dokter memilih terapi yang mengandung alergen tersebut.
- **G-004**: Petugas kasir dapat memperbarui nomor telepon, nomor KTP, nomor BPJS, dan riwayat alergi pasien lama dalam modal inline tanpa membuat No RM baru.

### Non-Goals
- **NG-001**: Integrasi digital signature kriptografis berbasis sertifikat BSrE (tanda tangan manual basah / stempel klinik).
- **NG-002**: Bridging antrean rujukan elektronik BPJS V-Claim / P-Care (surat rujukan berbentuk cetak fisik standar Faskes 1).

---

## 4. Functional Requirements (RFC 2119 & EARS)

### FR-001: Surat Keterangan Sakit (SKS)
- **AC-001.1**: WHEN dokter membuka form pemeriksaan pasien di `/rekam-medis`, THEN sistem SHALL menampilkan tombol aksi *"Cetak Surat Sakit"*.
- **AC-001.2**: WHEN tombol *"Cetak Surat Sakit"* diklik, THEN sistem SHALL membuka modal dialog konfigurasi surat yang memuat:
  - Nomor Surat (terisi otomatis dengan format `SKS/CKM/{MM}/{YYYY}/{INDEX}`)
  - Nama dan umur pasien (terisi otomatis dari data rekam medis)
  - Jumlah hari istirahat (default 3 hari, dapat disesuaikan 1 s/d 14 hari)
  - Tanggal mulai s/d tanggal selesai istirahat
  - Anjuran medis tambahan
  - Dokter yang bertanda tangan
- **AC-001.3**: WHEN tombol cetak ditekan, THEN sistem SHALL menampilkan tata letak cetak ramah kertas A5 dengan kop surat resmi Klinik Pratama Cikidang Medika, alamat, nomor izin operasional, tanda tangan dokter, dan cap klinik.

### FR-002: Surat Rujukan Pasien Eksternal
- **AC-002.1**: WHEN dokter membuka form pemeriksaan pasien di `/rekam-medis`, THEN sistem SHALL menampilkan tombol aksi *"Cetak Rujukan"*.
- **AC-002.2**: WHEN tombol *"Cetak Rujukan"* diklik, THEN sistem SHALL membuka modal dengan data yang telah terisi otomatis:
  - Faskes Tujuan (pilihan cepat: RSUD Palabuhanratu, RS Sekarwangi, RS Betha Medika, atau kustom)
  - Poli Spesialis Tujuan (Penyakit Dalam, Bedah, Anak, Obgyn, Mata, THT, Saraf, dll.)
  - Resume Anamnesa & TTV (Tekanan Darah, Nadi, Suhu, Berat Badan)
  - Diagnosa Kerja (kode ICD-10 dan deskripsi)
  - Terapi / Tindakan yang telah diberikan
  - Alasan Rujukan (Pemeriksaan Lanjutan, Terapi Spesialistik, Ketiadaan Fasilitas)
- **AC-002.3**: Sistem SHALL menyediakan fungsi cetak dokumen format resmi A4/A5 untuk diserahkan kepada pasien/keluarga.

### FR-003: Sistem Proteksi Alergi Obat Pasien
- **AC-003.1**: Pada pendaftaran pasien baru maupun edit pasien, sistem SHALL menyediakan input teks `riwayat_alergi` dengan nilai baku `'Tidak Ada'`.
- **AC-003.2**: IF pasien memiliki riwayat alergi obat (nilai selain kosong atau 'Tidak Ada'), THEN sistem SHALL menampilkan badge merah peringatan di:
  - Header kartu identitas pasien di `/rekam-medis`
  - Hasil pencarian pasien di `/pendaftaran`
- **AC-003.3**: WHEN dokter menginput atau memilih resep obat yang mengandung kata kunci yang cocok dengan `riwayat_alergi`, THEN sistem SHALL menampilkan banner peringatan bahaya alergi berkedip/kontras tinggi dengan teks *"Perhatian: Pasien alergi terhadap [Nama Obat]"*.

### FR-004: Edit Biodata Pasien Lama
- **AC-004.1**: WHEN petugas kasir mencari pasien di `/pendaftaran` dan pasien terpilih, THEN sistem SHALL menyediakan tombol *"Edit Biodata"*.
- **AC-004.2**: Sistem SHALL membuka modal edit yang memungkinkan pembaruan Nama, Tanggal Lahir, Jenis Kelamin, Alamat, Desa, NIK KTP, No BPJS, Kontak Telepon, Pekerjaan, dan Riwayat Alergi.
- **AC-004.3**: WHEN data disimpan, THEN sistem SHALL meng-update baris pasien di `public.patients` dan memperbarui tampilan UI seketika tanpa reload halaman.
