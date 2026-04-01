import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { generateRiseCurve, targetRisePercent } from '@/models/fermentation';
import { useBread } from '@/context/BreadContext';

export function FermentationCurve() {
  const { process, currentStage } = useBread();
  if (!process) return null;

  const bulkStage = process.stages.find(s => s.id === 'bulk');
  if (!bulkStage) return null;

  const totalMin = bulkStage.calculatedDurationMs / 60000;
  const target = targetRisePercent(process.config.roomTempC);
  const data = generateRiseCurve(totalMin, target, Math.max(10, totalMin / 30));

  // Current progress through bulk
  const elapsedMin = currentStage?.id === 'bulk'
    ? (Date.now() - bulkStage.startTime) / 60000
    : bulkStage.completedAt
      ? totalMin
      : 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <h3 className="font-semibold text-stone-800 mb-1">Fermentatiecurve</h3>
      <p className="text-xs text-stone-500 mb-3">
        Geschatte volumetoename tijdens bulkfermentatie (doelrijs: {Math.round(target)}%)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="timeMinutes"
            tickFormatter={v => `${Math.round(v / 60)}u`}
            tick={{ fontSize: 11, fill: '#78716c' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#78716c' }}
            tickFormatter={v => `${v}%`}
            domain={[0, Math.ceil(target / 10) * 10 + 10]}
          />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value))}%`, 'Rijs']}
            labelFormatter={v => `${Math.round(Number(v) / 60 * 10) / 10}u`}
          />
          <defs>
            <linearGradient id="riseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="risePercent"
            stroke="#d97706"
            strokeWidth={2}
            fill="url(#riseGradient)"
          />
          {elapsedMin > 0 && elapsedMin < totalMin && (
            <ReferenceLine
              x={Math.round(elapsedMin)}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{ value: 'Nu', position: 'top', fontSize: 11, fill: '#dc2626' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
