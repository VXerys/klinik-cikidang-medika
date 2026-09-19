---
id: F-002-DESIGN
feature: F-002
title: "Technical Design: Rekam Medis Ringkas Dokter"
status: approved
owner: "Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "tasks.md"
  - "docs/architecture/overview.md"
---

# Technical Design: F-002 Rekam Medis Ringkas Dokter

## 1. Component Architecture & System Shape

Antarmuka dokter dibangun menggunakan pola **2-Kolom Terpadu (Master-Detail Layout)**:
- **Kolom Kiri (Master Queue)**: Menampilkan antrean pasien hari ini secara real-time dengan indikator visual antrean (Nomor antrian, Nama, Kategori BPJS/Umum, Status: Menunggu / Selesai).
- **Kolom Kanan (Detail Workspace)**: Menampilkan data pasien yang sedang diperiksa, form input diagnosa ICD-10 cepat, resep obat, tindakan medis, serta linimasa riwayat medis lampau pasien (*patient history timeline*).

```text
src/app/rekam-medis/page.tsx
├── QueueList (Daftar antrean hari ini + filter status)
│    └── Reusable Badge & Card primitives
├── ExaminationForm (Panel ruang periksa dokter)
│    ├── PatientHeader (Identitas pasien, No RM, usia, desa, keluhan loket)
│    ├── Icd10QuickPicker (8 Chip diagnosa teratas + input kode/deskripsi)
│    ├── VitalSignsFields (TD, Suhu, BB - opsional)
│    ├── PrescriptionField (Terapi obat / resep dokter)
│    ├── ProcedureFields (Tindakan & Catatan Lab)
│    └── ActionButtons (Simpan Pemeriksaan & Selesai)
└── PatientHistoryTimeline (Accordion riwayat kunjungan lampau pasien)
     └── Riwayat kunjungan dari 7.493 data historis
```

---

## 2. Reusable UI & Constant Integration

Sesuai aturan arsitektur di `AGENTS.md` dan struktur best practice proyek:
- Menggunakan komponen atomik dari `@/components/ui`: `Button`, `Badge`, `Card`, `CardHeader`, `CardTitle`, `Input`, `Select`, `Modal`.
- Menggunakan konstanta dari `@/constants/clinic`: `CLINIC_PROFILE`, `DEFAULT_TARIFFS`.
- Menggunakan daftar diagnosa ICD-10 teratas klinik:
  ```typescript
  export const POPULAR_ICD10 = [
    { code: 'J00', name: 'ISPA / Nasopharyngitis Akut' },
    { code: 'K30', name: 'Dispepsia / Sakit Lambung' },
    { code: 'Z34', name: 'Pemeriksaan Kehamilan Normal (ANC)' },
    { code: 'L23', name: 'Dermatitis Kontak Alergi' },
    { code: 'R50', name: 'Demam / Observasi Febris' },
    { code: 'E11', name: 'Diabetes Mellitus (DM)' },
    { code: 'A09', name: 'Gastroenteritis / Diare Akut' },
    { code: 'Z00', name: 'Pemeriksaan Kesehatan Umum' },
  ] as const;
  ```

---

## 3. Data Flow & Supabase Operations

### 3.1 Fetch Today's Queue (Kolom Kiri)
```typescript
const todayStr = new Date().toISOString().split('T')[0];
const { data: queue, error } = await supabase
  .from('visits')
  .select(`
    id, nomor_antrian, tanggal_periksa, jam_periksa, keluhan_anamnesa,
    kode_icd10, diagnosa_deskripsi, terapi_obat, tindakan, lab, lab_hasil,
    jenis_pasien, biaya_periksa, status_pembayaran, created_at,
    pasien:patients(*),
    dokter:doctors(*)
  `)
  .eq('tanggal_periksa', todayStr)
  .order('nomor_antrian', { ascending: true });
```

### 3.2 Fetch Patient Past Visits (Linimasa Riwayat)
```typescript
const { data: history, error } = await supabase
  .from('visits')
  .select(`
    id, tanggal_periksa, jam_periksa, keluhan_anamnesa,
    kode_icd10, diagnosa_deskripsi, terapi_obat, tindakan,
    dokter:doctors(nama)
  `)
  .eq('pasien_id', activeVisit.pasien_id)
  .neq('id', activeVisit.id)
  .order('tanggal_periksa', { ascending: false })
  .limit(10);
```

### 3.3 Save Examination Record (Update Visit)
```typescript
const { data, error } = await supabase
  .from('visits')
  .update({
    keluhan_anamnesa: formValues.keluhan,
    kode_icd10: formValues.kodeIcd10,
    diagnosa_deskripsi: formValues.diagnosaDeskripsi,
    terapi_obat: formValues.terapiObat,
    tindakan: formValues.tindakan || null,
    keterangan_tindakan: formValues.keteranganTindakan || null,
    lab: formValues.lab || null,
    lab_hasil: formValues.labHasil || null,
  })
  .eq('id', activeVisit.id)
  .select()
  .single();
```

---

## 4. State Management

- `selectedVisitId: string | null`: Menyimpan ID kunjungan yang sedang aktif diperiksa di ruang dokter.
- `queueList: Visit[]`: Array seluruh pasien yang terdaftar di hari ini.
- `historyList: Visit[]`: Riwayat masa lalu pasien yang sedang aktif.
- `filterStatus: 'all' | 'waiting' | 'done'`: Filter cepat pada sidebar antrean (Menunggu vs Selesai).
- `isSaving: boolean`: Status tombol simpan untuk mencegah double-submit.

---

## 5. Error & Edge Cases Handling

1. **Belum Ada Antrean Hari Ini**: Sidebar kiri menampilkan pesan informatif bahwa belum ada pendaftaran dari loket kasir, disertai tombol refresh data.
2. **Pasien Belum Dipilih**: Kolom kanan menampilkan *placeholder visual* ramah ("Pilih pasien di daftar antrean untuk memulai pemeriksaan").
3. **Kunjungan Pertama Pasien Baru**: Riwayat lampau menampilkan badge *"Ini adalah kunjungan pertama pasien di Klinik Cikidang Medika"*.
4. **Offline / Network Error**: Muncul alert merah ramah dalam bahasa Indonesia tanpa merusak form yang sedang diisi oleh dokter.
