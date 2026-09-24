---
id: F-002-DESIGN
feature: F-002
title: "Technical Design: Rekam Medis Ringkas Dokter & Tabbed Clinical Workspace"
status: approved
owner: "Developer"
last_updated: "2026-09-24"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "tasks.md"
  - "docs/architecture/overview.md"
---

# Technical Design: F-002 Rekam Medis Ringkas Dokter & Alur Pelayanan

## 1. Arsitektur State Machine & Alur Antrean (Lifecycle State Machine)

Untuk mengeliminasi kartu antrean ganda (*redundant cards*) yang sebelumnya muncul di dua tab sekaligus, sistem menetapkan mesin status linier yang saling lepas (*mutually exclusive*) pada kolom `public.visits.status_pembayaran`:

```mermaid
stateDiagram-v2
    [*] --> Menunggu_Dokter : 1. Pasien Mendaftar di Loket
    
    state Menunggu_Dokter {
        [*] --> Antrean_Poli : Terbitkan Karcis Antrean
        Antrean_Poli --> Dipanggil_Dokter : Dokter Buka Rekam Medis
    }
    
    Menunggu_Dokter --> Menunggu_Kasir : 2. Dokter Klik "Selesai Periksa & Kirim ke Kasir"
    
    state Menunggu_Kasir {
        [*] --> Verifikasi_Tagihan : Kasir Buka Dialog Pelunasan
        Verifikasi_Tagihan --> Hitung_Kembalian : Terima Tunai / TF
    }
    
    Menunggu_Kasir --> Lunas : 3. Kasir Selesaikan Pembayaran (Umum)
    Menunggu_Kasir --> Ditanggung_BPJS : 3. Kasir Selesaikan Penyerahan Obat (BPJS Murni)
    
    Lunas --> [*] : Cetak Kuitansi Resmi
    Ditanggung_BPJS --> [*] : Pasien Pulang Bawa Obat
```

### Pemetaan Status ke Tab Halaman `/pendaftaran`:

| Status Kunjungan | Tab di `/pendaftaran` | Tombol Aksi yang Muncul | Keterangan |
|---|---|---|---|
| `Menunggu Dokter` | **Menunggu Dokter** | Karcis, Edit | Pasien di ruang tunggu. **Tidak ada tombol kasir.** |
| `Menunggu Kasir` | **Menunggu Pembayaran** | **Bayar Kasir** (Primer Hijau), Karcis | Pemeriksaan selesai. Siap dilunasi & obat diserahkan. |
| `Lunas` | **Selesai / Lunas** | Kuitansi, Karcis | Pembayaran umum tunai/transfer selesai. |
| `Ditanggung BPJS` | **Selesai / Lunas** | Kuitansi (Rp 0), Karcis | Klaim kapitasi BPJS selesai. |

---

## 2. Sequence Diagram: Alur Pelayanan End-to-End

```mermaid
sequenceDiagram
    autonumber
    actor P as Pasien
    actor L as Loket Registrasi
    actor D as Ruang Dokter
    actor K as Kasir & Farmasi
    participant DB as Supabase PostgreSQL

    %% Tahap 1: Registrasi
    P->>L: Datang ke klinik (KTP / No BPJS / No RM)
    L->>DB: INSERT visits (status_pembayaran: 'Menunggu Dokter')
    DB-->>L: Visit created with ID & Queue No
    L->>P: Cetak & serahkan Karcis Antrean Poli
    Note over L,P: Pasien menunggu di ruang tunggu poli

    %% Tahap 2: Pemeriksaan Dokter
    D->>DB: SELECT visits WHERE tanggal = TODAY AND status = 'Menunggu Dokter'
    D->>D: Dokter periksa pasien (Anamnesa, TTV, ICD-10, Tindakan, Resep)
    D->>DB: UPDATE visits SET status_pembayaran = 'Menunggu Kasir', diagnosa, terapi, biaya
    DB-->>D: Update success
    D->>P: Resep selesai, persilakan menuju loket kasir & farmasi

    %% Tahap 3: Pelunasan & Farmasi
    P->>K: Menyerahkan nomor antrean ke kasir
    K->>DB: SELECT visits WHERE status = 'Menunggu Kasir'
    K->>K: Buka PaymentModal, verifikasi obat & hitung kembalian tunai/TF
    K->>DB: UPDATE visits SET status_pembayaran = 'Lunas', jenis_pembayaran
    DB-->>K: Update success
    K->>P: Serahkan obat & Kuitansi Pembayaran Resmi
```

---

## 3. Desain Komponen: Tabbed Clinical Workspace

Untuk mengatasi formulir yang memanjang ke bawah (>1.500px), komponen `ExaminationForm.tsx` dirombak menjadi **Tabbed Clinical Workspace** dengan tinggi kartu yang terkontrol ($\le 600\text{px}$) dan bilah tombol aksi menempel di bawah (*sticky footer*).

```text
src/components/rekam-medis/
├── ExaminationForm.tsx (Kontainer Utama Workspace Dokter)
│    ├── PatientHeader (Identitas pasien, No RM, usia, desa, keluhan loket, alergi)
│    │    └── Action Shortcuts (+TBC, +Sunat, Surat Sakit, Surat Rujukan)
│    ├── ClinicalTabNav (Tab 1: Anamnesa & TTV | Tab 2: Diagnosa & Tindakan | Tab 3: Resep & Kasir | Tab 4: Riwayat Lampau)
│    ├── TabContent:
│    │    ├── TabAnamnesaTtv (Keluhan lanjutan, Sistol/Diastol, Nadi, Suhu, BB/TB)
│    │    ├── TabDiagnosaTindakan (Quick-pick ICD-10 8 chip, Search ICD-10, Tindakan Medis, Lab)
│    │    ├── TabResepKasir (Template resep cepat, aturan pakai, rincian biaya kasir)
│    │    └── TabRiwayatLampau (Linimasa kunjungan lampau pasien terintegrasi langsung)
│    └── StickyDoctorFooter (Navigasi Sebelumnya/Lanjut, Simpan Draft, dan "Selesai Periksa & Kirim ke Kasir")
```

### Visual Layout Mockup:

```text
+---------------------------------------------------------------------------------------+
|  [Antrean #1] [UMUM]                                   Tanggal: 24/09/2026, 10:49 WIB |
|  Tn. Ahmad Fauzi (No RM: 20100005) - Laki-laki, 34 thn - Desa Cikidang                |
|  [!] PERINGATAN ALERGI OBAT: Amoxicillin                                              |
|  Keluhan Awal Loket: Demam 3 hari, batuk berdahak                                     |
|  [+ TBC]  [+ Sunat]  [Surat Sakit]  [Surat Rujukan]                                   |
+---------------------------------------------------------------------------------------+
|  [Tab 1: Anamnesa & TTV]  |  [Tab 2: Diagnosa & Tindakan]  |  [Tab 3: Resep & Kasir]  |
+---------------------------------------------------------------------------------------+
|  (Konten aktif sesuai Tab yang dipilih - tinggi terkontrol 450px - 550px)             |
|                                                                                       |
|  * Tab 1: Tekanan Darah, Nadi, Suhu, Berat/Tinggi, Anamnesa Lanjutan                  |
|  * Tab 2: 8 Chip ICD-10, Autocomplete ICD-10, Tindakan Medis (Hecting, Nebu, dll)   |
|  * Tab 3: Resep Obat Populer, Dosis/Signa, Rincian Biaya untuk Kasir                 |
|  * Tab 4: Riwayat Kunjungan Lampau Pasien (Tanpa perlu scroll ke bawah)               |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|  [< Tab Sebelumnya]   [Tab Selanjutnya >]   |   [Draft]  [ Selesai & Kirim ke Kasir ] |
+---------------------------------------------------------------------------------------+
```

---

## 4. Spesifikasi Kontrak Data & Operasi Supabase

### 4.1 Update Tipe Status di `src/types/database.ts`
```typescript
export type Visit = {
  id: string;
  nomor_antrian: string;
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
  status_pembayaran: 'Menunggu Dokter' | 'Menunggu Kasir' | 'Lunas' | 'Ditanggung BPJS';
  pasien?: Patient;
  dokter?: Doctor;
  created_at: string;
};
```

### 4.2 Aksi Selesai Dokter (`handleSubmit`)
```typescript
const isClaimingHandover = actionType === 'complete';
const targetStatus = isClaimingHandover ? 'Menunggu Kasir' : visit.status_pembayaran;

const { data, error } = await supabase
  .from('visits')
  .update({
    keluhan_anamnesa: keluhan.trim() || null,
    kode_icd10: kodeIcd10.trim().toUpperCase(),
    diagnosa_deskripsi: diagnosaDeskripsi.trim(),
    terapi_obat: terapiObat.trim() || null,
    tindakan: tindakan.trim() || null,
    keterangan_tindakan: keteranganTindakan.trim() || null,
    lab: lab.trim() || null,
    lab_hasil: labHasil.trim() || null,
    biaya_periksa: visit.jenis_pasien === 'BPJS' ? 0 : Number(biayaPeriksa || 0),
    pendapatan_lain: Number(pendapatanLain || 0),
    keterangan_pendapatan: keteranganPendapatan.trim() || null,
    status_pembayaran: targetStatus,
  })
  .eq('id', visit.id)
  .select(`*, pasien:patients(*), dokter:doctors(*)`)
  .single();
```

---

## 5. Strategi Verifikasi Kualitas

1. **Uji Validasi Form:** Mencegah klik *"Selesai Periksa & Kirim ke Kasir"* jika `kode_icd10` atau `diagnosa_deskripsi` kosong, otomatis memindahkan tab ke Tab 2 dan menyoroti field error.
2. **Uji State Mutually Exclusive:** Verifikasi bahwa jumlah total kunjungan hari ini sama dengan `countMenungguDokter + countMenungguKasir + countLunas`. Tidak ada kunjungan yang dihitung lebih dari sekali.
3. **Uji Responsivitas & Keyboard:** Tab dapat dinavigasikan menggunakan shortcut keyboard (Alt+1, Alt+2, Alt+3) atau tombol navigasi *Lanjut/Sebelumnya*.
