import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { RecipeConfig } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { calculateStartTime, seasonalAdvice, flourAdvice, starterStateAdvice, suggestFeedingRatio } from '@/models/advisor';

export function AdvisorPanel({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<RecipeConfig>(presetRecipes[1]);
  const [bakeDate, setBakeDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  const { startTime, stageSchedule } = calculateStartTime(config, bakeDate);
  const seasonal = seasonalAdvice(config.roomTempC);
  const flour = flourAdvice(config.flourType);
  const starter = starterStateAdvice(config.starterStrength);
  const feeding = suggestFeedingRatio(
    (bakeDate.getTime() - Date.now()) / 3600000
  );

  const formatTime = (d: Date) => format(d, 'HH:mm', { locale: nl });
  const formatDay = (d: Date) => format(d, 'EEEE d MMM', { locale: nl });

  return (
    <div className="min-h-dvh bg-warm-50">
      {/* Header */}
      <div className="sticky top-0 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60 px-6 py-4 z-10 flex items-center justify-between safe-top">
        <div className="text-lg font-bold text-warm-800">Bakadvies</div>
        <button onClick={onClose} className="text-[13px] text-warm-400 font-medium">Sluiten</button>
      </div>

      <div className="p-6 space-y-5">
        {/* When to bake */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-4 text-[15px]">Wanneer wil je bakken?</h3>
          <input
            type="datetime-local"
            value={format(bakeDate, "yyyy-MM-dd'T'HH:mm")}
            onChange={e => setBakeDate(new Date(e.target.value))}
            className="w-full p-3.5 border border-warm-200 rounded-2xl text-[14px]"
          />
        </div>

        {/* Quick recipe select */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-4 text-[15px]">Recept</h3>
          <div className="flex gap-2 flex-wrap">
            {presetRecipes.map(r => (
              <button
                key={r.name}
                onClick={() => setConfig(r)}
                className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-all ${
                  config.name === r.name
                    ? 'bg-bread-400 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-bread-100'
                }`}
              >
                {r.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated schedule */}
        <div className="card bg-olive-50 border-olive-200">
          <h3 className="font-semibold text-olive-700 mb-1.5 text-[15px]">Beginnen op:</h3>
          <div className="text-2xl font-bold text-olive-800">
            {formatDay(startTime)} om {formatTime(startTime)}
          </div>
        </div>

        {/* Full schedule */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-4 text-[15px]">Schema</h3>
          <div className="space-y-2.5">
            {stageSchedule.map((s, i) => {
              const isNextDay = s.start.getDate() !== stageSchedule[0].start.getDate();
              return (
                <div key={i}>
                  {isNextDay && i > 0 && stageSchedule[i - 1].start.getDate() !== s.start.getDate() && (
                    <div className="text-[12px] text-olive-600 font-medium py-1 border-t border-warm-100 mt-2 pt-2">
                      {formatDay(s.start)}
                    </div>
                  )}
                  <div className="flex items-center gap-3.5 text-[14px]">
                    <span className="font-mono text-warm-400 w-14 text-right">
                      {formatTime(s.start)}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-bread-300 flex-shrink-0" />
                    <span className="text-warm-700">{s.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feeding ratio suggestion */}
        <div className="card bg-lav-50 border-lav-200">
          <h3 className="font-semibold text-lav-700 mb-1.5 text-[15px]">Voedingsratio advies</h3>
          <div className="text-xl font-bold text-lav-800 font-mono">{feeding.ratio}</div>
          <p className="text-[13px] text-lav-600 mt-2 leading-relaxed">{feeding.explanation}</p>
        </div>

        {/* Starter advice */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-3 text-[15px]">
            Starteradvies <span className="text-warm-400 font-normal">({config.starterStrength})</span>
          </h3>
          <ul className="space-y-2.5">
            {starter.map((tip, i) => (
              <li key={i} className="text-[13px] text-warm-600 flex gap-2.5 leading-relaxed">
                <span className="text-bread-400 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Seasonal advice */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-3 text-[15px]">
            Seizoensadvies <span className="text-warm-400 font-normal">({config.roomTempC}°C)</span>
          </h3>
          <ul className="space-y-2.5">
            {seasonal.map((tip, i) => (
              <li key={i} className="text-[13px] text-warm-600 flex gap-2.5 leading-relaxed">
                <span className="text-olive-400 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Flour advice */}
        <div className="card">
          <h3 className="font-semibold text-warm-800 mb-3 text-[15px]">
            Bloem: <span className="text-olive-600">{config.flourType}</span>
          </h3>
          <ul className="space-y-2.5">
            {flour.map((tip, i) => (
              <li key={i} className="text-[13px] text-warm-600 flex gap-2.5 leading-relaxed">
                <span className="text-bread-400 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
