import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  remainingMs: number;
  elapsedMs: number;
  progress: number;
  isComplete: boolean;
  justCompleted: boolean; // true on the tick when it first completes
  formatted: string;
}

export function useTimer(targetTime: number | null, totalDurationMs: number): TimerState {
  const wasCompleteRef = useRef(false);

  const calculate = useCallback((): TimerState => {
    if (!targetTime) {
      return { remainingMs: 0, elapsedMs: 0, progress: 0, isComplete: false, justCompleted: false, formatted: '--' };
    }
    const now = Date.now();
    const remaining = Math.max(0, targetTime - now);
    const elapsed = totalDurationMs - remaining;
    const progress = totalDurationMs > 0 ? Math.min(1, elapsed / totalDurationMs) : 0;
    const isComplete = remaining <= 0;
    const justCompleted = isComplete && !wasCompleteRef.current;

    if (isComplete) wasCompleteRef.current = true;

    return { remainingMs: remaining, elapsedMs: elapsed, progress, isComplete, justCompleted, formatted: formatDuration(remaining) };
  }, [targetTime, totalDurationMs]);

  const [state, setState] = useState(calculate);

  useEffect(() => {
    wasCompleteRef.current = false; // Reset on new target
  }, [targetTime]);

  useEffect(() => {
    if (!targetTime) return;
    setState(calculate());
    const interval = setInterval(() => setState(calculate()), 1000);
    const onVis = () => { if (document.visibilityState === 'visible') setState(calculate()); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVis); };
  }, [targetTime, calculate]);

  return state;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return 'Klaar!';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}u ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}
