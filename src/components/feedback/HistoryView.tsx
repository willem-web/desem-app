import { useHistory } from '@/context/HistoryContext';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export function HistoryView() {
  const { history } = useHistory();

  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-4xl mb-4">&#128214;</div>
        <h2 className="text-lg font-bold text-stone-700">Nog geen baksessies</h2>
        <p className="text-stone-500 text-sm mt-2">
          Na je eerste bakproces verschijnt hier je logboek met scores en statistieken.
        </p>
      </div>
    );
  }

  const avgOverall = history.reduce((sum, r) => sum + r.scores.overall, 0) / history.length;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-amber-800">Baklogboek</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sessies" value={String(history.length)} />
        <StatCard label="Gem. score" value={avgOverall.toFixed(1)} />
        <StatCard
          label="Beste"
          value={String(Math.max(...history.map(r => r.scores.overall)))}
        />
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {history.map(result => {
          const dateStr = format(new Date(result.date), 'd MMM yyyy', { locale: nl });
          const scoreBar = ['kruim', 'korst', 'smaak', 'ovenspring'] as const;

          return (
            <div key={result.id} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-stone-800">{result.config.name}</div>
                  <div className="text-xs text-stone-400">{dateStr}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600">
                    {result.scores.overall}/5
                  </div>
                </div>
              </div>

              {/* Mini score bars */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {scoreBar.map(key => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-stone-400 capitalize mb-1">{key}</div>
                    <div className="flex gap-0.5 justify-center">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div
                          key={v}
                          className={`w-2 h-2 rounded-full ${
                            v <= result.scores[key] ? 'bg-amber-400' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Config summary */}
              <div className="mt-3 flex gap-2 flex-wrap">
                <Tag>{result.config.flourType}</Tag>
                <Tag>{result.config.hydrationPercent}% hydratie</Tag>
                <Tag>{result.config.roomTempC}°C</Tag>
                <Tag>{result.config.route === 'koud' ? 'Koude rijs' : 'Warm'}</Tag>
              </div>

              {result.notes && (
                <div className="mt-2 text-xs text-stone-500 italic">"{result.notes}"</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
      <div className="text-xl font-bold text-amber-700">{value}</div>
      <div className="text-xs text-stone-400">{label}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}
