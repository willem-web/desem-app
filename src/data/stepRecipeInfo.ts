import type { StageId, RecipeConfig } from '@/types';
import { presetBlends, calculateBlendAmounts } from './flourBlends';

interface StepRecipeInfo {
  ingredients?: Array<{ label: string; amount: string; highlight?: boolean }>;
  temperature?: { label: string; value: string; note?: string };
  tip?: string;
}

/**
 * Returns recipe-relevant info for each step.
 * Only shows what's needed for THAT step - not the whole recipe.
 */
export function getStepRecipeInfo(
  stageId: StageId,
  config: RecipeConfig,
): StepRecipeInfo | null {
  const blend = presetBlends.find(b => b.id === config.flourBlendId);
  const totalFlour = config.totalFlourGrams;
  const waterGrams = Math.round(totalFlour * config.hydrationPercent / 100);
  const starterGrams = Math.round(totalFlour * config.starterPercent / 100);
  const saltGrams = Math.round(totalFlour * config.saltPercent / 100 * 10) / 10;
  const blendAmounts = blend
    ? calculateBlendAmounts(blend, totalFlour)
    : [{ label: config.flourType, flourType: config.flourType, grams: totalFlour }];

  // Water temp calculation (simplified - matches SetupWizard)
  const waterTemp = Math.round(4 * config.targetDDT - config.roomTempC - config.roomTempC - config.roomTempC - 6);

  switch (stageId) {
    case 'levain':
      return {
        ingredients: [
          { label: 'Starter', amount: `${Math.round(starterGrams * 0.2)}g`, highlight: false },
          { label: 'Bloem', amount: `${Math.round(starterGrams * 0.4)}g` },
          { label: 'Water', amount: `${Math.round(starterGrams * 0.4)}g` },
        ],
        temperature: {
          label: 'Kamertemperatuur',
          value: `${config.roomTempC}°C`,
          note: config.roomTempC < 20 ? 'Koel: zoek een warmere plek' : undefined,
        },
        tip: `Voedingsratio ${config.feedingRatio} — totaal ${starterGrams}g actieve starter nodig`,
      };

    case 'autolyse':
      return {
        ingredients: blendAmounts.map(a => ({
          label: a.label,
          amount: `${a.grams}g`,
          highlight: true,
        })).concat([
          { label: 'Water (deel 1)', amount: `${Math.round(waterGrams * 0.9)}g`, highlight: true },
        ]),
        temperature: {
          label: 'Watertemperatuur',
          value: `${waterTemp}°C`,
          note: 'Gebruik een thermometer!',
        },
        tip: 'Hou ~10% water achter om later met het zout toe te voegen',
      };

    case 'mengen':
      return {
        ingredients: [
          { label: 'Actieve starter', amount: `${starterGrams}g`, highlight: true },
          { label: 'Zout', amount: `${saltGrams}g`, highlight: true },
          { label: 'Resterend water', amount: `${Math.round(waterGrams * 0.1)}g` },
        ],
        temperature: {
          label: 'Doel deegtemperatuur',
          value: `${config.targetDDT}°C`,
          note: 'Meet na het mengen met een thermometer',
        },
      };

    case 'bulk':
      return {
        temperature: {
          label: 'Deegtemperatuur',
          value: `${config.targetDDT}°C`,
          note: `Kamer: ${config.roomTempC}°C`,
        },
        tip: config.route === 'warm'
          ? 'Route A: stop bij 30-50% volumetoename'
          : 'Route B: ga door tot 50-75% volumetoename',
      };

    case 'koude_rijs':
      return {
        temperature: {
          label: 'Koelkast',
          value: '3-4°C',
          note: '12-24 uur voor optimale smaak',
        },
        tip: 'Dek af met folie. Je kunt direct vanuit de koelkast bakken.',
      };

    case 'bakken_stoom':
      return {
        temperature: {
          label: 'Oventemperatuur',
          value: '250°C',
          note: 'Voorverwarmen met Dutch oven erin!',
        },
        tip: '20 min met deksel dicht = stoom voor maximale ovenspring',
      };

    case 'bakken_droog':
      return {
        temperature: {
          label: 'Oventemperatuur',
          value: '230°C',
          note: 'Deksel eraf, temperatuur omlaag',
        },
        tip: 'Klaar als de kerntemperatuur 96-98°C bereikt en de korst diep goudbruin is',
      };

    case 'afkoelen':
      return {
        temperature: {
          label: 'Op rooster',
          value: 'kamertemp',
          note: 'Niet aansnijden! Min. 1-2 uur wachten',
        },
      };

    default:
      return null;
  }
}
