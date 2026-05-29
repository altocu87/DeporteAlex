import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Pencil, Trash2, Clock, Battery, Moon } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import WorkoutForm from '../components/workout/WorkoutForm.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

function Dots({ value, max = 5, color = 'bg-primary' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < value ? color : 'bg-border'}`} />
      ))}
    </div>
  );
}

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setWorkout(await api.get(`/workouts/${id}`));
    } catch {
      navigate('/entrenamientos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    setDeleting(true);
    await api.delete(`/workouts/${id}`);
    navigate('/entrenamientos');
  }

  if (loading) return <LoadingSpinner className="py-20" size={32} />;
  if (!workout) return null;

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(false)} className="text-text-muted hover:text-text-primary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="hidden lg:block text-xl font-bold text-text-primary">Editar entrenamiento</h1>
        </div>
        <WorkoutForm editData={workout} onSaved={() => { setEditing(false); load(); }} />
      </div>
    );
  }

  const date = parseISO(workout.date);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/entrenamientos')} className="text-text-muted hover:text-text-primary mt-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-muted">{format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}</p>
          <h1 className="text-xl font-bold text-text-primary truncate">
            {workout.name || 'Entrenamiento'}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-muted">
            {workout.duration_min && (
              <span className="flex items-center gap-1"><Clock size={12} />{workout.duration_min} min</span>
            )}
            {workout.energy_level && (
              <span className="flex items-center gap-2">
                <Battery size={12} /> Energía <Dots value={workout.energy_level} />
              </span>
            )}
            {workout.sleep_quality && (
              <span className="flex items-center gap-2">
                <Moon size={12} /> Sueño <Dots value={workout.sleep_quality} color="bg-blue-400" />
              </span>
            )}
          </div>
          {workout.notes && (
            <p className="text-sm text-text-muted mt-2 bg-surface-2 rounded-lg px-3 py-2 border border-border">
              {workout.notes}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Exercises */}
      {workout.exercises?.length === 0 ? (
        <p className="text-center text-text-muted py-8">Sin ejercicios registrados</p>
      ) : (
        <div className="space-y-4">
          {workout.exercises?.map(ex => (
            <div key={ex.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{ex.exercise_name}</span>
                  {ex.muscle_group && <Badge>{ex.muscle_group}</Badge>}
                </div>
                <span className="text-xs text-text-muted">{ex.sets.length} series</span>
              </div>
              {ex.sets.length > 0 && (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-text-muted border-b border-border/50">
                      <th className="px-4 py-2 text-left w-8">#</th>
                      <th className="px-4 py-2 text-center">Reps</th>
                      <th className="px-4 py-2 text-center">Peso (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map(s => (
                      <tr key={s.id} className="border-b border-border/30 last:border-0 text-sm">
                        <td className="px-4 py-2 text-text-muted">{s.set_number}</td>
                        <td className="px-4 py-2 text-center text-text-primary">{s.reps ?? '—'}</td>
                        <td className="px-4 py-2 text-center text-text-primary">{s.weight_kg ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
