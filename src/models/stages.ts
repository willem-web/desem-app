import type { StageDefinition, StageId, RecipeConfig, ActiveStage } from '@/types';
import { calculateFermentationTime, inoculationCorrection, starterStrengthMultiplier, saltCorrection, flourCorrection, levainPeakTimeMinutes } from './fermentation';

export const stageDefinitions: StageDefinition[] = [
  {
    id: 'levain',
    name: 'Levain bouwen',
    description: 'Bouw je levain (voordeeg) door je starter te voeden.',
    instructions: [
      'Weeg de benodigde hoeveelheid starter af',
      'Voeg bloem en water toe volgens de voedingsratio',
      'Meng tot een homogeen mengsel',
      'Dek af en laat rijzen op kamertemperatuur',
      'De levain is klaar als hij verdubbeld is en net begint in te zakken',
    ],
    baseDurationMinutes: 480,
    referenceTempC: 24,
    usesQ10: true,
    expectedProperties: [
      'Verdubbeld in volume',
      'Koepelvormig oppervlak (of net voorbij piek)',
      'Luchtig en vol met bellen',
      'Licht zure, fruitige geur',
    ],
    physicalTest: {
      name: 'Float Test',
      description: 'Laat een theelepel levain in water vallen.',
      science: 'Als de levain drijft, is de dichtheid lager dan water door ingesloten CO2. Dit bewijst dat de gistpopulatie actief genoeg is.',
      outcomes: {
        underfermented: 'Zinkt: nog niet genoeg gasproductie. Wacht langer.',
        optimal: 'Drijft: de gisten zijn actief en er is voldoende gas ingebouwd.',
        overfermented: 'Drijft maar is plat/ingevallen: voorbij de piek, nog bruikbaar maar minder krachtig.',
      },
    },
  },
  {
    id: 'autolyse',
    name: 'Autolyse',
    description: 'Bloem en water rusten zonder zout of starter.',
    instructions: [
      'Meng bloem en water tot een ruw, "shaggy" mengsel',
      'Alle bloem moet nat zijn, niet langer mengen',
      'Dek af en laat 30-60 minuten rusten',
    ],
    baseDurationMinutes: 45,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Ruw, grof mengsel ("shaggy mass")',
      'Na rust: gladder en rekbaarder',
      'Deeg laat makkelijker los van de kom',
    ],
  },
  {
    id: 'mengen',
    name: 'Mengen',
    description: 'Voeg levain en zout toe aan het geautolyseerde deeg.',
    instructions: [
      'Verspreid de levain over het deeg',
      'Strooi het zout erover',
      'Knijp en vouw het deeg tot alles gelijkmatig verdeeld is (5-10 min)',
      'Het deeg moet glad en elastisch aanvoelen',
    ],
    baseDurationMinutes: 20,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Glad, elastisch deeg',
      'Geen droge plekken of klonten',
      'Laat los van de handen/kom',
    ],
    physicalTest: {
      name: 'Windowpane Test',
      description: 'Rek een stukje deeg dun uit.',
      science: 'Als het deeg zo dun wordt dat licht erdoor schijnt zonder te scheuren, zijn de gluteninefilamenten volledig uitgelijnd en vormen ze een continu netwerk.',
      outcomes: {
        underfermented: 'Scheurt snel: gluten nog niet voldoende ontwikkeld. Nog wat langer kneden.',
        optimal: 'Dun uitrekbaar, licht schijnt erdoor: glutennetwerk is volledig.',
      },
    },
  },
  {
    id: 'bulk',
    name: 'Bulkfermentatie',
    description: 'De eerste rijs: het deeg fermenteert en ontwikkelt smaak en structuur.',
    instructions: [
      'Plaats het deeg in een doorzichtige bak met markering',
      'Dek af (vochtige doek of deksel)',
      'Voer stretch & folds uit (zie volgende stap)',
      'Let op volumetoename en bellvorming',
    ],
    baseDurationMinutes: 300,
    referenceTempC: 24,
    usesQ10: true,
    expectedProperties: [
      'Geleidelijke volumetoename',
      'Luchtbellen zichtbaar aan de zijkant',
      'Glad, luchtig oppervlak',
      'Jiggly beweging als je de bak beweegt',
      'Licht zure geur',
    ],
  },
  {
    id: 'stretch_fold',
    name: 'Rek & Vouw',
    description: 'Versterk het glutennetwerk zonder agressief kneden.',
    instructions: [
      'Pak een zijde van het deeg, rek omhoog en vouw over',
      'Draai de bak 90° en herhaal (4 zijden = 1 set)',
      'Herhaal elke 30 minuten, 4-6 sets',
      'Stop als het deeg glad en strak is',
    ],
    baseDurationMinutes: 30,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Deeg wordt strakker na elke set',
      'Meer weerstand bij het rekken',
      'Houdt zijn vorm beter op het werkblad',
    ],
  },
  {
    id: 'voorvormen',
    name: 'Voorvormen',
    description: 'Geef het deeg een eerste vorm om spanning op te bouwen.',
    instructions: [
      'Stort het deeg op een licht bebloemd werkblad',
      'Vouw de zijden naar het midden',
      'Keer het deeg om (naad onder)',
      'Duw met je handpalmen om spanning te creëren',
    ],
    baseDurationMinutes: 5,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Rond, strak bolletje',
      'Gladde bovenkant met oppervlaktespanning',
    ],
  },
  {
    id: 'bankrust',
    name: 'Bankrust',
    description: 'Laat het deeg rusten zodat het gluten ontspant.',
    instructions: [
      'Laat het voorgevormde deeg 20-30 minuten onbedekt rusten',
      'Het deeg zal iets uitspreiden - dat is normaal',
    ],
    baseDurationMinutes: 25,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Deeg is iets uitgespreid maar houdt nog vorm',
      'Makkelijker te vormen dan voor de rust',
    ],
  },
  {
    id: 'eindvormen',
    name: 'Eindvormen',
    description: 'Definitieve vorm: batard, boule of in bakvorm.',
    instructions: [
      'Draai het deeg om (gladde kant onder)',
      'Vouw de zijden strak naar het midden',
      'Rol op tot een strakke cilinder (batard) of bol (boule)',
      'Leg met de naad omhoog in een rijsmandje met rijsmeel',
    ],
    baseDurationMinutes: 10,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Strakke oppervlaktespanning',
      'Gladde bovenkant',
      'Houdt zijn vorm als je het optilt',
    ],
  },
  {
    id: 'koude_rijs',
    name: 'Koude Rijs',
    description: 'Retardatie in de koelkast voor smaakvorming.',
    instructions: [
      'Dek het rijsmandje af met folie of een plastic zak',
      'Plaats in de koelkast (3-4°C)',
      'Minimaal 8 uur, tot 24 uur voor maximale smaak',
      'Je kunt direct vanuit de koelkast bakken',
    ],
    baseDurationMinutes: 720,
    referenceTempC: 4,
    usesQ10: true,
    expectedProperties: [
      'Stevig, koud deeg',
      'Lichte stijging zichtbaar',
      'Complexe, zure geur',
      'Deeg laat los van het mandje',
    ],
    physicalTest: {
      name: 'Poke Test',
      description: 'Duw zacht met een bebloemde vinger in het deeg.',
      science: 'De Laplace-druk in de gasbellen is in evenwicht met de elasticiteit van de deegwanden. Langzaam herstel wijst op optimale fermentatie.',
      outcomes: {
        underfermented: 'Veert direct volledig terug: te elastisch, langer laten fermenteren.',
        optimal: 'Veert langzaam en gedeeltelijk terug (~10 sec): balans tussen gasdruk en glutenstructuur.',
        overfermented: 'Geen herstel, deeg zakt in: glutenmatrix is te ver afgebroken.',
      },
    },
  },
  {
    id: 'bakken_stoom',
    name: 'Bakken (stoom)',
    description: 'Eerste fase: bakken met stoom voor maximale ovenspring.',
    instructions: [
      'Verwarm de oven voor op 250°C met de Dutch oven erin',
      'Score het deeg met een scherp mes of lame',
      'Leg het deeg in de hete Dutch oven',
      'Sluit het deksel (creëert stoom)',
      'Bak 20 minuten met deksel',
    ],
    baseDurationMinutes: 20,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Explosieve ovenspring in eerste 10 minuten (Wet van Charles)',
      'Score opent wijd ("ear" vormt)',
      'Deeg zet flink uit',
    ],
  },
  {
    id: 'bakken_droog',
    name: 'Bakken (droog)',
    description: 'Tweede fase: korst vormen via Maillard-reactie.',
    instructions: [
      'Verwijder het deksel van de Dutch oven',
      'Verlaag temperatuur naar 230°C',
      'Bak nog 20-25 minuten tot diep goudbruin',
      'Kerntemperatuur moet 96-98°C bereiken',
    ],
    baseDurationMinutes: 25,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Diep goudbruine tot donkerbruine korst (Maillard: 100-170°C)',
      'Hol geluid bij kloppen op de bodem',
      'Kerntemperatuur 96-98°C (fixatie)',
    ],
  },
  {
    id: 'afkoelen',
    name: 'Afkoelen',
    description: 'Laat het brood volledig afkoelen voor de definitieve textuur.',
    instructions: [
      'Plaats het brood op een rooster',
      'NIET aansnijden gedurende minimaal 1 uur!',
      'Laat volledig afkoelen (2-3 uur ideaal)',
    ],
    baseDurationMinutes: 120,
    referenceTempC: null,
    usesQ10: false,
    expectedProperties: [
      'Tikkende/krakende geluiden (korst krimpt)',
      'Vocht migreert van kruim naar korst',
      'Zetmeelretrogradatie: amylose kristalliseert, textuur wordt stevig',
      'Na volledig afkoelen: kruim is "gezet"',
    ],
  },
];

/**
 * Calculates the complete process timeline from a recipe config.
 * Returns an array of ActiveStage objects with calculated durations and start times.
 */
export function calculateProcessTimeline(config: RecipeConfig): ActiveStage[] {
  const stages: ActiveStage[] = [];
  let currentTime = Date.now();

  for (const def of stageDefinitions) {
    let durationMinutes = def.baseDurationMinutes;

    if (def.usesQ10 && def.referenceTempC !== null) {
      const temp = def.id === 'koude_rijs' ? 4 : config.roomTempC;
      durationMinutes = calculateFermentationTime(durationMinutes, def.referenceTempC, temp);

      // Apply levain-specific logic
      if (def.id === 'levain') {
        durationMinutes = levainPeakTimeMinutes(config.feedingRatio, config.roomTempC);
      }

      // Apply corrections for bulk fermentation
      if (def.id === 'bulk') {
        durationMinutes = inoculationCorrection(durationMinutes, config.starterPercent);
        durationMinutes *= starterStrengthMultiplier(config.starterStrength);
        durationMinutes = saltCorrection(durationMinutes, config.saltPercent);
        durationMinutes *= flourCorrection(config.flourType);
      }
    }

    // Skip koude_rijs for warm route
    if (def.id === 'koude_rijs' && config.route === 'warm') {
      continue;
    }

    const durationMs = Math.round(durationMinutes * 60 * 1000);

    stages.push({
      id: def.id,
      name: def.name,
      startTime: currentTime,
      calculatedDurationMs: durationMs,
      actualTempC: def.usesQ10 ? config.roomTempC : null,
      completedAt: null,
      ...(def.id === 'stretch_fold' ? { stretchFoldCount: 0 } : {}),
    });

    currentTime += durationMs;
  }

  return stages;
}

/**
 * Recalculates remaining stages after a temperature change.
 * Only affects stages that haven't started yet.
 */
export function recalculateFromStage(
  stages: ActiveStage[],
  fromIndex: number,
  newTempC: number,
  config: RecipeConfig,
): ActiveStage[] {
  const updatedConfig = { ...config, roomTempC: newTempC };
  const newTimeline = calculateProcessTimeline(updatedConfig);

  return stages.map((stage, i) => {
    if (i < fromIndex || stage.completedAt !== null) return stage;

    const newStage = newTimeline.find(s => s.id === stage.id);
    if (!newStage) return stage;

    const prevStage = i > 0 ? stages[i - 1] : null;
    const startTime = prevStage
      ? (prevStage.completedAt ?? prevStage.startTime + prevStage.calculatedDurationMs)
      : stage.startTime;

    return {
      ...stage,
      startTime,
      calculatedDurationMs: newStage.calculatedDurationMs,
      actualTempC: newTempC,
    };
  });
}

export function getStageDefinition(id: StageId): StageDefinition | undefined {
  return stageDefinitions.find(s => s.id === id);
}
