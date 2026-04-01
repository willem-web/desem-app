import type { FlourType } from '@/types';

export interface FlourBlendComponent {
  flourType: FlourType;
  label: string;
  percentage: number; // 0-100
}

export interface FlourBlend {
  id: string;
  name: string;
  description: string;
  style: string;
  components: FlourBlendComponent[];
  suggestedHydration: number;
  notes?: string;
}

export const presetBlends: FlourBlend[] = [
  // === Basis / Beginners ===
  {
    id: 'pure-t65',
    name: '100% T65 Tradition',
    description: 'Puur tarwebloem, de standaard voor artisanaal desembrood.',
    style: 'Pain de campagne',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 100 },
    ],
    suggestedHydration: 72,
  },

  // === Klassieke mengsels ===
  {
    id: 't65-rogge-90-10',
    name: '90% T65 / 10% Rogge',
    description: 'Klassiek Frans landbrood met een vleugje rogge voor diepte.',
    style: 'Pain de campagne',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 90 },
      { flourType: 'rogge', label: 'Roggemeel T130', percentage: 10 },
    ],
    suggestedHydration: 72,
    notes: 'Jouw recept: 450g T65 + 50g rogge T130',
  },
  {
    id: 't65-t80-rogge-60-30-10',
    name: '60% T65 / 30% T80 / 10% Rogge',
    description: 'Rijke smaak door drie meelsoorten. Meer mineralen, complexer aroma.',
    style: 'Pain de campagne rustique',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 60 },
      { flourType: 'T80', label: 'T80 Gebuild', percentage: 30 },
      { flourType: 'rogge', label: 'Roggemeel T130', percentage: 10 },
    ],
    suggestedHydration: 72,
    notes: 'Jouw recept: 500g meel (300g T65 + 150g T80 + 50g rogge)',
  },
  {
    id: 't65-t80-rogge-50-40-10',
    name: '50% T65 / 40% T80 / 10% Rogge',
    description: 'Jouw grote recept: steviger, nootachtiger, meer karakter.',
    style: 'Miche / groot landbrood',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 50 },
      { flourType: 'T80', label: 'T80 Gebuild', percentage: 40 },
      { flourType: 'rogge', label: 'Roggemeel T130', percentage: 10 },
    ],
    suggestedHydration: 74,
    notes: 'Jouw recept: 1000g meel (500g T65 + 400g T80 + 100g rogge). Langere autolyse (2-4u) aanbevolen.',
  },

  // === T80 dominant ===
  {
    id: 't65-t80-80-20',
    name: '80% T65 / 20% T80',
    description: 'Iets meer bite en mineralen dan puur T65.',
    style: 'Pain tradition',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 80 },
      { flourType: 'T80', label: 'T80 Gebuild', percentage: 20 },
    ],
    suggestedHydration: 72,
  },

  // === Volkoren mengsels ===
  {
    id: 't65-t150-80-20',
    name: '80% T65 / 20% Volkoren',
    description: 'Lichte volkoren toets, open kruim nog mogelijk.',
    style: 'Semi-volkoren',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 80 },
      { flourType: 'T150', label: 'Volkoren tarwe', percentage: 20 },
    ],
    suggestedHydration: 75,
  },
  {
    id: 't65-t150-50-50',
    name: '50% T65 / 50% Volkoren',
    description: 'Stevig volkorenbrood met goede structuur.',
    style: 'Volkoren desem',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 50 },
      { flourType: 'T150', label: 'Volkoren tarwe', percentage: 50 },
    ],
    suggestedHydration: 78,
    notes: 'Verhoog hydratie: volkoren absorbeert meer water.',
  },

  // === Spelt mengsels ===
  {
    id: 'tarwe-spelt-80-20',
    name: '80% T65 / 20% Spelt',
    description: 'Lichte nootachtige smaak, goed rijsbaar.',
    style: 'Tarwe-spelt',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 80 },
      { flourType: 'spelt', label: 'Speltbloem', percentage: 20 },
    ],
    suggestedHydration: 70,
  },
  {
    id: 'tarwe-spelt-70-30',
    name: '70% T65 / 30% Spelt',
    description: 'Duidelijk spelt-karakter, nog steeds goede structuur.',
    style: 'Spelt-tarwe',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 70 },
      { flourType: 'spelt', label: 'Speltbloem', percentage: 30 },
    ],
    suggestedHydration: 68,
    notes: 'Max 35% spelt voor goede structuur. Kortere bulk aanbevolen.',
  },
  {
    id: 'pure-spelt',
    name: '100% Spelt',
    description: 'Puur speltbrood: nootachtig, teer kruim. Lager hydrateren!',
    style: 'Spelt desem',
    components: [
      { flourType: 'spelt', label: 'Speltbloem', percentage: 100 },
    ],
    suggestedHydration: 65,
    notes: 'Zwak gluten: kort bulk, minimaal vormen, snel werken.',
  },

  // === Rogge dominant ===
  {
    id: 'tarwe-rogge-70-30',
    name: '70% T65 / 30% Rogge',
    description: 'Stevig roggekarakter, aardse smaak.',
    style: 'Rogge-tarwe',
    components: [
      { flourType: 'T65', label: 'T65 Tradition', percentage: 70 },
      { flourType: 'rogge', label: 'Roggemeel', percentage: 30 },
    ],
    suggestedHydration: 75,
    notes: 'Rogge fermenteert snel - verkort bulk of verlaag starter%.',
  },
];

/**
 * Calculate flour amounts in grams for a given blend and total weight.
 */
export function calculateBlendAmounts(
  blend: FlourBlend,
  totalFlourGrams: number,
): Array<{ label: string; flourType: FlourType; grams: number }> {
  return blend.components.map(c => ({
    label: c.label,
    flourType: c.flourType,
    grams: Math.round(totalFlourGrams * c.percentage / 100),
  }));
}

/**
 * Calculate the effective flour type for fermentation modeling.
 * Returns a weighted "average" flour type based on the blend.
 */
export function effectiveFlourType(blend: FlourBlend): FlourType {
  // Use the dominant flour type (highest percentage)
  const dominant = blend.components.reduce((a, b) =>
    a.percentage >= b.percentage ? a : b
  );
  return dominant.flourType;
}

/**
 * Calculate effective flour correction factor for a blend.
 * Weighted average of individual flour correction factors.
 */
export function blendCorrectionFactor(blend: FlourBlend): number {
  const corrections: Record<FlourType, number> = {
    T45: 0.9,
    T65: 1.0,
    T80: 1.05,
    T150: 0.85,
    spelt: 0.9,
    rogge: 0.8,
    custom: 1.0,
  };

  return blend.components.reduce(
    (sum, c) => sum + (corrections[c.flourType] ?? 1.0) * (c.percentage / 100),
    0
  );
}
