import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ViscFatBMRChart({ data }) {
  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos de grasa visceral / TMB</p>;
  }

  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={formatted} margin={{ top: 5, right: 40, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
        <XAxis dataKey="label" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="visceral"
          orientation="left"
          domain={[0, 30]}
          tick={{ fill: '#A1A1AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'G. Visceral', angle: -90, position: 'insideLeft', fill: '#A1A1AA', fontSize: 10, dy: 45 }}
        />
        <YAxis
          yAxisId="bmr"
          orientation="right"
          tick={{ fill: '#A1A1AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'TMB kcal', angle: 90, position: 'insideRight', fill: '#A1A1AA', fontSize: 10, dy: -40 }}
        />
        <Tooltip
          contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#A1A1AA' }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
        <Bar yAxisId="visceral" dataKey="visceral_fat" name="Grasa Visceral" fill="#F59E0B" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
        <Line yAxisId="bmr" type="monotone" dataKey="bmr" name="TMB (kcal)" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 2 }} activeDot={{ r: 4 }} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
