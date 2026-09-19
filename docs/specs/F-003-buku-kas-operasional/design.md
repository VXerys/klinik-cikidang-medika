---
id: F-003-DESIGN
feature: F-003
title: "Design: Buku Kas Operasional & Kapitasi BPJS"
status: approved
owner: "Developer"
last_updated: "2026-09-19"
last_verified_commit: unverified
related:
  - "requirements.md"
  - "tasks.md"
  - "docs/architecture/overview.md"
---

# Technical Design: F-003 Buku Kas Operasional & Kapitasi BPJS

## 1. System Architecture & Component Hierarchy

Modul Buku Kas dibangun di atas Next.js 14 App Router, berinteraksi langsung dengan Supabase PostgreSQL melalui `@supabase/supabase-js`. Seluruh elemen antarmuka mengonsumsi komponen atomik dari `src/components/ui/` dan token desain tema klinik.

```text
src/app/buku-kas/page.tsx
  ├── Header & Month/Year Selector
  ├── CashFlowSummaryCards.tsx (4 Metrik: Kas Masuk, Kas Keluar, Saldo Bersih, Setor Tunai)
  ├── CashReconciliationCard.tsx (Komparasi Penerimaan Kasir Tunai vs Setoran Bank Hari Ini)
  ├── CashFlowTable.tsx (Tabel Riwayat Mutasi + Filter Jenis & Kategori + Search)
  └── AddCashFlowModal.tsx (Modal Input Kas Masuk / Kas Keluar)
```

---

## 2. Component Design & Responsibilities

### 2.1 `CashFlowSummaryCards.tsx`
- **Tanggung Jawab**: Menghitung dan merender 4 kartu metrik keuangan sesuai periode bulan aktif:
  1. **Total Kas Masuk**: `SUM(nominal)` untuk `jenis = 'Masuk'`. Warna emerald dengan ikon `ArrowDownLeft`.
  2. **Total Kas Keluar**: `SUM(nominal)` untuk `jenis = 'Keluar'`. Warna rose dengan ikon `ArrowUpRight`.
  3. **Saldo Kas Bersih**: `Kas Masuk - Kas Keluar`. Warna blue dengan ikon `Wallet`.
  4. **Akumulasi Setor Tunai**: `SUM(nominal)` untuk `kategori = 'Setor Tunai'`. Warna indigo dengan ikon `Banknote`.
- **Format Tampilan**: Font monospace/tabular numbers, nominal berformat `formatRupiah()`.

### 2.2 `AddCashFlowModal.tsx`
- **Tanggung Jawab**: Menangani input transaksi baru baik `Masuk` maupun `Keluar`.
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `initialType: 'Masuk' | 'Keluar'`
  - `onSuccess: (newFlow: CashFlow) => void`
- **Form Fields**:
  - `tanggal`: Date picker (default: hari ini).
  - `jenis`: Radio selector (`Masuk` / `Keluar`).
  - `kategori`: Select dropdown terfilter dinamis berdasarkan `jenis` (dari `CASH_FLOW_CATEGORIES`).
  - `nominal`: Input angka dengan format Rupiah realtime (`onChange`).
  - `keterangan`: Textarea catatan peruntukan mutasi.

### 2.3 `CashFlowTable.tsx`
- **Tanggung Jawab**: Menampilkan daftar baris mutasi kas dari database.
- **Fitur**:
  - Filter Tabs: `Semua` | `Pemasukan (+)` | `Pengeluaran (-)`.
  - Filter Kategori: Dropdown penyaring kategori spesifik.
  - Search Input: Pencarian substring pada kolom `keterangan`.
  - Action: Tombol hapus baris dengan modal dialog konfirmasi.
  - Mobile Responsiveness: Tabel dibungkus dalam kontainer `overflow-x-auto` dengan visual scroll indicator.

### 2.4 `CashReconciliationCard.tsx`
- **Tanggung Jawab**: Mengkomparasikan penerimaan kasir loket hari ini (dari tabel `public.visits` dengan filter `tanggal_periksa = today AND jenis_pembayaran = 'Tunai'`) dengan mutasi keluar/masuk `Setor Tunai` hari ini.
- **Tujuan**: Memastikan uang tunai fisik yang ada di laci kasir cocok dengan yang disetorkan ke bank.

---

## 3. Data Contracts & Supabase Queries

### 3.1 Fetch Monthly Cash Flows
```typescript
const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
const nextMonth = month === 12 ? 1 : month + 1;
const nextYear = month === 12 ? year + 1 : year;
const endOfMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

const { data, error } = await supabase
  .from('cash_flows')
  .select('*')
  .gte('tanggal', startOfMonth)
  .lt('tanggal', endOfMonth)
  .order('tanggal', { ascending: false })
  .order('created_at', { ascending: false });
```

### 3.2 Insert New Cash Flow
```typescript
const { data, error } = await supabase
  .from('cash_flows')
  .insert({
    tanggal: form.tanggal,
    jenis: form.jenis,
    kategori: form.kategori,
    nominal: form.nominal,
    keterangan: form.keterangan || null,
  })
  .select()
  .single();
```

### 3.3 Delete Cash Flow Record
```typescript
const { error } = await supabase
  .from('cash_flows')
  .delete()
  .eq('id', transactionId);
```

### 3.4 Fetch Today's Cashier Cash Total (Reconciliation)
```typescript
const todayStr = new Date().toISOString().split('T')[0];
const { data, error } = await supabase
  .from('visits')
  .select('biaya_periksa, pendapatan_lain, jenis_pasien')
  .eq('tanggal_periksa', todayStr)
  .eq('jenis_pembayaran', 'Tunai')
  .eq('status_pembayaran', 'Lunas');

// Total Uang Tunai di Loket Kasir = SUM(biaya_periksa + pendapatan_lain)
```

---

## 4. Mobile & Tablet Responsiveness (UI/UX Pro Max)

- **Mobile Viewport (360px–640px)**:
  - 4 KPI cards ditampilkan dalam format grid 1-kolom atau 2-kolom ringkas.
  - Tombol aksi "+ Kas Masuk" dan "+ Kas Keluar" memiliki tinggi minimum 44px (`min-h-[44px]`).
  - Tabel mutasi dapat digeser mendatar secara mulus tanpa membuat halaman utama bergoyang (*zero body overflow*).
- **Tablet Viewport (768px–1024px)**:
  - KPI cards berformat grid 2x2.
  - Header kontrol (bulan, search, filter) berderet proporsional.

---

## 5. Security & Invariants

1. **Numeric Integrity**: Nominal wajib bertipe angka positif (> 0). Nilai desimal disimpan tepat menggunakan format `NUMERIC(15,2)`.
2. **Deletion Safeguard**: Penghapusan transaksi memerlukan konfirmasi eksplisit dari pengguna.
3. **No Unhandled Errors**: Seluruh respon Supabase `{ data, error }` diverifikasi dan kegagalan ditampilkan dalam bahasa Indonesia yang santun.
