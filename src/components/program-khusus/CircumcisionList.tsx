'use client';

import React, { useState, useEffect } from 'react';
import {
  Scissors,
  CalendarBlank,
  Eye,
  X,
  CheckCircle,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowClockwise,
  DownloadSimple,
  ShieldCheck,
  CircleNotch,
  Image as ImageIcon,
  User,
} from '@phosphor-icons/react';
import type { Circumcision } from '@/types/database';
import { formatRupiah } from '@/lib/utils';
import { getSignedMedicalPhotoUrl } from '@/lib/storage';

interface CircumcisionListProps {
  records: Circumcision[];
  onRefresh: () => void;
  isLoading?: boolean;
}

interface PhotoLightboxState {
  url: string;
  title: string;
  patientName: string;
  noRm: string;
  tanggal: string;
  metode: string;
}

function ThumbnailItem({
  path,
  provider,
  label,
  onOpen,
}: {
  path: string;
  provider: 'supabase' | 'cloudinary';
  label: string;
  onOpen: (url: string) => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadUrl() {
      try {
        setLoading(true);
        setError(false);
        const url = await getSignedMedicalPhotoUrl(path, provider);
        if (isMounted) setSignedUrl(url);
      } catch (err) {
        console.error('Error fetching signed thumbnail URL:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUrl();
    return () => {
      isMounted = false;
    };
  }, [path, provider]);

  if (loading) {
    return (
      <div className="w-24 h-20 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400">
        <CircleNotch weight="bold" className="w-4 h-4 animate-spin text-blue-600" />
        <span>Memuat...</span>
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="w-24 h-20 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center p-1 text-center text-[10px] text-rose-600">
        <ImageIcon weight="duotone" className="w-4 h-4 mb-0.5" />
        <span>Gagal muat</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(signedUrl)}
      className="group relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 transition hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none min-h-[44px]"
      title={`Klik untuk memperbesar ${label}`}
    >
      <img
        src={signedUrl}
        alt={label}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
      />
      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
        <Eye weight="duotone" className="w-5 h-5 drop-shadow-sm" />
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/75 py-0.5 px-1 text-[9px] font-semibold text-white text-center truncate">
        {label}
      </div>
    </button>
  );
}

export function CircumcisionList({ records, onRefresh, isLoading }: CircumcisionListProps) {
  const [lightbox, setLightbox] = useState<PhotoLightboxState | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const handleOpenPhoto = (
    url: string,
    title: string,
    record: Circumcision
  ) => {
    setZoomLevel(100);
    setLightbox({
      url,
      title,
      patientName: record.pasien?.nama || 'Pasien',
      noRm: record.pasien?.no_rm || '-',
      tanggal: new Date(record.tanggal_tindakan).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      metode: record.metode || 'Sirkumsisi',
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mx-auto mb-2.5">
          <Scissors weight="duotone" className="w-7 h-7" />
        </div>
        <p className="text-xs font-bold text-slate-800">Belum ada riwayat tindakan sirkumsisi</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Klik tombol &quot;+ Catat Sirkumsisi&quot; untuk mendokumentasikan pasien baru dan foto luka WebP.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Kartu */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Scissors weight="duotone" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.pasien?.nama || 'Pasien'}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      RM: <span className="font-mono">{item.pasien?.no_rm}</span> • Desa {item.pasien?.desa} • Usia {item.pasien?.usia || '-'} thn
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  {formatRupiah(item.biaya || 0)}
                </span>
              </div>

              {/* Rincian Tindakan */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Tanggal Tindakan</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-blue-600" />
                    {new Date(item.tanggal_tindakan).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Metode Operasi</span>
                  <span className="font-semibold text-blue-700 block truncate mt-0.5">
                    {item.metode}
                  </span>
                </div>
              </div>

              {/* Evaluasi Kondisi Luka */}
              {item.kondisi_luka && (
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                  <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Evaluasi Kondisi Luka
                  </span>
                  <p className="line-clamp-2">{item.kondisi_luka}</p>
                </div>
              )}

              {/* Catatan / Terapi */}
              {item.catatan && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                  Catatan: {item.catatan}
                </p>
              )}
            </div>

            {/* Bagian Thumbnail Foto Medis */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.foto_1_url && (
                  <ThumbnailItem
                    path={item.foto_1_url}
                    provider={item.storage_provider || 'supabase'}
                    label="Paska Tindakan"
                    onOpen={(url) =>
                      handleOpenPhoto(url, 'Foto 1: Paska Tindakan Langsung', item)
                    }
                  />
                )}
                {item.foto_2_url && (
                  <ThumbnailItem
                    path={item.foto_2_url}
                    provider={item.storage_provider || 'supabase'}
                    label="Evaluasi Kontrol"
                    onOpen={(url) =>
                      handleOpenPhoto(url, 'Foto 2: Evaluasi Luka Kontrol', item)
                    }
                  />
                )}
                {!item.foto_1_url && !item.foto_2_url && (
                  <span className="text-[11px] text-slate-400 italic py-1">
                    Tidak ada foto medis dilampirkan
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Operator Medis:</span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {item.dokter?.nama || 'dr. Ovan'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HD Lightbox Zoom Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-slate-900 text-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase font-bold border border-blue-500/30">
                    Rekam Medis Privat
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 truncate">{lightbox.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pasien: <strong className="text-slate-200">{lightbox.patientName}</strong> (RM: {lightbox.noRm}) • Tanggal: {lightbox.tanggal} • {lightbox.metode}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Perkecil"
                  title="Perkecil (-25%)"
                >
                  <MagnifyingGlassMinus weight="duotone" className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono text-slate-300 px-1 min-w-[48px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 250}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Perbesar"
                  title="Perbesar (+25%)"
                >
                  <MagnifyingGlassPlus weight="duotone" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Reset zoom"
                  title="Reset Zoom (100%)"
                >
                  <ArrowClockwise weight="duotone" className="w-5 h-5" />
                </button>
                <a
                  href={lightbox.url}
                  download={`foto_sirkumsisi_${lightbox.noRm}.webp`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Unduh foto medis"
                  title="Unduh Berkas HD"
                >
                  <DownloadSimple weight="duotone" className="w-5 h-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center ml-1"
                  aria-label="Tutup penampil foto"
                  title="Tutup (Esc)"
                >
                  <X weight="bold" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Viewport */}
            <div className="flex-1 bg-black/90 overflow-auto flex items-center justify-center p-4 min-h-[320px] max-h-[70vh]">
              <img
                src={lightbox.url}
                alt={lightbox.title}
                style={{ width: `${zoomLevel}%`, maxWidth: 'none' }}
                className="object-contain transition-all duration-150 rounded-lg shadow-2xl"
              />
            </div>

            {/* Lightbox Footer & Security Disclaimer */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck weight="duotone" className="w-4 h-4" />
                Kerahasiaan Medis Terlindungi (Akses Signed URL Privat)
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                Klinik Pratama Cikidang Medika
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
