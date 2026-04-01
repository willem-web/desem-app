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

  const tabs: { id: ProcessTab; label: string }[] = [
    { id: 'tijdlijn', label: 'Tijdlijn' },
    { id: 'stap', label: 'Stap' },
    { id: 'grafieken', label: 'Wetenschap' },
  ];

  const completedSteps = process.stages.filter(s => s.completedAt !== null).length;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60">
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">&#127838;</span>
              <span className="text-lg font-bold text-warm-800">Desem</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-warm-400 font-mono bg-white border border-warm-200 px-2.5 py-1 rounded-full">
                {completedSteps}/{process.stages.length}
              </span>
              <button
                onClick={() => { if (confirm('Weet je zeker dat je wilt stoppen?')) dispatch({ type: 'RESET' }); }}
                className="text-[12px] text-warm-400 hover:text-red-500 transition-colors">
                Stop
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-warm-200 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-bread-300 to-bread-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(2, totalProgress * 100)}%` }} />
          </div>

          {/* Tabs */}
          <div className="flex -mb-px">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-[13px] font-semibold tracking-wide border-b-2 transition-all ${
                  tab === t.id ? 'border-bread-400 text-warm-800' : 'border-transparent text-warm-400 hover:text-warm-500'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {tab === 'tijdlijn' && <div className="px-5 py-5"><ProcessTimeline /></div>}
        {tab === 'stap' && <StepCard />}
        {tab === 'grafieken' && <div className="px-5 py-5"><StepCharts /></div>}
      </div>
    </div>
  );
}
