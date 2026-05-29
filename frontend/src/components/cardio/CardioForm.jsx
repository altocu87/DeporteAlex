import { useState } from 'react';
import { format } from 'date-fns';
import { api } from '../../api/client.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

const CARDIO_TYPES = ['Carrera', 'Ciclismo', 'Natación', 'Remo', 'Caminata', 'Elíptica', 'Saltar cuerda', 'Otro'];

function StarRating({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(value === n ? null : n)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${n <= value ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-border'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CardioForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || {
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Carrera',
    duration_min: '',
    distance_km: '',
    avg_heart_rate: '',
    max_heart_rate: '',
    calories: '',
    energy_level: null,
    sleep_quality: null,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.type || !form.duration_min) {
      setError('Fecha, tipo y duración son requeridos'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        duration_min: Number(form.duration_min),
        distance_km: form.distance_km ? Number(form.distance_km) : null,
        avg_heart_rate: form.avg_heart_rate ? Number(form.avg_heart_rate) : null,
        max_heart_rate: form.max_heart_rate ? Number(form.max_heart_rate) : null,
        calories: form.calories ? Number(form.calories) : null,
      };
      if (initial?.id) {
        await api.put(`/cardio/${initial.id}`, payload);
      } else {
        await api.post('/cardio', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        <Select label="Tipo" value={form.type} onChange={e => set('type', e.target.value)}>
          {CARDIO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Duración (min)" type="number" min="1" value={form.duration_min} onChange={e => set('duration_min', e.target.value)} placeholder="30" required />
        <Input label="Distancia (km)" type="number" min="0" step="0.01" value={form.distance_km} onChange={e => set('distance_km', e.target.value)} placeholder="5.0" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="FC media (bpm)" type="number" min="0" value={form.avg_heart_rate} onChange={e => set('avg_heart_rate', e.target.value)} placeholder="140" />
        <Input label="FC máx (bpm)" type="number" min="0" value={form.max_heart_rate} onChange={e => set('max_heart_rate', e.target.value)} placeholder="175" />
        <Input label="Calorías" type="number" min="0" value={form.calories} onChange={e => set('calories', e.target.value)} placeholder="400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StarRating label="Energía" value={form.energy_level} onChange={v => set('energy_level', v)} />
        <StarRating label="Sueño" value={form.sleep_quality} onChange={v => set('sleep_quality', v)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-muted">Notas</label>
        <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Cómo fue la sesión..."
          className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size={14} /> : null}
          {initial?.id ? 'Guardar cambios' : 'Registrar cardio'}
        </Button>
      </div>
    </form>
  );
}
