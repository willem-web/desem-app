import { useState } from 'react';
import { BreadProvider, useBread } from '@/context/BreadContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { SetupWizard } from '@/components/setup/SetupWizard';
import { ProcessScreen } from '@/components/process/ProcessScreen';
import { BakeComplete } from '@/components/feedback/BakeComplete';
import { HistoryView } from '@/components/feedback/HistoryView';
import { AdvisorPanel } from '@/components/advisor/AdvisorPanel';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';

type Overlay = 'none' | 'history' | 'advisor' | 'inventory';

function AppContent() {
  const { state } = useBread();
  const [overlay, setOverlay] = useState<Overlay>('none');

  // Overlays
  if (overlay === 'history') {
    return (
      <div className="min-h-dvh">
        <div className="sticky top-0 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 z-10 flex items-center justify-between">
          <div className="text-lg font-bold text-amber-800">Desem</div>
          <button onClick={() => setOverlay('none')} className="text-sm text-amber-600 font-medium">
            Terug
          </button>
        </div>
        <HistoryView />
      </div>
    );
  }
  if (overlay === 'advisor') {
    return <AdvisorPanel onClose={() => setOverlay('none')} />;
  }
  if (overlay === 'inventory') {
    return <InventoryPanel onClose={() => setOverlay('none')} />;
  }

  // Active process
  if (state.process && !state.process.isComplete) {
    return <ProcessScreen />;
  }

  // Process just completed
  if (state.process && state.process.isComplete) {
    return <BakeComplete />;
  }

  // Default: setup with bottom nav
  return (
    <div className="relative">
      <SetupWizard />
      {/* Bottom navigation pills */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-2 px-4">
        <NavPill onClick={() => setOverlay('advisor')} label="Bakadvies" />
        <NavPill onClick={() => setOverlay('inventory')} label="Voorraad" />
        <NavPill onClick={() => setOverlay('history')} label="Logboek" />
      </div>
    </div>
  );
}

function NavPill({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2.5 bg-white/90 backdrop-blur-xl border border-warm-200 rounded-full text-xs font-semibold text-warm-600 shadow-[var(--shadow-card)] hover:border-bread-300 hover:text-bread-600 transition-all">
      {label}
    </button>
  );
}

export default function App() {
  return (
    <BreadProvider>
      <HistoryProvider>
        <InventoryProvider>
          <AppContent />
        </InventoryProvider>
      </HistoryProvider>
    </BreadProvider>
  );
}
