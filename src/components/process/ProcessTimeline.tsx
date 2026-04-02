import { useBread } from '@/context/BreadContext';
import { useEffect, useRef } from 'react';
import { CheckIcon, ClockIcon } from '@/components/ui/Icons';

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
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-warm-200" />

      <div className="space-y-0">
        {process.stages.map((stage, i) => {
          const isCurrent = i === process.currentStageIndex;
          const isComplete = stage.completedAt !== null;
          const durationMin = Math.round(stage.calculatedDurationMs / 60000);
          const hours = Math.floor(durationMin / 60);
          const mins = durationMin % 60;
          const durationStr = hours > 0 ? `${hours}u ${mins}m` : `${mins} min`;

          const startDate = new Date(stage.startTime);
          const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

          return (
            <div
              key={stage.id}
              ref={isCurrent ? activeRef : undefined}
              className={`relative flex items-start gap-4 py-4 px-3 rounded-3xl transition-all ${
                isCurrent ? 'bg-bread-50' : ''
              } ${isComplete ? 'opacity-50' : ''}`}
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <div className="w-[38px] h-[38px] rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-bread-300 to-bread-400 flex items-center justify-center shadow-md shadow-bread-200 animate-pulse">
                    <span className="text-white text-[13px] font-bold">{i + 1}</span>
                  </div>
                ) : (
                  <div className="w-[38px] h-[38px] rounded-full bg-warm-100 border-2 border-warm-200 flex items-center justify-center">
                    <span className="text-warm-400 text-[13px] font-medium">{i + 1}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`font-semibold text-[15px] ${
                    isCurrent ? 'text-warm-800' :
                    isComplete ? 'text-emerald-700' :
                    'text-warm-600'
                  }`}>
                    {stage.name}
                  </span>
                  <span className="text-[13px] font-mono text-warm-400 flex-shrink-0">
                    {durationStr}
                  </span>
                </div>
                <div className="text-[13px] text-warm-400 mt-0.5 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-warm-300" />
                  <span>start {timeStr}</span>
                  {isCurrent && <span className="ml-1 text-bread-500 font-semibold bg-bread-50 px-2 py-0.5 rounded-lg text-[11px]">Nu actief</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
