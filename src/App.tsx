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

  // Default: setup
  return <SetupWizard onNavigate={setOverlay} />;
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
