'use client';

import React from 'react';
import {
  Bank,
  CheckCircle,
  Warning,
  PlusCircle,
  Coins,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, cn } from '@/lib/utils';

export interface CashReconciliationCardProps {
  todayCashVisitsTotal: number;
  todayCashVisitsCount: number;
  todayCashDepositsTotal: number;
  onOpenSetorTunai?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CashReconciliationCard({
  todayCashVisitsTotal,
  todayCashVisitsCount,
  todayCashDepositsTotal,
  onOpenSetorTunai,
  className,
}: CashReconciliationCardProps) {
  const selisih = todayCashVisitsTotal - todayCashDepositsTotal;
  const isBalanced = todayCashVisitsTotal > 0 && selisih === 0;
  const hasRemainingCash = selisih > 0;

  return (
    <Card
      className={cn(
        'p-4 sm:p-5 border-blue-200 bg-linear-to-r from-blue-50/50 via-white to-indigo-50/30 space-y-4',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shadow-blue-600/30">
            <Bank weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Rekonsiliasi Kasir & Setoran Tunai Hari Ini</span>
              {isBalanced ? (
                <Badge variant="success" size="sm">
                  Seimbang (Lunas Disetor)
                </Badge>
              ) : hasRemainingCash ? (
                <Badge variant="warning" size="sm">
                  Ada Uang di Kasir
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  Belum Ada Transaksi
                </Badge>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mencocokkan penerimaan uang tunai loket kasir dengan catatan setoran bank harian
            </p>
          </div>
        </div>

        {onOpenSetorTunai && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSetorTunai}
            className="text-xs font-semibold self-start sm:self-auto border-blue-300 text-blue-700 hover:bg-blue-50 min-h-[44px]"
            leftIcon={<PlusCircle weight="duotone" className="w-4 h-4" />}
          >
            Catat Setor Tunai
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Uang Tunai di Loket Kasir</span>
            <span className="font-mono font-bold text-slate-700">
              {todayCashVisitsCount} Pasien
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {formatRupiah(todayCashVisitsTotal)}
          </div>
          <p className="text-[10px] text-slate-400">
            Total biaya periksa tunai hari ini
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Tercatat Disetor ke Bank</span>
            <span className="text-emerald-600 font-bold text-[10px]">Buku Kas</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {formatRupiah(todayCashDepositsTotal)}
          </div>
          <p className="text-[10px] text-slate-400">
            Mutasi masuk kategori Setor Tunai
          </p>
        </div>

        <div
          className={cn(
            'p-3.5 rounded-xl border space-y-1',
            isBalanced
              ? 'bg-emerald-50/60 border-emerald-200'
              : hasRemainingCash
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-slate-50 border-slate-200'
          )}
        >
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span
              className={
                isBalanced
                  ? 'text-emerald-800'
                  : hasRemainingCash
                  ? 'text-amber-800'
                  : 'text-slate-600'
              }
            >
              {isBalanced
                ? 'Status Kasir'
                : hasRemainingCash
                ? 'Sisa Fisik di Laci'
                : 'Selisih Kas'}
            </span>
            {isBalanced ? (
              <CheckCircle weight="duotone" className="w-4 h-4 text-emerald-600" />
            ) : hasRemainingCash ? (
              <Warning weight="duotone" className="w-4 h-4 text-amber-600" />
            ) : (
              <Coins weight="duotone" className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <div
            className={cn(
              'text-lg font-bold font-mono',
              isBalanced
                ? 'text-emerald-700'
                : hasRemainingCash
                ? 'text-amber-800'
                : 'text-slate-700'
            )}
          >
            {isBalanced ? 'Rp 0 (Selesai)' : formatRupiah(selisih)}
          </div>

          <p className="text-[10px] text-slate-500">
            {isBalanced
              ? 'Seluruh kasir tunai hari ini telah disetor rapi'
              : hasRemainingCash
              ? 'Uang fisik dipegang kasir yang belum disetor ke bank'
              : 'Tidak ada selisih kas yang belum disetor'}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default CashReconciliationCard;
