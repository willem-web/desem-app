import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { RecipeConfig } from '@/types';
import { presetRecipes } from '@/data/recipes';
import { calculateStartTime, seasonalAdvice, flourAdvice, starterStateAdvice, suggestFeedingRatio } from '@/models/advisor';

export function AdvisorPanel({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<RecipeConfig>(presetRecipes[1]);
  const [bakeDate, setBakeDate] = useState(() => {
    // Default: tomorrow 10:00
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
    <div className="min-h-dvh bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 z-10 flex items-center justify-between">
        <div className="text-lg font-bold text-amber-800">Bakadvies</div>
        <button onClick={onClose} className="text-sm text-stone-500">Sluiten</button>
      </div>

      <div className="p-4 space-y-4">
        {/* When to bake */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-3">Wanneer wil je bakken?</h3>
          <input
            type="datetime-local"
            value={format(bakeDate, "yyyy-MM-dd'T'HH:mm")}
            onChange={e => setBakeDate(new Date(e.target.value))}
            className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Quick recipe select */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-3">Recept</h3>
          <div className="flex gap-2 flex-wrap">
            {presetRecipes.map(r => (
              <button
                key={r.name}
                onClick={() => setConfig(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  config.name === r.name
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-amber-100'
                }`}
              >
                {r.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated schedule */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-1">Beginnen op:</h3>
          <div className="text-2xl font-bold text-amber-900">
            {formatDay(startTime)} om {formatTime(startTime)}
          </div>
        </div>

        {/* Full schedule */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-3">Schema</h3>
          <div className="space-y-2">
            {stageSchedule.map((s, i) => {
              const isNextDay = s.start.getDate() !== stageSchedule[0].start.getDate();
              return (
                <div key={i}>
                  {isNextDay && i > 0 && stageSchedule[i - 1].start.getDate() !== s.start.getDate() && (
                    <div className="text-xs text-amber-600 font-medium py-1 border-t border-stone-100 mt-2 pt-2">
                      {formatDay(s.start)}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-stone-400 w-14 text-right">
                      {formatTime(s.start)}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-stone-700">{s.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feeding ratio suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-1">Voedingsratio advies</h3>
          <div className="text-lg font-bold text-blue-900 font-mono">{feeding.ratio}</div>
          <p className="text-sm text-blue-700 mt-1">{feeding.explanation}</p>
        </div>

        {/* Starter advice */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-2">
            Starteradvies ({config.starterStrength})
          </h3>
          <ul className="space-y-1.5">
            {starter.map((tip, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="text-amber-500 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Seasonal advice */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-2">
            Seizoensadvies ({config.roomTempC}°C)
          </h3>
          <ul className="space-y-1.5">
            {seasonal.map((tip, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="text-green-500 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Flour advice */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-2">
            Bloem: {config.flourType}
          </h3>
          <ul className="space-y-1.5">
            {flour.map((tip, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="text-amber-500 flex-shrink-0">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
