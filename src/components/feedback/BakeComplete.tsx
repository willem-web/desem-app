import { useState } from 'react';
import type { BakeScore, BakeScores } from '@/types';
import { useBread } from '@/context/BreadContext';
import { useHistory } from '@/context/HistoryContext';

const scoreLabels: Record<BakeScore, string> = {
  1: 'Slecht',
  2: 'Matig',
  3: 'Oké',
  4: 'Goed',
  5: 'Uitstekend',
};

const improvementTips: Record<string, { condition: (s: BakeScores) => boolean; tip: string }[]> = {
  kruim: [
    { condition: s => s.kruim <= 2, tip: 'Dicht kruim? Probeer hogere hydratie of langere autolyse.' },
  ],
  korst: [
    { condition: s => s.korst <= 2, tip: 'Bleke korst? Meer stoom in eerste fase of hogere oventemperatuur.' },
  ],
  smaak: [
    { condition: s => s.smaak <= 2, tip: 'Te zuur? Verlaag koude rijstijd of verhoog deegtemperatuur.' },
  ],
  ovenspring: [
    { condition: s => s.ovenspring <= 2, tip: 'Weinig ovenspring? Controleer startersterkte en vormtechniek.' },
  ],
};

export function BakeComplete() {
  const { process, dispatch } = useBread();
  const { saveSession } = useHistory();
  const [scores, setScores] = useState<BakeScores>({
    kruim: 3, korst: 3, smaak: 3, ovenspring: 3, overall: 3,
  });
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  if (!process) return null;

  const updateScore = (key: keyof BakeScores, value: BakeScore) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSession(process, scores, notes);
    setSaved(true);
  };

  const handleFinish = () => {
    dispatch({ type: 'RESET' });
  };

  // Gather applicable tips
  const tips = Object.entries(improvementTips).flatMap(([_, rules]) =>
    rules.filter(r => r.condition(scores)).map(r => r.tip)
  );

  if (saved) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">&#127838;</div>
          <h2 className="text-xl font-bold text-amber-800">Opgeslagen!</h2>
          <p className="text-stone-500 mt-2">Je baksessie is opgeslagen in je baklogboek.</p>
        </div>

        {tips.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Verbeteradviezen</h3>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-amber-700 flex gap-2">
                  <span>&#128161;</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleFinish}
          className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
        >
          Terug naar start
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-4">
        <div className="text-3xl mb-2">&#127838;</div>
        <h2 className="text-xl font-bold text-amber-800">Bakproces voltooid!</h2>
        <p className="text-stone-500 text-sm mt-1">Beoordeel je resultaat voor je baklogboek.</p>
      </div>

      {/* Score inputs */}
      {([
        ['kruim', 'Kruim', 'Open/gesloten/gelijkmatig'],
        ['korst', 'Korst', 'Kleur, dikte, knapprigheid'],
        ['smaak', 'Smaak', 'Zuurgraad, complexiteit'],
        ['ovenspring', 'Ovenspring', 'Volume, ear, scoring'],
        ['overall', 'Totaal', 'Algemene tevredenheid'],
      ] as const).map(([key, label, desc]) => (
        <div key={key} className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="font-medium text-stone-800">{label}</span>
              <span className="text-xs text-stone-400 ml-2">{desc}</span>
            </div>
            <span className="text-xs text-stone-500">{scoreLabels[scores[key]]}</span>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as BakeScore[]).map(val => (
              <button
                key={val}
                onClick={() => updateScore(key, val)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  scores[key] === val
                    ? 'bg-amber-500 text-white'
                    : scores[key] >= val
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-100 text-stone-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <label className="block font-medium text-stone-800 mb-2">Notities</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Wat viel je op? Tips voor volgende keer?"
          className="w-full h-24 p-3 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:border-amber-400"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-xl bg-amber-600 text-white font-bold text-lg hover:bg-amber-700"
      >
        Opslaan in baklogboek
      </button>
    </div>
  );
}
