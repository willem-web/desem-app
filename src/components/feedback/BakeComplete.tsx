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

  const tips = Object.entries(improvementTips).flatMap(([_, rules]) =>
    rules.filter(r => r.condition(scores)).map(r => r.tip)
  );

  if (saved) {
    return (
      <div className="p-6 space-y-5">
        <div className="text-center py-10">
          <div className="text-5xl mb-5">&#127838;</div>
          <h2 className="text-2xl font-bold text-warm-800">Opgeslagen!</h2>
          <p className="text-warm-400 mt-3 leading-relaxed">Je baksessie is opgeslagen in je baklogboek.</p>
        </div>

        {tips.length > 0 && (
          <div className="card bg-bread-50 border-bread-200">
            <h3 className="font-semibold text-bread-700 mb-3 text-[15px]">Verbeteradviezen</h3>
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-[13px] text-bread-600 flex gap-2.5">
                  <span>&#128161;</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-olive-500 to-olive-600 text-white font-bold text-base shadow-[var(--shadow-button)]"
        >
          Terug naar start
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="text-center py-6">
        <div className="text-4xl mb-3">&#127838;</div>
        <h2 className="text-2xl font-bold text-warm-800">Bakproces voltooid!</h2>
        <p className="text-warm-400 mt-2">Beoordeel je resultaat voor je baklogboek.</p>
      </div>

      {/* Score inputs */}
      {([
        ['kruim', 'Kruim', 'Open/gesloten/gelijkmatig'],
        ['korst', 'Korst', 'Kleur, dikte, knapprigheid'],
        ['smaak', 'Smaak', 'Zuurgraad, complexiteit'],
        ['ovenspring', 'Ovenspring', 'Volume, ear, scoring'],
        ['overall', 'Totaal', 'Algemene tevredenheid'],
      ] as const).map(([key, label, desc]) => (
        <div key={key} className="card">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="font-semibold text-warm-800 text-[15px]">{label}</span>
              <span className="text-[12px] text-warm-400 ml-2">{desc}</span>
            </div>
            <span className="text-[12px] text-warm-500 font-medium">{scoreLabels[scores[key]]}</span>
          </div>
          <div className="flex gap-2.5">
            {([1, 2, 3, 4, 5] as BakeScore[]).map(val => (
              <button
                key={val}
                onClick={() => updateScore(key, val)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  scores[key] === val
                    ? 'bg-bread-400 text-white shadow-sm'
                    : scores[key] >= val
                      ? 'bg-bread-100 text-bread-600'
                      : 'bg-warm-100 text-warm-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div className="card">
        <label className="block font-semibold text-warm-800 mb-3 text-[15px]">Notities</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Wat viel je op? Tips voor volgende keer?"
          className="w-full h-28 p-4 border border-warm-200 rounded-2xl text-[14px] resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-lg shadow-[var(--shadow-button)]"
      >
        Opslaan in baklogboek
      </button>
    </div>
  );
}
