import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { BreadProcess, RecipeConfig, AppView, StageId, ProcessEvent } from '@/types';
import { calculateProcessTimeline, recalculateFromStage } from '@/models/stages';

const STORAGE_KEY = 'desem-process';

interface BreadState {
  process: BreadProcess | null;
  view: AppView;
}

type BreadAction =
  | { type: 'START_PROCESS'; config: RecipeConfig }
  | { type: 'NEXT_STEP' }
  | { type: 'COMPLETE_STRETCH_FOLD' }
  | { type: 'UPDATE_TEMPERATURE'; tempC: number }
  | { type: 'ADD_NOTE'; stageId: StageId; note: string }
  | { type: 'SET_VIEW'; view: AppView }
  | { type: 'RESET' }
  | { type: 'RESTORE'; process: BreadProcess };

function logEvent(process: BreadProcess, event: Omit<ProcessEvent, 'timestamp'>): BreadProcess {
  return {
    ...process,
    eventLog: [...process.eventLog, { ...event, timestamp: Date.now() }],
  };
}

function reducer(state: BreadState, action: BreadAction): BreadState {
  switch (action.type) {
    case 'START_PROCESS': {
      const stages = calculateProcessTimeline(action.config);
      const now = Date.now();
      const process: BreadProcess = {
        id: crypto.randomUUID(),
        config: action.config,
        startTime: now,
        stages,
        currentStageIndex: 0,
        isComplete: false,
        createdAt: now,
        eventLog: [{
          timestamp: now,
          type: 'process_started',
          data: {
            recipe: action.config.name,
            flourBlend: action.config.flourBlendId,
            roomTempC: action.config.roomTempC,
            starterPercent: action.config.starterPercent,
            starterStrength: action.config.starterStrength,
            hydration: action.config.hydrationPercent,
            route: action.config.route,
            totalFlourGrams: action.config.totalFlourGrams,
          },
        }],
      };
      return { process, view: 'process' };
    }

    case 'NEXT_STEP': {
      if (!state.process) return state;
      const { stages, currentStageIndex } = state.process;
      const now = Date.now();
      const currentStage = stages[currentStageIndex];
      const endTime = currentStage.startTime + currentStage.calculatedDurationMs;
      const wasEarly = now < endTime;
      const actualDurationMs = now - currentStage.startTime;
      const deviationMs = actualDurationMs - currentStage.calculatedDurationMs;

      const updated = [...stages];
      updated[currentStageIndex] = {
        ...updated[currentStageIndex],
        completedAt: now,
      };

      const nextIndex = currentStageIndex + 1;
      const isComplete = nextIndex >= stages.length;

      if (!isComplete) {
        updated[nextIndex] = {
          ...updated[nextIndex],
          startTime: now,
        };
      }

      let process = {
        ...state.process,
        stages: updated,
        currentStageIndex: isComplete ? currentStageIndex : nextIndex,
        isComplete,
      };

      // Log stage completion
      process = logEvent(process, {
        type: wasEarly ? 'stage_skipped' : 'stage_completed',
        stageId: currentStage.id,
        data: {
          plannedDurationMs: currentStage.calculatedDurationMs,
          actualDurationMs,
          deviationMs,
          deviationPercent: Math.round((deviationMs / currentStage.calculatedDurationMs) * 100),
          wasEarly,
        },
      });

      // Log process completion
      if (isComplete) {
        process = logEvent(process, {
          type: 'process_completed',
          data: {
            totalDurationMs: now - state.process.startTime,
            stagesCompleted: stages.length,
          },
        });
      }

      return { ...state, process };
    }

    case 'COMPLETE_STRETCH_FOLD': {
      if (!state.process) return state;
      const { stages, currentStageIndex } = state.process;
      const current = stages[currentStageIndex];
      if (current.id !== 'stretch_fold') return state;

      const newCount = (current.stretchFoldCount ?? 0) + 1;
      const updated = [...stages];
      updated[currentStageIndex] = { ...current, stretchFoldCount: newCount };

      let process = { ...state.process, stages: updated };
      process = logEvent(process, {
        type: 'stretch_fold_done',
        stageId: 'stretch_fold',
        data: { foldNumber: newCount },
      });
      return { ...state, process };
    }

    case 'UPDATE_TEMPERATURE': {
      if (!state.process) return state;
      const oldTemp = state.process.config.roomTempC;
      const nextUncompletedIndex = state.process.stages.findIndex(
        (s, i) => i > state.process!.currentStageIndex && !s.completedAt
      );
      const fromIndex = nextUncompletedIndex >= 0 ? nextUncompletedIndex : state.process.currentStageIndex + 1;
      const updatedStages = recalculateFromStage(
        state.process.stages,
        fromIndex,
        action.tempC,
        state.process.config,
      );

      let process = {
        ...state.process,
        stages: updatedStages,
        config: { ...state.process.config, roomTempC: action.tempC },
      };
      process = logEvent(process, {
        type: 'temperature_changed',
        data: { oldTempC: oldTemp, newTempC: action.tempC },
      });
      return { ...state, process,
      };
    }

    case 'ADD_NOTE': {
      if (!state.process) return state;
      const updated = state.process.stages.map(s =>
        s.id === action.stageId ? { ...s, notes: (s.notes ? s.notes + '\n' : '') + action.note } : s
      );
      let process = { ...state.process, stages: updated };
      process = logEvent(process, {
        type: 'note_added',
        stageId: action.stageId,
        data: { note: action.note },
      });
      return { ...state, process };
    }

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'RESET':
      localStorage.removeItem(STORAGE_KEY);
      return { process: null, view: 'setup' };

    case 'RESTORE':
      return { process: action.process, view: 'process' };

    default:
      return state;
  }
}

const BreadContext = createContext<{
  state: BreadState;
  dispatch: React.Dispatch<BreadAction>;
} | null>(null);

export function BreadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { process: null, view: 'setup' });

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const process: BreadProcess = JSON.parse(stored);
        if (!process.isComplete) {
          dispatch({ type: 'RESTORE', process });
        }
      }
    } catch {
      // Invalid stored data
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (state.process) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.process));
    }
  }, [state.process]);

  return (
    <BreadContext.Provider value={{ state, dispatch }}>
      {children}
    </BreadContext.Provider>
  );
}

export function useBread() {
  const ctx = useContext(BreadContext);
  if (!ctx) throw new Error('useBread must be used within BreadProvider');

  const { state, dispatch } = ctx;
  const process = state.process;

  const currentStage = process ? process.stages[process.currentStageIndex] : null;
  const currentEndTime = currentStage
    ? currentStage.startTime + currentStage.calculatedDurationMs
    : null;

  const totalProgress = process
    ? process.stages.filter(s => s.completedAt !== null).length / process.stages.length
    : 0;

  return {
    state,
    dispatch,
    process,
    currentStage,
    currentEndTime,
    totalProgress,
  };
}
