import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const arg = (process.argv[2] || 'staging').toLowerCase();

const isProduction = arg === 'prod' || arg === 'production';
const sourceEnv = path.join(rootDir, isProduction ? '.env.production' : '.env.staging');
const targetEnv = path.join(rootDir, '.env.local');

if (fs.existsSync(sourceEnv)) {
  fs.copyFileSync(sourceEnv, targetEnv);
} else if (!fs.existsSync(targetEnv)) {
  console.warn(`[WARN] Berkas ${sourceEnv} tidak ditemukan dan .env.local belum ada.`);
}

let activeUrl = 'unknown';
try {
  if (fs.existsSync(targetEnv)) {
    const content = fs.readFileSync(targetEnv, 'utf8');
    const match = content.match(/NEXT_PUBLIC_SUPABASE_URL=(https:\/\/[^\r\n]+)/);
    if (match) activeUrl = match[1];
  }
} catch {
  // Abaikan jika tidak terbaca
}

const colorReset = '\x1b[0m';
const colorBold = '\x1b[1m';
const colorGreen = '\x1b[32m';
const colorYellow = '\x1b[33m';
const colorCyan = '\x1b[36m';

console.log('');
console.log(`${colorBold}====================================================${colorReset}`);
if (isProduction) {
  console.log(`${colorYellow}${colorBold}⚠  LINGKUNGAN AKTIF: PRODUCTION (LIVE OPERASIONAL)${colorReset}`);
} else {
  console.log(`${colorGreen}${colorBold}✔  LINGKUNGAN AKTIF: STAGING (DATABASE UJI COBA)${colorReset}`);
}
console.log(`${colorCyan}🔗 Supabase URL   : ${activeUrl}${colorReset}`);
console.log(`${colorBold}====================================================${colorReset}`);
console.log('');
