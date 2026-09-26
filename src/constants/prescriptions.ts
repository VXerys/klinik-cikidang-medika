export interface PrescriptionPreset {
  id: string;
  name: string;
  dosage: string;
  instruction: string;
  category: 'Analgesik' | 'Antibiotik' | 'Gastro' | 'Antihistamin' | 'Vitamin' | 'Respirasi' | 'Kronis' | 'Topikal';
}

export interface SignaChip {
  label: string;
  signa: string;
}

export const FAST_SIGNA_CHIPS: readonly SignaChip[] = [
  { label: '3x1 sesudah makan', signa: '3x1 tab (pc sesudah makan)' },
  { label: '2x1 sesudah makan', signa: '2x1 tab (pc sesudah makan)' },
  { label: '1x1 malam hari', signa: '1x1 tab (malam hari pc)' },
  { label: '1x1 pagi rutin', signa: '1x1 tab (pagi hari pc rutin)' },
  { label: '3x1 sebelum makan', signa: '3x1 tab (ac 30 mnt sebelum makan/kunyah)' },
  { label: 'Bila demam / nyeri', signa: '3x1 tab (pc prn bila demam/nyeri)' },
  { label: 'Habiskan antibiotik', signa: '3x1 tab (pc wajib dihabiskan)' },
  { label: 'Tiap BAB cair', signa: '1 sachet (larutkan air 200ml tiap BAB cair)' },
] as const;

export const CLINIC_DRUG_CATALOG: readonly PrescriptionPreset[] = [
  // Analgesik & Antipiretik
  { id: 'pct-500', name: 'Paracetamol 500 mg', dosage: '3x1 tab', instruction: 'pc prn demam/nyeri', category: 'Analgesik' },
  { id: 'pct-syr', name: 'Paracetamol Sirup 120mg/5ml', dosage: '3x1 cth', instruction: 'pc prn demam', category: 'Analgesik' },
  { id: 'ibuprofen-400', name: 'Ibuprofen 400 mg', dosage: '3x1 tab', instruction: 'pc sesudah makan', category: 'Analgesik' },
  { id: 'mefenamat-500', name: 'Asam Mefenamat 500 mg', dosage: '3x1 cap', instruction: 'pc sesudah makan', category: 'Analgesik' },
  { id: 'diklofenak-50', name: 'Natrium Diklofenak 50 mg', dosage: '2x1 tab', instruction: 'pc sesudah makan', category: 'Analgesik' },
  { id: 'meloxicam-15', name: 'Meloxicam 15 mg', dosage: '1x1 tab', instruction: 'pc sesudah makan', category: 'Analgesik' },

  // Antibiotik
  { id: 'amox-500', name: 'Amoxicillin 500 mg', dosage: '3x1 tab', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'amox-syr', name: 'Amoxicillin Sirup 125mg/5ml', dosage: '3x1 cth', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'cefadroxil-500', name: 'Cefadroxil 500 mg', dosage: '2x1 cap', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'ciprofloxacin-500', name: 'Ciprofloxacin 500 mg', dosage: '2x1 tab', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'cotrimoxazole-480', name: 'Cotrimoxazole 480 mg', dosage: '2x1 tab', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'thiamphenicol-500', name: 'Thiamphenicol 500 mg', dosage: '3x1 cap', instruction: 'pc habiskan', category: 'Antibiotik' },
  { id: 'metronidazole-500', name: 'Metronidazole 500 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Antibiotik' },

  // Gastrointestinal (Lambung & Saluran Cerna)
  { id: 'antasida-tab', name: 'Antasida Doen', dosage: '3x1 tab', instruction: 'ac kunyah', category: 'Gastro' },
  { id: 'antasida-syr', name: 'Antasida Doen Sirup', dosage: '3x1 cth', instruction: 'ac 30 menit', category: 'Gastro' },
  { id: 'omeprazole-20', name: 'Omeprazole 20 mg', dosage: '2x1 cap', instruction: '30 menit ac', category: 'Gastro' },
  { id: 'lansoprazole-30', name: 'Lansoprazole 30 mg', dosage: '1x1 cap', instruction: 'pagi ac', category: 'Gastro' },
  { id: 'ranitidine-150', name: 'Ranitidine 150 mg', dosage: '2x1 tab', instruction: 'ac', category: 'Gastro' },
  { id: 'domperidone-10', name: 'Domperidone 10 mg', dosage: '3x1 tab', instruction: 'ac 15 menit', category: 'Gastro' },
  { id: 'sukralfat-syr', name: 'Sukralfat Suspensi 500mg/5ml', dosage: '3x1 cth', instruction: 'ac 1 jam', category: 'Gastro' },
  { id: 'oralit', name: 'Oralit 200 mL', dosage: '1 sachet', instruction: 'larutkan air tiap BAB cair', category: 'Gastro' },
  { id: 'loperamide-2', name: 'Loperamide 2 mg', dosage: '1 tab', instruction: 'tiap BAB cair (max 4 tab)', category: 'Gastro' },
  { id: 'zinc-20', name: 'Zinc 20 mg', dosage: '1x1 tab', instruction: 'pc 10 hari berturut', category: 'Gastro' },

  // Saluran Pernapasan & Alergi
  { id: 'cetirizine-10', name: 'Cetirizine 10 mg', dosage: '1x1 tab', instruction: 'malam pc', category: 'Antihistamin' },
  { id: 'ctm-4', name: 'CTM 4 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Antihistamin' },
  { id: 'dexamethasone-05', name: 'Dexamethasone 0.5 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Respirasi' },
  { id: 'prednison-5', name: 'Prednison 5 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Respirasi' },
  { id: 'methylprednisolone-4', name: 'Methylprednisolone 4 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Respirasi' },
  { id: 'ambroxol-30', name: 'Ambroxol 30 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Respirasi' },
  { id: 'gg-100', name: 'Glyceril Guaiacolate (GG) 100 mg', dosage: '3x1 tab', instruction: 'pc', category: 'Respirasi' },
  { id: 'salbutamol-2', name: 'Salbutamol 2 mg', dosage: '3x1 tab', instruction: 'pc prn sesak', category: 'Respirasi' },
  { id: 'obh-syr', name: 'OBH Sirup 100ml', dosage: '3x1 cth', instruction: 'pc', category: 'Respirasi' },

  // Kardiovaskular & Hipertensi
  { id: 'amlodipine-5', name: 'Amlodipine 5 mg', dosage: '1x1 tab', instruction: 'pagi pc rutin', category: 'Kronis' },
  { id: 'amlodipine-10', name: 'Amlodipine 10 mg', dosage: '1x1 tab', instruction: 'pagi pc rutin', category: 'Kronis' },
  { id: 'captopril-25', name: 'Captopril 25 mg', dosage: '2x1 tab', instruction: '1 jam ac', category: 'Kronis' },
  { id: 'candesartan-8', name: 'Candesartan 8 mg', dosage: '1x1 tab', instruction: 'pagi pc', category: 'Kronis' },
  { id: 'bisoprolol-25', name: 'Bisoprolol 2.5 mg', dosage: '1x1 tab', instruction: 'pagi pc', category: 'Kronis' },
  { id: 'furosemide-40', name: 'Furosemide 40 mg', dosage: '1x1 tab', instruction: 'pagi pc', category: 'Kronis' },

  // Metabolik & Diabetes
  { id: 'metformin-500', name: 'Metformin 500 mg', dosage: '2x1 tab', instruction: 'bersama makan dc', category: 'Kronis' },
  { id: 'glimepiride-2', name: 'Glimepiride 2 mg', dosage: '1x1 tab', instruction: 'pagi ac', category: 'Kronis' },
  { id: 'allopurinol-100', name: 'Allopurinol 100 mg', dosage: '1x1 tab', instruction: 'malam pc', category: 'Kronis' },
  { id: 'simvastatin-10', name: 'Simvastatin 10 mg', dosage: '1x1 tab', instruction: 'malam pc', category: 'Kronis' },
  { id: 'simvastatin-20', name: 'Simvastatin 20 mg', dosage: '1x1 tab', instruction: 'malam pc', category: 'Kronis' },

  // Vitamin & Suplemen
  { id: 'vit-b-comp', name: 'Vitamin B Complex', dosage: '1x1 tab', instruction: 'pc', category: 'Vitamin' },
  { id: 'vit-c-500', name: 'Vitamin C 500 mg', dosage: '1x1 tab', instruction: 'pc', category: 'Vitamin' },
  { id: 'vit-b12', name: 'Vitamin B12', dosage: '1x1 tab', instruction: 'pc', category: 'Vitamin' },
  { id: 'kalk-500', name: 'Kalsium Laktat (Kalk) 500 mg', dosage: '1x1 tab', instruction: 'pc', category: 'Vitamin' },
  { id: 'fe-tab', name: 'Tablet Tambah Darah (Fe)', dosage: '1x1 tab', instruction: 'malam pc', category: 'Vitamin' },

  // Topikal
  { id: 'hidrokortison-25', name: 'Hidrokortison Salep 2.5%', dosage: '2x1 oles', instruction: 'oles tipis area gatal', category: 'Topikal' },
  { id: 'gentamicin-salep', name: 'Gentamicin Salep Kulit 0.1%', dosage: '2x1 oles', instruction: 'oles tipis area luka', category: 'Topikal' },
  { id: 'povidone-iodine', name: 'Povidone Iodine 10%', dosage: 'Secukupnya', instruction: 'bersihkan dan kompres luka', category: 'Topikal' },
] as const;

export const POPULAR_PRESCRIPTIONS = CLINIC_DRUG_CATALOG.slice(0, 10);

export function formatPrescriptionItem(preset: PrescriptionPreset): string {
  return `${preset.name} - ${preset.dosage} (${preset.instruction})`;
}
