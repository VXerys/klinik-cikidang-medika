/**
 * Centralized Design Tokens & Color Palettes
 * Klinik Pratama Cikidang Medika
 */

export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  bpjs: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  umum: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  status: {
    lunas: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
  },
} as const;
