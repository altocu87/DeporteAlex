import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card.jsx';

function Metric({ label, value, unit, colorClass = 'text-text-primary' }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-xs text-text-muted truncate">{label}</span>
      <span className={`text-sm font-semibold ${colorClass}`}>
        {value}<span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function visceralColor(v) {
  if (v == null) return 'text-text-primary';
  if (v >= 10) return 'text-red-400';
  if (v >= 5)  return 'text-amber-400';
  return 'text-green-400';
}

const SEG_LABELS = [
  { fatKey: 'seg_fat_left_arm',  muscKey: 'seg_muscle_left_arm',  label: 'Brazo Izq.' },
  { fatKey: 'seg_fat_right_arm', muscKey: 'seg_muscle_right_arm', label: 'Brazo Der.' },
  { fatKey: 'seg_fat_trunk',     muscKey: 'seg_muscle_trunk',     label: 'Tronco' },
  { fatKey: 'seg_fat_right_leg', muscKey: 'seg_muscle_right_leg', label: 'Pierna Der.' },
  { fatKey: 'seg_fat_left_leg',  muscKey: 'seg_muscle_left_leg',  label: 'Pierna Izq.' },
];

export default function ComposicionCard({ record: r, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const hasSegmental = SEG_LABELS.some(s => r[s.fatKey] != null || r[s.muscKey] != null);

  return (
    <Card className="hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary flex-shrink-0" />
          <span className="font-semibold text-text-primary">
            {format(parseISO(r.date), "d 'de' MMMM yyyy", { locale: es })}
          </span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(r)} className="p-1.5 text-text-muted hover:text-primary transition-colors rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(r.id)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Fila 1: Métricas de peso */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Metric label="Peso" value={r.weight_kg} unit="kg" />
        <Metric label="IMC" value={r.bmi} unit="" />
        <Metric label="Peso magro" value={r.fat_free_weight} unit="kg" />
        <Metric label="Masa ósea" value={r.bone_mass} unit="kg" />
      </div>

      {/* Fila 2: Grasa */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Metric label="% Grasa" value={r.body_fat_pct} unit="%" colorClass="text-red-400" />
        <Metric label="Grasa subc." value={r.subcutaneous_fat} unit="%" colorClass="text-orange-400" />
        <Metric label="G. Visceral" value={r.visceral_fat} unit="" colorClass={visceralColor(r.visceral_fat)} />
        <div />
      </div>

      {/* Fila 3: Músculo */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Metric label="Masa muscular" value={r.muscle_mass} unit="kg" colorClass="text-blue-400" />
        <Metric label="% Esq." value={r.skeletal_muscle_pct} unit="%" colorClass="text-blue-300" />
        <Metric label="Agua" value={r.body_water_pct} unit="%" colorClass="text-cyan-400" />
        <Metric label="Proteína" value={r.protein_pct} unit="%" colorClass="text-green-400" />
      </div>

      {/* Fila 4: Metabolismo */}
      <div className="grid grid-cols-4 gap-3">
        <Metric label="TMB" value={r.bmr} unit="kcal" />
        <Metric label="Edad corporal" value={r.body_age} unit="años" />
        {r.notes ? (
          <div className="col-span-2">
            <span className="text-xs text-text-muted">{r.notes}</span>
          </div>
        ) : <><div /><div /></>}
      </div>

      {/* Segmental toggle */}
      {hasSegmental && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Análisis segmentario
          </button>
          {expanded && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted">
                    <th className="text-left pb-1.5 pr-4 font-medium">Segmento</th>
                    <th className="text-right pb-1.5 pr-4 font-medium text-red-400">Grasa %</th>
                    <th className="text-right pb-1.5 font-medium text-blue-400">Músculo %</th>
                  </tr>
                </thead>
                <tbody>
                  {SEG_LABELS.map(s => (
                    (r[s.fatKey] != null || r[s.muscKey] != null) && (
                      <tr key={s.label} className="border-t border-border/50">
                        <td className="py-1.5 pr-4 text-text-muted">{s.label}</td>
                        <td className="py-1.5 pr-4 text-right text-red-400 font-medium">
                          {r[s.fatKey] != null ? `${r[s.fatKey]}%` : '—'}
                        </td>
                        <td className="py-1.5 text-right text-blue-400 font-medium">
                          {r[s.muscKey] != null ? `${r[s.muscKey]}%` : '—'}
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
