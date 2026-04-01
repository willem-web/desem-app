import type { StarterStrength, FlourType } from '@/types';

const Q10 = 2.0;
const Q10_STEP = 5; // °C

/**
 * Q10 temperature model: calculates adjusted fermentation time
 * based on actual temperature vs reference temperature.
 * Every 5°C increase halves the duration.
 */
export function calculateFermentationTime(
  baseDurationMin: number,
  referenceTempC: number,
  actualTempC: number,
): number {
  const exponent = (referenceTempC - actualTempC) / Q10_STEP;
  return baseDurationMin * Math.pow(Q10, exponent);
}

/**
 * Adjusts duration based on starter percentage relative to 20% baseline.
 * Uses power-law (exponent 0.7) - doubling starter doesn't perfectly halve time.
 */
export function inoculationCorrection(
  durationMin: number,
  starterPercent: number,
  baselinePercent: number = 20,
): number {
  if (starterPercent <= 0) return durationMin * 3;
  const ratio = baselinePercent / starterPercent;
  return durationMin * Math.pow(ratio, 0.7);
}

/**
 * Maps starter health to a duration multiplier.
 */
export function starterStrengthMultiplier(strength: StarterStrength): number {
  const multipliers: Record<StarterStrength, number> = {
    zwak: 1.5,
    gemiddeld: 1.15,
    sterk: 1.0,
    piek: 0.85,
  };
  return multipliers[strength];
}

/**
 * Salt correction: 2% salt is baseline. Each 0.5% deviation
 * adjusts fermentation speed by ~10%.
 */
export function saltCorrection(
  durationMin: number,
  saltPercent: number,
): number {
  const baseline = 2.0;
  const deviation = (saltPercent - baseline) / 0.5;
  return durationMin * Math.pow(1.1, deviation);
}

/**
 * Flour type correction factor.
 * Higher ash content = more buffering = slightly longer productive fermentation.
 * Volkoren has more enzyme activity = faster overall.
 */
export function flourCorrection(flourType: FlourType): number {
  const corrections: Record<FlourType, number> = {
    T45: 0.9,     // less buffering, faster pH drop stops fermentation sooner
    T65: 1.0,     // baseline
    T80: 1.05,    // more buffering, slightly longer
    T150: 0.85,   // high enzyme activity speeds things up
    spelt: 0.9,   // weaker gluten, need shorter fermentation
    rogge: 0.8,   // very active enzymes
    custom: 1.0,
  };
  return corrections[flourType];
}

/**
 * Generates fermentation rise curve using logistic (S-curve) model.
 * Inflection point at 45% of total duration.
 */
export function generateRiseCurve(
  totalDurationMin: number,
  targetRisePercent: number,
  intervalMin: number = 15,
): Array<{ timeMinutes: number; risePercent: number }> {
  const points: Array<{ timeMinutes: number; risePercent: number }> = [];
  const inflection = totalDurationMin * 0.45;
  // Steepness parameter for logistic curve
  const k = 6 / totalDurationMin;

  for (let t = 0; t <= totalDurationMin; t += intervalMin) {
    const logistic = 1 / (1 + Math.exp(-k * (t - inflection)));
    points.push({
      timeMinutes: t,
      risePercent: Math.round(targetRisePercent * logistic * 10) / 10,
    });
  }

  return points;
}

/**
 * Maps temperature to target rise percentage.
 * Warm dough = lower target (fermentation continues during shaping).
 * Cool dough = higher target (stops faster when cooled).
 */
export function targetRisePercent(tempC: number): number {
  if (tempC >= 27) return 27.5;
  if (tempC >= 24) return 40 + (27 - tempC) * 5;
  if (tempC >= 22) return 55 + (24 - tempC) * 10;
  if (tempC >= 20) return 75 + (22 - tempC) * 12.5;
  return 100;
}

/**
 * Estimates levain peak time based on feeding ratio and temperature.
 */
export function levainPeakTimeMinutes(
  feedingRatio: string,
  tempC: number,
): number {
  const baseMinutes: Record<string, number> = {
    '1:1:1': 300,   // 5 hours at 24°C
    '1:2:2': 420,   // 7 hours
    '1:5:5': 480,   // 8 hours
    '1:10:10': 660, // 11 hours
  };

  const base = baseMinutes[feedingRatio] ?? 480;
  return calculateFermentationTime(base, 24, tempC);
}
