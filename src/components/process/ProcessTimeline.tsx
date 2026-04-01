import { useBread } from '@/context/BreadContext';
import { useEffect, useRef } from 'react';

export function ProcessTimeline() {
  const { process } = useBread();
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [process?.currentStageIndex]);

  if (!process) return null;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-stone-200" />

      <div className="space-y-0">
        {process.stages.map((stage, i) => {
          const isCurrent = i === process.currentStageIndex;
          const isComplete = stage.completedAt !== null;
          const durationMin = Math.round(stage.calculatedDurationMs / 60000);
          const hours = Math.floor(durationMin / 60);
          const mins = durationMin % 60;
          const durationStr = hours > 0 ? `${hours}u ${mins}m` : `${mins} min`;

          // Calculate time of day
          const startDate = new Date(stage.startTime);
          const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

          return (
            <div
              key={stage.id}
              ref={isCurrent ? activeRef : undefined}
              className={`relative flex items-start gap-4 py-3 px-2 rounded-xl transition-all ${
                isCurrent ? 'bg-amber-50/80' : ''
              } ${isComplete ? 'opacity-50' : ''}`}
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <div className="w-[38px] h-[38px] rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm">&#10003;</span>
                  </div>
                ) : isCurrent ? (
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-200 animate-pulse">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                ) : (
                  <div className="w-[38px] h-[38px] rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                    <span className="text-stone-400 text-xs font-medium">{i + 1}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`font-semibold text-sm ${
                    isCurrent ? 'text-amber-800' :
                    isComplete ? 'text-emerald-700' :
                    'text-stone-700'
                  }`}>
                    {stage.name}
                  </span>
                  <span className="text-xs font-mono text-stone-400 flex-shrink-0">
                    {durationStr}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {timeStr}
                  {isCurrent && <span className="ml-2 text-amber-600 font-medium">Nu actief</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
