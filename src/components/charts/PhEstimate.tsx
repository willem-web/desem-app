import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { generatePhCurve, startingPhForFlour } from '@/models/phModel';
import { useBread } from '@/context/BreadContext';

export function PhEstimate() {
  const { process, currentStage } = useBread();
  if (!process) return null;

  const bulkStage = process.stages.find(s => s.id === 'bulk');
  if (!bulkStage) return null;

  const totalMin = bulkStage.calculatedDurationMs / 60000;
  const startPh = startingPhForFlour(process.config.flourType);
  const data = generatePhCurve(totalMin, Math.max(10, totalMin / 30), startPh, 4.3);

  const elapsedMin = currentStage?.id === 'bulk'
    ? (Date.now() - bulkStage.startTime) / 60000
    : bulkStage.completedAt
      ? totalMin
      : 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <h3 className="font-semibold text-stone-800 mb-1">pH-schatting</h3>
      <p className="text-xs text-stone-500 mb-3">
        Verwachte pH-daling tijdens bulkfermentatie (start: {startPh})
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="timeMinutes"
            tickFormatter={v => `${Math.round(v / 60)}u`}
            tick={{ fontSize: 11, fill: '#78716c' }}
          />
          <YAxis
            reversed
            domain={[4.0, Math.ceil(startPh * 10) / 10]}
            tick={{ fontSize: 11, fill: '#78716c' }}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), 'pH']}
            labelFormatter={v => `${Math.round(Number(v) / 60 * 10) / 10}u`}
          />
          {/* Target zone highlight */}
          <ReferenceArea y1={4.2} y2={4.5} fill="#bbf7d0" fillOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="ph"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
          />
          {elapsedMin > 0 && elapsedMin < totalMin && (
            <ReferenceLine
              x={Math.round(elapsedMin)}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{ value: 'Nu', position: 'top', fontSize: 11, fill: '#dc2626' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
        <span className="w-3 h-3 rounded bg-green-200 inline-block" />
        Doelzone (pH 4.2 - 4.5)
      </div>
    </div>
  );
}
