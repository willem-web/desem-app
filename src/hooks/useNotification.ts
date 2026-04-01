import { useState, useEffect, useCallback, useRef } from 'react';

interface NotificationHook {
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<void>;
  scheduleNotification: (title: string, body: string, delayMs: number) => string;
  cancelNotification: (id: string) => void;
  playSound: () => void;
}

export function useNotification(): NotificationHook {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const scheduleNotification = useCallback((title: string, body: string, delayMs: number): string => {
    const id = crypto.randomUUID();

    const timeout = setTimeout(() => {
      // Try native notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      // Always play sound as fallback
      playSound();
      timeouts.current.delete(id);
    }, delayMs);

    timeouts.current.set(id, timeout);
    return id;
  }, []);

  const cancelNotification = useCallback((id: string) => {
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gain.gain.value = 0.3;

      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
  }, []);

  return { permission, requestPermission, scheduleNotification, cancelNotification, playSound };
}
