import { useHistory } from '@/context/HistoryContext';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export function HistoryView() {
  const { history } = useHistory();

  if (history.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-5xl mb-5">&#128214;</div>
        <h2 className="text-xl font-bold text-warm-700">Nog geen baksessies</h2>
        <p className="text-warm-400 mt-3 leading-relaxed">
          Na je eerste bakproces verschijnt hier je logboek met scores en statistieken.
        </p>
      </div>
    );
  }

  const avgOverall = history.reduce((sum, r) => sum + r.scores.overall, 0) / history.length;

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-warm-800">Baklogboek</h2>

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
      <div className="space-y-4">
        {history.map(result => {
          const dateStr = format(new Date(result.date), 'd MMM yyyy', { locale: nl });
          const scoreBar = ['kruim', 'korst', 'smaak', 'ovenspring'] as const;

          return (
            <div key={result.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-warm-800 text-[15px]">{result.config.name}</div>
                  <div className="text-[12px] text-warm-400 mt-0.5">{dateStr}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-bread-500">
                    {result.scores.overall}/5
                  </div>
                </div>
              </div>

              {/* Mini score bars */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {scoreBar.map(key => (
                  <div key={key} className="text-center">
                    <div className="text-[11px] text-warm-400 capitalize mb-1.5">{key}</div>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div
                          key={v}
                          className={`w-2.5 h-2.5 rounded-full ${
                            v <= result.scores[key] ? 'bg-bread-300' : 'bg-warm-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Config summary */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <Tag>{result.config.flourType}</Tag>
                <Tag>{result.config.hydrationPercent}% hydratie</Tag>
                <Tag>{result.config.roomTempC}°C</Tag>
                <Tag>{result.config.route === 'koud' ? 'Koude rijs' : 'Warm'}</Tag>
              </div>

              {result.notes && (
                <div className="mt-3 text-[13px] text-warm-400 italic leading-relaxed">"{result.notes}"</div>
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
    <div className="card text-center py-4">
      <div className="text-xl font-bold text-bread-500">{value}</div>
      <div className="text-[12px] text-warm-400 mt-1">{label}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] bg-warm-100 text-warm-500 px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}
