import { useState, useCallback, useEffect, useRef } from 'react';

interface WakeLockHook {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): WakeLockHook {
  const [isSupported] = useState(() => 'wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!isSupported) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      sentinelRef.current.addEventListener('release', () => setIsActive(false));
    } catch {
      // Wake lock request failed (e.g., low battery)
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-acquire on visibility change
  useEffect(() => {
    if (!isSupported) return;

    const onVisibility = async () => {
      if (document.visibilityState === 'visible' && isActive && !sentinelRef.current) {
        await request();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isSupported, isActive, request]);

  return { isSupported, isActive, request, release };
}
