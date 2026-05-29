import { useState } from 'react';
import { format } from 'date-fns';
import { api } from '../../api/client.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

export default function MeasurementForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || {
    date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '', waist_cm: '', chest_cm: '',
    arms_cm: '', legs_cm: '', hip_cm: '',
    body_fat_pct: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const num = v => v ? Number(v) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) { setError('La fecha es requerida'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        date: form.date,
        weight_kg: num(form.weight_kg),
        waist_cm: num(form.waist_cm),
        chest_cm: num(form.chest_cm),
        arms_cm: num(form.arms_cm),
        legs_cm: num(form.legs_cm),
        hip_cm: num(form.hip_cm),
        body_fat_pct: num(form.body_fat_pct),
        notes: form.notes || null,
      };
      if (initial?.id) {
        await api.put(`/measurements/${initial.id}`, payload);
      } else {
        await api.post('/measurements', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (label, key, placeholder) => (
    <Input
      label={label}
      type="number"
      min="0"
      step="0.1"
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      placeholder={placeholder}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Fecha" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        {field('Peso (kg)', 'weight_kg', '75.0')}
        {field('% Grasa corporal', 'body_fat_pct', '18.0')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('Cintura (cm)', 'waist_cm', '80')}
        {field('Pecho (cm)', 'chest_cm', '95')}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {field('Brazos (cm)', 'arms_cm', '35')}
        {field('Piernas (cm)', 'legs_cm', '55')}
        {field('Cadera (cm)', 'hip_cm', '95')}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-muted">Notas</label>
        <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Condiciones de la medición..."
          className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size={14} /> : null}
          {initial?.id ? 'Guardar cambios' : 'Registrar medidas'}
        </Button>
      </div>
    </form>
  );
}
