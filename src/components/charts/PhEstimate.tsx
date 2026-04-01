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
    <div className="card">
      <h3 className="font-semibold text-warm-800 mb-1 text-[15px]">pH-schatting</h3>
      <p className="text-[13px] text-warm-400 mb-4">
        Verwachte pH-daling tijdens bulkfermentatie (start: {startPh})
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D0D4DE" />
          <XAxis
            dataKey="timeMinutes"
            tickFormatter={v => `${Math.round(v / 60)}u`}
            tick={{ fontSize: 11, fill: '#8890A6' }}
          />
          <YAxis
            reversed
            domain={[4.0, Math.ceil(startPh * 10) / 10]}
            tick={{ fontSize: 11, fill: '#8890A6' }}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), 'pH']}
            labelFormatter={v => `${Math.round(Number(v) / 60 * 10) / 10}u`}
          />
          <ReferenceArea y1={4.2} y2={4.5} fill="#C6D3F7" fillOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="ph"
            stroke="#4C587A"
            strokeWidth={2}
            dot={false}
          />
          {elapsedMin > 0 && elapsedMin < totalMin && (
            <ReferenceLine
              x={Math.round(elapsedMin)}
              stroke="#7A6F37"
              strokeDasharray="4 4"
              label={{ value: 'Nu', position: 'top', fontSize: 11, fill: '#7A6F37' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-2.5 mt-3 text-[12px] text-warm-400">
        <span className="w-3.5 h-3.5 rounded bg-lav-200 inline-block" />
        Doelzone (pH 4.2 - 4.5)
      </div>
    </div>
  );
}
