import { useEffect, useState } from 'react';
import { subMonths, format } from 'date-fns';
import { api } from '../api/client.js';
import Card from '../components/ui/Card.jsx';
import WeightChart from '../components/charts/WeightChart.jsx';
import MeasurementChart from '../components/charts/MeasurementChart.jsx';
import ExerciseProgressChart from '../components/charts/ExerciseProgressChart.jsx';
import CardioChart from '../components/charts/CardioChart.jsx';
import BodyCompositionChart, { COMPOSITION_LINES } from '../components/charts/BodyCompositionChart.jsx';
import SegmentalChart from '../components/charts/SegmentalChart.jsx';
import ViscFatBMRChart from '../components/charts/ViscFatBMRChart.jsx';
import BodyAgeChart from '../components/charts/BodyAgeChart.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1A', months: 12 },
  { label: 'Todo', months: null },
];

const MEASUREMENT_LINES = [
  { key: 'waist_cm', label: 'Cintura' },
  { key: 'chest_cm', label: 'Pecho' },
  { key: 'arms_cm', label: 'Brazos' },
  { key: 'legs_cm', label: 'Piernas' },
  { key: 'hip_cm', label: 'Cadera' },
];

const CARDIO_METRICS = [
  { key: 'distance_km', label: 'Distancia (km)' },
  { key: 'duration_min', label: 'Duración (min)' },
  { key: 'calories', label: 'Calorías' },
];

function RangeSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {RANGES.map(r => (
        <button
          key={r.label}
          onClick={() => onChange(r)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            value.label === r.label
              ? 'bg-primary text-white'
              : 'bg-surface-2 text-text-muted hover:text-text-primary'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, children, controls }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {controls}
      </div>
      {children}
    </Card>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function dateParams(range) {
  if (!range.months) return '';
  const from = format(subMonths(new Date(), range.months), 'yyyy-MM-dd');
  return `?from=${from}`;
}

export default function Progress() {
  const [range, setRange] = useState(RANGES[1]);
  const [weightData, setWeightData] = useState([]);
  const [measureData, setMeasureData] = useState([]);
  const [cardioData, setCardioData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [compositionData, setCompositionData] = useState([]);
  const [segmentalData, setSegmentalData] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [activeLines, setActiveLines] = useState(['waist_cm', 'chest_cm']);
  const [activeCompLines, setActiveCompLines] = useState(['body_fat_pct', 'skeletal_muscle_pct']);
  const [cardioMetric, setCardioMetric] = useState('distance_km');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalog/exercises').then(data => {
      setCatalog(data);
      if (data.length && !selectedExercise) {
        setSelectedExercise(data[0].name);
      }
    });
  }, []);

  useEffect(() => {
    const params = dateParams(range);
    setLoading(true);
    Promise.all([
      api.get(`/progress/weight${params}`),
      api.get(`/progress/measurements${params}`),
      api.get(`/progress/cardio${params}`),
      api.get(`/progress/composition${params}`),
      api.get(`/progress/composition/segmental${params}`),
    ]).then(([w, m, c, comp, seg]) => {
      setWeightData(w);
      setMeasureData(m);
      setCardioData(c);
      setCompositionData(comp);
      setSegmentalData(seg);
    }).finally(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    if (!selectedExercise) return;
    const params = dateParams(range);
    api.get(`/progress/exercise/${encodeURIComponent(selectedExercise)}${params}`)
      .then(setExerciseData)
      .catch(() => setExerciseData([]));
  }, [selectedExercise, range]);

  function toggleLine(key) {
    setActiveLines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function toggleCompLine(key) {
    setActiveCompLines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Progreso</h1>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {loading && (
        <LoadingSpinner className="py-8" size={28} />
      )}

      {/* Weight */}
      <ChartCard title="Evolución del peso" controls={null}>
        <WeightChart data={weightData} />
      </ChartCard>

      {/* Body measurements */}
      <ChartCard
        title="Medidas corporales"
        controls={
          <div className="flex flex-wrap gap-1.5">
            {MEASUREMENT_LINES.map(l => (
              <button
                key={l.key}
                onClick={() => toggleLine(l.key)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeLines.includes(l.key)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-2 text-text-muted hover:text-text-primary'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        }
      >
        <MeasurementChart data={measureData} activeLines={activeLines} />
      </ChartCard>

      {/* Exercise progress */}
      <ChartCard
        title="Rendimiento por ejercicio"
        controls={
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {catalog.map(e => (
              <option key={e.id} value={e.name}>{e.name}</option>
            ))}
          </select>
        }
      >
        <ExerciseProgressChart data={exerciseData} />
      </ChartCard>

      {/* Cardio */}
      <ChartCard
        title="Sesiones de cardio"
        controls={
          <div className="flex gap-1">
            {CARDIO_METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setCardioMetric(m.key)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  cardioMetric === m.key
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-2 text-text-muted hover:text-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        }
      >
        <CardioChart data={cardioData} metric={cardioMetric} />
      </ChartCard>

      {/* ── Healthkeep FG2001B-A ── */}
      <SectionDivider label="Composición corporal · Healthkeep" />

      {/* Porcentajes globales */}
      <ChartCard
        title="Composición porcentual"
        controls={
          <div className="flex flex-wrap gap-1.5">
            {COMPOSITION_LINES.map(l => (
              <button
                key={l.key}
                onClick={() => toggleCompLine(l.key)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeCompLines.includes(l.key)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-2 text-text-muted hover:text-text-primary'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        }
      >
        <BodyCompositionChart data={compositionData} activeLines={activeCompLines} />
      </ChartCard>

      {/* Grasa visceral + TMB */}
      <ChartCard title="Grasa visceral y tasa metabólica basal">
        <ViscFatBMRChart data={compositionData} />
      </ChartCard>

      {/* Mapa segmental */}
      <ChartCard title="Mapa segmental (grasa y músculo)">
        <SegmentalChart data={segmentalData} />
      </ChartCard>

      {/* Edad corporal e IMC */}
      <ChartCard title="Edad corporal e IMC">
        <BodyAgeChart data={compositionData} />
      </ChartCard>
    </div>
  );
}
