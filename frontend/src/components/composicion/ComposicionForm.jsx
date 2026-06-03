import { useState } from 'react';
import { format } from 'date-fns';
import { ClipboardPaste, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.js';
import { parseFitdays, countExtracted } from '../../utils/fitdays-parser.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  weight_kg: '', bmi: '', fat_free_weight: '',
  body_fat_pct: '', subcutaneous_fat: '', visceral_fat: '',
  muscle_mass: '', skeletal_muscle_pct: '', bone_mass: '',
  body_water_pct: '', bmr: '', protein_pct: '',
  body_age: '',
  seg_fat_left_arm: '', seg_fat_right_arm: '',
  seg_fat_left_leg: '', seg_fat_right_leg: '', seg_fat_trunk: '',
  seg_muscle_left_arm: '', seg_muscle_right_arm: '',
  seg_muscle_left_leg: '', seg_muscle_right_leg: '', seg_muscle_trunk: '',
  notes: '',
};

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ImportSection({ onImport }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  function handleExtract() {
    const parsed = parseFitdays(text);
    const count = countExtracted(parsed);
    setResult({ parsed, count });
    if (count > 0) onImport(parsed);
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <ClipboardPaste size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">Importar desde informe Fitdays</span>
          <span className="text-xs text-text-muted">— pega el texto del PDF o la app</span>
        </div>
        {open ? <ChevronUp size={15} className="text-primary" /> : <ChevronDown size={15} className="text-primary" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-primary/20">
          <textarea
            rows={6}
            value={text}
            onChange={e => { setText(e.target.value); setResult(null); }}
            placeholder={"Pega aquí el texto copiado del informe Fitdays.\nEjemplo:\n  Peso 145.3 (62.6-84.7) 100.0 Alto\n  Grasa corporal 55.5 (8.9-17.8) 38.2 Alto\n  Grado de grasa visceral 20\n  Tasa metabólica basal 2331kcal\n  ..."}
            className="w-full mt-3 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs leading-relaxed"
          />
          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleExtract} disabled={!text.trim()}>
              <ClipboardPaste size={14} />
              Extraer y rellenar
            </Button>
            {result && (
              <div className={`flex items-center gap-1.5 text-sm ${result.count > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                {result.count > 0
                  ? <><CheckCircle size={14} /> {result.count} campos extraídos</>
                  : <><AlertCircle size={14} /> No se reconoció el formato</>
                }
              </div>
            )}
          </div>
          {result?.count > 0 && (
            <p className="text-xs text-text-muted">
              Los campos detectados se han rellenado abajo. Revisa y completa el resto manualmente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComposicionForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const num = v => (v !== '' && v !== null && v !== undefined) ? Number(v) : null;

  function handleImport(parsed) {
    setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined)) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) { setError('La fecha es requerida'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        date: form.date,
        weight_kg: num(form.weight_kg), bmi: num(form.bmi), fat_free_weight: num(form.fat_free_weight),
        body_fat_pct: num(form.body_fat_pct), subcutaneous_fat: num(form.subcutaneous_fat), visceral_fat: num(form.visceral_fat),
        muscle_mass: num(form.muscle_mass), skeletal_muscle_pct: num(form.skeletal_muscle_pct), bone_mass: num(form.bone_mass),
        body_water_pct: num(form.body_water_pct), bmr: num(form.bmr), protein_pct: num(form.protein_pct),
        body_age: num(form.body_age),
        seg_fat_left_arm: num(form.seg_fat_left_arm), seg_fat_right_arm: num(form.seg_fat_right_arm),
        seg_fat_left_leg: num(form.seg_fat_left_leg), seg_fat_right_leg: num(form.seg_fat_right_leg),
        seg_fat_trunk: num(form.seg_fat_trunk),
        seg_muscle_left_arm: num(form.seg_muscle_left_arm), seg_muscle_right_arm: num(form.seg_muscle_right_arm),
        seg_muscle_left_leg: num(form.seg_muscle_left_leg), seg_muscle_right_leg: num(form.seg_muscle_right_leg),
        seg_muscle_trunk: num(form.seg_muscle_trunk),
        notes: form.notes || null,
      };
      if (initial?.id) {
        await api.put(`/composition/${initial.id}`, payload);
      } else {
        await api.post('/composition', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const f = (label, key, placeholder, step = '0.1', min = '0') => (
    <Input
      label={label}
      type="number"
      min={min}
      step={step}
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      placeholder={placeholder}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Importar desde Fitdays */}
      {!initial?.id && <ImportSection onImport={handleImport} />}

      <Input label="Fecha" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />

      <SectionTitle>Peso y masa básica</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('Peso (kg)', 'weight_kg', '75.0')}
        {f('IMC', 'bmi', '23.5')}
        {f('Peso magro (kg)', 'fat_free_weight', '62.0')}
      </div>

      <SectionTitle>Composición de grasa</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('% Grasa corporal', 'body_fat_pct', '18.0')}
        {f('% Grasa subcutánea', 'subcutaneous_fat', '14.5')}
        {f('Grasa visceral (1-30)', 'visceral_fat', '5', '1', '1')}
      </div>

      <SectionTitle>Músculo y hueso</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('Masa muscular (kg)', 'muscle_mass', '55.0')}
        {f('% Músculo esq.', 'skeletal_muscle_pct', '42.5')}
        {f('Masa ósea (kg)', 'bone_mass', '3.20', '0.01')}
      </div>

      <SectionTitle>Fluidos y metabolismo</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('% Agua corporal', 'body_water_pct', '55.0')}
        {f('Proteína (%)', 'protein_pct', '18.0')}
        {f('TMB (kcal)', 'bmr', '1650', '1', '0')}
      </div>

      <SectionTitle>Edad corporal</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {f('Edad corporal (años)', 'body_age', '35', '1', '1')}
        <div />
      </div>

      <SectionTitle>Grasa segmentaria (%)</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('Brazo Izq.', 'seg_fat_left_arm', '28.5')}
        {f('Brazo Der.', 'seg_fat_right_arm', '27.8')}
        {f('Tronco', 'seg_fat_trunk', '22.1')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {f('Pierna Izq.', 'seg_fat_left_leg', '25.0')}
        {f('Pierna Der.', 'seg_fat_right_leg', '24.5')}
      </div>

      <SectionTitle>Músculo segmentario (%)</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {f('Brazo Izq.', 'seg_muscle_left_arm', '45.2')}
        {f('Brazo Der.', 'seg_muscle_right_arm', '46.1')}
        {f('Tronco', 'seg_muscle_trunk', '35.8')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {f('Pierna Izq.', 'seg_muscle_left_leg', '51.8')}
        {f('Pierna Der.', 'seg_muscle_right_leg', '52.3')}
      </div>

      <SectionTitle>Notas</SectionTitle>
      <textarea
        rows={2}
        value={form.notes}
        onChange={e => set('notes', e.target.value)}
        placeholder="Condiciones de la medición, hora del día..."
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size={14} /> : null}
          {initial?.id ? 'Guardar cambios' : 'Registrar composición'}
        </Button>
      </div>
    </form>
  );
}
