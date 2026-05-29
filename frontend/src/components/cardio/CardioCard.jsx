import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wind, Clock, MapPin, Heart, Flame, Pencil, Trash2 } from 'lucide-react';
import Card from '../ui/Card.jsx';

export default function CardioCard({ session, onEdit, onDelete }) {
  const date = parseISO(session.date);
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-muted">
              {format(date, "d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-primary flex-shrink-0" />
            <h3 className="font-semibold text-text-primary">{session.type}</h3>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {session.duration_min} min
            </span>
            {session.distance_km && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {session.distance_km} km
              </span>
            )}
            {session.avg_heart_rate && (
              <span className="flex items-center gap-1">
                <Heart size={12} />
                {session.avg_heart_rate} bpm
              </span>
            )}
            {session.calories && (
              <span className="flex items-center gap-1">
                <Flame size={12} />
                {session.calories} kcal
              </span>
            )}
          </div>
          {session.notes && (
            <p className="text-xs text-text-muted mt-2 line-clamp-2">{session.notes}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(session)} className="p-1.5 text-text-muted hover:text-primary transition-colors rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(session.id)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}
