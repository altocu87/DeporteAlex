import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CardioChart({ data, metric = 'distance_km' }) {
  const formatted = data
    .filter(d => d[metric])
    .map(d => ({
      ...d,
      label: format(parseISO(d.date), 'd MMM', { locale: es }),
      value: d[metric],
    }));

  const labels = {
    distance_km: { name: 'Distancia (km)', color: '#10B981' },
    duration_min: { name: 'Duración (min)', color: '#3B82F6' },
    calories: { name: 'Calorías (kcal)', color: '#F97316' },
  };
  const { name, color } = labels[metric] || labels.distance_km;

  if (!formatted.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos de cardio</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Bar dataKey="value" name={name} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
