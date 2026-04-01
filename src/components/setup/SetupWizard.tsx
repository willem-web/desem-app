import { useState } from 'react';
import type { RecipeConfig, ProcessRoute, StarterStrength, FeedingRatio } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { presetBlends, calculateBlendAmounts, effectiveFlourType, type FlourBlend } from '@/data/flourBlends';
import { calculateWaterTemperature, estimateFlourTemp } from '@/models/temperature';
import { calculateProcessTimeline } from '@/models/stages';
import { useBread } from '@/context/BreadContext';

type Overlay = 'none' | 'history' | 'advisor' | 'inventory';

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

  const selectBlend = (blend: FlourBlend) => {
    update({ flourBlendId: blend.id, flourType: effectiveFlourType(blend), hydrationPercent: blend.suggestedHydration });
  };

  const startProcess = () => dispatch({ type: 'START_PROCESS', config });
  const stepTitles = ['Recept', 'Mengsel', 'Starter', 'Instelling', 'Start'];

  const steps = [
    // === STEP 0: RECIPE ===
    <div key="preset" className="space-y-3">
      <p className="text-warm-500">Kies een recept als startpunt. Je kunt alles nog aanpassen.</p>
      {presetRecipes.map((recipe) => {
        const blend = presetBlends.find(b => b.id === recipe.flourBlendId);
        const isSelected = config.name === recipe.name;
        return (
          <button key={recipe.name} onClick={() => { setConfig(recipe); setStep(1); }}
            className={`card w-full text-left transition-all ${isSelected ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300' : 'hover:border-bread-300'}`}>
            <div className="font-bold text-warm-800">{recipe.name}</div>
            {blend && (
              <div className="text-warm-500 mt-1">
                {blend.components.map(c => `${c.percentage}% ${c.flourType}`).join(' / ')}
                {' '}&middot;{' '}{recipe.hydrationPercent}% hydratie
              </div>
            )}
          </button>
        );
      })}
    </div>,

    // === STEP 1: FLOUR BLEND ===
    <div key="blend" className="space-y-4">
      <div>
        <Label>Totaal meelgewicht</Label>
        <div className="flex gap-2 mt-2">
          {[500, 750, 1000].map(g => (
            <button key={g} onClick={() => update({ totalFlourGrams: g })}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                config.totalFlourGrams === g
                  ? 'bg-bread-500 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>{g}g</button>
          ))}
        </div>
      </div>

      <Label>Kies een meelmengsel</Label>
      <div className="space-y-2">
        {presetBlends.map((blend) => {
          const isSelected = config.flourBlendId === blend.id;
          return (
            <button key={blend.id} onClick={() => selectBlend(blend)}
              className={`card w-full text-left transition-all ${isSelected ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300' : 'hover:border-bread-300'}`}>
              <div className="font-bold text-warm-800">{blend.name}</div>
              <div className="text-warm-500 mt-0.5">{blend.description}</div>
              {blend.notes && <div className="text-bread-600 mt-1 italic">{blend.notes}</div>}
            </button>
          );
        })}
      </div>
    </div>,

    // === STEP 2: STARTER ===
    <div key="starter" className="space-y-6">
      <div>
        <Label>Hoe actief is je starter?</Label>
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, bellen'],
            ['sterk', 'Sterk', 'Goed gerezen, actief'],
            ['piek', 'Piek', 'Op de top, koepelvormig'],
          ] as const).map(([value, label, desc]) => (
            <button key={value} onClick={() => update({ starterStrength: value as StarterStrength })}
              className={`p-4 rounded-xl border text-left transition-all ${
                config.starterStrength === value
                  ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300'
                  : 'border-warm-200 bg-white hover:border-bread-300'
              }`}>
              <div className="font-bold text-warm-800">{label}</div>
              <div className="text-warm-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Starterpercentage: <strong className="text-bread-600">{config.starterPercent}%</strong></Label>
        <input type="range" min={5} max={30} step={1} value={config.starterPercent}
          onChange={e => update({ starterPercent: Number(e.target.value) })} className="w-full mt-3" />
        <div className="flex justify-between text-warm-400 mt-1"><span>5% langzaam</span><span>30% snel</span></div>
      </div>

      <div>
        <Label>Voedingsratio levain</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {(['1:1:1', '1:2:2', '1:5:5', '1:10:10'] as FeedingRatio[]).map(ratio => (
            <button key={ratio} onClick={() => update({ feedingRatio: ratio })}
              className={`py-3 rounded-xl font-mono font-bold transition-all ${
                config.feedingRatio === ratio
                  ? 'bg-bread-500 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>{ratio}</button>
          ))}
        </div>
      </div>
    </div>,

    // === STEP 3: TEMPERATURE & ROUTE ===
    <div key="temp" className="space-y-6">
      <div>
        <Label>Route</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {([
            ['warm', 'Warm', 'Snel, milder profiel'],
            ['koud', 'Koude Rijs', 'Diep, complex aroma'],
          ] as const).map(([value, label, desc]) => (
            <button key={value}
              onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
              className={`p-4 rounded-xl border text-left transition-all ${
                config.route === value
                  ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300'
                  : 'border-warm-200 bg-white hover:border-bread-300'
              }`}>
              <div className="font-bold text-warm-800">{label}</div>
              <div className="text-warm-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Kamertemperatuur: <strong className="text-bread-600">{config.roomTempC}°C</strong></Label>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => update({ roomTempC: Math.max(16, config.roomTempC - 1) })}
            className="w-12 h-12 rounded-xl bg-white border border-warm-200 font-bold text-xl text-warm-600 shadow-[var(--shadow-button)]">−</button>
          <input type="range" min={16} max={32} step={1} value={config.roomTempC}
            onChange={e => update({ roomTempC: Number(e.target.value) })} className="flex-1" />
          <button onClick={() => update({ roomTempC: Math.min(32, config.roomTempC + 1) })}
            className="w-12 h-12 rounded-xl bg-white border border-warm-200 font-bold text-xl text-warm-600 shadow-[var(--shadow-button)]">+</button>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200 flex items-center gap-3">
        <span className="text-2xl">&#127777;</span>
        <div>
          <div className="text-blue-600">Watertemperatuur</div>
          <div className="text-2xl font-bold text-blue-800">{Math.round(waterTemp)}°C</div>
        </div>
      </div>

      <div>
        <Label>Hydratie: <strong className="text-bread-600">{config.hydrationPercent}%</strong></Label>
        <input type="range" min={60} max={90} step={1} value={config.hydrationPercent}
          onChange={e => update({ hydrationPercent: Number(e.target.value) })} className="w-full mt-3" />
        <div className="flex justify-between text-warm-400 mt-1"><span>60% stevig</span><span>90% open kruim</span></div>
      </div>
    </div>,

    // === STEP 4: SUMMARY ===
    <div key="summary" className="space-y-4">
      {/* Ingredients */}
      <div className="card">
        <SectionTitle>Ingrediënten</SectionTitle>
        <div className="space-y-2 mt-3">
          <div className="text-warm-400 uppercase tracking-wider text-[11px] font-semibold">Meel — {config.totalFlourGrams}g</div>
          {blendAmounts.map((a, i) => <IngRow key={i} label={a.label} value={`${a.grams}g`} />)}
          <div className="h-px bg-warm-100 my-1" />
          <IngRow label="Water" value={`${waterGrams}g`} />
          <IngRow label="Actieve starter" value={`${starterGrams}g`} />
          <IngRow label="Zout" value={`${saltGrams}g`} />
        </div>
      </div>

      {/* Time */}
      <div className="card bg-gradient-to-br from-bread-500 to-bread-700 border-bread-600 text-white">
        <div className="text-bread-200">Geschatte totale tijd</div>
        <div className="text-4xl font-bold mt-1">{totalHours} uur</div>
        <div className="text-bread-200 mt-1">
          {timeline.length} stappen &middot; {config.route === 'koud' ? 'incl. koude rijs' : 'zonder koude rijs'}
        </div>
      </div>

      {/* Settings */}
      <div className="card space-y-1">
        <SettingRow label="Route" value={config.route === 'warm' ? 'Warm' : 'Koude Rijs'} />
        <SettingRow label="Mengsel" value={selectedBlend?.name ?? config.flourType} />
        <SettingRow label="Hydratie" value={`${config.hydrationPercent}%`} />
        <SettingRow label="Starter" value={`${config.starterPercent}% · ${config.starterStrength}`} />
        <SettingRow label="Voedingsratio" value={config.feedingRatio} />
        <SettingRow label="Kamertemp" value={`${config.roomTempC}°C`} />
        <SettingRow label="Watertemp" value={`${Math.round(waterTemp)}°C`} />
      </div>

      {/* Timeline */}
      <div className="card space-y-1">
        <SectionTitle>Planning</SectionTitle>
        <div className="mt-2">
          {timeline.map((stage) => {
            const min = Math.round(stage.calculatedDurationMs / 60000);
            const h = Math.floor(min / 60);
            const m = min % 60;
            return (
              <div key={stage.id} className="flex justify-between py-2 border-b border-warm-100 last:border-0">
                <span className="text-warm-600">{stage.name}</span>
                <span className="font-mono text-warm-400">{h > 0 ? `${h}u ${m}m` : `${m}m`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header + nav pills */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-warm-200/50 safe-top">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">&#127838;</span>
              <span className="text-xl font-bold text-bread-700">Desem</span>
            </div>
            {/* Floating nav moved to header */}
            <div className="flex gap-1.5">
              {([
                ['Advies', 'advisor'],
                ['Voorraad', 'inventory'],
                ['Log', 'history'],
              ] as const).map(([label, key]) => (
                <button key={key} onClick={() => onNavigate?.(key as Overlay)}
                  className="px-2.5 py-1 bg-warm-100 rounded-full text-[11px] font-semibold text-warm-500 hover:bg-bread-100 hover:text-bread-600 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            {stepTitles.map((_, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-bread-500' : i === step ? 'bg-bread-400' : 'bg-warm-200'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-5 pb-32">
        <h2 className="text-2xl font-bold text-warm-800 mb-4">{stepTitles[step]}</h2>
        {steps[step]}
      </div>

      {/* Bottom buttons - LARGE */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-[430px] mx-auto px-5 py-4 bg-white/80 backdrop-blur-xl border-t border-warm-200/50">
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-6 py-4 rounded-2xl bg-white border-2 border-warm-200 text-warm-600 font-bold text-base shadow-[var(--shadow-button)] hover:border-bread-300 active:bg-warm-50">
                Terug
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-bread-500 to-bread-600 text-white font-bold text-lg shadow-[var(--shadow-button)] hover:from-bread-600 hover:to-bread-700 active:from-bread-700">
                Volgende
              </button>
            ) : (
              <button onClick={startProcess}
                className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-bread-600 to-bread-700 text-white font-bold text-xl shadow-[var(--shadow-elevated)] hover:from-bread-700 hover:to-bread-800 active:from-bread-800">
                Start Bakproces
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-warm-600 font-semibold">{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] uppercase tracking-wider text-warm-400 font-bold">{children}</h3>;
}

function IngRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-warm-700 font-medium">{label}</span>
      <span className="font-mono font-bold text-warm-800">{value}</span>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-warm-500">{label}</span>
      <span className="font-medium text-warm-700">{value}</span>
    </div>
  );
}
