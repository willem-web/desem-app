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

  const finalLactic = coldHours > 0
    ? lacticAcidFraction(4) * 0.6 + bulkLactic * 0.4
    : bulkLactic;
  const finalFlavor = flavorDescription(finalLactic);

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-semibold text-warm-800 mb-1 text-[15px]">Zuurverhouding</h3>
        <p className="text-[13px] text-warm-400 mb-4">
          Verhouding melkzuur/azijnzuur bij {process.config.roomTempC}°C
        </p>

        <div className="space-y-2">
          <div className="text-[12px] font-medium text-warm-600">Tijdens bulk ({process.config.roomTempC}°C)</div>
          <div className="flex h-7 rounded-full overflow-hidden">
            <div
              className="bg-bread-300 flex items-center justify-center text-[12px] font-semibold text-bread-800"
              style={{ width: `${bulkLactic * 100}%` }}
            >
              {Math.round(bulkLactic * 100)}%
            </div>
            <div
              className="bg-lav-300 flex items-center justify-center text-[12px] font-semibold text-lav-800"
              style={{ width: `${bulkAcetic * 100}%` }}
            >
              {Math.round(bulkAcetic * 100)}%
            </div>
          </div>
          <div className="flex justify-between text-[12px] text-warm-400">
            <span>Melkzuur (mild)</span>
            <span>Azijnzuur (scherp)</span>
          </div>
          <div className="text-[14px] text-warm-700 mt-1">{flavor}</div>
        </div>
      </div>

      {coldHours > 0 && (
        <div className="space-y-2 pt-4 border-t border-warm-100">
          <div className="text-[12px] font-medium text-warm-600">
            Na koude rijs ({Math.round(coldHours)}u bij 4°C)
          </div>
          <div className="flex h-7 rounded-full overflow-hidden">
            <div
              className="bg-bread-300 flex items-center justify-center text-[12px] font-semibold text-bread-800"
              style={{ width: `${finalLactic * 100}%` }}
            >
              {Math.round(finalLactic * 100)}%
            </div>
            <div
              className="bg-lav-300 flex items-center justify-center text-[12px] font-semibold text-lav-800"
              style={{ width: `${(1 - finalLactic) * 100}%` }}
            >
              {Math.round((1 - finalLactic) * 100)}%
            </div>
          </div>
          <div className="text-[14px] text-warm-700">{finalFlavor}</div>
          {coldNote && (
            <div className="text-[13px] text-lav-600 bg-lav-50 rounded-2xl p-3 mt-2 leading-relaxed">{coldNote}</div>
          )}
        </div>
      )}
    </div>
  );
}
