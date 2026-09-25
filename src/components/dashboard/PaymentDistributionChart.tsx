'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Money,
  Bank,
  Users,
} from '@phosphor-icons/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatRupiah } from '@/lib/utils';

export interface PaymentDistributionData {
  bpjsCount: number;
  umumCount: number;
  bpjsRevenue: number;
  umumRevenue: number;
  tunaiCount: number;
  transferCount: number;
  tunaiRevenue: number;
  transferRevenue: number;
}

interface PaymentDistributionChartProps {
  data: PaymentDistributionData;
  isLoading?: boolean;
}

const COLORS_ASSURANCE = ['#059669', '#2563eb']; // Emerald for BPJS, Sapphire for UMUM
const COLORS_PAYMENT = ['#0d9488', '#6366f1']; // Teal for Tunai, Indigo for Transfer

export function PaymentDistributionChart({
  data,
  isLoading,
}: PaymentDistributionChartProps) {
  const [activeTab, setActiveTab] = useState<'assurance' | 'method'>('assurance');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalAssurancePatients = data.bpjsCount + data.umumCount;
  const bpjsPercentage =
    totalAssurancePatients > 0
      ? Math.round((data.bpjsCount / totalAssurancePatients) * 100)
      : 0;
  const umumPercentage = totalAssurancePatients > 0 ? 100 - bpjsPercentage : 0;

  const totalPaymentTransactions = data.tunaiCount + data.transferCount;
  const tunaiPercentage =
    totalPaymentTransactions > 0
      ? Math.round((data.tunaiCount / totalPaymentTransactions) * 100)
      : 0;
  const transferPercentage =
    totalPaymentTransactions > 0 ? 100 - tunaiPercentage : 0;

  const assuranceChartData = [
    {
      name: 'BPJS Kesehatan',
      value: data.bpjsCount,
      percentage: bpjsPercentage,
      revenue: data.bpjsRevenue,
    },
    {
      name: 'Pasien Umum',
      value: data.umumCount,
      percentage: umumPercentage,
      revenue: data.umumRevenue,
    },
  ];

  const paymentChartData = [
    {
      name: 'Kasir Tunai (Laci)',
      value: data.tunaiCount,
      percentage: tunaiPercentage,
      revenue: data.tunaiRevenue,
    },
    {
      name: 'Transfer Bank / QRIS',
      value: data.transferCount,
      percentage: transferPercentage,
      revenue: data.transferRevenue,
    },
  ];

  const currentChartData =
    activeTab === 'assurance' ? assuranceChartData : paymentChartData;
  const currentColors =
    activeTab === 'assurance' ? COLORS_ASSURANCE : COLORS_PAYMENT;
  const currentTotal =
    activeTab === 'assurance'
      ? totalAssurancePatients
      : totalPaymentTransactions;

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card-double space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-slate-200 rounded"></div>
          <div className="h-9 w-36 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-56 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card-double space-y-4">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
              <CreditCard weight="duotone" className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                Penjamin &amp; Pembayaran
              </h3>
              <p className="text-[11px] text-slate-600 font-medium truncate">
                Komposisi jaminan &amp; transaksi kasir
              </p>
            </div>
          </div>

          {/* Toggle Tab */}
          <div className="inline-flex items-center p-0.5 bg-slate-50/90 rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('assurance')}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all tactile-btn flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'assurance'
                  ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <ShieldCheck weight="duotone" className="w-3.5 h-3.5" />
              <span>Penjamin</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('method')}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all tactile-btn flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'method'
                  ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <Money weight="duotone" className="w-3.5 h-3.5" />
              <span>Metode Bayar</span>
            </button>
          </div>
        </div>

        {/* Donut Chart Viewport with Center Label */}
        <div className="relative h-52 sm:h-56 w-full flex items-center justify-center my-1">
          {isMounted && currentTotal > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomDonutTooltip />} />
                  <Pie
                    data={currentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {currentChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={currentColors[index % currentColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {currentTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {activeTab === 'assurance' ? 'Pasien' : 'Transaksi'}
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Belum ada data distribusi pada periode ini
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        {currentChartData.map((item, idx) => (
          <div
            key={item.name}
            className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-well flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentColors[idx % currentColors.length] }}
              />
              <span className="font-bold text-slate-800 truncate text-[11px]">{item.name}</span>
            </div>
            <div className="flex items-baseline justify-between gap-1 font-mono">
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {item.value.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                {item.percentage}%
              </span>
            </div>
            {item.revenue !== undefined && item.revenue > 0 && (
              <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-1.5 pt-1.5 border-t border-slate-200/60 truncate">
                {formatRupiah(item.revenue)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomDonutTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-2 min-w-[190px]">
        <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
          <span>{data.name}</span>
          <span className="font-mono text-[10px] text-teal-400 font-bold">{data.percentage}%</span>
        </div>
        <div className="space-y-1 font-mono">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-sans">Frekuensi:</span>
            <span className="font-bold text-white">
              {data.value.toLocaleString('id-ID')} {data.revenue !== undefined ? 'kasus' : ''}
            </span>
          </div>
          {data.revenue > 0 && (
            <div className="flex justify-between items-center text-emerald-400 pt-1.5 border-t border-slate-700/80 font-bold">
              <span className="font-sans">Akumulasi:</span>
              <span>{formatRupiah(data.revenue)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
