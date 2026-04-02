import { useState } from 'react';
import type { RecipeConfig, ProcessRoute, StarterStrength, FeedingRatio } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { presetBlends, calculateBlendAmounts, effectiveFlourType, type FlourBlend } from '@/data/flourBlends';
import { calculateWaterTemperature, estimateFlourTemp } from '@/models/temperature';
import { calculateProcessTimeline } from '@/models/stages';
import { useBread } from '@/context/BreadContext';
import type { Overlay } from '@/App';

// Enriched recipe display data
const recipeCards: Array<{
  index: number; emoji: string; title: string; subtitle: string;
  tags: string[]; time: string;
}> = [
  { index: 0, emoji: '🌾', title: 'Landbrood', subtitle: 'Klassiek Frans, licht rogge-accent. Snelle warme methode.', tags: ['Beginner', 'Snel'], time: '~10u' },
  { index: 1, emoji: '🌙', title: 'Landbrood Nacht', subtitle: 'Zelfde recept, koude nacht-rijs. Diepere smaak.', tags: ['Populair', 'Complex'], time: '~20u' },
  { index: 2, emoji: '🎨', title: 'Drievoudig', subtitle: 'Drie meelsoorten: rijk, mineraalrijk, nootachtig.', tags: ['Gevorderd', 'Smaak'], time: '~20u' },
  { index: 3, emoji: '🏔️', title: 'Groot Brood', subtitle: 'Stevig, nootachtig brood. Jouw signature 50/40/10.', tags: ['1kg meel', 'Karakter'], time: '~20u' },
  { index: 4, emoji: '🌿', title: 'Spelt-Tarwe', subtitle: 'Nootachtig speltkarakter. Teer, luchtig kruim.', tags: ['Licht', 'Nootachtig'], time: '~20u' },
  { index: 5, emoji: '🌰', title: 'Volkoren', subtitle: 'Stevig volkorenbrood. Voedzaam, vol smaak.', tags: ['Gezond', 'Stevig'], time: '~20u' },
];

const breadSizes = [
  { label: '1 brood', desc: 'Standaard rond brood (~800g)', flourGrams: 500, icon: '🍞' },
  { label: '1 groot brood', desc: 'Miche-formaat (~1.2kg)', flourGrams: 750, icon: '🥖' },
  { label: '2 broden', desc: 'Twee broden of batards (~1.6kg)', flourGrams: 1000, icon: '🍞🍞' },
];

export function SetupWizard({ onNavigate }: { onNavigate?: (overlay: Overlay) => void }) {
  const { dispatch } = useBread();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<RecipeConfig>(presetRecipes[1]);

  const update = (partial: Partial<RecipeConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const selectedBlend = presetBlends.find(b => b.id === config.flourBlendId);
  const waterTemp = calculateWaterTemperature(config.targetDDT, config.roomTempC, estimateFlourTemp(config.roomTempC), 6, config.roomTempC);
  const timeline = calculateProcessTimeline(config);
  const totalMinutes = timeline.reduce((sum, s) => sum + s.calculatedDurationMs / 60000, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  const blendAmounts = selectedBlend
    ? calculateBlendAmounts(selectedBlend, config.totalFlourGrams)
    : [{ label: config.flourType, flourType: config.flourType, grams: config.totalFlourGrams }];
  const waterGrams = Math.round(config.totalFlourGrams * config.hydrationPercent / 100);
  const starterGrams = Math.round(config.totalFlourGrams * config.starterPercent / 100);
  const saltGrams = Math.round(config.totalFlourGrams * config.saltPercent / 100 * 10) / 10;
  const totalDoughGrams = config.totalFlourGrams + waterGrams + starterGrams + saltGrams;
  const breadWeightGrams = Math.round(totalDoughGrams * 0.85); // ~15% bake loss

  const selectBlend = (blend: FlourBlend) => {
    update({ flourBlendId: blend.id, flourType: effectiveFlourType(blend), hydrationPercent: blend.suggestedHydration });
  };

  const startProcess = () => dispatch({ type: 'START_PROCESS', config });
  const totalSteps = 6;
  const stepTitles = ['Recept', 'Hoeveelheid', 'Meelmengsel', 'Starter', 'Instelling', 'Samenvatting'];

  const steps = [
    // ========== STEP 0: RECEPT — Square tiles ==========
    <div key="recept" className="space-y-5">
      <Hint>Kies een recept als vertrekpunt. Alles is daarna aanpasbaar.</Hint>
      <div className="grid grid-cols-2 gap-3">
        {recipeCards.map((rc) => {
          const recipe = presetRecipes[rc.index];
          const isSelected = config.name === recipe.name;
          return (
            <button key={rc.index}
              onClick={() => { setConfig(recipe); setStep(1); }}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all min-h-[160px] flex flex-col justify-between ${
                isSelected
                  ? 'border-bread-400 bg-bread-50 shadow-md'
                  : 'border-warm-200 bg-white hover:shadow-md hover:border-warm-300'
              }`}>
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-bread-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">&#10003;</span>
                </div>
              )}
              <div>
                <div className="text-2xl mb-2">{rc.emoji}</div>
                <div className="font-bold text-warm-800 text-[15px] leading-tight">{rc.title}</div>
                <div className="text-warm-400 text-[12px] mt-1 leading-snug">{rc.subtitle}</div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {rc.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-warm-100 text-warm-500 px-1.5 py-0.5 rounded-md font-medium">{tag}</span>
                ))}
                <span className="text-[10px] bg-olive-50 text-olive-600 px-1.5 py-0.5 rounded-md font-medium">{rc.time}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>,

    // ========== STEP 1: HOEVEELHEID — Bread count/weight ==========
    <div key="hoeveel" className="space-y-5">
      <Hint>Hoeveel brood wil je bakken? Het meelgewicht wordt automatisch berekend.</Hint>
      <div className="space-y-3">
        {breadSizes.map((size) => {
          const isSelected = config.totalFlourGrams === size.flourGrams;
          return (
            <button key={size.flourGrams}
              onClick={() => update({ totalFlourGrams: size.flourGrams })}
              className={`w-full rounded-2xl border-2 p-5 text-left transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-bread-400 bg-bread-50 shadow-md'
                  : 'border-warm-200 bg-white hover:shadow-md'
              }`}>
              <div className="text-3xl">{size.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-warm-800 text-[16px]">{size.label}</div>
                <div className="text-warm-400 text-[13px] mt-0.5">{size.desc}</div>
                <div className="text-olive-600 text-[12px] mt-1 font-medium">{size.flourGrams}g meel nodig</div>
              </div>
              {isSelected && (
                <div className="w-7 h-7 bg-bread-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">&#10003;</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <InfoCard>
        Met <strong>{config.totalFlourGrams}g meel</strong> en {config.hydrationPercent}% hydratie
        krijg je ongeveer <strong>{breadWeightGrams}g brood</strong> uit de oven (na ~15% gewichtsverlies bij het bakken).
      </InfoCard>
    </div>,

    // ========== STEP 2: MEELMENGSEL ==========
    <div key="blend" className="space-y-4">
      <Hint>
        Kies de samenstelling van je meel. Het <strong>T-nummer</strong> is de maalgraad:
        hoe hoger, hoe meer zemelen en smaak. T65 = wit, T80 = halfgrof, T150 = volkoren.
      </Hint>
      <div className="space-y-2.5">
        {presetBlends.map((blend) => {
          const isSelected = config.flourBlendId === blend.id;
          return (
            <button key={blend.id} onClick={() => selectBlend(blend)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-bread-400 bg-bread-50 shadow-md'
                  : 'border-warm-200 bg-white hover:shadow-md'
              }`}>
              <div className="flex items-start justify-between">
                <div className="font-bold text-warm-800 text-[15px]">{blend.name}</div>
                {isSelected && (
                  <div className="w-6 h-6 bg-bread-400 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <span className="text-white text-xs">&#10003;</span>
                  </div>
                )}
              </div>
              <div className="text-warm-400 mt-1 text-[13px] leading-snug">{blend.description}</div>
              {blend.notes && <div className="text-olive-500 mt-1 text-[12px] italic">{blend.notes}</div>}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-bread-200 text-[12px] text-bread-700">
                  {calculateBlendAmounts(blend, config.totalFlourGrams).map(a => `${a.grams}g ${a.label}`).join(' + ')}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>,

    // ========== STEP 3: STARTER — With explanations + grams ==========
    <div key="starter" className="space-y-6">
      <Hint>
        Je starter (desem/moederdeeg) is de motor van het proces. De <strong>sterkte</strong> bepaalt
        hoe actief de gisten en bacteriën zijn — en dus hoe snel je deeg rijst.
      </Hint>
      <div>
        <Label>Hoe actief is je starter nu?</Label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen, weinig bellen', 'Pas gevoerd of lang niet gebruikt'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, wat bellen zichtbaar', 'Een paar uur na voeren'],
            ['sterk', 'Sterk', 'Duidelijk gerezen, veel bellen', 'Op zijn actiefst, klaar voor gebruik'],
            ['piek', 'Piek', 'Net over de top, licht ingevallen', 'Gebruik direct, wacht niet langer'],
          ] as const).map(([value, label, desc, when]) => {
            const isSelected = config.starterStrength === value;
            return (
              <button key={value} onClick={() => update({ starterStrength: value as StarterStrength })}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-warm-800 text-[15px]">{label}</span>
                  {isSelected && <span className="text-bread-500">&#10003;</span>}
                </div>
                <div className="text-warm-400 text-[12px] mt-1 leading-snug">{desc}</div>
                <div className="text-olive-500 text-[11px] mt-1 italic">{when}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>
          Hoeveel starter gebruik je?
          <span className="font-normal text-warm-400 ml-1">
            {config.starterPercent}% = <strong className="text-bread-500">{starterGrams}g</strong>
          </span>
        </Label>
        <Hint>
          Meer starter = sneller rijzen. Minder = meer smaak maar langer wachten.
          15-20% is standaard.
        </Hint>
        <input type="range" min={5} max={30} step={1} value={config.starterPercent}
          onChange={e => update({ starterPercent: Number(e.target.value) })} className="w-full mt-2" />
        <div className="flex justify-between text-warm-400 text-[12px] mt-1">
          <span>5% (langzaam, meer smaak)</span>
          <span>30% (snel, milder)</span>
        </div>
      </div>

      <div>
        <Label>Voedingsratio levain</Label>
        <Hint>
          De ratio starter:meel:water voor je levain-build.
          Hogere ratio's (1:5:5, 1:10:10) geven de gisten meer voedsel en langere piektijd.
        </Hint>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {([
            ['1:1:1', 'Snel'],
            ['1:2:2', 'Normaal'],
            ['1:5:5', 'Standaard'],
            ['1:10:10', 'Langzaam'],
          ] as const).map(([ratio, hint]) => {
            const isSelected = config.feedingRatio === ratio;
            return (
              <button key={ratio} onClick={() => update({ feedingRatio: ratio as FeedingRatio })}
                className={`rounded-2xl border-2 py-3 text-center transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="font-mono font-bold text-[13px] text-warm-800">{ratio}</div>
                <div className="text-[10px] text-warm-400 mt-0.5">{hint}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,

    // ========== STEP 4: INSTELLING — Route, temp, hydration with WHY ==========
    <div key="instelling" className="space-y-6">
      <div>
        <Label>Rijsmethode</Label>
        <Hint>Dit bepaalt het smaakprofiel van je brood en hoeveel tijd je nodig hebt.</Hint>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {([
            ['warm', '☀️', 'Warme rijs', 'Rijst op kamertemperatuur. Sneller klaar, milder zuurprofiel met meer melkzuur.',
             'Ideaal als je dezelfde dag wilt bakken.'],
            ['koud', '🌙', 'Koude nacht-rijs', 'Gaat na vormen 8-16u de koelkast in. Meer azijnzuur, dieper, complexer aroma.',
             'Start overdag, bak de volgende ochtend.'],
          ] as const).map(([value, icon, label, desc, when]) => {
            const isSelected = config.route === value;
            return (
              <button key={value}
                onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
                className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-warm-800 text-[16px]">{label}</span>
                      {isSelected && <span className="text-bread-500 text-lg">&#10003;</span>}
                    </div>
                    <div className="text-warm-500 text-[13px] mt-1 leading-snug">{desc}</div>
                    <div className="text-olive-500 text-[12px] mt-1 italic">{when}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Kamertemperatuur: <strong className="text-bread-500">{config.roomTempC}°C</strong></Label>
        <Hint>
          Warmte versnelt fermentatie. Elke 5°C boven 20°C halveert de rijstijd (Q10-model).
        </Hint>
        <input type="range" min={16} max={32} step={1} value={config.roomTempC}
          onChange={e => update({ roomTempC: Number(e.target.value) })} className="w-full mt-2" />
        <div className="flex justify-between text-warm-400 text-[12px] mt-1"><span>16°C koel</span><span>32°C warm</span></div>
      </div>

      {/* Water temp result */}
      <div className="rounded-2xl border-2 border-lav-200 bg-lav-50 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-lav-200 flex items-center justify-center text-xl flex-shrink-0">&#127777;</div>
        <div>
          <div className="text-lav-600 text-[12px] font-medium">Aanbevolen watertemperatuur</div>
          <div className="text-3xl font-bold text-lav-700">{Math.round(waterTemp)}°C</div>
        </div>
      </div>

      <div>
        <Label>Hydratie: <strong className="text-bread-500">{config.hydrationPercent}%</strong>
          <span className="font-normal text-warm-400 ml-1">= {waterGrams}g water</span>
        </Label>
        <Hint>
          Hoeveel water t.o.v. meel. <strong>65-70%</strong>: stevig, makkelijk te vormen.
          <strong> 72-76%</strong>: open kruim, meer smaak.
          <strong> 78%+</strong>: heel open kruim, moeilijker te hanteren.
        </Hint>
        <input type="range" min={60} max={90} step={1} value={config.hydrationPercent}
          onChange={e => update({ hydrationPercent: Number(e.target.value) })} className="w-full mt-2" />
        <div className="flex justify-between text-warm-400 text-[12px] mt-1"><span>60% stevig</span><span>90% heel open</span></div>
      </div>
    </div>,

    // ========== STEP 5: SAMENVATTING — Visual ==========
    <div key="summary" className="space-y-4">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-olive-500 to-olive-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-olive-200 text-[12px] font-medium uppercase tracking-wider">Klaar om te bakken</div>
            <div className="text-2xl font-bold mt-1">{config.name}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{totalHours}</div>
            <div className="text-olive-200 text-[13px]">uur totaal</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <SummaryPill>{config.route === 'koud' ? '🌙 Koude rijs' : '☀️ Warm'}</SummaryPill>
          <SummaryPill>{config.hydrationPercent}% hydratie</SummaryPill>
          <SummaryPill>{config.roomTempC}°C</SummaryPill>
          <SummaryPill>{timeline.length} stappen</SummaryPill>
        </div>
      </div>

      {/* Ingredients — visual */}
      <div className="rounded-2xl border-2 border-warm-200 bg-white p-5">
        <div className="text-[11px] text-warm-400 uppercase tracking-wider font-bold mb-3">Ingrediënten</div>
        <div className="space-y-3">
          {/* Flour */}
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-warm-600 font-medium text-[14px]">Meel</span>
              <span className="font-mono font-bold text-warm-800 text-[14px]">{config.totalFlourGrams}g</span>
            </div>
            <div className="mt-1 h-3 bg-warm-100 rounded-full overflow-hidden">
              <div className="h-full bg-bread-300 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="text-[11px] text-warm-400 mt-1">
              {blendAmounts.map(a => `${a.grams}g ${a.label}`).join(' · ')}
            </div>
          </div>
          {/* Water */}
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-warm-600 font-medium text-[14px]">Water ({config.hydrationPercent}%)</span>
              <span className="font-mono font-bold text-warm-800 text-[14px]">{waterGrams}g</span>
            </div>
            <div className="mt-1 h-3 bg-warm-100 rounded-full overflow-hidden">
              <div className="h-full bg-lav-300 rounded-full" style={{ width: `${config.hydrationPercent}%` }} />
            </div>
            <div className="text-[11px] text-warm-400 mt-1">op {Math.round(waterTemp)}°C</div>
          </div>
          {/* Starter */}
          <div className="flex justify-between items-baseline">
            <span className="text-warm-600 font-medium text-[14px]">Starter ({config.starterPercent}%)</span>
            <span className="font-mono font-bold text-warm-800 text-[14px]">{starterGrams}g</span>
          </div>
          {/* Salt */}
          <div className="flex justify-between items-baseline">
            <span className="text-warm-600 font-medium text-[14px]">Zout ({config.saltPercent}%)</span>
            <span className="font-mono font-bold text-warm-800 text-[14px]">{saltGrams}g</span>
          </div>
          <div className="pt-2 border-t border-warm-100 flex justify-between items-baseline">
            <span className="text-warm-800 font-bold text-[14px]">Totaal deeg</span>
            <span className="font-mono font-bold text-warm-800 text-[16px]">{totalDoughGrams}g</span>
          </div>
          <div className="flex justify-between items-baseline text-[13px]">
            <span className="text-olive-600">Verwacht broodgewicht</span>
            <span className="font-bold text-olive-700">~{breadWeightGrams}g</span>
          </div>
        </div>
      </div>

      {/* Settings compact */}
      <div className="rounded-2xl border-2 border-warm-200 bg-white p-5">
        <div className="text-[11px] text-warm-400 uppercase tracking-wider font-bold mb-3">Instellingen</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <SettingRow label="Mengsel" value={selectedBlend?.name ?? config.flourType} />
          <SettingRow label="Voedingsratio" value={config.feedingRatio} />
          <SettingRow label="Starter" value={`${config.starterPercent}% · ${config.starterStrength}`} />
          <SettingRow label="Kamertemp" value={`${config.roomTempC}°C`} />
        </div>
      </div>

      {/* Timeline visual */}
      <div className="rounded-2xl border-2 border-warm-200 bg-white p-5">
        <div className="text-[11px] text-warm-400 uppercase tracking-wider font-bold mb-3">Tijdlijn</div>
        <div className="space-y-0">
          {timeline.map((stage, i) => {
            const min = Math.round(stage.calculatedDurationMs / 60000);
            const h = Math.floor(min / 60);
            const m = min % 60;
            const isLong = min >= 60;
            return (
              <div key={stage.id} className="flex items-center gap-3 py-2 border-b border-warm-100 last:border-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  isLong ? 'bg-olive-100 text-olive-700' : 'bg-warm-100 text-warm-500'
                }`}>{i + 1}</div>
                <span className="text-warm-700 text-[14px] flex-1">{stage.name}</span>
                <span className={`font-mono text-[13px] ${isLong ? 'text-olive-600 font-semibold' : 'text-warm-400'}`}>
                  {h > 0 ? `${h}u ${m}m` : `${m}m`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-warm-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-warm-50/95 backdrop-blur-xl border-b border-warm-200/60 safe-top">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">&#127838;</span>
              <span className="text-xl font-bold text-warm-800">Desem</span>
            </div>
            <div className="flex gap-2">
              {([
                ['Advies', 'advisor'],
                ['Voorraad', 'inventory'],
                ['Log', 'history'],
              ] as const).map(([label, key]) => (
                <button key={key} onClick={() => onNavigate?.(key as Overlay)}
                  className="px-3 py-1.5 bg-white border border-warm-200 rounded-xl text-[12px] font-semibold text-warm-500 hover:border-bread-300 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-warm-700 whitespace-nowrap">
              {step + 1}/{totalSteps}
            </span>
            <div className="flex-1 h-2.5 bg-warm-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-bread-300 to-bread-400 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
            </div>
            <span className="text-[12px] text-warm-400 whitespace-nowrap">{stepTitles[step]}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4" style={{ paddingBottom: '200px' }}>
        <h2 className="text-[22px] font-bold text-warm-800 mb-3">{stepTitles[step]}</h2>
        {steps[step]}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-[430px] mx-auto px-5 py-4 bg-warm-50/95 backdrop-blur-xl border-t border-warm-200/60">
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-5 min-h-[52px] rounded-2xl bg-white border-2 border-warm-200 text-warm-600 font-bold text-[15px]">
                Terug
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="flex-1 min-h-[52px] rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-[17px] shadow-[var(--shadow-button)]">
                Volgende
              </button>
            ) : (
              <button onClick={startProcess}
                className="flex-1 min-h-[56px] rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-[18px] shadow-[var(--shadow-elevated)]">
                &#127838; Start Bakproces
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// === Helper components ===

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-warm-800 font-bold text-[15px]">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-warm-400 text-[13px] leading-relaxed">{children}</p>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-olive-50 border border-olive-200 p-4 text-[13px] text-olive-700 leading-relaxed">
      {children}
    </div>
  );
}

function SummaryPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] bg-white/20 text-white px-2.5 py-1 rounded-lg font-medium">
      {children}
    </span>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1">
      <div className="text-[11px] text-warm-400">{label}</div>
      <div className="font-medium text-warm-700 text-[13px]">{value}</div>
    </div>
  );
}
