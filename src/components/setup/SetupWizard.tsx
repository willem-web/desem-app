import { useState } from 'react';
import type { RecipeConfig, ProcessRoute, StarterStrength, FeedingRatio, FlourType } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { presetBlends, calculateBlendAmounts, effectiveFlourType, type FlourBlend, type FlourBlendComponent } from '@/data/flourBlends';
import { calculateWaterTemperature, estimateFlourTemp } from '@/models/temperature';
import { calculateProcessTimeline } from '@/models/stages';
import { useBread } from '@/context/BreadContext';
import { useCustomRecipes } from '@/hooks/useCustomRecipes';
import { useCustomBlends, type CustomBlend } from '@/hooks/useCustomBlends';
import type { Overlay } from '@/App';
import {
  WheatIcon, MoonIcon, LayersIcon, MountainIcon, LeafIcon, GrainIcon,
  SunIcon, ThermometerIcon, BreadIcon, MicheIcon, DoubleBreadIcon,
  CheckIcon, MoreIcon, XIcon,
} from '@/components/ui/Icons';

// Enriched recipe display data
const recipeCards: Array<{
  index: number; icon: React.ReactNode; title: string; subtitle: string;
  tags: string[]; time: string;
}> = [
  { index: 0, icon: <WheatIcon className="w-7 h-7 text-bread-500" />, title: 'Landbrood', subtitle: 'Klassiek Frans, licht rogge-accent. Snelle warme methode.', tags: ['Beginner', 'Snel'], time: '~10u' },
  { index: 1, icon: <MoonIcon className="w-7 h-7 text-lav-500" />, title: 'Landbrood Nacht', subtitle: 'Zelfde recept, koude nacht-rijs. Diepere smaak.', tags: ['Populair', 'Complex'], time: '~20u' },
  { index: 2, icon: <LayersIcon className="w-7 h-7 text-olive-500" />, title: 'Drievoudig', subtitle: 'Drie meelsoorten: rijk, mineraalrijk, nootachtig.', tags: ['Gevorderd', 'Smaak'], time: '~20u' },
  { index: 3, icon: <MountainIcon className="w-7 h-7 text-warm-500" />, title: 'Groot Brood', subtitle: 'Stevig, nootachtig brood. Jouw signature 50/40/10.', tags: ['1kg meel', 'Karakter'], time: '~20u' },
  { index: 4, icon: <LeafIcon className="w-7 h-7 text-emerald-500" />, title: 'Spelt-Tarwe', subtitle: 'Nootachtig speltkarakter. Teer, luchtig kruim.', tags: ['Licht', 'Nootachtig'], time: '~20u' },
  { index: 5, icon: <GrainIcon className="w-7 h-7 text-bread-700" />, title: 'Volkoren', subtitle: 'Stevig volkorenbrood. Voedzaam, vol smaak.', tags: ['Gezond', 'Stevig'], time: '~20u' },
];

const breadSizes: Array<{ label: string; desc: string; flourGrams: number; icon: React.ReactNode }> = [
  { label: '1 brood', desc: 'Standaard rond brood (~800g)', flourGrams: 500, icon: <BreadIcon className="w-8 h-8 text-bread-500" /> },
  { label: '1 groot brood', desc: 'Miche-formaat (~1.2kg)', flourGrams: 750, icon: <MicheIcon className="w-8 h-8 text-bread-600" /> },
  { label: '2 broden', desc: 'Twee broden of batards (~1.6kg)', flourGrams: 1000, icon: <DoubleBreadIcon className="w-8 h-8 text-bread-700" /> },
];

const FLOUR_TYPE_OPTIONS: { value: FlourType; label: string }[] = [
  { value: 'T45', label: 'T45 Patisserie' },
  { value: 'T65', label: 'T65 Tradition' },
  { value: 'T80', label: 'T80 Gebuild' },
  { value: 'T150', label: 'T150 Volkoren' },
  { value: 'spelt', label: 'Speltbloem' },
  { value: 'rogge', label: 'Roggemeel' },
];

// ==================== RECIPE EDIT MODAL ====================

function RecipeEditModal({
  initial,
  allBlends,
  onSave,
  onCancel,
}: {
  initial: RecipeConfig;
  allBlends: FlourBlend[];
  onSave: (recipe: RecipeConfig) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<RecipeConfig>({ ...initial });
  const upd = (partial: Partial<RecipeConfig>) => setDraft(prev => ({ ...prev, ...partial }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-warm-200">
          <h3 className="text-lg font-bold text-warm-800">Eigen recept</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-warm-100">
            <XIcon className="w-4 h-4 text-warm-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <FieldGroup label="Naam">
            <input type="text" value={draft.name} onChange={e => upd({ name: e.target.value })}
              className="field-input" placeholder="Mijn recept" />
          </FieldGroup>

          <FieldGroup label="Rijsmethode">
            <div className="flex gap-2">
              {(['warm', 'koud'] as const).map(r => (
                <button key={r} onClick={() => upd({ route: r, targetDDT: r === 'warm' ? 26 : 23 })}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-bold border-2 transition-all ${
                    draft.route === r ? 'border-bread-400 bg-bread-50 text-bread-700' : 'border-warm-200 text-warm-500'
                  }`}>
                  {r === 'warm' ? 'Warm' : 'Koude rijs'}
                </button>
              ))}
            </div>
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label={`Starter: ${draft.starterPercent}%`}>
              <input type="range" min={5} max={30} step={1} value={draft.starterPercent}
                onChange={e => upd({ starterPercent: Number(e.target.value) })} className="w-full" />
            </FieldGroup>
            <FieldGroup label={`Hydratie: ${draft.hydrationPercent}%`}>
              <input type="range" min={60} max={90} step={1} value={draft.hydrationPercent}
                onChange={e => upd({ hydrationPercent: Number(e.target.value) })} className="w-full" />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label={`Zout: ${draft.saltPercent}%`}>
              <input type="range" min={1} max={3} step={0.1} value={draft.saltPercent}
                onChange={e => upd({ saltPercent: Number(e.target.value) })} className="w-full" />
            </FieldGroup>
            <FieldGroup label={`DDT: ${draft.targetDDT}\u00B0C`}>
              <input type="range" min={20} max={30} step={1} value={draft.targetDDT}
                onChange={e => upd({ targetDDT: Number(e.target.value) })} className="w-full" />
            </FieldGroup>
          </div>

          <FieldGroup label="Meelmengsel">
            <select value={draft.flourBlendId ?? ''} onChange={e => {
              const blend = allBlends.find(b => b.id === e.target.value);
              if (blend) {
                upd({ flourBlendId: blend.id, flourType: effectiveFlourType(blend), hydrationPercent: blend.suggestedHydration });
              }
            }} className="field-input">
              {allBlends.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Startersterkte">
            <div className="grid grid-cols-4 gap-1.5">
              {(['zwak', 'gemiddeld', 'sterk', 'piek'] as const).map(s => (
                <button key={s} onClick={() => upd({ starterStrength: s })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${
                    draft.starterStrength === s ? 'border-bread-400 bg-bread-50 text-bread-700' : 'border-warm-200 text-warm-500'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Voedingsratio">
            <div className="grid grid-cols-4 gap-1.5">
              {(['1:1:1', '1:2:2', '1:5:5', '1:10:10'] as const).map(r => (
                <button key={r} onClick={() => upd({ feedingRatio: r })}
                  className={`py-1.5 rounded-lg text-[11px] font-mono font-bold border-2 transition-all ${
                    draft.feedingRatio === r ? 'border-bread-400 bg-bread-50 text-bread-700' : 'border-warm-200 text-warm-500'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-warm-200">
          <button onClick={() => onSave(draft)}
            disabled={!draft.name.trim()}
            className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-[15px] shadow-[var(--shadow-button)] disabled:opacity-40">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== BLEND EDIT MODAL ====================

function BlendEditModal({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FlourBlend;
  onSave: (blend: Omit<FlourBlend, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [suggestedHydration, setSuggestedHydration] = useState(initial?.suggestedHydration ?? 72);
  const [components, setComponents] = useState<FlourBlendComponent[]>(
    initial?.components ?? [{ flourType: 'T65', label: 'T65 Tradition', percentage: 100 }]
  );

  const totalPct = components.reduce((s, c) => s + c.percentage, 0);
  const isValid = name.trim() && components.length > 0 && totalPct === 100;

  const updateComponent = (idx: number, partial: Partial<FlourBlendComponent>) => {
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, ...partial } : c));
  };

  const addComponent = () => {
    setComponents(prev => [...prev, { flourType: 'T65', label: 'T65 Tradition', percentage: 0 }]);
  };

  const removeComponent = (idx: number) => {
    setComponents(prev => prev.filter((_, i) => i !== idx));
  };

  const flourLabel = (ft: FlourType) => FLOUR_TYPE_OPTIONS.find(o => o.value === ft)?.label ?? ft;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-warm-200">
          <h3 className="text-lg font-bold text-warm-800">Eigen mengsel</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-warm-100">
            <XIcon className="w-4 h-4 text-warm-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <FieldGroup label="Naam">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="field-input" placeholder="Mijn mengsel" />
          </FieldGroup>

          <FieldGroup label="Beschrijving">
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="field-input" placeholder="Korte beschrijving" />
          </FieldGroup>

          <FieldGroup label={`Hydratie-advies: ${suggestedHydration}%`}>
            <input type="range" min={60} max={90} step={1} value={suggestedHydration}
              onChange={e => setSuggestedHydration(Number(e.target.value))} className="w-full" />
          </FieldGroup>

          <div>
            <Label>Meelsoorten</Label>
            <div className="space-y-2 mt-2">
              {components.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-2xl border border-warm-200 bg-warm-50">
                  <select value={comp.flourType}
                    onChange={e => {
                      const ft = e.target.value as FlourType;
                      updateComponent(idx, { flourType: ft, label: flourLabel(ft) });
                    }}
                    className="flex-1 text-[13px] bg-white border border-warm-200 rounded-lg px-2 py-1.5">
                    {FLOUR_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} max={100} value={comp.percentage}
                      onChange={e => updateComponent(idx, { percentage: Number(e.target.value) })}
                      className="w-16 text-center text-[13px] bg-white border border-warm-200 rounded-lg px-2 py-1.5" />
                    <span className="text-[12px] text-warm-400">%</span>
                  </div>
                  {components.length > 1 && (
                    <button onClick={() => removeComponent(idx)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100">
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addComponent}
              className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-warm-300 text-warm-500 text-[13px] font-medium hover:border-bread-300 hover:text-bread-500 transition-all">
              + Meelsoort toevoegen
            </button>
            {totalPct !== 100 && (
              <p className="text-[12px] text-red-500 mt-1 font-medium">
                Totaal: {totalPct}% (moet 100% zijn)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-warm-200">
          <button onClick={() => onSave({ name, description, style: 'Eigen mengsel', components, suggestedHydration })}
            disabled={!isValid}
            className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-[15px] shadow-[var(--shadow-button)] disabled:opacity-40">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN WIZARD ====================

export function SetupWizard({ onNavigate }: { onNavigate?: (overlay: Overlay) => void }) {
  const { dispatch } = useBread();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<RecipeConfig>(presetRecipes[1]);
  const [showMenu, setShowMenu] = useState(false);

  // Custom recipes & blends
  const { customRecipes, addRecipe, deleteRecipe } = useCustomRecipes();
  const { customBlends, addBlend, deleteBlend } = useCustomBlends();
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showBlendModal, setShowBlendModal] = useState(false);
  const [editingBlend, setEditingBlend] = useState<FlourBlend | undefined>(undefined);

  const allBlends = [...presetBlends, ...customBlends];

  const update = (partial: Partial<RecipeConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const selectedBlend = allBlends.find(b => b.id === config.flourBlendId);
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
    // ========== STEP 0: RECEPT -- Square tiles ==========
    <div key="recept" className="space-y-5">
      <Hint>Kies een recept als vertrekpunt, of maak een eigen recept.</Hint>
      <div className="grid grid-cols-2 gap-4">
        {recipeCards.map((rc) => {
          const recipe = presetRecipes[rc.index];
          const isSelected = config.name === recipe.name;
          return (
            <button key={rc.index}
              onClick={() => { setConfig(recipe); setStep(1); }}
              className={`relative rounded-3xl border-2 p-5 text-left transition-all min-h-[170px] flex flex-col justify-between ${
                isSelected
                  ? 'border-bread-400 bg-bread-50 shadow-md'
                  : 'border-warm-200 bg-white hover:shadow-md hover:border-warm-300'
              }`}>
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-bread-400 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div>
                <div className="mb-2">{rc.icon}</div>
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

        {/* Custom recipes */}
        {customRecipes.map((cr) => {
          const isSelected = config.name === cr.name;
          return (
            <div key={cr.customId} className="relative">
              <button
                onClick={() => { setConfig(cr); setStep(1); }}
                className={`w-full rounded-3xl border-2 p-5 text-left transition-all min-h-[170px] flex flex-col justify-between ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md hover:border-warm-300'
                }`}>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-bread-400 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div>
                  <div className="mb-2"><BreadIcon className="w-7 h-7 text-bread-400" /></div>
                  <div className="font-bold text-warm-800 text-[15px] leading-tight">{cr.name}</div>
                  <div className="text-warm-400 text-[12px] mt-1 leading-snug">
                    {cr.route === 'koud' ? 'Koude rijs' : 'Warm'} &middot; {cr.hydrationPercent}% hydratie
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-[10px] bg-bread-100 text-bread-600 px-1.5 py-0.5 rounded-md font-medium">Eigen</span>
                </div>
              </button>
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteRecipe(cr.customId); }}
                className="absolute top-2 left-2 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center border border-red-200 hover:bg-red-100 z-10">
                <XIcon className="w-3 h-3 text-red-400" />
              </button>
            </div>
          );
        })}

        {/* "Eigen recept" tile */}
        <button
          onClick={() => setShowRecipeModal(true)}
          className="rounded-3xl border-2 border-dashed border-warm-300 p-5 text-left transition-all min-h-[170px] flex flex-col items-center justify-center hover:border-bread-400 hover:bg-bread-50/30">
          <div className="w-12 h-12 rounded-2xl bg-warm-100 flex items-center justify-center mb-3">
            <span className="text-2xl text-warm-400">+</span>
          </div>
          <div className="font-bold text-warm-500 text-[14px]">Eigen recept</div>
          <div className="text-warm-400 text-[11px] mt-1 text-center">Maak een recept op maat</div>
        </button>
      </div>
    </div>,

    // ========== STEP 1: HOEVEELHEID -- Bread count/weight ==========
    <div key="hoeveel" className="space-y-5">
      <Hint>Hoeveel brood wil je bakken? Het meelgewicht wordt automatisch berekend.</Hint>
      <div className="space-y-3.5">
        {breadSizes.map((size) => {
          const isSelected = config.totalFlourGrams === size.flourGrams;
          return (
            <button key={size.flourGrams}
              onClick={() => update({ totalFlourGrams: size.flourGrams })}
              className={`w-full rounded-3xl border-2 p-6 text-left transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-bread-400 bg-bread-50 shadow-md'
                  : 'border-warm-200 bg-white hover:shadow-md'
              }`}>
              <div className="flex-shrink-0">{size.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-warm-800 text-[16px]">{size.label}</div>
                <div className="text-warm-400 text-[13px] mt-0.5">{size.desc}</div>
                <div className="text-olive-600 text-[12px] mt-1 font-medium">{size.flourGrams}g meel nodig</div>
              </div>
              {isSelected && (
                <div className="w-7 h-7 bg-bread-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-4 h-4 text-white" />
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
        Kies de samenstelling van je meel, of maak een eigen mengsel. Het <strong>T-nummer</strong> is de maalgraad:
        hoe hoger, hoe meer zemelen en smaak. T65 = wit, T80 = halfgrof, T150 = volkoren.
      </Hint>
      <div className="space-y-3">
        {allBlends.map((blend) => {
          const isSelected = config.flourBlendId === blend.id;
          const isCustom = 'isCustom' in blend && (blend as CustomBlend).isCustom;
          return (
            <div key={blend.id} className="relative">
              <button onClick={() => selectBlend(blend)}
                className={`w-full rounded-3xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-warm-800 text-[15px]">{blend.name}</span>
                    {isCustom && (
                      <span className="text-[10px] bg-bread-100 text-bread-600 px-1.5 py-0.5 rounded-md font-medium">Eigen</span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-bread-400 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                      <CheckIcon className="w-3.5 h-3.5 text-white" />
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
              {/* Delete button for custom blends */}
              {isCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteBlend(blend.id); }}
                  className="absolute top-3 right-14 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center border border-red-200 hover:bg-red-100 z-10">
                  <XIcon className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* "Eigen mengsel" button */}
      <button
        onClick={() => { setEditingBlend(undefined); setShowBlendModal(true); }}
        className="w-full py-4 rounded-3xl border-2 border-dashed border-warm-300 text-warm-500 font-bold text-[14px] hover:border-bread-400 hover:text-bread-500 hover:bg-bread-50/30 transition-all">
        + Eigen mengsel maken
      </button>
    </div>,

    // ========== STEP 3: STARTER -- With explanations + grams ==========
    <div key="starter" className="space-y-6">
      <Hint>
        Je starter (desem/moederdeeg) is de motor van het proces. De <strong>sterkte</strong> bepaalt
        hoe actief de gisten en bacteriën zijn -- en dus hoe snel je deeg rijst.
      </Hint>
      <div>
        <Label>Hoe actief is je starter nu?</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          {([
            ['zwak', 'Zwak', 'Nauwelijks gerezen, weinig bellen', 'Pas gevoerd of lang niet gebruikt'],
            ['gemiddeld', 'Gemiddeld', 'Iets gerezen, wat bellen zichtbaar', 'Een paar uur na voeren'],
            ['sterk', 'Sterk', 'Duidelijk gerezen, veel bellen', 'Op zijn actiefst, klaar voor gebruik'],
            ['piek', 'Piek', 'Net over de top, licht ingevallen', 'Gebruik direct, wacht niet langer'],
          ] as const).map(([value, label, desc, when]) => {
            const isSelected = config.starterStrength === value;
            return (
              <button key={value} onClick={() => update({ starterStrength: value as StarterStrength })}
                className={`rounded-3xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-warm-800 text-[15px]">{label}</span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-bread-500" />}
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

    // ========== STEP 4: INSTELLING -- Route, temp, hydration with WHY ==========
    <div key="instelling" className="space-y-6">
      <div>
        <Label>Rijsmethode</Label>
        <Hint>Dit bepaalt het smaakprofiel van je brood en hoeveel tijd je nodig hebt.</Hint>
        <div className="grid grid-cols-1 gap-3.5 mt-3">
          {([
            ['warm', 'sun', 'Warme rijs', 'Rijst op kamertemperatuur. Sneller klaar, milder zuurprofiel met meer melkzuur.',
             'Ideaal als je dezelfde dag wilt bakken.'],
            ['koud', 'moon', 'Koude nacht-rijs', 'Gaat na vormen 8-16u de koelkast in. Meer azijnzuur, dieper, complexer aroma.',
             'Start overdag, bak de volgende ochtend.'],
          ] as const).map(([value, iconType, label, desc, when]) => {
            const isSelected = config.route === value;
            return (
              <button key={value}
                onClick={() => update({ route: value as ProcessRoute, targetDDT: value === 'warm' ? 26 : 23 })}
                className={`w-full rounded-3xl border-2 p-6 text-left transition-all ${
                  isSelected
                    ? 'border-bread-400 bg-bread-50 shadow-md'
                    : 'border-warm-200 bg-white hover:shadow-md'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    iconType === 'sun' ? 'bg-bread-100' : 'bg-lav-100'
                  }`}>
                    {iconType === 'sun'
                      ? <SunIcon className="w-5 h-5 text-bread-500" />
                      : <MoonIcon className="w-5 h-5 text-lav-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-warm-800 text-[16px]">{label}</span>
                      {isSelected && <CheckIcon className="w-5 h-5 text-bread-500" />}
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
      <div className="rounded-3xl border-2 border-lav-200 bg-lav-50 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-lav-200 flex items-center justify-center flex-shrink-0">
          <ThermometerIcon className="w-6 h-6 text-lav-600" />
        </div>
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

    // ========== STEP 5: SAMENVATTING -- Visual ==========
    <div key="summary" className="space-y-4">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-olive-500 to-olive-700 p-7 text-white">
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
          <SummaryPill>
            {config.route === 'koud'
              ? <><MoonIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Koude rijs</>
              : <><SunIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Warm</>
            }
          </SummaryPill>
          <SummaryPill>{config.hydrationPercent}% hydratie</SummaryPill>
          <SummaryPill>{config.roomTempC}°C</SummaryPill>
          <SummaryPill>{timeline.length} stappen</SummaryPill>
        </div>
      </div>

      {/* Ingredients -- visual */}
      <div className="rounded-3xl border-2 border-warm-200 bg-white p-6">
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
      <div className="rounded-3xl border-2 border-warm-200 bg-white p-6">
        <div className="text-[11px] text-warm-400 uppercase tracking-wider font-bold mb-3">Instellingen</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <SettingRow label="Mengsel" value={selectedBlend?.name ?? config.flourType} />
          <SettingRow label="Voedingsratio" value={config.feedingRatio} />
          <SettingRow label="Starter" value={`${config.starterPercent}% · ${config.starterStrength}`} />
          <SettingRow label="Kamertemp" value={`${config.roomTempC}°C`} />
        </div>
      </div>

      {/* Timeline visual */}
      <div className="rounded-3xl border-2 border-warm-200 bg-white p-6">
        <div className="text-[11px] text-warm-400 uppercase tracking-wider font-bold mb-3">Tijdlijn</div>
        <div className="space-y-0">
          {timeline.map((stage, i) => {
            const min = Math.round(stage.calculatedDurationMs / 60000);
            const h = Math.floor(min / 60);
            const m = min % 60;
            const isLong = min >= 60;
            return (
              <div key={stage.id} className="flex items-center gap-3 py-2.5 border-b border-warm-100 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
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
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <BreadIcon className="w-7 h-7 text-bread-500" />
              <span className="text-xl font-bold text-warm-800">Desem</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-warm-200 rounded-xl text-warm-500 hover:border-bread-300 transition-all shadow-sm">
                <MoreIcon className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-11 bg-white border border-warm-200 rounded-2xl shadow-[var(--shadow-elevated)] py-2 min-w-[160px] z-30">
                  {([
                    ['Bakadvies', 'advisor'],
                    ['Voorraad', 'inventory'],
                    ['Baklogboek', 'history'],
                  ] as const).map(([label, key]) => (
                    <button key={key}
                      onClick={() => { setShowMenu(false); onNavigate?.(key as Overlay); }}
                      className="w-full text-left px-4 py-2.5 text-[14px] text-warm-600 hover:bg-bread-50 transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              )}
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

      {/* Dismiss menu overlay */}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}

      {/* Content */}
      <div className="flex-1 px-6 pt-5" style={{ paddingBottom: '200px' }}>
        <h2 className="text-[22px] font-bold text-warm-800 mb-3">{stepTitles[step]}</h2>
        {steps[step]}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-[430px] mx-auto px-6 py-5 bg-warm-50/95 backdrop-blur-xl border-t border-warm-200/60">
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
                <BreadIcon className="w-5 h-5 inline -mt-0.5 mr-1" /> Start Bakproces
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recipe edit modal */}
      {showRecipeModal && (
        <RecipeEditModal
          initial={{
            name: '',
            route: 'koud',
            hydrationPercent: 72,
            starterPercent: 20,
            starterStrength: 'sterk',
            feedingRatio: '1:5:5',
            saltPercent: 2,
            flourType: 'T65',
            flourBlendId: 't65-rogge-90-10',
            roomTempC: 22,
            targetDDT: 23,
            totalFlourGrams: 500,
          }}
          allBlends={allBlends}
          onSave={(recipe) => {
            const custom = addRecipe(recipe);
            setConfig(custom);
            setShowRecipeModal(false);
            setStep(1);
          }}
          onCancel={() => setShowRecipeModal(false)}
        />
      )}

      {/* Blend edit modal */}
      {showBlendModal && (
        <BlendEditModal
          initial={editingBlend}
          onSave={(blend) => {
            const custom = addBlend(blend);
            selectBlend(custom);
            setShowBlendModal(false);
            setEditingBlend(undefined);
          }}
          onCancel={() => { setShowBlendModal(false); setEditingBlend(undefined); }}
        />
      )}
    </div>
  );
}

// === Helper components ===

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-warm-700 font-bold text-[13px] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-warm-800 font-bold text-[15px]">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-warm-400 text-[13px] leading-relaxed">{children}</p>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-olive-50 border border-olive-200 p-5 text-[13px] text-olive-700 leading-relaxed">
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
