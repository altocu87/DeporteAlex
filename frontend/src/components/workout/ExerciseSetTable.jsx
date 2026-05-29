import { useState } from 'react';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import SetRow from './SetRow.jsx';
import Badge from '../ui/Badge.jsx';

export default function ExerciseSetTable({ exercise, index, catalog, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = query.length >= 1
    ? catalog.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const selectedCatalog = catalog.find(e => e.id === exercise.exercise_catalog_id);

  function handleNameChange(name, id = null) {
    onChange({ ...exercise, exercise_name: name, exercise_catalog_id: id });
    setQuery(name);
    setShowSuggestions(false);
  }

  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      _id: Date.now(),
      set_number: exercise.sets.length + 1,
      reps: last?.reps ?? null,
      weight_kg: last?.weight_kg ?? null,
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  }

  function updateSet(i, updated) {
    const sets = exercise.sets.map((s, idx) => idx === i ? updated : s);
    onChange({ ...exercise, sets });
  }

  function deleteSet(i) {
    const sets = exercise.sets
      .filter((_, idx) => idx !== i)
      .map((s, idx) => ({ ...s, set_number: idx + 1 }));
    onChange({ ...exercise, sets });
  }

  return (
    <div className="bg-surface-2 rounded-xl border border-border p-4">
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={exercise.exercise_name || query}
              onChange={e => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                onChange({ ...exercise, exercise_name: e.target.value, exercise_catalog_id: null });
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Nombre del ejercicio..."
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
                {filtered.map(e => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-surface-2 cursor-pointer text-sm"
                    onMouseDown={() => handleNameChange(e.name, e.id)}
                  >
                    <span className="text-text-primary">{e.name}</span>
                    {e.muscle_group && <Badge>{e.muscle_group}</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedCatalog?.muscle_group && (
            <Badge className="mt-1">{selectedCatalog.muscle_group}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30">
            <ChevronUp size={16} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30">
            <ChevronDown size={16} />
          </button>
          <button type="button" onClick={onDelete} className="p-1 text-text-muted hover:text-red-400 ml-1">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Sets table */}
      {exercise.sets.length > 0 ? (
        <table className="w-full mb-2">
          <thead>
            <tr className="text-xs text-text-muted">
              <th className="text-center w-8">#</th>
              <th className="text-center px-1">Reps</th>
              <th className="text-center px-1">Peso (kg)</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set, i) => (
              <SetRow
                key={set._id ?? set.id ?? i}
                set={set}
                index={i}
                onChange={updated => updateSet(i, updated)}
                onDelete={() => deleteSet(i)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-text-muted text-center py-2">Sin series aún</p>
      )}

      <button
        type="button"
        onClick={addSet}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors mt-1"
      >
        <Plus size={14} />
        Agregar serie
      </button>
    </div>
  );
}
