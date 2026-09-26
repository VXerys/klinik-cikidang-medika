/**
 * Centralized Design Tokens & Color Palettes
 * Klinik Pratama Cikidang Medika
 */

export const THEME_COLORS = {
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  bpjs: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  umum: {
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
    badge: 'bg-sky-50 text-sky-800 border-sky-200/80',
  },
  status: {
    lunas: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
  },
} as const;
