const muscleColors = {
  'Pecho': 'bg-orange-500/20 text-orange-300',
  'Espalda': 'bg-blue-500/20 text-blue-300',
  'Hombros': 'bg-purple-500/20 text-purple-300',
  'Bíceps': 'bg-cyan-500/20 text-cyan-300',
  'Tríceps': 'bg-green-500/20 text-green-300',
  'Piernas': 'bg-red-500/20 text-red-300',
  'Abdominales': 'bg-yellow-500/20 text-yellow-300',
};

export default function Badge({ children, variant, className = '' }) {
  const color = muscleColors[children] || muscleColors[variant] || 'bg-surface-2 text-text-muted';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color} ${className}`}>
      {children}
    </span>
  );
}
