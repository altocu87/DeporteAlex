import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const SEGMENTS = [
  { fatKey: 'seg_fat_left_arm',  muscKey: 'seg_muscle_left_arm',  label: 'Brazo Izq.' },
  { fatKey: 'seg_fat_right_arm', muscKey: 'seg_muscle_right_arm', label: 'Brazo Der.' },
  { fatKey: 'seg_fat_trunk',     muscKey: 'seg_muscle_trunk',     label: 'Tronco' },
  { fatKey: 'seg_fat_right_leg', muscKey: 'seg_muscle_right_leg', label: 'Pierna Der.' },
  { fatKey: 'seg_fat_left_leg',  muscKey: 'seg_muscle_left_leg',  label: 'Pierna Izq.' },
];

export default function SegmentalChart({ data }) {
  if (!data.length) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos segmentarios</p>;
  }

  const latest = data[0];
  const hasData = SEGMENTS.some(s => latest[s.fatKey] != null || latest[s.muscKey] != null);
  if (!hasData) {
    return <p className="text-center text-text-muted text-sm py-8">Sin datos segmentarios en el último registro</p>;
  }

  const radarData = SEGMENTS.map(s => ({
    segment: s.label,
    'Grasa %': latest[s.fatKey] ?? 0,
    'Músculo %': latest[s.muscKey] ?? 0,
  }));

  const dateLabel = format(parseISO(latest.date), "d 'de' MMMM yyyy", { locale: es });

  return (
    <div>
      <p className="text-xs text-text-muted text-center mb-1">Última lectura: {dateLabel}</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke="#3A3A3C" />
          <PolarAngleAxis dataKey="segment" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: '#71717A', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1C1C1E', border: '1px solid #3A3A3C', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#A1A1AA' }}
            itemStyle={{ color: '#F5F5F5' }}
            formatter={(v, name) => [`${v}%`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
          <Radar name="Grasa %" dataKey="Grasa %" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} strokeWidth={2} />
          <Radar name="Músculo %" dataKey="Músculo %" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
