import type { RecipeConfig, StarterStrength } from '@/types';
import { calculateProcessTimeline } from './stages';

/**
 * Given a desired bake time, calculates when to start each phase.
 * Returns timestamps working backwards from the bake time.
 */
export function calculateStartTime(
  config: RecipeConfig,
  desiredBakeTime: Date,
): { startTime: Date; stageSchedule: Array<{ name: string; start: Date; end: Date }> } {
  const timeline = calculateProcessTimeline(config);
  const totalMs = timeline.reduce((sum, s) => sum + s.calculatedDurationMs, 0);

  const startTime = new Date(desiredBakeTime.getTime() - totalMs);
  const schedule: Array<{ name: string; start: Date; end: Date }> = [];

  let current = startTime.getTime();
  for (const stage of timeline) {
    schedule.push({
      name: stage.name,
      start: new Date(current),
      end: new Date(current + stage.calculatedDurationMs),
    });
    current += stage.calculatedDurationMs;
  }

  return { startTime, stageSchedule: schedule };
}

/**
 * Suggests starter percentage based on temperature and desired timing.
 */
export function suggestStarterPercent(roomTempC: number, targetHoursBulk: number): number {
  // Warmer = less starter needed, cooler = more
  const basePct = 20;
  const tempFactor = (24 - roomTempC) * 1.5; // +1.5% per degree below 24
  const timeFactor = targetHoursBulk > 8 ? -5 : targetHoursBulk < 4 ? 5 : 0;
  return Math.round(Math.max(5, Math.min(30, basePct + tempFactor + timeFactor)));
}

/**
 * Suggests feeding ratio based on when you need the levain ready.
 */
export function suggestFeedingRatio(hoursUntilNeeded: number): { ratio: string; explanation: string } {
  if (hoursUntilNeeded <= 5) {
    return { ratio: '1:1:1', explanation: 'Snelle piek (4-6u). Gebruik als je snel wilt beginnen.' };
  }
  if (hoursUntilNeeded <= 8) {
    return { ratio: '1:5:5', explanation: 'Standaard piek (6-8u). Goede balans tussen snelheid en vitaliteit.' };
  }
  return { ratio: '1:10:10', explanation: 'Trage piek (10-12u). Ideaal voor overnacht. Buffert aciditeit.' };
}

/**
 * Seasonal advice based on room temperature.
 */
export function seasonalAdvice(roomTempC: number): string[] {
  const tips: string[] = [];

  if (roomTempC >= 28) {
    tips.push('Zomer: verlaag starter% naar 5-10% om overfermentatie te voorkomen.');
    tips.push('Gebruik koud water om de DDT te verlagen.');
    tips.push('Overweeg Route B (koude rijs) voor betere controle.');
    tips.push('Verkort de bulkfermentatie - let extra goed op volumetoename.');
  } else if (roomTempC >= 24) {
    tips.push('Goede baktemperatuur. Standaard 15-20% starter werkt prima.');
    tips.push('Beide routes (warm en koud) zijn goed uitvoerbaar.');
  } else if (roomTempC >= 20) {
    tips.push('Koel: verhoog starter% naar 20-25% voor voldoende activiteit.');
    tips.push('De bulkfermentatie duurt langer - plan extra tijd in.');
    tips.push('Voordeel: meer azijnzuurontwikkeling voor complexere smaak.');
  } else {
    tips.push('Winter: verhoog starter% naar 25-30%.');
    tips.push('Overweeg de levain op een warmere plek te laten rijzen.');
    tips.push('Gebruik warm water om de DDT te verhogen.');
    tips.push('De bulk kan 8-12+ uur duren bij deze temperatuur.');
  }

  return tips;
}

/**
 * Flour-specific advice based on type.
 */
export function flourAdvice(flourType: string): string[] {
  const advice: Record<string, string[]> = {
    T45: [
      'Lage buffercapaciteit: pH daalt snel, kortere fermentatie nodig.',
      'Fijn meel: snelle hydratatie, minder autolyse-tijd nodig.',
      'Resultaat: lichte, roomwitte kruim met mild profiel.',
    ],
    T65: [
      'De standaard voor artisanaal desembrood.',
      'Goede balans tussen glutensterkte en smaak.',
      'Werkt met alle routes en starterpercentages.',
    ],
    T80: [
      'Hogere buffercapaciteit door meer mineralen.',
      'Activeert de starter sterker - fermentatie kan sneller verlopen.',
      'Resultaat: meer smaakdiepte, iets donkerdere kruim.',
    ],
    T150: [
      'Volkoren: hoge enzymatische activiteit versnelt fermentatie.',
      'Absorbeert meer water: verhoog hydratie met 5-10%.',
      'Zemeldeeltjes kunnen gluten fysiek doorsnijden - wees voorzichtig met overfermentatie.',
      'Resultaat: stevige kruim, nootachtige smaak, hoge voedingswaarde.',
    ],
    spelt: [
      'Zwak gluten door hoge gliadine/glutenine-ratio (3.5 vs 2 bij tarwe).',
      'Verlaag hydratie naar 65-70% om uitlopen te voorkomen.',
      'Verkort de bulkfermentatie met 20-30%.',
      'Minimaal vormen - het deeg verliest snel spanning.',
    ],
    rogge: [
      'Zeer actieve enzymen: fermentatie gaat snel.',
      'Nauwelijks glutennetwerk - pentosanen zorgen voor structuur.',
      'Hogere hydratie nodig (80-90%).',
      'Resultaat: dicht, vochtig brood met intense smaak.',
    ],
  };
  return advice[flourType] ?? ['Pas de standaard parameters aan op basis van ervaring.'];
}

/**
 * Analyzes starter state and gives recommendation.
 */
export function starterStateAdvice(strength: StarterStrength): string[] {
  const advice: Record<StarterStrength, string[]> = {
    zwak: [
      'Je starter is nog niet op kracht. Voed 2-3 keer voor gebruik.',
      'Gebruik een hoge voedingsratio (1:5:5 of 1:10:10) om vitaliteit te herstellen.',
      'Verhoog het starterpercentage naar 25-30% om te compenseren.',
      'Verwacht 30-50% langere fermentatietijden.',
    ],
    gemiddeld: [
      'Je starter is actief maar niet op piek. Eenmaal voeden kan helpen.',
      'Standaard starterpercentage (15-20%) is voldoende.',
      'Verwacht iets langere fermentatietijden dan normaal.',
    ],
    sterk: [
      'Goede staat! Klaar voor gebruik.',
      'Standaard parameters werken prima.',
      'De Float Test zou positief moeten zijn.',
    ],
    piek: [
      'Optimale staat! Gebruik binnen 1-2 uur voor beste resultaat.',
      'Je kunt het starterpercentage verlagen naar 10-15%.',
      'Fermentatie zal efficiënt verlopen - hou de volumetoename goed in de gaten.',
    ],
  };
  return advice[strength];
}
