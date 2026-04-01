import { useState, useEffect, useCallback, useRef } from 'react';

interface NotificationHook {
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<void>;
  scheduleNotification: (title: string, body: string, delayMs: number) => string;
  cancelNotification: (id: string) => void;
  playAlarm: () => void;
  stopAlarm: () => void;
}

export function useNotification(): NotificationHook {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(t => clearTimeout(t));
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const playBeep = useCallback((freq: number, duration: number, volume: number = 0.4) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = volume;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }, []);

  /**
   * Plays a repeating alarm pattern: 3 beeps, pause, repeat 5 times.
   */
  const playAlarm = useCallback(() => {
    // Stop any existing alarm
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);

    let count = 0;
    const maxRepeats = 15; // 5 groups of 3

    const ring = () => {
      if (count >= maxRepeats) {
        if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
        return;
      }
      const inGroup = count % 3;
      if (inGroup < 3) {
        playBeep(880, 0.15, 0.5);  // High A
        setTimeout(() => playBeep(1100, 0.15, 0.4), 180); // Higher tone
      }
      count++;
    };

    ring(); // Immediate first beep
    alarmIntervalRef.current = setInterval(ring, 400);

    // Also vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 300, 200, 100, 200, 100, 200]);
    }
  }, [playBeep]);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const scheduleNotification = useCallback((title: string, body: string, delayMs: number): string => {
    const id = crypto.randomUUID();
    const timeout = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      playAlarm();
      timeouts.current.delete(id);
    }, delayMs);
    timeouts.current.set(id, timeout);
    return id;
  }, [playAlarm]);

  const cancelNotification = useCallback((id: string) => {
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }, []);

  return { permission, requestPermission, scheduleNotification, cancelNotification, playAlarm, stopAlarm };
}
