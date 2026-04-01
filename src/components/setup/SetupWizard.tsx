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
    <div key="preset" className="space-y-4">
      <p className="text-warm-500 leading-relaxed">Kies een recept als startpunt. Je kunt alles nog aanpassen.</p>
      {presetRecipes.map((recipe) => {
        const blend = presetBlends.find(b => b.id === recipe.flourBlendId);
        const isSelected = config.name === recipe.name;
        return (
          <button key={recipe.name} onClick={() => { setConfig(recipe); setStep(1); }}
            className={`card w-full text-left transition-all ${isSelected ? 'border-bread-400 bg-bread-50 ring-2 ring-bread-300/40' : 'hover:shadow-[var(--shadow-card-hover)]'}`}>
            <div className="font-bold text-warm-800 text-[15px]">{recipe.name}</div>
            {blend && (
              <div className="text-warm-400 mt-1.5 text-[13px]">
                {blend.components.map(c => `${c.percentage}% ${c.flourType}`).join(' / ')}
                {' '}&middot;{' '}{recipe.hydrationPercent}% hydratie
              </div>
            )}
          </button>
        );
      })}
    </div>,

    // === STEP 1: FLOUR BLEND ===
    <div key="blend" className="space-y-5">
      <div>
        <Label>Totaal meelgewicht</Label>
        <div className="flex gap-3 mt-3">
          {[500, 750, 1000].map(g => (
            <button key={g} onClick={() => update({ totalFlourGrams: g })}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-[15px] transition-all ${
                config.totalFlourGrams === g
                  ? 'bg-bread-400 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>{g}g</button>
          ))}
        </div>
      </div>

      <Label>Kies een meelmengsel</Label>
      <div className="space-y-3">
        {presetBlends.map((blend) => {
          const isSelected = config.flourBlendId === blend.id;
          return (
            <button key={blend.id} onClick={() => selectBlend(blend)}
              className={`card w-full text-left transition-all ${isSelected ? 'border-bread-400 bg-bread-50 ring-2 ring-bread-300/40' : 'hover:shadow-[var(--shadow-card-hover)]'}`}>
              <div className="font-bold text-warm-800 text-[15px]">{blend.name}</div>
              <div className="text-warm-400 mt-1 text-[13px]">{blend.description}</div>
              {blend.notes && <div className="text-olive-500 mt-1.5 text-[13px] italic">{blend.notes}</div>}
            </button>
          );
        })}
      </div>
    </div>,

    // === STEP 2: STARTER ===
    <div key="starter" className="space-y-7">
      <div>
        <Label>Hoe actief is je starter?</Label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, bellen'],
            ['sterk', 'Sterk', 'Goed gerezen, actief'],
            ['piek', 'Piek', 'Op de top, koepelvormig'],
          ] as const).map(([value, label, desc]) => (
            <button key={value} onClick={() => update({ starterStrength: value as StarterStrength })}
              className={`p-5 rounded-2xl border text-left transition-all ${
                config.starterStrength === value
                  ? 'border-bread-400 bg-bread-50 ring-2 ring-bread-300/40'
                  : 'border-warm-200 bg-white hover:shadow-[var(--shadow-card-hover)]'
              }`}>
              <div className="font-bold text-warm-800">{label}</div>
              <div className="text-warm-400 mt-1 text-[13px]">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Starterpercentage: <strong className="text-bread-500">{config.starterPercent}%</strong></Label>
        <input type="range" min={5} max={30} step={1} value={config.starterPercent}
          onChange={e => update({ starterPercent: Number(e.target.value) })} className="w-full mt-3" />
        <div className="flex justify-between text-warm-400 text-[13px] mt-2"><span>5% langzaam</span><span>30% snel</span></div>
      </div>

      <div>
        <Label>Voedingsratio levain</Label>
        <div className="grid grid-cols-4 gap-2.5 mt-3">
          {(['1:1:1', '1:2:2', '1:5:5', '1:10:10'] as FeedingRatio[]).map(ratio => (
            <button key={ratio} onClick={() => update({ feedingRatio: ratio })}
              className={`py-3.5 rounded-2xl font-mono font-bold text-[14px] transition-all ${
                config.feedingRatio === ratio
                  ? 'bg-bread-400 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>{ratio}</button>
          ))}
        </div>
      </div>
    </div>,

    // === STEP 3: TEMPERATURE & ROUTE ===
    <div key="temp" className="space-y-7">
      <div>
        <Label>Route</Label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {([
            ['warm', 'Warm', 'Snel, milder profiel'],
            ['koud', 'Koude Rijs', 'Diep, complex aroma'],
          ] as const).map(([value, label, desc]) => (
            <button key={value}
              onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
              className={`p-5 rounded-2xl border text-left transition-all ${
                config.route === value
                  ? 'border-bread-400 bg-bread-50 ring-2 ring-bread-300/40'
                  : 'border-warm-200 bg-white hover:shadow-[var(--shadow-card-hover)]'
              }`}>
              <div className="font-bold text-warm-800">{label}</div>
              <div className="text-warm-400 mt-1 text-[13px]">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Kamertemperatuur: <strong className="text-bread-500">{config.roomTempC}°C</strong></Label>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => update({ roomTempC: Math.max(16, config.roomTempC - 1) })}
            className="w-12 h-12 rounded-2xl bg-white border border-warm-200 font-bold text-xl text-warm-600 shadow-[var(--shadow-button)]">−</button>
          <input type="range" min={16} max={32} step={1} value={config.roomTempC}
            onChange={e => update({ roomTempC: Number(e.target.value) })} className="flex-1" />
          <button onClick={() => update({ roomTempC: Math.min(32, config.roomTempC + 1) })}
            className="w-12 h-12 rounded-2xl bg-white border border-warm-200 font-bold text-xl text-warm-600 shadow-[var(--shadow-button)]">+</button>
        </div>
      </div>

      <div className="card bg-lav-50 border-lav-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lav-200 flex items-center justify-center text-xl">&#127777;</div>
          <div>
            <div className="text-lav-600 text-[13px] font-medium">Aanbevolen watertemperatuur</div>
            <div className="text-2xl font-bold text-lav-700">{Math.round(waterTemp)}°C</div>
          </div>
        </div>
      </div>

      <div>
        <Label>Hydratie: <strong className="text-bread-500">{config.hydrationPercent}%</strong></Label>
        <input type="range" min={60} max={90} step={1} value={config.hydrationPercent}
          onChange={e => update({ hydrationPercent: Number(e.target.value) })} className="w-full mt-3" />
        <div className="flex justify-between text-warm-400 text-[13px] mt-2"><span>60% stevig</span><span>90% open kruim</span></div>
      </div>
    </div>,

    // === STEP 4: SUMMARY ===
    <div key="summary" className="space-y-5">
      {/* Ingredients */}
      <div className="card">
        <SectionTitle>Ingrediënten</SectionTitle>
        <div className="space-y-2.5 mt-4">
          <div className="text-warm-400 uppercase tracking-wider text-[11px] font-semibold">Meel — {config.totalFlourGrams}g</div>
          {blendAmounts.map((a, i) => <IngRow key={i} label={a.label} value={`${a.grams}g`} />)}
          <div className="h-px bg-warm-100 my-2" />
          <IngRow label="Water" value={`${waterGrams}g`} />
          <IngRow label="Actieve starter" value={`${starterGrams}g`} />
          <IngRow label="Zout" value={`${saltGrams}g`} />
        </div>
      </div>

      {/* Time */}
      <div className="card bg-gradient-to-br from-olive-500 to-olive-700 border-olive-600 text-white">
        <div className="text-olive-200 text-[13px]">Geschatte totale tijd</div>
        <div className="text-4xl font-bold mt-1">{totalHours} uur</div>
        <div className="text-olive-200 mt-2 text-[13px]">
          {timeline.length} stappen &middot; {config.route === 'koud' ? 'incl. koude rijs' : 'zonder koude rijs'}
        </div>
      </div>

      {/* Settings */}
      <div className="card space-y-2">
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
        <div className="mt-3">
          {timeline.map((stage) => {
            const min = Math.round(stage.calculatedDurationMs / 60000);
            const h = Math.floor(min / 60);
            const m = min % 60;
            return (
              <div key={stage.id} className="flex justify-between py-2.5 border-b border-warm-100 last:border-0">
                <span className="text-warm-700">{stage.name}</span>
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
      <div className="sticky top-0 z-20 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60 safe-top">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
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
                  className="px-3 py-1.5 bg-white border border-warm-200 rounded-full text-[12px] font-semibold text-warm-500 hover:border-bread-300 hover:text-bread-600 transition-all shadow-sm">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-bread-400' : i === step ? 'bg-bread-300' : 'bg-warm-200'
                }`} />
                <div className={`text-[10px] mt-1.5 text-center font-medium ${
                  i <= step ? 'text-warm-600' : 'text-warm-300'
                }`}>{title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 pb-36">
        <h2 className="text-2xl font-bold text-warm-800 mb-5">{stepTitles[step]}</h2>
        {steps[step]}
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-[430px] mx-auto px-5 py-5 bg-warm-50/90 backdrop-blur-xl border-t border-warm-200/60">
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-6 py-4 rounded-2xl bg-white border-2 border-warm-200 text-warm-600 font-bold text-base shadow-[var(--shadow-button)] hover:border-bread-300">
                Terug
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-lg shadow-[var(--shadow-button)] hover:from-bread-500 hover:to-bread-600">
                Volgende
              </button>
            ) : (
              <button onClick={startProcess}
                className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-olive-500 to-olive-600 text-white font-bold text-xl shadow-[var(--shadow-elevated)] hover:from-olive-600 hover:to-olive-700">
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
  return <label className="block text-warm-700 font-semibold text-[15px]">{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] uppercase tracking-wider text-warm-400 font-bold">{children}</h3>;
}

function IngRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-warm-600 font-medium">{label}</span>
      <span className="font-mono font-bold text-warm-800">{value}</span>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-warm-400">{label}</span>
      <span className="font-medium text-warm-700">{value}</span>
    </div>
  );
}
