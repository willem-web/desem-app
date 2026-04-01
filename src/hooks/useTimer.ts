import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  remainingMs: number;
  elapsedMs: number;
  progress: number; // 0-1
  isComplete: boolean;
  formatted: string;
}

/**
 * Countdown hook based on absolute timestamps.
 * Survives backgrounding via visibilitychange recalculation.
 */
export function useTimer(targetTime: number | null, totalDurationMs: number): TimerState {
  const calculate = useCallback((): TimerState => {
    if (!targetTime) {
      return { remainingMs: 0, elapsedMs: 0, progress: 0, isComplete: false, formatted: '--' };
    }

    const now = Date.now();
    const remaining = Math.max(0, targetTime - now);
    const elapsed = totalDurationMs - remaining;
    const progress = totalDurationMs > 0 ? Math.min(1, elapsed / totalDurationMs) : 0;
    const isComplete = remaining <= 0;

    return {
      remainingMs: remaining,
      elapsedMs: elapsed,
      progress,
      isComplete,
      formatted: formatDuration(remaining),
    };
  }, [targetTime, totalDurationMs]);

  const [state, setState] = useState(calculate);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetTime) return;

    // Update every second
    setState(calculate());
    intervalRef.current = setInterval(() => setState(calculate()), 1000);

    // Recalculate on visibility change (phone screen on/off)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setState(calculate());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetTime, calculate]);

  return state;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return 'Klaar!';

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}u ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
