import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import ExerciseSetTable from './ExerciseSetTable.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

function StarRating({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
              n <= value
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-muted hover:bg-border'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function newExercise(order_index) {
  return {
    _id: Date.now() + Math.random(),
    exercise_name: '',
    exercise_catalog_id: null,
    order_index,
    sets: [{ _id: Date.now(), set_number: 1, reps: null, weight_kg: null }],
  };
}

export default function WorkoutForm({ editData, onSaved }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(editData);

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    duration_min: '',
    energy_level: null,
    sleep_quality: null,
    notes: '',
    exercises: [newExercise(0)],
  });

  useEffect(() => {
    api.get('/catalog/exercises').then(setCatalog).catch(() => {});
    if (editData) {
      setForm({
        date: editData.date,
        name: editData.name || '',
        duration_min: editData.duration_min || '',
        energy_level: editData.energy_level,
        sleep_quality: editData.sleep_quality,
        notes: editData.notes || '',
        exercises: editData.exercises?.length
          ? editData.exercises.map(ex => ({
              ...ex,
              _id: ex.id,
              sets: ex.sets.map(s => ({ ...s, _id: s.id })),
            }))
          : [newExercise(0)],
      });
    }
  }, [editData]);

  function addExercise() {
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, newExercise(f.exercises.length)],
    }));
  }

  function updateExercise(i, updated) {
    setForm(f => ({
      ...f,
      exercises: f.exercises.map((ex, idx) => idx === i ? updated : ex),
    }));
  }

  function deleteExercise(i) {
    setForm(f => ({
      ...f,
      exercises: f.exercises
        .filter((_, idx) => idx !== i)
        .map((ex, idx) => ({ ...ex, order_index: idx })),
    }));
  }

  function moveExercise(i, dir) {
    setForm(f => {
      const exs = [...f.exercises];
      const j = i + dir;
      if (j < 0 || j >= exs.length) return f;
      [exs[i], exs[j]] = [exs[j], exs[i]];
      return { ...f, exercises: exs.map((ex, idx) => ({ ...ex, order_index: idx })) };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) { setError('La fecha es requerida'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        duration_min: form.duration_min ? Number(form.duration_min) : null,
        exercises: form.exercises
          .filter(ex => ex.exercise_name.trim())
          .map((ex, idx) => ({
            exercise_name: ex.exercise_name.trim(),
            exercise_catalog_id: ex.exercise_catalog_id,
            order_index: idx,
            sets: ex.sets.map((s, si) => ({
              set_number: si + 1,
              reps: s.reps,
              weight_kg: s.weight_kg,
            })),
          })),
      };

      if (isEdit) {
        await api.put(`/workouts/${editData.id}`, payload);
        onSaved?.();
      } else {
        const workout = await api.post('/workouts', payload);
        navigate(`/entrenamientos/${workout.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {!isEdit && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/entrenamientos')}
            className="text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="hidden lg:block text-xl font-bold text-text-primary">Nuevo Entrenamiento</h1>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
          <Input
            label="Nombre (opcional)"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Día de pecho..."
          />
        </div>
        <Input
          label="Duración (minutos)"
          type="number"
          min="1"
          value={form.duration_min}
          onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
          placeholder="60"
        />
        <div className="grid grid-cols-2 gap-3">
          <StarRating
            label="Energía"
            value={form.energy_level}
            onChange={v => setForm(f => ({ ...f, energy_level: v }))}
          />
          <StarRating
            label="Calidad del sueño"
            value={form.sleep_quality}
            onChange={v => setForm(f => ({ ...f, sleep_quality: v }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-muted">Notas</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Cómo fue el entrenamiento..."
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <h2 className="font-semibold text-text-primary">Ejercicios</h2>
        {form.exercises.map((ex, i) => (
          <ExerciseSetTable
            key={ex._id ?? i}
            exercise={ex}
            index={i}
            catalog={catalog}
            onChange={updated => updateExercise(i, updated)}
            onDelete={() => deleteExercise(i)}
            onMoveUp={() => moveExercise(i, -1)}
            onMoveDown={() => moveExercise(i, 1)}
            isFirst={i === 0}
            isLast={i === form.exercises.length - 1}
          />
        ))}
        <Button type="button" variant="secondary" onClick={addExercise} className="w-full">
          <Plus size={16} />
          Agregar ejercicio
        </Button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? <LoadingSpinner size={16} /> : <Save size={16} />}
        {isEdit ? 'Guardar cambios' : 'Guardar entrenamiento'}
      </Button>
    </form>
  );
}
