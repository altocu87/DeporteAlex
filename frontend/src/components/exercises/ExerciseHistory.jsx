import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '../../api/client.js';
import ExerciseProgressChart from '../charts/ExerciseProgressChart.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

export default function ExerciseHistory({ exerciseName }) {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseName) return;
    setLoading(true);
    Promise.all([
      api.get(`/progress/exercise/${encodeURIComponent(exerciseName)}/history`),
      api.get(`/progress/exercise/${encodeURIComponent(exerciseName)}`),
    ]).then(([hist, chart]) => {
      setHistory(hist);
      setChartData(chart);
    }).finally(() => setLoading(false));
  }, [exerciseName]);

  if (loading) return <LoadingSpinner className="py-10" size={28} />;

  if (!history.length) {
    return (
      <div className="text-center py-10 text-text-muted">
        <p className="font-medium">Sin historial para este ejercicio</p>
        <p className="text-sm mt-1">Regístralo en un entrenamiento para ver tu progreso</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Chart */}
      {chartData.length > 1 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-text-muted">
            <TrendingUp size={15} />
            Evolución — peso máx y volumen
          </div>
          <ExerciseProgressChart data={chartData} />
        </div>
      )}

      {/* Session list */}
      <div className="space-y-3">
        {history.map((session) => (
          <div key={`${session.workout_id}-${session.date}`} className="bg-surface-2 rounded-xl border border-border overflow-hidden">
            <Link
              to={`/entrenamientos/${session.workout_id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-border/30 transition-colors"
            >
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  {format(parseISO(session.date), "d 'de' MMMM yyyy", { locale: es })}
                </p>
                {session.workout_name && (
                  <p className="text-xs text-text-muted">{session.workout_name}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                {session.max_weight && (
                  <span className="font-semibold text-primary">{session.max_weight} kg máx</span>
                )}
                <span>{session.total_sets} series</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            {session.sets.length > 0 && (
              <table className="w-full border-t border-border/50">
                <thead>
                  <tr className="text-xs text-text-muted">
                    <th className="px-4 py-1.5 text-left w-8">#</th>
                    <th className="px-4 py-1.5 text-center">Reps</th>
                    <th className="px-4 py-1.5 text-center">Peso (kg)</th>
                    <th className="px-4 py-1.5 text-right">Volumen</th>
                  </tr>
                </thead>
                <tbody>
                  {session.sets.map((s) => (
                    <tr key={s.set_number} className="border-t border-border/30 text-sm">
                      <td className="px-4 py-1.5 text-text-muted">{s.set_number}</td>
                      <td className="px-4 py-1.5 text-center text-text-primary">{s.reps ?? '—'}</td>
                      <td className="px-4 py-1.5 text-center text-text-primary">{s.weight_kg ?? '—'}</td>
                      <td className="px-4 py-1.5 text-right text-text-muted">
                        {s.reps && s.weight_kg ? `${(s.reps * s.weight_kg).toLocaleString()} kg` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {session.volume > 0 && (
                  <tfoot>
                    <tr className="border-t border-border/50 text-xs text-text-muted bg-surface/50">
                      <td colSpan={3} className="px-4 py-1.5 text-right font-medium">Volumen total</td>
                      <td className="px-4 py-1.5 text-right font-semibold text-text-primary">
                        {session.volume.toLocaleString()} kg
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
