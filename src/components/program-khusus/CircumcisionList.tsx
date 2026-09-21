'use client';

import React, { useState } from 'react';
import { Scissors, Calendar, User, Eye, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import type { Circumcision } from '@/types/database';
import { formatRupiah } from '@/lib/utils';
import { getSignedMedicalPhotoUrl } from '@/lib/storage';

interface CircumcisionListProps {
  records: Circumcision[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function CircumcisionList({ records, onRefresh, isLoading }: CircumcisionListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const handleOpenPhoto = async (path: string, provider: 'supabase' | 'cloudinary', title: string) => {
    setLoadingPhoto(true);
    try {
      const signedUrl = await getSignedMedicalPhotoUrl(path, provider);
      setSelectedPhoto({ url: signedUrl, title });
    } catch (err) {
      console.error('Error loading signed photo URL:', err);
      alert('Gagal memuat foto medis.');
    } finally {
      setLoadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl border border-slate-200"></div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
        <Scissors className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold">Belum ada riwayat tindakan sirkumsisi.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Klik tombol &quot;+ Catat Tindakan Sunat&quot; untuk mendokumentasikan pasien baru.
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
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.pasien?.nama || 'Pasien'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    RM: {item.pasien?.no_rm} • Desa {item.pasien?.desa} • Usia {item.pasien?.usia || '-'} thn
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {formatRupiah(item.biaya || 0)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Tanggal Tindakan:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(item.tanggal_tindakan).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Metode:</span>
                <span className="font-semibold text-blue-700">{item.metode}</span>
              </div>
            </div>

            {item.kondisi_luka && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                <span className="font-semibold text-slate-800 block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                  Evaluasi Luka
                </span>
                {item.kondisi_luka}
              </div>
            )}

            {/* Tombol Lihat Foto */}
            <div className="flex items-center gap-2 pt-1">
              {item.foto_1_url && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPhoto(
                      item.foto_1_url!,
                      item.storage_provider || 'supabase',
                      `Foto Luka 1 - ${item.pasien?.nama}`
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Foto 1</span>
                </button>
              )}
              {item.foto_2_url && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPhoto(
                      item.foto_2_url!,
                      item.storage_provider || 'supabase',
                      `Foto Luka 2 - ${item.pasien?.nama}`
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Foto 2</span>
                </button>
              )}
              {!item.foto_1_url && !item.foto_2_url && (
                <span className="text-[11px] text-slate-400 italic">Tidak ada foto dilampirkan</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview Foto Medis Terenkripsi */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-white w-full max-w-lg rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200">{selectedPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <div className="text-[11px] text-slate-400 text-center">
              Foto medis privat dilindungi akses dokter terenkripsi
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
