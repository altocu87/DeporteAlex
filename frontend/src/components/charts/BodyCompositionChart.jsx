import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const COMPOSITION_LINES = [
  { key: 'body_fat_pct',        label: 'Grasa corporal',    color: '#EF4444' },
  { key: 'skeletal_muscle_pct', label: 'Músculo esq.',      color: '#3B82F6' },
  { key: 'body_water_pct',      label: 'Agua corporal',     color: '#06B6D4' },
  { key: 'protein_pct',         label: 'Proteína',          color: '#10B981' },
  { key: 'subcutaneous_fat',    label: 'Grasa subcutánea',  color: '#F97316' },
];

export default function BodyCompositionChart({ data, activeLines = ['body_fat_pct', 'skeletal_muscle_pct'] }) {
  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos de composición</p>;
  }

  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#A1A1AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          unit="%"
        />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
          formatter={(v, name) => [`${v}%`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
        {COMPOSITION_LINES.filter(l => activeLines.includes(l.key)).map(l => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={{ fill: l.color, r: 2 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
