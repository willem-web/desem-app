import { useState } from 'react';
import { useBread } from '@/context/BreadContext';
import { ProcessTimeline } from './ProcessTimeline';
import { StepCard } from './StepCard';
import { StepCharts } from '@/components/charts/StepCharts';
import type { ProcessTab } from '@/types';

export function ProcessScreen() {
  const { process, totalProgress, dispatch } = useBread();
  const [tab, setTab] = useState<ProcessTab>('stap');

  if (!process) return null;

  const tabs: { id: ProcessTab; label: string; icon: string }[] = [
    { id: 'tijdlijn', label: 'Tijdlijn', icon: '\u{1F4CB}' },
    { id: 'stap', label: 'Huidige Stap', icon: '\u{1F44B}' },
    { id: 'grafieken', label: 'Wetenschap', icon: '\u{1F4CA}' },
  ];

  const completedSteps = process.stages.filter(s => s.completedAt !== null).length;

  return (
    <div className="flex flex-col min-h-dvh bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-100 z-20">
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#127838;</span>
              <span className="text-lg font-bold text-stone-800">Desem</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 font-mono">
                {completedSteps}/{process.stages.length}
              </span>
              <button
                onClick={() => {
                  if (confirm('Weet je zeker dat je het proces wilt stoppen?')) {
                    dispatch({ type: 'RESET' });
                  }
                }}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1"
              >
                Stop
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-stone-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(2, totalProgress * 100)}%` }}
            />
          </div>

          {/* Tabs */}
          <div className="flex -mb-px">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition-all ${
                  tab === t.id
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-stone-400 hover:text-stone-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {tab === 'tijdlijn' && (
          <div className="p-4">
            <ProcessTimeline />
          </div>
        )}
        {tab === 'stap' && <StepCard />}
        {tab === 'grafieken' && (
          <div className="p-4">
            <StepCharts />
          </div>
        )}
      </div>
    </div>
  );
}
