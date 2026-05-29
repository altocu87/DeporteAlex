import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ruler, Pencil, Trash2 } from 'lucide-react';
import Card from '../ui/Card.jsx';

function Stat({ label, value, unit }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">
        {value} <span className="text-xs font-normal text-text-muted">{unit}</span>
      </span>
    </div>
  );
}

export default function MeasurementCard({ m, onEdit, onDelete }) {
  const date = parseISO(m.date);
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Ruler size={16} className="text-primary" />
            <span className="font-semibold text-text-primary">
              {format(date, "d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <Stat label="Peso" value={m.weight_kg} unit="kg" />
            <Stat label="Cintura" value={m.waist_cm} unit="cm" />
            <Stat label="Pecho" value={m.chest_cm} unit="cm" />
            <Stat label="Brazos" value={m.arms_cm} unit="cm" />
            <Stat label="Piernas" value={m.legs_cm} unit="cm" />
            <Stat label="Cadera" value={m.hip_cm} unit="cm" />
            <Stat label="Grasa" value={m.body_fat_pct} unit="%" />
          </div>
          {m.notes && <p className="text-xs text-text-muted mt-2">{m.notes}</p>}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(m)} className="p-1.5 text-text-muted hover:text-primary transition-colors rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(m.id)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}
