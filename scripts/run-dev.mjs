import { spawn } from 'node:child_process';
import path from 'node:path';

// Panggil prepare-env terlebih dahulu
await import('./prepare-env.mjs');

const cmd = process.platform === 'win32' ? 'npx' : 'npx';
const child = spawn(cmd, ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
