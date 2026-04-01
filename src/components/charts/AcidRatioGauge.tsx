import { lacticAcidFraction, flavorDescription, coldRetardFlavorNote } from '@/models/acidRatio';
import { useBread } from '@/context/BreadContext';

export function AcidRatioGauge() {
  const { process } = useBread();
  if (!process) return null;

  const bulkLactic = lacticAcidFraction(process.config.roomTempC);
  const bulkAcetic = 1 - bulkLactic;
  const flavor = flavorDescription(bulkLactic);

  const coldStage = process.stages.find(s => s.id === 'koude_rijs');
  const coldHours = coldStage ? coldStage.calculatedDurationMs / 3600000 : 0;
  const coldNote = coldHours > 0 ? coldRetardFlavorNote(coldHours) : null;

  // After cold retard, the ratio shifts toward acetic
  const finalLactic = coldHours > 0
    ? lacticAcidFraction(4) * 0.6 + bulkLactic * 0.4 // weighted blend
    : bulkLactic;
  const finalFlavor = flavorDescription(finalLactic);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-stone-800 mb-1">Zuurverhouding</h3>
        <p className="text-xs text-stone-500 mb-3">
          Verhouding melkzuur/azijnzuur bij {process.config.roomTempC}°C
        </p>

        {/* Bulk ratio bar */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-stone-600">Tijdens bulk ({process.config.roomTempC}°C)</div>
          <div className="flex h-6 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 flex items-center justify-center text-xs font-medium text-amber-900"
              style={{ width: `${bulkLactic * 100}%` }}
            >
              {Math.round(bulkLactic * 100)}%
            </div>
            <div
              className="bg-blue-400 flex items-center justify-center text-xs font-medium text-blue-900"
              style={{ width: `${bulkAcetic * 100}%` }}
            >
              {Math.round(bulkAcetic * 100)}%
            </div>
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>Melkzuur (mild)</span>
            <span>Azijnzuur (scherp)</span>
          </div>
          <div className="text-sm text-stone-700 mt-1">{flavor}</div>
        </div>
      </div>

      {/* Final ratio after cold retard */}
      {coldHours > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-stone-100">
          <div className="text-xs font-medium text-stone-600">
            Na koude rijs ({Math.round(coldHours)}u bij 4°C)
          </div>
          <div className="flex h-6 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 flex items-center justify-center text-xs font-medium text-amber-900"
              style={{ width: `${finalLactic * 100}%` }}
            >
              {Math.round(finalLactic * 100)}%
            </div>
            <div
              className="bg-blue-400 flex items-center justify-center text-xs font-medium text-blue-900"
              style={{ width: `${(1 - finalLactic) * 100}%` }}
            >
              {Math.round((1 - finalLactic) * 100)}%
            </div>
          </div>
          <div className="text-sm text-stone-700">{finalFlavor}</div>
          {coldNote && (
            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2 mt-1">{coldNote}</div>
          )}
        </div>
      )}
    </div>
  );
}
