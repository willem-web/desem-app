/**
 * Estimates the lactic acid fraction based on fermentation temperature.
 * Warmer = more lactic (milder), cooler = more acetic (tangier).
 *
 * Linear interpolation:
 * 30°C → 85% lactic
 * 20°C → 60% lactic
 * 4°C  → 40% lactic
 */
export function lacticAcidFraction(tempC: number): number {
  if (tempC >= 30) return 0.85;
  if (tempC >= 20) return 0.60 + (tempC - 20) * 0.025;
  if (tempC >= 4) return 0.40 + (tempC - 4) * 0.0125;
  return 0.40;
}

/**
 * Returns a Dutch flavor description based on lactic ratio.
 */
export function flavorDescription(lacticRatio: number): string {
  if (lacticRatio >= 0.75) return 'Mild en romig (yoghurt-achtig)';
  if (lacticRatio >= 0.60) return 'Gebalanceerd zuur';
  if (lacticRatio >= 0.45) return 'Uitgesproken zuur (azijnachtig)';
  return 'Sterk azijnzuur, scherp';
}

/**
 * Returns flavor impact description for cold retard.
 */
export function coldRetardFlavorNote(hoursInFridge: number): string {
  if (hoursInFridge <= 8) return 'Licht extra zuurontwikkeling';
  if (hoursInFridge <= 16) return 'Merkbaar complexer aroma, meer azijnzuur';
  return 'Diep, complex smaakprofiel met sterke zuurtoetsen';
}
