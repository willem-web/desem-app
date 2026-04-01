/**
 * Estimates pH during bulk fermentation using a sigmoid (tanh) curve.
 * pH drops from ~5.8 to ~4.3 during fermentation.
 * Fastest drop occurs around 45% of total duration.
 */
export function estimatePh(
  timeMinutes: number,
  totalDurationMinutes: number,
  startPh: number = 5.8,
  endPh: number = 4.3,
): number {
  if (totalDurationMinutes <= 0) return startPh;

  const progress = timeMinutes / totalDurationMinutes;
  // Sigmoid using tanh, centered at 0.45 of total duration
  const sigmoid = 0.5 * (1 + Math.tanh(6 * (progress - 0.45)));
  const ph = startPh - (startPh - endPh) * sigmoid;

  return Math.round(ph * 100) / 100;
}

/**
 * Generates pH curve data points.
 */
export function generatePhCurve(
  totalDurationMinutes: number,
  intervalMinutes: number = 15,
  startPh: number = 5.8,
  endPh: number = 4.3,
): Array<{ timeMinutes: number; ph: number }> {
  const points: Array<{ timeMinutes: number; ph: number }> = [];

  for (let t = 0; t <= totalDurationMinutes; t += intervalMinutes) {
    points.push({
      timeMinutes: t,
      ph: estimatePh(t, totalDurationMinutes, startPh, endPh),
    });
  }

  return points;
}

/**
 * Returns the starting pH based on flour type's buffering capacity.
 * Higher ash content = higher starting pH due to mineral buffers.
 */
export function startingPhForFlour(flourType: string): number {
  const phMap: Record<string, number> = {
    T45: 5.6,
    T65: 5.8,
    T80: 6.0,
    T150: 6.2,
    spelt: 5.9,
    rogge: 6.1,
    custom: 5.8,
  };
  return phMap[flourType] ?? 5.8;
}
