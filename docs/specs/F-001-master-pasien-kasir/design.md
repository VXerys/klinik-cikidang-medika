---
id: F-001-DESIGN
feature: F-001
status: approved
owner: Developer
last_updated: 2026-09-19
last_verified_commit: initial-design
related:
  - "requirements.md"
  - "../../architecture/overview.md"
  - "../../architecture/data-model.md"
---

# Technical Design: F-001 Master Pasien & Loket Kasir

## 1. Design Summary

This specification designs the client and data access architecture for the Master Pasien & Loket Kasir module. Built with Next.js 14 App Router (React Client Component) and Supabase Client SDK, the design provides an intuitive front-desk workstation workflow:
1. Live debounced search querying indexed PostgreSQL columns (`idx_patients_nama`, `idx_patients_no_rm`).
2. Two-step registration workflow: Select/Create Patient -> Register Visit & Collect Payment -> Print Receipt.
3. Real-time daily queue table displaying all visits registered on the current calendar date.

---

## 2. Component Inventory

| Component | Path | Responsibility |
|---|---|---|
| **PendaftaranKasirPage** | `src/app/pendaftaran/page.tsx` | Main container page, orchestrates today's visits query, search state, and modal visibility. |
| **PatientSearchAutocomplete** | `src/components/pendaftaran/PatientSearchAutocomplete.tsx` | Search bar with 250ms debounce, loading spinner, and dropdown suggestion list from 4,238 records. |
| **NewPatientModal** | `src/components/pendaftaran/NewPatientModal.tsx` | Modal form to register a new patient, with automatic sequential No RM preview and validation. |
| **RegisterVisitModal** | `src/components/pendaftaran/RegisterVisitModal.tsx` | Modal form to create a visit for the selected patient, configure doctor, BPJS vs Umum billing, and payment method. |
| **ReceiptModal** | `src/components/pendaftaran/ReceiptModal.tsx` | Official printable cashier receipt with print-optimized CSS styles. |

---

## 3. Data Flow Architecture

```text
[Kasir Keyboard Input]
       │ (Debounce 250ms)
       ▼
[PatientSearchAutocomplete] ──(Query)──► [Supabase PostgreSQL: public.patients]
       │                                     (Indexed ILIKE on nama, no_rm, desa)
       ▼ (Patient Selected)
[RegisterVisitModal]
       │
       ├──► Jenis Pasien = BPJS ──► Biaya = Rp 0 (Fixed)
       └──► Jenis Pasien = UMUM ──► Biaya = Rp 150.000 (Editable)
       │
       ▼ (Confirm & Submit)
[Supabase Client SDK: insert visits]
       │
       ├──► Insert row into public.visits
       └──► (Optional Cash Flow insert if cash collected)
       ▼
[Refresh Today's Queue List & Open ReceiptModal]
```

---

## 4. Database Query Contracts

### 4.1 Autocomplete Search Query
```typescript
const { data, error } = await supabase
  .from('patients')
  .select('id, no_rm, gelar, nama, jenis_kelamin, tanggal_lahir, usia, desa, alamat, no_ktp, no_bpjs')
  .or(`nama.ilike.%${cleanQuery}%,no_rm.ilike.%${cleanQuery}%,desa.ilike.%${cleanQuery}%`)
  .order('nama', { ascending: true })
  .limit(10);
```

### 4.2 Auto-generate Next No RM
The next No RM is computed by querying the highest sequential number or generating a formatted string `RM-YYYYMM-XXXX`:
```typescript
const { data } = await supabase
  .from('patients')
  .select('no_rm')
  .order('created_at', { ascending: false })
  .limit(1);
```

### 4.3 Create New Patient
```typescript
const { data: newPatient, error } = await supabase
  .from('patients')
  .insert({
    no_rm: values.no_rm,
    gelar: values.gelar,
    nama: values.nama,
    jenis_kelamin: values.jenis_kelamin,
    tanggal_lahir: values.tanggal_lahir,
    usia: values.usia,
    desa: values.desa,
    alamat: values.alamat,
    no_ktp: values.no_ktp,
    no_bpjs: values.no_bpjs
  })
  .select()
  .single();
```

### 4.4 Register Visit
```typescript
const todayStr = new Date().toISOString().split('T')[0];
const { data: todayCount } = await supabase
  .from('visits')
  .select('*', { count: 'exact', head: true })
  .eq('tanggal_periksa', todayStr);

const nextAntrian = (todayCount || 0) + 1;

const { data: visit, error } = await supabase
  .from('visits')
  .insert({
    nomor_antrian: String(nextAntrian),
    pasien_id: selectedPatient.id,
    dokter_id: values.dokter_id,
    tanggal_periksa: todayStr,
    jam_periksa: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    bulan: new Date().toLocaleString('id-ID', { month: 'long' }),
    keluhan_anamnesa: values.keluhan,
    jenis_pasien: values.jenis_pasien, // 'BPJS' | 'UMUM'
    biaya_periksa: values.jenis_pasien === 'BPJS' ? 0 : values.biaya_periksa,
    pendapatan_lain: values.pendapatan_lain || 0,
    keterangan_pendapatan: values.keterangan_pendapatan || null,
    jenis_pembayaran: values.jenis_pembayaran, // 'Tunai' | 'TF'
    status_pembayaran: 'Lunas'
  })
  .select('*, pasien:patients(*), dokter:doctors(*)')
  .single();
```

### 4.5 Fetch Today's Queue
```typescript
const todayStr = new Date().toISOString().split('T')[0];
const { data: visits, error } = await supabase
  .from('visits')
  .select(`
    id, nomor_antrian, tanggal_periksa, jam_periksa, jenis_pasien, biaya_periksa, 
    pendapatan_lain, jenis_pembayaran, status_pembayaran, keluhan_anamnesa,
    pasien:patients (id, no_rm, gelar, nama, desa, no_bpjs),
    dokter:doctors (id, nama)
  `)
  .eq('tanggal_periksa', todayStr)
  .order('created_at', { ascending: false });
```

---

## 5. UI State Management & Error Handling

1. **Search Debouncing:** Use standard 250ms timeout timer to avoid flooding the database during rapid keystrokes.
2. **Optimistic Queue Refresh:** After visit registration, prepend the newly created visit row to the local state while revalidating from Supabase.
3. **Receipt Modal:** Uses Tailwind `@media print` classes to isolate the receipt container and suppress screen layout elements (Sidebar, Navbar, buttons).

---

## 6. Architecture Compliance

- **No direct PG driver:** All database calls utilize `@supabase/ssr` / `@supabase/supabase-js`.
- **Indonesian formatting:** Currency displayed with `Rp` prefix and standard Indonesian digit grouping (`Intl.NumberFormat('id-ID')`).
