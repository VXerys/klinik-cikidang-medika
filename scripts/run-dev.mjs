import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const arg = (process.argv[2] || '').toLowerCase();

const isProduction = arg === 'prod' || arg === 'production';
const mode = isProduction ? 'production' : 'staging';
const sourceEnv = path.join(rootDir, isProduction ? '.env.production' : '.env.staging');
const targetEnv = path.join(rootDir, '.env.local');

if (fs.existsSync(sourceEnv)) {
  fs.copyFileSync(sourceEnv, targetEnv);
} else {
  console.warn(`[WARN] Berkas ${sourceEnv} tidak ditemukan. Menggunakan .env.local yang ada.`);
}

// Baca URL aktif untuk konfirmasi terminal
let activeUrl = 'unknown';
try {
  const content = fs.readFileSync(targetEnv, 'utf8');
  const match = content.match(/NEXT_PUBLIC_SUPABASE_URL=(https:\/\/[^\r\n]+)/);
  if (match) activeUrl = match[1];
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

// Eksekusi Next.js dev server
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
