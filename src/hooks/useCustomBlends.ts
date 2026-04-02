import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { FlourBlend } from '@/data/flourBlends';

export interface CustomBlend extends FlourBlend {
  isCustom: true;
}

export function useCustomBlends() {
  const [blends, setBlends] = useLocalStorage<CustomBlend[]>('desem_custom_blends', []);

  const addBlend = useCallback((blend: Omit<CustomBlend, 'id' | 'isCustom'>) => {
    const customBlend: CustomBlend = {
      ...blend,
      id: `custom-blend-${Date.now()}`,
      isCustom: true,
    };
    setBlends(prev => [...prev, customBlend]);
    return customBlend;
  }, [setBlends]);

  const updateBlend = useCallback((id: string, blend: Omit<CustomBlend, 'id' | 'isCustom'>) => {
    setBlends(prev =>
      prev.map(b => b.id === id ? { ...blend, id, isCustom: true as const } : b)
    );
  }, [setBlends]);

  const deleteBlend = useCallback((id: string) => {
    setBlends(prev => prev.filter(b => b.id !== id));
  }, [setBlends]);

  return { customBlends: blends, addBlend, updateBlend, deleteBlend };
}
