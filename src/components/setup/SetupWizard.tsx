import { useState } from 'react';
import type { RecipeConfig, ProcessRoute, StarterStrength, FeedingRatio } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { presetBlends, calculateBlendAmounts, effectiveFlourType, type FlourBlend } from '@/data/flourBlends';
import { calculateWaterTemperature, estimateFlourTemp } from '@/models/temperature';
import { calculateProcessTimeline } from '@/models/stages';
import { useBread } from '@/context/BreadContext';

export function SetupWizard() {
  const { dispatch } = useBread();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<RecipeConfig>(presetRecipes[1]);

  const update = (partial: Partial<RecipeConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const selectedBlend = presetBlends.find(b => b.id === config.flourBlendId);

  const waterTemp = calculateWaterTemperature(
    config.targetDDT, config.roomTempC, estimateFlourTemp(config.roomTempC), 6, config.roomTempC,
  );

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

  const stepTitles = ['Recept', 'Meelmengsel', 'Starter', 'Temperatuur', 'Samenvatting'];

  const steps = [
    // Step 0: Recipe preset
    <div key="preset" className="space-y-3">
      <p className="text-sm text-warm-500">Kies een vooringesteld recept of begin met een eigen samenstelling.</p>
      <div className="space-y-2.5">
        {presetRecipes.map((recipe) => {
          const blend = presetBlends.find(b => b.id === recipe.flourBlendId);
          return (
            <button
              key={recipe.name}
              onClick={() => { setConfig(recipe); setStep(1); }}
              className={`card w-full text-left transition-all hover:shadow-[var(--shadow-card-hover)] ${
                config.name === recipe.name ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300' : 'hover:border-bread-300'
              }`}
            >
              <div className="font-semibold text-warm-800 text-[15px]">{recipe.name}</div>
              <div className="text-xs text-warm-500 mt-1">
                {blend ? blend.components.map(c => `${c.percentage}% ${c.label}`).join(' + ') : recipe.flourType}
              </div>
              <div className="flex gap-3 mt-2">
                <Tag>{recipe.hydrationPercent}%</Tag>
                <Tag>{recipe.starterPercent}% starter</Tag>
                <Tag>{recipe.totalFlourGrams}g</Tag>
              </div>
            </button>
          );
        })}
        <button onClick={() => setStep(1)}
          className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-warm-300 text-warm-400 text-sm hover:border-bread-300 hover:text-bread-600 transition-all">
          Aangepast recept samenstellen...
        </button>
      </div>
    </div>,

    // Step 1: Flour blend
    <div key="blend" className="space-y-4">
      <div>
        <label className="label">Totaal meel</label>
        <div className="flex gap-2 mt-1.5">
          {[500, 750, 1000].map(g => (
            <button key={g} onClick={() => update({ totalFlourGrams: g })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                config.totalFlourGrams === g
                  ? 'bg-bread-500 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>
              {g}g
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {presetBlends.map((blend) => {
          const amounts = calculateBlendAmounts(blend, config.totalFlourGrams);
          const isSelected = config.flourBlendId === blend.id;
          return (
            <button key={blend.id} onClick={() => selectBlend(blend)}
              className={`card w-full text-left transition-all hover:shadow-[var(--shadow-card-hover)] ${
                isSelected ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300' : 'hover:border-bread-300'
              }`}>
              <div className="font-semibold text-warm-800 text-sm">{blend.name}</div>
              <div className="text-xs text-warm-400 mt-0.5">{blend.description}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {amounts.map((a, i) => (
                  <span key={i} className="text-[11px] bg-bread-100 text-bread-700 px-2 py-0.5 rounded-full font-mono font-medium">
                    {a.grams}g {a.label}
                  </span>
                ))}
              </div>
              {blend.notes && <div className="text-[11px] text-bread-600 mt-1.5 italic">{blend.notes}</div>}
            </button>
          );
        })}
      </div>
    </div>,

    // Step 2: Starter
    <div key="starter" className="space-y-5">
      <div>
        <label className="label">Startersterkte</label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, bellen'],
            ['sterk', 'Sterk', 'Goed gerezen, actief'],
            ['piek', 'Piek', 'Koepelvormig, top'],
          ] as const).map(([value, label, desc]) => (
            <button key={value} onClick={() => update({ starterStrength: value as StarterStrength })}
              className={`p-3 rounded-xl border text-left transition-all ${
                config.starterStrength === value
                  ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300 shadow-[var(--shadow-button)]'
                  : 'border-warm-200 bg-white hover:border-bread-300'
              }`}>
              <div className="font-semibold text-sm text-warm-800">{label}</div>
              <div className="text-[11px] text-warm-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Starterpercentage: <span className="text-bread-600 font-bold">{config.starterPercent}%</span> <span className="text-warm-400 font-normal">({starterGrams}g)</span></label>
        <input type="range" min={5} max={30} step={1} value={config.starterPercent}
          onChange={e => update({ starterPercent: Number(e.target.value) })} className="w-full mt-2" />
        <div className="flex justify-between text-[11px] text-warm-400 mt-1">
          <span>5% langzaam</span><span>30% snel</span>
        </div>
      </div>

      <div>
        <label className="label">Voedingsratio</label>
        <div className="grid grid-cols-4 gap-2 mt-1.5">
          {(['1:1:1', '1:2:2', '1:5:5', '1:10:10'] as FeedingRatio[]).map(ratio => (
            <button key={ratio} onClick={() => update({ feedingRatio: ratio })}
              className={`py-2.5 rounded-xl text-sm font-mono font-semibold transition-all ${
                config.feedingRatio === ratio
                  ? 'bg-bread-500 text-white shadow-[var(--shadow-button)]'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-bread-300'
              }`}>{ratio}</button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Temperature & route
    <div key="temp" className="space-y-5">
      <div>
        <label className="label">Route</label>
        <div className="grid grid-cols-2 gap-2.5 mt-1.5">
          {([
            ['warm', 'Warm', 'Route A — sneller, milder smaakprofiel'],
            ['koud', 'Koude Rijs', 'Route B — dieper, complexer aroma'],
          ] as const).map(([value, label, desc]) => (
            <button key={value}
              onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
              className={`p-4 rounded-xl border text-left transition-all ${
                config.route === value
                  ? 'border-bread-400 bg-bread-50 ring-1 ring-bread-300 shadow-[var(--shadow-button)]'
                  : 'border-warm-200 bg-white hover:border-bread-300'
              }`}>
              <div className="font-semibold text-warm-800">{label}</div>
              <div className="text-xs text-warm-400 mt-1 leading-relaxed">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Kamertemperatuur: <span className="text-bread-600 font-bold">{config.roomTempC}°C</span></label>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => update({ roomTempC: Math.max(16, config.roomTempC - 1) })}
            className="w-11 h-11 rounded-xl bg-white border border-warm-200 font-bold text-lg text-warm-600 hover:border-bread-300 shadow-[var(--shadow-button)]">−</button>
          <input type="range" min={16} max={32} step={1} value={config.roomTempC}
            onChange={e => update({ roomTempC: Number(e.target.value) })} className="flex-1" />
          <button onClick={() => update({ roomTempC: Math.min(32, config.roomTempC + 1) })}
            className="w-11 h-11 rounded-xl bg-white border border-warm-200 font-bold text-lg text-warm-600 hover:border-bread-300 shadow-[var(--shadow-button)]">+</button>
        </div>
        <div className="card bg-blue-50 border-blue-200 mt-3 flex items-center gap-3">
          <span className="text-xl">&#127777;</span>
          <div>
            <div className="text-xs text-blue-600">Aanbevolen watertemperatuur</div>
            <div className="text-lg font-bold text-blue-800">{Math.round(waterTemp)}°C</div>
          </div>
          <div className="ml-auto text-[11px] text-blue-500">DDT {config.targetDDT}°C</div>
        </div>
      </div>

      <div>
        <label className="label">Hydratie: <span className="text-bread-600 font-bold">{config.hydrationPercent}%</span> <span className="text-warm-400 font-normal">({waterGrams}g water)</span></label>
        <input type="range" min={60} max={90} step={1} value={config.hydrationPercent}
          onChange={e => update({ hydrationPercent: Number(e.target.value) })} className="w-full mt-2" />
        <div className="flex justify-between text-[11px] text-warm-400 mt-1">
          <span>60% stevig</span><span>90% open kruim</span>
        </div>
        {selectedBlend && config.hydrationPercent !== selectedBlend.suggestedHydration && (
          <div className="text-[11px] text-bread-600 mt-1">Aanbevolen: {selectedBlend.suggestedHydration}%</div>
        )}
      </div>
    </div>,

    // Step 4: Summary
    <div key="summary" className="space-y-4">
      {/* Recipe card */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-wider text-warm-400 font-semibold mb-3">Ingrediënten</h3>
        <div className="space-y-1.5">
          <div className="text-[11px] text-warm-400 uppercase tracking-wider mb-1">Meel ({config.totalFlourGrams}g)</div>
          {blendAmounts.map((a, i) => (
            <Row key={i} label={a.label} value={`${a.grams}g`} bold />
          ))}
          <div className="h-px bg-warm-100 my-2" />
          <Row label="Water" value={`${waterGrams}g`} bold />
          <Row label="Actieve starter" value={`${starterGrams}g`} bold />
          <Row label="Zout" value={`${saltGrams}g`} bold />
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <Row label="Route" value={config.route === 'warm' ? 'A — Warm' : 'B — Koude Rijs'} />
        <Row label="Mengsel" value={selectedBlend?.name ?? config.flourType} />
        <Row label="Hydratie" value={`${config.hydrationPercent}%`} />
        <Row label="Starter" value={`${config.starterPercent}% (${config.starterStrength})`} />
        <Row label="Voedingsratio" value={config.feedingRatio} />
        <Row label="Kamertemp" value={`${config.roomTempC}°C`} />
        <Row label="Watertemp" value={`${Math.round(waterTemp)}°C`} />
      </div>

      {/* Time estimate */}
      <div className="card bg-gradient-to-br from-bread-500 to-bread-700 border-bread-600 text-white">
        <div className="text-bread-200 text-xs font-medium">Geschatte totale tijd</div>
        <div className="text-3xl font-bold mt-1">{totalHours} uur</div>
        <div className="text-bread-200 text-sm mt-1">
          {timeline.length} stappen &middot; {config.route === 'koud' ? 'incl. koude rijs' : 'zonder koude rijs'}
        </div>
      </div>

      {/* Timeline preview */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-wider text-warm-400 font-semibold mb-2">Planning</h3>
        {timeline.map((stage) => {
          const min = Math.round(stage.calculatedDurationMs / 60000);
          const h = Math.floor(min / 60);
          const m = min % 60;
          return (
            <div key={stage.id} className="flex justify-between py-1.5 text-sm border-b border-warm-100 last:border-0">
              <span className="text-warm-600">{stage.name}</span>
              <span className="font-mono text-warm-400 text-xs">{h > 0 ? `${h}u ${m}m` : `${m}m`}</span>
            </div>
          );
        })}
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-warm-200/50">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-2xl">&#127838;</span>
            <span className="text-xl font-bold text-bread-700">Desem</span>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-bread-500' : i === step ? 'bg-bread-400' : 'bg-warm-200'
                }`} />
                <div className={`text-[10px] mt-1 text-center transition-colors ${
                  i === step ? 'text-bread-600 font-semibold' : 'text-warm-400'
                }`}>{title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 pb-28">
        <h2 className="text-xl font-bold text-warm-800 mb-3">{stepTitles[step]}</h2>
        {steps[step]}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-[430px] mx-auto px-5 py-4 bg-white/80 backdrop-blur-xl border-t border-warm-200/50">
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-5 py-3.5 rounded-xl bg-white border border-warm-200 text-warm-600 font-semibold text-sm shadow-[var(--shadow-button)] hover:border-bread-300">
                Terug
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-bread-500 to-bread-600 text-white font-semibold text-sm shadow-[var(--shadow-button)] hover:from-bread-600 hover:to-bread-700">
                Volgende
              </button>
            ) : (
              <button onClick={startProcess}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-bread-600 to-bread-700 text-white font-bold text-base shadow-[var(--shadow-button)] hover:from-bread-700 hover:to-bread-800">
                Start Bakproces
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] bg-bread-100 text-bread-600 px-2 py-0.5 rounded-full font-medium">{children}</span>;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-warm-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold text-warm-800 font-mono' : 'font-medium text-warm-700'}`}>{value}</span>
    </div>
  );
}
