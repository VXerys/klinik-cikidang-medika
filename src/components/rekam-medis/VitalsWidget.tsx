'use client';

import React, { useState, useMemo } from 'react';
import {
  Heartbeat,
  Lightning,
  Copy,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface VitalsWidgetProps {
  sistol: string;
  setSistol: (val: string) => void;
  diastol: string;
  setDiastol: (val: string) => void;
  nadi: string;
  setNadi: (val: string) => void;
  suhu: string;
  setSuhu: (val: string) => void;
  pernapasan: string;
  setPernapasan: (val: string) => void;
  beratBadan: string;
  setBeratBadan: (val: string) => void;
  tinggiBadan: string;
  setTinggiBadan: (val: string) => void;
  onAppendToAnamnesis: (vitalsSummary: string) => void;
  className?: string;
}

export function VitalsWidget({
  sistol,
  setSistol,
  diastol,
  setDiastol,
  nadi,
  setNadi,
  suhu,
  setSuhu,
  pernapasan,
  setPernapasan,
  beratBadan,
  setBeratBadan,
  tinggiBadan,
  setTinggiBadan,
  onAppendToAnamnesis,
  className,
}: VitalsWidgetProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // 1-Click Normal Adult Preset
  const handleFillNormalAdult = () => {
    setSistol('120');
    setDiastol('80');
    setNadi('78');
    setSuhu('36.5');
    setPernapasan('20');

    // Trigger visual pulse glow feedback
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 650);

    toast.success('Tanda vital normal dewasa terisi otomatis.');
  };

  // Real-time Blood Pressure Classification
  const bpStatus = useMemo(() => {
    const s = parseInt(sistol, 10);
    const d = parseInt(diastol, 10);
    if (isNaN(s) || isNaN(d)) return null;

    if (s < 120 && d < 80) {
      return { label: 'Tensi Normal (Optimal)', colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if ((s >= 120 && s <= 139) || (d >= 80 && d <= 89)) {
      return { label: 'Pre-Hipertensi', colorClass: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (s >= 140 || d >= 90) {
      return { label: 'Hipertensi', colorClass: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    return null;
  }, [sistol, diastol]);

  // Real-time BMI Calculation
  const bmiInfo = useMemo(() => {
    const bb = parseFloat(beratBadan);
    const tb = parseFloat(tinggiBadan);
    if (!bb || !tb || tb <= 0) return null;

    const tbM = tb / 100;
    const val = bb / (tbM * tbM);
    const formatted = val.toFixed(1);

    if (val < 18.5) return { val: formatted, label: 'Kurus', color: 'text-amber-700' };
    if (val <= 24.9) return { val: formatted, label: 'Ideal', color: 'text-emerald-700' };
    if (val <= 29.9) return { val: formatted, label: 'Berlebih', color: 'text-orange-700' };
    return { val: formatted, label: 'Obesitas', color: 'text-rose-700' };
  }, [beratBadan, tinggiBadan]);

  // Copy to Anamnesis Notes
  const handleCopySummary = () => {
    const parts: string[] = [];

    if (sistol.trim() && diastol.trim()) {
      parts.push(`TD: ${sistol.trim()}/${diastol.trim()} mmHg${bpStatus ? ` (${bpStatus.label})` : ''}`);
    } else if (sistol.trim()) {
      parts.push(`Sistol: ${sistol.trim()} mmHg`);
    }

    if (nadi.trim()) parts.push(`N: ${nadi.trim()} x/mnt`);
    if (suhu.trim()) parts.push(`S: ${suhu.trim()} °C`);
    if (pernapasan.trim()) parts.push(`RR: ${pernapasan.trim()} x/mnt`);
    if (beratBadan.trim()) parts.push(`BB: ${beratBadan.trim()} kg`);
    if (tinggiBadan.trim()) parts.push(`TB: ${tinggiBadan.trim()} cm`);
    if (bmiInfo) parts.push(`BMI: ${bmiInfo.val} (${bmiInfo.label})`);

    if (parts.length === 0) {
      toast.error('Isi minimal salah satu data tanda vital terlebih dahulu.');
      return;
    }

    const ttvString = `[TTV: ${parts.join(', ')}]`;
    onAppendToAnamnesis(ttvString);
    toast.success('Ringkasan TTV berhasil disalin ke catatan anamnesa.');
  };

  return (
    <div className={cn('bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card-double space-y-4', className)}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shrink-0">
            <Heartbeat className="w-4 h-4" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              1. Tanda-Tanda Vital &amp; Antropometri
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Pengukuran tekanan darah, denyut nadi, suhu, pernapasan, dan indeks massa tubuh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Preset Normal Adult Button */}
          <button
            type="button"
            onClick={handleFillNormalAdult}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition-all tactile-btn shadow-2xs"
            title="Isi otomatis nilai tanda vital fisiologis normal dewasa"
          >
            <Lightning className="w-3.5 h-3.5 text-teal-600" weight="fill" />
            <span>Isi Normal Dewasa (1-Klik)</span>
          </button>

          {/* Copy to Anamnesis Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all tactile-btn shadow-btn-secondary"
            title="Salin hasil TTV ke textarea keluhan anamnesa"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" weight="bold" />
            <span>Salin ke Anamnesa</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Wells Grid (TD, Nadi, Suhu, Nafas) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tekanan Darah Well */}
        <div
          className={cn(
            'bg-slate-50/80 border border-slate-300 rounded-xl p-3 shadow-well focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all',
            isPulsing && 'pulse-glow border-teal-500 ring-2 ring-teal-500/30'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-semibold">
            <span>Tekanan Darah</span>
            <span className="font-mono text-[10px] text-slate-400">mmHg</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="120"
              value={sistol}
              onChange={(e) => setSistol(e.target.value)}
              className="w-14 bg-transparent font-mono text-base sm:text-lg font-bold text-slate-900 focus:outline-none"
              aria-label="Sistol"
            />
            <span className="text-slate-400 font-bold text-base">/</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="80"
              value={diastol}
              onChange={(e) => setDiastol(e.target.value)}
              className="w-14 bg-transparent font-mono text-base sm:text-lg font-bold text-slate-900 focus:outline-none"
              aria-label="Diastol"
            />
          </div>
          {bpStatus && (
            <div className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block border', bpStatus.colorClass)}>
              {bpStatus.label}
            </div>
          )}
        </div>

        {/* Denyut Nadi Well */}
        <div
          className={cn(
            'bg-slate-50/80 border border-slate-300 rounded-xl p-3 shadow-well focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all',
            isPulsing && 'pulse-glow border-teal-500 ring-2 ring-teal-500/30'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-semibold">
            <span>Denyut Nadi</span>
            <span className="font-mono text-[10px] text-slate-400">bpm</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="78"
            value={nadi}
            onChange={(e) => setNadi(e.target.value)}
            className="w-full bg-transparent font-mono text-base sm:text-lg font-bold text-slate-900 focus:outline-none"
            aria-label="Denyut Nadi"
          />
          <span className="text-[10px] text-slate-400 font-medium">Acuan: 60-100 bpm</span>
        </div>

        {/* Suhu Tubuh Well */}
        <div
          className={cn(
            'bg-slate-50/80 border border-slate-300 rounded-xl p-3 shadow-well focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all',
            isPulsing && 'pulse-glow border-teal-500 ring-2 ring-teal-500/30'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-semibold">
            <span>Suhu Tubuh</span>
            <span className="font-mono text-[10px] text-slate-400">°C</span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="36.5"
            value={suhu}
            onChange={(e) => setSuhu(e.target.value)}
            className="w-full bg-transparent font-mono text-base sm:text-lg font-bold text-slate-900 focus:outline-none"
            aria-label="Suhu Tubuh"
          />
          <span className="text-[10px] text-slate-400 font-medium">Acuan: 36.1-37.2 °C</span>
        </div>

        {/* Laju Nafas Well */}
        <div
          className={cn(
            'bg-slate-50/80 border border-slate-300 rounded-xl p-3 shadow-well focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all',
            isPulsing && 'pulse-glow border-teal-500 ring-2 ring-teal-500/30'
          )}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-semibold">
            <span>Laju Nafas</span>
            <span className="font-mono text-[10px] text-slate-400">x/mnt</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="20"
            value={pernapasan}
            onChange={(e) => setPernapasan(e.target.value)}
            className="w-full bg-transparent font-mono text-base sm:text-lg font-bold text-slate-900 focus:outline-none"
            aria-label="Laju Nafas"
          />
          <span className="text-[10px] text-slate-400 font-medium">Acuan: 16-20 x/mnt</span>
        </div>
      </div>

      {/* Secondary Antropometry Well (BB, TB, BMI) */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Berat Badan:</span>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
              <input
                type="text"
                inputMode="decimal"
                placeholder="60"
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                className="w-12 text-xs font-mono font-bold text-slate-900 outline-none bg-transparent"
                aria-label="Berat Badan"
              />
              <span className="text-[10px] text-slate-400 font-mono">kg</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Tinggi Badan:</span>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
              <input
                type="text"
                inputMode="decimal"
                placeholder="165"
                value={tinggiBadan}
                onChange={(e) => setTinggiBadan(e.target.value)}
                className="w-12 text-xs font-mono font-bold text-slate-900 outline-none bg-transparent"
                aria-label="Tinggi Badan"
              />
              <span className="text-[10px] text-slate-400 font-mono">cm</span>
            </div>
          </div>
        </div>

        {bmiInfo && (
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <span className="text-slate-500 font-medium">BMI:</span>
            <span className="font-mono font-bold text-slate-900">{bmiInfo.val}</span>
            <span className={cn('font-bold font-mono text-[11px]', bmiInfo.color)}>
              ({bmiInfo.label})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VitalsWidget;
