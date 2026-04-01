import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { BreadProcess, BakeResult, BakeScores, StageId } from '@/types';

const STORAGE_KEY = 'desem-history';

interface HistoryContextType {
  history: BakeResult[];
  saveSession: (process: BreadProcess, scores?: BakeScores, notes?: string) => void;
  updateScores: (resultId: string, scores: BakeScores, notes?: string) => void;
  getResult: (id: string) => BakeResult | undefined;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<BakeResult[]>(STORAGE_KEY, []);

  const saveSession = useCallback((
    process: BreadProcess,
    scores?: BakeScores,
    notes?: string,
  ) => {
    const actualDurations: Record<string, number> = {};
    const estimatedDurations: Record<string, number> = {};

    for (const stage of process.stages) {
      estimatedDurations[stage.id] = stage.calculatedDurationMs;
      if (stage.completedAt) {
        actualDurations[stage.id] = stage.completedAt - stage.startTime;
      } else {
        actualDurations[stage.id] = stage.calculatedDurationMs;
      }
    }

    const result: BakeResult = {
      id: crypto.randomUUID(),
      processId: process.id,
      config: process.config,
      date: Date.now(),
      actualDurations: actualDurations as Record<StageId, number>,
      estimatedDurations: estimatedDurations as Record<StageId, number>,
      scores: scores ?? { kruim: 3, korst: 3, smaak: 3, ovenspring: 3, overall: 3 },
      notes: notes ?? '',
      eventLog: process.eventLog ?? [],
    };

    setHistory(prev => [result, ...prev]);
    return result;
  }, [setHistory]);

  const updateScores = useCallback((
    resultId: string,
    scores: BakeScores,
    notes?: string,
  ) => {
    setHistory(prev =>
      prev.map(r => r.id === resultId
        ? { ...r, scores, ...(notes !== undefined ? { notes } : {}) }
        : r
      )
    );
  }, [setHistory]);

  const getResult = useCallback((id: string) => {
    return history.find(r => r.id === id);
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return (
    <HistoryContext.Provider value={{ history, saveSession, updateScores, getResult, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
