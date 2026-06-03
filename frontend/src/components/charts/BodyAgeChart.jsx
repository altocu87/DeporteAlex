import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BodyAgeChart({ data }) {
  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos de edad corporal / IMC</p>;
  }

  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={formatted} margin={{ top: 5, right: 40, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="age"
          orientation="left"
          domain={['auto', 'auto']}
          tick={{ fill: '#A1A1AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Edad', angle: -90, position: 'insideLeft', fill: '#A1A1AA', fontSize: 10, dy: 20 }}
        />
        <YAxis
          yAxisId="bmi"
          orientation="right"
          domain={['auto', 'auto']}
          tick={{ fill: '#A1A1AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'IMC', angle: 90, position: 'insideRight', fill: '#A1A1AA', fontSize: 10, dy: -15 }}
        />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
        <Line yAxisId="age" type="monotone" dataKey="body_age" name="Edad corporal" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} activeDot={{ r: 5 }} connectNulls />
        <Line yAxisId="bmi" type="monotone" dataKey="bmi" name="IMC" stroke="#EC4899" strokeWidth={2} dot={{ fill: '#EC4899', r: 2 }} activeDot={{ r: 4 }} connectNulls strokeDasharray="5 3" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
