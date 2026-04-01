import { useState } from 'react';
import { useBread } from '@/context/BreadContext';
import { ProcessTimeline } from './ProcessTimeline';
import { StepCard } from './StepCard';
import { StepCharts } from '@/components/charts/StepCharts';
import type { ProcessTab } from '@/types';
import type { Overlay } from '@/App';

export function ProcessScreen({ onNavigate }: { onNavigate?: (overlay: Overlay) => void }) {
  const { process, totalProgress, dispatch } = useBread();
  const [tab, setTab] = useState<ProcessTab>('stap');
  const [showMenu, setShowMenu] = useState(false);

  if (!process) return null;

  const tabs: { id: ProcessTab; label: string; icon: string }[] = [
    { id: 'tijdlijn', label: 'Tijdlijn', icon: '\u{1F4CB}' },
    { id: 'stap', label: 'Huidige stap', icon: '\u{1F44B}' },
    { id: 'grafieken', label: 'Wetenschap', icon: '\u{1F9EA}' },
  ];

  const completedSteps = process.stages.filter(s => s.completedAt !== null).length;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60">
        <div className="px-5 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">&#127838;</span>
              <span className="text-lg font-bold text-warm-800">Desem</span>
              <span className="text-[13px] text-warm-400 font-mono bg-white border border-warm-200 px-2 py-0.5 rounded-lg ml-1">
                {completedSteps}/{process.stages.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Menu toggle for overlays */}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-warm-200 rounded-xl text-warm-500 hover:border-bread-300 transition-all shadow-sm text-[16px]">
                  &#8943;
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
                    <div className="h-px bg-warm-100 my-1" />
                    <button
                      onClick={() => { setShowMenu(false); if (confirm('Weet je zeker dat je wilt stoppen?')) dispatch({ type: 'RESET' }); }}
                      className="w-full text-left px-4 py-2.5 text-[14px] text-red-500 hover:bg-red-50 transition-colors">
                      Stop bakproces
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-warm-200 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-bread-300 to-bread-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(2, totalProgress * 100)}%` }} />
          </div>

          {/* Tabs — 3 tabs is fine */}
          <div className="flex -mb-px">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-[13px] font-semibold border-b-2 transition-all ${
                  tab === t.id ? 'border-bread-400 text-warm-800' : 'border-transparent text-warm-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dismiss menu overlay */}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}

      {/* Content */}
      <div className="flex-1">
        {tab === 'tijdlijn' && <div className="px-5 py-4"><ProcessTimeline /></div>}
        {tab === 'stap' && <StepCard />}
        {tab === 'grafieken' && <div className="px-5 py-4"><StepCharts /></div>}
      </div>
    </div>
  );
}
