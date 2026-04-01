import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { FlourInventoryItem, FlourType } from '@/types';

const STORAGE_KEY = 'desem-inventory';

interface InventoryContextType {
  inventory: FlourInventoryItem[];
  addFlour: (item: Omit<FlourInventoryItem, 'id' | 'lastUpdated'>) => void;
  updateStock: (id: string, grams: number) => void;
  removeFlour: (id: string) => void;
  deductForBake: (flourType: FlourType, grams: number) => void;
  getLowStock: () => FlourInventoryItem[];
}

const defaultFlours: FlourInventoryItem[] = [
  {
    id: 'default-t65',
    name: 'Tarwebloem T65',
    type: 'T65',
    grain: 'tarwe',
    proteinPercent: 12,
    ashPercent: 0.65,
    stockGrams: 0,
    lowStockThreshold: 500,
    lastUpdated: Date.now(),
  },
  {
    id: 'default-t80',
    name: 'Tarwebloem T80',
    type: 'T80',
    grain: 'tarwe',
    proteinPercent: 13,
    ashPercent: 0.8,
    stockGrams: 0,
    lowStockThreshold: 500,
    lastUpdated: Date.now(),
  },
  {
    id: 'default-t150',
    name: 'Volkoren tarwe',
    type: 'T150',
    grain: 'tarwe',
    proteinPercent: 14,
    ashPercent: 1.5,
    stockGrams: 0,
    lowStockThreshold: 500,
    lastUpdated: Date.now(),
  },
  {
    id: 'default-spelt',
    name: 'Speltbloem',
    type: 'spelt',
    grain: 'spelt',
    proteinPercent: 14,
    ashPercent: 0.7,
    stockGrams: 0,
    lowStockThreshold: 500,
    lastUpdated: Date.now(),
  },
];

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useLocalStorage<FlourInventoryItem[]>(STORAGE_KEY, defaultFlours);

  const addFlour = useCallback((item: Omit<FlourInventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: FlourInventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      lastUpdated: Date.now(),
    };
    setInventory(prev => [...prev, newItem]);
  }, [setInventory]);

  const updateStock = useCallback((id: string, grams: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, stockGrams: Math.max(0, grams), lastUpdated: Date.now() }
          : item
      )
    );
  }, [setInventory]);

  const removeFlour = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, [setInventory]);

  const deductForBake = useCallback((flourType: FlourType, grams: number) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.type === flourType && (item.stockGrams ?? 0) > 0) {
          const newStock = Math.max(0, (item.stockGrams ?? 0) - grams);
          return { ...item, stockGrams: newStock, lastUpdated: Date.now() };
        }
        return item;
      })
    );
  }, [setInventory]);

  const getLowStock = useCallback(() => {
    return inventory.filter(item =>
      (item.stockGrams ?? 0) > 0 &&
      (item.stockGrams ?? 0) < (item.lowStockThreshold ?? 500)
    );
  }, [inventory]);

  return (
    <InventoryContext.Provider value={{ inventory, addFlour, updateStock, removeFlour, deductForBake, getLowStock }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
