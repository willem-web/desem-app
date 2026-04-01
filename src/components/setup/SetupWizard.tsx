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
    config.targetDDT,
    config.roomTempC,
    estimateFlourTemp(config.roomTempC),
    6,
    config.roomTempC,
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
    update({
      flourBlendId: blend.id,
      flourType: effectiveFlourType(blend),
      hydrationPercent: blend.suggestedHydration,
    });
  };

  const startProcess = () => {
    dispatch({ type: 'START_PROCESS', config });
  };

  const steps = [
    // Step 0: Recipe preset
    <div key="preset" className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-800">Kies een recept</h2>
      <div className="space-y-3">
        {presetRecipes.map((recipe) => {
          const blend = presetBlends.find(b => b.id === recipe.flourBlendId);
          return (
            <button
              key={recipe.name}
              onClick={() => { setConfig(recipe); setStep(1); }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                config.name === recipe.name
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="font-medium text-stone-800">{recipe.name}</div>
              <div className="text-sm text-stone-500 mt-1">
                {blend ? blend.components.map(c => `${c.percentage}% ${c.label}`).join(' + ') : recipe.flourType}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {recipe.hydrationPercent}% hydratie &middot; {recipe.starterPercent}% starter &middot; {recipe.totalFlourGrams}g
              </div>
            </button>
          );
        })}
        <button
          onClick={() => setStep(1)}
          className="w-full text-left p-4 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 hover:border-amber-300"
        >
          Aangepast recept...
        </button>
      </div>
    </div>,

    // Step 1: Flour blend selection
    <div key="blend" className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-800">Meelmengsel</h2>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">
          Totaal meel: {config.totalFlourGrams}g
        </label>
        <div className="flex items-center gap-3">
          {[500, 750, 1000].map(g => (
            <button
              key={g}
              onClick={() => update({ totalFlourGrams: g })}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                config.totalFlourGrams === g
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-stone-200 text-stone-600 hover:border-amber-300'
              }`}
            >
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
            <button
              key={blend.id}
              onClick={() => selectBlend(blend)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="font-medium text-stone-800">{blend.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">{blend.description}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {amounts.map((a, i) => (
                  <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-mono">
                    {a.grams}g {a.label}
                  </span>
                ))}
              </div>
              {blend.notes && (
                <div className="text-xs text-amber-600 mt-1">{blend.notes}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>,

    // Step 2: Starter config
    <div key="starter" className="space-y-5">
      <h2 className="text-xl font-semibold text-stone-800">Starter instellen</h2>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">Startersterkte</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen, weinig bellen'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, enkele bellen'],
            ['sterk', 'Sterk', 'Goed gerezen, veel bellen'],
            ['piek', 'Piek', 'Op hoogste punt, koepelvormig'],
          ] as const).map(([value, label, desc]) => (
            <button
              key={value}
              onClick={() => update({ starterStrength: value as StarterStrength })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                config.starterStrength === value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 hover:border-amber-300'
              }`}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-stone-500">{desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">
          Starter percentage: {config.starterPercent}% ({starterGrams}g)
        </label>
        <input type="range" min={5} max={30} step={1} value={config.starterPercent}
          onChange={e => update({ starterPercent: Number(e.target.value) })}
          className="w-full accent-amber-600" />
        <div className="flex justify-between text-xs text-stone-400">
          <span>5% (langzaam)</span><span>30% (snel)</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">Voedingsratio</label>
        <div className="grid grid-cols-4 gap-2">
          {(['1:1:1', '1:2:2', '1:5:5', '1:10:10'] as FeedingRatio[]).map(ratio => (
            <button key={ratio} onClick={() => update({ feedingRatio: ratio })}
              className={`p-2 rounded-lg border-2 text-sm font-mono transition-all ${
                config.feedingRatio === ratio ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300'
              }`}>{ratio}</button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Temperature & route
    <div key="temp" className="space-y-5">
      <h2 className="text-xl font-semibold text-stone-800">Temperatuur & Route</h2>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">Route</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['warm', 'Warm (Route A)', 'Sneller, milder'],
            ['koud', 'Koud (Route B)', 'Complex aroma'],
          ] as const).map(([value, label, desc]) => (
            <button key={value}
              onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                config.route === value ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300'
              }`}>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-stone-500">{desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">
          Kamertemperatuur: {config.roomTempC}°C
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => update({ roomTempC: Math.max(16, config.roomTempC - 1) })}
            className="w-10 h-10 rounded-lg border-2 border-stone-200 font-bold text-lg">-</button>
          <input type="range" min={16} max={32} step={1} value={config.roomTempC}
            onChange={e => update({ roomTempC: Number(e.target.value) })}
            className="flex-1 accent-amber-600" />
          <button onClick={() => update({ roomTempC: Math.min(32, config.roomTempC + 1) })}
            className="w-10 h-10 rounded-lg border-2 border-stone-200 font-bold text-lg">+</button>
        </div>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          Watertemperatuur: <strong>{Math.round(waterTemp)}°C</strong> (voor DDT van {config.targetDDT}°C)
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">
          Hydratie: {config.hydrationPercent}% ({waterGrams}g water)
        </label>
        <input type="range" min={60} max={90} step={1} value={config.hydrationPercent}
          onChange={e => update({ hydrationPercent: Number(e.target.value) })}
          className="w-full accent-amber-600" />
        <div className="flex justify-between text-xs text-stone-400">
          <span>60% (stevig)</span><span>90% (open kruim)</span>
        </div>
        {selectedBlend && config.hydrationPercent !== selectedBlend.suggestedHydration && (
          <div className="mt-1 text-xs text-amber-600">
            Aanbevolen voor dit mengsel: {selectedBlend.suggestedHydration}%
          </div>
        )}
      </div>
    </div>,

    // Step 4: Summary with full recipe
    <div key="summary" className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-800">Receptuur & Samenvatting</h2>

      {/* Full recipe card */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-800 mb-3">Ingrediënten</h3>
        <div className="space-y-2">
          <div className="text-xs text-stone-400 uppercase tracking-wide">Meel ({config.totalFlourGrams}g totaal)</div>
          {blendAmounts.map((a, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-stone-700">{a.label}</span>
              <span className="font-mono text-stone-800 font-medium">{a.grams}g</span>
            </div>
          ))}
          <div className="border-t border-stone-100 pt-2 mt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-stone-700">Water</span>
              <span className="font-mono text-stone-800 font-medium">{waterGrams}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-700">Actieve starter</span>
              <span className="font-mono text-stone-800 font-medium">{starterGrams}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-700">Zout</span>
              <span className="font-mono text-stone-800 font-medium">{saltGrams}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings summary */}
      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        <Row label="Route" value={config.route === 'warm' ? 'A (Warm)' : 'B (Koude Rijs)'} />
        <Row label="Mengsel" value={selectedBlend?.name ?? config.flourType} />
        <Row label="Hydratie" value={`${config.hydrationPercent}%`} />
        <Row label="Starter" value={`${config.starterPercent}% (${config.starterStrength})`} />
        <Row label="Voedingsratio" value={config.feedingRatio} />
        <Row label="Kamertemp" value={`${config.roomTempC}°C`} />
        <Row label="Watertemp" value={`${Math.round(waterTemp)}°C`} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="text-sm text-amber-800 font-medium">Geschatte totale tijd</div>
        <div className="text-2xl font-bold text-amber-900">{totalHours} uur</div>
        <div className="text-sm text-amber-700 mt-1">
          {timeline.length} stappen &middot;{' '}
          {config.route === 'koud' ? 'inclusief koude rijs' : 'zonder koude rijs'}
        </div>
      </div>

      <div className="space-y-2">
        {timeline.map((stage) => (
          <div key={stage.id} className="flex justify-between text-sm px-2">
            <span className="text-stone-600">{stage.name}</span>
            <span className="text-stone-400 font-mono">
              {Math.round(stage.calculatedDurationMs / 60000)} min
            </span>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 z-10">
        <div className="text-xl font-bold text-amber-800">Desem</div>
        <div className="flex gap-1.5 mt-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-amber-500' : 'bg-stone-200'
            }`} />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 pb-24">
        {steps[step]}
      </div>
      <div className="sticky bottom-0 p-4 bg-stone-50/95 backdrop-blur-sm border-t border-stone-200 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            className="px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-medium">
            Terug
          </button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors">
            Volgende
          </button>
        ) : (
          <button onClick={startProcess}
            className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold text-lg hover:bg-amber-700 transition-colors">
            Start Bakproces
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-medium text-stone-800">{value}</span>
    </div>
  );
}
