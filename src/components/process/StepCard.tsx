import { useBread } from '@/context/BreadContext';
import { useTimer } from '@/hooks/useTimer';
import { useNotification } from '@/hooks/useNotification';
import { getStageDefinition } from '@/models/stages';
import { scienceContent } from '@/data/scienceContent';
import { getStepRecipeInfo } from '@/data/stepRecipeInfo';
import { useState, useEffect } from 'react';

export function StepCard() {
  const { process, currentStage, currentEndTime, dispatch } = useBread();
  const timer = useTimer(currentEndTime, currentStage?.calculatedDurationMs ?? 0);
  const { playAlarm, stopAlarm, requestPermission, permission } = useNotification();
  const [showScience, setShowScience] = useState(false);

  // Request notification permission on first render
  useEffect(() => {
    if (permission === 'default') requestPermission();
  }, [permission, requestPermission]);

  // Play alarm when timer completes
  useEffect(() => {
    if (timer.justCompleted) {
      playAlarm();
    }
  }, [timer.justCompleted, playAlarm]);

  // Stop alarm when moving to next step
  const handleNextStep = () => {
    stopAlarm();
    dispatch({ type: 'NEXT_STEP' });
  };

  if (!process || !currentStage) {
    return (
      <div className="text-center py-20 px-8">
        <div className="text-6xl mb-6">&#127838;</div>
        <div className="text-2xl font-bold text-bread-700 mb-2">Klaar!</div>
        <div className="text-warm-500 leading-relaxed">Je bakproces is voltooid.<br />Geniet van je brood!</div>
      </div>
    );
  }

  const definition = getStageDefinition(currentStage.id);
  if (!definition) return null;

  const recipeInfo = getStepRecipeInfo(currentStage.id, process.config);
  const science = scienceContent[currentStage.id];
  const isStretchFold = currentStage.id === 'stretch_fold';

  const stepIndex = process.stages.findIndex(s => s.id === currentStage.id);
  const nextStage = stepIndex < process.stages.length - 1 ? process.stages[stepIndex + 1] : null;

  const timerGradient = timer.progress < 0.75 ? 'from-emerald-600 to-emerald-700' :
                        timer.progress < 0.95 ? 'from-bread-500 to-bread-700' :
                        'from-red-500 to-red-700';

  return (
    <div className="space-y-3">

      {/* Timer hero */}
      <div className={`bg-gradient-to-br ${timerGradient} text-white px-6 py-7 relative overflow-hidden`}>
        <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold">
          {stepIndex + 1}/{process.stages.length}
        </div>
        <div className="text-white/70 text-sm font-medium">{definition.name}</div>
        <div className="text-[52px] font-bold font-mono tracking-tight leading-none mt-1">
          {timer.formatted}
        </div>
        <div className="mt-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full transition-all duration-1000"
            style={{ width: `${timer.progress * 100}%` }} />
        </div>
        {nextStage && (
          <div className="mt-2.5 text-white/50 text-xs">Hierna: {nextStage.name}</div>
        )}
      </div>

      <div className="px-5 space-y-3">

        {/* Recipe info */}
        {recipeInfo && (
          <div className="card bg-bread-50 border-bread-200">
            {recipeInfo.temperature && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-bread-100 flex items-center justify-center text-lg">&#127777;</div>
                  <div>
                    <div className="text-[11px] text-bread-600 font-medium">{recipeInfo.temperature.label}</div>
                    <div className="text-xl font-bold text-bread-800">{recipeInfo.temperature.value}</div>
                  </div>
                </div>
                {recipeInfo.temperature.note && (
                  <div className="text-[11px] text-bread-500 text-right max-w-[130px] leading-snug">
                    {recipeInfo.temperature.note}
                  </div>
                )}
              </div>
            )}
            {recipeInfo.ingredients && (
              <div className={recipeInfo.temperature ? 'border-t border-bread-200/50 pt-3' : ''}>
                <div className="text-[10px] text-bread-600 uppercase tracking-wider font-semibold mb-2">Ingrediënten</div>
                {recipeInfo.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className={`text-sm ${ing.highlight ? 'text-bread-800 font-medium' : 'text-bread-600'}`}>{ing.label}</span>
                    <span className={`text-sm font-mono ${ing.highlight ? 'font-bold text-bread-800 bg-bread-100 px-2 py-0.5 rounded-lg' : 'text-bread-600'}`}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            )}
            {recipeInfo.tip && (
              <div className={`${(recipeInfo.ingredients || recipeInfo.temperature) ? 'border-t border-bread-200/50 pt-2.5 mt-2.5' : ''} text-xs text-bread-700 leading-relaxed`}>
                <span className="font-semibold">Tip:</span> {recipeInfo.tip}
              </div>
            )}
          </div>
        )}

        {/* Stretch & Fold */}
        {isStretchFold && (
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-800">Set #{(currentStage.stretchFoldCount ?? 0) + 1}</div>
                <div className="text-xs text-blue-500">van 4-6 sets</div>
              </div>
              <button onClick={() => dispatch({ type: 'COMPLETE_STRETCH_FOLD' })}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-[var(--shadow-button)] hover:bg-blue-700">
                Voltooid
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {[1,2,3,4,5,6].map(n => (
                <div key={n} className={`w-3.5 h-3.5 rounded-full transition-all ${
                  n <= (currentStage.stretchFoldCount ?? 0) ? 'bg-blue-500' :
                  n === (currentStage.stretchFoldCount ?? 0) + 1 ? 'bg-blue-300 animate-pulse' : 'bg-blue-100'
                }`} />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card">
          <h3 className="text-[10px] uppercase tracking-wider text-warm-400 font-semibold mb-3">Wat nu te doen</h3>
          <ol className="space-y-3">
            {definition.instructions.map((instruction, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-bread-400 to-bread-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
                <span className="text-[13px] text-warm-700 leading-relaxed pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Expected properties */}
        <div className="card">
          <h3 className="text-[10px] uppercase tracking-wider text-warm-400 font-semibold mb-3">Wat je moet waarnemen</h3>
          <ul className="space-y-2">
            {definition.expectedProperties.map((prop, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-warm-700">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">&#10003;</span>
                {prop}
              </li>
            ))}
          </ul>
        </div>

        {/* Physical test */}
        {definition.physicalTest && (
          <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm">&#128300;</div>
              <h3 className="font-semibold text-purple-800 text-sm">{definition.physicalTest.name}</h3>
            </div>
            <p className="text-xs text-purple-700 mb-3 leading-relaxed">{definition.physicalTest.description}</p>
            <div className="space-y-1.5">
              {definition.physicalTest.outcomes.underfermented && (
                <div className="flex gap-2.5 p-2.5 rounded-xl bg-red-50/60 border border-red-100">
                  <span className="text-red-400 text-xs">&#10007;</span>
                  <span className="text-[12px] text-warm-600 leading-relaxed">{definition.physicalTest.outcomes.underfermented}</span>
                </div>
              )}
              <div className="flex gap-2.5 p-2.5 rounded-xl bg-green-50 border border-green-200">
                <span className="text-green-500 text-xs">&#10003;</span>
                <span className="text-[12px] text-warm-800 font-medium leading-relaxed">{definition.physicalTest.outcomes.optimal}</span>
              </div>
              {definition.physicalTest.outcomes.overfermented && (
                <div className="flex gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                  <span className="text-orange-400 text-xs">&#9888;</span>
                  <span className="text-[12px] text-warm-600 leading-relaxed">{definition.physicalTest.outcomes.overfermented}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Science */}
        {science && (
          <button onClick={() => setShowScience(!showScience)}
            className="card w-full text-left hover:shadow-[var(--shadow-card-hover)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>&#129514;</span>
                <h3 className="font-semibold text-warm-700 text-sm">De Wetenschap</h3>
              </div>
              <span className={`text-warm-400 text-xs transition-transform duration-200 ${showScience ? 'rotate-180' : ''}`}>&#9660;</span>
            </div>
            {showScience && (
              <div className="mt-3 space-y-2.5" onClick={e => e.stopPropagation()}>
                <div className="text-sm font-semibold text-warm-800">{science.title}</div>
                {science.paragraphs.map((p, i) => (
                  <p key={i} className="text-xs text-warm-600 leading-relaxed">{p}</p>
                ))}
                {science.keyFact && (
                  <div className="p-3 bg-bread-50 rounded-xl border border-bread-200">
                    <span className="text-[10px] font-bold text-bread-600 uppercase tracking-wider">Kernfeit </span>
                    <span className="text-xs text-bread-800">{science.keyFact}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        )}

        {/* Next button */}
        <div className="pt-2 pb-8">
          <button onClick={handleNextStep}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all shadow-[var(--shadow-button)] ${
              timer.isComplete
                ? 'bg-gradient-to-r from-bread-500 to-bread-600 text-white hover:from-bread-600 hover:to-bread-700'
                : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
            }`}>
            {timer.isComplete
              ? (nextStage ? `Door naar: ${nextStage.name}` : 'Afronden')
              : 'Stap vroegtijdig afronden'}
          </button>
        </div>
      </div>
    </div>
  );
}
