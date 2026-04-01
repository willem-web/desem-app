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

  const elapsedMin = currentStage?.id === 'bulk'
    ? (Date.now() - bulkStage.startTime) / 60000
    : bulkStage.completedAt
      ? totalMin
      : 0;

  return (
    <div className="card">
      <h3 className="font-semibold text-warm-800 mb-1 text-[15px]">Fermentatiecurve</h3>
      <p className="text-[13px] text-warm-400 mb-4">
        Geschatte volumetoename tijdens bulkfermentatie (doelrijs: {Math.round(target)}%)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D0D4DE" />
          <XAxis
            dataKey="timeMinutes"
            tickFormatter={v => `${Math.round(v / 60)}u`}
            tick={{ fontSize: 11, fill: '#8890A6' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8890A6' }}
            tickFormatter={v => `${v}%`}
            domain={[0, Math.ceil(target / 10) * 10 + 10]}
          />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value))}%`, 'Rijs']}
            labelFormatter={v => `${Math.round(Number(v) / 60 * 10) / 10}u`}
          />
          <defs>
            <linearGradient id="riseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FAB755" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FAB755" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="risePercent"
            stroke="#C6822A"
            strokeWidth={2}
            fill="url(#riseGradient)"
          />
          {elapsedMin > 0 && elapsedMin < totalMin && (
            <ReferenceLine
              x={Math.round(elapsedMin)}
              stroke="#7A6F37"
              strokeDasharray="4 4"
              label={{ value: 'Nu', position: 'top', fontSize: 11, fill: '#7A6F37' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
