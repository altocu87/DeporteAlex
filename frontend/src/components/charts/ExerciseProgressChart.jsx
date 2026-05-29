import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ExerciseProgressChart({ data }) {
  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos para este ejercicio</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
        <Bar yAxisId="right" dataKey="volume" name="Volumen (kg×reps)" fill="#F97316" opacity={0.4} radius={[2, 2, 0, 0]} />
        <Line yAxisId="left" type="monotone" dataKey="max_weight" name="Peso máx (kg)" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
