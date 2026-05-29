import { useEffect, useState } from 'react';
import { ListChecks, Plus, Trash2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ExerciseHistory from '../components/exercises/ExerciseHistory.jsx';

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Abdominales', 'Otro'];

function AddExerciseForm({ onAdded }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    setLoading(true); setError('');
    try {
      const exercise = await api.post('/catalog/exercises', {
        name: name.trim(),
        muscle_group: muscleGroup || null,
      });
      onAdded(exercise);
      setName('');
      setMuscleGroup('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-4">
      <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        Crear ejercicio personalizado
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Nombre del ejercicio..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1"
        />
        <Select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} className="sm:w-44">
          <option value="">Grupo muscular</option>
          {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
        <Button type="submit" disabled={loading} className="flex-shrink-0">
          {loading ? <LoadingSpinner size={14} /> : <Plus size={14} />}
          Crear
        </Button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </form>
  );
}

function ExerciseItem({ exercise, onDelete, onHistory }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-2 group transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-text-primary truncate">{exercise.name}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onHistory(exercise)}
          title="Ver historial"
          className="p-1.5 text-text-muted hover:text-primary rounded transition-colors"
        >
          <History size={15} />
        </button>
        <button
          onClick={() => onDelete(exercise)}
          title="Eliminar"
          className="p-1.5 text-text-muted hover:text-red-400 rounded transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function MuscleGroupSection({ group, exercises, onDelete, onHistory }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Badge>{group}</Badge>
          <span className="text-xs text-text-muted">{exercises.length} ejercicios</span>
        </div>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {open && (
        <div className="px-2 pb-2 border-t border-border/50 divide-y divide-border/30">
          {exercises.map(ex => (
            <ExerciseItem key={ex.id} exercise={ex} onDelete={onDelete} onHistory={onHistory} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyExercise, setHistoryExercise] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setExercises(await api.get('/catalog/exercises'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleAdded(exercise) {
    setExercises(prev => [...prev, exercise].sort((a, b) => {
      const gCmp = (a.muscle_group || 'Zzz').localeCompare(b.muscle_group || 'Zzz');
      return gCmp !== 0 ? gCmp : a.name.localeCompare(b.name);
    }));
  }

  async function handleDelete(exercise) {
    if (!confirm(`¿Eliminar "${exercise.name}" del catálogo?`)) return;
    try {
      await api.delete(`/catalog/exercises/${exercise.id}`);
      setExercises(prev => prev.filter(e => e.id !== exercise.id));
    } catch (err) {
      alert(err.message);
    }
  }

  // Group by muscle_group
  const groups = exercises.reduce((acc, ex) => {
    const g = ex.muscle_group || 'Sin grupo';
    if (!acc[g]) acc[g] = [];
    acc[g].push(ex);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Ejercicios</h1>
      </div>

      <AddExerciseForm onAdded={handleAdded} />

      {loading ? (
        <LoadingSpinner className="py-16" size={32} />
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <ListChecks size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin ejercicios en el catálogo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groups).map(([group, exs]) => (
            <MuscleGroupSection
              key={group}
              group={group}
              exercises={exs}
              onDelete={handleDelete}
              onHistory={setHistoryExercise}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(historyExercise)}
        onClose={() => setHistoryExercise(null)}
        title={historyExercise ? `Historial — ${historyExercise.name}` : ''}
        size="xl"
      >
        {historyExercise && (
          <ExerciseHistory exerciseName={historyExercise.name} />
        )}
      </Modal>
    </div>
  );
}
