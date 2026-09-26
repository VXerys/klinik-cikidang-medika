# Standar Copywriting & Bahasa Antarmuka Klinik
*Pedoman Komunikasi Ramah & Anti-Slop (SIM Klinik Pratama Cikidang Medika)*

---

## 1. Prinsip Utama Copywriting

1. **Jelas, Singkat, dan Berorientasi Tindakan**:
   - Staf klinik bekerja cepat. Setiap label tombol dan instruksi harus langsung dipahami tanpa perlu berpikir dua kali.
   - Gunakan kata kerja aktif: "Daftarkan Pasien", "Simpan Resep", "Konfirmasi Pembayaran".
2. **Bahasa Indonesia Baku yang Manusiawi (Bukan Istilah Teknis Pemrograman)**:
   - Hindari pesan error teknis seperti `Failed to fetch`, `Null pointer`, atau `Query returned 400`.
   - Ganti dengan: "Data pasien gagal disimpan. Silakan periksa koneksi atau coba beberapa saat lagi."
3. **Bebas AI Slop & Buzzword Kosong**:
   - Dilarang keras menggunakan kata-kata hampa AI seperti: *seamless, revolusioner, mengakselerasi, ekosistem paripurna, membuka potensi, game-changer*.
   - Dilarang menggunakan tanda strip panjang (em dash `—`) pada salinan antarmuka UI.
4. **Empati Medis**:
   - Informasi pasien bersifat privat dan sensitif. Label dan petunjuk ditulis dengan nada tenang, tertib, dan profesional.

---

## 2. Kamus Istilah Resmi Antarmuka

| Istilah Kurang Tepat / Teknis | Istilah Resmi yang Digunakan | Penjelasan Konteks |
|---|---|---|
| User / Client / Subject | **Pasien** | Orang yang berobat ke klinik |
| Registration Entry Form | **Pendaftaran Pasien** | Formulir penerimaan pasien baru atau lama |
| Medical Record ID | **No. Rekam Medis (No. RM)** | Nomor identitas rekam medis resmi pasien |
| Physician Examination | **Pemeriksaan Dokter** | Tahap anamnesa, fisik, diagnosa & resep |
| Clinical Action | **Tindakan Medis** | Prosedur seperti jahit luka, nebulizer, dll. |
| Drug Dispensation | **Pengambilan Obat** | Penyerahan obat resep ke pasien |
| Billing Checkout | **Pembayaran & Kasir** | Tahap pelunasan biaya periksa & obat |
| Cash Inflow / Outflow | **Kas Masuk / Kas Keluar** | Pembukuan transaksi tunai di klinik |
| BPJS Capitation Pool | **Kapitasi BPJS** | Dana bulanan kapitasi dari BPJS Kesehatan |

---

## 3. Pesan Status & Kosong (Empty States)

| Komponen | Kalimat yang Dihindari | Kalimat Standar yang Digunakan |
|---|---|---|
| **Antrean Kosong** | `Tidak ada data antrean yang tersedia di database saat ini.` | **Belum ada pasien yang mengantre saat ini.** <br><small>Pasien yang didaftarkan di kasir akan muncul di sini secara otomatis.</small> |
| **Pencarian Tidak Ditemukan** | `0 hasil query ditemukan untuk keyword tersebut.` | **Pasien tidak ditemukan.** <br><small>Pastikan nama, NIK, atau No. RM sudah benar, atau klik tombol di bawah untuk mendaftarkan pasien baru.</small> |
| **Resep Belum Diisi** | `Data prescription masih berstatus null/kosong.` | **Belum ada obat yang ditambahkan ke resep.** |
| **Kasir Hari Ini Nihil** | `No transactional records found.` | **Belum ada transaksi pembayaran tercatat hari ini.** |

---

## 4. Teks Aksi Tombol (Button Copy Rules)

- Tombol konfirmasi harus menyebutkan objek aksinya secara eksplisit:
  - Gunakan: **"Simpan Rekam Medis"** (Bukan hanya *"Simpan"* atau *"Submit"*).
  - Gunakan: **"Kirim ke Kasir & Farmasi"** (Bukan hanya *"Next"* atau *"Lanjut"*).
  - Gunakan: **"Cetak Kuitansi Pembayaran"** (Bukan hanya *"Print"*).
  - Gunakan: **"Batal & Tutup"** (Bukan hanya *"Cancel"*).
