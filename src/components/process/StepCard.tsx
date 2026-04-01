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

  useEffect(() => {
    if (permission === 'default') requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    if (timer.justCompleted) {
      playAlarm();
    }
  }, [timer.justCompleted, playAlarm]);

  const handleNextStep = () => {
    stopAlarm();
    dispatch({ type: 'NEXT_STEP' });
  };

  if (!process || !currentStage) {
    return (
      <div className="text-center py-20 px-8">
        <div className="text-6xl mb-6">&#127838;</div>
        <div className="text-2xl font-bold text-warm-800 mb-2">Klaar!</div>
        <div className="text-warm-400 leading-relaxed">Je bakproces is voltooid.<br />Geniet van je brood!</div>
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

  const timerGradient = timer.progress < 0.75 ? 'from-olive-500 to-olive-700' :
                        timer.progress < 0.95 ? 'from-bread-400 to-bread-600' :
                        'from-red-500 to-red-600';

  return (
    <div className="flex flex-col">
      {/* Timer hero */}
      <div className={`bg-gradient-to-br ${timerGradient} text-white px-6 py-7 relative overflow-hidden`}>
        {/* Step counter — larger, more prominent */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-white/90 text-[15px] font-semibold">{definition.name}</div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1 text-[13px] font-bold">
            Stap {stepIndex + 1} van {process.stages.length}
          </div>
        </div>
        <div className="text-[52px] font-bold font-mono tracking-tight leading-none mt-1">
          {timer.formatted}
        </div>
        <div className="mt-4 h-2 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full transition-all duration-1000"
            style={{ width: `${timer.progress * 100}%` }} />
        </div>
        {nextStage && (
          <div className="mt-3 text-white/80 text-[14px]">
            Hierna: <strong>{nextStage.name}</strong>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="px-5 py-4 space-y-4 pb-28">

        {/* Recipe info */}
        {recipeInfo && (
          <div className="card bg-bread-50 border-bread-200">
            {recipeInfo.temperature && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-bread-200 flex items-center justify-center text-lg">&#127777;</div>
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
                    <span className={`text-[13px] ${ing.highlight ? 'text-bread-800 font-medium' : 'text-bread-600'}`}>{ing.label}</span>
                    <span className={`text-[13px] font-mono ${ing.highlight ? 'font-bold text-bread-800 bg-bread-200 px-2 py-0.5 rounded-lg' : 'text-bread-600'}`}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            )}
            {recipeInfo.tip && (
              <div className={`${(recipeInfo.ingredients || recipeInfo.temperature) ? 'border-t border-bread-200/50 pt-3 mt-3' : ''} text-[13px] text-bread-700 leading-relaxed`}>
                <span className="font-semibold">Tip:</span> {recipeInfo.tip}
              </div>
            )}
          </div>
        )}

        {/* Stretch & Fold */}
        {isStretchFold && (
          <div className="card bg-lav-50 border-lav-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-lav-700">Set #{(currentStage.stretchFoldCount ?? 0) + 1}</div>
                <div className="text-[13px] text-lav-500">van 4-6 sets</div>
              </div>
              <button onClick={() => dispatch({ type: 'COMPLETE_STRETCH_FOLD' })}
                className="px-5 py-3 bg-lav-500 text-white rounded-2xl font-semibold text-sm shadow-[var(--shadow-button)]">
                Voltooid
              </button>
            </div>
            <div className="flex gap-2.5 mt-3">
              {[1,2,3,4,5,6].map(n => (
                <div key={n} className={`w-4 h-4 rounded-full transition-all ${
                  n <= (currentStage.stretchFoldCount ?? 0) ? 'bg-lav-500' :
                  n === (currentStage.stretchFoldCount ?? 0) + 1 ? 'bg-lav-300 animate-pulse' : 'bg-lav-100'
                }`} />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card">
          <h3 className="text-[10px] uppercase tracking-wider text-warm-400 font-semibold mb-3">Instructies</h3>
          <ol className="space-y-3">
            {definition.instructions.map((instruction, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-bread-300 to-bread-400 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[13px] text-warm-600 leading-relaxed pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Expected properties */}
        <div className="card">
          <h3 className="text-[10px] uppercase tracking-wider text-warm-400 font-semibold mb-3">Waarneming</h3>
          <ul className="space-y-2">
            {definition.expectedProperties.map((prop, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-warm-600">
                <span className="text-emerald-500 flex-shrink-0">&#10003;</span>
                {prop}
              </li>
            ))}
          </ul>
        </div>

        {/* Physical test */}
        {definition.physicalTest && (
          <div className="card bg-lav-50 border-lav-200">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-lav-200 flex items-center justify-center text-sm">&#128300;</div>
              <h3 className="font-semibold text-lav-700 text-[14px]">{definition.physicalTest.name}</h3>
            </div>
            <p className="text-[13px] text-lav-600 mb-3 leading-relaxed">{definition.physicalTest.description}</p>
            <div className="space-y-1.5">
              {definition.physicalTest.outcomes.underfermented && (
                <div className="flex gap-2.5 p-2.5 rounded-xl bg-red-50/60 border border-red-100">
                  <span className="text-red-400 text-[12px]">&#10007;</span>
                  <span className="text-[12px] text-warm-600 leading-relaxed">{definition.physicalTest.outcomes.underfermented}</span>
                </div>
              )}
              <div className="flex gap-2.5 p-2.5 rounded-xl bg-green-50 border border-green-200">
                <span className="text-green-500 text-[12px]">&#10003;</span>
                <span className="text-[12px] text-warm-800 font-medium leading-relaxed">{definition.physicalTest.outcomes.optimal}</span>
              </div>
              {definition.physicalTest.outcomes.overfermented && (
                <div className="flex gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                  <span className="text-orange-400 text-[12px]">&#9888;</span>
                  <span className="text-[12px] text-warm-600 leading-relaxed">{definition.physicalTest.outcomes.overfermented}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Science — collapsible */}
        {science && (
          <button onClick={() => setShowScience(!showScience)}
            className="card w-full text-left hover:shadow-[var(--shadow-card-hover)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>&#129514;</span>
                <h3 className="font-semibold text-warm-700 text-[14px]">De Wetenschap</h3>
              </div>
              <span className={`text-warm-400 text-[12px] transition-transform duration-200 ${showScience ? 'rotate-180' : ''}`}>&#9660;</span>
            </div>
            {showScience && (
              <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                <div className="text-[14px] font-semibold text-warm-800">{science.title}</div>
                {science.paragraphs.map((p, i) => (
                  <p key={i} className="text-[13px] text-warm-500 leading-relaxed">{p}</p>
                ))}
                {science.keyFact && (
                  <div className="p-3 bg-olive-50 rounded-xl border border-olive-200">
                    <span className="text-[10px] font-bold text-olive-600 uppercase tracking-wider">Kernfeit </span>
                    <span className="text-[12px] text-olive-700">{science.keyFact}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        )}
      </div>

      {/* Sticky next button — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-[430px] mx-auto px-5 py-3 bg-warm-50/90 backdrop-blur-xl border-t border-warm-200/60">
          <button onClick={handleNextStep}
            className={`w-full py-3.5 rounded-2xl font-bold text-[16px] transition-all shadow-[var(--shadow-button)] ${
              timer.isComplete
                ? 'bg-gradient-to-r from-bread-400 to-bread-500 text-white animate-pulse'
                : 'bg-white border border-warm-200 text-warm-500'
            }`}>
            {timer.isComplete
              ? (nextStage ? `Volgende: ${nextStage.name}` : 'Afronden')
              : 'Vroegtijdig afronden'}
          </button>
        </div>
      </div>
    </div>
  );
}
