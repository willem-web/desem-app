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
import { LandingPage } from '@/components/landing/LandingPage';

export type Overlay = 'none' | 'history' | 'advisor' | 'inventory';

function AppContent() {
  const { state } = useBread();
  const [overlay, setOverlay] = useState<Overlay>('none');
  const [hasSeenLanding, setHasSeenLanding] = useState(
    () => localStorage.getItem('desem_seen_landing') === '1'
  );

  // Overlays — accessible from everywhere
  if (overlay === 'history') {
    return (
      <div className="min-h-dvh">
        <div className="sticky top-0 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60 px-5 py-4 z-10 flex items-center justify-between">
          <div className="text-lg font-bold text-warm-800">Baklogboek</div>
          <button onClick={() => setOverlay('none')} className="text-[14px] text-bread-500 font-semibold">
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

  // Active process — pass overlay nav
  if (state.process && !state.process.isComplete) {
    return <ProcessScreen onNavigate={setOverlay} />;
  }

  // Process just completed
  if (state.process && state.process.isComplete) {
    return <BakeComplete />;
  }

  // Landing page — first visit only
  if (!hasSeenLanding) {
    return <LandingPage onStart={() => {
      localStorage.setItem('desem_seen_landing', '1');
      setHasSeenLanding(true);
    }} />;
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
