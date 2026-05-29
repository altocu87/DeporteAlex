import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell } from 'lucide-react';
import { api } from '../api/client.js';
import WorkoutCard from '../components/workout/WorkoutCard.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 15;

  async function load(p = 0) {
    setLoading(true);
    try {
      const data = await api.get(`/workouts?limit=${LIMIT}&offset=${p * LIMIT}`);
      if (p === 0) {
        setWorkouts(data);
      } else {
        setWorkouts(prev => [...prev, ...data]);
      }
      setHasMore(data.length === LIMIT);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(0); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Entrenamientos</h1>
        <Link to="/entrenamientos/nuevo">
          <Button><Plus size={16} />Nuevo</Button>
        </Link>
      </div>

      {loading && workouts.length === 0 ? (
        <LoadingSpinner className="py-20" size={32} />
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Sin entrenamientos aún</p>
          <p className="text-sm mb-4">Registra tu primera sesión</p>
          <Link to="/entrenamientos/nuevo">
            <Button><Plus size={16} />Nuevo entrenamiento</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {workouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => load(page + 1)} disabled={loading}>
                {loading ? <LoadingSpinner size={14} /> : 'Cargar más'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
