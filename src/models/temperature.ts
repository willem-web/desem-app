/**
 * Desired Dough Temperature calculation.
 *
 * Without levain: waterTemp = 3 × DDT - roomTemp - flourTemp - frictionFactor
 * With levain:    waterTemp = 4 × DDT - roomTemp - flourTemp - levainTemp - frictionFactor
 *
 * Friction factor: ~6 for hand mixing, ~25 for stand mixer
 */
export function calculateWaterTemperature(
  targetDDT: number,
  roomTempC: number,
  flourTempC: number,
  frictionFactor: number = 6,
  levainTempC?: number,
): number {
  if (levainTempC !== undefined) {
    return 4 * targetDDT - roomTempC - flourTempC - levainTempC - frictionFactor;
  }
  return 3 * targetDDT - roomTempC - flourTempC - frictionFactor;
}

/**
 * Estimates flour temperature (usually close to room temperature).
 */
export function estimateFlourTemp(roomTempC: number): number {
  return roomTempC;
}

/**
 * Estimates actual dough temperature after mixing.
 * Simplified: average of water, flour, and room temps + friction.
 */
export function estimateDoughTemp(
  waterTempC: number,
  flourTempC: number,
  roomTempC: number,
  frictionFactor: number = 25,
  levainTempC?: number,
): number {
  if (levainTempC !== undefined) {
    return (waterTempC + flourTempC + roomTempC + levainTempC + frictionFactor) / 4;
  }
  return (waterTempC + flourTempC + roomTempC + frictionFactor) / 3;
}

/**
 * Suggests ideal DDT based on chosen process route.
 */
export function suggestedDDT(route: 'warm' | 'koud'): number {
  return route === 'warm' ? 26 : 23;
}
