import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const LINES = [
  { key: 'waist_cm', label: 'Cintura', color: '#F97316' },
  { key: 'chest_cm', label: 'Pecho', color: '#3B82F6' },
  { key: 'arms_cm', label: 'Brazos', color: '#8B5CF6' },
  { key: 'legs_cm', label: 'Piernas', color: '#EC4899' },
  { key: 'hip_cm', label: 'Cadera', color: '#10B981' },
];

export default function MeasurementChart({ data, activeLines = ['waist_cm', 'chest_cm'] }) {
  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos de medidas</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
        {LINES.filter(l => activeLines.includes(l.key)).map(l => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={{ fill: l.color, r: 2 }}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
