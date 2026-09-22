export interface PrescriptionPreset {
  id: string;
  name: string;
  dosage: string;
  instruction: string;
  category: 'Analgesik' | 'Antibiotik' | 'Gastro' | 'Antihistamin' | 'Vitamin' | 'Respirasi' | 'Kronis';
}

export const POPULAR_PRESCRIPTIONS: readonly PrescriptionPreset[] = [
  {
    id: 'pct-500',
    name: 'Paracetamol 500 mg',
    dosage: '3x1 tab',
    instruction: 'pc prn demam/nyeri',
    category: 'Analgesik',
  },
  {
    id: 'amox-500',
    name: 'Amoxicillin 500 mg',
    dosage: '3x1 tab',
    instruction: 'pc habiskan',
    category: 'Antibiotik',
  },
  {
    id: 'antasida',
    name: 'Antasida Doen',
    dosage: '3x1 tab',
    instruction: 'ac kunyah',
    category: 'Gastro',
  },
  {
    id: 'omeprazole',
    name: 'Omeprazole 20 mg',
    dosage: '2x1 cap',
    instruction: '30 menit ac',
    category: 'Gastro',
  },
  {
    id: 'cetirizine',
    name: 'Cetirizine 10 mg',
    dosage: '1x1 tab',
    instruction: 'malam pc',
    category: 'Antihistamin',
  },
  {
    id: 'ctm-4',
    name: 'CTM 4 mg',
    dosage: '3x1 tab',
    instruction: 'pc',
    category: 'Antihistamin',
  },
  {
    id: 'ambroxol',
    name: 'Ambroxol 30 mg',
    dosage: '3x1 tab',
    instruction: 'pc',
    category: 'Respirasi',
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen 400 mg',
    dosage: '3x1 tab',
    instruction: 'pc sesudah makan',
    category: 'Analgesik',
  },
  {
    id: 'vit-b-comp',
    name: 'Vitamin B Complex',
    dosage: '1x1 tab',
    instruction: 'pc',
    category: 'Vitamin',
  },
  {
    id: 'oralit',
    name: 'Oralit 200 mL',
    dosage: '1 sachet',
    instruction: 'larutkan air tiap BAB cair',
    category: 'Gastro',
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine 5 mg',
    dosage: '1x1 tab',
    instruction: 'pagi pc rutin',
    category: 'Kronis',
  },
  {
    id: 'metformin',
    name: 'Metformin 500 mg',
    dosage: '2x1 tab',
    instruction: 'bersama makan dc',
    category: 'Kronis',
  },
] as const;

export function formatPrescriptionItem(preset: PrescriptionPreset): string {
  return `${preset.name} - ${preset.dosage} (${preset.instruction})`;
}
