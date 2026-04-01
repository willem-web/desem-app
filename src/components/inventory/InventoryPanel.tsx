import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import type { FlourType, GrainType } from '@/types';

export function InventoryPanel({ onClose }: { onClose: () => void }) {
  const { inventory, updateStock, addFlour, removeFlour, getLowStock } = useInventory();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<FlourType>('T65');
  const [newGrain, setNewGrain] = useState<GrainType>('tarwe');
  const [newStock, setNewStock] = useState(1000);

  const lowStock = getLowStock();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addFlour({
      name: newName,
      type: newType,
      grain: newGrain,
      proteinPercent: 12,
      ashPercent: 0.65,
      stockGrams: newStock,
      lowStockThreshold: 500,
    });
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="min-h-dvh bg-stone-50">
      <div className="sticky top-0 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 z-10 flex items-center justify-between">
        <div className="text-lg font-bold text-amber-800">Voorraad</div>
        <button onClick={onClose} className="text-sm text-stone-500">Sluiten</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Low stock warning */}
        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-800 mb-2">Lage voorraad</h3>
            {lowStock.map(item => (
              <div key={item.id} className="text-sm text-red-700">
                {item.name}: <strong>{item.stockGrams}g</strong> (drempel: {item.lowStockThreshold}g)
              </div>
            ))}
          </div>
        )}

        {/* Inventory list */}
        {inventory.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-stone-800">{item.name}</div>
                <div className="text-xs text-stone-400">
                  {item.type} &middot; {item.grain} &middot; {item.proteinPercent}% eiwit
                </div>
              </div>
              <button
                onClick={() => removeFlour(item.id)}
                className="text-xs text-stone-300 hover:text-red-500"
              >
                Verwijder
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-stone-600 w-16">Voorraad:</label>
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => updateStock(item.id, Math.max(0, (item.stockGrams ?? 0) - 100))}
                  className="w-8 h-8 rounded-lg border border-stone-200 text-stone-500 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.stockGrams ?? 0}
                  onChange={e => updateStock(item.id, Number(e.target.value))}
                  className="flex-1 text-center p-2 border border-stone-200 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => updateStock(item.id, (item.stockGrams ?? 0) + 100)}
                  className="w-8 h-8 rounded-lg border border-stone-200 text-stone-500 font-bold"
                >
                  +
                </button>
                <span className="text-sm text-stone-400 w-4">g</span>
              </div>
            </div>

            {/* Low stock indicator */}
            {(item.stockGrams ?? 0) > 0 && (item.stockGrams ?? 0) < (item.lowStockThreshold ?? 500) && (
              <div className="mt-2 text-xs text-red-500">Onder drempelwaarde!</div>
            )}
          </div>
        ))}

        {/* Add new flour */}
        {showAdd ? (
          <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
            <h3 className="font-semibold text-stone-800">Nieuw meel toevoegen</h3>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Naam (bijv. Bio Tarwebloem)"
              className="w-full p-3 border border-stone-200 rounded-lg text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone-500">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as FlourType)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                >
                  {['T45', 'T65', 'T80', 'T150', 'spelt', 'rogge'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500">Graansoort</label>
                <select
                  value={newGrain}
                  onChange={e => setNewGrain(e.target.value as GrainType)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                >
                  {['tarwe', 'spelt', 'rogge'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500">Voorraad (g)</label>
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(Number(e.target.value))}
                className="w-full p-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-stone-500 text-sm"
              >
                Annuleren
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium"
              >
                Toevoegen
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 text-sm hover:border-amber-300"
          >
            + Nieuw meel toevoegen
          </button>
        )}

        {/* Shopping list */}
        {lowStock.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h3 className="font-semibold text-stone-800 mb-2">Boodschappenlijstje</h3>
            {lowStock.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-stone-100 last:border-0">
                <span className="text-stone-700">{item.name}</span>
                <span className="text-stone-400">
                  bijkopen: {(item.lowStockThreshold ?? 500) - (item.stockGrams ?? 0)}g+
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
