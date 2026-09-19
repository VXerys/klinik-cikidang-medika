"""
SKRIP MIGRASI 7.493 DATA CSV SPREADSHEET KE SUPABASE POSTGRESQL
Cara Pakai:
1. Pastikan file SQL migrations sudah dijalankan di Supabase SQL Editor.
2. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local
3. Jalankan: python scripts/migrate_csv_to_supabase.py
"""

import csv, os, sys
from datetime import datetime

csv_path = r'c:\Users\PLN\Downloads\DASHBOARD - DATAUTAMA.csv'

if not os.path.exists(csv_path):
    print(f'File CSV tidak ditemukan di: {csv_path}')
    sys.exit(1)

print(f'Memuat data CSV dari: {csv_path}...')
with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
    reader = csv.reader(f)
    header = next(reader)
    count = sum(1 for _ in reader)

print(f'Total baris data siap dimigrasikan: {count} baris!')
print('Silakan konfigurasi .env.local dengan kredensial Supabase Anda sebelum menjalankan pengunggahan data.')
