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

const COLORS_ASSURANCE = ['#2563eb', '#0d9488']; // Blue for BPJS, Teal for UMUM
const COLORS_PAYMENT = ['#059669', '#7c3aed']; // Emerald for Tunai, Violet for Transfer

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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-slate-200 rounded"></div>
          <div className="h-9 w-36 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-56 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <CreditCard weight="duotone" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Distribusi Penjamin &amp; Pembayaran
              </h3>
              <p className="text-[11px] text-slate-500">
                Komposisi pembiayaan pasien dan metode transaksi kasir
              </p>
            </div>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('assurance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[44px] flex items-center gap-1.5 ${
                activeTab === 'assurance'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck weight="duotone" className="w-4 h-4" />
              <span>Penjamin</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('method')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[44px] flex items-center gap-1.5 ${
                activeTab === 'method'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Money weight="duotone" className="w-4 h-4" />
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
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
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

              {/* Center Metrik */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 font-medium">Total</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {currentTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-500">
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
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentColors[idx % currentColors.length] }}
              />
              <span className="font-semibold text-slate-700 truncate text-[11px]">
                {item.name}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-slate-900 text-sm">
                {item.value.toLocaleString('id-ID')}
              </span>
              <span
                className="font-bold text-[11px] px-1.5 py-0.5 rounded"
                style={{
                  color: currentColors[idx % currentColors.length],
                  backgroundColor: `${currentColors[idx % currentColors.length]}15`,
                }}
              >
                {item.percentage}%
              </span>
            </div>
            {item.revenue > 0 && (
              <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
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
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
          {data.name}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Jumlah:</span>
          <span className="font-mono font-bold text-white">
            {data.value.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between items-center text-blue-400">
          <span>Persentase:</span>
          <span className="font-mono font-bold">{data.percentage}%</span>
        </div>
        {data.revenue > 0 && (
          <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-slate-800">
            <span>Nominal:</span>
            <span className="font-mono font-bold">{formatRupiah(data.revenue)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}
