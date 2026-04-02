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
    <div className="min-h-dvh bg-warm-50">
      <div className="sticky top-0 bg-warm-50/90 backdrop-blur-xl border-b border-warm-200/60 px-6 py-4 z-10 flex items-center justify-between safe-top">
        <div className="text-lg font-bold text-warm-800">Voorraad</div>
        <button onClick={onClose} className="text-[13px] text-warm-400 font-medium">Sluiten</button>
      </div>

      <div className="p-6 space-y-5">
        {/* Low stock warning */}
        {lowStock.length > 0 && (
          <div className="card bg-red-50 border-red-100">
            <h3 className="font-semibold text-red-600 mb-2 text-[15px]">Lage voorraad</h3>
            {lowStock.map(item => (
              <div key={item.id} className="text-[13px] text-red-500">
                {item.name}: <strong>{item.stockGrams}g</strong> (drempel: {item.lowStockThreshold}g)
              </div>
            ))}
          </div>
        )}

        {/* Inventory list */}
        {inventory.map(item => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold text-warm-800 text-[15px]">{item.name}</div>
                <div className="text-[12px] text-warm-400 mt-1">
                  {item.type} &middot; {item.grain} &middot; {item.proteinPercent}% eiwit
                </div>
              </div>
              <button
                onClick={() => removeFlour(item.id)}
                className="text-[12px] text-warm-300 hover:text-red-500 transition-colors"
              >
                Verwijder
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[13px] text-warm-500 w-16">Voorraad:</label>
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  onClick={() => updateStock(item.id, Math.max(0, (item.stockGrams ?? 0) - 100))}
                  className="w-10 h-10 rounded-xl border border-warm-200 text-warm-500 font-bold bg-white shadow-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.stockGrams ?? 0}
                  onChange={e => updateStock(item.id, Number(e.target.value))}
                  className="flex-1 text-center p-2.5 border border-warm-200 rounded-xl text-[14px] font-mono"
                />
                <button
                  onClick={() => updateStock(item.id, (item.stockGrams ?? 0) + 100)}
                  className="w-10 h-10 rounded-xl border border-warm-200 text-warm-500 font-bold bg-white shadow-sm"
                >
                  +
                </button>
                <span className="text-[13px] text-warm-400 w-4">g</span>
              </div>
            </div>

            {(item.stockGrams ?? 0) > 0 && (item.stockGrams ?? 0) < (item.lowStockThreshold ?? 500) && (
              <div className="mt-3 text-[12px] text-red-500 font-medium">Onder drempelwaarde!</div>
            )}
          </div>
        ))}

        {/* Add new flour */}
        {showAdd ? (
          <div className="card border-bread-200 space-y-4">
            <h3 className="font-semibold text-warm-800 text-[15px]">Nieuw meel toevoegen</h3>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Naam (bijv. Bio Tarwebloem)"
              className="w-full p-3.5 border border-warm-200 rounded-2xl text-[14px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-warm-500 font-medium">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as FlourType)}
                  className="w-full p-3 border border-warm-200 rounded-xl text-[14px] mt-1"
                >
                  {['T45', 'T65', 'T80', 'T150', 'spelt', 'rogge'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-warm-500 font-medium">Graansoort</label>
                <select
                  value={newGrain}
                  onChange={e => setNewGrain(e.target.value as GrainType)}
                  className="w-full p-3 border border-warm-200 rounded-xl text-[14px] mt-1"
                >
                  {['tarwe', 'spelt', 'rogge'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[12px] text-warm-500 font-medium">Voorraad (g)</label>
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(Number(e.target.value))}
                className="w-full p-3 border border-warm-200 rounded-xl text-[14px] mt-1"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-2xl border border-warm-200 text-warm-500 text-[14px] font-medium"
              >
                Annuleren
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 rounded-2xl bg-bread-400 text-white text-[14px] font-semibold shadow-[var(--shadow-button)]"
              >
                Toevoegen
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-warm-300 text-warm-400 text-[14px] font-medium hover:border-bread-300 hover:text-bread-500 transition-all"
          >
            + Nieuw meel toevoegen
          </button>
        )}

        {/* Shopping list */}
        {lowStock.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-warm-800 mb-3 text-[15px]">Boodschappenlijstje</h3>
            {lowStock.map(item => (
              <div key={item.id} className="flex justify-between text-[14px] py-2.5 border-b border-warm-100 last:border-0">
                <span className="text-warm-700">{item.name}</span>
                <span className="text-warm-400">
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
