import { Trash2 } from 'lucide-react';

export default function SetRow({ set, onChange, onDelete, index }) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-2 pr-2 text-xs text-text-muted text-center w-8">{index + 1}</td>
      <td className="py-2 px-1">
        <input
          type="number"
          min="1"
          value={set.reps ?? ''}
          onChange={e => onChange({ ...set, reps: e.target.value ? Number(e.target.value) : null })}
          placeholder="—"
          className="w-full bg-surface border border-border rounded px-2 py-1 text-sm text-text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </td>
      <td className="py-2 px-1">
        <input
          type="number"
          min="0"
          step="0.5"
          value={set.weight_kg ?? ''}
          onChange={e => onChange({ ...set, weight_kg: e.target.value ? Number(e.target.value) : null })}
          placeholder="—"
          className="w-full bg-surface border border-border rounded px-2 py-1 text-sm text-text-primary text-center focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </td>
      <td className="py-2 pl-1 w-8">
        <button
          type="button"
          onClick={onDelete}
          className="text-text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
