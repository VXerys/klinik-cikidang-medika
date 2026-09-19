'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Banknote, Loader2 } from 'lucide-react';
import { formatRupiah, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export interface CashFlowSummaryCardsProps {
  totalMasuk: number;
  totalKeluar: number;
  saldoBersih: number;
  totalSetorTunai: number;
  monthName?: string;
  isLoading?: boolean;
  className?: string;
}

export function CashFlowSummaryCards({
  totalMasuk,
  totalKeluar,
  saldoBersih,
  totalSetorTunai,
  monthName = 'Bulan Ini',
  isLoading = false,
  className,
}: CashFlowSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Pemasukan',
      subtitle: `Kapitasi & Pendapatan (${monthName})`,
      amount: totalMasuk,
      icon: ArrowDownLeft,
      color: 'emerald',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Pengeluaran',
      subtitle: `Obat & Operasional (${monthName})`,
      amount: totalKeluar,
      icon: ArrowUpRight,
      color: 'rose',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-600',
    },
    {
      title: 'Saldo Kas Bersih',
      subtitle: `Pemasukan - Pengeluaran`,
      amount: saldoBersih,
      icon: Wallet,
      color: 'blue',
      textColor: saldoBersih >= 0 ? 'text-blue-700' : 'text-rose-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Setor Tunai ke Bank',
      subtitle: `Rekap Setor Kasir (${monthName})`,
      amount: totalSetorTunai,
      icon: Banknote,
      color: 'indigo',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {item.subtitle}
                </span>
              </div>
              <div className={cn('p-2.5 rounded-xl border shrink-0', item.bgColor, item.borderColor, item.iconColor)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-1">
              {isLoading ? (
                <div className="flex items-center gap-2 text-slate-400 py-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Menghitung...</span>
                </div>
              ) : (
                <div className={cn('text-xl sm:text-2xl font-bold font-mono tracking-tight', item.textColor)}>
                  {formatRupiah(item.amount)}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default CashFlowSummaryCards;
