import { useBread } from '@/context/BreadContext';
import { useTimer } from '@/hooks/useTimer';
import { getStageDefinition } from '@/models/stages';
import { scienceContent } from '@/data/scienceContent';
import { getStepRecipeInfo } from '@/data/stepRecipeInfo';
import { useState } from 'react';

export function StepCard() {
  const { process, currentStage, currentEndTime, dispatch } = useBread();
  const timer = useTimer(currentEndTime, currentStage?.calculatedDurationMs ?? 0);
  const [showScience, setShowScience] = useState(false);

  if (!process || !currentStage) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-6xl mb-6">&#127838;</div>
        <div className="text-2xl font-bold text-amber-800 mb-2">Klaar!</div>
        <div className="text-stone-500">
          Je bakproces is voltooid.<br />
          Geniet van je brood!
        </div>
      </div>
    );
  }

  const definition = getStageDefinition(currentStage.id);
  if (!definition) return null;

  const recipeInfo = getStepRecipeInfo(currentStage.id, process.config);
  const science = scienceContent[currentStage.id];
  const isStretchFold = currentStage.id === 'stretch_fold';

  // Find current step number and next step name
  const stepIndex = process.stages.findIndex(s => s.id === currentStage.id);
  const stepNumber = stepIndex + 1;
  const totalSteps = process.stages.length;
  const nextStage = stepIndex < process.stages.length - 1
    ? process.stages[stepIndex + 1]
    : null;

  // Timer colors
  const timerBg = timer.progress < 0.75 ? 'from-green-500 to-emerald-600' :
                  timer.progress < 0.95 ? 'from-amber-500 to-orange-600' :
                  'from-red-500 to-rose-600';
  return (
    <div className="space-y-3 -mx-4">

      {/* === TIMER HERO === */}
      <div className={`bg-gradient-to-br ${timerBg} text-white px-6 py-8 relative overflow-hidden`}>
        {/* Step counter badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
          Stap {stepNumber}/{totalSteps}
        </div>

        <div className="text-white/80 text-sm font-medium mb-1">{definition.name}</div>
        <div className="text-5xl font-bold font-mono tracking-tight">
          {timer.formatted}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-all duration-1000"
            style={{ width: `${timer.progress * 100}%` }}
          />
        </div>

        {/* Next step preview */}
        {nextStage && (
          <div className="mt-3 text-white/60 text-xs">
            Hierna: {nextStage.name}
          </div>
        )}
      </div>

      <div className="px-4 space-y-3">

        {/* === RECIPE INFO CARD (contextual) === */}
        {recipeInfo && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4 shadow-sm">
            {/* Temperature */}
            {recipeInfo.temperature && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-base">
                    &#127777;
                  </div>
                  <div>
                    <div className="text-xs text-amber-700">{recipeInfo.temperature.label}</div>
                    <div className="text-lg font-bold text-amber-900">{recipeInfo.temperature.value}</div>
                  </div>
                </div>
                {recipeInfo.temperature.note && (
                  <div className="text-xs text-amber-600 text-right max-w-[140px]">
                    {recipeInfo.temperature.note}
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {recipeInfo.ingredients && recipeInfo.ingredients.length > 0 && (
              <div className={`${recipeInfo.temperature ? 'border-t border-amber-200/50 pt-3' : ''}`}>
                <div className="text-xs text-amber-700 uppercase tracking-wide mb-2 font-medium">
                  Ingrediënten voor deze stap
                </div>
                <div className="space-y-1.5">
                  {recipeInfo.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={`text-sm ${ing.highlight ? 'text-amber-900 font-medium' : 'text-amber-800'}`}>
                        {ing.label}
                      </span>
                      <span className={`text-sm font-mono ${ing.highlight ? 'text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded' : 'text-amber-700'}`}>
                        {ing.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tip */}
            {recipeInfo.tip && (
              <div className={`${(recipeInfo.ingredients || recipeInfo.temperature) ? 'border-t border-amber-200/50 pt-3 mt-3' : ''} text-sm text-amber-800`}>
                <span className="font-medium">Tip: </span>{recipeInfo.tip}
              </div>
            )}
          </div>
        )}

        {/* === STRETCH & FOLD COUNTER === */}
        {isStretchFold && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-800">
                  Set #{(currentStage.stretchFoldCount ?? 0) + 1}
                </div>
                <div className="text-sm text-blue-600">van 4-6 sets &middot; elke 30 min</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'COMPLETE_STRETCH_FOLD' })}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
              >
                Voltooid
              </button>
            </div>
            {/* Fold dots */}
            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div
                  key={n}
                  className={`w-3 h-3 rounded-full transition-all ${
                    n <= (currentStage.stretchFoldCount ?? 0)
                      ? 'bg-blue-500'
                      : n === (currentStage.stretchFoldCount ?? 0) + 1
                        ? 'bg-blue-300 animate-pulse'
                        : 'bg-blue-100'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* === INSTRUCTIONS === */}
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <h3 className="text-xs uppercase tracking-wide text-stone-400 font-semibold mb-3">Wat nu te doen</h3>
          <ol className="space-y-3">
            {definition.instructions.map((instruction, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
                <span className="text-sm text-stone-700 leading-relaxed pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* === EXPECTED PROPERTIES === */}
        <div className="bg-white rounded-2xl border border-stone-200/60 p-4 shadow-sm">
          <h3 className="text-xs uppercase tracking-wide text-stone-400 font-semibold mb-3">Wat moet je zien/voelen</h3>
          <ul className="space-y-2">
            {definition.expectedProperties.map((prop, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-stone-700">
                <span className="text-emerald-500 flex-shrink-0 text-base leading-none mt-0.5">&#10003;</span>
                {prop}
              </li>
            ))}
          </ul>
        </div>

        {/* === PHYSICAL TEST === */}
        {definition.physicalTest && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm">&#128300;</div>
              <h3 className="font-semibold text-purple-800">{definition.physicalTest.name}</h3>
            </div>
            <p className="text-sm text-purple-700 mb-3">{definition.physicalTest.description}</p>
            <div className="space-y-2">
              {definition.physicalTest.outcomes.underfermented && (
                <div className="flex gap-2.5 p-2 rounded-lg bg-red-50/50">
                  <span className="text-red-400 flex-shrink-0 text-sm">&#10007;</span>
                  <span className="text-xs text-stone-600">{definition.physicalTest.outcomes.underfermented}</span>
                </div>
              )}
              <div className="flex gap-2.5 p-2 rounded-lg bg-green-50 border border-green-200/50">
                <span className="text-green-500 flex-shrink-0 text-sm">&#10003;</span>
                <span className="text-xs text-stone-800 font-medium">{definition.physicalTest.outcomes.optimal}</span>
              </div>
              {definition.physicalTest.outcomes.overfermented && (
                <div className="flex gap-2.5 p-2 rounded-lg bg-orange-50/50">
                  <span className="text-orange-400 flex-shrink-0 text-sm">&#9888;</span>
                  <span className="text-xs text-stone-600">{definition.physicalTest.outcomes.overfermented}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === SCIENCE PANEL === */}
        {science && (
          <button
            onClick={() => setShowScience(!showScience)}
            className="w-full text-left bg-stone-50 rounded-2xl border border-stone-200/60 p-4 transition-all hover:bg-stone-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">&#129514;</span>
                <h3 className="font-semibold text-stone-700 text-sm">De Wetenschap</h3>
              </div>
              <span className={`text-stone-400 transition-transform duration-200 ${showScience ? 'rotate-180' : ''}`}>
                &#9660;
              </span>
            </div>
            {showScience && (
              <div className="mt-4 space-y-3" onClick={e => e.stopPropagation()}>
                <div className="text-sm font-semibold text-stone-800">{science.title}</div>
                {science.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-stone-600 leading-relaxed">{p}</p>
                ))}
                {science.keyFact && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Kernfeit </span>
                    <span className="text-sm text-amber-800">{science.keyFact}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        )}

        {/* === NEXT STEP BUTTON === */}
        <div className="pt-1 pb-6">
          <button
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-sm ${
              timer.isComplete
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {timer.isComplete
              ? (nextStage ? `Klaar! Door naar: ${nextStage.name}` : 'Afronden')
              : 'Stap vroegtijdig afronden'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
