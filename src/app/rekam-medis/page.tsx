'use client';

import React, { useState } from 'react';
import { Stethoscope, FileText, CheckCircle } from 'lucide-react';

export default function RekamMedisPage() {
  const [selectedPatient, setSelectedPatient] = useState('021303596');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pemeriksaan Dokter & Rekam Medis</h1>
        <p className="text-xs text-slate-500 mt-1">Antrean periksa, pencatatan keluhan (anamnesa), diagnosa ICD-10, dan resep obat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Pasien */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Antrean Hari Ini</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">dr. Ovan</span>
          </h2>
          <div className="space-y-2">
            {[
              { rm: '021303596', nama: 'An. Agaisha Pinka (7 th)', status: 'Sedang Diperiksa' },
              { rm: '010101231', nama: 'Tn. Umar (56 th)', status: 'Menunggu' },
              { rm: '010400529', nama: 'An. Faizan (4 th)', status: 'Menunggu' },
              { rm: '010400093', nama: 'Tn. Aziz Supriatman (51 th)', status: 'Selesai' },
            ].map((p) => (
              <div 
                key={p.rm}
                onClick={() => setSelectedPatient(p.rm)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                  selectedPatient === p.rm
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-blue-700">{p.rm}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    p.status === 'Sedang Diperiksa' ? 'bg-amber-100 text-amber-800' : 
                    p.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>{p.status}</span>
                </div>
                <div className="font-semibold text-slate-800">{p.nama}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulir Pemeriksaan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Form Catatan Medis Pasien</h3>
              <p className="text-xs text-slate-500">No RM: {selectedPatient} — An. Agaisha Pinka</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
              Kunjungan ke-3
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Keluhan Pasien (Hasil Anamnesa)</label>
              <textarea 
                rows={3} 
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500" 
                defaultValue="Demam 3 hari, sakit kepala, sakit perut, batuk flu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Diagnosa Utama (Kode ICD-10)</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500">
                  <option value="J00">J00 — Acute nasopharyngitis (Common cold)</option>
                  <option value="K30">K30 — Dyspepsia</option>
                  <option value="Z34">Z34 — Supervision of normal pregnancy</option>
                  <option value="L23">L23 — Allergic contact dermatitis</option>
                  <option value="A09">A09 — Diarrhoea and gastroenteritis</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tindakan Tambahan</label>
                <input 
                  type="text" 
                  placeholder="contoh: Nebulizer / Cek HB / EKG" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Terapi & Resep Obat</label>
              <textarea 
                rows={3} 
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono text-[11px]" 
                defaultValue="puyer, paracetamol syr, cetirizine syr, anabion syr, amoxicillin syr"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition">
                <CheckCircle className="w-4 h-4" />
                Simpan & Teruskan ke Kasir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
