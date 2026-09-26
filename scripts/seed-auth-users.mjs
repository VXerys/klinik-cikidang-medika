import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

export const SEED_ACCOUNTS = [
  {
    email: 'owner@cikidangmedika.com',
    password: process.env.SEED_DEFAULT_PASSWORD || 'CikidangMedika2026!',
    user_metadata: {
      role: 'owner',
      name: 'dr. Ovan & dr. Neneng (Pimpinan)',
      clinic: 'Klinik Pratama Cikidang Medika'
    }
  },
  {
    email: 'dokter@cikidangmedika.com',
    password: process.env.SEED_DEFAULT_PASSWORD || 'CikidangMedika2026!',
    user_metadata: {
      role: 'dokter',
      name: 'dr. Ovan / Dokter Jaga',
      clinic: 'Klinik Pratama Cikidang Medika'
    }
  },
  {
    email: 'kasir@cikidangmedika.com',
    password: process.env.SEED_DEFAULT_PASSWORD || 'CikidangMedika2026!',
    user_metadata: {
      role: 'kasir',
      name: 'Petugas Loket & Kasir',
      clinic: 'Klinik Pratama Cikidang Medika'
    }
  }
];

async function seed() {
  console.log('Seeding Supabase Auth users for Klinik Pratama Cikidang Medika...');
  for (const acc of SEED_ACCOUNTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: acc.user_metadata
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log(`Account ${acc.email} already exists, skipping.`);
      } else {
        console.error(`Error creating ${acc.email}:`, error.message);
      }
    } else {
      console.log(`Created user ${acc.email} (${acc.user_metadata.role}): ${data.user.id}`);
    }
  }
  console.log('Auth user seeding completed.');
}

seed().catch(console.error);
