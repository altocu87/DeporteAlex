import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dumbbell, Wind, Scale, Calendar, Plus, TrendingUp, ChevronRight } from 'lucide-react';
import { api } from '../api/client.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

function StatCard({ icon: Icon, label, value, sub, to, color = 'text-primary' }) {
  const content = (
    <Card className={`${to ? 'hover:border-primary/40 transition-colors cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`${color} mb-2`}><Icon size={20} /></div>
          <p className="text-xs text-text-muted mb-1">{label}</p>
          <p className="text-xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
        {to && <ChevronRight size={16} className="text-text-muted" />}
      </div>
    </Card>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size={32} />;

  const { lastWorkout, lastCardio, latestMeasurement, weekStats } = data || {};

  const fmtDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "d MMM", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary mb-1">Inicio</h1>
        <p className="text-text-muted text-sm">
          {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Dumbbell}
          label="Último entrenamiento"
          value={lastWorkout ? fmtDate(lastWorkout.date) : '—'}
          sub={lastWorkout ? `${lastWorkout.exercise_count || 0} ejercicios` : 'Sin registros'}
          to={lastWorkout ? `/entrenamientos/${lastWorkout.id}` : undefined}
        />
        <StatCard
          icon={Wind}
          label="Último cardio"
          value={lastCardio ? fmtDate(lastCardio.date) : '—'}
          sub={lastCardio ? `${lastCardio.type} · ${lastCardio.duration_min} min` : 'Sin registros'}
          color="text-green-400"
        />
        <StatCard
          icon={Scale}
          label="Peso actual"
          value={latestMeasurement?.weight_kg ? `${latestMeasurement.weight_kg} kg` : '—'}
          sub={latestMeasurement ? fmtDate(latestMeasurement.date) : 'Sin registros'}
          to="/medidas"
          color="text-blue-400"
        />
        <StatCard
          icon={Calendar}
          label="Esta semana"
          value={weekStats?.total ?? 0}
          sub={`${weekStats?.workouts ?? 0} entrenos · ${weekStats?.cardio ?? 0} cardio`}
          to="/progreso"
          color="text-purple-400"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">Acción rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={() => navigate('/entrenamientos/nuevo')} className="w-full justify-center">
            <Dumbbell size={16} />
            Nuevo entrenamiento
          </Button>
          <Button onClick={() => navigate('/cardio')} variant="secondary" className="w-full justify-center">
            <Wind size={16} />
            Registrar cardio
          </Button>
          <Button onClick={() => navigate('/medidas')} variant="secondary" className="w-full justify-center">
            <Scale size={16} />
            Anotar medidas
          </Button>
        </div>
      </div>

      {/* Progress link */}
      <Link to="/progreso">
        <Card className="flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-primary" />
            <div>
              <p className="font-medium text-text-primary">Ver progreso</p>
              <p className="text-xs text-text-muted">Gráficas de evolución</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </Card>
      </Link>
    </div>
  );
}
