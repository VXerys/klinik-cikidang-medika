import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeRupiah(amount: number): number {
  if (!amount || isNaN(amount)) return 0;
  // Historical clinic CSV data recorded numbers in thousands (ribuan)
  if (amount > 0 && amount < 10000) {
    return amount * 1000;
  }
  return amount;
}

export function formatRupiah(amount: number): string {
  const normalized = normalizeRupiah(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(normalized);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Reports state the period they are showing, so an empty result or a printed copy is
// never ambiguous about what was searched.
export function describePeriod(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return 'Semua Periode Data';
  if (startDate && endDate && startDate === endDate) return formatDateIndo(startDate);
  if (startDate && endDate) return `${formatDateIndo(startDate)} sampai ${formatDateIndo(endDate)}`;
  if (startDate) return `Mulai ${formatDateIndo(startDate)}`;
  return `Sampai ${formatDateIndo(endDate)}`;
}
