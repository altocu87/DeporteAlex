import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dumbbell, Clock, Battery, ChevronRight } from 'lucide-react';
import Card from '../ui/Card.jsx';

function EnergyDots({ value, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < value ? 'bg-primary' : 'bg-border'}`}
        />
      ))}
    </div>
  );
}

export default function WorkoutCard({ workout }) {
  const date = parseISO(workout.date);
  return (
    <Link to={`/entrenamientos/${workout.id}`}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-muted">
                {format(date, "d 'de' MMMM yyyy", { locale: es })}
              </span>
            </div>
            <h3 className="font-semibold text-text-primary truncate">
              {workout.name || 'Entrenamiento'}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
              {workout.exercise_count > 0 && (
                <span className="flex items-center gap-1">
                  <Dumbbell size={12} />
                  {workout.exercise_count} ejercicio{workout.exercise_count !== 1 ? 's' : ''}
                </span>
              )}
              {workout.set_count > 0 && (
                <span>{workout.set_count} series</span>
              )}
              {workout.duration_min && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {workout.duration_min} min
                </span>
              )}
              {workout.energy_level && (
                <span className="flex items-center gap-1">
                  <Battery size={12} />
                  <EnergyDots value={workout.energy_level} />
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  );
}
